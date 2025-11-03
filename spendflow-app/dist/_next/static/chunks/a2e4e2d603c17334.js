(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,88368,e=>{"use strict";let t,s;var r,a=e.i(82078);let i={data:""},o=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,n=/\/\*[^]*?\*\/|  +/g,l=/\n+/g,c=(e,t)=>{let s="",r="",a="";for(let i in e){let o=e[i];"@"==i[0]?"i"==i[1]?s=i+" "+o+";":r+="f"==i[1]?c(o,i):i+"{"+c(o,"k"==i[1]?"":t)+"}":"object"==typeof o?r+=c(o,t?t.replace(/([^,])+/g,e=>i.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,t=>/&/.test(t)?t.replace(/&/g,e):e?e+" "+t:t)):i):null!=o&&(i=/^--/.test(i)?i:i.replace(/[A-Z]/g,"-$&").toLowerCase(),a+=c.p?c.p(i,o):i+":"+o+";")}return s+(t&&a?t+"{"+a+"}":a)+r},d={},m=e=>{if("object"==typeof e){let t="";for(let s in e)t+=s+m(e[s]);return t}return e};function p(e){let t,s,r=this||{},a=e.call?e(r.p):e;return((e,t,s,r,a)=>{var i;let p=m(e),u=d[p]||(d[p]=(e=>{let t=0,s=11;for(;t<e.length;)s=101*s+e.charCodeAt(t++)>>>0;return"go"+s})(p));if(!d[u]){let t=p!==e?e:(e=>{let t,s,r=[{}];for(;t=o.exec(e.replace(n,""));)t[4]?r.shift():t[3]?(s=t[3].replace(l," ").trim(),r.unshift(r[0][s]=r[0][s]||{})):r[0][t[1]]=t[2].replace(l," ").trim();return r[0]})(e);d[u]=c(a?{["@keyframes "+u]:t}:t,s?"":"."+u)}let x=s&&d.g?d.g:null;return s&&(d.g=d[u]),i=d[u],x?t.data=t.data.replace(x,i):-1===t.data.indexOf(i)&&(t.data=r?i+t.data:t.data+i),u})(a.unshift?a.raw?(t=[].slice.call(arguments,1),s=r.p,a.reduce((e,r,a)=>{let i=t[a];if(i&&i.call){let e=i(s),t=e&&e.props&&e.props.className||/^go/.test(e)&&e;i=t?"."+t:e&&"object"==typeof e?e.props?"":c(e,""):!1===e?"":e}return e+r+(null==i?"":i)},"")):a.reduce((e,t)=>Object.assign(e,t&&t.call?t(r.p):t),{}):a,(e=>{if("object"==typeof window){let t=(e?e.querySelector("#_goober"):window._goober)||Object.assign(document.createElement("style"),{innerHTML:" ",id:"_goober"});return t.nonce=window.__nonce__,t.parentNode||(e||document.head).appendChild(t),t.firstChild}return e||i})(r.target),r.g,r.o,r.k)}p.bind({g:1});let u,x,f,b=p.bind({k:1});function g(e,t){let s=this||{};return function(){let r=arguments;function a(i,o){let n=Object.assign({},i),l=n.className||a.className;s.p=Object.assign({theme:x&&x()},n),s.o=/ *go\d+/.test(l),n.className=p.apply(s,r)+(l?" "+l:""),t&&(n.ref=o);let c=e;return e[0]&&(c=n.as||e,delete n.as),f&&c[0]&&f(n),u(c,n)}return t?t(a):a}}var h=(e,t)=>"function"==typeof e?e(t):e,y=(t=0,()=>(++t).toString()),v=()=>{if(void 0===s&&"u">typeof window){let e=matchMedia("(prefers-reduced-motion: reduce)");s=!e||e.matches}return s},w="default",j=(e,t)=>{let{toastLimit:s}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,s)};case 1:return{...e,toasts:e.toasts.map(e=>e.id===t.toast.id?{...e,...t.toast}:e)};case 2:let{toast:r}=t;return j(e,{type:+!!e.toasts.find(e=>e.id===r.id),toast:r});case 3:let{toastId:a}=t;return{...e,toasts:e.toasts.map(e=>e.id===a||void 0===a?{...e,dismissed:!0,visible:!1}:e)};case 4:return void 0===t.toastId?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let i=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+i}))}}},N=[],k={toasts:[],pausedAt:void 0,settings:{toastLimit:20}},C={},E=(e,t=w)=>{C[t]=j(C[t]||k,e),N.forEach(([e,s])=>{e===t&&s(C[t])})},$=e=>Object.keys(C).forEach(t=>E(e,t)),A=(e=w)=>t=>{E(t,e)},I=e=>(t,s)=>{let r,a=((e,t="blank",s)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...s,id:(null==s?void 0:s.id)||y()}))(t,e,s);return A(a.toasterId||(r=a.id,Object.keys(C).find(e=>C[e].toasts.some(e=>e.id===r))))({type:2,toast:a}),a.id},O=(e,t)=>I("blank")(e,t);O.error=I("error"),O.success=I("success"),O.loading=I("loading"),O.custom=I("custom"),O.dismiss=(e,t)=>{let s={type:3,toastId:e};t?A(t)(s):$(s)},O.dismissAll=e=>O.dismiss(void 0,e),O.remove=(e,t)=>{let s={type:4,toastId:e};t?A(t)(s):$(s)},O.removeAll=e=>O.remove(void 0,e),O.promise=(e,t,s)=>{let r=O.loading(t.loading,{...s,...null==s?void 0:s.loading});return"function"==typeof e&&(e=e()),e.then(e=>{let a=t.success?h(t.success,e):void 0;return a?O.success(a,{id:r,...s,...null==s?void 0:s.success}):O.dismiss(r),e}).catch(e=>{let a=t.error?h(t.error,e):void 0;a?O.error(a,{id:r,...s,...null==s?void 0:s.error}):O.dismiss(r)}),e};var S=b`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,T=b`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,z=b`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,L=g("div")`
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
    animation: ${T} 0.15s ease-out forwards;
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
    animation: ${z} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,P=b`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,R=g("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${P} 1s linear infinite;
`,U=b`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,_=b`
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
}`,B=g("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${U} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${_} 0.2s ease-out forwards;
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
`,F=g("div")`
  position: absolute;
`,D=g("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,M=b`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,q=g("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${M} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,H=({toast:e})=>{let{icon:t,type:s,iconTheme:r}=e;return void 0!==t?"string"==typeof t?a.createElement(q,null,t):t:"blank"===s?null:a.createElement(D,null,a.createElement(R,{...r}),"loading"!==s&&a.createElement(F,null,"error"===s?a.createElement(L,{...r}):a.createElement(B,{...r})))},K=g("div")`
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
`,Y=g("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`;a.memo(({toast:e,position:t,style:s,children:r})=>{let i=e.height?((e,t)=>{let s=e.includes("top")?1:-1,[r,a]=v()?["0%{opacity:0;} 100%{opacity:1;}","0%{opacity:1;} 100%{opacity:0;}"]:[`
0% {transform: translate3d(0,${-200*s}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${-150*s}%,-1px) scale(.6); opacity:0;}
`];return{animation:t?`${b(r)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${b(a)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}})(e.position||t||"top-center",e.visible):{opacity:0},o=a.createElement(H,{toast:e}),n=a.createElement(Y,{...e.ariaProps},h(e.message,e));return a.createElement(K,{className:e.className,style:{...i,...s,...e.style}},"function"==typeof r?r({icon:o,message:n}):a.createElement(a.Fragment,null,o,n))}),r=a.createElement,c.p=void 0,u=r,x=void 0,f=void 0,p`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,e.s(["default",()=>O,"toast",()=>O],88368)},52245,e=>{"use strict";var t=e.i(52621),s=e.i(82078),r=e.i(2188),a=e.i(20976),i=e.i(38957),o=e.i(25652),n=e.i(7233),l=e.i(61659),c=e.i(30945),d=e.i(71589),m=e.i(84099),p=e.i(73755),u=e.i(88368);function x(){let{user:e}=(0,r.useAuth)(),m=(0,a.useRouter)(),{formatAmount:x}=(0,i.useCurrency)(),{canAddTransaction:f}=(0,p.useAccessControl)(),[b,g]=(0,s.useState)([]),[h,y]=(0,s.useState)(!0),[v,w]=(0,s.useState)(!1),[j,N]=(0,s.useState)(!1),[k,C]=(0,s.useState)(!1);(0,s.useEffect)(()=>{if(!e)return;E(),$();let t=()=>{$()};return window.addEventListener("focus",t),()=>{window.removeEventListener("focus",t)}},[e]);let E=async()=>{try{y(!0);let t=await c.transactionsService.getRecentByUserId(e.uid,100);g(t.filter(e=>"income"===e.type))}catch(e){console.error("Error loading income:",e)}finally{y(!1)}},$=async()=>{try{let t=await c.cardsService.getByUserId(e.uid);N(t.length>0)}catch(e){console.error("Error checking cards:",e)}},A=async()=>{if(e)try{let t=await c.cardsService.getByUserId(e.uid);if(0===t.length)return void C(!0);let s=await f();if(!s.allowed)return void(s.upgradeRequired?u.default.error(s.reason||"Upgrade your plan to add more transactions",{duration:5e3,style:{background:"#1e293b",color:"#f1f5f9",border:"1px solid #f59e0b"}}):u.default.error(s.reason||"Cannot add transaction at this time"));w(!0)}catch(e){console.error("Error checking cards or access:",e)}},I=b.reduce((e,t)=>e+t.amount,0);return h?(0,t.jsx)("div",{className:"flex items-center justify-center h-screen",children:(0,t.jsx)("div",{className:"text-amber-400 text-lg font-serif tracking-wider",children:"Loading..."})}):(0,t.jsxs)("div",{className:"w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 mx-auto space-y-6 sm:space-y-8 md:space-y-10 lg:space-y-12",children:[(0,t.jsx)(d.AddTransactionModal,{isOpen:v,onClose:()=>w(!1),onSuccess:()=>{E()},defaultType:"income"}),k&&(0,t.jsx)("div",{className:"fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4",children:(0,t.jsxs)("div",{className:"bg-slate-950 border border-amber-700/30 rounded-lg shadow-2xl max-w-md w-full p-6 sm:p-8 text-center",children:[(0,t.jsxs)("div",{className:"mb-6",children:[(0,t.jsx)("div",{className:"w-16 h-16 bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-4",children:(0,t.jsx)(l.CreditCard,{className:"h-8 w-8 text-amber-400"})}),(0,t.jsx)("h3",{className:"text-xl sm:text-2xl font-serif text-slate-100 mb-2 tracking-wide",children:"No Cards Found"}),(0,t.jsx)("p",{className:"text-slate-400 text-sm tracking-wide",children:"Please add a card first before adding income"})]}),(0,t.jsxs)("div",{className:"space-y-3",children:[(0,t.jsx)("button",{onClick:()=>{C(!1),m.push("/cards")},className:"w-full px-6 py-3 border border-amber-600 text-amber-400 hover:bg-amber-600/10 transition-colors tracking-wider uppercase text-sm rounded-md touch-manipulation min-h-[44px]",children:"Add Card"}),(0,t.jsx)("button",{onClick:()=>C(!1),className:"w-full px-6 py-3 border border-slate-600 text-slate-400 hover:bg-slate-700 transition-colors tracking-wider uppercase text-sm rounded-md touch-manipulation min-h-[44px]",children:"Cancel"})]})]})}),(0,t.jsxs)("div",{className:"flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6",children:[(0,t.jsxs)("div",{className:"text-center sm:text-left",children:[(0,t.jsx)("div",{className:"w-8 sm:w-12 md:w-16 h-0.5 bg-linear-to-r from-transparent via-amber-400 to-transparent mx-auto sm:mx-0 mb-3 sm:mb-4 md:mb-6"}),(0,t.jsx)("h1",{className:"text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-serif text-slate-100 mb-1 sm:mb-2 tracking-wide",children:"I N C O M E"}),(0,t.jsx)("div",{className:"w-12 sm:w-16 md:w-20 h-0.5 bg-linear-to-r from-transparent via-amber-400 to-transparent mx-auto sm:mx-0 mb-3 sm:mb-4"}),(0,t.jsx)("p",{className:"text-slate-400 text-xs sm:text-sm tracking-widest uppercase",children:"Revenue Overview"})]}),(0,t.jsxs)("button",{onClick:A,className:"w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 border border-amber-600 text-amber-400 hover:bg-amber-600/10 transition-colors tracking-wider uppercase text-sm rounded-md touch-manipulation min-h-[44px]",children:[(0,t.jsx)(n.Plus,{className:"h-4 w-4 sm:h-5 sm:w-5"}),"Add Income"]})]}),(0,t.jsx)("div",{className:"bg-linear-to-br from-amber-900/20 via-slate-900/50 to-slate-900/20 border border-amber-700/30 rounded-lg p-6 sm:p-8 md:p-10 lg:p-12 backdrop-blur-sm",children:(0,t.jsxs)("div",{className:"text-center",children:[(0,t.jsx)("div",{className:"text-amber-400/60 text-xs tracking-widest uppercase mb-3 sm:mb-4 font-serif",children:"Total Income"}),(0,t.jsx)("div",{className:"text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-slate-100 mb-2",children:x(I)}),(0,t.jsxs)("div",{className:"flex items-center justify-center gap-2 text-slate-500",children:[(0,t.jsx)(o.TrendingUp,{className:"h-4 w-4"}),(0,t.jsxs)("span",{className:"text-sm tracking-wider",children:[b.length," Transactions"]})]})]})}),(0,t.jsxs)("div",{children:[(0,t.jsxs)("div",{className:"flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8",children:[(0,t.jsx)("div",{className:"w-8 sm:w-12 h-0.5 bg-linear-to-r from-amber-600 to-transparent"}),(0,t.jsx)("h2",{className:"text-lg sm:text-xl md:text-2xl font-serif text-slate-100 tracking-wide",children:"Recent Income"})]}),b.length>0?(0,t.jsx)("div",{className:"space-y-2 sm:space-y-3",children:b.map(e=>(0,t.jsx)("div",{className:"border-b border-slate-800 py-4 sm:py-6 hover:bg-slate-900/30 transition-colors rounded-lg p-3 sm:p-4",children:(0,t.jsxs)("div",{className:"flex items-center justify-between",children:[(0,t.jsxs)("div",{className:"flex items-center gap-4 sm:gap-6 flex-1 min-w-0",children:[(0,t.jsx)("div",{className:"w-1 h-10 sm:h-12 bg-green-600 rounded-full"}),(0,t.jsxs)("div",{className:"flex-1 min-w-0",children:[(0,t.jsx)("div",{className:"text-slate-200 font-serif mb-1 text-sm sm:text-base truncate",children:e.description}),(0,t.jsx)("div",{className:"text-xs text-slate-600 tracking-wider uppercase",children:e.category})]})]}),(0,t.jsx)("div",{className:"flex items-center gap-2 sm:gap-4 shrink-0",children:(0,t.jsxs)("div",{className:"text-lg sm:text-xl font-serif text-green-400",children:["+",x(e.amount)]})})]})},e.id))}):(0,t.jsxs)("div",{className:"text-center py-12 sm:py-16 md:py-20 border border-slate-800 bg-slate-900/30 rounded-lg",children:[(0,t.jsx)("div",{className:"text-slate-500 mb-4 text-lg font-serif",children:"No income recorded"}),(0,t.jsx)("p",{className:"text-slate-600 text-sm tracking-wide",children:"Your income tracking will appear here"})]})]})]})}function f(){return(0,t.jsx)(m.AuthGate,{children:(0,t.jsx)(x,{})})}e.s(["default",()=>f])},94307,e=>{e.v(t=>Promise.all(["static/chunks/1e15f79587615e6b.js"].map(t=>e.l(t))).then(()=>t(46074)))},76860,e=>{e.v(e=>Promise.resolve().then(()=>e(30945)))}]);