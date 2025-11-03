(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,88368,e=>{"use strict";let t,a;var s,r=e.i(82078);let i={data:""},n=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,o=/\/\*[^]*?\*\/|  +/g,l=/\n+/g,c=(e,t)=>{let a="",s="",r="";for(let i in e){let n=e[i];"@"==i[0]?"i"==i[1]?a=i+" "+n+";":s+="f"==i[1]?c(n,i):i+"{"+c(n,"k"==i[1]?"":t)+"}":"object"==typeof n?s+=c(n,t?t.replace(/([^,])+/g,e=>i.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,t=>/&/.test(t)?t.replace(/&/g,e):e?e+" "+t:t)):i):null!=n&&(i=/^--/.test(i)?i:i.replace(/[A-Z]/g,"-$&").toLowerCase(),r+=c.p?c.p(i,n):i+":"+n+";")}return a+(t&&r?t+"{"+r+"}":r)+s},d={},m=e=>{if("object"==typeof e){let t="";for(let a in e)t+=a+m(e[a]);return t}return e};function u(e){let t,a,s=this||{},r=e.call?e(s.p):e;return((e,t,a,s,r)=>{var i;let u=m(e),p=d[u]||(d[u]=(e=>{let t=0,a=11;for(;t<e.length;)a=101*a+e.charCodeAt(t++)>>>0;return"go"+a})(u));if(!d[p]){let t=u!==e?e:(e=>{let t,a,s=[{}];for(;t=n.exec(e.replace(o,""));)t[4]?s.shift():t[3]?(a=t[3].replace(l," ").trim(),s.unshift(s[0][a]=s[0][a]||{})):s[0][t[1]]=t[2].replace(l," ").trim();return s[0]})(e);d[p]=c(r?{["@keyframes "+p]:t}:t,a?"":"."+p)}let f=a&&d.g?d.g:null;return a&&(d.g=d[p]),i=d[p],f?t.data=t.data.replace(f,i):-1===t.data.indexOf(i)&&(t.data=s?i+t.data:t.data+i),p})(r.unshift?r.raw?(t=[].slice.call(arguments,1),a=s.p,r.reduce((e,s,r)=>{let i=t[r];if(i&&i.call){let e=i(a),t=e&&e.props&&e.props.className||/^go/.test(e)&&e;i=t?"."+t:e&&"object"==typeof e?e.props?"":c(e,""):!1===e?"":e}return e+s+(null==i?"":i)},"")):r.reduce((e,t)=>Object.assign(e,t&&t.call?t(s.p):t),{}):r,(e=>{if("object"==typeof window){let t=(e?e.querySelector("#_goober"):window._goober)||Object.assign(document.createElement("style"),{innerHTML:" ",id:"_goober"});return t.nonce=window.__nonce__,t.parentNode||(e||document.head).appendChild(t),t.firstChild}return e||i})(s.target),s.g,s.o,s.k)}u.bind({g:1});let p,f,g,h=u.bind({k:1});function x(e,t){let a=this||{};return function(){let s=arguments;function r(i,n){let o=Object.assign({},i),l=o.className||r.className;a.p=Object.assign({theme:f&&f()},o),a.o=/ *go\d+/.test(l),o.className=u.apply(a,s)+(l?" "+l:""),t&&(o.ref=n);let c=e;return e[0]&&(c=o.as||e,delete o.as),g&&c[0]&&g(o),p(c,o)}return t?t(r):r}}var y=(e,t)=>"function"==typeof e?e(t):e,b=(t=0,()=>(++t).toString()),v=()=>{if(void 0===a&&"u">typeof window){let e=matchMedia("(prefers-reduced-motion: reduce)");a=!e||e.matches}return a},w="default",k=(e,t)=>{let{toastLimit:a}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,a)};case 1:return{...e,toasts:e.toasts.map(e=>e.id===t.toast.id?{...e,...t.toast}:e)};case 2:let{toast:s}=t;return k(e,{type:+!!e.toasts.find(e=>e.id===s.id),toast:s});case 3:let{toastId:r}=t;return{...e,toasts:e.toasts.map(e=>e.id===r||void 0===r?{...e,dismissed:!0,visible:!1}:e)};case 4:return void 0===t.toastId?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let i=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+i}))}}},j=[],S={toasts:[],pausedAt:void 0,settings:{toastLimit:20}},N={},A=(e,t=w)=>{N[t]=k(N[t]||S,e),j.forEach(([e,a])=>{e===t&&a(N[t])})},I=e=>Object.keys(N).forEach(t=>A(e,t)),E=(e=w)=>t=>{A(t,e)},P=e=>(t,a)=>{let s,r=((e,t="blank",a)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...a,id:(null==a?void 0:a.id)||b()}))(t,e,a);return E(r.toasterId||(s=r.id,Object.keys(N).find(e=>N[e].toasts.some(e=>e.id===s))))({type:2,toast:r}),r.id},C=(e,t)=>P("blank")(e,t);C.error=P("error"),C.success=P("success"),C.loading=P("loading"),C.custom=P("custom"),C.dismiss=(e,t)=>{let a={type:3,toastId:e};t?E(t)(a):I(a)},C.dismissAll=e=>C.dismiss(void 0,e),C.remove=(e,t)=>{let a={type:4,toastId:e};t?E(t)(a):I(a)},C.removeAll=e=>C.remove(void 0,e),C.promise=(e,t,a)=>{let s=C.loading(t.loading,{...a,...null==a?void 0:a.loading});return"function"==typeof e&&(e=e()),e.then(e=>{let r=t.success?y(t.success,e):void 0;return r?C.success(r,{id:s,...a,...null==a?void 0:a.success}):C.dismiss(s),e}).catch(e=>{let r=t.error?y(t.error,e):void 0;r?C.error(r,{id:s,...a,...null==a?void 0:a.error}):C.dismiss(s)}),e};var $=h`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,T=h`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,z=h`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,F=x("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${$} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
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
`,_=h`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,D=x("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${_} 1s linear infinite;
`,U=h`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,B=h`
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
}`,M=x("div")`
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
`,H=x("div")`
  position: absolute;
