/* RUU//OVERRUN v1.20.0 — ECLIPSE // SECRET RUU
   Defeat all 3 or 5 DEVORA while having at least 50% of maximum HP
   to unlock one optional, challenging boss duel. Full gameplay logic
   and artwork remain separate from the main battle engine.
*/
(()=>{
'use strict';
const TAU=Math.PI*2, clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const ART=new Image();ART.decoding='async';ART.src='assets/secret_ruu.webp';
const INITIAL=()=>({triggered:false,active:false,finished:false,intro:0,introMax:3.1,clock:0,
  boss:null,qualifiedHp:0,wind:0,windMax:0,cooldown:2.0,pattern:0,targetX:0,targetY:0,aim:0,
  dash:0,enraged:false,phasePulse:0,finishPulse:0,emitted:0});
let S=INITIAL();
function reset(){S=INITIAL()}
function isActive(){return S.active}
function isIntro(){return S.active&&S.intro>0}
function isBoss(e){return !!e?.secretRuu}
function status(){
 const e=S.boss;
 return {triggered:S.triggered,active:S.active,finished:S.finished,
   intro:S.intro,enraged:S.enraged,hp:S.active?Math.max(0,e?.hp||0):0,
   maxHp:e?.maxHp||1,qualifiedHp:S.qualifiedHp,emitted:S.emitted};
}
function reveal(g,api){
 if(!g?.player||!g.trueEndCleared||S.triggered||S.active||g.mode==='endless')return false;
 const p=g.player,ratio=p.hp/Math.max(1,p.maxHp);
 // Shield is not counted: the player must actually have >=50% HP remaining.
 if(p.hp<=0||ratio+1e-9<.50)return false;
 const a=-Math.PI/3,dist=405;
 const e=api?.spawn?.('secret_ruu',p.x+Math.cos(a)*dist,p.y+Math.sin(a)*dist,1);
 if(!e)return false;
 S=INITIAL();S.triggered=true;S.active=true;S.boss=e;S.qualifiedHp=ratio;
 S.intro=S.introMax;S.cooldown=1.65;
 e.secretRuu=true;e.secretPhase=1;e.maxHp=Math.ceil(2350+(Number(g.level)||1)*33);e.hp=e.maxHp;
 e.r=34;e.speed=0;e.dmg=17;e.shoot=9999;e.attack=S.introMax+.6;
 e.xp=200;e.col='#d4baae';e.pushX=0;e.pushY=0;
 g.secretBossPending=true;g.secretBossCleared=false;
 // Only the secret boss remains. Keep the already earned gems and player upgrades.
 g.enemies=[e];g.ebullets.length=0;
 p.inv=Math.max(p.inv||0,S.introMax+.4);
 g.shake=Math.max(g.shake||0,25);g.flash=Math.max(g.flash||0,.45);
 g.scenePulse=Math.max(g.scenePulse||0,1.4);
 api?.wave?.(p.x,p.y,360,'#d2b7a8');api?.burst?.(e.x,e.y,'#ffddd5',32,180);
 api?.sound?.('bossBreak');api?.toast?.('SECRET BOSS // RUU : ECLIPSE',true);
 return true;
}
function onKill(e,g,api){
 if(!isBoss(e)||e.secretDeathCounted||!S.active)return false;
 e.secretDeathCounted=true;S.active=false;S.finished=true;S.intro=0;S.finishPulse=1.7;
 if(g){g.secretBossPending=false;g.secretBossCleared=true;g.score+=8500;
   g.scenePulse=Math.max(g.scenePulse||0,1.4);g.shake=Math.max(g.shake||0,24)}
 api?.wave?.(e.x,e.y,390,'#ffd4c2');api?.burst?.(e.x,e.y,'#d7b2ff',54,250);
 api?.sound?.('victory');api?.toast?.('ECLIPSE DEFEATED // SECRET END UNLOCKED',true);
 return true;
}
function tick(dt,g){
 if(dt<=0)return;
 S.finishPulse=Math.max(0,S.finishPulse-dt);
 if(!S.active)return;
 S.clock+=dt;S.intro=Math.max(0,S.intro-dt);
 S.phasePulse=Math.max(0,S.phasePulse-dt);
 if(S.boss?.hp<=0)return;
 if(S.intro>0){S.boss.speed=0;S.boss.attack=Math.max(S.boss.attack||0,.25)}
}
function shoot(g,e,ang,speed,damage,col,r=7){
 if(!g.ebullets||g.ebullets.length>=128)return false;
 g.ebullets.push({x:e.x+Math.cos(ang)*e.r*.6,y:e.y+Math.sin(ang)*e.r*.6,
   vx:Math.cos(ang)*speed,vy:Math.sin(ang)*speed,r,ttl:4.8,col,damage,secretRuu:true});
 S.emitted++;return true;
}
function release(e,g,api){
 const p=g.player,rapid=S.enraged,aim=S.aim,col=rapid?'#ff7a9f':'#d6adff';
 if(S.pattern===0){
  // Aimed blade fan. The direction is locked before the visible windup.
  const n=rapid?11:7,spread=rapid?1.08:.96;
  for(let i=0;i<n;i++)shoot(g,e,aim+(i-(n-1)/2)*spread/(n-1),rapid?305:265,rapid?13:11,col,7);
 }else if(S.pattern===1){
  // Expanding ring; two opposed safe corridors are always left open.
  const n=rapid?22:18,offset=S.clock*.22;
  for(let i=0;i<n;i++){
   const a=i*TAU/n+offset;
   const diff=Math.abs(Math.atan2(Math.sin(a-aim),Math.cos(a-aim)));
   if(diff<.35||Math.abs(diff-Math.PI)<.35)continue;
   shoot(g,e,a,rapid?228:193,rapid?12:10,col,7);
  }
 }else{
  // Telegraph-guided claw rush. A short fan follows the dash.
  S.dash=rapid?.82:.57;
  for(const delta of (rapid?[-.30,-.16,0,.16,.30]:[-.22,0,.22])){
   shoot(g,e,aim+delta,rapid?290:248,rapid?13:11,'#ffc69d',7);
  }
 }
 api?.wave?.(e.x,e.y,115,col);api?.burst?.(e.x,e.y,col,rapid?14:9,160);
 api?.sfx?.(S.pattern===2?'rail':'boss');S.pattern=(S.pattern+1)%3;
 S.cooldown=rapid?1.82:2.28;
}
function step(e,dt,g,api,q='auto'){
 if(!isBoss(e)||!S.active||S.boss!==e||e.hp<=0||!g?.player)return;
 if(S.intro>0){e.speed=0;e.attack=Math.max(e.attack||0,.22);return}
 if(!S.enraged&&e.hp<=e.maxHp*.48){
  S.enraged=true;S.phasePulse=2.3;S.cooldown=Math.max(S.cooldown,1.15);
  e.secretPhase=2;e.dmg=21;e.col='#ff859f';
  g.scenePulse=Math.max(g.scenePulse||0,1.05);
  api?.wave?.(e.x,e.y,285,'#ff769c');api?.burst?.(e.x,e.y,'#ffc6dc',25,200);
  api?.toast?.('RUU : ECLIPSE // PHASE II',true);api?.sfx?.('bossBreak');
 }
 e.speed=S.dash>0?(S.enraged?310:265):S.wind>0?36:(S.enraged?109:90);
 if(S.dash>0){S.dash=Math.max(0,S.dash-dt);e.attack=Math.max(e.attack||0,.18)}
 if(S.wind>0){S.wind=Math.max(0,S.wind-dt);
  if(S.wind<=0){S.wind=0;release(e,g,api)}return}
 S.cooldown-=dt;
 if(S.cooldown<=0&&Math.hypot(g.player.x-e.x,g.player.y-e.y)<850){
  S.targetX=g.player.x;S.targetY=g.player.y;
  S.aim=Math.atan2(S.targetY-e.y,S.targetX-e.x);
  S.windMax=S.enraged?.68:.90;S.wind=S.windMax;
  api?.sfx?.('shield');
 }
}
function drawGround(ctx,cam,g){
 if(!S.active||!S.boss||S.boss.hp<=0)return;
 const e=S.boss,x=e.x-cam.x,y=e.y-cam.y;
 if(x<-220||x>1420||y<-220||y>895)return;
 ctx.save();ctx.globalAlpha=.25+.10*Math.sin(S.clock*3);
 ctx.strokeStyle=S.enraged?'#ff728e':'#d1b7ee';ctx.lineWidth=3;
 ctx.beginPath();ctx.ellipse(x,y+63,86,21,0,0,TAU);ctx.stroke();ctx.restore();
}
function drawCharacter(ctx,e,cam,q='auto'){
 const x=e.x-cam.x,y=e.y-cam.y;
 if(x<-220||x>1420||y<-230||y>910)return;
 const height=223,bob=Math.sin(S.clock*2.6)*3,rad=S.enraged?'#ff6b9c':'#d5b7e9';
 ctx.save();ctx.translate(x,y+bob);
 ctx.fillStyle='#04040aa8';ctx.beginPath();ctx.ellipse(0,89,64,12,0,0,TAU);ctx.fill();
 ctx.strokeStyle=rad;ctx.globalAlpha=.53;ctx.lineWidth=2;
 ctx.beginPath();ctx.arc(0,-10,81,S.clock*.43,S.clock*.43+Math.PI*1.58);ctx.stroke();
 ctx.globalAlpha=1;
 if(ART.complete&&ART.naturalWidth>0&&ART.naturalHeight>0){
  const width=height*ART.naturalWidth/ART.naturalHeight;
  if(q==='high'){ctx.shadowColor=rad;ctx.shadowBlur=13}
  if(e.flash>0)ctx.filter='brightness(1.7)';
  ctx.drawImage(ART,-width*.5,-height*.62,width,height);
 }else{
  ctx.fillStyle='#2b2534';ctx.beginPath();ctx.ellipse(0,-10,48,90,0,0,TAU);ctx.fill();
 }
 ctx.restore();
 if(S.wind>0){
  const t=clamp(1-S.wind/S.windMax,0,1);
  ctx.save();ctx.lineWidth=2;ctx.strokeStyle='#ffdac4';ctx.globalAlpha=.5+.4*t;
  ctx.setLineDash([9,7]);ctx.beginPath();ctx.moveTo(x,y-33);
  ctx.lineTo(x+Math.cos(S.aim)*610,y-33+Math.sin(S.aim)*610);ctx.stroke();ctx.restore();
 }
}
function drawScreen(ctx,W,H,g,q='auto'){
 if(!S.active||S.intro<=0)return;
 const a=clamp(Math.min((S.introMax-S.intro)*5,S.intro*3),0,1);
 if(a<=0)return;
 ctx.save();ctx.globalAlpha=a;
 ctx.fillStyle='#08060fef';ctx.fillRect(0,H*.09,W,H*.82);
 const rg=ctx.createRadialGradient(W*.74,H*.48,35,W*.74,H*.48,W*.53);
 rg.addColorStop(0,'#8c63883a');rg.addColorStop(1,'#05030d00');
 ctx.fillStyle=rg;ctx.fillRect(0,H*.08,W,H*.84);
 // Contain only: never stretch the reference character's proportions.
 if(ART.complete&&ART.naturalWidth>0&&ART.naturalHeight>0){
  const ih=H*.73,iw=ih*ART.naturalWidth/ART.naturalHeight;
  ctx.drawImage(ART,W*.745-iw*.5,H*.135,iw,ih);
 }
 ctx.fillStyle='#d9bfaf';ctx.fillRect(W*.075,H*.21,6,H*.52);
 ctx.textAlign='left';ctx.fillStyle='#e5c7f8';ctx.font='900 19px ui-monospace,Consolas,monospace';
 ctx.fillText('HIDDEN SIGNAL // HP ≥ 50%',W*.105,H*.34);
 ctx.fillStyle='#fff5ea';ctx.font='italic 900 54px Impact,Arial,sans-serif';
 ctx.fillText('RUU : ECLIPSE',W*.105,H*.475,W*.6);
 ctx.font='900 23px Yu Gothic,Meiryo,sans-serif';ctx.fillText('裏ボス / もう一人のルー',W*.105,H*.565);
 ctx.fillStyle='#f0b0c2';ctx.font='800 13px ui-monospace,monospace';
 ctx.fillText('THE FINAL BATTLE WAS NOT THE END',W*.105,H*.64);
 ctx.strokeStyle='#bfa6d2';ctx.lineWidth=2;ctx.strokeRect(W*.065,H*.16,W*.87,H*.65);
 ctx.restore();
}
window.RUU_SECRET_BOSS={VERSION:'1.20.0',ART,reset,reveal,tick,step,onKill,status,isActive,isIntro,isBoss,
 drawGround,drawCharacter,drawScreen};
})();