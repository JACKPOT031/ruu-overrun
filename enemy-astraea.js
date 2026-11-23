/* RUU//OVERRUN v1.31.0 — ASTRAEA // HOSTILE
   Reuses the approved flying atlas. Every attack freezes a visible warning
   before firing; enemy beams never enter the shared projectile pool.
*/
(()=>{
'use strict';
const TAU=Math.PI*2,clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const CELL=256,COLS=4,INTRO=2,LASER_LENGTH=1020,MAX_TRAILS=12,MAX_RAYS=3;
const RED='#ff657d',PALE='#ffe0e7',PATROL=[{x:360,y:-190},{x:-350,y:-160},{x:-300,y:190},{x:330,y:180}];
const ATTACKS=[{type:'laser',warning:.95,cooldown:2.6},{type:'triple',warning:1.15,cooldown:3.0},{type:'charge',warning:1.2,cooldown:3.2}];
const IMAGES={};
for(const [key,src] of Object.entries({flight:'assets/astraea_flight_atlas.webp',fallback:'assets/astraea-companion.svg'})){
 if(typeof Image==='undefined'){IMAGES[key]=null;continue}
 const image=new Image();image.decoding='async';image.src=src;IMAGES[key]=image;
}
// The registry is only for rendering; all combat state belongs to each unit.
const units=new Map();
function maxHp(level){
 const value=Number(level),safeLevel=Number.isFinite(value)?Math.max(1,value):1;
 return Math.ceil(3000+40*safeLevel);
}
function spawn(g,api,level=g?.level){
 if(!g?.player)return null;
 const p=g.player,e=api?.spawn?.('enemy_astraea',p.x+520,p.y-190,1);
 if(!e)return null;
 e.enemyAstraea=true;e.maxHp=maxHp(level);e.hp=e.maxHp;e.r=42;e.dmg=18;e.speed=0;
 e.shoot=9999;e.attack=INTRO+.2;e.xp=220;e.col=RED;e.elite=false;e.pushX=0;e.pushY=0;
 e.astraeaBrain={intro:INTRO,clock:0,phase2:false,phasePulse:0,pattern:0,cooldown:1.3,
  wind:0,windMax:0,warning:null,charge:null,rays:[],trails:[],trailTimer:0,
  patrolIndex:0,patrolTimer:0,facing:-1,defeated:false};
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
function beginAttack(e,g,api){
 const b=e.astraeaBrain,p=g.player,attack=ATTACKS[b.pattern];
 b.facing=p.x<e.x?-1:1;e.pushX=0;e.pushY=0;
 let segments;
 if(attack.type==='charge'){
  const angle=Math.atan2(p.y-e.y,p.x-e.x),length=clamp(Math.hypot(p.x-e.x,p.y-e.y)+180,360,720);
  segments=[segment(e.x,e.y,angle,length,e.r)];
 }else{
  const x=e.x+b.facing*55,y=e.y+10,angle=Math.atan2(p.y-y,p.x-x);
  const offsets=attack.type==='triple'?[-.34,0,.34]:[0];
  segments=offsets.map(offset=>segment(x,y,angle+offset,LASER_LENGTH,10));
 }
 // Origin, direction, length, and hit width are shared by warnings and attacks.
 b.warning={type:attack.type,segments};b.wind=attack.warning;b.windMax=attack.warning;
 e.attack=Math.max(e.attack||0,.25);api?.sound?.('shield');
}
function releaseAttack(e,g,api){
 const b=e.astraeaBrain,warning=b.warning;if(!warning)return;
 const attack=ATTACKS[b.pattern];
 b.warning=null;b.wind=0;b.cooldown=attack.cooldown*(b.phase2?.78:1);
 b.pattern=(b.pattern+1)%ATTACKS.length;
 if(warning.type==='charge'){
  const s=warning.segments[0],length=Math.hypot(s.x2-s.x,s.y2-s.y);
  b.charge={segment:s,dx:(s.x2-s.x)/length,dy:(s.y2-s.y)/length,remaining:length,hit:false};
 }else{
  b.rays=warning.segments.slice(0,MAX_RAYS).map(s=>({...s,life:.26,max:.26}));
  // A laser is one pulse at release. Its short afterglow never tracks or re-hits.
  const hit=warning.segments.find(s=>intersectsPlayer(s,g.player));
  if(hit)api?.hurt?.(e.dmg,hit.x,hit.y);
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
 const distance=Math.min(charge.remaining,(b.phase2?760:680)*(e.slow>0?.56:1)*dt);
 e.pushX=0;e.pushY=0;e.attack=Math.max(e.attack||0,.25);
 e.x+=charge.dx*distance;e.y+=charge.dy*distance;charge.remaining=Math.max(0,charge.remaining-distance);
 // Test the actual swept hull rather than teleporting or damaging the full path.
 const sweep={x:oldX,y:oldY,x2:e.x,y2:e.y,halfWidth:charge.segment.halfWidth};
 if(!charge.hit&&intersectsPlayer(sweep,g.player)){
  charge.hit=true;api?.hurt?.(e.dmg,e.x,e.y);
 }
 rememberTrail(e,dt);
 if(charge.remaining<=0){b.charge=null;e.attack=Math.max(e.attack||0,.4);}
}
function patrol(e,dt,g){
 const b=e.astraeaBrain,p=g.player;b.patrolTimer+=dt;
 let waypoint=PATROL[b.patrolIndex],x=p.x+waypoint.x,y=p.y+waypoint.y;
 if(b.patrolTimer>=2.8||Math.hypot(x-e.x,y-e.y)<26){
  b.patrolIndex=(b.patrolIndex+1)%PATROL.length;b.patrolTimer=0;
  waypoint=PATROL[b.patrolIndex];x=p.x+waypoint.x;y=p.y+waypoint.y;
 }
 const dx=x-e.x,dy=y-e.y,distance=Math.hypot(dx,dy);
 const speed=(Math.hypot(p.x-e.x,p.y-e.y)>900?300:b.phase2?230:200)*(e.slow>0?.56:1);
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
 for(let i=b.rays.length-1;i>=0;i--)if((b.rays[i].life-=dt)<=0)b.rays.splice(i,1);
 for(let i=b.trails.length-1;i>=0;i--)if((b.trails[i].life-=dt)<=0)b.trails.splice(i,1);
 if(b.intro>0){
  b.intro=Math.max(0,b.intro-dt);e.pushX=0;e.pushY=0;e.attack=Math.max(e.attack||0,b.intro+.25);return;
 }
 if(!b.phase2&&e.hp<e.maxHp*.5){
  b.phase2=true;b.phasePulse=1;api?.wave?.(e.x,e.y,150,RED);
  api?.toast?.('ASTRAEA // HOSTILE OVERDRIVE',true);
 }
 if(b.charge){stepCharge(e,dt,g,api);return;}
 if(b.wind>0){
  e.pushX=0;e.pushY=0;e.attack=Math.max(e.attack||0,.25);
  b.wind=Math.max(0,b.wind-dt);if(b.wind===0)releaseAttack(e,g,api);return;
 }
 b.cooldown=Math.max(0,b.cooldown-dt);
 if(b.cooldown===0&&Math.hypot(g.player.x-e.x,g.player.y-e.y)<980){beginAttack(e,g,api);return;}
 patrol(e,dt,g);
}
function onDefeat(e){
 const b=e?.astraeaBrain;if(!e?.enemyAstraea||!b)return false;
 const fresh=!b.defeated;b.defeated=true;b.intro=0;b.wind=0;b.warning=null;b.charge=null;
 b.rays.length=0;b.trails.length=0;e.speed=0;e.pushX=0;e.pushY=0;units.delete(e);
 return fresh;
}
function reset(){for(const e of units.keys())onDefeat(e);units.clear();}
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
 ctx.fillStyle=b.phase2?'#ff3f69':RED;ctx.fillRect(x-75,y-129,150*clamp(e.hp/Math.max(1,e.maxHp),0,1),4);ctx.restore();
}
function drawZone(ctx,s,cam,alpha,dashed=true){
 const dx=s.x2-s.x,dy=s.y2-s.y,length=Math.hypot(dx,dy),w=s.halfWidth;
 ctx.save();ctx.translate(s.x-cam.x,s.y-cam.y);ctx.rotate(Math.atan2(dy,dx));
 // This capsule is exactly the collision segment expanded by the attack radius.
 ctx.beginPath();ctx.moveTo(0,-w);ctx.lineTo(length,-w);ctx.arc(length,0,w,-Math.PI/2,Math.PI/2);
 ctx.lineTo(0,w);ctx.arc(0,0,w,Math.PI/2,Math.PI*1.5);ctx.closePath();
 ctx.fillStyle=RED;ctx.globalAlpha=alpha;ctx.fill();
 ctx.strokeStyle=PALE;ctx.lineWidth=1.8;ctx.globalAlpha=Math.min(1,alpha*3.4);
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
  if(b.warning){const progress=clamp(1-b.wind/Math.max(.01,b.windMax),0,1);
   for(const s of b.warning.segments)drawZone(ctx,s,cam,.13+progress*.12);
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
window.RUU_ENEMY_ASTRAEA={VERSION:'1.31.0',maxHp,spawn,step,isIntro,drawCharacter,drawGround,drawWorld,onDefeat,reset};
})();
