/* RUU//OVERRUN v1.21.0 — ECLIPSE OVERDRIVE
   HP-gated secret Ruu, 4x4 animated atlas, multi-stage telegraphed boss.
   No additional ambient enemies; all encounter bullets obey a shared cap.
*/
(()=>{
'use strict';
const TAU=Math.PI*2;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const ART=new Image();ART.decoding='async';ART.src='assets/secret_ruu.webp';
const ATLAS=new Image();ATLAS.decoding='async';ATLAS.src='assets/secret_ruu_animation_atlas.webp';
const ATLAS_CELL=320,ATLAS_COLS=4,PROJECTILE_CAP=136;
const INITIAL=()=>({
 triggered:false,active:false,finished:false,intro:0,introMax:3.1,clock:0,
 boss:null,qualifiedHp:0,wind:0,windMax:0,cooldown:1.8,pattern:0,targetX:0,targetY:0,aim:0,
 dash:0,dashPause:0,dashLeft:0,dashDirX:0,dashDirY:0,dashTrail:[],
 enraged:false,frenzy:false,phasePulse:0,frenzyPulse:0,finishPulse:0,emitted:0,
 events:[],hazards:[],crossWarning:null,slashFlash:0,slashAim:0,
 anim:'idle',animTimer:0,facing:1,releaseFlash:0
});
let S=INITIAL();
function reset(){S=INITIAL()}
function isActive(){return S.active}
function isIntro(){return S.active&&S.intro>0}
function isBoss(e){return !!e?.secretRuu}
function status(){const e=S.boss;return {
 triggered:S.triggered,active:S.active,finished:S.finished,intro:S.intro,
 enraged:S.enraged,frenzy:S.frenzy,pattern:S.pattern,
 hp:S.active?Math.max(0,e?.hp||0):0,maxHp:e?.maxHp||1,
 qualifiedHp:S.qualifiedHp,emitted:S.emitted,animation:S.anim,projectilesCap:PROJECTILE_CAP
}}
function reveal(g,api){
 if(!g?.player||!g.trueEndCleared||S.triggered||S.active||g.mode==='endless')return false;
 const p=g.player,ratio=p.hp/Math.max(1,p.maxHp);
 if(p.hp<=0||ratio+1e-9<.5)return false;
 const a=-Math.PI/3,dist=405;
 const e=api?.spawn?.('secret_ruu',p.x+Math.cos(a)*dist,p.y+Math.sin(a)*dist,1);
 if(!e)return false;
 S=INITIAL();S.triggered=true;S.active=true;S.boss=e;S.qualifiedHp=ratio;
 S.intro=S.introMax;S.cooldown=1.35;
 e.secretRuu=true;e.secretPhase=1;e.maxHp=Math.ceil(2350+(Number(g.level)||1)*33);e.hp=e.maxHp;
 e.r=34;e.speed=0;e.dmg=17;e.shoot=9999;e.attack=S.introMax+.4;
 e.xp=200;e.col='#d4baae';e.pushX=0;e.pushY=0;
 g.secretBossPending=true;g.secretBossCleared=false;
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
 S.events.length=0;S.hazards.length=0;S.dashLeft=0;
 if(g){g.secretBossPending=false;g.secretBossCleared=true;g.score+=8500;
  g.scenePulse=Math.max(g.scenePulse||0,1.4);g.shake=Math.max(g.shake||0,24)}
 api?.wave?.(e.x,e.y,390,'#ffd4c2');api?.burst?.(e.x,e.y,'#d7b2ff',54,250);
 api?.sound?.('victory');api?.toast?.('ECLIPSE DEFEATED // SECRET END UNLOCKED',true);
 return true;
}
function tick(dt){
 if(dt<=0)return;
 S.finishPulse=Math.max(0,S.finishPulse-dt);
 if(!S.active)return;
 S.clock+=dt;S.intro=Math.max(0,S.intro-dt);
 S.phasePulse=Math.max(0,S.phasePulse-dt);
 S.frenzyPulse=Math.max(0,S.frenzyPulse-dt);
 S.slashFlash=Math.max(0,S.slashFlash-dt);
 S.releaseFlash=Math.max(0,S.releaseFlash-dt);
 for(let i=S.dashTrail.length-1;i>=0;i--){const t=S.dashTrail[i];t.life-=dt;if(t.life<=0)S.dashTrail.splice(i,1)}
 if(S.boss?.hp<=0)return;
 if(S.intro>0){S.boss.speed=0;S.boss.attack=Math.max(S.boss.attack||0,.25)}
}
function bullet(g,x,y,a,speed,damage,col,r=7,ttl=4.6){
 if(!g.ebullets||g.ebullets.length>=PROJECTILE_CAP)return false;
 g.ebullets.push({x,y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,r,ttl,col,damage,secretRuu:true});
 S.emitted++;return true;
}
function shoot(g,e,a,speed,damage,col,r=7){
 return bullet(g,e.x+Math.cos(a)*e.r*.75,e.y+Math.sin(a)*e.r*.75,a,speed,damage,col,r);
}
function queue(type,time,data={}){S.events.push({type,time,...data})}
function fan(e,g,a,angleShift=0,wide=false){
 const hot=S.enraged,n=hot?(wide?11:9):(wide?9:7),spread=hot?1.10:.96;
 for(let i=0;i<n;i++)shoot(g,e,a+angleShift+(i-(n-1)/2)*spread/(n-1),hot?302:268,hot?13:11,hot?'#ff7fa5':'#cfa7fa',7);
}
function ring(e,g,safeAngle,rotation=0){
 const hot=S.enraged,n=hot?24:19,speed=hot?236:205;
 for(let i=0;i<n;i++){
  const a=i*TAU/n+rotation;
  const diff=Math.abs(Math.atan2(Math.sin(a-safeAngle),Math.cos(a-safeAngle)));
  if(diff<.36||Math.abs(diff-Math.PI)<.36)continue;
  shoot(g,e,a,speed,hot?12:10,hot?'#f88ab4':'#c5b1ff',7);
 }
}
function startDash(e,g,api){
 const p=g.player,a=Math.atan2(p.y-e.y,p.x-e.x),hot=S.enraged;
 S.dashDirX=Math.cos(a);S.dashDirY=Math.sin(a);
 S.dash=hot?.34:.30;S.dashPause=0;
 S.facing=p.x<e.x?-1:1;e.attack=0;
 api?.wave?.(e.x,e.y,88,'#ffb2ca');api?.sfx?.('rail');
}
function rushShards(e,g){
 const a=Math.atan2(S.dashDirY,S.dashDirX),hot=S.enraged;
 for(const d of [-.58,0,.58])shoot(g,e,a+d,hot?264:222,hot?11:9,'#ffd1a9',6);
}
function crossCage(e,g,centerX,centerY){
 const p=g.player,hot=S.enraged,cx=centerX??p.x,cy=centerY??p.y;
 const speed=hot?270:230,damage=hot?12:10;
 // Each of four directions leaves a central opening; never fill the entire frame.
 for(let i=0;i<9;i++){
  if(i===4)continue;
  const off=(i-4)*48;
  bullet(g,cx-460,cy+off,0,speed,damage,'#d7a4fc',7,3.7);
  bullet(g,cx+460,cy+off,Math.PI,speed,damage,'#d7a4fc',7,3.7);
 }
 for(let i=0;i<7;i++){
  if(i===3)continue;
  const off=(i-3)*63;
  bullet(g,cx+off,cy-350,Math.PI/2,speed,damage,'#ff9fc1',7,3.7);
  bullet(g,cx+off,cy+350,-Math.PI/2,speed,damage,'#ff9fc1',7,3.7);
 }
}
function slash(e,g,ang,shift){
 const hot=S.enraged;
 for(const d of [-.085,0,.085])shoot(g,e,ang+shift+d,hot?450:398,hot?14:12,'#ffedcc',8);
 S.slashFlash=.30;S.slashAim=ang+shift;
}
function explodeHazard(h,g,api){
 const p=g.player,distance=Math.hypot(p.x-h.x,p.y-h.y);
 if(distance<h.r+(p.r||20)*.25)api?.hurt?.(S.enraged?17:13,h.x,h.y);
 const shots=S.enraged?14:11;
 for(let j=0;j<shots;j++){
  const a=j*TAU/shots+S.clock*.11;
  bullet(g,h.x,h.y,a,S.enraged?255:214,S.enraged?11:9,'#fda8d6',6,3.6);
 }
 api?.wave?.(h.x,h.y,h.r*1.4,'#f49bc6');api?.burst?.(h.x,h.y,'#f6adce',12,140);
}
function updateScheduled(e,dt,g,api){
 for(let i=S.events.length-1;i>=0;i--){
  const v=S.events[i];v.time-=dt;if(v.time>0)continue;S.events.splice(i,1);
  if(v.type==='fan')fan(e,g,v.aim,v.shift||0,true);
  else if(v.type==='ring')ring(e,g,v.safe,v.rotation||0);
  else if(v.type==='slash')slash(e,g,v.aim,v.shift||0);
  else if(v.type==='cross'){crossCage(e,g,v.x,v.y);S.crossWarning=null}
  else if(v.type==='sigil'){
   S.hazards.push({x:v.x,y:v.y,r:v.r||90,time:v.delay||.9,max:v.delay||.9});
  }
 }
 for(let i=S.hazards.length-1;i>=0;i--){
  const z=S.hazards[i];z.time-=dt;
  if(z.time<=0){S.hazards.splice(i,1);explodeHazard(z,g,api)}
 }
}
function release(e,g,api){
 const a=S.aim,hot=S.enraged,base=S.pattern;
 S.releaseFlash=.28;
 if(base===0){
  fan(e,g,a,-.10,false);queue('fan',hot?.16:.23,{aim:a,shift:.11});
 }else if(base===1){
  ring(e,g,a,S.clock*.18);queue('ring',hot?.28:.35,{safe:a+.13,rotation:S.clock*.18+.16});
 }else if(base===2){
  // Three short, individually telegraphed rushes, no teleporting.
  S.dashLeft=3;S.dashPause=.23;S.dash=0;
 }else if(base===3){
  slash(e,g,a,-.16);queue('slash',.16,{aim:a,shift:.16});
  if(hot)queue('slash',.32,{aim:a,shift:0});
 }else if(base===4){
  S.crossWarning={x:S.targetX,y:S.targetY,time:.46,max:.46};
  queue('cross',.46,{x:S.targetX,y:S.targetY});
 }else{
  queue('sigil',.01,{x:S.targetX,y:S.targetY,r:hot?105:94,delay:.86});
  if(hot)queue('sigil',.28,{x:S.targetX+105,y:S.targetY-78,r:85,delay:1.0});
 }
 api?.wave?.(e.x,e.y,125,hot?'#ff709c':'#d3aaff');
 api?.burst?.(e.x,e.y,hot?'#ffa8c6':'#c6adff',hot?17:12,180);
 api?.sfx?.(base===2||base===3?'rail':'boss');
 S.pattern=(S.pattern+1)%6;
 S.cooldown=S.frenzy?1.04:hot?1.56:2.0;
}
function setAnim(mode,dt){
 if(S.anim!==mode){S.anim=mode;S.animTimer=0}else S.animTimer+=dt;
}
function step(e,dt,g,api,q='auto'){
 if(!isBoss(e)||!S.active||S.boss!==e||e.hp<=0||!g?.player)return;
 if(S.intro>0){e.speed=0;setAnim('idle',dt);e.attack=Math.max(e.attack||0,.22);return}
 if(!S.enraged&&e.hp<=e.maxHp*.48){
  S.enraged=true;S.phasePulse=2.4;S.cooldown=Math.max(S.cooldown,.9);
  e.secretPhase=2;e.dmg=21;e.col='#ff859f';g.scenePulse=Math.max(g.scenePulse||0,1.05);
  api?.wave?.(e.x,e.y,285,'#ff769c');api?.burst?.(e.x,e.y,'#ffc6dc',28,200);
  api?.toast?.('RUU : ECLIPSE // PHASE II',true);api?.sfx?.('bossBreak');
 }
 if(!S.frenzy&&e.hp<=e.maxHp*.20){
  S.frenzy=true;S.frenzyPulse=3.0;S.cooldown=Math.min(S.cooldown,.7);
  api?.wave?.(e.x,e.y,350,'#ff456e');api?.burst?.(e.x,e.y,'#fff2dc',34,230);
  api?.toast?.('ECLIPSE // LAST LIGHT / FINAL RUSH',true);api?.sfx?.('bossBreak');
 }
 S.facing=g.player.x<e.x?-1:1;
 // Block excessive knockback; keep the secret boss in the arena without teleporting.
 e.pushX*=.16;e.pushY*=.16;
 updateScheduled(e,dt,g,api);
 if(S.dash>0){
  const speed=S.frenzy?475:S.enraged?420:350;
  e.x+=S.dashDirX*speed*dt;e.y+=S.dashDirY*speed*dt;e.speed=0;
  S.dash=Math.max(0,S.dash-dt);
  if(S.dashTrail.length<12)S.dashTrail.push({x:e.x,y:e.y,life:.23});
  if(S.dash<=0){rushShards(e,g);S.dashLeft--;S.dashPause=S.dashLeft>0?.26:0}
  setAnim('run',dt);return;
 }
 if(S.dashPause>0){
  S.dashPause-=dt;e.speed=0;
  if(S.dashPause<=0&&S.dashLeft>0)startDash(e,g,api);
  setAnim(S.dash>0?'run':'attack',dt);return;
 }
 if(S.wind>0){
  e.speed=20;S.wind=Math.max(0,S.wind-dt);
  if(S.wind<=0){S.wind=0;release(e,g,api)}
  setAnim('attack',dt);return;
 }
 const p=g.player,dist=Math.hypot(p.x-e.x,p.y-e.y);
 e.speed=dist<95?0:S.frenzy?151:S.enraged?117:96;
 setAnim(S.releaseFlash>0?'attack':e.speed===0?'idle':e.speed>125?'run':'walk',dt);
 S.cooldown-=dt;
 if(S.cooldown<=0&&dist<900){
  S.targetX=p.x;S.targetY=p.y;
  S.aim=Math.atan2(S.targetY-e.y,S.targetX-e.x);
  S.windMax=S.frenzy?.48:S.enraged?.66:.86;S.wind=S.windMax;
  api?.sfx?.('shield');
 }
}
function drawGround(ctx,cam,g,q='auto'){
 if(!S.active||!S.boss||S.boss.hp<=0)return;
 const e=S.boss,x=e.x-cam.x,y=e.y-cam.y;
 ctx.save();ctx.globalAlpha=.22+.13*Math.sin(S.clock*3);
 ctx.strokeStyle=S.frenzy?'#ff4a77':S.enraged?'#ff728e':'#d1b7ee';ctx.lineWidth=q==='lite'?2:3;
 ctx.beginPath();ctx.ellipse(x,y+63,86,21,0,0,TAU);ctx.stroke();
 if(q!=='lite'){
  ctx.strokeStyle=S.frenzy?'#ff597c':'#bc9ee8';ctx.globalAlpha=.16;ctx.lineWidth=1.5;
  for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(x,y,95+i*20,(S.clock*.7+i*1.6)%TAU,(S.clock*.7+i*1.6)%TAU+2.1);ctx.stroke()}
 }
 for(const h of S.hazards){
  const hx=h.x-cam.x,hy=h.y-cam.y,t=clamp(1-h.time/h.max,0,1);
  ctx.globalAlpha=.22+.40*t;ctx.strokeStyle='#ff84b8';ctx.lineWidth=3;
  ctx.fillStyle='#9f20522b';ctx.beginPath();ctx.arc(hx,hy,h.r,0,TAU);ctx.fill();ctx.stroke();
  ctx.lineWidth=1.8;ctx.strokeStyle='#fff0f5';ctx.beginPath();ctx.arc(hx,hy,h.r*(.24+.76*t),0,TAU);ctx.stroke();
 }
 if(S.crossWarning){
  const v=S.crossWarning,cx=v.x-cam.x,cy=v.y-cam.y;
  ctx.globalAlpha=.43;ctx.strokeStyle='#fdb1dc';ctx.setLineDash([15,11]);ctx.lineWidth=3;
  for(const off of [-184,184]){ctx.beginPath();ctx.moveTo(cx-460,cy+off);ctx.lineTo(cx+460,cy+off);ctx.stroke();
   ctx.beginPath();ctx.moveTo(cx+off,cy-350);ctx.lineTo(cx+off,cy+350);ctx.stroke()}
  ctx.setLineDash([]);
 }
 ctx.restore();
}
function drawSprite(ctx,mode,frame,x,y,size,opacity=1,flip=false,filter='none'){
 const row=mode==='attack'?3:mode==='run'?2:mode==='walk'?1:0;
 ctx.save();ctx.translate(x,y);if(flip)ctx.scale(-1,1);
 ctx.globalAlpha=opacity;if(filter!=='none')ctx.filter=filter;
 ctx.drawImage(ATLAS,frame*ATLAS_CELL,row*ATLAS_CELL,ATLAS_CELL,ATLAS_CELL,-size*.5,-size*.65,size,size);
 ctx.restore();
}
function drawCharacter(ctx,e,cam,q='auto'){
 const x=e.x-cam.x,y=e.y-cam.y;
 if(x<-260||x>1460||y<-250||y>930)return;
 const bob=Math.sin(S.clock*2.8)*1.7,size=228,rad=S.frenzy?'#ff4f83':S.enraged?'#ff6b9c':'#d5b7e9';
 ctx.save();ctx.fillStyle='#04040aa8';ctx.beginPath();ctx.ellipse(x,y+82,57,12,0,0,TAU);ctx.fill();
 ctx.strokeStyle=rad;ctx.globalAlpha=.55;ctx.lineWidth=2;
 ctx.beginPath();ctx.arc(x,y-10,83,S.clock*.63,S.clock*.63+Math.PI*1.58);ctx.stroke();ctx.restore();
 if(ATLAS.complete&&ATLAS.naturalWidth>=ATLAS_CELL*ATLAS_COLS){
  const mode=S.anim,frame=mode==='attack'&&S.wind>0?
    Math.min(3,Math.floor((1-S.wind/Math.max(.01,S.windMax))*4)):
    mode==='attack'&&S.releaseFlash>0?3:Math.floor(S.animTimer*(mode==='run'?10:mode==='walk'?6:mode==='idle'?3.5:6))%4;
  const mirror=S.facing<0;
  if(q!=='lite'&&S.dashTrail.length){
   for(let i=0;i<S.dashTrail.length;i+=3){const a=S.dashTrail[i],f=clamp(a.life/.23,0,1);
    drawSprite(ctx,'run',frame,a.x-cam.x,a.y-cam.y+bob,size,f*.24,mirror,'brightness(1.4)');}
  }
  if(q==='high'){ctx.save();ctx.shadowColor=rad;ctx.shadowBlur=15;ctx.fillStyle=rad;ctx.globalAlpha=.24;ctx.beginPath();ctx.arc(x,y-20,35,0,TAU);ctx.fill();ctx.restore()}
  drawSprite(ctx,mode,frame,x,y+bob,size,1,mirror,e.flash>0?'brightness(1.85) saturate(.8)':'none');
 }else if(ART.complete&&ART.naturalWidth>0&&ART.naturalHeight>0){
  const height=228,width=height*ART.naturalWidth/ART.naturalHeight;
  ctx.save();ctx.translate(x,y+bob);if(S.facing<0)ctx.scale(-1,1);
  if(e.flash>0)ctx.filter='brightness(1.85)';
  ctx.drawImage(ART,-width*.5,-height*.62,width,height);ctx.restore();
 }else{ctx.save();ctx.fillStyle='#2b2534';ctx.beginPath();ctx.ellipse(x,y-10,48,90,0,0,TAU);ctx.fill();ctx.restore()}
 if(S.wind>0||S.dashPause>0){
  const t=S.wind>0?clamp(1-S.wind/Math.max(.01,S.windMax),0,1):clamp(1-S.dashPause/.26,0,1);
  const a=S.dashPause>0?Math.atan2(S.dashDirY,S.dashDirX)||S.aim:S.aim;
  ctx.save();ctx.lineWidth=S.pattern===3?3:2;ctx.strokeStyle=S.frenzy?'#ff6d91':'#ffdec5';ctx.globalAlpha=.36+.45*t;
  ctx.setLineDash([12,8]);
  for(const offset of S.wind>0&&S.pattern===3?[-.16,0,.16]:[0]){
   ctx.beginPath();ctx.moveTo(x,y-25);ctx.lineTo(x+Math.cos(a+offset)*670,y-25+Math.sin(a+offset)*670);ctx.stroke();
  }ctx.restore();
 }
 if(S.slashFlash>0){
  ctx.save();ctx.globalAlpha=clamp(S.slashFlash/.30,0,1)*.63;ctx.lineWidth=q==='lite'?4:8;
  ctx.strokeStyle='#ffe5f2';ctx.beginPath();ctx.moveTo(x,y-20);
  ctx.lineTo(x+Math.cos(S.slashAim)*510,y-20+Math.sin(S.slashAim)*510);ctx.stroke();ctx.restore();
 }
}
function drawScreen(ctx,W,H,g,q='auto'){
 if(!S.active)return;
 if(S.frenzy&&S.intro<=0){
  ctx.save();ctx.globalAlpha=.10+.045*Math.sin(S.clock*11);ctx.fillStyle='#9c1636';ctx.fillRect(0,0,W,H);
  ctx.globalAlpha=.44;ctx.strokeStyle='#fa507f';ctx.lineWidth=q==='lite'?4:8;ctx.strokeRect(4,4,W-8,H-8);ctx.restore();
 }
 if(S.phasePulse>0||S.frenzyPulse>0){
  const t=Math.max(S.phasePulse/2.4,S.frenzyPulse/3);
  ctx.save();ctx.globalAlpha=clamp(t*.2,0,.26);ctx.fillStyle='#dc3d83';ctx.fillRect(0,0,W,H);ctx.restore();
 }
 if(S.intro<=0)return;
 const a=clamp(Math.min((S.introMax-S.intro)*5,S.intro*3),0,1);
 if(a<=0)return;
 ctx.save();ctx.globalAlpha=a;ctx.fillStyle='#08060fef';ctx.fillRect(0,H*.09,W,H*.82);
 const rg=ctx.createRadialGradient(W*.74,H*.48,35,W*.74,H*.48,W*.53);
 rg.addColorStop(0,'#8c63883a');rg.addColorStop(1,'#05030d00');ctx.fillStyle=rg;ctx.fillRect(0,H*.08,W,H*.84);
 if(ART.complete&&ART.naturalWidth>0&&ART.naturalHeight>0){
  const ih=H*.73,iw=ih*ART.naturalWidth/ART.naturalHeight;
  ctx.drawImage(ART,W*.745-iw*.5,H*.135,iw,ih);
 }
 ctx.fillStyle='#d9bfaf';ctx.fillRect(W*.075,H*.21,6,H*.52);
 ctx.textAlign='left';ctx.fillStyle='#e5c7f8';ctx.font='900 19px ui-monospace,Consolas,monospace';
 ctx.fillText('HIDDEN SIGNAL // HP ≥ 50%',W*.105,H*.34);
 ctx.fillStyle='#fff5ea';ctx.font='italic 900 54px Impact,Arial,sans-serif';ctx.fillText('RUU : ECLIPSE',W*.105,H*.475,W*.6);
 ctx.font='900 23px Yu Gothic,Meiryo,sans-serif';ctx.fillText('裏ボス / もう一人のルー',W*.105,H*.565);
 ctx.fillStyle='#f0b0c2';ctx.font='800 13px ui-monospace,monospace';
 ctx.fillText('THE FINAL BATTLE WAS NOT THE END',W*.105,H*.64);
 ctx.strokeStyle='#bfa6d2';ctx.lineWidth=2;ctx.strokeRect(W*.065,H*.16,W*.87,H*.65);
 ctx.restore();
}
window.RUU_SECRET_BOSS={VERSION:'1.21.0',ART,ATLAS,reset,reveal,tick,step,onKill,status,isActive,isIntro,isBoss,drawGround,drawCharacter,drawScreen};
})();