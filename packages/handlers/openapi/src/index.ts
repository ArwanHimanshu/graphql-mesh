import {
  readFileOrUrlWithCache,
  parseInterpolationStrings,
  getInterpolatedHeadersFactory,
  getInterpolatedStringFactory,
  getHeadersObject,
  ResolverDataBasedFactory,
  loadFromModuleExportExpression,
  getCachedFetch,
  jsonFlatStringify,
  asArray,
} from '@graphql-mesh/utils';
import { createGraphQLSchema, GraphQLOperationType } from './openapi-to-graphql';
import { Oas3 } from './openapi-to-graphql/types/oas3';
import {
  MeshHandler,
  YamlConfig,
  ResolverData,
  GetMeshSourceOptions,
  MeshSource,
  KeyValueCache,
  MeshPubSub,
} from '@graphql-mesh/types';
import { OasTitlePathMethodObject } from './openapi-to-graphql/types/options';
import { GraphQLID, GraphQLInputType } from 'graphql';
import { PredefinedProxyOptions, StoreProxy } from '@graphql-mesh/store';
import openapiDiff from 'openapi-diff';
import { getValidOAS3 } from './openapi-to-graphql/oas_3_tools';
import { Oas2 } from './openapi-to-graphql/types/oas2';

export default class OpenAPIHandler implements MeshHandler {
  private config: YamlConfig.OpenapiHandler;
  private baseDir: string;
  private cache: KeyValueCache;
  private pubsub: MeshPubSub;
  private oasSchema: StoreProxy<Oas3[]>;

  constructor({ name, config, baseDir, cache, pubsub, store }: GetMeshSourceOptions<YamlConfig.OpenapiHandler>) {
    this.config = config;
    this.baseDir = baseDir;
    this.cache = cache;
    this.pubsub = pubsub;
    // TODO: This validation here should be more flexible, probably specific to OAS
    // Because we can handle json/swagger files, and also we might want to use this:
    // https://github.com/Azure/openapi-diff
    this.oasSchema = store.proxy<Oas3[]>('schema.json', {
      ...PredefinedProxyOptions.JsonWithoutValidation,
      validate: async (oldOas, newOas) => {
        const result = await openapiDiff.diffSpecs({
          sourceSpec: {
            content: jsonFlatStringify(oldOas),
            location: 'old-schema.json',
            format: 'openapi3',
          },
          destinationSpec: {
            content: jsonFlatStringify(newOas),
            location: 'new-schema.json',
            format: 'openapi3',
          },
        });
        if (result.breakingDifferencesFound) {
          throw new Error('Breaking changes found!');
        }
      },
    });
  }

  private getCachedSpec(fetch: WindowOrWorkerGlobalScope['fetch']): Promise<Oas3[]> {
    const { source } = this.config;
    return this.oasSchema.getWithSet(async () => {
      let rawSpec: Oas3 | Oas2 | (Oas3 | Oas2)[];
      if (typeof source !== 'string') {
        rawSpec = source;
      } else {
        rawSpec = await readFileOrUrlWithCache(source, this.cache, {
          cwd: this.baseDir,
          fallbackFormat: this.config.sourceFormat,
          headers: this.config.schemaHeaders,
          fetch,
        });
      }
      return Promise.all(asArray(rawSpec).map(singleSpec => getValidOAS3(singleSpec)));
    });
  }