`,L=x("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,O=h`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,R=x("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${O} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,K=({toast:e})=>{let{icon:t,type:a,iconTheme:s}=e;return void 0!==t?"string"==typeof t?r.createElement(R,null,t):t:"blank"===a?null:r.createElement(L,null,r.createElement(D,{...s}),"loading"!==a&&r.createElement(H,null,"error"===a?r.createElement(F,{...s}):r.createElement(M,{...s})))},q=x("div")`
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
`,G=x("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`;r.memo(({toast:e,position:t,style:a,children:s})=>{let i=e.height?((e,t)=>{let a=e.includes("top")?1:-1,[s,r]=v()?["0%{opacity:0;} 100%{opacity:1;}","0%{opacity:1;} 100%{opacity:0;}"]:[`
0% {transform: translate3d(0,${-200*a}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${-150*a}%,-1px) scale(.6); opacity:0;}
`];return{animation:t?`${h(s)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${h(r)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}})(e.position||t||"top-center",e.visible):{opacity:0},n=r.createElement(K,{toast:e}),o=r.createElement(G,{...e.ariaProps},y(e.message,e));return r.createElement(q,{className:e.className,style:{...i,...a,...e.style}},"function"==typeof s?s({icon:n,message:o}):r.createElement(r.Fragment,null,n,o))}),s=r.createElement,c.p=void 0,p=s,f=void 0,g=void 0,u`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,e.s(["default",()=>C,"toast",()=>C],88368)},84614,e=>{"use strict";let t=(0,e.i(75254).default)("user",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]]);e.s(["User",()=>t],84614)},14764,e=>{"use strict";let t=(0,e.i(75254).default)("send",[["path",{d:"M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",key:"1ffxy3"}],["path",{d:"m21.854 2.147-10.94 10.939",key:"12cjpa"}]]);e.s(["Send",()=>t],14764)},36329,e=>{"use strict";var t=e.i(52621),a=e.i(82078),s=e.i(14764);let r=(0,e.i(75254).default)("bot",[["path",{d:"M12 8V4H8",key:"hb8ula"}],["rect",{width:"16",height:"12",x:"4",y:"8",rx:"2",key:"enze0r"}],["path",{d:"M2 14h2",key:"vft8re"}],["path",{d:"M20 14h2",key:"4cs60a"}],["path",{d:"M15 13v2",key:"1xurst"}],["path",{d:"M9 13v2",key:"rq6x2g"}]]);var i=e.i(84614),n=e.i(84500),o=e.i(2188),l=e.i(30945),c=e.i(88368);function d(){let{user:e}=(0,o.useAuth)(),[d,m]=(0,a.useState)([]),[u,p]=(0,a.useState)(""),[f,g]=(0,a.useState)(!1),[h,x]=(0,a.useState)(null),y=(0,a.useRef)(null),b=[{type:"wallet",title:"💳 Check My Wallet",action:async()=>{let t,a;if(!e)throw Error("User not authenticated");let s=Date.now();if(h&&s-h.timestamp<3e5?(t=h.cards,a=h.totalBalance):(a=(t=await l.cardsService.getByUserId(e.uid)).reduce((e,t)=>e+t.balance,0),x({cards:t,totalBalance:a,timestamp:s})),0===t.length)return n.deepSeekService.getFinancialAdvice("The user has no cards in their wallet. They should add some cards to track their finances.",{context:"empty_wallet"});let r=t.map(e=>({name:e.name,balance:e.balance,type:e.type,lastFour:e.lastFour||"****"}));return n.deepSeekService.getFinancialAdvice(`Here's my current wallet status: Total balance across ${t.length} cards: $${a.toFixed(2)}

Card details: ${JSON.stringify(r)}

Please provide a summary of my wallet status and any financial insights.`,{context:"wallet_check"})}},{type:"spending",title:"📊 Analyze My Spending",action:async()=>{if(!e)throw Error("User not authenticated");let[t,a]=await Promise.all([l.transactionsService.getByUserId(e.uid),l.cardsService.getByUserId(e.uid)]);return n.deepSeekService.analyzeSpendingPatterns(t,{totalCards:a.length,totalBalance:a.reduce((e,t)=>e+t.balance,0)})}},{type:"budget",title:"💰 Budget Recommendations",action:async()=>{if(!e)throw Error("User not authenticated");let t=await l.transactionsService.getByUserId(e.uid),a=t.filter(e=>e.amount>0),s=4e3;if(a.length>0){let e=a.reduce((e,t)=>e+t.amount,0)/a.length;e>500&&(s=Math.round(e))}return n.deepSeekService.generateBudgetRecommendations(t,s)}},{type:"goals",title:"🎯 Savings Goals Help",action:async()=>n.deepSeekService.getFinancialAdvice("Help me set realistic savings goals based on my current financial situation.",{context:"goal_setting"})}],v=()=>{let e=y.current?.parentElement;e&&setTimeout(()=>{e.scrollTop=e.scrollHeight},50)};(0,a.useEffect)(()=>{v()},[d,f]),(0,a.useEffect)(()=>{0===d.length&&m([{id:"welcome",role:"assistant",content:n.deepSeekService?`👋 Hi! I'm your AI financial assistant. I can help you with:

• 💳 **Check My Wallet** - View your current balances across all cards
• 📊 **Analyze My Spending** - Understand your spending patterns and habits  
• 💰 **Budget Recommendations** - Get personalized budget plans based on your income
• 🎯 **Savings Goals Help** - Set and track realistic financial goals
• 💬 **General Financial Questions** - Ask me anything about money management

You can ask me general questions like:
"How do I start investing?" • "What's compound interest?" • "How to pay off credit card debt?" • "Best savings accounts?" • "Emergency fund tips?"

Click any button below or type your questions - I'll access your real financial data for personalized advice, or provide general guidance for any money topic!`:`⚠️ **AI Service Not Configured**

The AI assistant requires a DeepSeek API key to function. To enable AI features:

1. Get an API key from [DeepSeek](https://platform.deepseek.com/)
2. Add it to your \`.env.local\` file as:
   \`NEXT_PUBLIC_DEEPSEEK_API_KEY=your_api_key_here\`
3. Restart the development server

Once configured, you'll be able to:
• 💳 Check your wallet balances
• 📊 Analyze spending patterns  
• 💰 Get budget recommendations
• 🎯 Set savings goals
• 💬 Ask financial questions`,timestamp:new Date}])},[d.length,n.deepSeekService]);let w=(e,t)=>{let a={id:Date.now().toString(),role:e,content:t,timestamp:new Date};m(e=>[...e,a])},k=async t=>{if(!n.deepSeekService){c.default.error("AI service not available. Please check your configuration."),w("assistant","❌ AI service is not available. Please check your API key configuration and try again.");return}if(!e){c.default.error("Please log in to use AI analysis features."),w("assistant","❌ You must be logged in to use AI analysis features.");return}g(!0),w("user",`📊 ${t.title}`),setTimeout(()=>v(),10);try{let e=await t.action();w("assistant",e)}catch(t){console.error("AI analysis failed:",t);let e=t instanceof Error?t.message:"Unknown error occurred";w("assistant",`❌ Sorry, I encountered an error analyzing your data: ${e}. Please try again later.`),c.default.error("AI analysis failed. Please try again.")}finally{g(!1)}},j=async()=>{if(!u.trim())return;if(!n.deepSeekService){console.error("DeepSeek service not available"),c.default.error("AI service not configured. Please check your API key."),w("assistant","❌ AI service is not available. Please check that your NEXT_PUBLIC_DEEPSEEK_API_KEY is configured in your .env.local file.");return}let t=u.trim().toLowerCase(),a=u.trim();p(""),g(!0),setTimeout(()=>v(),10),w("user",a);try{if(["wallet","balance","money","account","card","cards","bank"].some(e=>t.includes(e))&&e){let t,a,s=Date.now();h&&s-h.timestamp<3e5?(t=h.cards,a=h.totalBalance):(a=(t=await l.cardsService.getByUserId(e.uid)).reduce((e,t)=>e+t.balance,0),x({cards:t,totalBalance:a,timestamp:s}));let r=u.trim();if(0===t.length)r+="\n\nNote: The user has no cards in their wallet. They should add some cards to track their finances.";else{let e=t.map(e=>({name:e.name,balance:e.balance,type:e.type,lastFour:e.lastFour||"****"}));r+=`

Current wallet status: Total balance across ${t.length} cards: $${a.toFixed(2)}

Card details: ${JSON.stringify(e)}`}let i=await n.deepSeekService.getFinancialAdvice(r,{context:"wallet_query",hasWalletData:t.length>0});w("assistant",i)}else{let e=await n.deepSeekService.getFinancialAdvice(u.trim());w("assistant",e)}}catch(e){console.error("AI chat failed:",e),w("assistant","Sorry, I'm having trouble responding right now. Please try again in a moment.")}finally{g(!1)}};return(0,t.jsxs)("div",{className:"flex flex-col h-full bg-slate-900",children:[(0,t.jsxs)("div",{className:"flex items-center gap-3 p-4 border-b border-slate-700",children:[(0,t.jsx)("div",{className:"w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center",children:(0,t.jsx)(r,{className:"h-6 w-6 text-white"})}),(0,t.jsxs)("div",{children:[(0,t.jsx)("h2",{className:"text-lg font-serif text-slate-100",children:"AI Financial Assistant"}),(0,t.jsx)("p",{className:"text-sm text-slate-400",children:n.deepSeekService?"Powered by SpendFlow":"⚠️ Service not configured"})]})]}),(0,t.jsxs)("div",{className:"flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth",children:[d.map(e=>(0,t.jsxs)("div",{className:`flex gap-3 ${"user"===e.role?"justify-end":"justify-start"}`,children:["assistant"===e.role&&(0,t.jsx)("div",{className:"w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center flex-shrink-0",children:(0,t.jsx)(r,{className:"h-4 w-4 text-white"})}),(0,t.jsxs)("div",{className:`max-w-[80%] rounded-lg p-3 ${"user"===e.role?"bg-amber-600 text-white":"bg-slate-800 text-slate-100 border border-slate-700"}`,children:[(0,t.jsx)("p",{className:"text-sm whitespace-pre-wrap",children:e.content}),(0,t.jsx)("p",{className:"text-xs opacity-70 mt-2",children:e.timestamp.toLocaleTimeString()})]}),"user"===e.role&&(0,t.jsx)("div",{className:"w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0",children:(0,t.jsx)(i.User,{className:"h-4 w-4 text-slate-300"})})]},e.id)),f&&(0,t.jsxs)("div",{className:"flex gap-3 justify-start",children:[(0,t.jsx)("div",{className:"w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center flex-shrink-0",children:(0,t.jsx)(r,{className:"h-4 w-4 text-white"})}),(0,t.jsx)("div",{className:"bg-slate-800 border border-slate-700 rounded-lg p-3 max-w-[80%]",children:(0,t.jsxs)("div",{className:"flex items-center gap-1",children:[(0,t.jsxs)("div",{className:"flex gap-1",children:[(0,t.jsx)("div",{className:"w-2 h-2 bg-amber-400 rounded-full animate-bounce",style:{animationDelay:"0ms"}}),(0,t.jsx)("div",{className:"w-2 h-2 bg-amber-400 rounded-full animate-bounce",style:{animationDelay:"150ms"}}),(0,t.jsx)("div",{className:"w-2 h-2 bg-amber-400 rounded-full animate-bounce",style:{animationDelay:"300ms"}})]}),(0,t.jsx)("span",{className:"text-slate-400 text-sm ml-2",children:"AI is analyzing your finances..."})]})})]}),1===d.length&&n.deepSeekService&&(0,t.jsxs)("div",{className:"space-y-3",children:[(0,t.jsx)("p",{className:"text-slate-400 text-sm",children:"Quick Analysis:"}),(0,t.jsx)("div",{className:"grid grid-cols-1 gap-2",children:b.map(e=>(0,t.jsxs)("button",{onClick:()=>k(e),disabled:f,className:"p-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-slate-500 rounded-lg text-left transition-colors disabled:opacity-50",children:[(0,t.jsx)("p",{className:"text-slate-200 font-medium",children:e.title}),(0,t.jsxs)("p",{className:"text-slate-400 text-sm mt-1",children:["wallet"===e.type&&"Check your current balances across all cards","spending"===e.type&&"Analyze your spending patterns and habits","budget"===e.type&&"Get personalized budget recommendations","goals"===e.type&&"Help with setting and achieving savings goals"]})]},e.type))})]}),(0,t.jsx)("div",{ref:y})]}),(0,t.jsxs)("div",{className:"p-4 border-t border-slate-700",children:[(0,t.jsxs)("div",{className:"flex gap-2",children:[(0,t.jsx)("input",{type:"text",value:u,onChange:e=>p(e.target.value),onKeyPress:e=>{"Enter"!==e.key||e.shiftKey||(e.preventDefault(),j())},placeholder:n.deepSeekService?"Ask me about your finances...":"AI service not configured...",disabled:f||!n.deepSeekService,className:"flex-1 px-4 py-3 bg-slate-800 border border-slate-600 text-slate-100 rounded-lg focus:border-amber-500 focus:outline-none disabled:opacity-50"}),(0,t.jsx)("button",{onClick:j,disabled:f||!u.trim()||!n.deepSeekService,className:"px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed",children:f?(0,t.jsx)("div",{className:"w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"}):(0,t.jsx)(s.Send,{className:"h-5 w-5"})})]}),(0,t.jsx)("p",{className:"text-xs text-slate-500 mt-2",children:n.deepSeekService?"Press Enter to send • AI responses are for informational purposes only":"Configure API key to enable AI features"})]})]})}var m=e.i(65131),u=e.i(20976);function p(){let{tier:e}=(0,m.useSubscription)(),s=(0,u.useRouter)();return(console.log("🤖 AI Page - Subscription tier:",e),console.log("🤖 AI Page - User subscription status"),(0,a.useEffect)(()=>{console.log("🔄 AI Page redirect check:",{tier:e,shouldRedirect:"free"===e}),"free"===e?(console.log("🚫 Redirecting free user to subscription page"),s.replace("/subscription")):console.log("✅ Allowing access for tier:",e)},[e,s]),"free"===e)?(0,t.jsx)("div",{className:"min-h-screen bg-slate-950 flex items-center justify-center p-4",children:(0,t.jsxs)("div",{className:"max-w-md w-full bg-slate-800 rounded-lg p-6 text-center border border-amber-500/20",children:[(0,t.jsx)("div",{className:"text-amber-400 mb-4",children:(0,t.jsx)("svg",{className:"w-16 h-16 mx-auto",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:(0,t.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M13 10V3L4 14h7v7l9-11h-7z"})})}),(0,t.jsx)("h2",{className:"text-xl font-serif text-slate-100 mb-2",children:"Premium Feature"}),(0,t.jsx)("p",{className:"text-slate-400 mb-6 text-sm",children:"AI Financial Assistant is available for Pro and Enterprise users. Upgrade your plan to access personalized AI insights!"}),(0,t.jsx)("button",{onClick:()=>s.push("/subscription"),className:"w-full px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors font-medium",children:"Upgrade to Pro"})]})}):(0,t.jsx)("div",{className:"min-h-screen bg-slate-950",children:(0,t.jsxs)("div",{className:"max-w-4xl mx-auto",children:[(0,t.jsxs)("div",{className:"px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 pt-8",children:[(0,t.jsx)("div",{className:"w-8 sm:w-12 md:w-16 h-0.5 bg-linear-to-r from-transparent via-amber-400 to-transparent mx-auto sm:mx-0 mb-3 sm:mb-4 md:mb-6"}),(0,t.jsx)("h1",{className:"text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-serif text-slate-100 mb-1 sm:mb-2 tracking-wide text-center sm:text-left",children:"AI FINANCIAL ASSISTANT"}),(0,t.jsx)("div",{className:"w-12 sm:w-16 md:w-20 h-0.5 bg-linear-to-r from-transparent via-amber-400 to-transparent mx-auto sm:mx-0 mb-3 sm:mb-4"}),(0,t.jsxs)("p",{className:"text-slate-400 text-xs sm:text-sm tracking-widest uppercase text-center sm:text-left",children:["Your Personal AI Money Coach - Current Tier: ",e||"unknown"]})]}),(0,t.jsx)("div",{className:"px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8",children:(0,t.jsx)("div",{className:"bg-slate-900 border border-slate-800 rounded-lg h-[600px] overflow-hidden",children:(0,t.jsx)(d,{})})})]})})}function f(){return(0,t.jsx)(p,{})}e.s(["default",()=>f],36329)}]);