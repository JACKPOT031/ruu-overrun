/* RUU//OVERRUN v1.17.0 — DEVORA PHASE III / NULL REBELLION
   Both bosses enter a third form when remaining HP <= 30%.
   All new lethal attacks are projectile-based and preceded by visible warnings.
   No invincibility, free healing or unavoidable instant damage.
*/
(()=>{
'use strict';
const TAU=Math.PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
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
 e.speed*=1.10;e.dmg=Math.ceil(e.dmg*1.1);e.shoot=Math.max(e.shoot,1);
 const s=e.phase3={cd:1.45,wind:0,windMax:1.16,pattern:'nova',safeAngle:0,aimX:0,aimY:0,intro:2.15,shots:0};
 if(g.enemies.length<120&&api?.spawn){
  const n=g.enemies.length<108?2:1;
  for(let i=0;i<n;i++){
   const angle=i*TAU/n+Math.PI*.28,kind=e.kind==='final'?'hex':'runner';
   const guard=api.spawn(kind,e.x+Math.cos(angle)*155,e.y+Math.sin(angle)*155,1.12);
   if(!guard)continue;
   guard.maxHp*=1.18;guard.hp=guard.maxHp;
   guard.col=e.kind==='final'?'#dca9ff':'#ffaf84';guard.phase3Guard=true;
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
function step(e,dt,g,api,q='auto'){
 if(!isBoss(e)||e.hp<=0||!g?.player)return;
 if(!e.phase3)start(e,g,api,q);
 const s=e.phase3;if(!s)return;
 s.intro=Math.max(0,s.intro-dt);
 const dist=Math.hypot(e.x-g.player.x,e.y-g.player.y);
 if(s.wind>0){
  s.wind-=dt;
  if(s.wind<=0){
   s.wind=0;
   if(s.pattern==='nova'){shootSiege(e,g,api);s.pattern='fan'}
   else{shootFan(e,g,api);s.pattern='nova'}
   s.cd=cfg(e).cd;
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
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='900 11px ui-monospace,Consolas,monospace';
  ctx.fillStyle='#11131cdd';ctx.fillRect(x-47,y-e.r-59,94,20);
  ctx.strokeStyle=COLOR;ctx.strokeRect(x-47,y-e.r-59,94,20);
  ctx.globalAlpha=1;ctx.fillStyle=COLOR;ctx.fillText('PHASE III',x,y-e.r-49);
  ctx.restore();
 }
}
function drawScreen(ctx,W,H,g){
 if(!g?.enemies)return;
 let candidate=null;
 for(const e of g.enemies)if(e.phase3?.intro>0&&e.hp>0&&(!candidate||candidate.phase3.intro<e.phase3.intro))candidate=e;
 if(!candidate)return;
 const t=candidate.phase3.intro,alpha=clamp(Math.min((2.15-t)*3.8,t*2.8),0,1);
 if(alpha<=0)return;
 ctx.save();ctx.globalAlpha=alpha;
 ctx.fillStyle='#0b0d1ecb';ctx.fillRect(W*.21,H*.57,W*.58,H*.14);
 ctx.strokeStyle=COLOR;ctx.lineWidth=2;ctx.strokeRect(W*.21,H*.57,W*.58,H*.14);
 ctx.textAlign='center';ctx.font='900 26px ui-monospace,Consolas,monospace';
 ctx.fillStyle='#ffdb8e';ctx.fillText('PHASE III // LIMIT BREAK',W/2,H*.63);
 ctx.font='800 13px ui-monospace,Consolas,monospace';ctx.fillStyle='#fff3db';
 ctx.fillText(candidate.kind==='final'?'NULL EMPEROR // NO SAFE END':'DEVORA // MUTATED CORE',W/2,H*.675);
 ctx.restore();
}
function tick(dt){clock+=Math.max(0,dt)}
window.RUU_PHASE3={VERSION:'1.17.0',reset,tick,start,step,drawGround,drawEnemies,drawScreen};
})();
