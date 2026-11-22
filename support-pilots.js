/* RUU//OVERRUN v1.15.0 MASS-PRODUCED SUPPORT PILOT
   Roll once per run (25%); five Guardian Genome pilots equally likely. */
(()=>{
'use strict';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),TAU=Math.PI*2;
const PILOTS=[
{id:'elio',name:'ELIO WARDEN',jp:'エリオ・ウォーデン',role:'GUARD / SANCTUARY',desc:'弾幕迎撃と防御シールド',color:'#a9d7f0',rate:1.65,guard:5.5},
{id:'oz',name:'OZ REDACT',jp:'オズ・レダクト',role:'MARKSMAN / EXECUTION',desc:'マーキングと強敵狙撃',color:'#dfb4ef',rate:1.5,guard:9.5},
{id:'kai',name:'KAI TRACE',jp:'カイ・トレイス',role:'ASSAULT / CROSS-FIRE',desc:'高速連射と連携弾幕',color:'#ffbe8b',rate:.92,guard:9.5},
{id:'sera',name:'SERA NOTE',jp:'セラ・ノート',role:'CONTROL / STILL LIGHT',desc:'広域減速とゲージ支援',color:'#d4d7ff',rate:1.6,guard:9.5},
{id:'mina',name:'MINA PHASE',jp:'ミナ・フェイズ',role:'RECORD / RECOVERY',desc:'経験値回収と侵攻報酬',color:'#93e8d2',rate:1.5,guard:9.5}
];
const PROBABILITY=.25,DELAY=.95,RUN_TIME=1.55,END=3.25;
const img=typeof Image==='undefined'?null:new Image();if(img)img.src='assets/support-pilot-faces.webp';
const blank=()=>({pilot:null,index:-1,t:0,arrived:false,cd:0,bonus:0,shields:0,marks:0,shots:0,slows:0});
let S=blank();
const rnd=rng=>{const v=Number(rng());return Number.isFinite(v)?clamp(v,0,1-Number.EPSILON):1-Number.EPSILON};
function start(g,rng=Math.random){
 S=blank();
 if(!g?.player||rnd(rng)>=PROBABILITY)return null;
 S.index=Math.floor(rnd(rng)*PILOTS.length);S.pilot=PILOTS[S.index];
 if(S.pilot.id==='mina')g.player.magnet+=24;
 return S.pilot;
}
const active=()=>S.pilot,ready=()=>!!S.pilot&&S.arrived;
const status=()=>S.pilot?{id:S.pilot.id,name:S.pilot.name,jp:S.pilot.jp,role:S.pilot.role,arrived:S.arrived,bonus:S.bonus}:null;
const entering=()=>!S.pilot||S.arrived?null:{active:true,running:S.t>=DELAY,progress:clamp((S.t-DELAY)/RUN_TIME,0,1)};
const shotRate=()=>ready()?S.pilot.rate:1.5,interceptRate=()=>ready()?S.pilot.guard:9.5;
const shotColor=()=>ready()?S.pilot.color:'#ffe2b5',isKai=()=>ready()&&S.pilot.id==='kai';
const xpMultiplier=()=>ready()&&S.pilot.id==='mina'?1.12:1;
const markedMultiplier=(e,g)=>ready()&&S.pilot.id==='oz'&&(e?.pilotMarkUntil||0)>(g?.time||0)?1.11:1;
function onInvasionRepelled(g,score){if(!ready()||S.pilot.id!=='mina')return 0;const n=Math.floor(Math.max(0,score)*.12);S.bonus+=n;return n}
function nearby(g,x,y,r,filter,max=1){
 const a=[],r2=r*r;for(const e of g.enemies||[]){if(e.hp<=0||(filter&&!filter(e)))continue;const d=(e.x-x)**2+(e.y-y)**2;if(d<r2)a.push({e,d})}
 a.sort((a,b)=>a.d-b.d);return a.slice(0,max).map(v=>v.e);
}
function skill(g,api){
 const p=g.player,id=S.pilot.id;let enemies;
 if(id==='elio'){
  S.cd=10.3;p.maxShield=Math.max(p.maxShield||0,18);const old=p.shield||0;
  p.shield=Math.min(p.maxShield,old+8);
  if(p.shield>old){S.shields+=p.shield-old;api?.wave?.(p.x,p.y,76,S.pilot.color);api?.sound?.('shield')}
 }else if(id==='oz'){
  S.cd=6.6;
  const e=nearby(g,p.x,p.y,790,e=>e.kind==='boss'||e.kind==='final'||e.elite)[0]||nearby(g,p.x,p.y,700)[0];
  if(e){e.pilotMarkUntil=g.time+4.5;S.marks++;api?.hit?.(e,e.kind==='boss'||e.kind==='final'?23:31,S.pilot.color);api?.wave?.(e.x,e.y,72,S.pilot.color);api?.sound?.('rail')}
 }else if(id==='kai'){
  S.cd=7.1;enemies=nearby(g,p.x,p.y,560,null,2);
  for(const e of enemies){api?.hit?.(e,9.5+(g.level||1)*.4,S.pilot.color);S.shots++}
  if(enemies.length){api?.sound?.('shoot');api?.wave?.(p.x,p.y,65,S.pilot.color)}
 }else if(id==='sera'){
  S.cd=8.3;enemies=nearby(g,p.x,p.y,280,null,9);
  for(const e of enemies){e.slow=Math.max(e.slow||0,1.6);S.slows++}
  api?.gainDrive?.(4);api?.gainFinisher?.(3);
  if(enemies.length){api?.sound?.('frost');api?.wave?.(p.x,p.y,250,S.pilot.color)}
 }else if(id==='mina'){
  S.cd=8.4;
  for(const e of nearby(g,p.x,p.y,480,null,3))e.slow=Math.max(e.slow||0,.5);
  for(const gem of (g.gems||[]).slice(0,24))if((gem.x-p.x)**2+(gem.y-p.y)**2<240*240){gem.x+=(p.x-gem.x)*.24;gem.y+=(p.y-gem.y)*.24}
 }
}
function tick(dt,g,api){
 if(!S.pilot||!g?.player||dt<=0)return;
 S.t+=dt;
 if(!S.arrived&&S.t>=DELAY+RUN_TIME){
  S.arrived=true;S.cd=S.pilot.id==='elio'?8.2:5.2;
  api?.toast?.('SUPPORT PILOT // '+S.pilot.name,true);
  api?.wave?.(g.player.x-80,g.player.y,170,S.pilot.color);api?.sound?.('elite');
 }
 if(S.arrived){S.cd-=dt;if(S.cd<=0)skill(g,api)}
}
function fallback(ctx,x,y,w,h,p){
 ctx.save();ctx.translate(x,y);ctx.fillStyle='#1e2431';ctx.fillRect(0,0,w,h);
 ctx.strokeStyle=p.color;ctx.lineWidth=2;ctx.strokeRect(2,2,w-4,h-4);
 ctx.fillStyle='#3a404d';ctx.beginPath();ctx.ellipse(w*.5,h*.89,w*.43,h*.33,0,0,TAU);ctx.fill();
 ctx.fillStyle='#a6a6b0';ctx.beginPath();ctx.ellipse(w*.5,h*.46,w*.27,h*.31,0,0,TAU);ctx.fill();
 ctx.fillStyle=p.id==='elio'||p.id==='sera'?'#aaa7ab':'#29232f';
 for(let i=-2;i<=2;i++){ctx.beginPath();ctx.ellipse(w*(.5+i*.081),h*.21+i*i,w*.105,h*.25,-i*.15,0,TAU);ctx.fill()}
 ctx.restore();
}
function drawScreen(ctx,W,H,g){
 if(!S.pilot||!g?.player||S.t<DELAY||S.t>END)return;
 const t=S.t-DELAY,alpha=clamp(Math.min(t*5,(END-S.t)*3.2),0,1);if(!alpha)return;
 const p=S.pilot,x=W*.65,y=H*.22,w=W*.32,h=H*.58;
 ctx.save();ctx.globalAlpha=alpha;
 const grad=ctx.createLinearGradient(x,0,W,0);grad.addColorStop(0,'rgba(8,12,23,0)');grad.addColorStop(.3,'rgba(8,12,23,.76)');grad.addColorStop(1,'rgba(8,12,23,.93)');
 ctx.fillStyle=grad;ctx.fillRect(x,y-12,w+20,h+24);
 ctx.strokeStyle=p.color;ctx.lineWidth=2;ctx.beginPath();
 ctx.moveTo(x+12,y+18);ctx.lineTo(W-18,y+18);ctx.moveTo(x+12,y+h-18);ctx.lineTo(W-18,y+h-18);ctx.stroke();
 const px=x+w*.39,py=y+44,pw=w*.54,ph=h*.57;
 ctx.save();ctx.beginPath();ctx.rect(px,py,pw,ph);ctx.clip();
 if(img?.complete&&img.naturalWidth>=520)ctx.drawImage(img,S.index*104,0,104,120,px,py,pw,ph);
 else fallback(ctx,px,py,pw,ph,p);
 ctx.restore();
 ctx.textAlign='left';ctx.fillStyle=p.color;ctx.font='900 13px ui-monospace,monospace';ctx.fillText('ALLIED REINFORCEMENT',x+17,y+42);
 ctx.fillStyle='#fffaed';ctx.font='900 19px ui-monospace,monospace';ctx.fillText('MASS-PRODUCED',x+17,y+74);
 ctx.font='900 15px ui-monospace,monospace';ctx.fillText('SUPPORT PILOT',x+17,y+98);
 const b=y+h-71;ctx.font='900 23px ui-monospace,monospace';ctx.fillText(p.name,x+17,b);
 ctx.font='800 12px ui-monospace,monospace';ctx.fillStyle=p.color;ctx.fillText(p.role,x+17,b+25);
 ctx.font='600 12px system-ui,sans-serif';ctx.fillStyle='#e4e5e9';ctx.fillText(p.desc,x+17,b+47);ctx.restore();
}
function drawWorld(ctx,cam,g){
 if(!ready()||!g?.player)return;
 const pos=window.RUU_COMPANION?.position?.();if(!pos)return;
 const x=pos.x-cam.x,y=pos.y-cam.y;if(x<-100||x>1300||y<-100||y>775)return;
 ctx.save();ctx.textAlign='center';ctx.font='800 9px ui-monospace,monospace';
 ctx.fillStyle='#080d1ddd';ctx.fillRect(x-69,y-118,138,19);ctx.strokeStyle=S.pilot.color;ctx.strokeRect(x-69,y-118,138,19);
 ctx.fillStyle=S.pilot.color;ctx.fillText(S.pilot.name,x,y-104);ctx.restore();
}
window.RUU_PILOTS={VERSION:'1.15.0',PILOTS,PROBABILITY,DELAY,RUN_TIME,start,active,status,entering,ready,shotRate,interceptRate,shotColor,isKai,xpMultiplier,markedMultiplier,onInvasionRepelled,tick,drawScreen,drawWorld};
})();
