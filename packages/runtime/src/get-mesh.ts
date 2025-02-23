/* eslint-disable no-unused-expressions */
import {
  GraphQLSchema,
  DocumentNode,
  GraphQLError,
  subscribe,
  ExecutionArgs,
  GraphQLResolveInfo,
  OperationTypeNode,
  GraphQLObjectType,
  getOperationAST,
  print,
  isListType,
  SelectionSetNode,
  ExecutionResult,
} from 'graphql';
import { ExecuteMeshFn, GetMeshOptions, Requester, SubscribeMeshFn } from './types';
import { MeshPubSub, KeyValueCache, RawSourceOutput, GraphQLOperation } from '@graphql-mesh/types';

import { applyResolversHooksToSchema } from './resolvers-hooks';
import { MESH_CONTEXT_SYMBOL, MESH_API_CONTEXT_SYMBOL } from './constants';
import {
  applySchemaTransforms,
  ensureDocumentNode,
  getInterpolatedStringFactory,
  groupTransforms,
  ResolverDataBasedFactory,
  jitExecutorFactory,
  AggregateError,
} from '@graphql-mesh/utils';

import { InMemoryLiveQueryStore } from '@n1ru4l/in-memory-live-query-store';
import { delegateToSchema, IDelegateToSchemaOptions } from '@graphql-tools/delegate';
import { DefaultLogger } from './logger';
import { BatchDelegateOptions, batchDelegateToSchema } from '@graphql-tools/batch-delegate';
import { WrapQuery } from '@graphql-tools/wrap';
import { inspect } from 'util';

export interface MeshInstance {
  execute: ExecuteMeshFn;
  subscribe: SubscribeMeshFn;
  schema: GraphQLSchema;
  rawSources: RawSourceOutput[];
  sdkRequester: Requester;
  contextBuilder: (initialContextValue?: any) => Promise<Record<string, any>>;
  destroy: () => void;
  pubsub: MeshPubSub;
  cache: KeyValueCache;
  liveQueryStore: InMemoryLiveQueryStore;
}

