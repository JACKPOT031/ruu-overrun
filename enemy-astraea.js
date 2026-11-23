/* RUU//OVERRUN v1.32.0 — ASTRAEA // HOSTILE PRESSURE
   Six frozen-warning attacks, bounded pursuit and a reserved projectile pool.
   Reuses the approved flying atlas; beams remain single direct-hit pulses.
*/
(()=>{
'use strict';
const TAU=Math.PI*2,clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const CELL=256,COLS=4,INTRO=2,LASER_LENGTH=1020,MAX_TRAILS=12,MAX_RAYS=3;
const MAX_LEAD=520,ATTACK_RANGE=2600,MAX_PATTERN_SHOTS=64,SAFE_LANE=88;
const RED='#ff657d',PALE='#ffe0e7',SAFE='#83ffd3';
const ATTACKS=[
 {type:'laser',warning:.95,cooldown:1.75},{type:'fan',warning:1.05,cooldown:1.8},
 {type:'triple',warning:1.15,cooldown:2.0},{type:'pincer',warning:1.15,cooldown:2.0},
 {type:'charge',warning:1.2,cooldown:2.1},{type:'ring',warning:1.2,cooldown:2.15}
];
const IMAGES={};
for(const [key,src] of Object.entries({flight:'assets/astraea_flight_atlas.webp',fallback:'assets/astraea-companion.svg'})){
 if(typeof Image==='undefined'){IMAGES[key]=null;continue}
 const image=new Image();image.decoding='async';image.src=src;IMAGES[key]=image;
}
// The registry is only for rendering; all combat state belongs to each unit.
const units=new Map();
function maxHp(level){
 const value=Number(level),safeLevel=Number.isFinite(value)?Math.max(1,value):1;
 return Math.ceil(Math.ceil(3000+40*safeLevel)*1.25);
}
function spawn(g,api,level=g?.level){
 if(!g?.player)return null;
 // The encounter owns one hostile ASTRAEA. A repeated spawn request returns it
 // rather than growing the render registry; a new run disposes of the old owner.
 for(const [unit,owner] of units){
  if(owner===g&&unit.hp>0&&!unit.astraeaBrain.defeated)return unit;
  onDefeat(unit,owner);
 }
 const p=g.player,e=api?.spawn?.('enemy_astraea',p.x+520,p.y-190,1);
 if(!e)return null;
 e.enemyAstraea=true;e.maxHp=maxHp(level);e.hp=e.maxHp;e.r=42;e.dmg=22;e.speed=0;
 e.shoot=9999;e.attack=INTRO+.2;e.xp=220;e.col=RED;e.elite=false;e.pushX=0;e.pushY=0;
 e.astraeaBrain={intro:INTRO,clock:0,phase2:false,critical:false,phasePulse:0,pattern:0,cooldown:1.1,
  wind:0,windMax:0,warning:null,charge:null,rays:[],trails:[],trailTimer:0,
  patrolIndex:0,patrolTimer:0,facing:-1,defeated:false,
  playerX:p.x,playerY:p.y,velocityX:0,velocityY:0,emitted:0,attempted:0,lastAttack:null};
 units.set(e,g);
 api?.wave?.(e.x,e.y,130,RED);api?.sound?.('boss');
 api?.toast?.('ASTRAEA // HOSTILE SIGNAL',true);
 return e;
}
function isIntro(e){return !!(e?.enemyAstraea&&e.hp>0&&!e.astraeaBrain?.defeated&&e.astraeaBrain?.intro>0)}
function segment(x,y,angle,length,halfWidth){return {x,y,x2:x+Math.cos(angle)*length,y2:y+Math.sin(angle)*length,halfWidth};}
function distanceToSegment(x,y,s){
 const dx=s.x2-s.x,dy=s.y2-s.y,length2=dx*dx+dy*dy;
 const t=length2?clamp(((x-s.x)*dx+(y-s.y)*dy)/length2,0,1):0;
 return Math.hypot(x-s.x-t*dx,y-s.y-t*dy);
}
function intersectsPlayer(s,p){return distanceToSegment(p.x,p.y,s)<=s.halfWidth+(p.r||20);}
function tier(b){return b.critical?2:b.phase2?1:0;}
function observePlayer(b,p,dt){
 const dx=p.x-b.playerX,dy=p.y-b.playerY,distance=Math.hypot(dx,dy);
 // Sample actual movement, including dash. Ignore discontinuities from a debug
 // reposition rather than converting a teleport into a huge predictive aim.
 const valid=distance<=700*dt+4,scale=valid?Math.min(1,650*dt/Math.max(.001,distance))/dt:0;
 b.velocityX=dx*scale;b.velocityY=dy*scale;b.playerX=p.x;b.playerY=p.y;
}
function predictedTarget(b,p,seconds){
 const speed=Math.hypot(b.velocityX,b.velocityY),time=Math.min(seconds,MAX_LEAD/Math.max(1,speed));
 return {x:p.x+b.velocityX*time,y:p.y+b.velocityY*time};
}
function shot(w,x,y,angle,speed,distance,damage,fxType='prism',radius=7){
 if(w.projectiles.length>=MAX_PATTERN_SHOTS||distance<=1)return;
 const s=segment(x,y,angle,distance,radius);
 w.segments.push(s);
 w.projectiles.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,
  r:radius,ttl:distance/speed,damage,col:RED,fxType});
}
function buildBarrage(w,e,g,level){
 const b=e.astraeaBrain,p=g.player,heading=Math.hypot(b.velocityX,b.velocityY)>10?
  Math.atan2(b.velocityY,b.velocityX):Math.atan2(p.y-e.y,p.x-e.x);
 if(w.type==='fan'){
  const x=e.x+b.facing*55,y=e.y+10,speed=440+level*50;
  w.target=predictedTarget(b,p,w.duration+Math.min(1.3,Math.hypot(p.x-x,p.y-y)/speed));
  const angle=Math.atan2(w.target.y-y,w.target.x-x),count=[19,27,35][level],spread=1.65+level*.15;
  const distance=clamp(Math.hypot(w.target.x-x,w.target.y-y)+850,speed*2.2,speed*6.8);
  for(let i=0;i<count;i++)shot(w,x,y,angle+(i-(count-1)/2)*spread/(count-1),speed,distance,14+level*2,i%3?'prism':'needle');
  return;
 }
 const center=w.target,forward={x:Math.cos(heading),y:Math.sin(heading)},side={x:-forward.y,y:forward.x};
 const safeBuffer=SAFE_LANE+(p.r||20)+7;
 if(w.type==='pincer'){
  const count=[15,19,23][level],span=520,speed=340+level*40,width=380;
  w.safeSegments=[{x:center.x-side.x*(width+70),y:center.y-side.y*(width+70),
   x2:center.x+side.x*(width+70),y2:center.y+side.y*(width+70),halfWidth:SAFE_LANE}];
  for(let i=0;i<count;i++){
   const offset=-span+2*span*i/(count-1);if(Math.abs(offset)<=safeBuffer)continue;
   for(const sign of [-1,1]){
    const x=center.x+forward.x*offset+side.x*width*sign,y=center.y+forward.y*offset+side.y*width*sign;
    shot(w,x,y,heading-sign*Math.PI/2,speed,width*2+40,14+level*2,'needle');
   }
  }
 }else{
  const radius=360-level*20,count=[40,52,64][level],speed=300+level*40;
  w.ring={x:center.x,y:center.y,radius,gap:heading+Math.PI/2,gapHalf:Math.asin(Math.min(1,safeBuffer/radius))};
  w.safeSegments=[{x:center.x-side.x*(radius+75),y:center.y-side.y*(radius+75),
   x2:center.x+side.x*(radius+75),y2:center.y+side.y*(radius+75),halfWidth:SAFE_LANE}];
  for(let i=0;i<count;i++){
   const angle=heading+i*TAU/count,off=Math.abs(Math.cos(angle-heading)*radius);
   if(off<=safeBuffer)continue;
   // Bullets expire before crossing the visible side escape lane. Include both
   // projectile and player radius, so the green center-path really stays open.
   const travel=radius*(1-safeBuffer/off);if(travel<30)continue;
   shot(w,center.x+Math.cos(angle)*radius,center.y+Math.sin(angle)*radius,angle+Math.PI,speed,travel,14+level*2,'core');
  }
 }
}
function beginAttack(e,g,api){
 const b=e.astraeaBrain,p=g.player,attack=ATTACKS[b.pattern];
 b.facing=p.x<e.x?-1:1;e.pushX=0;e.pushY=0;
 const level=tier(b),target=predictedTarget(b,p,attack.warning);
 const warning={type:attack.type,tier:level,duration:attack.warning,target,damage:e.dmg+level*2,
  segments:[],projectiles:[],safeSegments:[]};
 if(attack.type==='charge'){
  const angle=Math.atan2(target.y-e.y,target.x-e.x),length=clamp(Math.hypot(target.x-e.x,target.y-e.y)+180,420,1450);
  warning.segments=[segment(e.x,e.y,angle,length,e.r)];
 }else if(attack.type==='laser'||attack.type==='triple'){
  const x=e.x+b.facing*55,y=e.y+10,angle=Math.atan2(target.y-y,target.x-x);
  const length=clamp(Math.hypot(target.x-x,target.y-y)+220,LASER_LENGTH,3200);
  const spread=.28-level*.025,offsets=attack.type==='triple'?[-spread,0,spread]:[0];
  warning.segments=offsets.map(offset=>segment(x,y,angle+offset,length,12+level*2));
 }else{
  buildBarrage(warning,e,g,level);
 }
 // Origin, direction, length, and hit width are shared by warnings and attacks.
 b.warning=warning;b.wind=attack.warning;b.windMax=attack.warning;
 e.attack=Math.max(e.attack||0,.25);api?.sound?.('shield');
}
function releaseAttack(e,g,api){
 const b=e.astraeaBrain,warning=b.warning;if(!warning)return;
 const attack=ATTACKS[b.pattern];
 b.warning=null;b.wind=0;b.cooldown=attack.cooldown*(b.critical?.62:b.phase2?.78:1);b.lastAttack=warning.type;
 b.pattern=(b.pattern+1)%ATTACKS.length;
 if(warning.type==='charge'){
  const s=warning.segments[0],length=Math.hypot(s.x2-s.x,s.y2-s.y);
  b.charge={segment:s,dx:(s.x2-s.x)/length,dy:(s.y2-s.y)/length,remaining:length,hit:false,
   speed:880+warning.tier*100,damage:warning.damage};
 }else if(warning.projectiles.length){
  const shots=warning.projectiles.map(value=>({...value,enemyAstraeaShot:true,astraeaOwner:e,
   astraeaAttack:warning.type,born:b.clock}));
  b.attempted+=shots.length;
  // One allocator call scans the shared pool once; no per-shot full-pool scan.
  b.emitted+=window.RUU_SECRET_BOSS?.emitProjectileBatch?.(g,shots)||0;
 }else if(warning.type==='laser'||warning.type==='triple'){
  b.rays=warning.segments.slice(0,MAX_RAYS).map(s=>({...s,life:.26,max:.26}));
  // A laser is one pulse at release. Its short afterglow never tracks or re-hits.
  const hit=warning.segments.find(s=>intersectsPlayer(s,g.player));
  if(hit)api?.hurt?.(warning.damage,hit.x,hit.y);
 }
 api?.sound?.('rail');api?.wave?.(e.x,e.y,90,RED);
}
function rememberTrail(e,dt){
 const b=e.astraeaBrain;b.trailTimer-=dt;
 if(b.trailTimer>0)return;
 b.trailTimer=.07;b.trails.push({x:e.x,y:e.y,life:.42,max:.42});
 if(b.trails.length>MAX_TRAILS)b.trails.shift();
}
function stepCharge(e,dt,g,api){
 const b=e.astraeaBrain,charge=b.charge,oldX=e.x,oldY=e.y;
 const distance=Math.min(charge.remaining,charge.speed*(e.slow>0?.56:1)*dt);
 e.pushX=0;e.pushY=0;e.attack=Math.max(e.attack||0,.25);
 e.x+=charge.dx*distance;e.y+=charge.dy*distance;charge.remaining=Math.max(0,charge.remaining-distance);
 // Test the actual swept hull rather than teleporting or damaging the full path.
 const sweep={x:oldX,y:oldY,x2:e.x,y2:e.y,halfWidth:charge.segment.halfWidth};
 if(!charge.hit&&intersectsPlayer(sweep,g.player)){
  charge.hit=true;api?.hurt?.(charge.damage,e.x,e.y);
 }
 rememberTrail(e,dt);
 if(charge.remaining<=0){b.charge=null;e.attack=Math.max(e.attack||0,.4);}
}
function patrol(e,dt,g){
 const b=e.astraeaBrain,p=g.player,level=tier(b),playerDistance=Math.hypot(p.x-e.x,p.y-e.y);
 const target=predictedTarget(b,p,.65),angle=Math.atan2(e.y-target.y,e.x-target.x);
 b.patrolTimer+=dt;
 if(b.patrolTimer>2.2){b.patrolIndex++;b.patrolTimer=0;}
 const side=b.patrolIndex%2?1:-1,orbit=playerDistance>500?0:side*.35;
 const radius=playerDistance>650?90:260-level*25;
 const x=target.x+Math.cos(angle+orbit)*radius,y=target.y+Math.sin(angle+orbit)*radius;
 const dx=x-e.x,dy=y-e.y,distance=Math.hypot(dx,dy);
 const speed=(playerDistance>650?560+level*60:playerDistance>420?420+level*50:300+level*40)*(e.slow>0?.56:1);
 if(distance>0){
  const travel=Math.min(distance,speed*dt);e.x+=dx/distance*travel;e.y+=dy/distance*travel;
  if(Math.abs(dx)>.5)b.facing=dx<0?-1:1;rememberTrail(e,dt);
 }
 e.pushX*=.2;e.pushY*=.2;
}
function step(e,dt,g,api,q='auto'){
 const b=e?.astraeaBrain;
 if(!e?.enemyAstraea||!b||b.defeated||e.hp<=0||!g?.player||dt<=0)return;
 e.speed=0;b.clock+=dt;b.phasePulse=Math.max(0,b.phasePulse-dt);
 observePlayer(b,g.player,dt);
 for(let i=b.rays.length-1;i>=0;i--)if((b.rays[i].life-=dt)<=0)b.rays.splice(i,1);
 for(let i=b.trails.length-1;i>=0;i--)if((b.trails[i].life-=dt)<=0)b.trails.splice(i,1);
 if(b.intro>0){
  b.intro=Math.max(0,b.intro-dt);e.pushX=0;e.pushY=0;e.attack=Math.max(e.attack||0,b.intro+.25);return;
 }
 if(!b.phase2&&e.hp<=e.maxHp*.5){
  b.phase2=true;b.phasePulse=1;api?.wave?.(e.x,e.y,150,RED);
  api?.toast?.('ASTRAEA // HOSTILE OVERDRIVE',true);
 }
 if(!b.critical&&e.hp<=e.maxHp*.2){
  b.critical=true;b.phasePulse=1.4;api?.wave?.(e.x,e.y,180,'#ff365d');
  api?.toast?.('ASTRAEA // CRITICAL ASSAULT',true);
 }
 if(b.charge){stepCharge(e,dt,g,api);return;}
 if(b.wind>0){
  e.pushX=0;e.pushY=0;e.attack=Math.max(e.attack||0,.25);
  b.wind=Math.max(0,b.wind-dt);if(b.wind===0)releaseAttack(e,g,api);return;
 }
 b.cooldown=Math.max(0,b.cooldown-dt);
 if(b.cooldown===0&&Math.hypot(g.player.x-e.x,g.player.y-e.y)<=ATTACK_RANGE){beginAttack(e,g,api);return;}
 patrol(e,dt,g);
}
function onDefeat(e,g=units.get(e)){
 const b=e?.astraeaBrain;if(!e?.enemyAstraea||!b)return false;
 const fresh=!b.defeated;b.defeated=true;b.intro=0;b.wind=0;b.warning=null;b.charge=null;
 b.rays.length=0;b.trails.length=0;b.velocityX=0;b.velocityY=0;
 if(Array.isArray(g?.ebullets))for(let i=g.ebullets.length-1;i>=0;i--){
  const bullet=g.ebullets[i];if(bullet.enemyAstraeaShot&&bullet.astraeaOwner===e)g.ebullets.splice(i,1);
 }
 e.speed=0;e.pushX=0;e.pushY=0;units.delete(e);
 return fresh;
}
function reset(){for(const [e,g] of units)onDefeat(e,g);units.clear();}
function status(g){
 const alive=[];for(const [e,owner] of units)if((!g||owner===g)&&e.hp>0&&!e.astraeaBrain.defeated)alive.push(e);
 const first=alive[0]?.astraeaBrain;
 return {active:!!alive.length,remaining:alive.length,hp:alive.reduce((sum,e)=>sum+e.hp,0),
  maxHp:alive.reduce((sum,e)=>sum+e.maxHp,0),phase2:alive.some(e=>e.astraeaBrain.phase2),
  critical:alive.some(e=>e.astraeaBrain.critical),intro:first?.intro||0,
  attack:first?.warning?.type||(first?.charge?'charge':'patrol'),nextAttack:first?ATTACKS[first.pattern].type:null,
  emitted:alive.reduce((sum,e)=>sum+e.astraeaBrain.emitted,0),attempted:alive.reduce((sum,e)=>sum+e.astraeaBrain.attempted,0),
  projectiles:(g?.ebullets||[]).reduce((sum,b)=>sum+(b.enemyAstraeaShot?1:0),0),
  projectileCap:window.RUU_SECRET_BOSS?.ASTRAEA_RESERVE||120};
}
function ready(image){return !!(image?.complete&&image.naturalWidth>0&&image.naturalHeight>0);}
function drawSprite(ctx,e,x,y,opacity){
 const b=e.astraeaBrain,frame=Math.floor(b.clock/.12)%8,atlas=IMAGES.flight;
 ctx.save();ctx.translate(x,y);ctx.globalAlpha*=opacity;if(b.facing>0)ctx.scale(-1,1);
 if(ready(atlas)&&atlas.naturalWidth>=CELL*COLS&&atlas.naturalHeight>=CELL*2){
  ctx.drawImage(atlas,(frame%COLS)*CELL,Math.floor(frame/COLS)*CELL,CELL,CELL,-105,-105,210,210);
 }else if(ready(IMAGES.fallback))ctx.drawImage(IMAGES.fallback,-103,-112,206,210);
 else{
  ctx.fillStyle='#391e35';ctx.strokeStyle=RED;ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(-64,22);ctx.lineTo(-23,-20);ctx.lineTo(0,-71);ctx.lineTo(25,-19);ctx.lineTo(65,22);ctx.lineTo(18,12);ctx.lineTo(0,54);ctx.lineTo(-18,12);ctx.closePath();ctx.fill();ctx.stroke();
 }
 ctx.restore();
}
function drawCharacter(ctx,e,cam,q='auto'){
 const b=e?.astraeaBrain;if(!e?.enemyAstraea||!b||b.defeated||e.hp<=0)return;
 const x=e.x-cam.x,y=e.y-cam.y;if(x<-220||x>1420||y<-220||y>895)return;
 if(q!=='lite')for(let i=Math.max(0,b.trails.length-6);i<b.trails.length;i+=2){
  const trail=b.trails[i];drawSprite(ctx,e,trail.x-cam.x,trail.y-cam.y,clamp(trail.life/trail.max,0,1)*.12);
 }
 ctx.save();ctx.strokeStyle=RED;ctx.lineWidth=2;ctx.globalAlpha=.65;
 ctx.beginPath();ctx.arc(x,y,e.r+17,b.clock*.7,b.clock*.7+TAU*.75);ctx.stroke();ctx.restore();
 drawSprite(ctx,e,x,y,1);
 ctx.save();ctx.fillStyle='#180b18ed';ctx.fillRect(x-82,y-148,164,28);
 ctx.strokeStyle=RED;ctx.lineWidth=1;ctx.strokeRect(x-82,y-148,164,28);
 ctx.fillStyle=PALE;ctx.textAlign='center';ctx.font='900 11px ui-monospace,monospace';
 ctx.fillText('ASTRAEA // HOSTILE',x,y-136,154);
 ctx.fillStyle='#421626';ctx.fillRect(x-75,y-129,150,4);
 ctx.fillStyle=b.critical?'#ffb0a0':b.phase2?'#ff3f69':RED;ctx.fillRect(x-75,y-129,150*clamp(e.hp/Math.max(1,e.maxHp),0,1),4);
 if(b.phase2){ctx.font='800 9px ui-monospace,monospace';ctx.fillText(b.critical?'CRITICAL // ASSAULT':'PHASE II // PURSUIT',x,y-112,158);}
 ctx.restore();
}
function drawZone(ctx,s,cam,alpha,dashed=true,color=RED,edge=PALE){
 const dx=s.x2-s.x,dy=s.y2-s.y,length=Math.hypot(dx,dy),w=s.halfWidth;
 ctx.save();ctx.translate(s.x-cam.x,s.y-cam.y);ctx.rotate(Math.atan2(dy,dx));
 // This capsule is exactly the collision segment expanded by the attack radius.
 ctx.beginPath();ctx.moveTo(0,-w);ctx.lineTo(length,-w);ctx.arc(length,0,w,-Math.PI/2,Math.PI/2);
 ctx.lineTo(0,w);ctx.arc(0,0,w,Math.PI/2,Math.PI*1.5);ctx.closePath();
 ctx.fillStyle=color;ctx.globalAlpha=alpha;ctx.fill();
 ctx.strokeStyle=edge;ctx.lineWidth=1.8;ctx.globalAlpha=Math.min(1,alpha*3.4);
 if(dashed)ctx.setLineDash([11,7]);ctx.stroke();ctx.restore();
}
function drawGround(ctx,cam,g,q='auto'){
 for(const [e,owner] of units){
  const b=e.astraeaBrain;if(owner!==g||e.hp<=0||b.defeated)continue;
  if(b.intro>0){
   const x=e.x-cam.x,y=e.y-cam.y,progress=clamp(1-b.intro/INTRO,0,1);
   ctx.save();ctx.fillStyle=RED;ctx.globalAlpha=.09;ctx.beginPath();ctx.arc(x,y,95,0,TAU);ctx.fill();
   ctx.globalAlpha=.9;ctx.strokeStyle=RED;ctx.lineWidth=3;
   ctx.beginPath();ctx.arc(x,y,110,-Math.PI/2,-Math.PI/2+TAU*progress);ctx.stroke();
   ctx.fillStyle=PALE;ctx.textAlign='center';ctx.font='800 11px ui-monospace,monospace';ctx.fillText('HOSTILE ARRIVAL',x,y+124,165);ctx.restore();
  }
  if(b.warning){const w=b.warning,progress=clamp(1-b.wind/Math.max(.01,b.windMax),0,1);
   for(const s of w.segments)drawZone(ctx,s,cam,w.projectiles.length?.045+progress*.035:.13+progress*.12);
   for(const safe of w.safeSegments)drawZone(ctx,safe,cam,.11,false,SAFE,SAFE);
   if(w.ring){const r=w.ring,x=r.x-cam.x,y=r.y-cam.y;
    ctx.save();ctx.strokeStyle=RED;ctx.lineWidth=3;ctx.globalAlpha=.8;
    for(let i=0;i<2;i++){
     const a=r.gap+i*Math.PI;ctx.beginPath();ctx.arc(x,y,r.radius,a+r.gapHalf,a+Math.PI-r.gapHalf);ctx.stroke();
     ctx.strokeStyle=SAFE;ctx.lineWidth=5;ctx.beginPath();ctx.arc(x,y,r.radius,a-r.gapHalf,a+r.gapHalf);ctx.stroke();
     ctx.strokeStyle=RED;ctx.lineWidth=3;
    }
    ctx.restore();
   }
   ctx.save();ctx.globalAlpha=.95;ctx.textAlign='center';ctx.fillStyle=w.safeSegments.length?SAFE:PALE;
   ctx.font='800 11px ui-monospace,monospace';
   ctx.fillText(w.type.toUpperCase()+(w.safeSegments.length?' // SIDE EXIT':''),
    clamp(w.target.x-cam.x,100,1100),clamp(w.target.y-cam.y-38,100,600),250);ctx.restore();
  }
  if(b.charge)drawZone(ctx,b.charge.segment,cam,.09,false);
 }
}
function drawWorld(ctx,cam,g,q='auto'){
 for(const [e,owner] of units){
  const b=e.astraeaBrain;if(owner!==g||e.hp<=0||b.defeated||!b.rays.length)continue;
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';
  for(const ray of b.rays){
   ctx.globalAlpha=clamp(ray.life/ray.max,0,1);ctx.strokeStyle=RED;ctx.lineWidth=ray.halfWidth*2;
   ctx.beginPath();ctx.moveTo(ray.x-cam.x,ray.y-cam.y);ctx.lineTo(ray.x2-cam.x,ray.y2-cam.y);ctx.stroke();
   ctx.strokeStyle=PALE;ctx.lineWidth=3;ctx.stroke();
  }
  ctx.restore();
 }
}
window.RUU_ENEMY_ASTRAEA={VERSION:'1.32.0',maxHp,spawn,step,isIntro,status,drawCharacter,drawGround,drawWorld,onDefeat,reset};
})();
