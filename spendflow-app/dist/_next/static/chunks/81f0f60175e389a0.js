(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,43488,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0}),Object.defineProperty(r,"warnOnce",{enumerable:!0,get:function(){return s}});let s=e=>{}},88368,e=>{"use strict";let t,r;var s,a=e.i(82078);let n={data:""},l=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,i=/\/\*[^]*?\*\/|  +/g,o=/\n+/g,c=(e,t)=>{let r="",s="",a="";for(let n in e){let l=e[n];"@"==n[0]?"i"==n[1]?r=n+" "+l+";":s+="f"==n[1]?c(l,n):n+"{"+c(l,"k"==n[1]?"":t)+"}":"object"==typeof l?s+=c(l,t?t.replace(/([^,])+/g,e=>n.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,t=>/&/.test(t)?t.replace(/&/g,e):e?e+" "+t:t)):n):null!=l&&(n=/^--/.test(n)?n:n.replace(/[A-Z]/g,"-$&").toLowerCase(),a+=c.p?c.p(n,l):n+":"+l+";")}return r+(t&&a?t+"{"+a+"}":a)+s},d={},u=e=>{if("object"==typeof e){let t="";for(let r in e)t+=r+u(e[r]);return t}return e};function m(e){let t,r,s=this||{},a=e.call?e(s.p):e;return((e,t,r,s,a)=>{var n;let m=u(e),f=d[m]||(d[m]=(e=>{let t=0,r=11;for(;t<e.length;)r=101*r+e.charCodeAt(t++)>>>0;return"go"+r})(m));if(!d[f]){let t=m!==e?e:(e=>{let t,r,s=[{}];for(;t=l.exec(e.replace(i,""));)t[4]?s.shift():t[3]?(r=t[3].replace(o," ").trim(),s.unshift(s[0][r]=s[0][r]||{})):s[0][t[1]]=t[2].replace(o," ").trim();return s[0]})(e);d[f]=c(a?{["@keyframes "+f]:t}:t,r?"":"."+f)}let p=r&&d.g?d.g:null;return r&&(d.g=d[f]),n=d[f],p?t.data=t.data.replace(p,n):-1===t.data.indexOf(n)&&(t.data=s?n+t.data:t.data+n),f})(a.unshift?a.raw?(t=[].slice.call(arguments,1),r=s.p,a.reduce((e,s,a)=>{let n=t[a];if(n&&n.call){let e=n(r),t=e&&e.props&&e.props.className||/^go/.test(e)&&e;n=t?"."+t:e&&"object"==typeof e?e.props?"":c(e,""):!1===e?"":e}return e+s+(null==n?"":n)},"")):a.reduce((e,t)=>Object.assign(e,t&&t.call?t(s.p):t),{}):a,(e=>{if("object"==typeof window){let t=(e?e.querySelector("#_goober"):window._goober)||Object.assign(document.createElement("style"),{innerHTML:" ",id:"_goober"});return t.nonce=window.__nonce__,t.parentNode||(e||document.head).appendChild(t),t.firstChild}return e||n})(s.target),s.g,s.o,s.k)}m.bind({g:1});let f,p,x,h=m.bind({k:1});function b(e,t){let r=this||{};return function(){let s=arguments;function a(n,l){let i=Object.assign({},n),o=i.className||a.className;r.p=Object.assign({theme:p&&p()},i),r.o=/ *go\d+/.test(o),i.className=m.apply(r,s)+(o?" "+o:""),t&&(i.ref=l);let c=e;return e[0]&&(c=i.as||e,delete i.as),x&&c[0]&&x(i),f(c,i)}return t?t(a):a}}var g=(e,t)=>"function"==typeof e?e(t):e,y=(t=0,()=>(++t).toString()),v=()=>{if(void 0===r&&"u">typeof window){let e=matchMedia("(prefers-reduced-motion: reduce)");r=!e||e.matches}return r},j="default",N=(e,t)=>{let{toastLimit:r}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,r)};case 1:return{...e,toasts:e.toasts.map(e=>e.id===t.toast.id?{...e,...t.toast}:e)};case 2:let{toast:s}=t;return N(e,{type:+!!e.toasts.find(e=>e.id===s.id),toast:s});case 3:let{toastId:a}=t;return{...e,toasts:e.toasts.map(e=>e.id===a||void 0===a?{...e,dismissed:!0,visible:!1}:e)};case 4:return void 0===t.toastId?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let n=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+n}))}}},w=[],k={toasts:[],pausedAt:void 0,settings:{toastLimit:20}},E={},P=(e,t=j)=>{E[t]=N(E[t]||k,e),w.forEach(([e,r])=>{e===t&&r(E[t])})},S=e=>Object.keys(E).forEach(t=>P(e,t)),O=(e=j)=>t=>{P(t,e)},_=e=>(t,r)=>{let s,a=((e,t="blank",r)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...r,id:(null==r?void 0:r.id)||y()}))(t,e,r);return O(a.toasterId||(s=a.id,Object.keys(E).find(e=>E[e].toasts.some(e=>e.id===s))))({type:2,toast:a}),a.id},C=(e,t)=>_("blank")(e,t);C.error=_("error"),C.success=_("success"),C.loading=_("loading"),C.custom=_("custom"),C.dismiss=(e,t)=>{let r={type:3,toastId:e};t?O(t)(r):S(r)},C.dismissAll=e=>C.dismiss(void 0,e),C.remove=(e,t)=>{let r={type:4,toastId:e};t?O(t)(r):S(r)},C.removeAll=e=>C.remove(void 0,e),C.promise=(e,t,r)=>{let s=C.loading(t.loading,{...r,...null==r?void 0:r.loading});return"function"==typeof e&&(e=e()),e.then(e=>{let a=t.success?g(t.success,e):void 0;return a?C.success(a,{id:s,...r,...null==r?void 0:r.success}):C.dismiss(s),e}).catch(e=>{let a=t.error?g(t.error,e):void 0;a?C.error(a,{id:s,...r,...null==r?void 0:r.error}):C.dismiss(s)}),e};var M=h`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,A=h`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,T=h`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,$=b("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${M} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${A} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${T} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,F=h`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,L=b("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${F} 1s linear infinite;
`,R=h`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,I=h`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,U=b("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${R} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${I} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,z=b("div")`
  position: absolute;
`,D=b("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,q=h`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,B=b("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${q} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,W=({toast:e})=>{let{icon:t,type:r,iconTheme:s}=e;return void 0!==t?"string"==typeof t?a.createElement(B,null,t):t:"blank"===r?null:a.createElement(D,null,a.createElement(L,{...s}),"loading"!==r&&a.createElement(z,null,"error"===r?a.createElement($,{...s}):a.createElement(U,{...s})))},H=b("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,K=b("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`;a.memo(({toast:e,position:t,style:r,children:s})=>{let n=e.height?((e,t)=>{let r=e.includes("top")?1:-1,[s,a]=v()?["0%{opacity:0;} 100%{opacity:1;}","0%{opacity:1;} 100%{opacity:0;}"]:[`
0% {transform: translate3d(0,${-200*r}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${-150*r}%,-1px) scale(.6); opacity:0;}
`];return{animation:t?`${h(s)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${h(a)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}})(e.position||t||"top-center",e.visible):{opacity:0},l=a.createElement(W,{toast:e}),i=a.createElement(K,{...e.ariaProps},g(e.message,e));return a.createElement(H,{className:e.className,style:{...n,...r,...e.style}},"function"==typeof s?s({icon:l,message:i}):a.createElement(a.Fragment,null,l,i))}),s=a.createElement,c.p=void 0,f=s,p=void 0,x=void 0,m`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,e.s(["default",()=>C,"toast",()=>C],88368)},30761,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0});var s={assign:function(){return o},searchParamsToUrlQuery:function(){return n},urlQueryToSearchParams:function(){return i}};for(var a in s)Object.defineProperty(r,a,{enumerable:!0,get:s[a]});function n(e){let t={};for(let[r,s]of e.entries()){let e=t[r];void 0===e?t[r]=s:Array.isArray(e)?e.push(s):t[r]=[e,s]}return t}function l(e){return"string"==typeof e?e:("number"!=typeof e||isNaN(e))&&"boolean"!=typeof e?"":String(e)}function i(e){let t=new URLSearchParams;for(let[r,s]of Object.entries(e))if(Array.isArray(s))for(let e of s)t.append(r,l(e));else t.set(r,l(s));return t}function o(e,...t){for(let r of t){for(let t of r.keys())e.delete(t);for(let[t,s]of r.entries())e.append(t,s)}return e}},18244,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0});var s={formatUrl:function(){return i},formatWithValidation:function(){return c},urlObjectKeys:function(){return o}};for(var a in s)Object.defineProperty(r,a,{enumerable:!0,get:s[a]});let n=e.r(24320)._(e.r(30761)),l=/https?|ftp|gopher|file/;function i(e){let{auth:t,hostname:r}=e,s=e.protocol||"",a=e.pathname||"",i=e.hash||"",o=e.query||"",c=!1;t=t?encodeURIComponent(t).replace(/%3A/i,":")+"@":"",e.host?c=t+e.host:r&&(c=t+(~r.indexOf(":")?`[${r}]`:r),e.port&&(c+=":"+e.port)),o&&"object"==typeof o&&(o=String(n.urlQueryToSearchParams(o)));let d=e.search||o&&`?${o}`||"";return s&&!s.endsWith(":")&&(s+=":"),e.slashes||(!s||l.test(s))&&!1!==c?(c="//"+(c||""),a&&"/"!==a[0]&&(a="/"+a)):c||(c=""),i&&"#"!==i[0]&&(i="#"+i),d&&"?"!==d[0]&&(d="?"+d),a=a.replace(/[?#]/g,encodeURIComponent),d=d.replace("#","%23"),`${s}${c}${a}${d}${i}`}let o=["auth","hash","host","hostname","href","path","pathname","port","protocol","query","search","slashes"];function c(e){return i(e)}},66781,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0}),Object.defineProperty(r,"useMergedRef",{enumerable:!0,get:function(){return a}});let s=e.r(82078);function a(e,t){let r=(0,s.useRef)(null),a=(0,s.useRef)(null);return(0,s.useCallback)(s=>{if(null===s){let e=r.current;e&&(r.current=null,e());let t=a.current;t&&(a.current=null,t())}else e&&(r.current=n(e,s)),t&&(a.current=n(t,s))},[e,t])}function n(e,t){if("function"!=typeof e)return e.current=t,()=>{e.current=null};{let r=e(t);return"function"==typeof r?r:()=>e(null)}}("function"==typeof r.default||"object"==typeof r.default&&null!==r.default)&&void 0===r.default.__esModule&&(Object.defineProperty(r.default,"__esModule",{value:!0}),Object.assign(r.default,r),t.exports=r.default)},20627,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0});var s={DecodeError:function(){return b},MiddlewareNotFoundError:function(){return j},MissingStaticPage:function(){return v},NormalizeError:function(){return g},PageNotFoundError:function(){return y},SP:function(){return x},ST:function(){return h},WEB_VITALS:function(){return n},execOnce:function(){return l},getDisplayName:function(){return u},getLocationOrigin:function(){return c},getURL:function(){return d},isAbsoluteUrl:function(){return o},isResSent:function(){return m},loadGetInitialProps:function(){return p},normalizeRepeatedSlashes:function(){return f},stringifyError:function(){return N}};for(var a in s)Object.defineProperty(r,a,{enumerable:!0,get:s[a]});let n=["CLS","FCP","FID","INP","LCP","TTFB"];function l(e){let t,r=!1;return(...s)=>(r||(r=!0,t=e(...s)),t)}let i=/^[a-zA-Z][a-zA-Z\d+\-.]*?:/,o=e=>i.test(e);function c(){let{protocol:e,hostname:t,port:r}=window.location;return`${e}//${t}${r?":"+r:""}`}function d(){let{href:e}=window.location,t=c();return e.substring(t.length)}function u(e){return"string"==typeof e?e:e.displayName||e.name||"Unknown"}function m(e){return e.finished||e.headersSent}function f(e){let t=e.split("?");return t[0].replace(/\\/g,"/").replace(/\/\/+/g,"/")+(t[1]?`?${t.slice(1).join("?")}`:"")}async function p(e,t){let r=t.res||t.ctx&&t.ctx.res;if(!e.getInitialProps)return t.ctx&&t.Component?{pageProps:await p(t.Component,t.ctx)}:{};let s=await e.getInitialProps(t);if(r&&m(r))return s;if(!s)throw Object.defineProperty(Error(`"${u(e)}.getInitialProps()" should resolve to an object. But found "${s}" instead.`),"__NEXT_ERROR_CODE",{value:"E394",enumerable:!1,configurable:!0});return s}let x="undefined"!=typeof performance,h=x&&["mark","measure","getEntriesByName"].every(e=>"function"==typeof performance[e]);class b extends Error{}class g extends Error{}class y extends Error{constructor(e){super(),this.code="ENOENT",this.name="PageNotFoundError",this.message=`Cannot find module for page: ${e}`}}class v extends Error{constructor(e,t){super(),this.message=`Failed to load static file for page: ${e} ${t}`}}class j extends Error{constructor(){super(),this.code="ENOENT",this.message="Cannot find the middleware module"}}function N(e){return JSON.stringify({message:e.message,stack:e.stack})}},66357,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0}),Object.defineProperty(r,"isLocalURL",{enumerable:!0,get:function(){return n}});let s=e.r(20627),a=e.r(78843);function n(e){if(!(0,s.isAbsoluteUrl)(e))return!0;try{let t=(0,s.getLocationOrigin)(),r=new URL(e,t);return r.origin===t&&(0,a.hasBasePath)(r.pathname)}catch(e){return!1}}},96056,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0}),Object.defineProperty(r,"errorOnce",{enumerable:!0,get:function(){return s}});let s=e=>{}},11943,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0});var s={default:function(){return b},useLinkStatus:function(){return y}};for(var a in s)Object.defineProperty(r,a,{enumerable:!0,get:s[a]});let n=e.r(24320),l=e.r(52621),i=n._(e.r(82078)),o=e.r(18244),c=e.r(63165),d=e.r(66781),u=e.r(20627),m=e.r(41841);e.r(43488);let f=e.r(33433),p=e.r(66357),x=e.r(16321);function h(e){return"string"==typeof e?e:(0,o.formatUrl)(e)}function b(t){var r;let s,a,n,[o,b]=(0,i.useOptimistic)(f.IDLE_LINK_STATUS),y=(0,i.useRef)(null),{href:v,as:j,children:N,prefetch:w=null,passHref:k,replace:E,shallow:P,scroll:S,onClick:O,onMouseEnter:_,onTouchStart:C,legacyBehavior:M=!1,onNavigate:A,ref:T,unstable_dynamicOnHover:$,...F}=t;s=N,M&&("string"==typeof s||"number"==typeof s)&&(s=(0,l.jsx)("a",{children:s}));let L=i.default.useContext(c.AppRouterContext),R=!1!==w,I=!1!==w?null===(r=w)||"auto"===r?x.FetchStrategy.PPR:x.FetchStrategy.Full:x.FetchStrategy.PPR,{href:U,as:z}=i.default.useMemo(()=>{let e=h(v);return{href:e,as:j?h(j):e}},[v,j]);if(M){if(s?.$$typeof===Symbol.for("react.lazy"))throw Object.defineProperty(Error("`<Link legacyBehavior>` received a direct child that is either a Server Component, or JSX that was loaded with React.lazy(). This is not supported. Either remove legacyBehavior, or make the direct child a Client Component that renders the Link's `<a>` tag."),"__NEXT_ERROR_CODE",{value:"E863",enumerable:!1,configurable:!0});a=i.default.Children.only(s)}let D=M?a&&"object"==typeof a&&a.ref:T,q=i.default.useCallback(e=>(null!==L&&(y.current=(0,f.mountLinkInstance)(e,U,L,I,R,b)),()=>{y.current&&((0,f.unmountLinkForCurrentNavigation)(y.current),y.current=null),(0,f.unmountPrefetchableInstance)(e)}),[R,U,L,I,b]),B={ref:(0,d.useMergedRef)(q,D),onClick(t){M||"function"!=typeof O||O(t),M&&a.props&&"function"==typeof a.props.onClick&&a.props.onClick(t),!L||t.defaultPrevented||function(t,r,s,a,n,l,o){if("undefined"!=typeof window){let c,{nodeName:d}=t.currentTarget;if("A"===d.toUpperCase()&&((c=t.currentTarget.getAttribute("target"))&&"_self"!==c||t.metaKey||t.ctrlKey||t.shiftKey||t.altKey||t.nativeEvent&&2===t.nativeEvent.which)||t.currentTarget.hasAttribute("download"))return;if(!(0,p.isLocalURL)(r)){n&&(t.preventDefault(),location.replace(r));return}if(t.preventDefault(),o){let e=!1;if(o({preventDefault:()=>{e=!0}}),e)return}let{dispatchNavigateAction:u}=e.r(843);i.default.startTransition(()=>{u(s||r,n?"replace":"push",l??!0,a.current)})}}(t,U,z,y,E,S,A)},onMouseEnter(e){M||"function"!=typeof _||_(e),M&&a.props&&"function"==typeof a.props.onMouseEnter&&a.props.onMouseEnter(e),L&&R&&(0,f.onNavigationIntent)(e.currentTarget,!0===$)},onTouchStart:function(e){M||"function"!=typeof C||C(e),M&&a.props&&"function"==typeof a.props.onTouchStart&&a.props.onTouchStart(e),L&&R&&(0,f.onNavigationIntent)(e.currentTarget,!0===$)}};return(0,u.isAbsoluteUrl)(z)?B.href=z:M&&!k&&("a"!==a.type||"href"in a.props)||(B.href=(0,m.addBasePath)(z)),n=M?i.default.cloneElement(a,B):(0,l.jsx)("a",{...F,...B,children:s}),(0,l.jsx)(g.Provider,{value:o,children:n})}e.r(96056);let g=(0,i.createContext)(f.IDLE_LINK_STATUS),y=()=>(0,i.useContext)(g);("function"==typeof r.default||"object"==typeof r.default&&null!==r.default)&&void 0===r.default.__esModule&&(Object.defineProperty(r.default,"__esModule",{value:!0}),Object.assign(r.default,r),t.exports=r.default)},3116,e=>{"use strict";let t=(0,e.i(75254).default)("clock",[["path",{d:"M12 6v6l4 2",key:"mmk7yg"}],["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}]]);e.s(["Clock",()=>t],3116)},84614,e=>{"use strict";let t=(0,e.i(75254).default)("user",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]]);e.s(["User",()=>t],84614)},98919,e=>{"use strict";let t=(0,e.i(75254).default)("shield",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}]]);e.s(["Shield",()=>t],98919)},63488,e=>{"use strict";let t=(0,e.i(75254).default)("mail",[["path",{d:"m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7",key:"132q7q"}],["rect",{x:"2",y:"4",width:"20",height:"16",rx:"2",key:"izxlao"}]]);e.s(["Mail",()=>t],63488)},86311,e=>{"use strict";let t=(0,e.i(75254).default)("message-square",[["path",{d:"M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z",key:"18887p"}]]);e.s(["MessageSquare",()=>t],86311)},14764,e=>{"use strict";let t=(0,e.i(75254).default)("send",[["path",{d:"M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",key:"1ffxy3"}],["path",{d:"m21.854 2.147-10.94 10.939",key:"12cjpa"}]]);e.s(["Send",()=>t],14764)},16638,e=>{"use strict";var t=e.i(52621),r=e.i(11943),s=e.i(82078);e.i(75271);var a=e.i(5158),n=e.i(41195),l=e.i(2188),i=e.i(88368),o=e.i(14764),c=e.i(63488),d=e.i(86311),u=e.i(84614);function m(){let{user:e}=(0,l.useAuth)(),[r,m]=(0,s.useState)(!1),[f,p]=(0,s.useState)({name:e?.displayName||"",email:e?.email||"",subject:"",message:""}),x=async t=>{if(t.preventDefault(),!f.name||!f.email||!f.subject||!f.message)return void i.toast.error("Please fill in all fields");try{m(!0),await (0,a.addDoc)((0,a.collection)(n.db,"contactMessages"),{userId:e?.uid||"anonymous",userName:f.name,userEmail:f.email,subject:f.subject,message:f.message,status:"new",createdAt:(0,a.serverTimestamp)(),updatedAt:(0,a.serverTimestamp)()}),i.toast.success("Message sent successfully! We'll get back to you soon."),p({name:e?.displayName||"",email:e?.email||"",subject:"",message:""})}catch(e){console.error("Error sending message:",e),i.toast.error("Failed to send message. Please try again.")}finally{m(!1)}},h=e=>{let{name:t,value:r}=e.target;p(e=>({...e,[t]:r}))};return(0,t.jsx)("div",{className:"max-w-2xl mx-auto",children:(0,t.jsxs)("div",{className:"bg-slate-900/50 border border-slate-800 rounded-xl p-8",children:[(0,t.jsxs)("div",{className:"text-center mb-8",children:[(0,t.jsx)("div",{className:"w-16 h-16 bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-4",children:(0,t.jsx)(c.Mail,{className:"h-8 w-8 text-amber-400"})}),(0,t.jsx)("h2",{className:"text-2xl font-serif text-slate-100 mb-2",children:"Contact Us"}),(0,t.jsx)("p",{className:"text-slate-400",children:"Have a question or need help? We'd love to hear from you."})]}),(0,t.jsxs)("form",{onSubmit:x,className:"space-y-6",children:[(0,t.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[(0,t.jsxs)("div",{children:[(0,t.jsx)("label",{htmlFor:"name",className:"block text-sm font-medium text-slate-300 mb-2",children:"Full Name *"}),(0,t.jsxs)("div",{className:"relative",children:[(0,t.jsx)("div",{className:"absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none",children:(0,t.jsx)(u.User,{className:"h-4 w-4 text-slate-500"})}),(0,t.jsx)("input",{type:"text",id:"name",name:"name",value:f.name,onChange:h,className:"block w-full pl-10 pr-3 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent",placeholder:"Your full name",required:!0})]})]}),(0,t.jsxs)("div",{children:[(0,t.jsx)("label",{htmlFor:"email",className:"block text-sm font-medium text-slate-300 mb-2",children:"Email Address *"}),(0,t.jsxs)("div",{className:"relative",children:[(0,t.jsx)("div",{className:"absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none",children:(0,t.jsx)(c.Mail,{className:"h-4 w-4 text-slate-500"})}),(0,t.jsx)("input",{type:"email",id:"email",name:"email",value:f.email,onChange:h,className:"block w-full pl-10 pr-3 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent",placeholder:"your.email@example.com",required:!0})]})]})]}),(0,t.jsxs)("div",{children:[(0,t.jsx)("label",{htmlFor:"subject",className:"block text-sm font-medium text-slate-300 mb-2",children:"Subject *"}),(0,t.jsxs)("div",{className:"relative",children:[(0,t.jsx)("div",{className:"absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none",children:(0,t.jsx)(d.MessageSquare,{className:"h-4 w-4 text-slate-500"})}),(0,t.jsx)("input",{type:"text",id:"subject",name:"subject",value:f.subject,onChange:h,className:"block w-full pl-10 pr-3 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent",placeholder:"What's this about?",required:!0})]})]}),(0,t.jsxs)("div",{children:[(0,t.jsx)("label",{htmlFor:"message",className:"block text-sm font-medium text-slate-300 mb-2",children:"Message *"}),(0,t.jsx)("textarea",{id:"message",name:"message",value:f.message,onChange:h,rows:6,className:"block w-full px-3 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none",placeholder:"Tell us how we can help you...",required:!0})]}),(0,t.jsx)("div",{className:"flex justify-end",children:(0,t.jsx)("button",{type:"submit",disabled:r,className:"px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-900",children:r?(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("div",{className:"animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"}),"Sending..."]}):(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(o.Send,{className:"h-4 w-4"}),"Send Message"]})})})]}),(0,t.jsxs)("div",{className:"mt-8 p-4 bg-slate-800/50 rounded-lg",children:[(0,t.jsx)("h3",{className:"text-sm font-medium text-slate-300 mb-2",children:"What happens next?"}),(0,t.jsxs)("ul",{className:"text-sm text-slate-400 space-y-1",children:[(0,t.jsx)("li",{children:"• We'll receive your message and review it promptly"}),(0,t.jsx)("li",{children:"• You'll get a confirmation email (if you provided one)"}),(0,t.jsx)("li",{children:"• Our support team will respond within 24-48 hours"}),(0,t.jsx)("li",{children:"• All communications are kept private and secure"})]})]})]})})}var f=e.i(3116),p=e.i(98919);let x=(0,e.i(75254).default)("arrow-left",[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]]);function h(){return(0,t.jsxs)("div",{className:"min-h-screen bg-slate-950",children:[(0,t.jsx)("header",{className:"sticky top-0 z-50 w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800",children:(0,t.jsx)("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:(0,t.jsxs)("div",{className:"flex items-center justify-between h-16",children:[(0,t.jsx)(r.default,{href:"/",className:"shrink-0",children:(0,t.jsx)("h1",{className:"text-lg sm:text-2xl font-serif text-slate-100 tracking-wider",children:"S P E N D F L O W"})}),(0,t.jsxs)("nav",{className:"flex items-center space-x-2 sm:space-x-4",children:[(0,t.jsx)(r.default,{href:"/",className:"px-3 sm:px-4 py-2 text-sm font-medium text-slate-300 hover:text-amber-400 transition-colors",children:"Home"}),(0,t.jsx)(r.default,{href:"/about",className:"px-3 sm:px-4 py-2 text-sm font-medium text-slate-300 hover:text-amber-400 transition-colors",children:"About"}),(0,t.jsx)(r.default,{href:"/login",className:"hidden sm:inline-flex px-3 sm:px-4 py-2 text-sm font-medium text-slate-300 hover:text-amber-400 transition-colors",children:"Sign In"}),(0,t.jsx)(r.default,{href:"/signup",className:"px-3 sm:px-4 py-2 text-sm border border-amber-600 text-amber-400 bg-amber-900/10 hover:bg-amber-600/20 font-medium tracking-wide transition-all rounded-md",children:"Get Started"})]})]})})}),(0,t.jsxs)("main",{className:"flex-1",children:[(0,t.jsx)("section",{className:"relative overflow-hidden py-16 sm:py-24",children:(0,t.jsxs)("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:[(0,t.jsxs)("div",{className:"text-center max-w-4xl mx-auto mb-12",children:[(0,t.jsx)("div",{className:"w-16 sm:w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-8"}),(0,t.jsxs)("h1",{className:"text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-slate-100 mb-6 tracking-tight leading-tight",children:["Get in ",(0,t.jsx)("span",{className:"text-amber-400",children:"Touch"})]}),(0,t.jsx)("div",{className:"w-24 sm:w-32 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto my-8"}),(0,t.jsx)("p",{className:"text-lg sm:text-xl text-slate-400 mb-8 leading-relaxed max-w-2xl mx-auto",children:"Have questions about SpendFlow? Need help with your account? We're here to help you succeed with your financial goals."})]}),(0,t.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16",children:[(0,t.jsxs)("div",{className:"text-center",children:[(0,t.jsx)("div",{className:"w-12 h-12 bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-4",children:(0,t.jsx)(f.Clock,{className:"h-6 w-6 text-amber-400"})}),(0,t.jsx)("h3",{className:"text-lg font-serif text-slate-100 mb-2",children:"24-48 Hours"}),(0,t.jsx)("p",{className:"text-slate-400 text-sm",children:"Average response time"})]}),(0,t.jsxs)("div",{className:"text-center",children:[(0,t.jsx)("div",{className:"w-12 h-12 bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-4",children:(0,t.jsx)(p.Shield,{className:"h-6 w-6 text-amber-400"})}),(0,t.jsx)("h3",{className:"text-lg font-serif text-slate-100 mb-2",children:"Secure"}),(0,t.jsx)("p",{className:"text-slate-400 text-sm",children:"Your data is protected"})]}),(0,t.jsxs)("div",{className:"text-center",children:[(0,t.jsx)("div",{className:"w-12 h-12 bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-4",children:(0,t.jsx)(d.MessageSquare,{className:"h-6 w-6 text-amber-400"})}),(0,t.jsx)("h3",{className:"text-lg font-serif text-slate-100 mb-2",children:"Personal"}),(0,t.jsx)("p",{className:"text-slate-400 text-sm",children:"Direct support from our team"})]})]})]})}),(0,t.jsx)("section",{className:"py-16 sm:py-24 bg-slate-900/50",children:(0,t.jsx)("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:(0,t.jsx)(m,{})})}),(0,t.jsx)("section",{className:"py-16 sm:py-24",children:(0,t.jsxs)("div",{className:"max-w-4xl mx-auto px-4 sm:px-6 lg:px-8",children:[(0,t.jsxs)("div",{className:"text-center mb-12",children:[(0,t.jsx)("h2",{className:"text-3xl sm:text-4xl font-serif text-slate-100 mb-4",children:"Other Ways to Reach Us"}),(0,t.jsx)("div",{className:"w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto"})]}),(0,t.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-8",children:[(0,t.jsxs)("div",{className:"bg-slate-900/50 border border-slate-800 rounded-xl p-8",children:[(0,t.jsx)("div",{className:"w-12 h-12 bg-amber-900/20 rounded-lg flex items-center justify-center mb-6",children:(0,t.jsx)(c.Mail,{className:"h-6 w-6 text-amber-400"})}),(0,t.jsx)("h3",{className:"text-xl font-serif text-slate-100 mb-3",children:"Email Support"}),(0,t.jsx)("p",{className:"text-slate-400 leading-relaxed mb-4",children:"For technical issues, billing questions, or general inquiries, you can also email us directly."}),(0,t.jsx)("a",{href:"mailto:support@spendflow.com",className:"inline-flex items-center text-amber-400 hover:text-amber-300 font-medium transition-colors",children:"support@spendflow.com"})]}),(0,t.jsxs)("div",{className:"bg-slate-900/50 border border-slate-800 rounded-xl p-8",children:[(0,t.jsx)("div",{className:"w-12 h-12 bg-amber-900/20 rounded-lg flex items-center justify-center mb-6",children:(0,t.jsx)(d.MessageSquare,{className:"h-6 w-6 text-amber-400"})}),(0,t.jsx)("h3",{className:"text-xl font-serif text-slate-100 mb-3",children:"Live Chat"}),(0,t.jsx)("p",{className:"text-slate-400 leading-relaxed mb-4",children:"Need immediate assistance? Our live chat support is available during business hours."}),(0,t.jsx)("span",{className:"text-slate-500 text-sm",children:"Available 9 AM - 6 PM EST, Monday - Friday"})]})]})]})}),(0,t.jsx)("section",{className:"py-16",children:(0,t.jsx)("div",{className:"max-w-4xl mx-auto px-4 sm:px-6 text-center",children:(0,t.jsxs)(r.default,{href:"/",className:"inline-flex items-center gap-2 px-6 py-3 border border-slate-700 text-slate-300 hover:bg-slate-800/50 font-medium rounded-lg transition-colors",children:[(0,t.jsx)(x,{className:"h-4 w-4"}),"Back to Home"]})})})]}),(0,t.jsx)("footer",{className:"bg-slate-900 border-t border-slate-800 py-12",children:(0,t.jsx)("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:(0,t.jsxs)("div",{className:"flex flex-col items-center justify-center",children:[(0,t.jsx)("div",{className:"w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mb-6"}),(0,t.jsxs)("p",{className:"text-slate-500 text-sm sm:text-base font-serif tracking-wider text-center",children:["© ",new Date().getFullYear()," SpendFlow. Premium Financial Management."]})]})})})]})}e.s(["default",()=>h],16638)}]);