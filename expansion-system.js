/* RUU//OVERRUN v1.11.0 — Overdrive Expansion */
(()=>{
'use strict';
const TAU=6.283185307179586,clamp=(x,a,b)=>Math.max(a,Math.min(b,x)), K='RUU_ACHIEVEMENTS_V1',TK='RUU_TITLE_V1';
const achievements=[
{id:'first',jp:'最初の一撃',title:'侵食への反逆者',desc:'敵を1体倒す',mark:'✦'},
{id:'boss',jp:'王を砕く者',title:'王を砕く者',desc:'中ボスを撃破',mark:'◇'},
{id:'final',jp:'虚無の終焉',title:'虚無の終焉',desc:'最終ボスを撃破',mark:'✕'},
{id:'clear',jp:'星屑の生還者',title:'星屑の生還者',desc:'100秒モードをクリア',mark:'Ø'},
{id:'flawless',jp:'無傷の星',title:'無傷の星',desc:'HPダメージ0で通常クリア',mark:'✧'},
{id:'combo50',jp:'連鎖の鼓動',title:'連鎖の鼓動',desc:'50コンボ達成',mark:'↯'},
{id:'combo100',jp:'極限共鳴',title:'極限共鳴',desc:'100コンボ達成',mark:'✹'},
{id:'combo200',jp:'破滅の奏者',title:'破滅の奏者',desc:'200コンボ達成',mark:'✺'},
{id:'jackpot',jp:'運命の当選者',title:'運命の当選者',desc:'JACKPOT MODE初発動',mark:'★'},
{id:'fusion',jp:'境界の錬成者',title:'境界の錬成者',desc:'複合技を獲得',mark:'✥'},
{id:'kills300',jp:'三百の残光',title:'三百の残光',desc:'1プレイで300体撃破',mark:'✶'},
{id:'endless180',jp:'終わらない旅人',title:'終わらない旅人',desc:'ENDLESSで180秒生存',mark:'∞'}];
const fusions=[
{id:'frostThunder',name:'氷雷絶唱',desc:'氷晶散華×尾雷チェインストーム。氷雷の追撃が連鎖。',a:'frost',b:'lightning',color:'#a0f0ff',interval:3.8,type:'FUSION',max:1},
{id:'meteorBloom',name:'天焦焔華',desc:'墜星雨×超新星ファイアワークス。星火の大爆発。',a:'meteor',b:'fireworks',color:'#ffbc88',interval:5,type:'FUSION',max:1},
{id:'railRift',name:'断界弾道',desc:'天断レールブレイカー×裂界スラッシャー。空間を裂く連射。',a:'rail',b:'rift',color:'#e1a5ff',interval:4.2,type:'FUSION',max:1},
{id:'sonicCross',name:'終末共鳴',desc:'音圧ディストーション×終焉十字光。交差衝撃波。',a:'sonic',b:'cross',color:'#f1dcff',interval:5.8,type:'FUSION',max:1}
];
let unlocked=new Set(),chosen='',boss=null,combo=null,effects=[],clock=0;
try{const v=JSON.parse(localStorage.getItem(K)||'[]');if(Array.isArray(v))unlocked=new Set(v.filter(id=>achievements.some(a=>a.id===id)));chosen=localStorage.getItem(TK)||'';}catch(e){}
function unlock(id){const a=achievements.find(x=>x.id===id);if(!a||unlocked.has(id))return null;unlocked.add(id);try{localStorage.setItem(K,JSON.stringify([...unlocked]));}catch(e){}return a}
function status(){return achievements.map(a=>({...a,unlocked:unlocked.has(a.id)}))}
function selectedTitle(){const a=achievements.find(a=>a.id===chosen&&unlocked.has(a.id));return a?.title||''}
function changeTitle(id){if(id&&(!unlocked.has(id)||!achievements.some(a=>a.id===id)))return false;chosen=id;try{localStorage.setItem(TK,id);}catch(e){}return true}
function reset(){boss=null;combo=null;effects=[];clock=0}
function eligible(mods,flags){return fusions.filter(s=>!flags?.[s.id]&&(mods?.[s.a]||0)>=2&&(mods?.[s.b]||0)>=2).map(x=>({...x}))}
function activate(g,id){const f=fusions.find(x=>x.id===id);if(!f||g?.fusions?.[id])return null;g.fusions??={};g.fusionTimers??={};g.fusions[id]=true;g.fusionTimers[id]=.35;return f}
function fusionStep(dt,g,api,q){
 if(!g?.fusions||!g.player)return;
 g.fusionTimers??={};
 const p=g.player,targets=g.enemies.filter(e=>e.hp>0).sort((a,b)=>(a.x-p.x)**2+(a.y-p.y)**2-(b.x-p.x)**2-(b.y-p.y)**2);
 for(const f of fusions){
  if(!g.fusions[f.id])continue;
  g.fusionTimers[f.id]=(g.fusionTimers[f.id]||0)-dt;
  if(g.fusionTimers[f.id]>0)continue;
  g.fusionTimers[f.id]=f.interval/Math.max(1,p.haste*.7);
  if(!targets.length)continue;
  const power=p.damage*(1+Math.min(.3,g.level*.009)),center=targets[0];
  if(f.id==='frostThunder'){
   for(const e of targets.slice(0,7)){e.slow=Math.max(e.slow,1.7);api.hit(e,power*2.15,'#b4ecff');effects.push({kind:'line',x:p.x,y:p.y,x2:e.x,y2:e.y,life:.4,max:.4,color:f.color})}
   api.sound('bolt');
  }else if(f.id==='meteorBloom'){
   const radius=165+Math.min(55,g.level*1.5);
   for(const e of targets.slice(0,22))if((e.x-center.x)**2+(e.y-center.y)**2<radius*radius)api.hit(e,power*3.25,'#ffb68d');
   api.wave(center.x,center.y,radius,f.color);api.sound('fireworks');effects.push({kind:'wave',x:center.x,y:center.y,r:radius,life:.65,max:.65,color:f.color});
  }else if(f.id==='railRift'){
   for(const e of targets.slice(0,8)){api.hit(e,power*2.1,'#da9fff');effects.push({kind:'line',x:p.x,y:p.y,x2:e.x,y2:e.y,life:.38,max:.38,color:f.color})}
   api.sound('rail');
  }else if(f.id==='sonicCross'){
   const r=260;
   for(const e of targets.slice(0,24))if((e.x-p.x)**2+(e.y-p.y)**2<r*r)api.hit(e,power*2.55,'#ffe6ff');
   api.wave(p.x,p.y,r,f.color);api.sound('sonic');effects.push({kind:'cross',x:p.x,y:p.y,r,life:.65,max:.65,color:f.color});
  }
 }
 if(effects.length>42)effects.splice(0,effects.length-42);
}
function comboMilestone(n){if(![50,100,200,500].includes(n))return false;combo={n,elapsed:0,duration:1.45};return true}
function bossStart(e){if(boss||!e)return null;const final=e.kind==='final';boss={final,time:0,duration:final?2.65:1.85,x:e.x,y:e.y};return boss}
function bossState(){return boss}
function endBoss(){boss=null}
function tick(dt){clock+=dt;if(combo){combo.elapsed+=dt;if(combo.elapsed>combo.duration)combo=null;}for(let i=effects.length-1;i>=0;i--)if((effects[i].life-=dt)<=0)effects.splice(i,1);if(boss)boss.time+=dt}
function drawWorld(ctx,cam,g,q){
 if(!effects.length)return;
 ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';
 for(const f of effects){const t=f.life/f.max,x=f.x-cam.x,y=f.y-cam.y;if(x<-340||x>1500||y<-340||y>1100)continue;
 ctx.strokeStyle=f.color;ctx.lineWidth=6*t;ctx.globalAlpha=t*.68;ctx.beginPath();
 if(f.kind==='line'){ctx.moveTo(x,y);ctx.lineTo(f.x2-cam.x,f.y2-cam.y);}
 else if(f.kind==='wave')ctx.arc(x,y,(1.14-.4*t)*f.r,0,TAU);
 else{ctx.moveTo(x-f.r,y);ctx.lineTo(x+f.r,y);ctx.moveTo(x,y-f.r);ctx.lineTo(x,y+f.r);}ctx.stroke();
 ctx.strokeStyle='#fffaff';ctx.lineWidth=1.6*t;ctx.stroke();
 }ctx.restore();
}
function drawCombo(ctx,W,H){
 if(!combo)return;
 const t=combo.elapsed,a=Math.min(1,t/.17)*Math.max(0,Math.min(1,(combo.duration-t)/.36)),n=combo.n;
 const col=n>=200?'#e7bcff':n>=100?'#ffe0a5':'#a9fff2';
 ctx.save();ctx.globalAlpha=a;ctx.textAlign='center';ctx.fillStyle=col;ctx.shadowColor=col;ctx.shadowBlur=18;
 ctx.font='900 '+(n>=200?54:43)+'px ui-monospace,Consolas,monospace';ctx.fillText('✦ '+n+' CHAIN ✦',W/2,H*.30);
 ctx.shadowBlur=0;ctx.font='800 14px ui-monospace,monospace';ctx.fillText(n>=200?'UNSTOPPABLE RESONANCE':n>=100?'ULTRA COMBO':'CHAIN REACTION',W/2,H*.30+33);
 ctx.restore();
}
function drawBoss(ctx,W,H,q){
 if(!boss)return;
 const b=boss,t=b.time,r=Math.min(1,t/b.duration),cx=W/2,cy=H*.46;
 ctx.save();ctx.fillStyle='rgba(3,4,13,'+Math.min(.79,.18+.59*r).toFixed(3)+')';ctx.fillRect(0,0,W,H);
 if(t<.24){ctx.fillStyle='rgba(255,247,240,'+(.31*(1-t/.24)).toFixed(3)+')';ctx.fillRect(0,0,W,H);}
 ctx.save();ctx.translate(cx,cy);ctx.globalCompositeOperation='lighter';
 const count=q==='lite'?20:q==='high'?84:46;
 for(let i=0;i<count;i++){const a=i*TAU/count,dist=20+Math.pow(r,.7)*(90+i%5*37);
 ctx.globalAlpha=(1-r)*(.34+i%3*.15);ctx.strokeStyle=i%2?'#ffe0a6':'#ff94cc';ctx.lineWidth=i%5===0?3:1.7;
 ctx.beginPath();ctx.moveTo(Math.cos(a)*dist,Math.sin(a)*dist);ctx.lineTo(Math.cos(a)*(dist+38),Math.sin(a)*(dist+38));ctx.stroke();}
 for(let j=0;j<3;j++){const p=Math.max(0,Math.min(1,(t-j*.16)/(.77+j*.10)));if(!p||p>=1)continue;
 ctx.strokeStyle=j%2?'#ffc6ee':'#ffedd1';ctx.globalAlpha=(1-p)*.5;ctx.lineWidth=5*(1-p);
 ctx.beginPath();ctx.arc(0,0,p*360,0,TAU);ctx.stroke();}
 ctx.restore();
 ctx.globalAlpha=Math.min(1,Math.max(0,(t-.24)/.3))*Math.min(1,Math.max(0,(b.duration-t)/.3));
 ctx.textAlign='center';ctx.fillStyle='#fff4df';ctx.shadowColor=b.final?'#ffdcb6':'#ff9ad3';ctx.shadowBlur=25;
 ctx.font='900 '+(b.final?61:52)+'px ui-monospace,Consolas,monospace';ctx.fillText(b.final?'FINAL ANNIHILATION':'DEVORA BREAK',cx,cy);
 ctx.shadowBlur=0;ctx.font='800 13px ui-monospace,monospace';ctx.fillText(b.final?'NULL EMPEROR / ERASED':'PHASE BOSS / DESTROYED',cx,cy+36);
 if(b.final&&t>b.duration-.33){ctx.globalAlpha=Math.min(.62,(t-(b.duration-.33))/.33*.62);ctx.fillStyle='#fffdf8';ctx.fillRect(0,0,W,H);}
 ctx.restore();
}
window.RUU_EXPANSION={achievements,fusions,unlock,status,selectedTitle,changeTitle,reset,eligible,activate,fusionStep,comboMilestone,bossStart,bossState,endBoss,tick,drawWorld,drawCombo,drawBoss};
})();