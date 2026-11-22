/* RUU//OVERRUN v1.15.3 MASS-PRODUCED SUPPORT PILOT / VISUAL SIGNALS
   Roll once per run (25%); five Guardian Genome pilots equally likely. */
(()=>{
'use strict';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),TAU=Math.PI*2;
const PILOTS=[
{id:'elio',name:'ELIO WARDEN',jp:'エリオ・ウォーデン',role:'GUARD / SANCTUARY',desc:'弾幕迎撃と防御シールド',color:'#a9d7f0',rate:1.65,guard:5.5},
{id:'oz',name:'OZ REDACT',jp:'オズ・レダクト',role:'MARKSMAN / EXECUTION',desc:'マーキングと強敵狙撃',color:'#e284d2',rate:1.5,guard:9.5},
{id:'kai',name:'KAI TRACE',jp:'カイ・トレイス',role:'ASSAULT / CROSS-FIRE',desc:'高速連射と連携弾幕',color:'#ffbe8b',rate:.92,guard:9.5},
{id:'sera',name:'SERA NOTE',jp:'セラ・ノート',role:'CONTROL / STILL LIGHT',desc:'広域減速とゲージ支援',color:'#d1e9ff',rate:1.6,guard:9.5},
{id:'mina',name:'MINA PHASE',jp:'ミナ・フェイズ',role:'RECORD / RECOVERY',desc:'経験値回収と侵攻報酬',color:'#93e8d2',rate:1.5,guard:9.5}
];
const PROBABILITY=.25,DELAY=.95,RUN_TIME=1.55,END=3.25;
const img=typeof Image==='undefined'?null:new Image();if(img)img.src='assets/support-pilot-faces.webp';
// Cinematic poster atlas, ordered Elio / Oz / Kai / Sera / Mina.
const CUTIN_TILE_W=320,CUTIN_TILE_H=569;
const poster=typeof Image==='undefined'?null:new Image();
if(poster)poster.src='assets/support-pilot-cutins.avif';
const blank=()=>({pilot:null,index:-1,t:0,arrived:false,cd:0,bonus:0,shields:0,marks:0,shots:0,slows:0,
 rays:[],rings:[],sparks:[],labels:[],flash:0,collectCd:0,bonusPending:0,fxQuality:'auto',feature:null});
let S=blank();
const rnd=rng=>{const v=Number(rng());return Number.isFinite(v)?clamp(v,0,1-Number.EPSILON):1-Number.EPSILON};
function start(g,rng=Math.random){
 S=blank();
 if(!g?.player||rnd(rng)>=PROBABILITY)return null;
 S.index=Math.floor(rnd(rng)*PILOTS.length);S.pilot=PILOTS[S.index];
 if(S.pilot.id==='mina')g.player.magnet+=24;
 return S.pilot;
}
const active=()=>S.pilot,hasEscort=()=>!!S.pilot,ready=()=>!!S.pilot&&S.arrived;
const status=()=>S.pilot?{id:S.pilot.id,name:S.pilot.name,jp:S.pilot.jp,role:S.pilot.role,arrived:S.arrived,bonus:S.bonus}:null;
const entering=()=>!S.pilot||S.arrived?null:{active:true,running:S.t>=DELAY,progress:clamp((S.t-DELAY)/RUN_TIME,0,1)};
const shotRate=()=>ready()?S.pilot.rate:1.5,interceptRate=()=>ready()?S.pilot.guard:9.5;
const shotColor=()=>ready()?S.pilot.color:'#ffe2b5',isKai=()=>ready()&&S.pilot.id==='kai';
const xpMultiplier=()=>ready()&&S.pilot.id==='mina'?1.12:1;
const markedMultiplier=(e,g)=>ready()&&S.pilot.id==='oz'&&(e?.pilotMarkUntil||0)>(g?.time||0)?1.11:1;
function onInvasionRepelled(g,score){if(!ready()||S.pilot.id!=='mina')return 0;const n=Math.floor(Math.max(0,score)*.12);S.bonus+=n;S.bonusPending+=n;return n}
function nearby(g,x,y,r,filter,max=1){
 const a=[],r2=r*r;for(const e of g.enemies||[]){if(e.hp<=0||(filter&&!filter(e)))continue;const d=(e.x-x)**2+(e.y-y)**2;if(d<r2)a.push({e,d})}
 a.sort((a,b)=>a.d-b.d);return a.slice(0,max).map(v=>v.e);
}

/* World-space support visuals. Every shape is bounded and optional at FX LITE. */
const cap=(q,n)=>q==='lite'?Math.max(2,Math.ceil(n*.32)):q==='high'?n:Math.max(3,Math.ceil(n*.62));
function ray(x,y,X,Y,color,width=3,time=.27){
 if(!Number.isFinite(x+y+X+Y))return;
 if(S.rays.length>=26)S.rays.shift();
 S.rays.push({x,y,X,Y,color,width,time,max:time});
}
function ring(x,y,r,color,kind='circle',duration=.56){
 if(S.rings.length>=18)S.rings.shift();
 S.rings.push({x,y,r,color,kind,time:duration,max:duration});
}
function sparks(x,y,color,n=16,velocity=170,q='auto'){
 for(let i=0;i<cap(q,n);i++){
  if(S.sparks.length>=90)S.sparks.shift();
  const a=Math.random()*TAU,v=velocity*(.4+Math.random()*.6),life=.22+Math.random()*.36;
  S.sparks.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,color,life,max:life});
 }
}
function label(x,y,text,color,seconds=.82){
 if(S.labels.length>=8)S.labels.shift();
 S.labels.push({x,y,text,color,time:seconds,max:seconds});
}
function allyPosition(g){
 return window.RUU_COMPANION?.position?.()||{x:g.player.x-65,y:g.player.y+20};
}
function notice(g,heading,details,x,y){
 const p=S.pilot;if(!p)return;
 const at=allyPosition(g);
 label(x??at.x,y??at.y-110,heading,p.color,.86);
 if(details)label((x??at.x),(y??at.y-110)+19,details,'#fff8ea',.86);
 // A dedicated right-side support-action banner. Always states WHO and WHAT.
 S.feature={title:heading,detail:details||p.desc,color:p.color,id:p.id,time:1.10,max:1.10};
 S.flash=Math.max(S.flash,.4);
}
function shieldShape(ctx,x,y,r,color,hex){
 ctx.beginPath();
 if(hex){
  for(let i=0;i<7;i++){const a=i*TAU/6-Math.PI/2,xx=x+Math.cos(a)*r,yy=y+Math.sin(a)*r;i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy)}
 }else ctx.arc(x,y,r,0,TAU);
}
function pulse(g,color,x,y,power=1,q='auto'){
 ring(x,y,60*power,color,'circle',.51);
 sparks(x,y,color,Math.round(19*power),165*power,q);
 S.flash=Math.max(S.flash,.15*power);
 g.shake=Math.max(g.shake||0,Math.min(5,1.8*power));
}
function tickFx(dt){
 S.flash=Math.max(0,S.flash-dt*.75);S.collectCd=Math.max(0,S.collectCd-dt);
 if(S.feature){S.feature.time-=dt;if(S.feature.time<=0)S.feature=null}
 for(let i=S.rays.length-1;i>=0;i--)if((S.rays[i].time-=dt)<=0)S.rays.splice(i,1);
 for(let i=S.rings.length-1;i>=0;i--)if((S.rings[i].time-=dt)<=0)S.rings.splice(i,1);
 for(let i=S.labels.length-1;i>=0;i--)if((S.labels[i].time-=dt)<=0)S.labels.splice(i,1);
 for(let i=S.sparks.length-1;i>=0;i--){const f=S.sparks[i];f.life-=dt;f.x+=f.vx*dt;f.y+=f.vy*dt;f.vx*=Math.exp(-2.5*dt);f.vy*=Math.exp(-2.5*dt);if(f.life<=0)S.sparks.splice(i,1)}
}
function onEscortShot(origin,target,g,q='auto'){
 if(!ready()||!origin||!target)return;
 if(S.pilot.id==='kai'){
  const d=Math.atan2(target.y-origin.y,target.x-origin.x),distance=Math.hypot(target.x-origin.x,target.y-origin.y);
  for(const a of [-.08,0,.08])ray(origin.x,origin.y,origin.x+Math.cos(d+a)*distance,origin.y+Math.sin(d+a)*distance,S.pilot.color,a===0?3.3:1.5,.18);
  sparks(origin.x,origin.y,S.pilot.color,10,110,q);
 }else ray(origin.x,origin.y,target.x,target.y,S.pilot.color,2.4,.18);
}
function onIntercept(x,y,g,q='auto'){
 if(!ready())return;
 const origin=allyPosition(g);
 ring(x,y,30,S.pilot.color,'hex',.34);
 sparks(x,y,S.pilot.color,S.pilot.id==='elio'?22:12,160,q);
 ray(origin.x,origin.y-40,x,y,S.pilot.color,2.4,.26);
 if(S.pilot.id==='elio')notice(g,'ELIO / SHIELD COVER','PROJECTILE BLOCKED',g.player.x,g.player.y-105);
}
function onGemPickup(gem,g,q='auto'){
 if(!ready()||S.pilot.id!=='mina'||S.collectCd>0||!gem)return;
 S.collectCd=1.4;
 ray(gem.x,gem.y,g.player.x,g.player.y,S.pilot.color,2,.38);
 ring(gem.x,gem.y,18,S.pilot.color,'scan',.35);
 label(g.player.x,g.player.y-92,'MINA / COLLECT + XP',S.pilot.color,.7);
}

