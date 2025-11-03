(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,88368,e=>{"use strict";let t,s;var a,r=e.i(82078);let i={data:""},l=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,n=/\/\*[^]*?\*\/|  +/g,c=/\n+/g,o=(e,t)=>{let s="",a="",r="";for(let i in e){let l=e[i];"@"==i[0]?"i"==i[1]?s=i+" "+l+";":a+="f"==i[1]?o(l,i):i+"{"+o(l,"k"==i[1]?"":t)+"}":"object"==typeof l?a+=o(l,t?t.replace(/([^,])+/g,e=>i.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,t=>/&/.test(t)?t.replace(/&/g,e):e?e+" "+t:t)):i):null!=l&&(i=/^--/.test(i)?i:i.replace(/[A-Z]/g,"-$&").toLowerCase(),r+=o.p?o.p(i,l):i+":"+l+";")}return s+(t&&r?t+"{"+r+"}":r)+a},d={},x=e=>{if("object"==typeof e){let t="";for(let s in e)t+=s+x(e[s]);return t}return e};function m(e){let t,s,a=this||{},r=e.call?e(a.p):e;return((e,t,s,a,r)=>{var i;let m=x(e),p=d[m]||(d[m]=(e=>{let t=0,s=11;for(;t<e.length;)s=101*s+e.charCodeAt(t++)>>>0;return"go"+s})(m));if(!d[p]){let t=m!==e?e:(e=>{let t,s,a=[{}];for(;t=l.exec(e.replace(n,""));)t[4]?a.shift():t[3]?(s=t[3].replace(c," ").trim(),a.unshift(a[0][s]=a[0][s]||{})):a[0][t[1]]=t[2].replace(c," ").trim();return a[0]})(e);d[p]=o(r?{["@keyframes "+p]:t}:t,s?"":"."+p)}let h=s&&d.g?d.g:null;return s&&(d.g=d[p]),i=d[p],h?t.data=t.data.replace(h,i):-1===t.data.indexOf(i)&&(t.data=a?i+t.data:t.data+i),p})(r.unshift?r.raw?(t=[].slice.call(arguments,1),s=a.p,r.reduce((e,a,r)=>{let i=t[r];if(i&&i.call){let e=i(s),t=e&&e.props&&e.props.className||/^go/.test(e)&&e;i=t?"."+t:e&&"object"==typeof e?e.props?"":o(e,""):!1===e?"":e}return e+a+(null==i?"":i)},"")):r.reduce((e,t)=>Object.assign(e,t&&t.call?t(a.p):t),{}):r,(e=>{if("object"==typeof window){let t=(e?e.querySelector("#_goober"):window._goober)||Object.assign(document.createElement("style"),{innerHTML:" ",id:"_goober"});return t.nonce=window.__nonce__,t.parentNode||(e||document.head).appendChild(t),t.firstChild}return e||i})(a.target),a.g,a.o,a.k)}m.bind({g:1});let p,h,u,f=m.bind({k:1});function g(e,t){let s=this||{};return function(){let a=arguments;function r(i,l){let n=Object.assign({},i),c=n.className||r.className;s.p=Object.assign({theme:h&&h()},n),s.o=/ *go\d+/.test(c),n.className=m.apply(s,a)+(c?" "+c:""),t&&(n.ref=l);let o=e;return e[0]&&(o=n.as||e,delete n.as),u&&o[0]&&u(n),p(o,n)}return t?t(r):r}}var b=(e,t)=>"function"==typeof e?e(t):e,y=(t=0,()=>(++t).toString()),j=()=>{if(void 0===s&&"u">typeof window){let e=matchMedia("(prefers-reduced-motion: reduce)");s=!e||e.matches}return s},N="default",v=(e,t)=>{let{toastLimit:s}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,s)};case 1:return{...e,toasts:e.toasts.map(e=>e.id===t.toast.id?{...e,...t.toast}:e)};case 2:let{toast:a}=t;return v(e,{type:+!!e.toasts.find(e=>e.id===a.id),toast:a});case 3:let{toastId:r}=t;return{...e,toasts:e.toasts.map(e=>e.id===r||void 0===r?{...e,dismissed:!0,visible:!1}:e)};case 4:return void 0===t.toastId?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let i=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+i}))}}},w=[],C={toasts:[],pausedAt:void 0,settings:{toastLimit:20}},E={},$=(e,t=N)=>{E[t]=v(E[t]||C,e),w.forEach(([e,s])=>{e===t&&s(E[t])})},A=e=>Object.keys(E).forEach(t=>$(e,t)),k=(e=N)=>t=>{$(t,e)},P=e=>(t,s)=>{let a,r=((e,t="blank",s)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...s,id:(null==s?void 0:s.id)||y()}))(t,e,s);return k(r.toasterId||(a=r.id,Object.keys(E).find(e=>E[e].toasts.some(e=>e.id===a))))({type:2,toast:r}),r.id},U=(e,t)=>P("blank")(e,t);U.error=P("error"),U.success=P("success"),U.loading=P("loading"),U.custom=P("custom"),U.dismiss=(e,t)=>{let s={type:3,toastId:e};t?k(t)(s):A(s)},U.dismissAll=e=>U.dismiss(void 0,e),U.remove=(e,t)=>{let s={type:4,toastId:e};t?k(t)(s):A(s)},U.removeAll=e=>U.remove(void 0,e),U.promise=(e,t,s)=>{let a=U.loading(t.loading,{...s,...null==s?void 0:s.loading});return"function"==typeof e&&(e=e()),e.then(e=>{let r=t.success?b(t.success,e):void 0;return r?U.success(r,{id:a,...s,...null==s?void 0:s.success}):U.dismiss(a),e}).catch(e=>{let r=t.error?b(t.error,e):void 0;r?U.error(r,{id:a,...s,...null==s?void 0:s.error}):U.dismiss(a)}),e};var S=f`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,M=f`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,F=f`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,B=g("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${S} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${M} 0.15s ease-out forwards;
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
    animation: ${F} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,z=f`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,D=g("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${z} 1s linear infinite;
`,L=f`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,O=f`
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
}`,T=g("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${L} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${O} 0.2s ease-out forwards;
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
`,I=g("div")`
  position: absolute;
`,R=g("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,q=f`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,_=g("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${q} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,Q=({toast:e})=>{let{icon:t,type:s,iconTheme:a}=e;return void 0!==t?"string"==typeof t?r.createElement(_,null,t):t:"blank"===s?null:r.createElement(R,null,r.createElement(D,{...a}),"loading"!==s&&r.createElement(I,null,"error"===s?r.createElement(B,{...a}):r.createElement(T,{...a})))},H=g("div")`
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
`,V=g("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`;r.memo(({toast:e,position:t,style:s,children:a})=>{let i=e.height?((e,t)=>{let s=e.includes("top")?1:-1,[a,r]=j()?["0%{opacity:0;} 100%{opacity:1;}","0%{opacity:1;} 100%{opacity:0;}"]:[`
0% {transform: translate3d(0,${-200*s}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${-150*s}%,-1px) scale(.6); opacity:0;}
`];return{animation:t?`${f(a)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${f(r)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}})(e.position||t||"top-center",e.visible):{opacity:0},l=r.createElement(Q,{toast:e}),n=r.createElement(V,{...e.ariaProps},b(e.message,e));return r.createElement(H,{className:e.className,style:{...i,...s,...e.style}},"function"==typeof a?a({icon:l,message:n}):r.createElement(r.Fragment,null,l,n))}),a=r.createElement,o.p=void 0,p=a,h=void 0,u=void 0,m`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,e.s(["default",()=>U,"toast",()=>U],88368)},84099,e=>{"use strict";var t=e.i(52621),s=e.i(82078),a=e.i(20976),r=e.i(2188),i=e.i(31278);function l({children:e,requireAuth:l=!0}){let{user:n,loading:c}=(0,r.useAuth)(),o=(0,a.useRouter)();return((0,s.useEffect)(()=>{c||(l&&!n?o.push("/login"):!l&&n&&o.push("/dashboard"))},[n,c,l,o]),c)?(0,t.jsx)("div",{className:"min-h-screen bg-slate-950 flex items-center justify-center",children:(0,t.jsxs)("div",{className:"text-center",children:[(0,t.jsx)(i.Loader2,{className:"h-12 w-12 text-amber-400 animate-spin mx-auto mb-4"}),(0,t.jsx)("p",{className:"text-slate-400 text-sm",children:"Loading..."})]})}):l&&!n||!l&&n?null:(0,t.jsx)(t.Fragment,{children:e})}e.s(["AuthGate",()=>l])},43553,e=>{"use strict";let t=(0,e.i(75254).default)("crown",[["path",{d:"M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z",key:"1vdc57"}],["path",{d:"M5 21h14",key:"11awu3"}]]);e.s(["Crown",()=>t],43553)},43531,e=>{"use strict";let t=(0,e.i(75254).default)("check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]);e.s(["Check",()=>t],43531)},70273,e=>{"use strict";let t=(0,e.i(75254).default)("star",[["path",{d:"M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z",key:"r04s7s"}]]);e.s(["Star",()=>t],70273)},94152,e=>{"use strict";var t=e.i(52621),s=e.i(43553),a=e.i(43531),r=e.i(70273);let i=(0,e.i(75254).default)("zap",[["path",{d:"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",key:"1xq2db"}]]);var l=e.i(65131),n=e.i(38957),c=e.i(88368),o=e.i(82078);function d({tier:e,isPopular:d,isCurrentPlan:x}){let{upgradeToTier:m,tier:p,quotaExceeded:h}=(0,l.useSubscription)(),{formatAmount:u}=(0,n.useCurrency)(),[f,g]=(0,o.useState)(!1),b={free:{primary:"#6b7280",secondary:"#4b5563",accent:"#9ca3af",border:"#6b7280",bg:"border-[var(--theme-accent)] bg-[var(--theme-secondary)]/10",iconBg:"bg-[var(--theme-primary)]/20 text-[var(--theme-accent)]",button:"bg-[var(--theme-primary)] hover:bg-[var(--theme-secondary)] text-slate-200"},pro:{primary:"#7c3aed",secondary:"#6d28d9",accent:"#a855f7",border:"#6d28d9",bg:"border-[var(--theme-accent)] bg-[var(--theme-secondary)]/10",iconBg:"bg-[var(--theme-primary)]/20 text-[var(--theme-accent)]",button:"bg-[var(--theme-accent)] hover:bg-[var(--theme-primary)] text-white"},enterprise:{primary:"#059669",secondary:"#047857",accent:"#10b981",border:"#047857",bg:"border-[var(--theme-accent)] bg-[var(--theme-secondary)]/10",iconBg:"bg-[var(--theme-primary)]/20 text-[var(--theme-accent)]",button:"bg-[var(--theme-accent)] hover:bg-[var(--theme-primary)] text-slate-900"}}[e],y=e=>({free:0,pro:1,enterprise:2})[e],j=y(e)>y(p),N=y(e)<y(p),v=async()=>{if(console.log("🔍 UPGRADE DEBUG:",{isCurrentPlan:x,isUpgrading:f,quotaExceeded:h,tier:e,currentTier:p}),x||f)console.log("❌ Upgrade blocked:",{isCurrentPlan:!!x&&"Already on this plan",isUpgrading:!!f&&"Already upgrading",quotaExceeded:!!h&&"Quota exceeded"});else{console.log("✅ Upgrade conditions met, proceeding..."),g(!0);try{console.log(`🚀 Attempting to ${j?"upgrade":N?"downgrade":"change"} to ${e}`),console.log("Calling upgradeToTier with tier:",e),await m(e),console.log(`✅ Successfully ${j?"upgraded":N?"downgraded":"changed"} to ${e}`),c.default.success(`Successfully ${j?"upgraded":N?"downgraded":"changed"} to ${"free"===e?"Essential":"pro"===e?"Professional":"Enterprise"} plan!`)}catch(t){console.error(`❌ Failed to ${j?"upgrade":N?"downgrade":"change"} to ${e}:`,t),t instanceof Error&&("QuotaExceededError"===t.name||t.message?.toLowerCase().includes("quota exceeded"))?c.default.error("Firebase quota exceeded. Subscription changes are temporarily unavailable. Please try again later."):c.default.error(`Failed to ${j?"upgrade":N?"downgrade":"change"} to ${"free"===e?"Essential":"pro"===e?"Professional":"Enterprise"} plan. Please try again.`)}finally{g(!1)}}},w=(e=>{switch(e){case"free":default:return{price:0,period:"forever",displayName:"Essential"};case"pro":return{price:4.99,period:"per month",displayName:"Professional"};case"enterprise":return{price:9.99,period:"per month",displayName:"Enterprise"}}})(e);return(0,t.jsxs)("div",{className:`relative p-6 sm:p-8 rounded-lg border backdrop-blur-sm transition-all duration-300 hover:shadow-lg ${b.bg}`,children:[d&&(0,t.jsx)("div",{className:"absolute -top-3 left-1/2 transform -translate-x-1/2",children:(0,t.jsxs)("div",{className:"bg-amber-500 text-slate-900 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1",children:[(0,t.jsx)(s.Crown,{className:"h-3 w-3"}),"MOST POPULAR"]})}),x&&(0,t.jsx)("div",{className:"absolute -top-3 left-1/2 transform -translate-x-1/2",children:(0,t.jsxs)("div",{className:"bg-green-500 text-slate-900 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1",children:[(0,t.jsx)(a.Check,{className:"h-3 w-3"}),"CURRENT PLAN"]})}),(0,t.jsxs)("div",{className:"text-center mb-6",children:[(0,t.jsx)("div",{className:`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${b.iconBg}`,children:(e=>{switch(e){case"free":default:return(0,t.jsx)(r.Star,{className:"h-6 w-6"});case"pro":return(0,t.jsx)(i,{className:"h-6 w-6"});case"enterprise":return(0,t.jsx)(s.Crown,{className:"h-6 w-6"})}})(e)}),(0,t.jsx)("h3",{className:"text-xl sm:text-2xl font-serif font-bold text-slate-100 mb-2",children:w.displayName}),(0,t.jsxs)("div",{className:"mb-4",children:[(0,t.jsx)("span",{className:"text-3xl sm:text-4xl font-serif font-bold text-slate-100",children:0===w.price?"Free":u(w.price)}),w.price>0&&(0,t.jsx)("span",{className:"text-slate-400 text-sm ml-1",children:w.period})]})]}),(0,t.jsx)("ul",{className:"space-y-3 mb-8",children:({free:["Up to 2 cards","100 transactions per month","Basic categories","Mobile app access","Community support"],pro:["Up to 5 cards","Unlimited transactions","Custom categories","Enhanced analytics & insights","Data export (CSV & JSON)","Basic financial calendar","Email support","Multi-device sync"],enterprise:["Unlimited cards","Unlimited transactions","Advanced categories","Advanced analytics & insights","All export formats","Advanced financial calendar","Priority phone & email support","API access","Team collaboration","Custom integrations","Dedicated account manager"]})[e].map((e,s)=>(0,t.jsxs)("li",{className:"flex items-start gap-3",children:[(0,t.jsx)(a.Check,{className:"h-4 w-4 text-green-400 mt-0.5 shrink-0"}),(0,t.jsx)("span",{className:"text-slate-300 text-sm",children:e})]},s))}),(0,t.jsx)("button",{onClick:v,disabled:x||f||h,className:`w-full py-3 px-6 rounded-md font-semibold transition-all duration-200 ${x?"bg-slate-700 text-slate-400 cursor-not-allowed":h?"bg-red-600 text-slate-200 cursor-not-allowed":f?"bg-slate-600 text-slate-400 cursor-not-allowed":d?"bg-amber-500 hover:bg-amber-600 text-slate-900 shadow-lg hover:shadow-xl":b.button}`,children:x?"Current Plan":h?"Quota Exceeded":f?"Upgrading...":`${j?"Upgrade":N?"Downgrade":"Change"} to ${"free"===e?"Essential":"pro"===e?"Professional":"Enterprise"}`})]})}function x(){let{tier:e,quotaExceeded:s}=(0,l.useSubscription)();return(0,t.jsxs)("div",{className:"w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 mx-auto space-y-8 sm:space-y-10 md:space-y-12",children:[(0,t.jsxs)("div",{className:"text-center px-2 sm:px-4",children:[(0,t.jsx)("div",{className:"w-8 sm:w-12 md:w-16 h-0.5 bg-linear-to-r from-transparent via-amber-400 to-transparent mx-auto mb-3 sm:mb-4 md:mb-8"}),(0,t.jsx)("h1",{className:"text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-serif text-slate-100 mb-2 sm:mb-4 tracking-wide",children:"P R E M I U M   T I E R S"}),(0,t.jsx)("div",{className:"w-12 sm:w-16 md:w-24 h-0.5 bg-linear-to-r from-transparent via-amber-400 to-transparent mx-auto mb-3 sm:mb-4 md:mb-6"}),(0,t.jsx)("p",{className:"text-slate-400 text-xs sm:text-sm tracking-widest uppercase",children:"Choose Your Perfect Plan"}),s&&(0,t.jsxs)("div",{className:"mt-4 p-4 bg-red-900/20 border border-red-700 rounded-lg",children:[(0,t.jsxs)("div",{className:"flex items-center gap-2 text-red-400",children:[(0,t.jsx)("svg",{className:"w-5 h-5",fill:"currentColor",viewBox:"0 0 20 20",children:(0,t.jsx)("path",{fillRule:"evenodd",d:"M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z",clipRule:"evenodd"})}),(0,t.jsx)("span",{className:"font-semibold",children:"Firebase Quota Exceeded"})]}),(0,t.jsx)("p",{className:"text-red-300 text-sm mt-1",children:"Subscription changes are temporarily unavailable due to Firebase usage limits. Please try again later or consider upgrading your Firebase plan for higher limits."})]})]}),(0,t.jsxs)("div",{className:"bg-slate-900 rounded-lg p-4 sm:p-6 mb-8",children:[(0,t.jsx)("h2",{className:"text-xl sm:text-2xl font-serif text-slate-100 mb-6 text-center",children:"Feature Comparison"}),(0,t.jsx)("div",{className:"block md:hidden space-y-6",children:(0,t.jsx)("div",{className:"space-y-4",children:[{name:"Essential",tier:"free",price:"Free",color:"slate"},{name:"Professional",tier:"pro",price:"$4.99/mo",color:"violet"},{name:"Enterprise",tier:"enterprise",price:"$9.99/mo",color:"emerald"}].map(e=>(0,t.jsxs)("div",{className:"bg-slate-800 rounded-lg p-4 border border-slate-700",children:[(0,t.jsxs)("div",{className:"flex justify-between items-center mb-4",children:[(0,t.jsx)("h3",{className:`font-semibold text-${e.color}-400`,children:e.name}),(0,t.jsx)("span",{className:`text-sm text-${e.color}-300`,children:e.price})]}),(0,t.jsxs)("div",{className:"space-y-3",children:[(0,t.jsxs)("div",{className:"flex justify-between",children:[(0,t.jsx)("span",{className:"text-slate-300 text-sm",children:"Card Management"}),(0,t.jsx)("span",{className:`text-sm ${"free"===e.tier?"text-slate-400":"text-green-400"}`,children:"free"===e.tier?"Up to 2 cards":"pro"===e.tier?"Up to 5 cards":"Unlimited cards"})]}),(0,t.jsxs)("div",{className:"flex justify-between",children:[(0,t.jsx)("span",{className:"text-slate-300 text-sm",children:"Monthly Transactions"}),(0,t.jsx)("span",{className:`text-sm ${"free"===e.tier?"text-slate-400":"text-green-400"}`,children:"free"===e.tier?"100 transactions":"Unlimited"})]}),(0,t.jsxs)("div",{className:"flex justify-between",children:[(0,t.jsx)("span",{className:"text-slate-300 text-sm",children:"Category Management"}),(0,t.jsx)("span",{className:"text-sm text-green-400",children:"free"===e.tier?"Basic":"pro"===e.tier?"Custom":"Advanced"})]}),(0,t.jsxs)("div",{className:"flex justify-between",children:[(0,t.jsx)("span",{className:"text-slate-300 text-sm",children:"Analytics & Insights"}),(0,t.jsx)("span",{className:"text-sm text-green-400",children:"free"===e.tier?"Basic overview":"pro"===e.tier?"Enhanced":"Advanced"})]}),(0,t.jsxs)("div",{className:"flex justify-between",children:[(0,t.jsx)("span",{className:"text-slate-300 text-sm",children:"Data Export"}),(0,t.jsx)("span",{className:`text-sm ${"free"===e.tier?"text-red-400":"text-green-400"}`,children:"free"===e.tier?"✗":"pro"===e.tier?"CSV & JSON":"All formats"})]}),(0,t.jsxs)("div",{className:"flex justify-between",children:[(0,t.jsx)("span",{className:"text-slate-300 text-sm",children:"Financial Calendar"}),(0,t.jsx)("span",{className:`text-sm ${"free"===e.tier?"text-red-400":"text-green-400"}`,children:"free"===e.tier?"✗":"pro"===e.tier?"Basic view":"Advanced"})]}),(0,t.jsxs)("div",{className:"flex justify-between",children:[(0,t.jsx)("span",{className:"text-slate-300 text-sm",children:"Support"}),(0,t.jsx)("span",{className:"text-sm text-slate-400",children:"free"===e.tier?"Community":"pro"===e.tier?"Email":"Priority"})]})]})]},e.tier))})}),(0,t.jsx)("div",{className:"hidden md:block overflow-x-auto",children:(0,t.jsxs)("table",{className:"w-full text-sm",children:[(0,t.jsx)("thead",{children:(0,t.jsxs)("tr",{className:"border-b border-slate-700",children:[(0,t.jsx)("th",{className:"py-4 px-4 text-left text-slate-300 font-semibold",children:"Features"}),(0,t.jsxs)("th",{className:"py-4 px-4 text-center text-slate-300 font-semibold",children:[(0,t.jsx)("div",{children:"Essential"}),(0,t.jsx)("div",{className:"text-xs text-slate-500 mt-1",children:"Free"})]}),(0,t.jsxs)("th",{className:"py-4 px-4 text-center text-slate-300 font-semibold",children:[(0,t.jsx)("div",{children:"Professional"}),(0,t.jsx)("div",{className:"text-xs text-amber-400 mt-1",children:"$4.99/mo"})]}),(0,t.jsxs)("th",{className:"py-4 px-4 text-center text-slate-300 font-semibold",children:[(0,t.jsx)("div",{children:"Enterprise"}),(0,t.jsx)("div",{className:"text-xs text-slate-400 mt-1",children:"$9.99/mo"})]})]})}),(0,t.jsxs)("tbody",{children:[(0,t.jsxs)("tr",{children:[(0,t.jsx)("td",{className:"py-4 px-4 text-slate-300 font-medium",children:"Card Management"}),(0,t.jsx)("td",{className:"py-4 px-4 text-center text-slate-400",children:"Up to 2 cards"}),(0,t.jsx)("td",{className:"py-4 px-4 text-center text-green-400",children:"✓ Up to 5 cards"}),(0,t.jsx)("td",{className:"py-4 px-4 text-center text-green-400",children:"✓ Unlimited cards"})]}),(0,t.jsxs)("tr",{className:"bg-slate-800/50",children:[(0,t.jsx)("td",{className:"py-4 px-4 text-slate-300 font-medium",children:"Monthly Transactions"}),(0,t.jsx)("td",{className:"py-4 px-4 text-center text-slate-400",children:"100 transactions"}),(0,t.jsx)("td",{className:"py-4 px-4 text-center text-green-400",children:"✓ Unlimited"}),(0,t.jsx)("td",{className:"py-4 px-4 text-center text-green-400",children:"✓ Unlimited"})]}),(0,t.jsxs)("tr",{children:[(0,t.jsx)("td",{className:"py-4 px-4 text-slate-300 font-medium",children:"Category Management"}),(0,t.jsx)("td",{className:"py-4 px-4 text-center text-green-400",children:"✓ Basic categories"}),(0,t.jsx)("td",{className:"py-4 px-4 text-center text-green-400",children:"✓ Custom categories"}),(0,t.jsx)("td",{className:"py-4 px-4 text-center text-green-400",children:"✓ Advanced categories"})]}),(0,t.jsxs)("tr",{className:"bg-slate-800/50",children:[(0,t.jsx)("td",{className:"py-4 px-4 text-slate-300 font-medium",children:"Analytics & Insights"}),(0,t.jsx)("td",{className:"py-4 px-4 text-center text-green-400",children:"✓ Basic overview"}),(0,t.jsx)("td",{className:"py-4 px-4 text-center text-green-400",children:"✓ Enhanced analytics"}),(0,t.jsx)("td",{className:"py-4 px-4 text-center text-green-400",children:"✓ Advanced insights"})]}),(0,t.jsxs)("tr",{children:[(0,t.jsx)("td",{className:"py-4 px-4 text-slate-300 font-medium",children:"Data Export"}),(0,t.jsx)("td",{className:"py-4 px-4 text-center text-red-400",children:"✗"}),(0,t.jsx)("td",{className:"py-4 px-4 text-center text-green-400",children:"✓ CSV & JSON"}),(0,t.jsx)("td",{className:"py-4 px-4 text-center text-green-400",children:"✓ All formats"})]}),(0,t.jsxs)("tr",{className:"bg-slate-800/50",children:[(0,t.jsx)("td",{className:"py-4 px-4 text-slate-300 font-medium",children:"Financial Calendar"}),(0,t.jsx)("td",{className:"py-4 px-4 text-center text-red-400",children:"✗"}),(0,t.jsx)("td",{className:"py-4 px-4 text-center text-green-400",children:"✓ Basic view"}),(0,t.jsx)("td",{className:"py-4 px-4 text-center text-green-400",children:"✓ Advanced planning"})]}),(0,t.jsxs)("tr",{children:[(0,t.jsx)("td",{className:"py-4 px-4 text-slate-300 font-medium",children:"Multi-Currency"}),(0,t.jsx)("td",{className:"py-4 px-4 text-center text-slate-400",children:"USD only"}),(0,t.jsx)("td",{className:"py-4 px-4 text-center text-slate-400",children:"USD only"}),(0,t.jsx)("td",{className:"py-4 px-4 text-center text-slate-400",children:"USD only"})]}),(0,t.jsxs)("tr",{className:"bg-slate-800/50",children:[(0,t.jsx)("td",{className:"py-4 px-4 text-slate-300 font-medium",children:"Team Features"}),(0,t.jsx)("td",{className:"py-4 px-4 text-center text-red-400",children:"✗"}),(0,t.jsx)("td",{className:"py-4 px-4 text-center text-red-400",children:"✗"}),(0,t.jsx)("td",{className:"py-4 px-4 text-center text-slate-400",children:"🚧 Coming soon"})]}),(0,t.jsxs)("tr",{children:[(0,t.jsx)("td",{className:"py-4 px-4 text-slate-300 font-medium",children:"API Access"}),(0,t.jsx)("td",{className:"py-4 px-4 text-center text-red-400",children:"✗"}),(0,t.jsx)("td",{className:"py-4 px-4 text-center text-red-400",children:"✗"}),(0,t.jsx)("td",{className:"py-4 px-4 text-center text-slate-400",children:"🚧 Coming soon"})]}),(0,t.jsxs)("tr",{className:"bg-slate-800/50",children:[(0,t.jsx)("td",{className:"py-4 px-4 text-slate-300 font-medium",children:"Support"}),(0,t.jsx)("td",{className:"py-4 px-4 text-center text-slate-400",children:"Community"}),(0,t.jsx)("td",{className:"py-4 px-4 text-center text-slate-400",children:"Email support"}),(0,t.jsx)("td",{className:"py-4 px-4 text-center text-slate-400",children:"Priority support"})]})]})]})})]}),(0,t.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-8",children:[(0,t.jsx)(d,{tier:"free",isCurrentPlan:"free"===e}),(0,t.jsx)(d,{tier:"pro",isPopular:!0,isCurrentPlan:"pro"===e}),(0,t.jsx)(d,{tier:"enterprise",isCurrentPlan:"enterprise"===e})]}),(0,t.jsxs)("div",{className:"text-center pt-6 sm:pt-8 md:pt-12 border-t border-slate-800 px-2 sm:px-4",children:[(0,t.jsx)("h3",{className:"text-lg sm:text-xl font-serif text-slate-100 mb-4",children:"Frequently Asked Questions"}),(0,t.jsxs)("div",{className:"space-y-4 text-left max-w-2xl mx-auto",children:[(0,t.jsxs)("div",{children:[(0,t.jsx)("h4",{className:"font-semibold text-slate-200 mb-2",children:"Can I change plans anytime?"}),(0,t.jsx)("p",{className:"text-slate-400 text-sm",children:"Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately."})]}),(0,t.jsxs)("div",{children:[(0,t.jsx)("h4",{className:"font-semibold text-slate-200 mb-2",children:"Is there a free trial?"}),(0,t.jsx)("p",{className:"text-slate-400 text-sm",children:"All plans come with a 14-day free trial. No credit card required to start."})]}),(0,t.jsxs)("div",{children:[(0,t.jsx)("h4",{className:"font-semibold text-slate-200 mb-2",children:"What payment methods do you accept?"}),(0,t.jsx)("p",{className:"text-slate-400 text-sm",children:"We accept all major credit cards, PayPal, and bank transfers for Enterprise plans."})]})]})]})]})}e.s(["SubscriptionPlans",()=>x],94152)}]);