  async getMeshSource(): Promise<MeshSource> {
    const {
      addLimitArgument,
      baseUrl,
      customFetch,
      genericPayloadArgName,
      operationHeaders,
      qs,
      selectQueryOrMutationField,
    } = this.config;

    let fetch: WindowOrWorkerGlobalScope['fetch'];
    if (customFetch) {
      fetch = await loadFromModuleExportExpression(customFetch, { defaultExportName: 'default', cwd: this.baseDir });
    } else {
      fetch = getCachedFetch(this.cache);
    }

    const spec = await this.getCachedSpec(fetch);

    const baseUrlFactory = getInterpolatedStringFactory(baseUrl);

    const headersFactory = getInterpolatedHeadersFactory(operationHeaders);
    const queryStringFactoryMap = new Map<string, ResolverDataBasedFactory<string>>();
    for (const queryName in qs || {}) {
      queryStringFactoryMap.set(queryName, getInterpolatedStringFactory(qs[queryName]));
    }
    const searchParamsFactory = (resolverData: ResolverData, searchParams: URLSearchParams) => {
      for (const queryName in qs || {}) {
        searchParams.set(queryName, queryStringFactoryMap.get(queryName)(resolverData));
      }
      return searchParams;
    };

    const { schema } = await createGraphQLSchema(spec, {
      fetch,
      baseUrl: baseUrl,
      operationIdFieldNames: true,
      fillEmptyResponses: true,
      includeHttpDetails: this.config.includeHttpDetails,
      genericPayloadArgName: genericPayloadArgName === undefined ? false : genericPayloadArgName,
      selectQueryOrMutationField:
        selectQueryOrMutationField === undefined
          ? {}
          : selectQueryOrMutationField.reduce((acc, curr) => {
              let operationType: GraphQLOperationType;
              switch (curr.type) {
                case 'Query':
                  operationType = GraphQLOperationType.Query;
                  break;
                case 'Mutation':
                  operationType = GraphQLOperationType.Mutation;
                  break;
              }
              return {
                ...acc,
                [curr.title]: {
                  ...acc[curr.title],
                  [curr.path]: {
                    ...((acc[curr.title] && acc[curr.title][curr.path]) || {}),
                    [curr.method]: operationType,
                  },
                },
              };
            }, {} as OasTitlePathMethodObject<GraphQLOperationType>),
      addLimitArgument: addLimitArgument === undefined ? true : addLimitArgument,
      sendOAuthTokenInQuery: true,
      viewer: false,
      equivalentToMessages: true,
      pubsub: this.pubsub,
      resolverMiddleware: (getResolverParams, originalFactory) => (root, args, context, info: any) => {
        const resolverData: ResolverData = { root, args, context, info };
        const resolverParams = getResolverParams();
        resolverParams.requestOptions = {
          headers: getHeadersObject(headersFactory(resolverData)),
        };
        resolverParams.qs = qs;

        /* FIXME: baseUrl is coming from Fastify Request
        if (context?.baseUrl) {
          resolverParams.baseUrl = context.baseUrl;
        }
        */

        if (!resolverParams.baseUrl && baseUrl) {
          resolverParams.baseUrl = baseUrlFactory(resolverData);
        }

        if (resolverParams.baseUrl) {
          const urlObj = new URL(resolverParams.baseUrl);
          searchParamsFactory(resolverData, urlObj.searchParams);
        } /* else {
          console.warn(
            `There is no 'baseUrl' defined for this OpenAPI definition. We recommend you to define one manually!`
          );
        } */

        if (context?.fetch) {
          resolverParams.fetch = context.fetch;
        }

        if (context?.qs) {
          resolverParams.qs = context.qs;
        }

        return originalFactory(() => resolverParams)(root, args, context, info);
      },
    });

    const { args, contextVariables } = parseInterpolationStrings(Object.values(operationHeaders || {}));

    const rootFields = [
      ...Object.values(schema.getQueryType()?.getFields() || {}),
      ...Object.values(schema.getMutationType()?.getFields() || {}),
      ...Object.values(schema.getSubscriptionType()?.getFields() || {}),
    ];

    await Promise.all(
      rootFields.map(rootField =>
        Promise.all(
          Object.entries(args).map(async ([argName, { type }]) =>
            rootField?.args.push({
              name: argName,
              description: undefined,
              defaultValue: undefined,
              extensions: undefined,
              astNode: undefined,
              deprecationReason: undefined,
              type: (schema.getType(type) as GraphQLInputType) || GraphQLID,
            })
          )
        )
      )
    );

    contextVariables.push('fetch' /*, 'baseUrl' */);

    return {
      schema,
      contextVariables,
    };
  }
}
