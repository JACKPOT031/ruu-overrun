/* v1.15.0 ASTRAL COMPANION / MASS-PRODUCED SUPPORT PILOT — game-only; no Cloudflare changes.
   ASTRAL-SUIT: modest constant support. ASTRAEA No.3: once per run,
   manually deployable for 12s after DEVORA boss defeat + 75s + SYNCHRO 100%.
   Sprites are stylized game interpretations of the supplied character sheets.
*/
(()=>{
'use strict';
const PI=Math.PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),pink='#ff85d0',white='#ffe5f7',silver='#b8d3df',gold='#ffe2b5';
const IMG={};
for(const [id,src] of Object.entries({suit:'assets/astral-suit-companion.svg',astraea:'assets/astraea-companion.svg'})){
 if(typeof Image==='undefined'){IMG[id]=null;continue}
 const img=new Image();img.src=src;IMG[id]=img;
}
// Chrome/Edge: decode the approved eight-frame animated GIF once, then advance
// the frame in game-time. Pausing the game or standing still freezes the pose.
const WALK_GIF='assets/astral-suit-walk.gif', walk={img:null,frames:[],duration:.12};
if(typeof Image!=='undefined'){walk.img=new Image();walk.img.src=WALK_GIF}
if(typeof ImageDecoder!=='undefined'&&typeof fetch==='function'){
 fetch(WALK_GIF).then(r=>{if(!r.ok)throw Error('GIF '+r.status);return r.arrayBuffer()}).then(async bytes=>{
   const decoder=new ImageDecoder({data:bytes,type:'image/gif'});
   try{
     await decoder.tracks.ready;
     const count=Math.min(8,decoder.tracks.selectedTrack?.frameCount||8);
     const frames=[];
     for(let i=0;i<count;i++){const data=await decoder.decode({frameIndex:i});frames.push(data.image)}
     if(frames.length)walk.frames=frames;
   }finally{decoder.close()}
 }).catch(()=>{}); // Local file:// and older browsers fall back to the GIF element.
}
function init(){return{sync:0,bossDown:false,used:false,t:0,intro:0,allyX:null,allyY:null,astraX:0,astraY:0,attack:.5,intercept:7,volley:.2,finished:false,rays:[],sparks:[],flash:0,shots:0,blocked:0,allyMoving:false,allyFacing:1,walkClock:0,walkSpeed:0}}
let z=init();function reset(){z=init()}
function canDeploy(g){return!!g&&g.time>=75&&z.bossDown&&z.sync>=100&&!z.used&&!(g.jackpotTime>0)&&!(g.finisherTime>0)}
function status(g){
 const ready=canDeploy(g),t=g?.time||0;
 let text=z.used?(z.t>0?'ASTRAEA ACTIVE '+z.t.toFixed(1)+'s':'ASTRAEA DISPATCHED'):
 !z.bossDown?'LOCKED / DEFEAT DEVORA':t<75?'LOCKED / SURVIVE '+Math.ceil(75-t)+'s':
 z.sync<100?'LOCKED / SYNCHRO '+Math.floor(z.sync)+'%':!ready?'READY / WAIT FOR FINISHER':'ASTRAEA READY / PRESS X';
 return{synchro:Math.floor(z.sync),bossDown:z.bossDown,used:z.used,active:z.t,ready,text,shots:z.shots,blocked:z.blocked};
}
function onKill(e,g){
 if(!e||!g)return;
 const combo=(g.combo||0)+1;
 z.sync=clamp(z.sync+1.05+(e.mutation?4.2:0)+(e.elite?10:0)+(e.kind==='boss'?24:0)+(combo%20===0?4:0),0,100);
 if(e.kind==='boss')z.bossDown=true;
}
function fxLine(x,y,X,Y,color=gold,w=2,time=.24){
 if(z.rays.length>=32)z.rays.shift();z.rays.push({x,y,X,Y,color,w,time,max:time});
}
function fxSparks(x,y,color,n,v,q){
 const count=q==='lite'?Math.ceil(n*.24):q==='high'?n:Math.ceil(n*.54);
 for(let i=0;i<count;i++){
  if(z.sparks.length>=92)z.sparks.shift();
  const a=Math.random()*PI,speed=v*(.3+.7*Math.random()),life=.25+.4*Math.random();
  z.sparks.push({x,y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,life,max:life,color,sz:1+Math.random()*3});
 }
}
function targetList(g,x,y,r,n){
 const rr=r*r,arr=[];
 for(const e of g.enemies||[]){if(e.hp<=0)continue;const d=(e.x-x)**2+(e.y-y)**2;if(d<rr)arr.push({e,d})}
 arr.sort((a,b)=>a.d-b.d);return arr.slice(0,n).map(o=>o.e);
}
function deploy(g,api,q='auto'){
 if(!canDeploy(g))return false;
 z.used=true;z.t=12;z.intro=1.8;z.finished=false;z.volley=.15;z.flash=.7;
 const p=g.player;z.astraX=p.x-190;z.astraY=p.y-160;
 let removed=0;
 for(let i=(g.ebullets||[]).length-1;i>=0&&removed<12;i--){
  const b=g.ebullets[i];if((b.x-p.x)**2+(b.y-p.y)**2<220*220){g.ebullets.splice(i,1);removed++}
 }
 api?.wave?.(p.x,p.y,265,pink);api?.burst?.(p.x,p.y,pink,27,200);
 api?.sound?.('signature');api?.toast?.('ASTRAEA No.3 // MEMORY INHERITANCE',true);
 fxSparks(p.x,p.y,pink,45,240,q);g.shake=Math.max(g.shake||0,13);g.scenePulse=Math.max(g.scenePulse||0,1);
 return true;
}
function hitAssist(e,dmg,api){
 if(!e||e.hp<=0||!api?.hit)return;
 if(e.kind==='boss'||e.kind==='final'){
  // Per-boss cap: at most 28% of max HP from ASTRAEA, never a lethal blow.
  dmg=Math.max(0,Math.min(dmg,e.maxHp*.28-(e.astraeaAssistDamage||0),e.hp-1));
  e.astraeaAssistDamage=(e.astraeaAssistDamage||0)+dmg;
 }
 if(dmg>0)api.hit(e,dmg,pink);
}
function fireSuit(g,api,q){
 const e=targetList(g,z.allyX,z.allyY,520,1)[0];if(!e)return;
 const pilot=window.RUU_PILOTS,base=clamp(8.5+(g.level||1)*.48,9,15.5)*(e.kind==='boss'||e.kind==='final'?.6:1);
 const color=pilot?.shotColor?.()||gold,rapid=pilot?.isKai?.()===true;
 const hits=rapid?2:1,damage=rapid?base*.70:base;
 for(let n=0;n<hits;n++)api?.hit?.(e,damage,color);
 fxLine(z.allyX+25,z.allyY-49,e.x,e.y,color,rapid?3:2,.20);
 fxSparks(e.x,e.y,color,rapid?8:5,75,q);z.shots+=hits;api?.sound?.('shoot');
}
function defend(g,api,q){
 const p=g.player;
 for(let i=0;i<(g.ebullets||[]).length;i++){
  const b=g.ebullets[i];
  if((b.x-p.x)**2+(b.y-p.y)**2>90*90||(b.x-z.allyX)**2+(b.y-z.allyY)**2>250*250)continue;
  g.ebullets.splice(i,1);fxLine(z.allyX,z.allyY-44,b.x,b.y,silver,3,.36);
  fxSparks(b.x,b.y,silver,14,140,q);z.blocked++;z.intercept=window.RUU_PILOTS?.interceptRate?.()||9.5;api?.sound?.('shield');return;
 }
}
function burstAstraea(g,api,q){
 const targets=targetList(g,g.player.x,g.player.y,800,q==='lite'?2:3);
 for(const e of targets){
  hitAssist(e,e.kind==='boss'||e.kind==='final'?39:58+(g.level||1)*1.3,api);
  fxLine(z.astraX+92,z.astraY-80,e.x,e.y,pink,q==='lite'?3:5,.34);
  fxSparks(e.x,e.y,pink,10,175,q);
 }
 if(targets.length){z.flash=.3;api?.sound?.('rail')}
}
function finalAstraea(g,api,q){
 z.finished=true;const p=g.player,range=365;
 for(const e of g.enemies){
  if(e.hp<=0||(e.x-p.x)**2+(e.y-p.y)**2>(range+e.r)**2)continue;
  hitAssist(e,e.kind==='final'||e.kind==='boss'?105:100+(g.level||1)*4,api);
 }
 for(let i=0;i<8;i++){const a=i*PI/8;fxLine(p.x,p.y,p.x+Math.cos(a)*295,p.y+Math.sin(a)*295,white,6,.52)}
 api?.wave?.(p.x,p.y,range,pink);api?.burst?.(p.x,p.y,pink,45,300);
 api?.sound?.('signature');api?.toast?.('GUARDIAN RESONANCE // 記憶は、滅びない。',true);
 fxSparks(p.x,p.y,white,54,290,q);z.flash=.76;
 g.scenePulse=Math.max(g.scenePulse||0,1);g.shake=Math.max(g.shake||0,15);
}
function tick(dt,g,api,q='auto'){
 if(!g?.player||dt<=0)return;
 z.intro=Math.max(0,z.intro-dt);z.flash=Math.max(0,z.flash-dt*1.8);
 for(let i=z.rays.length-1;i>=0;i--){z.rays[i].time-=dt;if(z.rays[i].time<=0)z.rays.splice(i,1)}
 for(let i=z.sparks.length-1;i>=0;i--){
  const p=z.sparks[i];p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;
  p.vx*=Math.exp(-3*dt);p.vy*=Math.exp(-3*dt);if(p.life<=0)z.sparks.splice(i,1);
 }
 const p=g.player,f=1-Math.exp(-dt*6),X=p.x-80*(p.face||1),Y=p.y+21;
 const incoming=window.RUU_PILOTS?.entering?.();
 if(incoming){
   // Run from off-screen right to the ordinary follow position.
   const prog=incoming.progress;
   z.allyX=p.x+640*(1-prog)-80*prog;z.allyY=Y;
   z.allyFacing=-1;z.allyMoving=incoming.running;
   z.walkSpeed=incoming.running?420:0;
   if(incoming.running)z.walkClock+=dt*1.8;
   z.attack=Math.max(z.attack,.3);
 }else{
   if(z.allyX===null){z.allyX=X;z.allyY=Y}
   const beforeX=z.allyX,beforeY=z.allyY;
   z.allyX+=(X-z.allyX)*f;z.allyY+=(Y-z.allyY)*f;
   const moveX=z.allyX-beforeX,moveY=z.allyY-beforeY;
   z.walkSpeed=Math.hypot(moveX,moveY)/Math.max(dt,.001);
   z.allyMoving=z.walkSpeed>18;
   if(Math.abs(moveX)>.12)z.allyFacing=moveX>0?1:-1;
   if(z.allyMoving)z.walkClock+=dt*clamp(z.walkSpeed/160,.65,1.5);
   z.attack-=dt;if(z.attack<=0){z.attack=window.RUU_PILOTS?.shotRate?.()||1.5;fireSuit(g,api,q)}
   z.intercept-=dt;if(z.intercept<=0){z.intercept=.12;defend(g,api,q)}
 }
 if(z.t<=0)return;
 z.t=Math.max(0,z.t-dt);
 const alpha=1-Math.exp(-4*dt);
 z.astraX+=(p.x-190-z.astraX)*alpha;z.astraY+=(p.y-160-z.astraY)*alpha;
 z.volley-=dt;if(z.volley<=0&&z.t>.7){z.volley=.72;burstAstraea(g,api,q)}
 if(z.t<=1.2&&!z.finished)finalAstraea(g,api,q);
 if(z.t===0){api?.toast?.('ASTRAEA // SIGNAL RELEASED',false);fxSparks(z.astraX,z.astraY,pink,20,160,q)}
}
function isReady(im){return !!(im&&im.complete&&im.naturalWidth>0)}
function fallback(ctx,astro){
 ctx.save();ctx.strokeStyle=astro?pink:'#2a3140';ctx.lineWidth=3;
 if(astro){for(const n of [-1,1]){ctx.fillStyle='#272234';ctx.beginPath();ctx.moveTo(n*24,-64);ctx.lineTo(n*94,-128);ctx.lineTo(n*81,-55);ctx.lineTo(n*102,-26);ctx.lineTo(n*29,-20);ctx.closePath();ctx.fill();ctx.stroke()}}
 ctx.fillStyle=astro?'#f3edf4':'#bfc9d6';ctx.fillRect(-19,-70,38,67);ctx.fillRect(-13,-98,26,28);
 ctx.fillRect(-17,4,14,46);ctx.fillRect(5,4,14,46);
 ctx.strokeStyle=astro?pink:gold;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-34,-39);ctx.lineTo(42,-39);ctx.stroke();ctx.restore();
}
function drawGround(ctx,cam,g){
 if(!g?.player||z.allyX===null)return;
 if(window.RUU_PILOTS?.entering?.()?.running===false)return;
 ctx.save();ctx.globalAlpha=.35;ctx.fillStyle='#070911';
 ctx.beginPath();ctx.ellipse(z.allyX-cam.x,z.allyY-cam.y,30,10,0,0,PI);ctx.fill();
 if(z.t>0){ctx.strokeStyle=pink;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(z.astraX+93-cam.x,z.astraY+20-cam.y,120,34,0,0,PI);ctx.stroke()}
 ctx.restore();
}
function drawImage(ctx,img,x,y,w,h,opacity,astro){
 ctx.save();ctx.globalAlpha=opacity;ctx.translate(x,y);
 if(isReady(img))ctx.drawImage(img,-w/2,-h,w,h);else fallback(ctx,astro);
 ctx.restore();
}
function drawUnits(ctx,cam,g,q='auto'){
 if(!g?.player||z.allyX===null)return;
 if(window.RUU_PILOTS?.entering?.()?.running===false)return;
 // Reduced from 86x125 to 64x94 logical pixels, about 25% smaller.
 // Source GIF faces right. Flip the drawing when escort moves left.
 const xSuit=z.allyX-cam.x,ySuit=z.allyY-cam.y+6,suitW=64,suitH=94;
 ctx.save();ctx.translate(xSuit,ySuit);
 if(z.allyFacing<0)ctx.scale(-1,1);
 ctx.globalAlpha=.97;
 if(walk.frames.length){
   const index=z.allyMoving?Math.floor(z.walkClock/walk.duration)%walk.frames.length:0;
   ctx.drawImage(walk.frames[index],-suitW/2,-suitH,suitW,suitH);
 }else if(z.allyMoving&&isReady(walk.img)){
   ctx.drawImage(walk.img,-suitW/2,-suitH,suitW,suitH);
 }else if(isReady(IMG.suit)){
   ctx.drawImage(IMG.suit,-suitW/2,-suitH,suitW,suitH);
 }else fallback(ctx,false);
 ctx.restore();
 if(z.t<=0)return;
 const alpha=clamp(Math.min((12-z.t)*2.4,z.t*1.7),0,1),x=z.astraX+93-cam.x,y=z.astraY+20-cam.y;
 if(q!=='lite'){ctx.save();ctx.globalCompositeOperation='screen';const glow=ctx.createRadialGradient(x,y-115,12,x,y-115,150);glow.addColorStop(0,'rgba(255,148,228,.24)');glow.addColorStop(1,'rgba(255,148,228,0)');ctx.fillStyle=glow;ctx.beginPath();ctx.arc(x,y-115,150,0,PI);ctx.fill();ctx.restore()}
 drawImage(ctx,IMG.astraea,x,y,235,255,.97*alpha,true);
}
function drawFront(ctx,cam,g,q='auto'){
 if(!g)return;
 ctx.save();ctx.globalCompositeOperation='screen';ctx.lineCap='round';
 for(const r of z.rays.slice(-(q==='lite'?14:30))){
  const a=clamp(r.time/r.max,0,1),x=r.x-cam.x,y=r.y-cam.y,X=r.X-cam.x,Y=r.Y-cam.y;
  ctx.globalAlpha=a*.22;ctx.strokeStyle=r.color;ctx.lineWidth=r.w*(q==='lite'?2.4:4.5);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(X,Y);ctx.stroke();
  ctx.globalAlpha=a*.9;ctx.strokeStyle=white;ctx.lineWidth=r.w*.6;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(X,Y);ctx.stroke();
 }
 for(const p of z.sparks.slice(-(q==='lite'?30:q==='high'?90:55))){
  ctx.globalAlpha=clamp(p.life/p.max,0,1);ctx.strokeStyle=p.color;ctx.lineWidth=p.sz*ctx.globalAlpha;
  const x=p.x-cam.x,y=p.y-cam.y;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-p.vx*.03,y-p.vy*.03);ctx.stroke();
 }
 ctx.restore();
}
function drawScreen(ctx,W,H,g,q='auto'){
 if(!g)return;
 if(z.intro>0){const a=clamp(Math.min((1.8-z.intro)*5,z.intro*4),0,1);
  ctx.save();ctx.globalAlpha=a;const grad=ctx.createLinearGradient(0,0,W*.7,0);grad.addColorStop(0,'rgba(11,7,24,.86)');grad.addColorStop(1,'rgba(11,7,24,0)');
  ctx.fillStyle=grad;ctx.fillRect(0,H*.18,W*.7,H*.38);
  ctx.textAlign='left';ctx.fillStyle=white;ctx.font='900 32px system-ui,sans-serif';ctx.fillText('ASTRAEA // DESCENT',W*.065,H*.30);
  ctx.font='800 15px ui-monospace,monospace';ctx.fillStyle=pink;ctx.fillText('No.3 / GUARDIAN GENOME',W*.07,H*.36);
  ctx.font='700 14px system-ui,sans-serif';ctx.fillStyle=white;ctx.fillText('記憶は、滅びない。',W*.07,H*.43);
  ctx.strokeStyle=pink;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(W*.07,H*.48);ctx.lineTo(W*.55,H*.48);ctx.stroke();ctx.restore();
 }
 if(z.flash>0&&q!=='lite'){ctx.save();ctx.globalAlpha=z.flash*.18;ctx.strokeStyle=pink;ctx.lineWidth=8;ctx.strokeRect(7,7,W-14,H-14);ctx.restore()}
}
window.RUU_COMPANION={VERSION:'1.15.0',reset,canDeploy,status,onKill,deploy,tick,drawGround,drawUnits,drawFront,drawScreen,position:()=>z.allyX===null?null:{x:z.allyX,y:z.allyY}};
})();
