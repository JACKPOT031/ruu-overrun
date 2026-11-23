/* RUU//OVERRUN v1.19.0 — DEVORA PHASE III / GIANT TRANSFORMATION
   Both bosses enter a third form when remaining HP <= 30%.
   All new lethal attacks are projectile-based and preceded by visible warnings.
   No invincibility, free healing or unavoidable instant damage.
*/
(()=>{
'use strict';
const TAU=Math.PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const BARRAGE_RATE=1.20; // PHASE III: safe sectors and warning duration stay unchanged.
const COLOR='#ffc375',SAFE='#9effd8';
let clock=0;
function reset(){clock=0}
function isBoss(e){return e&&(e.kind==='boss'||e.kind==='final')}
function safeDistance(a,b){return Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)))}
function cfg(e){return e.kind==='final'?{fan:9,nova:20,spd:344,ring:235,damage:13,cd:2.55}:{fan:7,nova:16,spd:292,ring:200,damage:11,cd:3.05}}
function start(e,g,api,q){
 if(!isBoss(e)||e.phase3||!e.bossMutation)return false;
 if(e.hp>e.maxHp*.30||e.bossMutation.phase<2)return false;
 const b=e.bossMutation;
 b.phase=3;b.wind=0;b.cd=1000;
 // The third form is visually 1.28x; its physical collision radius grows 1.17x.
 e.basePhase3Radius=e.r;
 // v1.19: +20% visual over the prior 1.28x, and +10% collision over 1.17x.
 e.r=Math.round(e.r*1.17*1.10);e.phase3VisualScale=1.28*1.20;
 e.speed*=1.10;e.dmg=Math.ceil(e.dmg*1.1);
 // Do not let the boss fire or contact-hit Ruu during the transformation cut-in.
 e.shoot=Math.max(e.shoot,1.52);e.attack=Math.max(e.attack||0,1.43);
 e.col='#ffc375';
 const s=e.phase3={cd:1.45,wind:0,windMax:1.16,pattern:'nova',safeAngle:0,aimX:0,aimY:0,intro:1.38,shots:0,
  nextWaveAt:g.time+7.1,wave:null,waves:0};
 // Spawn first guards on the periphery, never on top of the player.
 if(g.enemies.length<150&&api?.spawn){
  const n=g.enemies.length<135?2:1;
  for(let i=0;i<n;i++){
   const angle=i*TAU/n+Math.PI*.28,kind=e.kind==='final'?'hex':'runner',rad=565+i*46;
   const guard=api.spawn(kind,g.player.x+Math.cos(angle)*rad,g.player.y+Math.sin(angle)*rad,1.12);
   if(!guard)continue;
   guard.maxHp*=1.18;guard.hp=guard.maxHp;
   guard.col=e.kind==='final'?'#dca7ff':'#ffaf84';guard.phase3Guard=true;
  }
 }
 api?.wave?.(e.x,e.y,290,COLOR);
 api?.burst?.(e.x,e.y,COLOR,q==='lite'?23:53,265);
 api?.sfx?.('boss');
 api?.text?.(e.x,e.y-e.r-36,'PHASE III // LIMIT BREAK',COLOR,20);
 api?.toast?.(e.kind==='final'?'NULL EMPEROR // THIRD FORM':'DEVORA // THIRD FORM',true);
 g.shake=Math.max(g.shake||0,12);g.scenePulse=Math.max(g.scenePulse||0,1.1);
 return !!s;
}
function shootFan(e,g,api){
 const s=e.phase3,p=cfg(e);
 const a=Math.atan2(s.aimY-e.y,s.aimX-e.x),spread=e.kind==='final'?.91:.78;
 for(let i=0;i<p.fan&&g.ebullets.length<134;i++){
  const angle=a+(i-(p.fan-1)/2)*spread/(p.fan-1);
  g.ebullets.push({x:e.x+Math.cos(angle)*e.r*.72,y:e.y+Math.sin(angle)*e.r*.72,
   vx:Math.cos(angle)*p.spd,vy:Math.sin(angle)*p.spd,
   r:e.kind==='final'?8:7,ttl:3.9,col:COLOR,damage:p.damage});
  s.shots++;
 }
 api?.wave?.(e.x,e.y,e.r*2,COLOR);api?.burst?.(e.x,e.y,COLOR,16,170);api?.sfx?.('rail');
}
function shootSiege(e,g,api){
 const s=e.phase3,p=cfg(e);
 for(let i=0;i<p.nova&&g.ebullets.length<134;i++){
  const a=i*TAU/p.nova;
  if(safeDistance(a,s.safeAngle)<.44||safeDistance(a,s.safeAngle+Math.PI)<.44)continue;
  g.ebullets.push({x:e.x+Math.cos(a)*e.r*.72,y:e.y+Math.sin(a)*e.r*.72,
    vx:Math.cos(a)*p.ring,vy:Math.sin(a)*p.ring,
    r:e.kind==='final'?8:7,ttl:4.3,col:COLOR,damage:p.damage-1});
  s.shots++;
 }
 api?.wave?.(e.x,e.y,240,COLOR);api?.burst?.(e.x,e.y,COLOR,26,220);api?.sfx?.('boss');
}
function updateGuardWave(e,g,api,dt){
 const s=e.phase3;if(!s||!g?.player)return;
 const limit=g.mode==='endless'?240:205;
 if(!s.wave&&g.time>=s.nextWaveAt){
  s.nextWaveAt=g.time+(e.kind==='final'?8.4:10.2);
  if(g.enemies.length>=limit-5||!api?.spawn)return;
  const count=e.kind==='final'?4:3;
  s.wave={count,spawned:0,warning:.63,cooldown:0,
    direction:Math.atan2(e.y-g.player.y,e.x-g.player.x)+1.4};
  s.waves++;api?.toast?.('PHASE III // HOSTILE CLUSTER',true);
  api?.wave?.(e.x,e.y,e.r*2,'#ffc375');
 }
 const wave=s.wave;if(!wave)return;
 if(wave.warning>0){wave.warning-=dt;return}
 wave.cooldown-=dt;
 if(wave.cooldown>0||wave.spawned>=wave.count){if(wave.spawned>=wave.count)s.wave=null;return}
 if(g.enemies.length>=limit){s.wave=null;return}
 const k=wave.spawned,a=wave.direction+(k-(wave.count-1)/2)*.25,
       r=565+(k%2)*54,final=e.kind==='final',
       kind=final?['hex','caster','hex','caster'][k]:['runner','runner','brute'][k];
 const add=api.spawn(kind,g.player.x+Math.cos(a)*r,g.player.y+Math.sin(a)*r,1.08);
 if(add){add.phase3Guard=true;add.col=final?'#cca2f7':'#e99e77'}
 wave.spawned++;wave.cooldown=.23;
}

