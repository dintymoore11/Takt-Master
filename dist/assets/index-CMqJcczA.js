(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=[{name:`Office Building`,type:`office`,levels:3,zonesPerLevel:6,summary:`Office building`,trades:[{key:`framing`,name:`Framing`,color:`#7d8790`,baseCost:1750},{key:`electrical`,name:`Electrical`,color:`#f3c537`,baseCost:1680},{key:`plumbing`,name:`Plumbing`,color:`#2388d1`,baseCost:1700},{key:`drywall`,name:`Drywall`,color:`#d8d2c6`,baseCost:1620},{key:`painting`,name:`Painting`,color:`#78b7e8`,baseCost:1500},{key:`finishes`,name:`Finishes`,color:`#55a85f`,baseCost:1850}]},{name:`Hospital Buildout`,type:`hospital`,levels:4,zonesPerLevel:6,summary:`Hospital project`,trades:[{key:`framing`,name:`Framing`,color:`#7d8790`,baseCost:1850},{key:`plumbing`,name:`Plumbing`,color:`#2388d1`,baseCost:1950},{key:`electrical`,name:`Electrical`,color:`#f3c537`,baseCost:1880},{key:`hvac`,name:`HVAC`,color:`#56c0c9`,baseCost:2050},{key:`fire`,name:`Fire Protection`,color:`#e84f3d`,baseCost:1900},{key:`drywall`,name:`Drywall`,color:`#d8d2c6`,baseCost:1720},{key:`cleanroom`,name:`Cleanroom Finishes`,color:`#a8e7f0`,baseCost:2100},{key:`equipment`,name:`Equipment Install`,color:`#b07ad8`,baseCost:2300}]},{name:`Data Center`,type:`data-center`,levels:1,zonesPerLevel:30,zoneColumns:6,summary:`Data center level`,trades:[{key:`raised-floor`,name:`Structure / Raised Floor Prep`,color:`#8a97a3`,baseCost:2100},{key:`power`,name:`Electrical Distribution`,color:`#ffd84d`,baseCost:2250},{key:`backup-power`,name:`Backup Power`,color:`#ff8a2a`,baseCost:2450},{key:`cooling`,name:`Cooling Infrastructure`,color:`#32c7dc`,baseCost:2350},{key:`data-cabling`,name:`Data Cabling`,color:`#7d7cff`,baseCost:2050},{key:`rack-install`,name:`Server Rack Installation`,color:`#4f6170`,baseCost:2200},{key:`server-equipment`,name:`Server Equipment Installation`,color:`#2fd17c`,baseCost:2550},{key:`commissioning`,name:`Commissioning / Testing`,color:`#d66dff`,baseCost:2400}]},{name:`Wind Farm`,type:`wind-farm`,levels:1,zonesPerLevel:20,zoneColumns:5,summary:`Wind farm field`,trades:[{key:`access-roads`,name:`Access Roads`,color:`#b9975b`,baseCost:1800},{key:`turbine-foundation`,name:`Turbine Foundations`,color:`#8d9298`,baseCost:2100},{key:`tower-erection`,name:`Tower Erection`,color:`#d7dde4`,baseCost:2350},{key:`nacelle-install`,name:`Nacelle Installation`,color:`#8bc4ff`,baseCost:2450},{key:`blade-install`,name:`Blade Installation`,color:`#f5f7fb`,baseCost:2550},{key:`collection-cabling`,name:`Collection Cabling`,color:`#ffcf4d`,baseCost:2050},{key:`substation`,name:`Substation Tie-In`,color:`#b583e8`,baseCost:2300},{key:`wind-commissioning`,name:`Commissioning`,color:`#4ac77b`,baseCost:2200}]},{name:`Housing Development`,type:`housing`,levels:1,zonesPerLevel:24,zoneColumns:6,summary:`Housing development`,trades:[{key:`sitework`,name:`Sitework`,color:`#9b7a4d`,baseCost:1900},{key:`utilities`,name:`Utilities`,color:`#2f9dd6`,baseCost:2e3},{key:`slab-foundation`,name:`Slab Foundations`,color:`#8d9298`,baseCost:2100},{key:`house-framing`,name:`House Framing`,color:`#c58a4a`,baseCost:2150},{key:`roofing`,name:`Roofing`,color:`#7f4f3a`,baseCost:2050},{key:`mep-rough`,name:`MEP Rough-In`,color:`#f3c537`,baseCost:2200},{key:`drywall`,name:`Drywall`,color:`#d8d2c6`,baseCost:1900},{key:`home-finishes`,name:`Home Finishes`,color:`#6bbf6f`,baseCost:2250}]},{name:`Solar Farm`,type:`solar-farm`,levels:1,zonesPerLevel:30,zoneColumns:6,summary:`Solar farm array`,trades:[{key:`access-roads`,name:`Access Roads`,color:`#b9975b`,baseCost:1800},{key:`pile-driving`,name:`Pile Driving`,color:`#8d9298`,baseCost:2050},{key:`solar-racking`,name:`Racking`,color:`#6f8796`,baseCost:2150},{key:`solar-panels`,name:`Panel Install`,color:`#1d5f9f`,baseCost:2300},{key:`collection-cabling`,name:`DC Cabling`,color:`#ffcf4d`,baseCost:2050},{key:`inverters`,name:`Inverters`,color:`#b583e8`,baseCost:2250},{key:`grid-tie`,name:`Grid Tie-In`,color:`#ff8a2a`,baseCost:2350},{key:`solar-commissioning`,name:`Commissioning`,color:`#4ac77b`,baseCost:2200}]},{name:`Airport Expansion`,type:`airport`,levels:1,zonesPerLevel:25,zoneColumns:5,summary:`Airport expansion`,trades:[{key:`earthwork`,name:`Earthwork`,color:`#9b7a4d`,baseCost:2050},{key:`paving`,name:`Runway Paving`,color:`#5a6066`,baseCost:2350},{key:`terminal-structure`,name:`Terminal Structure`,color:`#7d8790`,baseCost:2450},{key:`baggage`,name:`Baggage Systems`,color:`#32c7dc`,baseCost:2250},{key:`jet-bridges`,name:`Jet Bridges`,color:`#8bc4ff`,baseCost:2400},{key:`electrical`,name:`Airfield Electrical`,color:`#f3c537`,baseCost:2300},{key:`security-systems`,name:`Security Systems`,color:`#d66dff`,baseCost:2200},{key:`airport-commissioning`,name:`Commissioning`,color:`#4ac77b`,baseCost:2300}]},{name:`Hotel Sitework`,type:`hotel-site`,levels:1,zonesPerLevel:24,zoneColumns:6,summary:`Hotel dirt work, utilities, and foundations`,trades:[{key:`earthwork`,name:`Dirt Work`,color:`#9b7a4d`,baseCost:2150},{key:`underground`,name:`Underground Utilities`,color:`#2388d1`,baseCost:2250},{key:`deep-foundations`,name:`Deep Foundations`,color:`#8d9298`,baseCost:2450},{key:`slab-foundation`,name:`Grade Beams / Slabs`,color:`#b8bcc0`,baseCost:2350},{key:`waterproofing`,name:`Waterproofing`,color:`#32c7dc`,baseCost:2100},{key:`utility-tie`,name:`Utility Tie-Ins`,color:`#f3c537`,baseCost:2250},{key:`site-inspection`,name:`Site Inspection`,color:`#4ac77b`,baseCost:2e3}]},{name:`Hotel Structure and Skin`,type:`hotel-structure`,levels:6,zonesPerLevel:6,summary:`Hotel structure and skin`,trades:[{key:`structure`,name:`Structure`,color:`#7d8790`,baseCost:2450},{key:`skin`,name:`Exterior Skin`,color:`#78b7e8`,baseCost:2350},{key:`roofing`,name:`Roofing`,color:`#7f4f3a`,baseCost:2200},{key:`elevators`,name:`Elevators`,color:`#b583e8`,baseCost:2550},{key:`mep-rough`,name:`MEP Risers`,color:`#f3c537`,baseCost:2400},{key:`fire`,name:`Fire Protection`,color:`#e84f3d`,baseCost:2250},{key:`skin-inspection`,name:`Envelope Inspection`,color:`#4ac77b`,baseCost:2050}]},{name:`Hotel Interior Finishes`,type:`hotel-interiors`,levels:6,zonesPerLevel:6,summary:`Hotel interior finishes`,trades:[{key:`framing`,name:`Interior Framing`,color:`#7d8790`,baseCost:2150},{key:`guestroom-mep`,name:`Guestroom MEP`,color:`#f3c537`,baseCost:2350},{key:`drywall`,name:`Drywall`,color:`#d8d2c6`,baseCost:2050},{key:`tile`,name:`Tile / Baths`,color:`#78b7e8`,baseCost:2250},{key:`painting`,name:`Paint / Wallcovering`,color:`#b8a5e6`,baseCost:2050},{key:`ff-e`,name:`FF&E`,color:`#6bbf6f`,baseCost:2450},{key:`amenities`,name:`Amenities`,color:`#ffcf4d`,baseCost:2350},{key:`final-inspection`,name:`Final Inspection`,color:`#4ac77b`,baseCost:2150}]}],t=1060,n=2e5,r=5e3,i=5e3,a=1e4,o=.28,s=`ABCDEFGHIJKLMNOPQRSTUVWXYZ`.split(``),c=[`SPACE`,`DEL`,`SAVE`],l=[{name:`High Variability`,dice:[1,2,3,4,5,6],note:`Fast swings, rough planning`},{name:`Medium Variability`,dice:[2,3,4,5],note:`Balanced production`},{name:`Low Variability`,dice:[3,4],note:`Reliable takt rhythm`}],u=e=>new URL(e,import.meta.url).href,d={generic:{worker:u(`./trades/worker-generic.svg`),work:u(`./trades/work-generic.svg`)}},ee={generic:u(`./buildings/generic.svg`),office:u(`./buildings/office.svg`),hospital:u(`./buildings/hospital.svg`),"data-center":u(`./buildings/data-center.svg`),"wind-farm":u(`./buildings/wind-farm.svg`)},te={barricade:u(`./roadblocks/barricade.svg`)},ne={die:u(`./ui/die.svg`),start:u(`./ui/start.svg`)};function f(e){return ee[e?.type]??ee.generic}function re(e=`barricade`){return te[e]??te.barricade}function ie(e){return ne[e]}var ae=(e=``)=>e.split(/[\s/]+/).filter(Boolean).map(e=>e[0]).join(``).slice(0,3),p={workerClass:`worker-generic`,workClass:`work-generic`,workerAsset:d.generic.worker,workAsset:d.generic.work,animation:`default`,label:`TR`},m=(e,t,n)=>({workerClass:`worker-${e}`,workClass:`work-${e}`,workerAsset:d[e]?.worker??d.generic.worker,workAsset:d[e]?.work??d.generic.work,animation:t,label:n}),oe={framing:m(`framing`,`studs`,`FR`),electrical:m(`electrical`,`wire-pull`,`EL`),plumbing:m(`plumbing`,`pipes`,`PL`),drywall:m(`drywall`,`panels`,`DW`),painting:m(`painting`,`roller`,`PT`),finishes:m(`finishes`,`fixtures`,`FN`),hvac:m(`hvac`,`ducts`,`HV`),fire:m(`fire`,`sprinklers`,`FP`),cleanroom:m(`cleanroom`,`sterile-finish`,`CF`),equipment:m(`equipment`,`equipment`,`EQ`),"raised-floor":m(`raised-floor`,`raised-floor`,`RF`),power:m(`power`,`power-glow`,`PW`),"backup-power":m(`backup-power`,`ups`,`BP`),cooling:m(`cooling`,`cooling`,`CL`),"data-cabling":m(`data-cabling`,`data-cables`,`DC`),"rack-install":m(`rack-install`,`racks`,`RK`),"server-equipment":m(`server-equipment`,`servers`,`SV`),commissioning:m(`commissioning`,`testing`,`CM`)};function h(e){if(e?.visual)return e.visual;let t=e?.visualKey??e?.key;return oe[t]||{...p,workerClass:`worker-${t}`,workClass:`work-${t}`,workerAsset:d[t]?.worker??p.workerAsset,workAsset:d[t]?.work??p.workAsset,label:ae(e?.name)||p.label}}function se(){return{phase:`title`,roundPhase:`idle`,mode:null,projectRound:1,totalProfit:0,gameOver:!1,day:0,profit:n,laborCost:0,pushCost:0,delayCost:0,totalDelayDays:0,liquidatedDamages:0,selectedTradeIndex:0,selectedZone:1,focusArea:`zones`,selectedRoadblockIndex:0,trades:[],roadblocks:[],logs:[],timer:null,zoneWorkThisRound:new Set,lastTradeByZone:{},scoreName:``,scoreSaved:!1,nameCursor:0,quitConfirm:!1,endActionIndex:0}}function ce(e,t){let n=e.visualKey??e.key;return{...e,id:t,visualKey:n,visual:h({...e,visualKey:n}),zone:+(t===0),progress:0,finished:!1,morale:100,pushes:0,delayedToday:!1,lastRoll:null,pendingSteps:0,waitReason:``,zoneStarts:{},zoneWorkWeeks:{},finishDay:null,pushedUntil:0,pushFlash:``,previousZone:null,frustratedUntil:0,frustrationReason:``}}var g=()=>{};function le(e){g=e}function _(){g()}var v=se();function ue(){return de().map(ce)}function y(){return e[Math.min(v.projectRound-1,e.length-1)]}function de(){return y().trades}function b(){return y().levels*y().zonesPerLevel}function x(){return y().zonesPerLevel}function S(){return y().zoneColumns??x()}function C(){return y().levels}function fe(){return Array.from({length:C()},(e,t)=>C()-t)}function pe(e){v.projectRound=1,v.totalProfit=0,v.gameOver=!1,w(e)}function w(e){M(),v.phase=`running`,v.roundPhase=`rolling`,v.mode=e,v.gameOver=!1,v.day=0,v.profit=O(),v.laborCost=0,v.pushCost=0,v.delayCost=0,v.totalDelayDays=0,v.liquidatedDamages=0,v.selectedTradeIndex=0,v.selectedZone=1,v.focusArea=`zones`,v.selectedRoadblockIndex=0,v.trades=ue(),v.roadblocks=[],v.lastTradeByZone={},v.scoreName=``,v.scoreSaved=!1,v.quitConfirm=!1,v.endActionIndex=0,v.logs=[`Project started with ${e.name}.`],me()}function T(){if(v.projectRound>=e.length){A();return}v.projectRound+=1,v.quitConfirm=!1,v.phase=`setup`,v.mode=null,v.endActionIndex=0,_()}function me(){v.phase===`running`&&(v.day+=1,v.roundPhase=`rolling`,v.zoneWorkThisRound=new Set,v.trades.forEach(e=>{e.delayedToday=!1,e.pendingSteps=0,e.waitReason=``,e.lastRoll=e.finished?e.lastRoll:null,e.previousZone=null,e.frustratedUntil<Date.now()&&(e.frustrationReason=``)}),Te(),he(),_(),v.timer=window.setTimeout(ge,t))}function he(){v.trades.forEach((e,t)=>{if(t>=E()||e.finished)return;let n=Se(e);if(n){e.delayedToday=!0,e.waitReason=`roadblock`,D(e,`roadblock`),P(e,6),N(`${e.name} lost a day to ${n.label}.`);return}e.zone>0&&(e.zoneStarts[e.zone]=e.zoneStarts[e.zone]??v.day,xe(e,e.zone));let r=U(v.mode.dice);e.lastRoll=r,e.pendingSteps=r})}function E(){return Math.min(v.day,v.trades.length)}function ge(){v.phase===`running`&&(v.roundPhase=`moving`,_e())}function _e(){if(v.phase!==`running`)return;let e=ye();_();let t=v.trades.some(e=>!e.finished&&e.pendingSteps>0&&!e.delayedToday);if(e&&t){v.timer=window.setTimeout(_e,De());return}if(e){v.timer=window.setTimeout(ve,De());return}ve()}function ve(){v.roundPhase=`settling`,v.trades.forEach(e=>{e.previousZone=null}),we(),Ae(),ke(),je(),v.trades.every(e=>e.finished)&&Pe(),_(),v.phase===`running`&&(v.timer=window.setTimeout(me,Oe()))}function ye(){let e=!1;return[...v.trades].filter(e=>!e.finished&&e.pendingSteps>0&&!e.delayedToday).sort((e,t)=>t.zone-e.zone).forEach(t=>{let n=Se(t);if(n){t.delayedToday=!0,t.waitReason=`roadblock`,t.pendingSteps=0,D(t,`roadblock`),P(t,6),N(`${t.name} lost a day to ${n.label}.`);return}if(!be(t)){t.waitReason===`blocked`&&P(t,4),t.pendingSteps=0;return}e=!0}),e}function be(e){let t=e.zone+1;if(t<=b()){let n=Ce(t,e.id);if(n)return e.delayedToday=!0,e.waitReason=`blocked`,D(e,`blocked`),N(`${e.name} waited for ${n.name} to clear zone ${t}.`),!1;if(v.zoneWorkThisRound.has(t))return e.delayedToday=!0,e.waitReason=`spacing`,N(`${e.name} waited because zone ${t} was already worked today.`),!1}let n=e.zone;return e.previousZone=n,e.zone=t,e.progress=0,e.pendingSteps=Math.max(0,e.pendingSteps-1),e.zone>b()?(n>0&&(v.lastTradeByZone[n]=e.id),e.zone=b(),e.finished=!0,e.pendingSteps=0,e.finishDay=v.day,N(`${e.name} completed zone ${b()}.`)):(n>0&&(v.lastTradeByZone[n]=e.id),e.zoneStarts[e.zone]=e.zoneStarts[e.zone]??v.day,xe(e,e.zone)),!0}function xe(e,t){v.zoneWorkThisRound.add(t),e.zoneWorkWeeks[t]=e.zoneWorkWeeks[t]??[],e.zoneWorkWeeks[t].includes(v.day)||e.zoneWorkWeeks[t].push(v.day)}function D(e,t){e.frustratedUntil=Date.now()+1800,e.frustrationReason=t,window.setTimeout(_,1850)}function Se(e){return v.roadblocks.find(t=>!t.resolved&&t.tradeId===e.id&&t.zone<=e.zone)}function Ce(e,t){return v.trades.find(n=>!n.finished&&n.id!==t&&n.zone===e)}function we(){v.trades.forEach(e=>{if(e.finished||e.zone===0)return;let t=1+(100-e.morale)/100,n=Math.round(e.baseCost*t);v.laborCost+=n,v.profit-=n})}function Te(){if(Math.random()>Ee())return;let e=v.trades.filter((e,t)=>t<E()&&!e.finished&&e.zone<b());if(e.length===0)return;let t=U(e),n=Be(Math.min(b(),t.zone+1),Math.min(b(),t.zone+5));v.roadblocks.some(e=>!e.resolved&&e.zone===n)||(v.roadblocks.push({id:crypto.randomUUID(),tradeId:t.id,zone:n,label:U([`Permit hold`,`Missing material`,`Design answer`,`Inspection issue`]),visualKey:`barricade`,resolved:!1,delayDays:0}),N(`Roadblock spawned for ${t.name} at zone ${n}.`))}function Ee(){return Math.min(.78,o+(v.projectRound-1)*.055)}function O(){return n}function k(){return Math.max(20,30-(v.projectRound-1)*2)}function De(){return Math.max(150,325-(v.projectRound-1)*18)}function Oe(){return Math.max(300,625-(v.projectRound-1)*22)}function ke(){v.day<=k()||(v.liquidatedDamages+=a,v.profit-=a)}function Ae(){v.roadblocks.forEach(e=>{if(e.resolved)return;let t=v.trades[e.tradeId];t.zone>=e.zone&&!t.finished&&(e.delayDays+=1,v.totalDelayDays+=1,v.delayCost+=r,v.profit-=r)})}function je(){v.roadblocks=v.roadblocks.filter(e=>!e.resolved)}function Me(){if(v.phase!==`running`)return;let e=v.roadblocks.find(e=>e.zone===v.selectedZone);if(!e){N(`No roadblock in zone ${v.selectedZone}.`),_();return}e.resolved=!0,N(`${F(e.tradeId).name} roadblock resolved.`),je(),_()}function Ne(e=v.trades[v.selectedTradeIndex]){if(v.phase!==`running`)return;let t=e;if(!t||t.finished)return;let n=v.roadblocks.find(e=>!e.resolved&&e.tradeId===t.id&&e.zone<=t.zone);if(n){N(`${t.name} cannot push through ${n.label}.`),_();return}t.pushes+=1,t.pendingSteps+=1,t.lastRoll=Math.min(Math.max(t.lastRoll??0,0)+1,Math.max(...v.mode.dice)),t.pushedUntil=Date.now()+1800,t.pushFlash=`-${W(i)}`,P(t,9),v.pushCost+=i,v.profit-=i,N(`${t.name} pushed for ${W(i)}.`),_(),window.setTimeout(_,1850)}function Pe(){M(),Fe(),v.totalProfit+=v.profit,v.gameOver=v.profit<0,v.phase=v.gameOver?`gameOver`:v.projectRound>=e.length?`win`:`ended`,v.quitConfirm=!1,v.endActionIndex=0,v.gameOver&&(v.scoreName=``,v.scoreSaved=!1,v.nameCursor=0),N(`Project finished on day ${v.day}.`)}function A(){v.phase=`nameEntry`,v.scoreName=``,v.scoreSaved=!1,v.nameCursor=0,v.quitConfirm=!1,_()}function j(){M(),v.phase=`title`,v.roundPhase=`idle`,v.mode=null,v.projectRound=1,v.totalProfit=0,v.gameOver=!1,v.scoreName=``,v.scoreSaved=!1,v.nameCursor=0,v.quitConfirm=!1,v.endActionIndex=0,_()}function Fe(){v.liquidatedDamages=Math.max(v.liquidatedDamages,Math.max(0,v.day-k())*a)}function M(){v.timer&&=(window.clearTimeout(v.timer),null)}function N(e){v.logs=[e,...v.logs].slice(0,7)}function P(e,t){e.morale=Math.max(0,e.morale-t)}function F(e){return v.trades.find(t=>t.id===e)}function I(){return v.trades.find(e=>!e.finished&&e.zone===v.selectedZone)??F(v.lastTradeByZone[v.selectedZone])}function Ie(e){let t=F(e.tradeId),n=e.zone-t.zone;return n<=0?-e.delayDays:n}function Le(e){return Math.ceil(e/x())}function L(e){return(e-1)%x()+1}function R(e){let t=L(e);if(B()){let e=Math.ceil(t/S()),n=(t-1)%S()+1;return e%2==0?S()-n+1:n}return Le(e)%2==0?x()-t+1:t}function z(e){return Math.ceil(L(e)/S())}function B(){return[`data-center`,`wind-farm`,`housing`,`solar-farm`,`airport`,`hotel-site`].includes(y().type)}function V(e,t){let n=Math.max(1,Math.min(C(),e)),r=n%2==0?x()-t+1:t;return(n-1)*x()+r}function H(e,t){let n=Math.max(1,Math.min(Math.ceil(x()/S()),e)),r=Math.max(1,Math.min(S(),t)),i=n%2==0?S()-r+1:r;return Math.min(x(),(n-1)*S()+i)}function Re(e){let t=(e-1)*x()+1,n=Array.from({length:x()},(e,n)=>t+n);return B()?Array.from({length:Math.ceil(n.length/S())},(e,t)=>{let r=n.slice(t*S(),t*S()+S());return t%2==1?r.reverse():r}).flat():e%2==0?n.reverse():n}function ze(e){if(e.pushedUntil>Date.now())return`😡`;let{morale:t}=e;return t>=80?`😊`:t>=55?`🙂`:t>=30?`☹️`:`😡`}function U(e){return e[Math.floor(Math.random()*e.length)]}function Be(e,t){return Math.floor(Math.random()*(t-e+1))+e}function W(e){return new Intl.NumberFormat(`en-US`,{style:`currency`,currency:`USD`,maximumFractionDigits:0}).format(e)}function G(e){let t=K();return t.length<8?!0:e>Math.min(...t.map(e=>e.earnings))}function K(){try{return JSON.parse(localStorage.getItem(`taktTowersLeaderboard`)??`[]`)}catch{return[]}}function Ve(){if(v.scoreSaved)return;if(!G(v.totalProfit)){v.phase=`scoreResult`,_();return}let e=(v.scoreName||`AAA`).trim().toUpperCase().slice(0,12)||`AAA`,t=[...K(),{name:e,project:v.projectRound,earnings:v.totalProfit}].sort((e,t)=>t.earnings-e.earnings).slice(0,8);localStorage.setItem(`taktTowersLeaderboard`,JSON.stringify(t)),v.scoreName=e,v.scoreSaved=!0,_()}function He(){j()}function Ue(){v.phase=G(v.totalProfit)?`nameEntry`:`scoreResult`,_()}function We(){let e=[...s,...c][v.nameCursor];if(e===`SPACE`)v.scoreName.length<12&&(v.scoreName+=` `);else if(e===`DEL`)v.scoreName=v.scoreName.slice(0,-1);else if(e===`SAVE`){Ve();return}else v.scoreName.length<12&&(v.scoreName+=e);_()}var Ge=9e4,q=document.querySelector(`#app`),J=null;function Ke(){J&&=(window.clearTimeout(J),null),v.phase!==`title`&&(J=window.setTimeout(()=>{J=null,v.phase!==`title`&&j()},Ge))}function Y(){Ke()}function X(){if(Ke(),v.phase===`title`){q.innerHTML=qe(),Dt();return}if(v.phase===`setup`){q.innerHTML=Je(),Ot();return}if(v.phase===`nameEntry`){q.innerHTML=Xe(),kt();return}if(v.phase===`gameOver`){q.innerHTML=Ze(),At();return}if(v.phase===`scoreResult`){q.innerHTML=Qe(),jt();return}if(v.phase===`win`){q.innerHTML=$e(),Mt();return}q.innerHTML=et(),Nt()}function qe(){return`
    <main class="title-screen">
      <section class="title-copy">
        <p class="eyebrow">Arcade Construction Simulation</p>
        <h1>Takt Master</h1>
        <h2>Build with flow.</h2>
        <p class="summary">Sequence trades through an office building, clear roadblocks, protect morale, and finish projects before budget and schedule run out.</p>
        <button class="start-button" type="button" data-start>
          <img class="button-icon" src="${ie(`start`)}" alt="" aria-hidden="true">
          Start
        </button>
        <p class="press-start">Press S</p>
      </section>
      <section class="title-sidebar">
        <section class="leaderboard title-board">
          <strong>Leaderboard</strong>
          ${$()}
        </section>
        <section class="project-picker">
          <strong>Test Project</strong>
          <div>
            ${e.map((e,t)=>`
              <button type="button" data-test-project="${t+1}">
                <span>${t+1}</span>
                ${e.name}
              </button>
            `).join(``)}
          </div>
        </section>
      </section>
      <section class="demo-cabinet" aria-label="Gameplay preview">
        <div class="demo-tower">
          ${e[0].levels?Array.from({length:e[0].levels},(t,n)=>e[0].levels-n).map(t=>`
            <div class="demo-level">
              <span>Level ${t}</span>
              ${Array.from({length:e[0].zonesPerLevel},(t,n)=>`<i style="--delay: ${n}; --color: ${e[0].trades[n%e[0].trades.length].color}"></i>`).join(``)}
            </div>
          `).join(``):``}
        </div>
      </section>
    </main>
  `}function Je(){let e=y();return`
    <main class="setup-screen project-setup">
      <div class="setup-stage" aria-hidden="true">
        ${Ye()}
      </div>
      <section class="setup-overlay">
        <p class="eyebrow">Project ${v.projectRound}</p>
        <h1>${e.name}</h1>
        <h2>Takt Master</h2>
        <p class="setup-subtitle">Build with flow.</p>
        <p class="summary">${e.summary}, ${C()} levels, ${b()} zones, ${de().length} trades, ${W(O())} budget, ${k()} day schedule.</p>
        <section class="briefing-panel">
          ${Q(`Project`,v.projectRound)}
          ${Q(`Budget`,W(O()))}
          ${Q(`Schedule`,`${k()} days`)}
        </section>
        <section class="mode-grid" aria-label="Variability mode">
          ${l.map((e,t)=>`
              <button class="mode-button" data-mode="${t}" type="button">
                <span class="mode-key">${t+1}</span>
                <span class="mode-title">${e.name}</span>
                <span class="dice-row">${e.dice.map(e=>`<span class="die">${e}</span>`).join(``)}</span>
                <span class="mode-note">${e.note}</span>
              </button>
            `).join(``)}
        </section>
      </section>
    </main>
  `}function Ye(){let e=y();return`
    <section class="tower ${e.type}-tower setup-preview-tower" style="--building-asset: url('${f(e)}')">
      ${fe().map(e=>`
        <div class="tower-level">
          <div class="level-label">Level ${e}</div>
          <div class="level-zones" style="--zone-columns: ${S()}">
            ${Re(e).map(e=>`
              <div class="tower-zone preview-zone">
                <span class="zone-number">${e}</span>
              </div>
            `).join(``)}
          </div>
        </div>
      `).join(``)}
      <div class="ground"></div>
    </section>
  `}function Xe(){return v.scoreSaved?`
      <main class="name-screen">
        <section class="name-card">
          <p class="eyebrow">Score Saved</p>
          <h1>Leaderboard</h1>
          <p class="final-score">${v.scoreName} · Final score ${W(v.totalProfit)} · Last project ${v.projectRound}</p>
          <button class="start-button" type="button" data-home>Home</button>
          <p class="name-help">Press S, Space, or Enter</p>
        </section>
        <section class="leaderboard standalone">
          <strong>Leaderboard</strong>
          ${$()}
        </section>
      </main>
    `:`
    <main class="name-screen">
      <section class="name-card">
        <p class="eyebrow">Game Over</p>
        <h1>Enter Name</h1>
        <p class="final-score">Final score ${W(v.totalProfit)} · Last project ${v.projectRound}</p>
        <div class="name-display">${(v.scoreName||`___`).padEnd(3,`_`)}</div>
        <div class="letter-grid">
          ${[...s,...c].map((e,t)=>`
            <button class="${t===v.nameCursor?`selected`:``}" data-letter="${t}" type="button">${e}</button>
          `).join(``)}
        </div>
        <p class="name-help">Arrow keys move · Space selects · Enter saves</p>
      </section>
      <section class="leaderboard standalone">
        <strong>Leaderboard</strong>
        ${$()}
      </section>
    </main>
  `}function Ze(){let e=G(v.totalProfit);return`
    <main class="name-screen">
      <section class="name-card">
        <p class="eyebrow">Game Over</p>
        <h1>You Lost</h1>
        <p class="final-score">Career earnings ${W(v.totalProfit)}</p>
        <div class="briefing-panel compact-results">
          ${Q(`Last project`,y().name)}
          ${Q(`Project profit`,W(v.profit),v.profit<0?`bad`:``)}
          ${gt()}
          ${Q(`Costs`,W(Z()))}
          ${Q(`Schedule efficiency`,`${Ct().toFixed(0)}%`)}
        </div>
        <button class="start-button" type="button" data-continue>${e?`Enter Name`:`Results`}</button>
        <p class="name-help">Press Space, Enter, or S</p>
      </section>
      <section class="leaderboard standalone">
        <strong>Leaderboard</strong>
        ${$()}
      </section>
    </main>
  `}function Qe(){return`
    <main class="name-screen">
      <section class="name-card">
        <p class="eyebrow">Game Over</p>
        <h1>Final Score</h1>
        <p class="final-score">${W(v.totalProfit)} · Last project ${v.projectRound}</p>
        <p class="name-help">Not enough for the leaderboard</p>
        <button class="start-button" type="button" data-home>Home</button>
        <p class="name-help">Press S, Space, Enter, or End</p>
      </section>
      <section class="leaderboard standalone">
        <strong>Leaderboard</strong>
        ${$()}
      </section>
    </main>
  `}function $e(){return`
    <main class="win-screen">
      <div class="fireworks">
        <span></span><span></span><span></span><span></span><span></span>
      </div>
      <section class="win-card">
        <p class="eyebrow">Grand Opening</p>
        <h1>You Won</h1>
        <p class="summary">The hotel is open, the ribbon is cut, and your construction career ends in a successful retirement.</p>
        <div class="ribbon-cutting">
          <span class="ribbon left"></span>
          <span class="scissors"></span>
          <span class="ribbon right"></span>
        </div>
        <p class="final-score">Career earnings ${W(v.totalProfit)}</p>
        <button class="start-button" type="button" data-continue>Enter Leaderboard</button>
        <p class="name-help">Press Space, Enter, or S</p>
      </section>
    </main>
  `}function et(){return`
    <main class="game-shell phase-${v.roundPhase}">
      <section class="unity-frame">
        <div class="stage">
          <header class="topbar">
            <div class="topbar-title">
              <strong>Takt Master</strong>
              <span>${v.mode.name} · Project ${v.projectRound}</span>
            </div>
            <div class="arcade-hud">
              <div class="hud-tile profit ${v.profit<0?`bad`:``}">
                <span>Profit</span>
                <strong>${W(v.profit)}</strong>
              </div>
              <div class="hud-tile day ${v.day>k()?`bad`:``}">
                <span>Day</span>
                <strong>${v.day}</strong>
                <em>/${k()}</em>
              </div>
            </div>
            <div class="topbar-secondary">
              ${rt()}
              ${it()}
            </div>
          </header>
          ${tt()}

          <div class="playfield">
            ${at()}
          </div>
        </div>
        <footer class="unity-footer">
          <span>Takt Master</span>
          <button class="fullscreen-fake" type="button" aria-label="Fullscreen preview"></button>
        </footer>
      </section>
      ${v.phase===`ended`?ht():``}
    </main>
  `}function tt(){return v.phase!==`running`||v.liquidatedDamages<=0?``:`
    <div class="live-damages ${v.liquidatedDamages===1e4?`first-hit`:``}">
      Liquidated damages -${W(v.liquidatedDamages)}
    </div>
  `}function nt(){return v.laborCost+v.pushCost}function Z(){return nt()+v.delayCost+v.liquidatedDamages}function rt(){let e=k(),t=Math.min(100,v.day/e*100);return`
    <div class="schedule ${v.day>e?`overrun`:``}" aria-label="Project schedule">
      <div class="schedule-meta">
        <span>Start</span>
        <strong>Day ${v.day} / ${e}</strong>
        <span>Finish</span>
      </div>
      <div class="schedule-track">
        <span class="milestone start"></span>
        <span class="schedule-fill" style="width: ${t}%"></span>
        <span class="today-marker" style="left: ${t}%"></span>
        <span class="milestone finish"></span>
      </div>
    </div>
  `}function it(){let e=O(),t=Z(),n=Math.min(130,t/e*100);return`
    <div class="budget-gauge ${t>e?`overrun`:``}" aria-label="Project budget and costs">
      <div class="budget-column">
        <span class="cost-fill" style="height: ${n}%"></span>
        <span class="budget-marker"></span>
      </div>
      <div class="budget-labels">
        <span>Budget <strong>${W(e)}</strong></span>
        <span>Costs <strong>${W(t)}</strong></span>
      </div>
    </div>
  `}function Q(e,t,n=``){return`
    <div class="stat ${n}">
      <span>${e}</span>
      <strong>${t}</strong>
    </div>
  `}function at(){let e=y();return`
    <section class="tower ${e.type}-tower" aria-label="${e.name} with ${b()} zones" style="--building-asset: url('${f(e)}')">
      ${fe().map(e=>ot(e)).join(``)}
      <div class="ground"></div>
    </section>
  `}function ot(e){return`
    <div class="tower-level">
      <div class="level-label">Level ${e}</div>
      <div class="level-zones" style="--zone-columns: ${S()}">
        ${Re(e).map(e=>st(e)).join(``)}
      </div>
    </div>
  `}function st(e){let t=v.trades.filter(t=>t.zone===e&&!t.finished),n=v.roadblocks.filter(t=>t.zone===e),r=v.selectedZone===e,i=lt(e);return`
    <button class="tower-zone ${r?`selected-zone`:``}" data-zone="${e}" type="button">
      <span class="zone-number">${e}</span>
      <div class="office-work">
        ${ct(e)}
      </div>
      <div class="work-stack">
        ${t.map(e=>ut(e)).join(``)}
      </div>
      ${i?`<span class="delay-callout">${i}</span>`:``}
      ${n.map(e=>pt(e)).join(``)}
    </button>
  `}function ct(e){return v.trades.filter(t=>t.zoneWorkWeeks[e]?.length).map(t=>{let n=t.zone===e&&!t.finished,r=h(t);return`<span class="work-layer ${r.workClass} ${n?`active-work`:``}" style="--work-asset: url('${r.workAsset}')"></span>`}).join(``)}function lt(e){let t=v.roadblocks.find(t=>{let n=F(t.tradeId);return!t.resolved&&t.delayDays>0&&t.zone===e&&n&&n.zone===e&&!n.finished});return t?`delay -${W(t.delayDays*r)}`:``}function ut(e){let t=h(e),n=ft(e),r=e.frustratedUntil>Date.now(),i=e.delayedToday&&e.waitReason!==`spacing`,a=e.morale<70||i||e.pushedUntil>Date.now()||r,o=r?`frustrated frustration-${e.frustrationReason}`:``;return`
    <span class="worker ${t.workerClass} ${n} ${o} ${v.roundPhase===`moving`&&e.pendingSteps>0?`moving`:``}" style="--trade-color: ${e.color}; --worker-asset: url('${t.workerAsset}')">
      <span class="hardhat"></span>
      <span class="head"></span>
      <span class="torso"></span>
      <span class="arm arm-left"></span>
      <span class="arm arm-right"></span>
      <span class="leg leg-left"></span>
      <span class="leg leg-right"></span>
      <span class="tool"></span>
      <span class="worker-label">${dt(e)}</span>
      ${mt(e)}
      ${a?`<span class="worker-morale">${ze(e)}</span>`:``}
      ${r?`<span class="frustration-burst">!</span>`:``}
    </span>
  `}function dt(e){return h(e).label}function ft(e){if(!e.previousZone||e.previousZone===e.zone||e.finished)return``;if(B()){let t=z(e.previousZone),n=z(e.zone),r=R(e.previousZone),i=R(e.zone);if(t<n)return`entered-from-up`;if(t>n)return`entered-from-down`;if(r<i)return`entered-from-left`;if(r>i)return`entered-from-right`}return R(e.previousZone)<=R(e.zone)?`entered-from-left`:`entered-from-right`}function pt(e){let t=v.selectedZone===e.zone,n=F(e.tradeId),r=Ie(e),i=re(e.visualKey);return`
    <span class="tower-blocker ${t?`selected`:``}" style="--trade-color: ${n.color}">
      <img class="roadblock-asset" src="${i}" alt="" aria-hidden="true">
      <span class="barricade">
        <i></i>
      </span>
      <b class="${r<0?`negative`:``}">${r}</b>
    </span>
  `}function mt(e){let t=v.roundPhase===`rolling`&&!e.finished&&e.pendingSteps>0,n=e.pushedUntil>Date.now();return`
    <span class="trade-die ${t?`rolling`:``} ${e.lastRoll?`rolled`:``} ${n?`pushed`:``}">
      <img class="die-asset" src="${ie(`die`)}" alt="" aria-hidden="true">
      ${e.lastRoll??`?`}
    </span>
  `}function ht(){let t=v.profit/O()*100,n=v.quitConfirm?`<button class="restart danger ${v.endActionIndex===1?`selected-action`:``}" type="button" data-confirm-quit>Confirm Quit</button>`:`<button class="restart secondary ${v.endActionIndex===1?`selected-action`:``}" type="button" data-quit>Quit Game</button>`;return`
    <section class="end-modal" role="dialog" aria-modal="true" aria-label="Project complete">
      <div class="end-screen">
        <div>
          <p class="eyebrow">${v.gameOver?`Game Over`:`Project ${v.projectRound} Complete`}</p>
          <h2>Total profit ${W(v.profit)} (${t.toFixed(1)}%)</h2>
          ${v.gameOver?`<p class="final-score">Final score ${W(v.totalProfit)}</p>`:`<p class="final-score">Career profit ${W(v.totalProfit)}</p>`}
        </div>
        <div class="end-stats">
          ${gt()}
          ${Q(`Costs`,W(Z()))}
          ${Q(`Schedule efficiency`,`${Ct().toFixed(0)}%`)}
        </div>
        ${v.liquidatedDamages>0?`<div class="damages-flash">Liquidated damages -${W(v.liquidatedDamages)}</div>`:``}
        ${_t()}
        <div class="end-actions">
          <button class="restart ${v.endActionIndex===0?`selected-action`:``}" type="button" data-restart>${v.gameOver?`New Game`:v.projectRound>=e.length?`Finish Game`:`Next Project`}</button>
          ${v.gameOver?``:n}
        </div>
      </div>
    </section>
  `}function gt(){let e=k()-v.day;return e>=0?Q(`Days early`,`${e} days`):Q(`Days late`,`${Math.abs(e)} days`,`bad`)}function $(){let e=K();return e.length===0?`<p>No scores yet</p>`:e.map((e,t)=>`
        <div>
          <span>${t+1}. ${e.name}</span>
          <span>Project ${e.project}</span>
          <b>${W(e.earnings)}</b>
        </div>
      `).join(``)}function _t(){let e=Array.from({length:v.day},(e,t)=>t+1);return`
    <div class="takt-plan">
      <div class="takt-title">
        <strong>As-Built Takt Plan</strong>
        <span>Working days</span>
      </div>
      <div class="zone-plan" style="--week-count: ${v.day}">
        ${St()}
        <div class="zone-plan-header">
          <span>Zone</span>
          <div>${e.map(e=>`<span>${e}</span>`).join(``)}</div>
        </div>
        ${Array.from({length:C()},(e,t)=>t+1).map(t=>vt(t,e)).join(``)}
      </div>
    </div>
  `}function vt(e,t){return`
    <div class="zone-plan-group">Level ${e}</div>
    ${Et(e).map(e=>yt(e,t)).join(``)}
  `}function yt(e,t){let n=xt(e,t);return`
    <div class="zone-plan-row" style="--lane-count: ${n.laneCount}">
      <strong>${e}</strong>
      <div class="zone-plan-track">
        ${bt(n.bars)}
      </div>
    </div>
  `}function bt(e){return e.map(({trade:e,start:t,end:n,lane:r})=>`
        <span
          class="plan-bar"
          style="--start: ${t}; --duration: ${n-t+1}; --lane: ${r}; background: ${e.color}"
          title="${e.name}, day ${t}-${n}"
        ></span>
      `).join(``)}function xt(e,t){let n=v.trades.flatMap(n=>Tt(n,e,t)).sort((e,t)=>e.start-t.start||e.end-t.end),r=[];return{bars:n.map(e=>{let t=r.findIndex(t=>t<e.start);return t===-1&&(t=r.length,r.push(0)),r[t]=e.end,{...e,lane:t+1}}),laneCount:Math.max(1,r.length)}}function St(){return`
    <div class="trade-legend">
      <strong>Trades</strong>
      ${v.trades.map(e=>`
            <span>
              <i style="background: ${e.color}"></i>
              ${e.name}
            </span>
          `).join(``)}
    </div>
  `}function Ct(){let e=0,t=0;return Array.from({length:b()},(e,t)=>t+1).forEach(n=>{let r=wt(n);r.length!==0&&(e+=r.length,t+=Math.max(1,r[r.length-1]-r[0]+1))}),t===0?0:e/t*100}function wt(e){return[...new Set(v.trades.flatMap(t=>t.zoneWorkWeeks[e]??[]))].sort((e,t)=>e-t)}function Tt(e,t,n){let r=e.zoneWorkWeeks[t]??[],i=n.filter(e=>r.includes(e));if(i.length===0)return[];let a=[],o=i[0],s=i[0];return i.slice(1).forEach(t=>{if(t===s+1){s=t;return}a.push({trade:e,start:o,end:s}),o=t,s=t}),a.push({trade:e,start:o,end:s}),a}function Et(e){let t=(e-1)*x()+1;return Array.from({length:x()},(e,n)=>t+n)}function Dt(){document.querySelector(`[data-start]`)?.addEventListener(`click`,()=>{v.projectRound=1,v.totalProfit=0,v.gameOver=!1,v.phase=`setup`,X()}),document.querySelectorAll(`[data-test-project]`).forEach(e=>{e.addEventListener(`click`,()=>{v.projectRound=Number(e.dataset.testProject),v.totalProfit=0,v.gameOver=!1,v.phase=`setup`,X()})})}function Ot(){document.querySelectorAll(`[data-mode]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=l[Number(e.dataset.mode)];v.projectRound===1&&v.totalProfit===0?pe(t):w(t)})})}function kt(){document.querySelector(`[data-home]`)?.addEventListener(`click`,He),document.querySelectorAll(`[data-letter]`).forEach(e=>{e.addEventListener(`click`,()=>{v.nameCursor=Number(e.dataset.letter),We()})})}function At(){document.querySelector(`[data-continue]`)?.addEventListener(`click`,Ue)}function jt(){document.querySelector(`[data-home]`)?.addEventListener(`click`,j)}function Mt(){document.querySelector(`[data-continue]`)?.addEventListener(`click`,A)}function Nt(){document.querySelectorAll(`[data-zone]`).forEach(e=>{e.addEventListener(`click`,()=>{v.selectedZone=Number(e.dataset.zone),v.focusArea=`zones`,X()})}),document.querySelectorAll(`[data-roadblock]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=v.roadblocks[Number(e.dataset.roadblock)];t&&(v.selectedZone=t.zone),v.focusArea=`zones`,X()})}),document.querySelector(`[data-restart]`)?.addEventListener(`click`,()=>{M(),v.gameOver?(v.projectRound=1,v.totalProfit=0,v.gameOver=!1,v.phase=`setup`,X()):T()}),document.querySelector(`[data-quit]`)?.addEventListener(`click`,()=>{v.quitConfirm=!0,v.endActionIndex=1,X()}),document.querySelector(`[data-confirm-quit]`)?.addEventListener(`click`,A)}window.addEventListener(`keydown`,e=>{if(Y(),v.phase===`title`){e.key.toLowerCase()===`s`&&(e.preventDefault(),v.phase=`setup`,X());return}if(v.phase===`setup`){if([`1`,`2`,`3`].includes(e.key)){e.preventDefault();let t=l[Number(e.key)-1];v.projectRound===1&&v.totalProfit===0?pe(t):w(t)}return}if(v.phase===`gameOver`){([`s`,`enter`].includes(e.key.toLowerCase())||e.code===`Space`)&&(e.preventDefault(),Ue());return}if(v.phase===`nameEntry`){if(v.scoreSaved){([`s`,`enter`,`end`].includes(e.key.toLowerCase())||e.code===`Space`)&&(e.preventDefault(),He());return}let t=s.length+c.length;if(e.key===`ArrowLeft`)v.nameCursor=Math.max(0,v.nameCursor-1);else if(e.key===`ArrowRight`)v.nameCursor=Math.min(t-1,v.nameCursor+1);else if(e.key===`ArrowUp`)v.nameCursor=Math.max(0,v.nameCursor-7);else if(e.key===`ArrowDown`)v.nameCursor=Math.min(t-1,v.nameCursor+7);else if(e.code===`Space`){e.preventDefault(),We();return}else if(e.key===`Enter`||e.key===`End`){e.preventDefault(),Ve();return}else if(e.key===`Backspace`)e.preventDefault(),v.scoreName=v.scoreName.slice(0,-1);else return;e.preventDefault(),X();return}if(v.phase===`scoreResult`){([`s`,`enter`,`end`].includes(e.key.toLowerCase())||e.code===`Space`)&&(e.preventDefault(),j());return}if(v.phase===`win`){([`s`,`enter`].includes(e.key.toLowerCase())||e.code===`Space`)&&(e.preventDefault(),A());return}if(v.phase===`ended`){if(e.key===`ArrowLeft`||e.key===`ArrowRight`){e.preventDefault(),v.endActionIndex=+(v.endActionIndex===0),v.endActionIndex===0&&(v.quitConfirm=!1),X();return}if(e.key===`ArrowUp`){e.preventDefault(),v.endActionIndex=0,v.quitConfirm=!1,X();return}if(e.key===`ArrowDown`){e.preventDefault(),v.endActionIndex=1,X();return}if(e.key.toLowerCase()===`s`){e.preventDefault(),T();return}(e.code===`Space`||e.key===`Enter`)&&(e.preventDefault(),v.endActionIndex===0?T():v.quitConfirm?A():(v.quitConfirm=!0,X()));return}if(v.phase!==`running`)return;let t=Le(v.selectedZone),n=R(v.selectedZone);if(B()){let t=z(v.selectedZone);if(e.key===`ArrowUp`)v.selectedZone=H(t-1,n);else if(e.key===`ArrowDown`)v.selectedZone=H(t+1,n);else if(e.key===`ArrowLeft`)v.selectedZone=H(t,n-1);else if(e.key===`ArrowRight`)v.selectedZone=H(t,n+1);else if(e.code===`Space`){e.preventDefault(),Me();return}else if(e.key.toLowerCase()===`p`){let e=I();e?(v.selectedTradeIndex=e.id,Ne(e)):(N(`No trade to push for zone ${v.selectedZone}.`),X());return}else return;e.preventDefault(),X();return}if(e.key===`ArrowUp`)v.selectedZone=V(Math.min(C(),t+1),n);else if(e.key===`ArrowDown`)v.selectedZone=V(Math.max(1,t-1),n);else if(e.key===`ArrowLeft`)v.selectedZone=V(t,Math.max(1,n-1));else if(e.key===`ArrowRight`)v.selectedZone=V(t,Math.min(x(),n+1));else if(e.code===`Space`){e.preventDefault(),Me();return}else if(e.key.toLowerCase()===`p`){let e=I();e?(v.selectedTradeIndex=e.id,Ne(e)):(N(`No trade to push for zone ${v.selectedZone}.`),X());return}else return;e.preventDefault(),X()}),window.addEventListener(`pointerdown`,Y),window.addEventListener(`touchstart`,Y,{passive:!0}),le(X),X();