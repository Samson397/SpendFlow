(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,88368,e=>{"use strict";let t,s;var a,r=e.i(82078);let o={data:""},i=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,n=/\/\*[^]*?\*\/|  +/g,l=/\n+/g,c=(e,t)=>{let s="",a="",r="";for(let o in e){let i=e[o];"@"==o[0]?"i"==o[1]?s=o+" "+i+";":a+="f"==o[1]?c(i,o):o+"{"+c(i,"k"==o[1]?"":t)+"}":"object"==typeof i?a+=c(i,t?t.replace(/([^,])+/g,e=>o.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,t=>/&/.test(t)?t.replace(/&/g,e):e?e+" "+t:t)):o):null!=i&&(o=/^--/.test(o)?o:o.replace(/[A-Z]/g,"-$&").toLowerCase(),r+=c.p?c.p(o,i):o+":"+i+";")}return s+(t&&r?t+"{"+r+"}":r)+a},d={},u=e=>{if("object"==typeof e){let t="";for(let s in e)t+=s+u(e[s]);return t}return e};function m(e){let t,s,a=this||{},r=e.call?e(a.p):e;return((e,t,s,a,r)=>{var o;let m=u(e),p=d[m]||(d[m]=(e=>{let t=0,s=11;for(;t<e.length;)s=101*s+e.charCodeAt(t++)>>>0;return"go"+s})(m));if(!d[p]){let t=m!==e?e:(e=>{let t,s,a=[{}];for(;t=i.exec(e.replace(n,""));)t[4]?a.shift():t[3]?(s=t[3].replace(l," ").trim(),a.unshift(a[0][s]=a[0][s]||{})):a[0][t[1]]=t[2].replace(l," ").trim();return a[0]})(e);d[p]=c(r?{["@keyframes "+p]:t}:t,s?"":"."+p)}let g=s&&d.g?d.g:null;return s&&(d.g=d[p]),o=d[p],g?t.data=t.data.replace(g,o):-1===t.data.indexOf(o)&&(t.data=a?o+t.data:t.data+o),p})(r.unshift?r.raw?(t=[].slice.call(arguments,1),s=a.p,r.reduce((e,a,r)=>{let o=t[r];if(o&&o.call){let e=o(s),t=e&&e.props&&e.props.className||/^go/.test(e)&&e;o=t?"."+t:e&&"object"==typeof e?e.props?"":c(e,""):!1===e?"":e}return e+a+(null==o?"":o)},"")):r.reduce((e,t)=>Object.assign(e,t&&t.call?t(a.p):t),{}):r,(e=>{if("object"==typeof window){let t=(e?e.querySelector("#_goober"):window._goober)||Object.assign(document.createElement("style"),{innerHTML:" ",id:"_goober"});return t.nonce=window.__nonce__,t.parentNode||(e||document.head).appendChild(t),t.firstChild}return e||o})(a.target),a.g,a.o,a.k)}m.bind({g:1});let p,g,h,f=m.bind({k:1});function x(e,t){let s=this||{};return function(){let a=arguments;function r(o,i){let n=Object.assign({},o),l=n.className||r.className;s.p=Object.assign({theme:g&&g()},n),s.o=/ *go\d+/.test(l),n.className=m.apply(s,a)+(l?" "+l:""),t&&(n.ref=i);let c=e;return e[0]&&(c=n.as||e,delete n.as),h&&c[0]&&h(n),p(c,n)}return t?t(r):r}}var y=(e,t)=>"function"==typeof e?e(t):e,b=(t=0,()=>(++t).toString()),v=()=>{if(void 0===s&&"u">typeof window){let e=matchMedia("(prefers-reduced-motion: reduce)");s=!e||e.matches}return s},w="default",j=(e,t)=>{let{toastLimit:s}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,s)};case 1:return{...e,toasts:e.toasts.map(e=>e.id===t.toast.id?{...e,...t.toast}:e)};case 2:let{toast:a}=t;return j(e,{type:+!!e.toasts.find(e=>e.id===a.id),toast:a});case 3:let{toastId:r}=t;return{...e,toasts:e.toasts.map(e=>e.id===r||void 0===r?{...e,dismissed:!0,visible:!1}:e)};case 4:return void 0===t.toastId?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let o=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+o}))}}},N=[],$={toasts:[],pausedAt:void 0,settings:{toastLimit:20}},k={},S=(e,t=w)=>{k[t]=j(k[t]||$,e),N.forEach(([e,s])=>{e===t&&s(k[t])})},A=e=>Object.keys(k).forEach(t=>S(e,t)),C=(e=w)=>t=>{S(t,e)},E=e=>(t,s)=>{let a,r=((e,t="blank",s)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...s,id:(null==s?void 0:s.id)||b()}))(t,e,s);return C(r.toasterId||(a=r.id,Object.keys(k).find(e=>k[e].toasts.some(e=>e.id===a))))({type:2,toast:r}),r.id},T=(e,t)=>E("blank")(e,t);T.error=E("error"),T.success=E("success"),T.loading=E("loading"),T.custom=E("custom"),T.dismiss=(e,t)=>{let s={type:3,toastId:e};t?C(t)(s):A(s)},T.dismissAll=e=>T.dismiss(void 0,e),T.remove=(e,t)=>{let s={type:4,toastId:e};t?C(t)(s):A(s)},T.removeAll=e=>T.remove(void 0,e),T.promise=(e,t,s)=>{let a=T.loading(t.loading,{...s,...null==s?void 0:s.loading});return"function"==typeof e&&(e=e()),e.then(e=>{let r=t.success?y(t.success,e):void 0;return r?T.success(r,{id:a,...s,...null==s?void 0:s.success}):T.dismiss(a),e}).catch(e=>{let r=t.error?y(t.error,e):void 0;r?T.error(r,{id:a,...s,...null==s?void 0:s.error}):T.dismiss(a)}),e};var D=f`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,z=f`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,I=f`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,M=x("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${D} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${z} 0.15s ease-out forwards;
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
    animation: ${I} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,O=f`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,F=x("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${O} 1s linear infinite;
`,P=f`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,q=f`
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
}`,L=x("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${P} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${q} 0.2s ease-out forwards;
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
`,U=x("div")`
  position: absolute;
`,H=x("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,R=f`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,_=x("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${R} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,B=({toast:e})=>{let{icon:t,type:s,iconTheme:a}=e;return void 0!==t?"string"==typeof t?r.createElement(_,null,t):t:"blank"===s?null:r.createElement(H,null,r.createElement(F,{...a}),"loading"!==s&&r.createElement(U,null,"error"===s?r.createElement(M,{...a}):r.createElement(L,{...a})))},G=x("div")`
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
`,V=x("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`;r.memo(({toast:e,position:t,style:s,children:a})=>{let o=e.height?((e,t)=>{let s=e.includes("top")?1:-1,[a,r]=v()?["0%{opacity:0;} 100%{opacity:1;}","0%{opacity:1;} 100%{opacity:0;}"]:[`
0% {transform: translate3d(0,${-200*s}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${-150*s}%,-1px) scale(.6); opacity:0;}
`];return{animation:t?`${f(a)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${f(r)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}})(e.position||t||"top-center",e.visible):{opacity:0},i=r.createElement(B,{toast:e}),n=r.createElement(V,{...e.ariaProps},y(e.message,e));return r.createElement(G,{className:e.className,style:{...o,...s,...e.style}},"function"==typeof a?a({icon:i,message:n}):r.createElement(r.Fragment,null,i,n))}),a=r.createElement,c.p=void 0,p=a,g=void 0,h=void 0,m`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,e.s(["default",()=>T,"toast",()=>T],88368)},61659,e=>{"use strict";let t=(0,e.i(75254).default)("credit-card",[["rect",{width:"20",height:"14",x:"2",y:"5",rx:"2",key:"ynyp8z"}],["line",{x1:"2",x2:"22",y1:"10",y2:"10",key:"1b3vmo"}]]);e.s(["CreditCard",()=>t],61659)},86311,e=>{"use strict";let t=(0,e.i(75254).default)("message-square",[["path",{d:"M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z",key:"18887p"}]]);e.s(["MessageSquare",()=>t],86311)},39616,e=>{"use strict";let t=(0,e.i(75254).default)("settings",[["path",{d:"M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915",key:"1i5ecw"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]);e.s(["Settings",()=>t],39616)},36166,e=>{"use strict";let t=(0,e.i(75254).default)("shield-check",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]);e.s(["default",()=>t])},43479,e=>{"use strict";e.i(15525);var t=e.i(52621),s=e.i(82078),a=e.i(20976),r=e.i(2188),o=e.i(47340);e.i(75271);var i=e.i(5158),n=e.i(41195),l=e.i(61659),c=e.i(86311),d=e.i(39616),u=e.i(36166),u=u,m=e.i(88368);let p=(0,o.default)(()=>e.A(97712),{loadableGenerated:{modules:[67962]},ssr:!1}),g=(0,o.default)(()=>e.A(70107),{loadableGenerated:{modules:[98159]},ssr:!1,loading:()=>(0,t.jsx)("div",{className:"flex items-center justify-center h-64",children:(0,t.jsx)("div",{className:"animate-spin rounded-full h-12 w-12 border-2 border-amber-400 border-t-transparent"})})});function h(){let{user:e,loading:o}=(0,r.useAuth)(),[h,f]=(0,s.useState)(!1),x=(0,a.useRouter)(),[y,b]=(0,s.useState)(!0),[v,w]=(0,s.useState)(!1),[j,N]=(0,s.useState)({totalUsers:0,totalCards:0,totalTransactions:0,totalTransactionValue:0,totalMessages:0,newMessages:0,systemHealth:"operational",activeUsers:0,newUsers:0,storageUsed:"0 MB",loading:!0}),$=(0,s.useCallback)(async()=>{try{let e=(0,i.getFirestore)(),t=(0,i.doc)(e,"system/health"),s=new Promise((e,t)=>setTimeout(()=>t(Error("Health check timeout")),5e3));return await Promise.race([(0,i.getDoc)(t),s]),!0}catch(e){return console.warn("System health check failed (this is expected if system/health doesn't exist):",e),!1}},[]),k=(0,s.useCallback)(async()=>{let t=setTimeout(()=>{console.warn("🚨 Safety timeout: Forcing loading state clear"),N(e=>({...e,loading:!1})),w(!0)},3e4);try{console.log("📊 Loading admin statistics..."),N(e=>({...e,loading:!0}));let s=setTimeout(()=>{console.warn("⚠️ Stats loading is taking longer than expected..."),w(!0)},8e3),a=new Date,r=new Date(a.getTime()-2592e6),o=new Date(a.getTime()-6048e5),l=async(t,s,...a)=>{try{if(!e)return console.error("❌ No authenticated user for count query"),0;let r=new Date().toISOString();if(console.log(`[${r}] 🔍 Fetching count for ${t}`,{queryConstraints:a,isAdmin:s,userId:e.uid}),["users","transactions","messages"].includes(t)&&!s)return console.warn("⚠️ Insufficient permissions for collection:",t),0;let o=(async()=>{try{let e=(0,i.collection)(n.db,t),s=(0,i.query)(e,(0,i.limit)(1e3));a.length>0&&(s=(0,i.query)(e,...a,(0,i.limit)(1e3))),console.log(`[${r}] Executing count query for ${t}:`,s);let o=(await (0,i.getDocs)(s)).docs;return console.log(`[${r}] ✅ Successfully counted ${o.length} documents in ${t}`),o.length}catch(e){console.error(`[${r}] ❌ Raw error for ${t}:`,e);try{console.error(`[${r}] ❌ Stringified error:`,JSON.stringify(e,null,2))}catch(e){console.error(`[${r}] ❌ Could not stringify error:`,e)}try{console.log(`[${r}] Trying simple count without filters...`);let e=(0,i.collection)(n.db,t),s=(0,i.query)(e,(0,i.limit)(100)),a=await (0,i.getDocs)(s);return console.log(`[${r}] Simple count result:`,a.size),a.size}catch(e){return console.error(`[${r}] ❌ Simple count failed:`,e),0}}})(),l=new Promise((e,s)=>setTimeout(()=>s(Error(`Query timeout for ${t}`)),15e3));try{return await Promise.race([o,l])}catch(e){return console.error(`[${new Date().toISOString()}] Error in Promise.race:`,e),0}}catch(e){return console.error(`[${new Date().toISOString()}] Error in safeGetCount for ${t}:`,e),0}};console.log("Fetching statistics with date range:",{now:a.toISOString(),thirtyDaysAgo:r.toISOString(),sevenDaysAgo:o.toISOString()});let c=await Promise.allSettled([l("users",!0),(async()=>{try{let e=i.Timestamp.fromDate(r);return console.log("Fetching active users with lastActive >=",e),await l("users",!0,(0,i.where)("lastActive",">=",e))}catch(e){return console.error("Error in active users query:",e),0}})(),l("users",!0,(0,i.where)("createdAt",">=",i.Timestamp.fromDate(o))),(async()=>{try{let e=(0,i.collection)(n.db,"transactions"),t=(0,i.query)(e);return{count:(await (0,i.getCountFromServer)(t)).data().count,value:0}}catch(e){return console.error("Error calculating transaction stats:",e),{count:0,value:0}}})(),l("contactMessages",!0),l("contactMessages",!0,(0,i.where)("createdAt",">=",i.Timestamp.fromDate(o)),(0,i.where)("status","in",["unread","new"])),l("cards",!0)]),d=(e,t)=>{let s=c[e];return s?"fulfilled"===s.status?(console.log(`${t} count:`,s.value),s.value):(console.error(`Error fetching ${t}:`,s.reason),0):(console.error(`No result at index ${e} for ${t}`),0)};clearTimeout(s),clearTimeout(t),w(!1);let u=d(0,"totalUsers"),m=d(1,"activeUsers"),p=d(2,"newUsers"),g=d(3,"transactionStats"),h=g?.count||0,f=g?.value||0,x=d(4,"totalMessages"),y=d(5,"newMessages"),b=d(6,"totalCards"),j=v?"Loading timeout - data unavailable":"Calculating...",k=await $();console.log("Stats loaded:",{totalUsers:u,totalCards:b,totalTransactions:h,totalMessages:x,newMessages:y,activeUsers:m,newUsers:p,storageUsed:j}),N({totalUsers:u,totalCards:b,totalTransactions:h,totalTransactionValue:f,totalMessages:x,newMessages:y,systemHealth:v?"degraded":k?"operational":"degraded",activeUsers:m,newUsers:p,storageUsed:j,loading:!1})}catch(e){console.error("Error loading stats:",e),clearTimeout(t),m.default.error("Unable to load some statistics. This may be due to missing data or permissions.",{duration:5e3}),N(e=>({...e,systemHealth:"degraded",loading:!1}))}},[$,e,h,v]);return((0,s.useEffect)(()=>{if(o)return;let t=!0,s=null,a=setTimeout(()=>{t&&(console.warn("🚨 HARD FALLBACK: Forcing loading state to false after 45 seconds"),N(e=>({...e,loading:!1})),w(!0),m.default.error("Loading took too long. Some data may not be available.",{duration:5e3}))},45e3);return(async()=>{if(!e)return x.push("/login");try{let r=!!e.email&&("spendflowapp@gmail.com".split(",")||[]).includes(e.email);if(!t)return;if(f(r),b(!1),!r){clearTimeout(a),m.default.error("Admin access required. Please contact support if you believe this is an error.",{duration:5e3}),setTimeout(()=>{t&&x.push("/dashboard")},1e3);return}console.log("✅ Admin access granted, loading stats..."),await k(),clearTimeout(a),s=setInterval(async()=>{if(t)try{await k()}catch(e){console.error("Error refreshing stats:",e)}},12e4)}catch(e){clearTimeout(a),console.error("❌ Error initializing admin page:",e),t&&(b(!1),m.default.error("Error initializing admin page"))}})(),()=>{t=!1,clearTimeout(a),s&&clearInterval(s)}},[o,e,x,k]),o||y)?(0,t.jsx)("div",{className:"flex items-center justify-center h-screen",children:(0,t.jsxs)("div",{className:"text-center",children:[(0,t.jsx)("div",{className:"animate-spin rounded-full h-12 w-12 border-2 border-amber-400 border-t-transparent mx-auto mb-4"}),(0,t.jsx)("div",{className:"text-amber-400 text-lg font-serif tracking-wider",children:o?"Loading user...":"Verifying Admin Access..."}),(0,t.jsx)("div",{className:"mt-4 text-slate-400 text-sm",children:e?`Logged in as: ${e.email}`:"Not logged in"})]})}):h?(0,t.jsx)("div",{className:"min-h-screen bg-slate-950 text-slate-100",children:(0,t.jsxs)("div",{className:"container mx-auto px-4 py-8",children:[(0,t.jsxs)("div",{className:"flex items-center justify-between mb-6",children:[(0,t.jsxs)("div",{className:"flex items-center gap-2",children:[(0,t.jsx)(u.default,{className:"h-6 w-6 text-amber-400"}),(0,t.jsx)("h1",{className:"text-3xl font-serif text-slate-100 tracking-wide",children:"Admin Dashboard"})]}),(0,t.jsx)("div",{className:"flex items-center gap-2",children:(0,t.jsx)("span",{className:"text-amber-400 font-serif tracking-wide",children:"ADMIN"})})]}),(0,t.jsx)(g,{stats:j,onRefresh:k})]})}):(0,t.jsxs)("div",{className:"grid grid-cols-1 lg:grid-cols-3 gap-6",children:[(0,t.jsxs)("div",{className:"lg:col-span-2 space-y-6",children:[(0,t.jsxs)("div",{className:"bg-slate-900/50 border border-slate-800 rounded-lg p-6",children:[(0,t.jsx)("h3",{className:"text-lg font-medium text-slate-100 mb-4",children:"Quick Actions"}),(0,t.jsxs)("div",{className:"grid grid-cols-2 md:grid-cols-4 gap-4",children:[(0,t.jsxs)("button",{className:"p-4 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors",onClick:()=>x.push("/dashboard"),children:[(0,t.jsx)(l.CreditCard,{className:"h-6 w-6 mx-auto mb-2 text-amber-400"}),(0,t.jsx)("span",{className:"text-sm",children:"My Transactions"})]}),(0,t.jsxs)("button",{className:"p-4 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors",onClick:()=>x.push("/login"),children:[(0,t.jsx)(c.MessageSquare,{className:"h-6 w-6 mx-auto mb-2 text-purple-400"}),(0,t.jsx)("span",{className:"text-sm",children:"Contact Support"})]}),(0,t.jsxs)("button",{className:"p-4 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors",onClick:()=>x.push("/dashboard"),children:[(0,t.jsx)(d.Settings,{className:"h-6 w-6 mx-auto mb-2 text-green-400"}),(0,t.jsx)("span",{className:"text-sm",children:"Account Settings"})]})]})]}),(0,t.jsxs)("div",{className:"bg-slate-900/50 border border-slate-800 rounded-lg p-6",children:[(0,t.jsx)("h3",{className:"text-lg font-medium text-slate-100 mb-4",children:"Recent Transactions"}),(0,t.jsx)("div",{className:"overflow-x-auto",children:(0,t.jsxs)("table",{className:"min-w-full divide-y divide-slate-800",children:[(0,t.jsx)("thead",{children:(0,t.jsxs)("tr",{children:[(0,t.jsx)("th",{className:"px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider",children:"Date"}),(0,t.jsx)("th",{className:"px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider",children:"Description"}),(0,t.jsx)("th",{className:"px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider",children:"Amount"}),(0,t.jsx)("th",{className:"px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider",children:"Status"})]})}),(0,t.jsx)("tbody",{className:"divide-y divide-slate-800",children:(0,t.jsxs)("tr",{children:[(0,t.jsx)("td",{className:"px-4 py-3 text-sm text-slate-300",children:"Just now"}),(0,t.jsx)("td",{className:"px-4 py-3 text-sm text-slate-300",children:"Grocery Store"}),(0,t.jsx)("td",{className:"px-4 py-3 text-sm text-red-400",children:"-$45.67"}),(0,t.jsx)("td",{className:"px-4 py-3",children:(0,t.jsx)("span",{className:"px-2 py-1 text-xs rounded-full bg-green-900/30 text-green-400",children:"Completed"})})]})})]})})]})]}),(0,t.jsx)("div",{className:"lg:col-span-1",children:(0,t.jsx)("div",{className:"bg-slate-900/50 border border-slate-800 rounded-lg p-6",children:(0,t.jsx)(p,{})})})]})}e.s(["default",()=>h],43479)},97712,e=>{e.v(t=>Promise.all(["static/chunks/66c7823eeaef8152.js"].map(t=>e.l(t))).then(()=>t(67962)))},70107,e=>{e.v(t=>Promise.all(["static/chunks/ed930e860fc0033b.js","static/chunks/b0d28655c8ac0e3c.js"].map(t=>e.l(t))).then(()=>t(98159)))}]);