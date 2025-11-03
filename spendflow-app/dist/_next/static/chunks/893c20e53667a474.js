(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,88368,e=>{"use strict";let t,s;var a,i=e.i(82078);let l={data:""},r=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,o=/\/\*[^]*?\*\/|  +/g,n=/\n+/g,d=(e,t)=>{let s="",a="",i="";for(let l in e){let r=e[l];"@"==l[0]?"i"==l[1]?s=l+" "+r+";":a+="f"==l[1]?d(r,l):l+"{"+d(r,"k"==l[1]?"":t)+"}":"object"==typeof r?a+=d(r,t?t.replace(/([^,])+/g,e=>l.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,t=>/&/.test(t)?t.replace(/&/g,e):e?e+" "+t:t)):l):null!=r&&(l=/^--/.test(l)?l:l.replace(/[A-Z]/g,"-$&").toLowerCase(),i+=d.p?d.p(l,r):l+":"+r+";")}return s+(t&&i?t+"{"+i+"}":i)+a},c={},m=e=>{if("object"==typeof e){let t="";for(let s in e)t+=s+m(e[s]);return t}return e};function u(e){let t,s,a=this||{},i=e.call?e(a.p):e;return((e,t,s,a,i)=>{var l;let u=m(e),p=c[u]||(c[u]=(e=>{let t=0,s=11;for(;t<e.length;)s=101*s+e.charCodeAt(t++)>>>0;return"go"+s})(u));if(!c[p]){let t=u!==e?e:(e=>{let t,s,a=[{}];for(;t=r.exec(e.replace(o,""));)t[4]?a.shift():t[3]?(s=t[3].replace(n," ").trim(),a.unshift(a[0][s]=a[0][s]||{})):a[0][t[1]]=t[2].replace(n," ").trim();return a[0]})(e);c[p]=d(i?{["@keyframes "+p]:t}:t,s?"":"."+p)}let x=s&&c.g?c.g:null;return s&&(c.g=c[p]),l=c[p],x?t.data=t.data.replace(x,l):-1===t.data.indexOf(l)&&(t.data=a?l+t.data:t.data+l),p})(i.unshift?i.raw?(t=[].slice.call(arguments,1),s=a.p,i.reduce((e,a,i)=>{let l=t[i];if(l&&l.call){let e=l(s),t=e&&e.props&&e.props.className||/^go/.test(e)&&e;l=t?"."+t:e&&"object"==typeof e?e.props?"":d(e,""):!1===e?"":e}return e+a+(null==l?"":l)},"")):i.reduce((e,t)=>Object.assign(e,t&&t.call?t(a.p):t),{}):i,(e=>{if("object"==typeof window){let t=(e?e.querySelector("#_goober"):window._goober)||Object.assign(document.createElement("style"),{innerHTML:" ",id:"_goober"});return t.nonce=window.__nonce__,t.parentNode||(e||document.head).appendChild(t),t.firstChild}return e||l})(a.target),a.g,a.o,a.k)}u.bind({g:1});let p,x,h,b=u.bind({k:1});function f(e,t){let s=this||{};return function(){let a=arguments;function i(l,r){let o=Object.assign({},l),n=o.className||i.className;s.p=Object.assign({theme:x&&x()},o),s.o=/ *go\d+/.test(n),o.className=u.apply(s,a)+(n?" "+n:""),t&&(o.ref=r);let d=e;return e[0]&&(d=o.as||e,delete o.as),h&&d[0]&&h(o),p(d,o)}return t?t(i):i}}var g=(e,t)=>"function"==typeof e?e(t):e,y=(t=0,()=>(++t).toString()),v=()=>{if(void 0===s&&"u">typeof window){let e=matchMedia("(prefers-reduced-motion: reduce)");s=!e||e.matches}return s},j="default",N=(e,t)=>{let{toastLimit:s}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,s)};case 1:return{...e,toasts:e.toasts.map(e=>e.id===t.toast.id?{...e,...t.toast}:e)};case 2:let{toast:a}=t;return N(e,{type:+!!e.toasts.find(e=>e.id===a.id),toast:a});case 3:let{toastId:i}=t;return{...e,toasts:e.toasts.map(e=>e.id===i||void 0===i?{...e,dismissed:!0,visible:!1}:e)};case 4:return void 0===t.toastId?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let l=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+l}))}}},w=[],k={toasts:[],pausedAt:void 0,settings:{toastLimit:20}},A={},E=(e,t=j)=>{A[t]=N(A[t]||k,e),w.forEach(([e,s])=>{e===t&&s(A[t])})},F=e=>Object.keys(A).forEach(t=>E(e,t)),C=(e=j)=>t=>{E(t,e)},M=e=>(t,s)=>{let a,i=((e,t="blank",s)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...s,id:(null==s?void 0:s.id)||y()}))(t,e,s);return C(i.toasterId||(a=i.id,Object.keys(A).find(e=>A[e].toasts.some(e=>e.id===a))))({type:2,toast:i}),i.id},S=(e,t)=>M("blank")(e,t);S.error=M("error"),S.success=M("success"),S.loading=M("loading"),S.custom=M("custom"),S.dismiss=(e,t)=>{let s={type:3,toastId:e};t?C(t)(s):F(s)},S.dismissAll=e=>S.dismiss(void 0,e),S.remove=(e,t)=>{let s={type:4,toastId:e};t?C(t)(s):F(s)},S.removeAll=e=>S.remove(void 0,e),S.promise=(e,t,s)=>{let a=S.loading(t.loading,{...s,...null==s?void 0:s.loading});return"function"==typeof e&&(e=e()),e.then(e=>{let i=t.success?g(t.success,e):void 0;return i?S.success(i,{id:a,...s,...null==s?void 0:s.success}):S.dismiss(a),e}).catch(e=>{let i=t.error?g(t.error,e):void 0;i?S.error(i,{id:a,...s,...null==s?void 0:s.error}):S.dismiss(a)}),e};var L=b`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,$=b`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,D=b`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,T=f("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${L} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${$} 0.15s ease-out forwards;
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
    animation: ${D} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,z=b`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,R=f("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${z} 1s linear infinite;
`,q=b`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,B=b`
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
}`,O=f("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${q} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${B} 0.2s ease-out forwards;
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
`,P=f("div")`
  position: absolute;
`,I=f("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,_=b`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,V=f("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${_} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,H=({toast:e})=>{let{icon:t,type:s,iconTheme:a}=e;return void 0!==t?"string"==typeof t?i.createElement(V,null,t):t:"blank"===s?null:i.createElement(I,null,i.createElement(R,{...a}),"loading"!==s&&i.createElement(P,null,"error"===s?i.createElement(T,{...a}):i.createElement(O,{...a})))},U=f("div")`
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
`,G=f("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`;i.memo(({toast:e,position:t,style:s,children:a})=>{let l=e.height?((e,t)=>{let s=e.includes("top")?1:-1,[a,i]=v()?["0%{opacity:0;} 100%{opacity:1;}","0%{opacity:1;} 100%{opacity:0;}"]:[`
0% {transform: translate3d(0,${-200*s}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${-150*s}%,-1px) scale(.6); opacity:0;}
`];return{animation:t?`${b(a)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${b(i)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}})(e.position||t||"top-center",e.visible):{opacity:0},r=i.createElement(H,{toast:e}),o=i.createElement(G,{...e.ariaProps},g(e.message,e));return i.createElement(U,{className:e.className,style:{...l,...s,...e.style}},"function"==typeof a?a({icon:r,message:o}):i.createElement(i.Fragment,null,r,o))}),a=i.createElement,d.p=void 0,p=a,x=void 0,h=void 0,u`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,e.s(["default",()=>S,"toast",()=>S],88368)},98919,e=>{"use strict";let t=(0,e.i(75254).default)("shield",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}]]);e.s(["Shield",()=>t],98919)},63488,e=>{"use strict";let t=(0,e.i(75254).default)("mail",[["path",{d:"m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7",key:"132q7q"}],["rect",{x:"2",y:"4",width:"20",height:"16",rx:"2",key:"izxlao"}]]);e.s(["Mail",()=>t],63488)},39616,e=>{"use strict";let t=(0,e.i(75254).default)("settings",[["path",{d:"M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915",key:"1i5ecw"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]);e.s(["Settings",()=>t],39616)},45423,e=>{"use strict";let t=(0,e.i(75254).default)("bell",[["path",{d:"M10.268 21a2 2 0 0 0 3.464 0",key:"vwvbt9"}],["path",{d:"M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326",key:"11g9vi"}]]);e.s(["Bell",()=>t],45423)},58041,e=>{"use strict";let t=(0,e.i(75254).default)("database",[["ellipse",{cx:"12",cy:"5",rx:"9",ry:"3",key:"msslwz"}],["path",{d:"M3 5V19A9 3 0 0 0 21 19V5",key:"1wlel7"}],["path",{d:"M3 12A9 3 0 0 0 21 12",key:"mv7ke4"}]]);e.s(["Database",()=>t],58041)},50692,e=>{"use strict";var t=e.i(52621),s=e.i(82078),a=e.i(39616),i=e.i(63488),l=e.i(98919),r=e.i(58041),o=e.i(45423);let n=(0,e.i(75254).default)("save",[["path",{d:"M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",key:"1c8476"}],["path",{d:"M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7",key:"1ydtos"}],["path",{d:"M7 3v4a1 1 0 0 0 1 1h7",key:"t51u73"}]]);var d=e.i(88368);e.i(75271);var c=e.i(5158),m=e.i(89566);function u(){let[e,u]=(0,s.useState)({appName:"SpendFlow",adminEmail:"spendflowapp@gmail.com",maintenanceMode:!1,registrationEnabled:!0,emailNotifications:!0,dataRetentionDays:90,sessionTimeout:30,maxLoginAttempts:5,enable2FA:!0,enableAuditLogs:!0,enableAPIAccess:!1,backupFrequency:"daily",fromEmail:"spendflowapp@gmail.com"}),[p,x]=(0,s.useState)(!1),[h,b]=(0,s.useState)("general");(0,s.useEffect)(()=>{(async()=>{try{let e=(0,c.doc)(m.db,"settings","app"),t=await (0,c.getDoc)(e);if(t.exists()){let e=t.data();console.log("Loading saved settings:",e);let s={appName:"SpendFlow",adminEmail:"spendflowapp@gmail.com",maintenanceMode:!1,registrationEnabled:!0,emailNotifications:!0,dataRetentionDays:90,sessionTimeout:30,maxLoginAttempts:5,enable2FA:!0,enableAuditLogs:!0,enableAPIAccess:!1,backupFrequency:"daily",fromEmail:"spendflowapp@gmail.com",...e};console.log("Merged settings:",s),u(s)}else console.log("No saved settings found, using defaults")}catch(e){console.error("Error loading settings:",e)}})()},[]);let f=e=>{let{name:t,value:s,type:a}=e.target;u(i=>({...i,[t]:"checkbox"===a?e.target.checked:s}))},g=async()=>{try{x(!0);let t=(0,c.doc)(m.db,"settings","app");await (0,c.setDoc)(t,{...e,updatedAt:(0,c.serverTimestamp)(),updatedBy:"admin"},{merge:!0}),d.toast.success("Settings saved successfully")}catch(e){console.error("Error saving settings:",e),d.toast.error("Failed to save settings")}finally{x(!1)}},y=[{id:"general",label:"General",icon:(0,t.jsx)(a.Settings,{className:"h-4 w-4"})},{id:"security",label:"Security",icon:(0,t.jsx)(l.Shield,{className:"h-4 w-4"})},{id:"notifications",label:"Notifications",icon:(0,t.jsx)(o.Bell,{className:"h-4 w-4"})},{id:"email",label:"Email",icon:(0,t.jsx)(i.Mail,{className:"h-4 w-4"})},{id:"backup",label:"Backup & Restore",icon:(0,t.jsx)(r.Database,{className:"h-4 w-4"})}];return(0,t.jsxs)("div",{className:"space-y-6",children:[(0,t.jsxs)("div",{className:"flex justify-between items-center",children:[(0,t.jsx)("h2",{className:"text-2xl font-bold text-white",children:"Admin Settings"}),(0,t.jsx)("button",{onClick:g,disabled:p,className:"inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed",children:p?"Saving...":(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(n,{className:"-ml-1 mr-2 h-4 w-4"}),"Save Changes"]})})]}),(0,t.jsxs)("div",{className:"bg-slate-800 rounded-lg shadow",children:[(0,t.jsx)("div",{className:"border-b border-slate-700",children:(0,t.jsx)("nav",{className:"-mb-px flex space-x-8 px-6",children:y.map(e=>(0,t.jsxs)("button",{onClick:()=>b(e.id),className:`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${h===e.id?"border-amber-500 text-amber-400":"border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-400"}`,children:[e.icon,(0,t.jsx)("span",{children:e.label})]},e.id))})}),(0,t.jsxs)("div",{className:"p-6",children:["general"===h&&(0,t.jsx)("div",{className:"space-y-6",children:(0,t.jsxs)("div",{children:[(0,t.jsx)("h3",{className:"text-lg font-medium text-white mb-4",children:"General Settings"}),(0,t.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[(0,t.jsxs)("div",{children:[(0,t.jsx)("label",{htmlFor:"appName",className:"block text-sm font-medium text-slate-300",children:"Application Name"}),(0,t.jsx)("input",{type:"text",name:"appName",id:"appName",value:e.appName,onChange:f,className:"mt-1 block w-full rounded-md border-slate-700 bg-slate-900 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"})]}),(0,t.jsxs)("div",{children:[(0,t.jsx)("label",{htmlFor:"adminEmail",className:"block text-sm font-medium text-slate-300",children:"Admin Email"}),(0,t.jsx)("input",{type:"email",name:"adminEmail",id:"adminEmail",value:e.adminEmail,onChange:f,className:"mt-1 block w-full rounded-md border-slate-700 bg-slate-900 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"}),(0,t.jsx)("p",{className:"mt-1 text-xs text-slate-400",children:"Primary contact email for system notifications"})]}),(0,t.jsxs)("div",{className:"flex items-start",children:[(0,t.jsx)("div",{className:"flex items-center h-5",children:(0,t.jsx)("input",{id:"registrationEnabled",name:"registrationEnabled",type:"checkbox",checked:e.registrationEnabled,onChange:f,className:"h-4 w-4 rounded border-slate-700 bg-slate-900 text-amber-600 focus:ring-amber-500"})}),(0,t.jsxs)("div",{className:"ml-3 text-sm",children:[(0,t.jsx)("label",{htmlFor:"registrationEnabled",className:"font-medium text-slate-300",children:"Allow New User Registrations"}),(0,t.jsx)("p",{className:"text-slate-400",children:"Enable or disable user registration on the platform"})]})]}),(0,t.jsxs)("div",{className:"flex items-start",children:[(0,t.jsx)("div",{className:"flex items-center h-5",children:(0,t.jsx)("input",{id:"maintenanceMode",name:"maintenanceMode",type:"checkbox",checked:e.maintenanceMode,onChange:f,className:"h-4 w-4 rounded border-slate-700 bg-slate-900 text-amber-600 focus:ring-amber-500"})}),(0,t.jsxs)("div",{className:"ml-3 text-sm",children:[(0,t.jsx)("label",{htmlFor:"maintenanceMode",className:"font-medium text-slate-300",children:"Maintenance Mode"}),(0,t.jsx)("p",{className:"text-slate-400",children:"Put the application in maintenance mode"})]})]})]})]})}),"security"===h&&(0,t.jsxs)("div",{className:"space-y-6",children:[(0,t.jsx)("h3",{className:"text-lg font-medium text-white",children:"Security Settings"}),(0,t.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[(0,t.jsxs)("div",{children:[(0,t.jsx)("label",{htmlFor:"sessionTimeout",className:"block text-sm font-medium text-slate-300",children:"Session Timeout (minutes)"}),(0,t.jsx)("input",{type:"number",name:"sessionTimeout",id:"sessionTimeout",min:"1",value:e.sessionTimeout,onChange:f,className:"mt-1 block w-full rounded-md border-slate-700 bg-slate-900 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"})]}),(0,t.jsxs)("div",{children:[(0,t.jsx)("label",{htmlFor:"maxLoginAttempts",className:"block text-sm font-medium text-slate-300",children:"Max Login Attempts"}),(0,t.jsx)("input",{type:"number",name:"maxLoginAttempts",id:"maxLoginAttempts",min:"1",value:e.maxLoginAttempts,onChange:f,className:"mt-1 block w-full rounded-md border-slate-700 bg-slate-900 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"})]}),(0,t.jsxs)("div",{className:"flex items-start",children:[(0,t.jsx)("div",{className:"flex items-center h-5",children:(0,t.jsx)("input",{id:"enable2FA",name:"enable2FA",type:"checkbox",checked:e.enable2FA,onChange:f,className:"h-4 w-4 rounded border-slate-700 bg-slate-900 text-amber-600 focus:ring-amber-500"})}),(0,t.jsxs)("div",{className:"ml-3 text-sm",children:[(0,t.jsx)("label",{htmlFor:"enable2FA",className:"font-medium text-slate-300",children:"Enable Two-Factor Authentication (2FA)"}),(0,t.jsx)("p",{className:"text-slate-400",children:"Require users to enable 2FA for their accounts"})]})]}),(0,t.jsxs)("div",{className:"flex items-start",children:[(0,t.jsx)("div",{className:"flex items-center h-5",children:(0,t.jsx)("input",{id:"enableAuditLogs",name:"enableAuditLogs",type:"checkbox",checked:e.enableAuditLogs,onChange:f,className:"h-4 w-4 rounded border-slate-700 bg-slate-900 text-amber-600 focus:ring-amber-500"})}),(0,t.jsxs)("div",{className:"ml-3 text-sm",children:[(0,t.jsx)("label",{htmlFor:"enableAuditLogs",className:"font-medium text-slate-300",children:"Enable Audit Logs"}),(0,t.jsx)("p",{className:"text-slate-400",children:"Log all administrative actions for security and compliance"})]})]})]})]}),"notifications"===h&&(0,t.jsxs)("div",{className:"space-y-6",children:[(0,t.jsx)("h3",{className:"text-lg font-medium text-white",children:"Notification Settings"}),(0,t.jsx)("div",{className:"space-y-4",children:(0,t.jsxs)("div",{className:"flex items-start",children:[(0,t.jsx)("div",{className:"flex items-center h-5",children:(0,t.jsx)("input",{id:"emailNotifications",name:"emailNotifications",type:"checkbox",checked:e.emailNotifications,onChange:f,className:"h-4 w-4 rounded border-slate-700 bg-slate-900 text-amber-600 focus:ring-amber-500"})}),(0,t.jsxs)("div",{className:"ml-3 text-sm",children:[(0,t.jsx)("label",{htmlFor:"emailNotifications",className:"font-medium text-slate-300",children:"Email Notifications"}),(0,t.jsx)("p",{className:"text-slate-400",children:"Enable or disable email notifications for system events"})]})]})})]}),"email"===h&&(0,t.jsxs)("div",{className:"space-y-6",children:[(0,t.jsx)("h3",{className:"text-lg font-medium text-white",children:"Email Settings"}),(0,t.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[(0,t.jsxs)("div",{children:[(0,t.jsx)("label",{className:"block text-sm font-medium text-slate-300",children:"Email Server Status"}),(0,t.jsx)("div",{className:"mt-2 px-4 py-3 bg-slate-900 rounded-md text-sm",children:(0,t.jsxs)("span",{className:"inline-flex items-center",children:[(0,t.jsx)("span",{className:"h-2 w-2 rounded-full bg-green-500 mr-2"}),(0,t.jsx)("span",{className:"text-slate-300",children:"Connected to SMTP server"})]})})]}),(0,t.jsxs)("div",{children:[(0,t.jsx)("label",{htmlFor:"fromEmail",className:"block text-sm font-medium text-slate-300",children:"From Email Address"}),(0,t.jsx)("input",{type:"email",name:"fromEmail",id:"fromEmail",value:e.fromEmail,onChange:f,className:"mt-1 block w-full rounded-md border-slate-700 bg-slate-900 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"}),(0,t.jsx)("p",{className:"mt-1 text-xs text-slate-400",children:"This email address will be used as the sender for all system emails"})]})]})]}),"backup"===h&&(0,t.jsxs)("div",{className:"space-y-6",children:[(0,t.jsx)("h3",{className:"text-lg font-medium text-white",children:"Backup & Restore"}),(0,t.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[(0,t.jsxs)("div",{children:[(0,t.jsx)("label",{htmlFor:"backupFrequency",className:"block text-sm font-medium text-slate-300",children:"Backup Frequency"}),(0,t.jsxs)("select",{id:"backupFrequency",name:"backupFrequency",value:e.backupFrequency,onChange:f,className:"mt-1 block w-full rounded-md border-slate-700 bg-slate-900 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm",children:[(0,t.jsx)("option",{value:"daily",children:"Daily"}),(0,t.jsx)("option",{value:"weekly",children:"Weekly"}),(0,t.jsx)("option",{value:"monthly",children:"Monthly"})]})]}),(0,t.jsxs)("div",{children:[(0,t.jsx)("label",{htmlFor:"dataRetentionDays",className:"block text-sm font-medium text-slate-300",children:"Data Retention (days)"}),(0,t.jsx)("input",{type:"number",name:"dataRetentionDays",id:"dataRetentionDays",min:"1",value:e.dataRetentionDays,onChange:f,className:"mt-1 block w-full rounded-md border-slate-700 bg-slate-900 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"})]})]}),(0,t.jsx)("div",{className:"pt-4",children:(0,t.jsxs)("button",{type:"button",className:"inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500",children:[(0,t.jsx)(r.Database,{className:"-ml-1 mr-2 h-4 w-4"}),"Create Manual Backup"]})})]})]})]})]})}e.s(["default",()=>u],50692)},71090,e=>{e.n(e.i(50692))}]);