function step(e,dt,g,api,q='auto'){
 if(!isBoss(e)||e.hp<=0||!g?.player)return;
 if(!e.phase3)start(e,g,api,q);
 const s=e.phase3;if(!s)return;
 s.intro=Math.max(0,s.intro-dt);
 updateGuardWave(e,g,api,dt);
 const dist=Math.hypot(e.x-g.player.x,e.y-g.player.y);
 if(s.wind>0){
  s.wind-=dt;
  if(s.wind<=0){
   s.wind=0;
   if(s.pattern==='nova'){shootSiege(e,g,api);s.pattern='fan'}
   else{shootFan(e,g,api);s.pattern='nova'}
   s.cd=(cfg(e).cd+s.windMax)/BARRAGE_RATE-s.windMax;
  }
 }else{
  s.cd-=dt;
  if(s.cd<=0&&dist<900){
   s.windMax=s.pattern==='nova'?1.17:1.02;
   s.wind=s.windMax;
   s.aimX=g.player.x;s.aimY=g.player.y;
   if(s.pattern==='nova')s.safeAngle=Math.atan2(g.player.y-e.y,g.player.x-e.x);
   api?.sfx?.('shield');
  }
 }
}
function drawGround(ctx,cam,g,q='auto'){
 if(!g?.enemies)return;
 for(const e of g.enemies){
  const s=e.phase3;if(!s||e.hp<=0)continue;
  const x=e.x-cam.x,y=e.y-cam.y;
  if(x<-350||x>1550||y<-350||y>1025)continue;
  ctx.save();
  if(e.shoot>.0&&e.shoot<.48){
   const t=1-e.shoot/.48;
   ctx.globalAlpha=.28+.48*t;ctx.strokeStyle=COLOR;ctx.lineWidth=q==='lite'?2.5:4;
   ctx.beginPath();ctx.arc(x,y,e.r+26,0,TAU);ctx.stroke();
  }
  if(s.wind>0){
   const t=clamp(1-s.wind/s.windMax,0,1);
   if(s.pattern==='nova'){
    const rad=212;
    ctx.globalAlpha=.65+.25*t;ctx.strokeStyle=COLOR;ctx.lineWidth=q==='lite'?2.5:4;
    ctx.setLineDash([12,8]);ctx.beginPath();ctx.arc(x,y,rad,0,TAU);ctx.stroke();ctx.setLineDash([]);
    for(let n=0;n<2;n++){
     const a=s.safeAngle+n*Math.PI;
     ctx.strokeStyle=SAFE;ctx.globalAlpha=.85;ctx.lineWidth=q==='lite'?8:13;
     ctx.beginPath();ctx.arc(x,y,rad,a-.43,a+.43);ctx.stroke();
     ctx.textAlign='center';ctx.font='900 10px ui-monospace,Consolas,monospace';
     ctx.fillStyle=SAFE;ctx.globalAlpha=1;
     ctx.fillText('SAFE',x+Math.cos(a)*rad,y+Math.sin(a)*rad-15);
    }
   }else{
    const a=Math.atan2(s.aimY-e.y,s.aimX-e.x),far=740;
    ctx.lineCap='round';ctx.strokeStyle=COLOR;ctx.globalAlpha=.12+.24*t;ctx.lineWidth=q==='lite'?11:22;
    ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a)*far,y+Math.sin(a)*far);ctx.stroke();
    ctx.strokeStyle='#fff5c8';ctx.globalAlpha=.65+.3*t;ctx.lineWidth=q==='lite'?2:4;
    ctx.setLineDash([16,10]);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a)*far,y+Math.sin(a)*far);ctx.stroke();ctx.setLineDash([]);
   }
   ctx.globalAlpha=.7;ctx.strokeStyle=COLOR;ctx.lineWidth=2.5;
   ctx.beginPath();ctx.arc(x,y,e.r+16,0,TAU*t);ctx.stroke();
  }
  ctx.restore();
 }
}
function drawEnemies(ctx,cam,g,q='auto'){
 if(!g?.enemies)return;
 for(const e of g.enemies){
  const s=e.phase3;if(!s||e.hp<=0)continue;
  const x=e.x-cam.x,y=e.y-cam.y;
  if(x<-130||x>1330||y<-130||y>805)continue;
  ctx.save();ctx.globalAlpha=.65+.16*Math.sin(clock*5);
  ctx.strokeStyle=COLOR;ctx.lineWidth=q==='lite'?2:3;
  for(let i=0;i<4;i++){
   const angle=clock*.65+i*Math.PI/2,r=e.r+19;
   ctx.beginPath();ctx.arc(x,y,r,angle,angle+.54);ctx.stroke();
  }
  // The boss nameplate is already rendered by devora-mutation.js.
  ctx.restore();
 }
}
function drawScreen(ctx,W,H,g,q='auto',arts=null){
 if(!g?.enemies)return;
 let e=null;
 for(const item of g.enemies){
  if(item.phase3?.intro>0&&item.hp>0&&(!e||item.phase3.intro<e.phase3.intro))e=item;
 }
 if(!e)return;
 const seconds=1.38,t=e.phase3.intro,alpha=clamp(Math.min((seconds-t)*7,t*4),0,1);
 if(alpha<=0)return;
 const x=W*.09,y=H*.31,w=W*.75,h=H*.43;
 const center=x+w*.31;
 const art=arts?.[e.kind],final=e.kind==='final';
 ctx.save();ctx.globalAlpha=alpha;
 // Independent cinematic band; avoids the top-left HP/status HUD and the bottom weapons.
 const bg=ctx.createLinearGradient(x,y,x+w,y);
 bg.addColorStop(0,'rgba(25,12,17,.96)');
 bg.addColorStop(.48,'rgba(25,17,24,.93)');
 bg.addColorStop(1,'rgba(10,13,23,.68)');
 ctx.fillStyle=bg;ctx.fillRect(x,y,w,h);
 ctx.strokeStyle=final?'#ffcf7d':'#ffae85';ctx.lineWidth=3;ctx.strokeRect(x+2,y+2,w-4,h-4);
 // Approved boss portrait: a distinct transformed, scale-shifted third-form cut-in.
 if(art?.complete&&art.naturalWidth>0){
  const boxW=w*.36,boxH=h*.91;
  const scale=Math.min(boxW/art.naturalWidth,boxH/art.naturalHeight);
  const iw=art.naturalWidth*scale,ih=art.naturalHeight*scale;
  ctx.save();ctx.translate(center,y+h*.55);
  ctx.rotate(Math.sin((seconds-t)*8)*.045);
  ctx.shadowColor='#ffb66c';ctx.shadowBlur=q==='lite'?0:23;
  ctx.drawImage(art,-iw*.5,-ih*.53,iw,ih);ctx.restore();
 }else{
  ctx.save();ctx.translate(center,y+h*.54);
  ctx.strokeStyle='#ffce84';ctx.lineWidth=4;
  for(let i=0;i<8;i++){
   const a=i*TAU/8;
   ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*90,Math.sin(a)*90);ctx.stroke();
  }
  ctx.restore();
 }
 // Corruption/split signal and warning scratches, heavier for the final boss.
 const progress=1-t/seconds;
 ctx.save();ctx.globalAlpha=.45*alpha;ctx.strokeStyle='#ffd2a1';
 ctx.lineWidth=q==='lite'?1.5:2.8;ctx.beginPath();
 for(let i=0;i<5;i++){
  const fx=x+25+i*w*.17,fy=y+10+Math.sin(i*2.8+progress*9)*9;
  ctx.moveTo(fx,fy);ctx.lineTo(fx+36,fy+31);ctx.lineTo(fx+13,fy+48);
 }
 ctx.stroke();ctx.restore();
 const labelX=x+w*.43;
 ctx.textAlign='left';ctx.fillStyle='#ffd49a';ctx.font='900 13px ui-monospace,Consolas,monospace';
 ctx.fillText(final?'NULL EMPEROR // THIRD FORM':'DEVORA // THIRD FORM',labelX,y+h*.25,w*.53);
 ctx.fillStyle='#fff1dc';ctx.font='900 34px ui-monospace,Consolas,monospace';
 ctx.fillText('PHASE III',labelX,y+h*.52,w*.53);
 ctx.fillStyle='#ffc272';ctx.font='900 22px ui-monospace,Consolas,monospace';
 ctx.fillText('LIMIT BREAK',labelX,y+h*.69,w*.53);
 ctx.fillStyle='#f2c9aa';ctx.font='800 14px Yu Gothic,Meiryo,system-ui,sans-serif';
 ctx.fillText(final?'終末信号 / 第三形態':'侵食臨界 / 第三形態',labelX,y+h*.85,w*.53);
 ctx.strokeStyle='#ffb970';ctx.lineWidth=3;ctx.beginPath();
 ctx.moveTo(labelX,y+h*.91);ctx.lineTo(x+w-22,y+h*.91);ctx.stroke();
 ctx.restore();
}

function tick(dt){clock+=Math.max(0,dt)}
window.RUU_PHASE3={VERSION:'1.22.1',reset,tick,start,step,drawGround,drawEnemies,drawScreen};
})();