function skill(g,api){
 const p=g.player,id=S.pilot.id,q=S.fxQuality;
 const at=allyPosition(g),col=S.pilot.color;
 let enemies=[];
 if(id==='elio'){
  S.cd=10.3;p.maxShield=Math.max(p.maxShield||0,18);
  const old=p.shield||0;p.shield=Math.min(p.maxShield,old+8);
  if(p.shield>old){
   S.shields+=p.shield-old;
   ring(p.x,p.y,152,col,'hex',.9);ring(p.x,p.y,98,col,'hex',.8);ring(p.x,p.y,59,col,'hex',.65);
   sparks(p.x,p.y,col,47,255,q);pulse(g,col,p.x,p.y,1.5,q);
   notice(g,'ELIO / SHIELD COVER','SHIELD +'+Math.ceil(p.shield-old),p.x,p.y-108);
   api?.wave?.(p.x,p.y,92,col);api?.sound?.('pilotElio');
  }
 }else if(id==='oz'){
  S.cd=6.6;
  const e=nearby(g,p.x,p.y,790,t=>t.kind==='boss'||t.kind==='final'||t.elite)[0]||nearby(g,p.x,p.y,700)[0];
  if(e){
   e.pilotMarkUntil=g.time+4.5;S.marks++;
   const damage=e.kind==='boss'||e.kind==='final'?23:31;
   api?.hit?.(e,damage,col);
   ray(at.x,at.y-56,e.x,e.y,col,9,.62);
   ring(e.x,e.y,e.r+72,col,'target',.86);ring(e.x,e.y,e.r+28,col,'target',.72);
   sparks(e.x,e.y,col,54,320,q);pulse(g,col,e.x,e.y,1.65,q);
   notice(g,'OZ / EXECUTION MARK','MARKED / +11% DMG',e.x,e.y-e.r-57);
   api?.sound?.('pilotOz');
  }
 }else if(id==='kai'){
  S.cd=7.1;enemies=nearby(g,p.x,p.y,560,null,3);
  if(enemies.length){
   for(const [i,e] of enemies.entries()){
    api?.hit?.(e,9.5+(g.level||1)*.4,col);S.shots++;
    ray(at.x+23,at.y-52,e.x,e.y,col,i===0?6:3.4,.44);
    const dir=Math.atan2(e.y-at.y+52,e.x-at.x-23);
    for(const off of [-.11,.11])ray(at.x+23,at.y-52,e.x+Math.cos(dir+off)*14,e.y+Math.sin(dir+off)*14,col,1.7,.3);
    sparks(e.x,e.y,col,31,255,q);
   }
   ring(at.x,at.y-54,98,col,'muzzle',.57);
   ring(at.x,at.y-54,52,col,'muzzle',.39);
   sparks(at.x+22,at.y-53,col,43,280,q);pulse(g,col,at.x,at.y-54,1.2,q);
   notice(g,'KAI / BURST ASSIST','CROSS-FIRE ×'+enemies.length,at.x,at.y-122);
   api?.sound?.('pilotKai');
  }
 }else if(id==='sera'){
  S.cd=8.3;enemies=nearby(g,p.x,p.y,280,null,9);
  for(const e of enemies){e.slow=Math.max(e.slow||0,1.6);e.pilotSlowUntil=g.time+1.6;S.slows++}
  api?.gainDrive?.(4);api?.gainFinisher?.(3);
  ring(p.x,p.y,310,col,'field',1.05);
  ring(p.x,p.y,248,col,'field',.94);
  ring(p.x,p.y,135,col,'circle',.76);
  for(const e of enemies.slice(0,5))ray(p.x,p.y-25,e.x,e.y,col,2.5,.39);
  sparks(p.x,p.y,col,47,220,q);pulse(g,col,p.x,p.y,1.05,q);
  notice(g,'SERA / SUPPORT FIELD','SLOW / DRIVE +4 / FINISHER +3',p.x,p.y-116);
  api?.sound?.('pilotSera');
 }else if(id==='mina'){
  S.cd=8.4;
  enemies=nearby(g,p.x,p.y,480,null,3);
  for(const e of enemies){
   e.pilotScanUntil=g.time+2.4;
   e.slow=Math.max(e.slow||0,.5);
   ring(e.x,e.y,e.r+47,col,'scan',.84);
   ring(e.x,e.y,e.r+22,col,'scan',.65);
   ray(at.x,at.y-52,e.x,e.y,col,2.7,.52);
   sparks(e.x,e.y,col,17,160,q);
  }
  let pulled=0;
  for(const gem of g.gems||[]){
   if(pulled>=24)break;
   if((gem.x-p.x)**2+(gem.y-p.y)**2>=240*240)continue;
   gem.x+=(p.x-gem.x)*.24;gem.y+=(p.y-gem.y)*.24;pulled++;
  }
  ring(p.x,p.y,260,col,'scan',.93);
  ring(p.x,p.y,150,col,'scan',.72);
  sparks(p.x,p.y,col,35,200,q);pulse(g,col,p.x,p.y,1.07,q);
  notice(g,'MINA / TARGET SCAN','SCANNED '+enemies.length+' / COLLECT '+pulled,p.x,p.y-110);
  api?.sound?.('pilotMina');
 }
}
function tick(dt,g,api,q='auto'){
 if(!S.pilot||!g?.player||dt<=0)return;
 S.fxQuality=q;
 S.t+=dt;tickFx(dt);
 if(!S.arrived&&S.t>=DELAY+RUN_TIME){
  S.arrived=true;S.cd=S.pilot.id==='elio'?8.2:5.2;
  api?.toast?.('SUPPORT PILOT // '+S.pilot.name,true);
  api?.wave?.(g.player.x-80,g.player.y,170,S.pilot.color);
  api?.sound?.('pilotArrival');
  ring(g.player.x-80,g.player.y,130,S.pilot.color,'circle',.75);
 }
 if(S.bonusPending>0){
  const amount=S.bonusPending;S.bonusPending=0;
  notice(g,'MINA / INVASION BONUS','SCORE +'+amount,g.player.x,g.player.y-107);
  ring(g.player.x,g.player.y,290,S.pilot.color,'scan',1);
  ring(g.player.x,g.player.y,155,S.pilot.color,'scan',.8);
  sparks(g.player.x,g.player.y,S.pilot.color,50,250,q);
  api?.sound?.('pilotMina');
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
function drawGround(ctx,cam,g,q='auto'){
 if(!ready()||!g?.player)return;
 const p=g.player;
 ctx.save();ctx.globalCompositeOperation='screen';
 if(S.pilot.id==='elio'&&(p.shield||0)>0){
  ctx.globalAlpha=.2+.08*Math.sin(g.time*3);
  ctx.strokeStyle=S.pilot.color;ctx.lineWidth=q==='lite'?1:2;
  shieldShape(ctx,p.x-cam.x,p.y-cam.y,42,S.pilot.color,true);ctx.stroke();
 }
 if(S.pilot.id==='sera'){
  const end=Math.min(1,Math.max(0,8.3-S.cd));
  if(end<1){ctx.globalAlpha=.12*(1-end);ctx.strokeStyle=S.pilot.color;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(p.x-cam.x,p.y-cam.y,248,0,TAU);ctx.stroke()}
 }
 ctx.restore();
}
function drawFront(ctx,cam,g,q='auto'){
 if(!ready()||!g?.player)return;
 const col=S.pilot.color;
 ctx.save();ctx.lineCap='round';
 let marks=0;
 for(const e of g.enemies||[]){
  if(e.hp<=0||marks>=9)continue;
  const x=e.x-cam.x,y=e.y-cam.y;
  if(x<-100||x>1300||y<-100||y>775)continue;
  const marked=S.pilot.id==='oz'&&e.pilotMarkUntil>g.time;
  const scanned=S.pilot.id==='mina'&&e.pilotScanUntil>g.time;
  const slow=S.pilot.id==='sera'&&e.pilotSlowUntil>g.time;
  if(!marked&&!scanned&&!slow)continue;
  marks++;
  ctx.strokeStyle=col;ctx.lineWidth=q==='lite'?1.4:2.3;ctx.globalAlpha=.67+.13*Math.sin(g.time*8);
  if(marked||scanned){
   const r=e.r+(marked?20:14);
   if(marked){ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.stroke();ctx.beginPath();ctx.moveTo(x-r-9,y);ctx.lineTo(x-r+8,y);ctx.moveTo(x+r-8,y);ctx.lineTo(x+r+9,y);ctx.moveTo(x,y-r-9);ctx.lineTo(x,y-r+8);ctx.stroke()}
   if(scanned){ctx.strokeRect(x-r,y-r,r*2,r*2);ctx.beginPath();ctx.moveTo(x-r,y);ctx.lineTo(x+r,y);ctx.stroke()}
  }else{ctx.beginPath();ctx.arc(x,y+e.r*.55,e.r+12,0,TAU);ctx.stroke()}
  ctx.globalAlpha=1;ctx.fillStyle=col;ctx.textAlign='center';ctx.font='800 9px ui-monospace,monospace';
  ctx.fillText(marked?'MARKED':scanned?'SCAN':'SLOW',x,y-e.r-23);
 }
 ctx.globalCompositeOperation='screen';
 for(const r of S.rings.slice(-(q==='lite'?7:18))){
  const k=Math.max(0,r.time/r.max),x=r.x-cam.x,y=r.y-cam.y,radius=r.r*(1.1-.24*k);
  if(x<-320||x>1520||y<-320||y>1000)continue;
  ctx.globalAlpha=.75*k;ctx.strokeStyle=r.color;ctx.lineWidth=(q==='lite'?2:4)*k+1;
  ctx.beginPath();
  if(r.kind==='hex'||r.kind==='scan'||r.kind==='target')shieldShape(ctx,x,y,radius,r.color,r.kind==='hex');
  else ctx.arc(x,y,radius,0,TAU);
  ctx.stroke();
  if(r.kind==='field'&&q!=='lite'){ctx.globalAlpha=.08*k;ctx.fillStyle=r.color;ctx.fill()}
 }
 for(const r of S.rays.slice(-(q==='lite'?11:26))){
  const k=Math.max(0,r.time/r.max),x=r.x-cam.x,y=r.y-cam.y,X=r.X-cam.x,Y=r.Y-cam.y;
  ctx.globalAlpha=.27*k;ctx.strokeStyle=r.color;ctx.lineWidth=r.width*(q==='lite'?2.2:3.5);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(X,Y);ctx.stroke();
  ctx.globalAlpha=.9*k;ctx.strokeStyle='#fff7ec';ctx.lineWidth=r.width*.55;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(X,Y);ctx.stroke();
 }
 for(const s of S.sparks.slice(-(q==='lite'?24:65))){
  const k=s.life/s.max;ctx.globalAlpha=Math.max(0,k);ctx.strokeStyle=s.color;ctx.lineWidth=2*k;
  const x=s.x-cam.x,y=s.y-cam.y;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-s.vx*.025,y-s.vy*.025);ctx.stroke();
 }
 ctx.restore();
 ctx.save();ctx.textAlign='center';
 for(const t of S.labels){
  const x=clamp(t.x-cam.x,130,1070),y=clamp(t.y-cam.y,115,620),a=clamp(t.time/t.max,0,1);
  ctx.globalAlpha=a;ctx.font='900 13px ui-monospace,Consolas,monospace';
  const width=ctx.measureText(t.text).width+20;
  ctx.fillStyle='#080d1bdc';ctx.fillRect(x-width/2,y-15,width,23);
  ctx.strokeStyle=t.color;ctx.lineWidth=1.6;ctx.strokeRect(x-width/2,y-15,width,23);
  ctx.fillStyle=t.color;ctx.fillText(t.text,x,y);
 }
 ctx.restore();
}
function drawScreen(ctx,W,H,g,q='auto'){
 if(!S.pilot||!g?.player)return;
 if(S.t>=DELAY&&S.t<=END){
  const t=S.t-DELAY,alpha=clamp(Math.min(t*5,(END-S.t)*3.2),0,1);
  if(alpha>0){
   const p=S.pilot;
   if(poster?.complete&&poster.naturalWidth>=CUTIN_TILE_W*5&&poster.naturalHeight>=CUTIN_TILE_H){
     // Draw all 569 vertical pixels, from the top of the hair to the complete nameplate.
     const h=H*.72,w=h*CUTIN_TILE_W/CUTIN_TILE_H;
     const appear=Math.min(1,t*5),slide=(1-appear)*60;
     const x=W-w-19+slide,y=H*.19;
     ctx.save();ctx.globalAlpha=alpha;
     ctx.shadowColor='#020611';ctx.shadowBlur=18;ctx.shadowOffsetX=-10;ctx.shadowOffsetY=8;
     ctx.fillStyle='#080e1b';ctx.fillRect(x-5,y-5,w+10,h+10);
     ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;
     ctx.drawImage(poster,S.index*CUTIN_TILE_W,0,CUTIN_TILE_W,CUTIN_TILE_H,x,y,w,h);
     ctx.strokeStyle=p.color;ctx.lineWidth=2;ctx.globalAlpha=alpha*.85;ctx.strokeRect(x-2,y-2,w+4,h+4);
     // Separate crisp crossover caption so it stays legible on small screens.
     const labelX=W*.59,labelY=H*.30;
     ctx.fillStyle='#0a101cba';ctx.fillRect(labelX-11,labelY-39,Math.max(200,x-labelX+12),142);
     ctx.globalAlpha=alpha;ctx.textAlign='left';
     ctx.fillStyle='#fff2e6';ctx.font='900 25px Yu Gothic,Meiryo,system-ui,sans-serif';
     ctx.fillText('星屑の鎧',labelX,labelY);
     ctx.fillStyle=p.color;ctx.font='800 12px ui-monospace,Consolas,monospace';
     ctx.fillText('- Guardian Genome -',labelX,labelY+26);
     ctx.fillStyle='#fff1da';ctx.font='900 20px Yu Gothic,Meiryo,system-ui,sans-serif';
     ctx.fillText('から参戦',labelX,labelY+62);
     ctx.strokeStyle=p.color;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(labelX,labelY+75);ctx.lineTo(x-12,labelY+75);ctx.stroke();
     ctx.restore();
     return;
   }
   // Browsers that cannot decode AVIF continue to show the previous portrait.
   const x=W*.585,y=H*.18,w=W*.397,h=H*.73;
   ctx.save();ctx.globalAlpha=alpha;
   const grad=ctx.createLinearGradient(x,0,x+w,0);
   grad.addColorStop(0,'rgba(8,12,23,.12)');grad.addColorStop(.24,'rgba(8,12,23,.79)');grad.addColorStop(1,'rgba(8,12,23,.91)');
   ctx.fillStyle=grad;ctx.fillRect(x,y,w,h);
   ctx.strokeStyle=p.color;ctx.lineWidth=2;ctx.strokeRect(x+4,y+5,w-8,h-10);
   // Never clip/crop the head: draw the complete 104x120 atlas tile at a 1:1 aspect ratio.
   const faceH=h*.56,faceW=faceH*104/120,faceX=x+w-faceW-17,faceY=y+19;
   if(img?.complete&&img.naturalWidth>=520){
    ctx.drawImage(img,S.index*104,0,104,120,faceX,faceY,faceW,faceH);
   }else fallback(ctx,faceX,faceY,faceW,faceH,p);
   ctx.fillStyle='#fff6ec';ctx.textAlign='left';
   ctx.font='900 19px Yu Gothic,Meiryo,system-ui,sans-serif';ctx.fillText('星屑の鎧',x+15,y+30);
   ctx.font='700 11px ui-monospace,monospace';ctx.fillStyle=p.color;ctx.fillText('- Guardian Genome -',x+17,y+47);
   ctx.fillStyle='#fff1d8';ctx.font='900 16px Yu Gothic,Meiryo,system-ui,sans-serif';ctx.fillText('から参戦',x+17,y+72);
   const nameY=y+h*.74;
   ctx.fillStyle='#121827e8';ctx.fillRect(x+8,nameY-30,w-16,h*.25);
   ctx.fillStyle=p.color;ctx.font='900 13px ui-monospace,monospace';ctx.fillText('MASS-PRODUCED SUPPORT PILOT',x+18,nameY-9);
   ctx.fillStyle='#fff4e9';ctx.font='900 25px ui-monospace,monospace';ctx.fillText(p.name,x+18,nameY+23,w-34);
   ctx.fillStyle=p.color;ctx.font='700 13px system-ui,sans-serif';ctx.fillText(p.jp+' // '+p.role,x+18,nameY+45,w-34);
   ctx.restore();
  }
 }

 // Timed support-technique identifier. Stay on the right and below the top HUD.
 // All five types have recognizable silhouettes; LITE keeps the label but trims glow.
 if(S.feature&&S.feature.time>0){
  const f=S.feature,t=clamp(f.time/f.max,0,1),ease=Math.min(1,(1-t)*6,t*5);
  if(ease>0){
   const boxW=W*.32,boxH=H*.115;
   const x=W-boxW-18+(1-ease)*32,y=H*.69;
   ctx.save();ctx.globalAlpha=ease;
   const bg=ctx.createLinearGradient(x,y,x+boxW,y+boxH);
   bg.addColorStop(0,'rgba(7,10,25,.92)');bg.addColorStop(1,'rgba(15,21,34,.72)');
   ctx.fillStyle=bg;ctx.fillRect(x,y,boxW,boxH);
   ctx.strokeStyle=f.color;ctx.lineWidth=q==='lite'?2:3;ctx.strokeRect(x,y,boxW,boxH);
   ctx.fillStyle=f.color;ctx.fillRect(x+8,y+8,4,boxH-16);
   // Distinct glyph geometry for each pilot, legible even in FX LITE.
   const gx=x+35,gy=y+boxH*.5;
   ctx.save();ctx.translate(gx,gy);ctx.strokeStyle=f.color;ctx.lineWidth=2.5;
   ctx.beginPath();
   if(f.id==='elio'){for(let k=0;k<7;k++){const a=k*TAU/6;const xx=Math.cos(a)*15,yy=Math.sin(a)*15;k?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy)}}
   else if(f.id==='oz'){ctx.arc(0,0,15,0,TAU);ctx.moveTo(-25,0);ctx.lineTo(25,0);ctx.moveTo(0,-25);ctx.lineTo(0,25)}
   else if(f.id==='kai'){for(const n of [-10,0,10]){ctx.moveTo(-18,n);ctx.lineTo(17,n-7)}}
   else if(f.id==='sera'){ctx.arc(0,0,15,0,TAU);ctx.moveTo(-10,0);ctx.lineTo(10,0);ctx.moveTo(0,-10);ctx.lineTo(0,10)}
   else{ctx.rect(-15,-15,30,30);ctx.moveTo(-21,0);ctx.lineTo(21,0)}
   ctx.stroke();ctx.restore();
   ctx.textAlign='left';ctx.textBaseline='alphabetic';
   ctx.fillStyle=f.color;ctx.font='900 15px ui-monospace,Consolas,monospace';
   ctx.fillText(f.title,x+64,y+boxH*.42,boxW-74);
   ctx.fillStyle='#f4e9dc';ctx.font='800 11px ui-monospace,Consolas,monospace';
   ctx.fillText(f.detail,x+64,y+boxH*.7,boxW-74);
   if(q!=='lite'){
    ctx.globalAlpha=ease*.18;ctx.fillStyle=f.color;ctx.fillRect(x-3,y-3,boxW+6,boxH+6);
   }
   ctx.restore();
  }
 }
}

function drawWorld(ctx,cam,g){
 if(!ready()||!g?.player)return;
 const pos=window.RUU_COMPANION?.position?.();if(!pos)return;
 const x=pos.x-cam.x,y=pos.y-cam.y;
 if(x<-100||x>1300||y<-100||y>775)return;
 ctx.save();ctx.textAlign='center';ctx.font='800 9px ui-monospace,monospace';
 ctx.fillStyle='#080d1ddd';ctx.fillRect(x-69,y-118,138,19);
 ctx.strokeStyle=S.pilot.color;ctx.strokeRect(x-69,y-118,138,19);
 ctx.fillStyle=S.pilot.color;ctx.fillText(S.pilot.name,x,y-104);
 ctx.restore();
}

window.RUU_PILOTS={VERSION:'1.15.3',PILOTS,PROBABILITY,DELAY,RUN_TIME,start,active,hasEscort,status,entering,ready,shotRate,interceptRate,shotColor,isKai,xpMultiplier,markedMultiplier,onInvasionRepelled,onEscortShot,onIntercept,onGemPickup,tick,drawScreen,drawWorld,drawGround,drawFront};
})();
