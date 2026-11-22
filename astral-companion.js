/* v1.16.0 ASTRAL COMPANION / MASS-PRODUCED SUPPORT PILOT — game-only; no Cloudflare changes.
   ASTRAL-SUIT: a 25%-chance named escort. ASTRAEA No.3: once per run,
   auto-dispatch at a FINAL boss spawn if a pilot joined and Ruu HP <= 50%.
   Sprites are stylized game interpretations of the supplied character sheets.
*/
(()=>{
'use strict';
const PI=Math.PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),pink='#ff85d0',white='#ffe5f7',silver='#b8d3df',gold='#ffe2b5';
const IMG={};
for(const [id,src] of Object.entries({suit:'assets/astral-suit-companion.svg',astraea:'assets/astraea-companion.svg',flight:'assets/astraea_flight_atlas.webp',cutin:'assets/astraea_emergency_cutin.webp'})){
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
// Twelve distinct patrol waypoints sweep across the entire 1200x675 camera.
const FLIGHT_PATH=[
 {x:385,y:-204},{x:-370,y:-192},{x:-413,y:151},{x:375,y:190},
 {x:76,y:-245},{x:-145,y:213},{x:421,y:-66},{x:-394,y:-36},
 {x:-235,y:-207},{x:246,y:173},{x:36,y:102},{x:341,y:-191}
];
const ATLAS_CELL=256,ATLAS_COLS=4,FLIGHT_DURATION=12;
function init(){return{sync:0,bossDown:false,used:false,t:0,intro:0,pending:0,queued:false,attempts:0,autoTriggered:false,triggerHpRatio:null,allyX:null,allyY:null,astraX:0,astraY:0,flightClock:0,flightStep:0,flightAnim:0,flightFace:-1,flightTrails:[],flightTrailTimer:0,laserCount:0,attack:.5,intercept:7,volley:.2,finished:false,rays:[],sparks:[],flash:0,shots:0,blocked:0,allyMoving:false,allyFacing:1,walkClock:0,walkSpeed:0}}
let z=init();function reset(){z=init()}
// No manual deployment and no second random roll.
// The pilot roll already makes emergency support rare: 25% at most.
function emergencyEligible(g){
 const p=g?.player;
 return !!p && p.hp>0 && p.maxHp>0 && p.hp/p.maxHp<=.5 &&
   window.RUU_PILOTS?.hasEscort?.()===true && !z.used && !z.queued;
}
function onFinalBossSpawn(g,api,q='auto'){
 // Runs ONCE at each genuine final boss spawn, never on later damage ticks.
 // In ENDLESS a later final encounter may qualify, but ASTRAEA remains one-use.
 if(!g?.player||z.used||z.queued)return false;
 z.attempts++;
 if(!emergencyEligible(g))return false;
 z.queued=true;z.pending=1.05;
 z.triggerHpRatio=g.player.hp/g.player.maxHp;
 // This halo is only a signal cue; do not interfere with boss warning text.
 fxSparks(g.player.x,g.player.y,pink,20,140,q);
 return true;
}
function status(g){
 const escort=window.RUU_PILOTS?.hasEscort?.()===true;
 let text=z.used?(z.t>0?'ASTRAEA ACTIVE / '+z.t.toFixed(1)+'s':'ASTRAEA / DEPLOYED'):
 z.queued?'ASTRAEA / SIGNAL INBOUND':
 !escort?'ASTRAEA / NO ALLIED SIGNAL':
 z.attempts?'ASTRAEA / CONDITIONS NOT MET':'ASTRAEA / EMERGENCY LINK';
 return{used:z.used,active:z.t,queued:z.queued,autoTriggered:z.autoTriggered,
  triggerHpRatio:z.triggerHpRatio,attempts:z.attempts,ready:false,text,shots:z.shots,blocked:z.blocked,
  flightX:z.astraX,flightY:z.astraY,flightStep:z.flightStep,laserCount:z.laserCount};
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
function activateEmergency(g,api,q='auto'){
 if(!g?.player||!z.queued||z.used)return false;
 z.queued=false;z.pending=0;z.used=true;z.autoTriggered=true;
 z.t=FLIGHT_DURATION;z.intro=2.15;z.finished=false;z.volley=.24;z.flash=.75;
 z.flightClock=0;z.flightStep=0;z.flightAnim=0;z.flightFace=-1;
 z.flightTrails=[];z.flightTrailTimer=0;z.laserCount=0;
 const p=g.player;z.astraX=p.x+520;z.astraY=p.y-135;
 let removed=0;
 for(let i=(g.ebullets||[]).length-1;i>=0&&removed<12;i--){
  const b=g.ebullets[i];if((b.x-p.x)**2+(b.y-p.y)**2<220*220){g.ebullets.splice(i,1);removed++}
 }
 api?.wave?.(p.x,p.y,265,pink);api?.burst?.(p.x,p.y,pink,27,200);
 api?.sound?.('signature');api?.toast?.('ASTRAEA No.3 // EMERGENCY GUARDIAN RESONANCE',true);
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
 fxSparks(e.x,e.y,color,rapid?8:5,75,q);window.RUU_PILOTS?.onEscortShot?.({x:z.allyX+25,y:z.allyY-49},{x:e.x,y:e.y},g,q);z.shots+=hits;api?.sound?.('shoot');
}
function defend(g,api,q){
 const p=g.player;
 for(let i=0;i<(g.ebullets||[]).length;i++){
  const b=g.ebullets[i];
  if((b.x-p.x)**2+(b.y-p.y)**2>90*90||(b.x-z.allyX)**2+(b.y-z.allyY)**2>250*250)continue;
  g.ebullets.splice(i,1);fxLine(z.allyX,z.allyY-44,b.x,b.y,silver,3,.36);
  fxSparks(b.x,b.y,silver,14,140,q);window.RUU_PILOTS?.onIntercept?.(b.x,b.y,g,q);z.blocked++;z.intercept=window.RUU_PILOTS?.interceptRate?.()||9.5;api?.sound?.('shield');return;
 }
}
function burstAstraea(g,api,q){
 // Every volley emits bright visible laser beams from ASTRAEA's actual gun.
 // FX LITE and HIGH have identical targets, damage, and timings.
 const enemies=targetList(g,z.astraX,z.astraY,1000,2);
 if(!enemies.length)return;
 const primary=enemies[0];
 z.flightFace=primary.x>=z.astraX?1:-1;
 const gunX=z.astraX+z.flightFace*55,gunY=z.astraY+10;
 for(const [i,e] of enemies.entries()){
  const amount=e.kind==='boss'||e.kind==='final'?27:42+(g.level||1)*1.12;
  hitAssist(e,amount,api);
  fxLine(gunX,gunY,e.x,e.y,pink,i===0?9:5.2,.35);
  fxLine(gunX,gunY,e.x,e.y,white,i===0?3.2:2.1,.16);
  fxSparks(e.x,e.y,pink,i===0?28:17,260,q);
  if(q!=='lite')fxSparks(gunX,gunY,white,10,170,q);
  z.laserCount++;
 }
 z.flash=Math.max(z.flash,.27);
 g.scenePulse=Math.max(g.scenePulse||0,.25);
 api?.sound?.('rail');
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
function flyPatrol(dt,g,q){
 const p=g.player;
 z.flightClock+=dt;
 z.flightAnim+=dt;
 z.flightTrailTimer-=dt;
 // Visit each waypoint once per ~0.9 sec, all directions relative to the moving camera.
 const next=Math.min(FLIGHT_PATH.length-1,Math.floor(z.flightClock/.94));
 z.flightStep=next;
 const waypoint=FLIGHT_PATH[next];
 const lead=targetList(g,p.x,p.y,580,1)[0];
 const dx=lead?clamp((lead.x-p.x)*.14,-66,66):0;
 const dy=lead?clamp((lead.y-p.y)*.11,-45,45):0;
 const x=p.x+waypoint.x+dx,y=p.y+waypoint.y+dy;
 const oldX=z.astraX,oldY=z.astraY;
 const factor=1-Math.exp(-dt*6.4);
 z.astraX+=(x-z.astraX)*factor;z.astraY+=(y-z.astraY)*factor;
 const dist=Math.hypot(z.astraX-oldX,z.astraY-oldY);
 if(dist>2&&z.flightTrailTimer<=0){
  z.flightTrailTimer=q==='lite'?.12:.065;
  z.flightTrails.push({x:z.astraX,y:z.astraY,life:.45,max:.45});
  if(z.flightTrails.length>16)z.flightTrails.shift();
 }
 for(let i=z.flightTrails.length-1;i>=0;i--)
  if((z.flightTrails[i].life-=dt)<=0)z.flightTrails.splice(i,1);
}

function tick(dt,g,api,q='auto'){
 if(!g?.player||dt<=0)return;
 if(z.queued){z.pending-=dt;if(z.pending<=0)activateEmergency(g,api,q)}
 z.intro=Math.max(0,z.intro-dt);z.flash=Math.max(0,z.flash-dt*1.8);
 for(let i=z.rays.length-1;i>=0;i--){z.rays[i].time-=dt;if(z.rays[i].time<=0)z.rays.splice(i,1)}
 for(let i=z.sparks.length-1;i>=0;i--){
  const p=z.sparks[i];p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;
  p.vx*=Math.exp(-3*dt);p.vy*=Math.exp(-3*dt);if(p.life<=0)z.sparks.splice(i,1);
 }
 const p=g.player;
 if(window.RUU_PILOTS?.hasEscort?.()){
 const f=1-Math.exp(-dt*6),X=p.x-80*(p.face||1),Y=p.y+21;
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
 }
 if(z.t<=0)return;
 z.t=Math.max(0,z.t-dt);
 flyPatrol(dt,g,q);
 z.volley-=dt;
 if(z.volley<=0&&z.t>.7){z.volley=.42;burstAstraea(g,api,q)}
 if(z.t<=1.2&&!z.finished)finalAstraea(g,api,q);
 if(z.t===0){api?.toast?.('ASTRAEA // SIGNAL RELEASED',false);fxSparks(z.astraX,z.astraY,pink,32,240,q)}
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
 if(!g?.player)return;
 ctx.save();
 if(window.RUU_PILOTS?.hasEscort?.()&&z.allyX!==null&&window.RUU_PILOTS?.entering?.()?.running!==false){
  ctx.globalAlpha=.35;ctx.fillStyle='#070911';
  ctx.beginPath();ctx.ellipse(z.allyX-cam.x,z.allyY-cam.y,30,10,0,0,PI);ctx.fill();
 }
 ctx.globalAlpha=.5;
 if(z.t>0){ctx.globalAlpha=.28;ctx.strokeStyle=pink;ctx.lineWidth=2;
  ctx.beginPath();ctx.ellipse(z.astraX-cam.x,z.astraY+53-cam.y,58,16,0,0,PI);ctx.stroke()}
 ctx.restore();
}
function drawImage(ctx,img,x,y,w,h,opacity,astro){
 ctx.save();ctx.globalAlpha=opacity;ctx.translate(x,y);
 if(isReady(img))ctx.drawImage(img,-w/2,-h,w,h);else fallback(ctx,astro);
 ctx.restore();
}
function drawUnits(ctx,cam,g,q='auto'){
 if(!g?.player)return;
 if(window.RUU_PILOTS?.hasEscort?.()&&z.allyX!==null&&window.RUU_PILOTS?.entering?.()?.running!==false){
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
 }
 if(z.t<=0)return;
 const alpha=clamp(Math.min((FLIGHT_DURATION-z.t)*3,z.t*1.8),0,1),x=z.astraX-cam.x,y=z.astraY-cam.y;
 if(q!=='lite'){
  ctx.save();ctx.globalCompositeOperation='screen';
  const glow=ctx.createRadialGradient(x,y,10,x,y,122);
  glow.addColorStop(0,'rgba(255,148,226,.25)');glow.addColorStop(1,'rgba(255,148,226,0)');
  ctx.fillStyle=glow;ctx.beginPath();ctx.arc(x,y,122,0,PI);ctx.fill();ctx.restore();
 }
 // Animated real eight-frame flying GIF, decoded into a deterministic sprite atlas.
 // Fallback to the original ASTRAEA illustration if WebP decoding is unsupported.
 const frame=Math.floor(z.flightAnim/.12)%8,col=frame%ATLAS_COLS,row=Math.floor(frame/ATLAS_COLS);
 const moving=isReady(IMG.flight);
 const renderMech=(xx,yy,opacity,frameNo=frame)=>{
  ctx.save();ctx.translate(xx,yy);ctx.globalAlpha=opacity;
  if(z.flightFace>0)ctx.scale(-1,1);
  if(moving)ctx.drawImage(IMG.flight,(frameNo%4)*ATLAS_CELL,Math.floor(frameNo/4)*ATLAS_CELL,ATLAS_CELL,ATLAS_CELL,-96,-96,192,192);
  else if(isReady(IMG.astraea))ctx.drawImage(IMG.astraea,-94,-102,188,192);
  else fallback(ctx,true);
  ctx.restore();
 };
 if(q!=='lite'){
  for(const ghost of z.flightTrails.slice(-3)){
   const a=Math.max(0,ghost.life/ghost.max);
   renderMech(ghost.x-cam.x,ghost.y-cam.y,a*.14*alpha,frame);
  }
 }
 renderMech(x,y,alpha*.97,frame);

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
 if(z.intro>0){
  const a=clamp(Math.min((2.15-z.intro)*6,z.intro*3.5),0,1);
  const width=W*.56,height=width*941/1672;
  const x=W-width-15+(1-a)*65,y=H*.205;
  ctx.save();ctx.globalAlpha=a;
  const grad=ctx.createLinearGradient(x-22,0,x+width,0);
  grad.addColorStop(0,'rgba(13,7,23,0)');grad.addColorStop(1,'rgba(17,7,31,.74)');
  ctx.fillStyle=grad;ctx.fillRect(x-22,y-6,width+28,height+54);
  if(isReady(IMG.cutin))ctx.drawImage(IMG.cutin,x,y,width,height);
  else{
   ctx.fillStyle='#141527';ctx.fillRect(x,y,width,height);
   ctx.fillStyle=white;ctx.font='900 35px system-ui,sans-serif';
   ctx.fillText('ASTRAEA // EMERGENCY DESCENT',x+25,y+height/2);
  }
  ctx.strokeStyle=pink;ctx.lineWidth=2;ctx.strokeRect(x,y,width,height);
  ctx.fillStyle='#090e1dd9';ctx.fillRect(x,y+height-1,width,44);
  ctx.fillStyle=white;ctx.font='900 21px ui-monospace,Consolas,monospace';ctx.textAlign='right';
  ctx.fillText('ASTRAEA No.3 // EMERGENCY SORTIE',x+width-15,y+height+27,width-22);
  ctx.restore();
 }
 if(z.flash>0&&q!=='lite'){ctx.save();ctx.globalAlpha=z.flash*.18;ctx.strokeStyle=pink;ctx.lineWidth=8;ctx.strokeRect(7,7,W-14,H-14);ctx.restore()}
}
window.RUU_COMPANION={VERSION:'1.16.0',reset,status,onKill,onFinalBossSpawn,tick,drawGround,drawUnits,drawFront,drawScreen,position:()=>z.allyX===null?null:{x:z.allyX,y:z.allyY}};
})();
