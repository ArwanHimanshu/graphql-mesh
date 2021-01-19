(window.webpackJsonp=window.webpackJsonp||[]).push([[97],{168:function(e,t,a){"use strict";a.r(t),a.d(t,"frontMatter",(function(){return i})),a.d(t,"metadata",(function(){return o})),a.d(t,"toc",(function(){return s})),a.d(t,"default",(function(){return p}));var r=a(3),n=a(7),c=(a(0),a(293)),i={},o={unversionedId:"api/interfaces/types_src.yamlconfig.cachetransformconfig",id:"api/interfaces/types_src.yamlconfig.cachetransformconfig",isDocsHomePage:!1,title:"types_src.yamlconfig.cachetransformconfig",description:"Interface: CacheTransformConfig",source:"@site/docs/api/interfaces/types_src.yamlconfig.cachetransformconfig.md",slug:"/api/interfaces/types_src.yamlconfig.cachetransformconfig",permalink:"/docs/api/interfaces/types_src.yamlconfig.cachetransformconfig",editUrl:"https://github.com/urigo/graphql-mesh/edit/master/website/docs/api/interfaces/types_src.yamlconfig.cachetransformconfig.md",version:"current",sidebar:"sidebar",previous:{title:"types_src.yamlconfig.cacheinvalidateconfig",permalink:"/docs/api/interfaces/types_src.yamlconfig.cacheinvalidateconfig"},next:{title:"types_src.yamlconfig.composemongooseinputtype",permalink:"/docs/api/interfaces/types_src.yamlconfig.composemongooseinputtype"}},s=[{value:"Hierarchy",id:"hierarchy",children:[]},{value:"Table of contents",id:"table-of-contents",children:[{value:"Properties",id:"properties",children:[]}]},{value:"Properties",id:"properties-1",children:[{value:"cacheKey",id:"cachekey",children:[]},{value:"field",id:"field",children:[]},{value:"invalidate",id:"invalidate",children:[]}]}],l={toc:s};function p(e){var t=e.components,a=Object(n.a)(e,["components"]);return Object(c.b)("wrapper",Object(r.a)({},l,a,{components:t,mdxType:"MDXLayout"}),Object(c.b)("h1",{id:"interface-cachetransformconfig"},"Interface: CacheTransformConfig"),Object(c.b)("p",null,Object(c.b)("a",Object(r.a)({parentName:"p"},{href:"../modules/types_src"}),"types/src"),".",Object(c.b)("a",Object(r.a)({parentName:"p"},{href:"../modules/types_src.yamlconfig"}),"YamlConfig"),".CacheTransformConfig"),Object(c.b)("h2",{id:"hierarchy"},"Hierarchy"),Object(c.b)("ul",null,Object(c.b)("li",{parentName:"ul"},Object(c.b)("strong",{parentName:"li"},"CacheTransformConfig"))),Object(c.b)("h2",{id:"table-of-contents"},"Table of contents"),Object(c.b)("h3",{id:"properties"},"Properties"),Object(c.b)("ul",null,Object(c.b)("li",{parentName:"ul"},Object(c.b)("a",Object(r.a)({parentName:"li"},{href:"/docs/api/interfaces/types_src.yamlconfig.cachetransformconfig#cachekey"}),"cacheKey")),Object(c.b)("li",{parentName:"ul"},Object(c.b)("a",Object(r.a)({parentName:"li"},{href:"/docs/api/interfaces/types_src.yamlconfig.cachetransformconfig#field"}),"field")),Object(c.b)("li",{parentName:"ul"},Object(c.b)("a",Object(r.a)({parentName:"li"},{href:"/docs/api/interfaces/types_src.yamlconfig.cachetransformconfig#invalidate"}),"invalidate"))),Object(c.b)("h2",{id:"properties-1"},"Properties"),Object(c.b)("h3",{id:"cachekey"},"cacheKey"),Object(c.b)("p",null,"\u2022 ",Object(c.b)("inlineCode",{parentName:"p"},"Optional")," ",Object(c.b)("strong",{parentName:"p"},"cacheKey"),": ",Object(c.b)("em",{parentName:"p"},"string")),Object(c.b)("p",null,"Cache key to use to store your resolvers responses.\nThe defualt is: {typeName}-{fieldName}-{argsHash}-{fieldNamesHash}"),Object(c.b)("p",null,"Available variables:"),Object(c.b)("ul",null,Object(c.b)("li",{parentName:"ul"},"{args.argName} - use resolver argument"),Object(c.b)("li",{parentName:"ul"},"{typeName} - use name of the type"),Object(c.b)("li",{parentName:"ul"},"{fieldName} - use name of the field"),Object(c.b)("li",{parentName:"ul"},"{argsHash} - a hash based on the 'args' object"),Object(c.b)("li",{parentName:"ul"},"{fieldNamesHash} - a hash based on the field names selected by the client"),Object(c.b)("li",{parentName:"ul"},"{info} - the GraphQLResolveInfo of the resolver")),Object(c.b)("p",null,"Available interpolations:"),Object(c.b)("ul",null,Object(c.b)("li",{parentName:"ul"},"{format|date} - returns the current date with a specific format")),Object(c.b)("p",null,"Defined in: ",Object(c.b)("a",Object(r.a)({parentName:"p"},{href:"https://github.com/Urigo/graphql-mesh/blob/master/packages/types/src/config.ts#L834"}),"packages/types/src/config.ts:834")),Object(c.b)("hr",null),Object(c.b)("h3",{id:"field"},"field"),Object(c.b)("p",null,"\u2022 ",Object(c.b)("strong",{parentName:"p"},"field"),": ",Object(c.b)("em",{parentName:"p"},"string")),Object(c.b)("p",null,"The type and field to apply cache to, you can use wild cards as well, for example: ",Object(c.b)("inlineCode",{parentName:"p"},"Query.*")),Object(c.b)("p",null,"Defined in: ",Object(c.b)("a",Object(r.a)({parentName:"p"},{href:"https://github.com/Urigo/graphql-mesh/blob/master/packages/types/src/config.ts#L818"}),"packages/types/src/config.ts:818")),Object(c.b)("hr",null),Object(c.b)("h3",{id:"invalidate"},"invalidate"),Object(c.b)("p",null,"\u2022 ",Object(c.b)("inlineCode",{parentName:"p"},"Optional")," ",Object(c.b)("strong",{parentName:"p"},"invalidate"),": ",Object(c.b)("a",Object(r.a)({parentName:"p"},{href:"types_src.yamlconfig.cacheinvalidateconfig"}),Object(c.b)("em",{parentName:"a"},"CacheInvalidateConfig"))),Object(c.b)("p",null,"Defined in: ",Object(c.b)("a",Object(r.a)({parentName:"p"},{href:"https://github.com/Urigo/graphql-mesh/blob/master/packages/types/src/config.ts#L835"}),"packages/types/src/config.ts:835")))}p.isMDXComponent=!0},293:function(e,t,a){"use strict";a.d(t,"a",(function(){return b})),a.d(t,"b",(function(){return u}));var r=a(0),n=a.n(r);function c(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function i(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,r)}return a}function o(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?i(Object(a),!0).forEach((function(t){c(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function s(e,t){if(null==e)return{};var a,r,n=function(e,t){if(null==e)return{};var a,r,n={},c=Object.keys(e);for(r=0;r<c.length;r++)a=c[r],t.indexOf(a)>=0||(n[a]=e[a]);return n}(e,t);if(Object.getOwnPropertySymbols){var c=Object.getOwnPropertySymbols(e);for(r=0;r<c.length;r++)a=c[r],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(n[a]=e[a])}return n}var l=n.a.createContext({}),p=function(e){var t=n.a.useContext(l),a=t;return e&&(a="function"==typeof e?e(t):o(o({},t),e)),a},b=function(e){var t=p(e.components);return n.a.createElement(l.Provider,{value:t},e.children)},f={inlineCode:"code",wrapper:function(e){var t=e.children;return n.a.createElement(n.a.Fragment,{},t)}},m=n.a.forwardRef((function(e,t){var a=e.components,r=e.mdxType,c=e.originalType,i=e.parentName,l=s(e,["components","mdxType","originalType","parentName"]),b=p(a),m=r,u=b["".concat(i,".").concat(m)]||b[m]||f[m]||c;return a?n.a.createElement(u,o(o({ref:t},l),{},{components:a})):n.a.createElement(u,o({ref:t},l))}));function u(e,t){var a=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var c=a.length,i=new Array(c);i[0]=m;var o={};for(var s in t)hasOwnProperty.call(t,s)&&(o[s]=t[s]);o.originalType=e,o.mdxType="string"==typeof e?e:r,i[1]=o;for(var l=2;l<c;l++)i[l]=a[l];return n.a.createElement.apply(null,i)}return n.a.createElement.apply(null,a)}m.displayName="MDXCreateElement"}}]);