export async function getMesh(options: GetMeshOptions): Promise<MeshInstance> {
  const rawSources: RawSourceOutput[] = [];
  const { pubsub, cache, logger = new DefaultLogger('Mesh') } = options;

  const getMeshLogger = logger.child('getMesh/runtime');
  getMeshLogger.debug(`Getting subschemas from source handlers`);
  /** replaced Promise.all to Promise.allSettled */
   await Promise.allSettled(
    options.sources.map(async apiSource => {
      const apiName = apiSource.name;
      const sourceLogger = logger.child(apiName);
      sourceLogger.debug(`Generating the schema`);
      const source = await apiSource.handler.getMeshSource();
      sourceLogger.debug(`The schema has been generated successfully`);

      let apiSchema = source.schema;

      sourceLogger.debug(`Analyzing transforms`);
      const { wrapTransforms, noWrapTransforms } = groupTransforms(apiSource.transforms);

      if (noWrapTransforms?.length) {
        sourceLogger.debug(`${noWrapTransforms.length} bare transforms found and applying`);
        apiSchema = applySchemaTransforms(apiSchema, source, null, noWrapTransforms);
      }

      rawSources.push({
        name: apiName,
        contextBuilder: source.contextBuilder || null,
        schema: apiSchema,
        executor: source.executor,
        transforms: wrapTransforms,
        contextVariables: source.contextVariables || [],
        handler: apiSource.handler,
        batch: 'batch' in source ? source.batch : true,
        merge: apiSource.merge,
      });
    })
  ).then(results=>{
   /** Logger added for rejected Graphql or any Source rejected */
    results.forEach(result=>{

      if(result.status === "rejected") {
        getMeshLogger.warn(result.reason);

      }
    })
  });


  getMeshLogger.debug(`Schemas have been generated by the source handlers`);

  getMeshLogger.debug(`Merging schemas using the defined merging strategy.`);
  let unifiedSchema = await options.merger.getUnifiedSchema({
    rawSources,
    typeDefs: options.additionalTypeDefs,
    resolvers: options.additionalResolvers,
    transforms: options.transforms,
  });

  getMeshLogger.debug(`Attaching resolver hooks to the unified schema`);
  unifiedSchema = applyResolversHooksToSchema(unifiedSchema, pubsub);

  getMeshLogger.debug(`Creating JIT Executor`);
  const jitExecutor = jitExecutorFactory(unifiedSchema, 'unified', logger.child('JIT Executor'));

  getMeshLogger.debug(`Creating Live Query Store`);
  const liveQueryStore = new InMemoryLiveQueryStore({
    includeIdentifierExtension: true,
    execute: (args: any) => {
      const { document, contextValue, variableValues, rootValue, operationName }: ExecutionArgs = args;
      return jitExecutor({
        document,
        context: contextValue,
        variables: variableValues,
        operationName,
        rootValue,
      }) as ExecutionResult;
    },
  });

  const liveQueryInvalidationFactoryMap = new Map<string, ResolverDataBasedFactory<string>[]>();

  options.liveQueryInvalidations?.forEach(liveQueryInvalidation => {
    const rawInvalidationPaths = liveQueryInvalidation.invalidate;
    const factories = rawInvalidationPaths.map(rawInvalidationPath =>
      getInterpolatedStringFactory(rawInvalidationPath)
    );
    liveQueryInvalidationFactoryMap.set(liveQueryInvalidation.field, factories);
  });

  getMeshLogger.debug(`Creating event listener (resolverDone) for Live Query Store`);
  pubsub.subscribe('resolverDone', ({ result, resolverData }) => {
    if (resolverData?.info?.parentType && resolverData?.info?.fieldName) {
      const path = `${resolverData.info.parentType.name}.${resolverData.info.fieldName}`;
      if (liveQueryInvalidationFactoryMap.has(path)) {
        const invalidationPathFactories = liveQueryInvalidationFactoryMap.get(path);
        const invalidationPaths = invalidationPathFactories.map(invalidationPathFactory =>
          invalidationPathFactory({ ...resolverData, result })
        );
        liveQueryStore.invalidate(invalidationPaths);
      }
    }
  });

  getMeshLogger.debug(`Building Base Mesh Context`);
  const baseMeshContext: Record<string, any> = {
    pubsub,
    cache,
    liveQueryStore,
    [MESH_CONTEXT_SYMBOL]: true,
  };
  getMeshLogger.debug(`Attaching in-context SDK, pubsub, cache and liveQueryStore to the context`);
  const sourceMap: Map<RawSourceOutput, GraphQLSchema> = unifiedSchema.extensions.sourceMap;
  await Promise.all(
    rawSources.map(async rawSource => {
      const rawSourceLogger = logger.child(`${rawSource.name}`);

      const rawSourceContext: any = {
        rawSource,
        [MESH_API_CONTEXT_SYMBOL]: true,
      };
      const transformedSchema = sourceMap.get(rawSource);
      const rootTypes: Record<OperationTypeNode, GraphQLObjectType> = {
        query: transformedSchema.getQueryType(),
        mutation: transformedSchema.getMutationType(),
        subscription: transformedSchema.getSubscriptionType(),
      };

      rawSourceLogger.debug(`Generating In Context SDK`);
      for (const operationType in rootTypes) {
        const rootType: GraphQLObjectType = rootTypes[operationType];
        if (rootType) {
          rawSourceContext[rootType.name] = {};
          const rootTypeFieldMap = rootType.getFields();
          for (const fieldName in rootTypeFieldMap) {
            const rootTypeField = rootTypeFieldMap[fieldName];
            const inContextSdkLogger = rawSourceLogger.child(`InContextSDK.${rootType.name}.${fieldName}`);
            rawSourceContext[rootType.name][fieldName] = ({
              root,
              args,
              context,
              info,
              selectionSet,
              key,
              argsFromKeys,
            }: {
              root: any;
              args: any;
              context: any;
              info: GraphQLResolveInfo;
              selectionSet: (subtree: SelectionSetNode) => SelectionSetNode;
              key?: string;
              argsFromKeys?: (keys: string[]) => any;
            }) => {
              inContextSdkLogger.debug(`Called with
- root: ${inspect(root)}
- args: ${inspect(args)}
- key: ${inspect(key)}`);
              const commonDelegateOptions: IDelegateToSchemaOptions = {
                schema: rawSource,
                rootValue: root,
                operation: operationType as OperationTypeNode,
                fieldName,
                returnType: rootTypeField.type,
                context,
                transformedSchema,
                info,
              };
              if (isListType(rootTypeField.type) && key && argsFromKeys) {
                const batchDelegationOptions: BatchDelegateOptions = {
                  ...commonDelegateOptions,
                  key,
                  argsFromKeys,
                };
                return batchDelegateToSchema(batchDelegationOptions);
              } else if (selectionSet) {
                return delegateToSchema({
                  ...commonDelegateOptions,
                  args,
                  transforms: [new WrapQuery([fieldName], selectionSet, res => res)],
                });
              } else {
                return delegateToSchema({
                  ...commonDelegateOptions,
                  args,
                });
              }
            };
          }
        }
      }
      baseMeshContext[rawSource.name] = rawSourceContext;
    })
  );

  async function buildMeshContext<TAdditionalContext, TContext extends TAdditionalContext = any>(
    additionalContext: TAdditionalContext = {} as any
  ): Promise<TContext> {
    if (MESH_CONTEXT_SYMBOL in additionalContext) {
      return additionalContext as TContext;
    }
    const context: TContext = Object.assign(additionalContext as any, baseMeshContext);

    await Promise.all(
      rawSources.map(async rawSource => {
        const rawSourceLogger = logger.child(`${rawSource.name}`);
        const contextBuilder = rawSource.contextBuilder;
        if (contextBuilder) {
          rawSourceLogger.debug(`Building context`);
          const sourceContext = await contextBuilder(context);
          if (sourceContext) {
            Object.assign(context, sourceContext);
          }
          rawSourceLogger.debug(`Context has been built successfully`);
        }
      })
    );

    return context;
  }

  const executionLogger = logger.child(`meshExecute`);
  async function meshExecute<TVariables = any, TContext = any, TRootValue = any, TData = any>(
    document: GraphQLOperation<TData, TVariables>,
    variableValues?: TVariables,
    context?: TContext,
    rootValue?: TRootValue,
    operationName?: string
  ) {
    const printedDocument = typeof document === 'string' ? document : print(document);
    const documentNode = ensureDocumentNode(document);
    if (!operationName) {
      const operationAst = getOperationAST(documentNode);
      operationName = operationAst.name?.value;
    }
    const operationLogger = executionLogger.child(operationName || 'UnnamedOperation');
    const contextValue = await buildMeshContext(context);

    const executionParams = {
      document: documentNode,
      contextValue,
      rootValue,
      variableValues,
      schema: unifiedSchema,
      operationName,
    } as const;

    operationLogger.debug(
      `Execution started with
${inspect(
  {
    ...(operationName ? {} : { query: printedDocument }),
    ...(rootValue ? { rootValue } : {}),
    ...(variableValues ? { variableValues } : {}),
  },
  true,
  2,
  true
)}`
    );

    const executionResult = await liveQueryStore.execute(executionParams);

    pubsub.publish('executionDone', {
      ...executionParams,
      executionResult: executionResult as any,
    });

    operationLogger.debug(
      `Execution done with
${inspect(
  {
    ...(operationName ? {} : { query: printedDocument }),
    ...executionResult,
  },
  true,
  2,
  true
)}`
    );

    return executionResult;
  }

  const subscriberLogger = logger.child(`meshSubscribe`);
  async function meshSubscribe<TVariables = any, TContext = any, TRootValue = any, TData = any>(
    document: GraphQLOperation<TData, TVariables>,
    variableValues?: TVariables,
    context?: TContext,
    rootValue?: TRootValue,
    operationName?: string
  ) {
    const printedDocument = typeof document === 'string' ? document : print(document);
    const documentNode = ensureDocumentNode(document);
    if (!operationName) {
      const operationAst = getOperationAST(documentNode);
      operationName = operationAst.name?.value;
    }
    const operationLogger = subscriberLogger.child(operationName || 'UnnamedOperation');
    const contextValue = await buildMeshContext(context);

    const executionParams = {
      document: documentNode,
      contextValue,
      rootValue,
      variableValues,
      schema: unifiedSchema,
      operationName,
    } as const;

    operationLogger.debug(
      `Subscription started with
${inspect(
  {
    ...(rootValue ? {} : { rootValue }),
    ...(variableValues ? {} : { variableValues }),
    ...(operationName ? {} : { query: printedDocument }),
  },
  true,
  2,
  true
)}`
    );
    const executionResult = await subscribe(executionParams);

    pubsub.publish('executionDone', {
      ...executionParams,
      executionResult: executionResult as any,
    });

    return executionResult;
  }

  class GraphQLMeshSdkError<Data = any, Variables = any> extends AggregateError {
    constructor(
      errors: ReadonlyArray<GraphQLError>,
      public document: DocumentNode,
      public variables: Variables,
      public data: Data
    ) {
      super(errors);
    }
  }

  const localRequester: Requester = async <Result, TVariables, TContext, TRootValue>(
    document: DocumentNode,
    variables: TVariables,
    contextValue?: TContext,
    rootValue?: TRootValue,
    operationName?: string
  ) => {
    const executionResult = await meshExecute<TVariables, TContext, TRootValue>(
      document,
      variables,
      contextValue,
      rootValue,
      operationName
    );

    if ('data' in executionResult || 'errors' in executionResult) {
      if (executionResult.data && !executionResult.errors) {
        return executionResult.data as Result;
      } else {
        throw new GraphQLMeshSdkError(
          executionResult.errors as ReadonlyArray<GraphQLError>,
          document,
          variables,
          executionResult.data
        );
      }
    } else {
      throw new Error('Not implemented');
    }
  };

  return {
    execute: meshExecute,
    subscribe: meshSubscribe,
    schema: unifiedSchema,
    contextBuilder: buildMeshContext,
    rawSources,
    sdkRequester: localRequester,
    cache,
    pubsub,
    destroy: () => pubsub.publish('destroy', undefined),
    liveQueryStore,
  };
}
