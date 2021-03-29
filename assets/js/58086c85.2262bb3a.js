(window.webpackJsonp=window.webpackJsonp||[]).push([[90],{163:function(e,n,t){"use strict";t.r(n),t.d(n,"frontMatter",(function(){return i})),t.d(n,"metadata",(function(){return l})),t.d(n,"toc",(function(){return c})),t.d(n,"default",(function(){return s}));var r=t(3),a=t(7),o=(t(0),t(304)),i={id:"neo4j",title:"Neo4j",sidebar_label:"Neo4j"},l={unversionedId:"handlers/neo4j",id:"handlers/neo4j",isDocsHomePage:!1,title:"Neo4j",description:"image",source:"@site/docs/handlers/neo4j.md",slug:"/handlers/neo4j",permalink:"/docs/handlers/neo4j",editUrl:"https://github.com/urigo/graphql-mesh/edit/master/website/docs/handlers/neo4j.md",version:"current",sidebar_label:"Neo4j",sidebar:"sidebar",previous:{title:"MySQL",permalink:"/docs/handlers/mysql"},next:{title:"Rename Transform",permalink:"/docs/transforms/rename"}},c=[{value:"Config API Reference",id:"config-api-reference",children:[]}],p={toc:c};function s(e){var n=e.components,t=Object(a.a)(e,["components"]);return Object(o.b)("wrapper",Object(r.a)({},p,t,{components:n,mdxType:"MDXLayout"}),Object(o.b)("p",null,Object(o.b)("img",{parentName:"p",src:"https://user-images.githubusercontent.com/20847995/79219440-f1605480-7e5a-11ea-980e-6ba54ee1450e.png",alt:"image"})),Object(o.b)("p",null,"This handler allows you to use GraphQL schema created by ",Object(o.b)("inlineCode",{parentName:"p"},"neo4j-graphql-js"),"."),Object(o.b)("p",null,"To get started, install the handler library from NPM:"),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre"},"$ yarn add @graphql-mesh/neo4j\n")),Object(o.b)("p",null,"Now, you can use it directly in your Mesh config file:"),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-yml"},"sources:\n  - name: Neo4j\n    handler:\n      neo4j:\n        url: neo4j://localhost\n        username: neo4j\n        password: MY_PASSWORD\n\n")),Object(o.b)("blockquote",null,Object(o.b)("p",{parentName:"blockquote"},"You can check out our example that uses Neo4j handler.\n",Object(o.b)("a",{parentName:"p",href:"https://github.com/Urigo/graphql-mesh/tree/master/examples/neo4j-example"},"Click here to open the example on GitHub"))),Object(o.b)("h2",{id:"config-api-reference"},"Config API Reference"),Object(o.b)("p",null,Object(o.b)("ul",{parentName:"p"},Object(o.b)("li",{parentName:"ul"},Object(o.b)("inlineCode",{parentName:"li"},"url")," (type: ",Object(o.b)("inlineCode",{parentName:"li"},"String"),", required) - URL for the Neo4j Instance e.g. neo4j://localhost"),Object(o.b)("li",{parentName:"ul"},Object(o.b)("inlineCode",{parentName:"li"},"username")," (type: ",Object(o.b)("inlineCode",{parentName:"li"},"String"),", required) - Username for basic authentication"),Object(o.b)("li",{parentName:"ul"},Object(o.b)("inlineCode",{parentName:"li"},"password")," (type: ",Object(o.b)("inlineCode",{parentName:"li"},"String"),", required) - Password for basic authentication"),Object(o.b)("li",{parentName:"ul"},Object(o.b)("inlineCode",{parentName:"li"},"alwaysIncludeRelationships")," (type: ",Object(o.b)("inlineCode",{parentName:"li"},"Boolean"),") - Specifies whether relationships should always be included in the type definitions as ",Object(o.b)("a",{parentName:"li",href:"https://grandstack.io/docs/neo4j-graphql-js.html#relationship-types"},"relationship")," types, even if the relationships do not have properties."),Object(o.b)("li",{parentName:"ul"},Object(o.b)("inlineCode",{parentName:"li"},"database")," (type: ",Object(o.b)("inlineCode",{parentName:"li"},"String"),") - Specifies database name"),Object(o.b)("li",{parentName:"ul"},Object(o.b)("inlineCode",{parentName:"li"},"typeDefs")," (type: ",Object(o.b)("inlineCode",{parentName:"li"},"String"),") - Provide GraphQL Type Definitions instead of inferring"))))}s.isMDXComponent=!0},304:function(e,n,t){"use strict";t.d(n,"a",(function(){return b})),t.d(n,"b",(function(){return m}));var r=t(0),a=t.n(r);function o(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function i(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function l(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?i(Object(t),!0).forEach((function(n){o(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):i(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function c(e,n){if(null==e)return{};var t,r,a=function(e,n){if(null==e)return{};var t,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)t=o[r],n.indexOf(t)>=0||(a[t]=e[t]);return a}(e,n);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)t=o[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var p=a.a.createContext({}),s=function(e){var n=a.a.useContext(p),t=n;return e&&(t="function"==typeof e?e(n):l(l({},n),e)),t},b=function(e){var n=s(e.components);return a.a.createElement(p.Provider,{value:n},e.children)},u={inlineCode:"code",wrapper:function(e){var n=e.children;return a.a.createElement(a.a.Fragment,{},n)}},d=a.a.forwardRef((function(e,n){var t=e.components,r=e.mdxType,o=e.originalType,i=e.parentName,p=c(e,["components","mdxType","originalType","parentName"]),b=s(t),d=r,m=b["".concat(i,".").concat(d)]||b[d]||u[d]||o;return t?a.a.createElement(m,l(l({ref:n},p),{},{components:t})):a.a.createElement(m,l({ref:n},p))}));function m(e,n){var t=arguments,r=n&&n.mdxType;if("string"==typeof e||r){var o=t.length,i=new Array(o);i[0]=d;var l={};for(var c in n)hasOwnProperty.call(n,c)&&(l[c]=n[c]);l.originalType=e,l.mdxType="string"==typeof e?e:r,i[1]=l;for(var p=2;p<o;p++)i[p]=t[p];return a.a.createElement.apply(null,i)}return a.a.createElement.apply(null,t)}d.displayName="MDXCreateElement"}}]);