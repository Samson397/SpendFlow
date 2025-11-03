(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,88368,e=>{"use strict";let t,r;var a,s=e.i(82078);let o={data:""},i=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,n=/\/\*[^]*?\*\/|  +/g,l=/\n+/g,c=(e,t)=>{let r="",a="",s="";for(let o in e){let i=e[o];"@"==o[0]?"i"==o[1]?r=o+" "+i+";":a+="f"==o[1]?c(i,o):o+"{"+c(i,"k"==o[1]?"":t)+"}":"object"==typeof i?a+=c(i,t?t.replace(/([^,])+/g,e=>o.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,t=>/&/.test(t)?t.replace(/&/g,e):e?e+" "+t:t)):o):null!=i&&(o=/^--/.test(o)?o:o.replace(/[A-Z]/g,"-$&").toLowerCase(),s+=c.p?c.p(o,i):o+":"+i+";")}return r+(t&&s?t+"{"+s+"}":s)+a},d={},m=e=>{if("object"==typeof e){let t="";for(let r in e)t+=r+m(e[r]);return t}return e};function u(e){let t,r,a=this||{},s=e.call?e(a.p):e;return((e,t,r,a,s)=>{var o;let u=m(e),p=d[u]||(d[u]=(e=>{let t=0,r=11;for(;t<e.length;)r=101*r+e.charCodeAt(t++)>>>0;return"go"+r})(u));if(!d[p]){let t=u!==e?e:(e=>{let t,r,a=[{}];for(;t=i.exec(e.replace(n,""));)t[4]?a.shift():t[3]?(r=t[3].replace(l," ").trim(),a.unshift(a[0][r]=a[0][r]||{})):a[0][t[1]]=t[2].replace(l," ").trim();return a[0]})(e);d[p]=c(s?{["@keyframes "+p]:t}:t,r?"":"."+p)}let x=r&&d.g?d.g:null;return r&&(d.g=d[p]),o=d[p],x?t.data=t.data.replace(x,o):-1===t.data.indexOf(o)&&(t.data=a?o+t.data:t.data+o),p})(s.unshift?s.raw?(t=[].slice.call(arguments,1),r=a.p,s.reduce((e,a,s)=>{let o=t[s];if(o&&o.call){let e=o(r),t=e&&e.props&&e.props.className||/^go/.test(e)&&e;o=t?"."+t:e&&"object"==typeof e?e.props?"":c(e,""):!1===e?"":e}return e+a+(null==o?"":o)},"")):s.reduce((e,t)=>Object.assign(e,t&&t.call?t(a.p):t),{}):s,(e=>{if("object"==typeof window){let t=(e?e.querySelector("#_goober"):window._goober)||Object.assign(document.createElement("style"),{innerHTML:" ",id:"_goober"});return t.nonce=window.__nonce__,t.parentNode||(e||document.head).appendChild(t),t.firstChild}return e||o})(a.target),a.g,a.o,a.k)}u.bind({g:1});let p,x,g,f=u.bind({k:1});function h(e,t){let r=this||{};return function(){let a=arguments;function s(o,i){let n=Object.assign({},o),l=n.className||s.className;r.p=Object.assign({theme:x&&x()},n),r.o=/ *go\d+/.test(l),n.className=u.apply(r,a)+(l?" "+l:""),t&&(n.ref=i);let c=e;return e[0]&&(c=n.as||e,delete n.as),g&&c[0]&&g(n),p(c,n)}return t?t(s):s}}var b=(e,t)=>"function"==typeof e?e(t):e,y=(t=0,()=>(++t).toString()),v=()=>{if(void 0===r&&"u">typeof window){let e=matchMedia("(prefers-reduced-motion: reduce)");r=!e||e.matches}return r},w="default",j=(e,t)=>{let{toastLimit:r}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,r)};case 1:return{...e,toasts:e.toasts.map(e=>e.id===t.toast.id?{...e,...t.toast}:e)};case 2:let{toast:a}=t;return j(e,{type:+!!e.toasts.find(e=>e.id===a.id),toast:a});case 3:let{toastId:s}=t;return{...e,toasts:e.toasts.map(e=>e.id===s||void 0===s?{...e,dismissed:!0,visible:!1}:e)};case 4:return void 0===t.toastId?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let o=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+o}))}}},N=[],C={toasts:[],pausedAt:void 0,settings:{toastLimit:20}},k={},E=(e,t=w)=>{k[t]=j(k[t]||C,e),N.forEach(([e,r])=>{e===t&&r(k[t])})},$=e=>Object.keys(k).forEach(t=>E(e,t)),A=(e=w)=>t=>{E(t,e)},S=e=>(t,r)=>{let a,s=((e,t="blank",r)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...r,id:(null==r?void 0:r.id)||y()}))(t,e,r);return A(s.toasterId||(a=s.id,Object.keys(k).find(e=>k[e].toasts.some(e=>e.id===a))))({type:2,toast:s}),s.id},F=(e,t)=>S("blank")(e,t);F.error=S("error"),F.success=S("success"),F.loading=S("loading"),F.custom=S("custom"),F.dismiss=(e,t)=>{let r={type:3,toastId:e};t?A(t)(r):$(r)},F.dismissAll=e=>F.dismiss(void 0,e),F.remove=(e,t)=>{let r={type:4,toastId:e};t?A(t)(r):$(r)},F.removeAll=e=>F.remove(void 0,e),F.promise=(e,t,r)=>{let a=F.loading(t.loading,{...r,...null==r?void 0:r.loading});return"function"==typeof e&&(e=e()),e.then(e=>{let s=t.success?b(t.success,e):void 0;return s?F.success(s,{id:a,...r,...null==r?void 0:r.success}):F.dismiss(a),e}).catch(e=>{let s=t.error?b(t.error,e):void 0;s?F.error(s,{id:a,...r,...null==r?void 0:r.error}):F.dismiss(a)}),e};var T=f`
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
}`,z=f`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,D=h("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${T} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
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
    animation: ${z} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,I=f`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,O=h("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${I} 1s linear infinite;
`,L=f`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,R=f`
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
}`,_=h("div")`
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
    animation: ${R} 0.2s ease-out forwards;
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
`,P=h("div")`
  position: absolute;
`,U=h("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,B=f`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,H=h("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${B} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,q=({toast:e})=>{let{icon:t,type:r,iconTheme:a}=e;return void 0!==t?"string"==typeof t?s.createElement(H,null,t):t:"blank"===r?null:s.createElement(U,null,s.createElement(O,{...a}),"loading"!==r&&s.createElement(P,null,"error"===r?s.createElement(D,{...a}):s.createElement(_,{...a})))},G=h("div")`
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
`,Y=h("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`;s.memo(({toast:e,position:t,style:r,children:a})=>{let o=e.height?((e,t)=>{let r=e.includes("top")?1:-1,[a,s]=v()?["0%{opacity:0;} 100%{opacity:1;}","0%{opacity:1;} 100%{opacity:0;}"]:[`
0% {transform: translate3d(0,${-200*r}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${-150*r}%,-1px) scale(.6); opacity:0;}
`];return{animation:t?`${f(a)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${f(s)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}})(e.position||t||"top-center",e.visible):{opacity:0},i=s.createElement(q,{toast:e}),n=s.createElement(Y,{...e.ariaProps},b(e.message,e));return s.createElement(G,{className:e.className,style:{...o,...r,...e.style}},"function"==typeof a?a({icon:i,message:n}):s.createElement(s.Fragment,null,i,n))}),a=s.createElement,c.p=void 0,p=a,x=void 0,g=void 0,u`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,e.s(["default",()=>F,"toast",()=>F],88368)},27612,e=>{"use strict";let t=(0,e.i(75254).default)("trash-2",[["path",{d:"M10 11v6",key:"nco0om"}],["path",{d:"M14 11v6",key:"outv1u"}],["path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",key:"miytrc"}],["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",key:"e791ji"}]]);e.s(["Trash2",()=>t],27612)},92930,e=>{"use strict";let t=(0,e.i(75254).default)("pen",[["path",{d:"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",key:"1a8usu"}]]);e.s(["Edit2",()=>t],92930)},84099,e=>{"use strict";var t=e.i(52621),r=e.i(82078),a=e.i(20976),s=e.i(2188),o=e.i(31278);function i({children:e,requireAuth:i=!0}){let{user:n,loading:l}=(0,s.useAuth)(),c=(0,a.useRouter)();return((0,r.useEffect)(()=>{l||(i&&!n?c.push("/login"):!i&&n&&c.push("/dashboard"))},[n,l,i,c]),l)?(0,t.jsx)("div",{className:"min-h-screen bg-slate-950 flex items-center justify-center",children:(0,t.jsxs)("div",{className:"text-center",children:[(0,t.jsx)(o.Loader2,{className:"h-12 w-12 text-amber-400 animate-spin mx-auto mb-4"}),(0,t.jsx)("p",{className:"text-slate-400 text-sm",children:"Loading..."})]})}):i&&!n||!i&&n?null:(0,t.jsx)(t.Fragment,{children:e})}e.s(["AuthGate",()=>i])},7233,e=>{"use strict";let t=(0,e.i(75254).default)("plus",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]]);e.s(["Plus",()=>t],7233)},15287,e=>{"use strict";e.i(75271);var t=e.i(5158),r=e.i(41195);class a{static instance;categoriesRef=(0,t.collection)(r.db,"categories");constructor(){}static getInstance(){return a.instance||(a.instance=new a),a.instance}async getUserCategories(e){try{let r=(0,t.query)(this.categoriesRef,(0,t.where)("userId","==",e)),a=await (0,t.getDocs)(r),s=[];return a.forEach(e=>{let t=e.data();s.push({id:e.id,name:t.name,color:t.color,icon:t.icon,type:t.type})}),s}catch(e){return console.error("Error getting user categories:",e),[]}}async createCategory(e,r){try{return(await (0,t.addDoc)(this.categoriesRef,{...r,userId:e,createdAt:t.Timestamp.now(),updatedAt:t.Timestamp.now()})).id}catch(e){throw console.error("Error creating category:",e),Error("Failed to create category")}}async updateCategory(e,r){try{let a=(0,t.doc)(this.categoriesRef,e);await (0,t.updateDoc)(a,{...r,updatedAt:t.Timestamp.now()})}catch(e){throw console.error("Error updating category:",e),Error("Failed to update category")}}async deleteCategory(e){try{let r=(0,t.doc)(this.categoriesRef,e);await (0,t.deleteDoc)(r)}catch(e){throw console.error("Error deleting category:",e),Error("Failed to delete category")}}getDefaultCategories(e){return({income:[{name:"Salary",color:"#10b981",icon:"💼",type:"income"},{name:"Freelance",color:"#3b82f6",icon:"💻",type:"income"},{name:"Investment",color:"#8b5cf6",icon:"📈",type:"income"},{name:"Gift",color:"#f59e0b",icon:"🎁",type:"income"},{name:"Other",color:"#6b7280",icon:"💰",type:"income"}],expense:[{name:"Food",color:"#ef4444",icon:"🍽️",type:"expense"},{name:"Transport",color:"#f97316",icon:"🚗",type:"expense"},{name:"Shopping",color:"#ec4899",icon:"🛍️",type:"expense"},{name:"Bills",color:"#6366f1",icon:"📄",type:"expense"},{name:"Entertainment",color:"#8b5cf6",icon:"🎬",type:"expense"},{name:"Healthcare",color:"#06b6d4",icon:"🏥",type:"expense"},{name:"Other",color:"#6b7280",icon:"📦",type:"expense"}]})[e]||[]}async getAllCategories(e,t){let r=await this.getUserCategories(e),a=this.getDefaultCategories(t||"expense"),s=t?r.filter(e=>e.type===t):r,o=a.map(e=>({id:"",...e}));return s.forEach(e=>{let t=o.findIndex(t=>t.name===e.name&&t.type===e.type);t>=0?o[t]=e:o.push(e)}),o}}let s=a.getInstance();e.s(["categoryService",0,s])},69490,e=>{"use strict";var t=e.i(52621),r=e.i(82078),a=e.i(2188),s=e.i(15287),o=e.i(84099),i=e.i(7233),n=e.i(92930),l=e.i(27612);let c=(0,e.i(75254).default)("tag",[["path",{d:"M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z",key:"vktsd0"}],["circle",{cx:"7.5",cy:"7.5",r:".5",fill:"currentColor",key:"kqv944"}]]);var d=e.i(88368);function m(){let{user:e}=(0,a.useAuth)(),[o,m]=(0,r.useState)([]),[p,x]=(0,r.useState)(!0),[g,f]=(0,r.useState)(!1),[h,b]=(0,r.useState)(null),[y,v]=(0,r.useState)("expense"),w=(0,r.useCallback)(async()=>{if(e)try{x(!0);let t=await s.categoryService.getAllCategories(e.uid,y);m(t)}catch(e){console.error("Error loading categories:",e),d.default.error("Failed to load categories")}finally{x(!1)}},[e,y]);(0,r.useEffect)(()=>{w()},[w]);let j=async t=>{if(e)try{await s.categoryService.createCategory(e.uid,{...t,type:y}),await w(),f(!1),d.default.success("Category created successfully")}catch(e){console.error("Error creating category:",e),d.default.error("Failed to create category")}},N=async e=>{if(h)try{await s.categoryService.updateCategory(h.id,e),await w(),b(null),d.default.success("Category updated successfully")}catch(e){console.error("Error updating category:",e),d.default.error("Failed to update category")}},C=async(e,t)=>{if(window.confirm(`Are you sure you want to delete "${t}"? This action cannot be undone.`))try{await s.categoryService.deleteCategory(e),await w(),d.default.success("Category deleted successfully")}catch(e){console.error("Error deleting category:",e),d.default.error("Failed to delete category")}};return(0,t.jsxs)("div",{className:"space-y-6 sm:space-y-8 md:space-y-12 px-2 sm:px-4 max-w-7xl mx-auto",children:[(0,t.jsxs)("div",{className:"text-center px-2 sm:px-4",children:[(0,t.jsx)("div",{className:"w-8 sm:w-12 md:w-16 h-0.5 bg-linear-to-r from-transparent via-amber-400 to-transparent mx-auto mb-3 sm:mb-4 md:mb-8"}),(0,t.jsx)("h1",{className:"text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-serif text-slate-100 mb-2 sm:mb-4 tracking-wide",children:"C A T E G O R I E S"}),(0,t.jsx)("div",{className:"w-12 sm:w-16 md:w-24 h-0.5 bg-linear-to-r from-transparent via-amber-400 to-transparent mx-auto mb-3 sm:mb-4 md:mb-6"}),(0,t.jsx)("p",{className:"text-slate-400 text-xs sm:text-sm tracking-widest uppercase",children:"Manage Your Transaction Categories"})]}),(0,t.jsx)("div",{className:"flex justify-center mb-8",children:(0,t.jsxs)("div",{className:"bg-slate-800/50 border border-slate-700 rounded-lg p-1",children:[(0,t.jsx)("button",{onClick:()=>v("expense"),className:`px-6 py-2 rounded-md text-sm font-medium transition-colors ${"expense"===y?"bg-amber-600 text-white":"text-slate-400 hover:text-slate-200"}`,children:"Expenses"}),(0,t.jsx)("button",{onClick:()=>v("income"),className:`px-6 py-2 rounded-md text-sm font-medium transition-colors ${"income"===y?"bg-green-600 text-white":"text-slate-400 hover:text-slate-200"}`,children:"Income"})]})}),(0,t.jsx)("div",{className:"flex justify-center mb-8",children:(0,t.jsxs)("button",{onClick:()=>f(!0),className:"flex items-center gap-2 px-6 py-3 border border-amber-600 text-amber-400 hover:bg-amber-600/10 transition-colors tracking-wider uppercase text-sm rounded-md",children:[(0,t.jsx)(i.Plus,{className:"h-5 w-5"}),"Add Custom Category"]})}),p?(0,t.jsx)("div",{className:"flex items-center justify-center h-64",children:(0,t.jsx)("div",{className:"text-amber-400 text-lg font-serif tracking-wider",children:"Loading..."})}):o.length>0?(0,t.jsx)("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6",children:o.map(e=>(0,t.jsxs)("div",{className:"bg-slate-900/50 border border-slate-800 rounded-lg p-6 hover:border-slate-700 transition-all group",children:[(0,t.jsxs)("div",{className:"flex items-start justify-between mb-4",children:[(0,t.jsxs)("div",{className:"flex items-center gap-3",children:[(0,t.jsx)("div",{className:"w-10 h-10 rounded-full flex items-center justify-center text-lg",style:{backgroundColor:`${e.color}20`,color:e.color},children:e.icon}),(0,t.jsxs)("div",{children:[(0,t.jsx)("h3",{className:"font-serif text-slate-100 text-lg",children:e.name}),(0,t.jsx)("p",{className:"text-slate-500 text-xs capitalize",children:e.type})]})]}),e.id&&(0,t.jsxs)("div",{className:"flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity",children:[(0,t.jsx)("button",{onClick:()=>b(e),className:"p-1 text-slate-400 hover:text-amber-400 transition-colors",title:"Edit category",children:(0,t.jsx)(n.Edit2,{className:"h-4 w-4"})}),(0,t.jsx)("button",{onClick:()=>C(e.id,e.name),className:"p-1 text-slate-400 hover:text-red-400 transition-colors",title:"Delete category",children:(0,t.jsx)(l.Trash2,{className:"h-4 w-4"})})]})]}),(0,t.jsx)("div",{className:"text-xs text-slate-500",children:"Default category"})]},e.id||e.name))}):(0,t.jsxs)("div",{className:"text-center py-12 sm:py-16 md:py-20 border border-slate-800 bg-slate-900/30 rounded-lg",children:[(0,t.jsx)("div",{className:"text-amber-400 mb-4",children:(0,t.jsx)(c,{className:"h-12 w-12 sm:h-16 sm:w-16 mx-auto"})}),(0,t.jsx)("h3",{className:"text-xl sm:text-2xl font-serif text-slate-100 mb-3",children:"No Categories Yet"}),(0,t.jsx)("p",{className:"text-slate-400 mb-6 sm:mb-8 text-sm sm:text-base tracking-wide px-4",children:"Start organizing your transactions with custom categories"}),(0,t.jsx)("button",{onClick:()=>f(!0),className:"px-6 py-3 border border-amber-600 text-amber-400 hover:bg-amber-600/10 transition-colors tracking-wider uppercase text-sm rounded-md",children:"Create Your First Category"})]}),(g||h)&&(0,t.jsx)(u,{category:h,type:y,onClose:()=>{f(!1),b(null)},onSave:h?N:j})]})}function u({category:e,type:a,onClose:s,onSave:o}){let[i,n]=(0,r.useState)({name:e?.name||"",color:e?.color||"#6366f1",icon:e?.icon||"📦"}),[l,c]=(0,r.useState)(!1),d=async e=>{if(e.preventDefault(),i.name.trim())try{c(!0),await o(i)}catch(e){}finally{c(!1)}};return(0,t.jsx)("div",{className:"fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4",children:(0,t.jsx)("div",{className:"bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full",children:(0,t.jsxs)("div",{className:"p-6",children:[(0,t.jsxs)("div",{className:"flex items-center justify-between mb-6",children:[(0,t.jsx)("h2",{className:"text-2xl font-serif text-slate-100",children:e?"Edit Category":"Create Category"}),(0,t.jsx)("button",{onClick:s,className:"p-2 hover:bg-slate-800 rounded-lg transition-colors",children:(0,t.jsx)("svg",{className:"w-6 h-6 text-slate-400",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:(0,t.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M6 18L18 6M6 6l12 12"})})})]}),(0,t.jsxs)("form",{onSubmit:d,className:"space-y-6",children:[(0,t.jsxs)("div",{children:[(0,t.jsx)("label",{htmlFor:"category-name",className:"block text-slate-400 text-sm font-medium mb-2",children:"Category Name"}),(0,t.jsx)("input",{id:"category-name",type:"text",value:i.name,onChange:e=>n({...i,name:e.target.value}),placeholder:"e.g., Travel, Subscriptions, etc.",className:"w-full px-4 py-3 bg-slate-800 border border-slate-700 text-slate-100 rounded-lg focus:border-amber-500 focus:outline-none transition-colors",required:!0})]}),(0,t.jsxs)("div",{children:[(0,t.jsx)("label",{className:"block text-slate-400 text-sm font-medium mb-3",children:"Color"}),(0,t.jsx)("div",{id:"category-color",className:"grid grid-cols-5 gap-3",children:["#ef4444","#f97316","#f59e0b","#eab308","#84cc16","#22c55e","#10b981","#06b6d4","#0ea5e9","#3b82f6","#6366f1","#8b5cf6","#a855f7","#d946ef","#ec4899"].map(e=>(0,t.jsx)("button",{type:"button",onClick:()=>n({...i,color:e}),className:`w-10 h-10 rounded-lg border-2 transition-all ${i.color===e?"border-white scale-110":"border-slate-600 hover:border-slate-400"}`,style:{backgroundColor:e}},e))})]}),(0,t.jsxs)("div",{children:[(0,t.jsx)("label",{className:"block text-slate-400 text-sm font-medium mb-3",children:"Icon"}),(0,t.jsx)("div",{id:"category-icon",className:"grid grid-cols-5 gap-3",children:("income"===a?["💼","💻","📈","🎁","💰","🏦","💡","🎯","🚀","⭐"]:["🍽️","🚗","🛍️","📄","🎬","🏥","📦","🏠","☕","🎵"]).map(e=>(0,t.jsx)("button",{type:"button",onClick:()=>n({...i,icon:e}),className:`w-12 h-12 rounded-lg border-2 transition-all flex items-center justify-center text-xl ${i.icon===e?"border-amber-500 bg-amber-500/10 scale-110":"border-slate-600 hover:border-slate-400"}`,children:e},e))})]}),(0,t.jsxs)("div",{className:"flex gap-4 pt-4",children:[(0,t.jsx)("button",{type:"button",onClick:s,className:"flex-1 px-6 py-3 border border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200 transition-colors rounded-lg",children:"Cancel"}),(0,t.jsx)("button",{type:"submit",disabled:l||!i.name.trim(),className:"flex-1 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed",children:l?"Saving...":e?"Update":"Create"})]})]})]})})})}function p(){return(0,t.jsx)(o.AuthGate,{children:(0,t.jsx)(m,{})})}e.s(["default",()=>p],69490)}]);