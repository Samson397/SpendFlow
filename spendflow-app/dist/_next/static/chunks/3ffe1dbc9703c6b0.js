(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,88368,e=>{"use strict";let t,a;var s,r=e.i(82078);let l={data:""},i=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,o=/\/\*[^]*?\*\/|  +/g,c=/\n+/g,n=(e,t)=>{let a="",s="",r="";for(let l in e){let i=e[l];"@"==l[0]?"i"==l[1]?a=l+" "+i+";":s+="f"==l[1]?n(i,l):l+"{"+n(i,"k"==l[1]?"":t)+"}":"object"==typeof i?s+=n(i,t?t.replace(/([^,])+/g,e=>l.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,t=>/&/.test(t)?t.replace(/&/g,e):e?e+" "+t:t)):l):null!=i&&(l=/^--/.test(l)?l:l.replace(/[A-Z]/g,"-$&").toLowerCase(),r+=n.p?n.p(l,i):l+":"+i+";")}return a+(t&&r?t+"{"+r+"}":r)+s},d={},m=e=>{if("object"==typeof e){let t="";for(let a in e)t+=a+m(e[a]);return t}return e};function u(e){let t,a,s=this||{},r=e.call?e(s.p):e;return((e,t,a,s,r)=>{var l;let u=m(e),p=d[u]||(d[u]=(e=>{let t=0,a=11;for(;t<e.length;)a=101*a+e.charCodeAt(t++)>>>0;return"go"+a})(u));if(!d[p]){let t=u!==e?e:(e=>{let t,a,s=[{}];for(;t=i.exec(e.replace(o,""));)t[4]?s.shift():t[3]?(a=t[3].replace(c," ").trim(),s.unshift(s[0][a]=s[0][a]||{})):s[0][t[1]]=t[2].replace(c," ").trim();return s[0]})(e);d[p]=n(r?{["@keyframes "+p]:t}:t,a?"":"."+p)}let x=a&&d.g?d.g:null;return a&&(d.g=d[p]),l=d[p],x?t.data=t.data.replace(x,l):-1===t.data.indexOf(l)&&(t.data=s?l+t.data:t.data+l),p})(r.unshift?r.raw?(t=[].slice.call(arguments,1),a=s.p,r.reduce((e,s,r)=>{let l=t[r];if(l&&l.call){let e=l(a),t=e&&e.props&&e.props.className||/^go/.test(e)&&e;l=t?"."+t:e&&"object"==typeof e?e.props?"":n(e,""):!1===e?"":e}return e+s+(null==l?"":l)},"")):r.reduce((e,t)=>Object.assign(e,t&&t.call?t(s.p):t),{}):r,(e=>{if("object"==typeof window){let t=(e?e.querySelector("#_goober"):window._goober)||Object.assign(document.createElement("style"),{innerHTML:" ",id:"_goober"});return t.nonce=window.__nonce__,t.parentNode||(e||document.head).appendChild(t),t.firstChild}return e||l})(s.target),s.g,s.o,s.k)}u.bind({g:1});let p,x,h,g=u.bind({k:1});function f(e,t){let a=this||{};return function(){let s=arguments;function r(l,i){let o=Object.assign({},l),c=o.className||r.className;a.p=Object.assign({theme:x&&x()},o),a.o=/ *go\d+/.test(c),o.className=u.apply(a,s)+(c?" "+c:""),t&&(o.ref=i);let n=e;return e[0]&&(n=o.as||e,delete o.as),h&&n[0]&&h(o),p(n,o)}return t?t(r):r}}var y=(e,t)=>"function"==typeof e?e(t):e,b=(t=0,()=>(++t).toString()),v=()=>{if(void 0===a&&"u">typeof window){let e=matchMedia("(prefers-reduced-motion: reduce)");a=!e||e.matches}return a},w="default",j=(e,t)=>{let{toastLimit:a}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,a)};case 1:return{...e,toasts:e.toasts.map(e=>e.id===t.toast.id?{...e,...t.toast}:e)};case 2:let{toast:s}=t;return j(e,{type:+!!e.toasts.find(e=>e.id===s.id),toast:s});case 3:let{toastId:r}=t;return{...e,toasts:e.toasts.map(e=>e.id===r||void 0===r?{...e,dismissed:!0,visible:!1}:e)};case 4:return void 0===t.toastId?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let l=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+l}))}}},N=[],A={toasts:[],pausedAt:void 0,settings:{toastLimit:20}},k={},$=(e,t=w)=>{k[t]=j(k[t]||A,e),N.forEach(([e,a])=>{e===t&&a(k[t])})},C=e=>Object.keys(k).forEach(t=>$(e,t)),S=(e=w)=>t=>{$(t,e)},D=e=>(t,a)=>{let s,r=((e,t="blank",a)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...a,id:(null==a?void 0:a.id)||b()}))(t,e,a);return S(r.toasterId||(s=r.id,Object.keys(k).find(e=>k[e].toasts.some(e=>e.id===s))))({type:2,toast:r}),r.id},T=(e,t)=>D("blank")(e,t);T.error=D("error"),T.success=D("success"),T.loading=D("loading"),T.custom=D("custom"),T.dismiss=(e,t)=>{let a={type:3,toastId:e};t?S(t)(a):C(a)},T.dismissAll=e=>T.dismiss(void 0,e),T.remove=(e,t)=>{let a={type:4,toastId:e};t?S(t)(a):C(a)},T.removeAll=e=>T.remove(void 0,e),T.promise=(e,t,a)=>{let s=T.loading(t.loading,{...a,...null==a?void 0:a.loading});return"function"==typeof e&&(e=e()),e.then(e=>{let r=t.success?y(t.success,e):void 0;return r?T.success(r,{id:s,...a,...null==a?void 0:a.success}):T.dismiss(s),e}).catch(e=>{let r=t.error?y(t.error,e):void 0;r?T.error(r,{id:s,...a,...null==a?void 0:a.error}):T.dismiss(s)}),e};var E=g`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,M=g`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,B=g`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,z=f("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${E} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
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
    animation: ${B} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,L=g`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,q=f("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${L} 1s linear infinite;
`,F=g`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,_=g`
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
}`,I=f("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${F} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
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
`,P=f("div")`
  position: absolute;
`,O=f("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,R=g`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,U=f("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${R} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,H=({toast:e})=>{let{icon:t,type:a,iconTheme:s}=e;return void 0!==t?"string"==typeof t?r.createElement(U,null,t):t:"blank"===a?null:r.createElement(O,null,r.createElement(q,{...s}),"loading"!==a&&r.createElement(P,null,"error"===a?r.createElement(z,{...s}):r.createElement(I,{...s})))},X=f("div")`
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
`,J=f("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`;r.memo(({toast:e,position:t,style:a,children:s})=>{let l=e.height?((e,t)=>{let a=e.includes("top")?1:-1,[s,r]=v()?["0%{opacity:0;} 100%{opacity:1;}","0%{opacity:1;} 100%{opacity:0;}"]:[`
0% {transform: translate3d(0,${-200*a}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${-150*a}%,-1px) scale(.6); opacity:0;}
`];return{animation:t?`${g(s)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${g(r)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}})(e.position||t||"top-center",e.visible):{opacity:0},i=r.createElement(H,{toast:e}),o=r.createElement(J,{...e.ariaProps},y(e.message,e));return r.createElement(X,{className:e.className,style:{...l,...a,...e.style}},"function"==typeof s?s({icon:i,message:o}):r.createElement(r.Fragment,null,i,o))}),s=r.createElement,n.p=void 0,p=s,x=void 0,h=void 0,u`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,e.s(["default",()=>T,"toast",()=>T],88368)},77529,e=>{"use strict";let t=(0,e.i(75254).default)("circle-check-big",[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335",key:"yps3ct"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]]);e.s(["CheckCircle",()=>t],77529)},82820,e=>{"use strict";var t=e.i(41195);e.i(75271);var a=e.i(5158);e.s(["alertsService",0,{async userRegistered(e,t,s="free"){let r={title:"New User Registration",message:`User ${t} has registered for a ${s} account and is awaiting email verification.`,type:"info",category:"user",status:"active",priority:"low",createdAt:(0,a.serverTimestamp)(),userId:e,metadata:{email:t,userType:s,action:"registration"}};return await this.create(r)},async failedLogin(e,t,s=1){let r={title:"Failed Login Attempts",message:`Multiple failed login attempts detected for ${e}${t?` from IP ${t}`:""}. ${s} failed attempts in the last hour.`,type:s>=5?"warning":"info",category:"security",status:"active",priority:s>=5?"high":s>=3?"medium":"low",createdAt:(0,a.serverTimestamp)(),metadata:{email:e,ipAddress:t,attemptCount:s,action:"failed_login"}};return await this.create(r)},async adminAction(e,t,s){let r={title:"Admin Action Performed",message:`Administrator ${e} performed: ${t}${s?` on ${s}`:""}`,type:"info",category:"system",status:"resolved",priority:"low",createdAt:(0,a.serverTimestamp)(),resolvedAt:(0,a.serverTimestamp)(),metadata:{adminEmail:e,action:t,target:s,actionType:"admin_action"}};return await this.create(r)},async performanceIssue(e,t,s,r="%"){let l={title:"Performance Alert",message:`${e} has reached ${t}${r}, exceeding threshold of ${s}${r}. System performance may be impacted.`,type:t>90?"critical":"warning",category:"performance",status:"active",priority:t>90?"critical":t>80?"high":"medium",createdAt:(0,a.serverTimestamp)(),metadata:{metric:e,value:t,threshold:s,unit:r,action:"performance"}};return await this.create(l)},async databaseError(e,t,s){let r={title:"Database Error",message:`Database operation failed: ${e}${s?` on collection ${s}`:""}. Error: ${t}`,type:"critical",category:"database",status:"active",priority:"critical",createdAt:(0,a.serverTimestamp)(),metadata:{operation:e,error:t,collection:s,action:"database_error"}};return await this.create(r)},async backupCompleted(e,t){let s={title:"Backup Completed Successfully",message:`System backup completed successfully. Size: ${e}, Duration: ${t} seconds.`,type:"success",category:"system",status:"resolved",priority:"low",createdAt:(0,a.serverTimestamp)(),resolvedAt:(0,a.serverTimestamp)(),metadata:{size:e,duration:t,action:"backup_complete"}};return await this.create(s)},async securityEvent(e,t){let s=e.includes("brute_force")||e.includes("suspicious")?"high":"medium",r={title:"Security Event Detected",message:`${e.replace(/_/g," ").replace(/\b\w/g,e=>e.toUpperCase())}: ${JSON.stringify(t)}`,type:"warning",category:"security",status:"active",priority:s,createdAt:(0,a.serverTimestamp)(),metadata:{event:e,...t,action:"security_event"}};return await this.create(r)},async create(e){try{let s=await (0,a.addDoc)((0,a.collection)(t.db,"alerts"),e);return console.log("Alert created:",s.id),s.id}catch(e){throw console.error("Error creating alert:",e),e}},async getAll(e={}){try{let s=(0,a.query)((0,a.collection)(t.db,"alerts"));return s=e.userId?(0,a.query)(s,(0,a.where)("userId","==",e.userId),(0,a.orderBy)("createdAt","desc")):(0,a.query)(s,(0,a.orderBy)("createdAt","desc")),e.status&&(s=(0,a.query)(s,(0,a.where)("status","==",e.status))),e.type&&(s=(0,a.query)(s,(0,a.where)("type","==",e.type))),e.category&&(s=(0,a.query)(s,(0,a.where)("category","==",e.category))),e.limit&&(s=(0,a.query)(s,(0,a.limit)(e.limit))),(await (0,a.getDocs)(s)).docs.map(e=>({id:e.id,...e.data()}))}catch(e){return console.error("Error fetching alerts:",e),[]}},async updateStatus(e,s,r){try{let l={status:s,updatedAt:(0,a.serverTimestamp)()};"acknowledged"===s&&r?(l.acknowledgedAt=(0,a.serverTimestamp)(),l.acknowledgedBy=r):"resolved"===s&&(l.resolvedAt=(0,a.serverTimestamp)()),await (0,a.updateDoc)((0,a.doc)(t.db,"alerts",e),l),console.log(`Alert ${e} status updated to ${s}`)}catch(e){throw console.error("Error updating alert status:",e),e}},async delete(e){try{await (0,a.deleteDoc)((0,a.doc)(t.db,"alerts",e)),console.log("Alert deleted:",e)}catch(e){throw console.error("Error deleting alert:",e),e}},async cleanupOldAlerts(){try{let e=new Date;e.setDate(e.getDate()-30);let s=(0,a.query)((0,a.collection)(t.db,"alerts"),(0,a.where)("status","==","resolved"),(0,a.where)("resolvedAt","<",a.Timestamp.fromDate(e)),(0,a.orderBy)("resolvedAt","desc")),r=(await (0,a.getDocs)(s)).docs.map(e=>(0,a.deleteDoc)(e.ref));return await Promise.all(r),console.log(`Cleaned up ${r.length} old alerts`),r.length}catch(e){return console.error("Error cleaning up old alerts:",e),0}}}])},45423,e=>{"use strict";let t=(0,e.i(75254).default)("bell",[["path",{d:"M10.268 21a2 2 0 0 0 3.464 0",key:"vwvbt9"}],["path",{d:"M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326",key:"11g9vi"}]]);e.s(["Bell",()=>t],45423)},87130,e=>{"use strict";let t=(0,e.i(75254).default)("funnel",[["path",{d:"M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z",key:"sc7q7i"}]]);e.s(["Filter",()=>t],87130)},55436,e=>{"use strict";let t=(0,e.i(75254).default)("search",[["path",{d:"m21 21-4.34-4.34",key:"14j7rj"}],["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}]]);e.s(["Search",()=>t],55436)},63209,e=>{"use strict";let t=(0,e.i(75254).default)("circle-alert",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]]);e.s(["AlertCircle",()=>t],63209)},78894,e=>{"use strict";let t=(0,e.i(75254).default)("triangle-alert",[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]]);e.s(["AlertTriangle",()=>t],78894)},73884,e=>{"use strict";let t=(0,e.i(75254).default)("circle-x",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m15 9-6 6",key:"1uzhvr"}],["path",{d:"m9 9 6 6",key:"z0biqf"}]]);e.s(["XCircle",()=>t],73884)},11667,e=>{"use strict";var t=e.i(52621),a=e.i(82078),s=e.i(78894),r=e.i(77529),l=e.i(73884),i=e.i(3116),o=e.i(87130),c=e.i(55436),n=e.i(45423),d=e.i(63209),m=e.i(88368),u=e.i(82820),p=e.i(2188);function x(){let[e,x]=(0,a.useState)([]),[h,g]=(0,a.useState)(""),[f,y]=(0,a.useState)("all"),[b,v]=(0,a.useState)("all"),[w,j]=(0,a.useState)("all"),[N,A]=(0,a.useState)(!1),{user:k}=(0,p.useAuth)();(0,a.useEffect)(()=>{(async()=>{try{let e=(await u.alertsService.getAll()).map(e=>({...e,createdAt:e.createdAt instanceof Date?e.createdAt:e.createdAt?.toDate?.()||new Date,resolvedAt:e.resolvedAt instanceof Date?e.resolvedAt:e.resolvedAt?.toDate?.(),acknowledgedAt:e.acknowledgedAt instanceof Date?e.acknowledgedAt:e.acknowledgedAt?.toDate?.()}));x(e)}catch(e){console.error("Error loading alerts:",e),m.toast.error("Failed to load alerts - you may not have admin permissions")}})()},[]);let $=!!k?.email&&("spendflowapp@gmail.com".split(",")||[]).includes(k.email),C=(0,a.useMemo)(()=>{let t=e.filter(e=>e.title.toLowerCase().includes(h.toLowerCase())||e.message.toLowerCase().includes(h.toLowerCase()));return"all"!==f&&(t=t.filter(e=>e.status===f)),"all"!==b&&(t=t.filter(e=>e.type===b)),"all"!==w&&(t=t.filter(e=>e.category===w)),t},[e,h,f,b,w]);if(!$)return(0,t.jsx)("div",{className:"space-y-6",children:(0,t.jsxs)("div",{className:"text-center py-12",children:[(0,t.jsx)("div",{className:"mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-900/20 mb-4",children:(0,t.jsx)(s.AlertTriangle,{className:"h-6 w-6 text-red-400"})}),(0,t.jsx)("h3",{className:"text-lg font-medium text-slate-300 mb-2",children:"Admin Access Required"}),(0,t.jsx)("p",{className:"text-slate-500 text-sm",children:"You need administrator privileges to view and manage system alerts."})]})});let S=async(e,t)=>{try{await u.alertsService.updateStatus(e,t,"admin@example.com"),x(a=>a.map(a=>a.id===e?{...a,status:t,resolvedAt:"resolved"===t?new Date:a.resolvedAt,acknowledgedBy:"acknowledged"===t?"admin@example.com":a.acknowledgedBy}:a)),m.toast.success(`Alert ${"resolved"===t?"resolved":"acknowledged"===t?"acknowledged":"marked as active"}`)}catch(e){console.error("Error updating alert status:",e),m.toast.error("Failed to update alert status")}},D=async()=>{if(!window.confirm("Are you sure you want to clear all alerts? This action cannot be undone."))return;let t=e.length;console.log(`🗑️ Admin clearing ${t} alerts`);try{let a=e.map(e=>(console.log(`Deleting alert: ${e.id} - ${e.title}`),u.alertsService.delete(e.id)));await Promise.all(a),x([]),console.log(`✅ Successfully cleared ${t} alerts`),m.toast.success(`Successfully cleared ${t} alerts`)}catch(e){console.error("❌ Error clearing alerts:",e),m.toast.error("Failed to clear alerts. Please try again.")}};return(0,t.jsxs)("div",{className:"space-y-6",children:[(0,t.jsxs)("div",{className:"flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4",children:[(0,t.jsxs)("div",{children:[(0,t.jsx)("h2",{className:"text-2xl font-serif text-slate-100",children:"Alert Management"}),(0,t.jsx)("p",{className:"text-slate-400 text-sm",children:"Search, filter, and manage system notifications"})]}),(0,t.jsxs)("div",{className:"w-full sm:w-auto flex gap-2",children:[(0,t.jsxs)("div",{className:"relative flex-1 sm:w-64",children:[(0,t.jsx)(c.Search,{className:"absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500"}),(0,t.jsx)("input",{type:"text",placeholder:"Search alerts...",className:"w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent",value:h,onChange:e=>g(e.target.value)})]}),(0,t.jsxs)("button",{onClick:()=>A(!N),className:`px-3 py-2 rounded-md text-slate-300 flex items-center gap-2 transition-colors ${N?"bg-slate-700":"bg-slate-800 hover:bg-slate-700 border border-slate-700"}`,children:[(0,t.jsx)(o.Filter,{className:"h-4 w-4"}),(0,t.jsx)("span",{className:"hidden sm:inline",children:"Filters"})]}),e.length>0&&(0,t.jsxs)("button",{onClick:D,className:"px-3 py-2 rounded-md text-red-400 hover:text-red-300 hover:bg-red-900/20 border border-red-700/50 flex items-center gap-2 transition-colors",title:"Clear all alerts",children:[(0,t.jsx)("svg",{className:"h-4 w-4",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:(0,t.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"})}),(0,t.jsx)("span",{className:"hidden sm:inline",children:"Clear All"})]})]})]}),N&&(0,t.jsxs)("div",{className:"bg-slate-900/50 border border-slate-800 rounded-lg p-4",children:[(0,t.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4",children:[(0,t.jsxs)("div",{children:[(0,t.jsx)("label",{className:"block text-sm font-medium text-slate-300 mb-2",children:"Status"}),(0,t.jsxs)("select",{value:f,onChange:e=>y(e.target.value),className:"w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500",children:[(0,t.jsx)("option",{value:"all",children:"All Status"}),(0,t.jsx)("option",{value:"active",children:"Active"}),(0,t.jsx)("option",{value:"acknowledged",children:"Acknowledged"}),(0,t.jsx)("option",{value:"resolved",children:"Resolved"})]})]}),(0,t.jsxs)("div",{children:[(0,t.jsx)("label",{className:"block text-sm font-medium text-slate-300 mb-2",children:"Type"}),(0,t.jsxs)("select",{value:b,onChange:e=>v(e.target.value),className:"w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500",children:[(0,t.jsx)("option",{value:"all",children:"All Types"}),(0,t.jsx)("option",{value:"critical",children:"Critical"}),(0,t.jsx)("option",{value:"warning",children:"Warning"}),(0,t.jsx)("option",{value:"info",children:"Info"}),(0,t.jsx)("option",{value:"success",children:"Success"})]})]}),(0,t.jsxs)("div",{children:[(0,t.jsx)("label",{className:"block text-sm font-medium text-slate-300 mb-2",children:"Category"}),(0,t.jsxs)("select",{value:w,onChange:e=>j(e.target.value),className:"w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500",children:[(0,t.jsx)("option",{value:"all",children:"All Categories"}),(0,t.jsx)("option",{value:"system",children:"System"}),(0,t.jsx)("option",{value:"security",children:"Security"}),(0,t.jsx)("option",{value:"performance",children:"Performance"}),(0,t.jsx)("option",{value:"database",children:"Database"}),(0,t.jsx)("option",{value:"api",children:"API"})]})]})]}),(0,t.jsxs)("div",{className:"mt-4 flex justify-between items-center",children:[(0,t.jsxs)("span",{className:"text-sm text-slate-400",children:["Showing ",C.length," of ",e.length," alerts"]}),(0,t.jsx)("button",{onClick:()=>{y("all"),v("all"),j("all"),g("")},className:"text-sm text-amber-400 hover:text-amber-300",children:"Clear Filters"})]})]}),(0,t.jsx)("div",{className:"bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden",children:0===C.length?(0,t.jsxs)("div",{className:"text-center py-12",children:[(0,t.jsx)(r.CheckCircle,{className:"h-12 w-12 text-green-500 mx-auto mb-2"}),(0,t.jsx)("h3",{className:"text-lg font-medium text-slate-300",children:"No alerts found"}),(0,t.jsx)("p",{className:"text-slate-500 text-sm",children:"All systems are running smoothly"})]}):(0,t.jsx)("div",{className:"divide-y divide-slate-800",children:C.map(e=>{var a;let o;return(0,t.jsx)("div",{className:`p-6 border-l-4 ${(e=>{switch(e){case"critical":return"border-red-500 bg-red-900/10";case"warning":return"border-amber-500 bg-amber-900/10";case"info":return"border-blue-500 bg-blue-900/10";case"success":return"border-green-500 bg-green-900/10";default:return"border-slate-500 bg-slate-900/10"}})(e.type)}`,children:(0,t.jsxs)("div",{className:"flex items-start justify-between",children:[(0,t.jsxs)("div",{className:"flex items-start space-x-3 flex-1",children:[(0,t.jsx)("div",{className:"shrink-0 mt-0.5",children:(e=>{switch(e){case"critical":return(0,t.jsx)(l.XCircle,{className:"h-5 w-5 text-red-500"});case"warning":return(0,t.jsx)(s.AlertTriangle,{className:"h-5 w-5 text-amber-500"});case"info":return(0,t.jsx)(d.AlertCircle,{className:"h-5 w-5 text-blue-500"});case"success":return(0,t.jsx)(r.CheckCircle,{className:"h-5 w-5 text-green-500"});default:return(0,t.jsx)(n.Bell,{className:"h-5 w-5 text-slate-500"})}})(e.type)}),(0,t.jsxs)("div",{className:"flex-1 min-w-0",children:[(0,t.jsxs)("div",{className:"flex items-center space-x-2 mb-1",children:[(0,t.jsx)("h3",{className:"text-lg font-medium text-slate-100",children:e.title}),(e=>{let a="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";switch(e){case"active":return(0,t.jsx)("span",{className:`${a} bg-red-900/30 text-red-400`,children:"Active"});case"acknowledged":return(0,t.jsx)("span",{className:`${a} bg-amber-900/30 text-amber-400`,children:"Acknowledged"});case"resolved":return(0,t.jsx)("span",{className:`${a} bg-green-900/30 text-green-400`,children:"Resolved"});default:return(0,t.jsx)("span",{className:`${a} bg-slate-800/50 text-slate-400`,children:e})}})(e.status)]}),(0,t.jsx)("p",{className:"text-slate-300 text-sm mb-2",children:e.message}),(0,t.jsxs)("div",{className:"flex items-center space-x-4 text-xs text-slate-500",children:[(0,t.jsxs)("span",{className:"flex items-center",children:[(0,t.jsx)(i.Clock,{className:"h-3 w-3 mr-1"}),(a=e.createdAt instanceof Date?e.createdAt:new Date,(o=Math.floor((new Date().getTime()-a.getTime())/1e3))<60?"Just now":o<3600?`${Math.floor(o/60)}m ago`:o<86400?`${Math.floor(o/3600)}h ago`:o<604800?`${Math.floor(o/86400)}d ago`:`${Math.floor(o/604800)}w ago`)]}),(0,t.jsxs)("span",{className:`font-medium ${(e=>{switch(e){case"critical":return"text-red-400";case"high":return"text-orange-400";case"medium":return"text-amber-400";case"low":return"text-green-400";default:return"text-slate-400"}})(e.priority)}`,children:[e.priority.charAt(0).toUpperCase()+e.priority.slice(1)," Priority"]}),(0,t.jsx)("span",{className:"text-slate-400 capitalize",children:e.category}),e.acknowledgedBy&&e.acknowledgedBy.trim()&&(0,t.jsxs)("span",{className:"text-slate-400",children:["Acknowledged by ",e.acknowledgedBy]})]})]})]}),(0,t.jsxs)("div",{className:"flex items-center space-x-2 ml-4",children:["active"===e.status&&(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("button",{onClick:()=>S(e.id,"acknowledged"),className:"px-3 py-1 text-xs bg-amber-600 hover:bg-amber-700 text-white rounded-md transition-colors",children:"Acknowledge"}),(0,t.jsx)("button",{onClick:()=>S(e.id,"resolved"),className:"px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors",children:"Resolve"})]}),"acknowledged"===e.status&&(0,t.jsx)("button",{onClick:()=>S(e.id,"resolved"),className:"px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors",children:"Resolve"})]})]})},e.id)})})}),(0,t.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-4 gap-4",children:[(0,t.jsx)("div",{className:"bg-slate-900/50 border border-slate-800 rounded-lg p-4",children:(0,t.jsxs)("div",{className:"flex items-center",children:[(0,t.jsx)(l.XCircle,{className:"h-8 w-8 text-red-500 mr-3"}),(0,t.jsxs)("div",{children:[(0,t.jsx)("p",{className:"text-2xl font-bold text-slate-100",children:e.filter(e=>"critical"===e.type&&"active"===e.status).length}),(0,t.jsx)("p",{className:"text-sm text-slate-400",children:"Critical Alerts"})]})]})}),(0,t.jsx)("div",{className:"bg-slate-900/50 border border-slate-800 rounded-lg p-4",children:(0,t.jsxs)("div",{className:"flex items-center",children:[(0,t.jsx)(s.AlertTriangle,{className:"h-8 w-8 text-amber-500 mr-3"}),(0,t.jsxs)("div",{children:[(0,t.jsx)("p",{className:"text-2xl font-bold text-slate-100",children:e.filter(e=>"active"===e.status).length}),(0,t.jsx)("p",{className:"text-sm text-slate-400",children:"Active Alerts"})]})]})}),(0,t.jsx)("div",{className:"bg-slate-900/50 border border-slate-800 rounded-lg p-4",children:(0,t.jsxs)("div",{className:"flex items-center",children:[(0,t.jsx)(r.CheckCircle,{className:"h-8 w-8 text-green-500 mr-3"}),(0,t.jsxs)("div",{children:[(0,t.jsx)("p",{className:"text-2xl font-bold text-slate-100",children:e.filter(e=>"resolved"===e.status).length}),(0,t.jsx)("p",{className:"text-sm text-slate-400",children:"Resolved Today"})]})]})}),(0,t.jsx)("div",{className:"bg-slate-900/50 border border-slate-800 rounded-lg p-4",children:(0,t.jsxs)("div",{className:"flex items-center",children:[(0,t.jsx)(n.Bell,{className:"h-8 w-8 text-blue-500 mr-3"}),(0,t.jsxs)("div",{children:[(0,t.jsx)("p",{className:"text-2xl font-bold text-slate-100",children:e.length}),(0,t.jsx)("p",{className:"text-sm text-slate-400",children:"Total Alerts"})]})]})})]})]})}e.s(["default",()=>x])},9229,e=>{e.n(e.i(11667))}]);