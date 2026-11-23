/* RUU//OVERRUN v1.19.1 — TRUE END : DEVORA TRINITY / QUINTET
   Final boss defeat reveals a real, challenging second battle.
   Ordinary: three DEVORA. Rare: five (10%). All must be defeated to clear.
*/
(()=>{
'use strict';
const TAU=Math.PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const BARRAGE_RATE=1.20; // Apply to every 3/5 DEVORA core; keep safe lanes.
const RARE_FIVE_CHANCE=.10,ROLES=['HUNTER','ORACLE','SIEGE','FRACTURE','REAPER'];
const COLORS=['#ff719f','#e9a1fd','#ffbd86','#c78bff','#ff668c'];
const ART={};if(typeof Image!=='undefined')for(const [key,src] of Object.entries({three:'assets/devora_true_end_three.webp',five:'assets/devora_true_end_five.webp'})){const image=new Image();image.src=src;ART[key]=image}
const initial=()=>({queued:false,active:false,finished:false,total:0,remaining:0,maxHp:0,rare:false,intro:0,introMax:2.65,clock:0,despair:0,banner:0,finishPulse:0,defeated:0,rolls:0});
let S=initial();function reset(){S=initial()}
function queue(g,e,rng=Math.random){
 if(!g||e?.kind!=='final'||e.trueEndQueued||S.active||S.queued)return false;
 e.trueEndQueued=true;S.queued=true;S.rolls++;
 const v=Number(rng());S.rare=Number.isFinite(v)&&v>=0&&v<RARE_FIVE_CHANCE;
 S.total=S.rare?5:3;S.remaining=S.total;S.maxHp=0;S.defeated=0;
 g.trueEndPending=true;g.trueEndCleared=false;g.trueEndCount=S.total;g.trueEndRemaining=S.total;
 return true;
}
function spawnQueued(g,api){
 if(!S.queued||!g?.player||S.active)return false;
 S.queued=false;S.active=true;S.finished=false;S.clock=0;S.intro=2.65;S.despair=1;S.banner=3.6;
 const p=g.player,count=S.total,level=Number(g.level)||1;
 for(let i=0;i<count;i++){
  const a=-Math.PI/2+i*TAU/count,dist=540+(i%2)*65;
  const mob=api?.spawn?.('true_devora',p.x+Math.cos(a)*dist,p.y+Math.sin(a)*dist,1);
  if(!mob)continue;
  mob.trueDevora=true;mob.trueBossIndex=i;mob.trueBossRole=ROLES[i];mob.trueSpriteSize=288;
  mob.maxHp=Math.ceil((555+level*23)*(i===2?1.25:i===0?1.08:1));mob.hp=mob.maxHp;
  mob.r=39;mob.speed=[104,79,60,88,115][i];mob.dmg=[16,14,19,15,17][i];mob.col=COLORS[i];mob.xp=55;
  mob.elite=false;mob.shoot=999;mob.attack=2.8;mob.trueRageDash=0;
  mob.trueBrain={role:ROLES[i],cd:1.6+i*.56,wind:0,windMax:1.0,targetX:p.x,targetY:p.y,angle:a,shots:0};
 }
 const cores=g.enemies.filter(e=>e.trueDevora&&e.hp>0);
 S.total=cores.length;S.remaining=S.total;S.maxHp=cores.reduce((sum,e)=>sum+e.maxHp,0);
 g.trueEndCount=S.total;g.trueEndRemaining=S.total;
 if(!S.total){S.active=false;S.finished=true;g.trueEndCleared=true;g.trueEndPending=false;return false}
 p.inv=Math.max(p.inv||0,2.8);
 g.shake=Math.max(g.shake||0,S.rare?30:23);g.scenePulse=Math.max(g.scenePulse||0,S.rare?1.6:1.2);
 api?.wave?.(p.x,p.y,S.rare?415:330,S.rare?'#ff5389':'#df78c5');
 api?.burst?.(p.x,p.y,S.rare?'#ff5389':'#f9a0ee',S.rare?62:43,270);
 api?.sound?.('bossBreak');api?.toast?.(S.rare?'DEVORA QUINTET // EXTINCTION PROTOCOL':'DEVORA TRINITY // TRUE END',true);
 return true;
}
function isIntro(){return S.active&&S.intro>0}
function onKill(e,g,api){
 if(!e?.trueDevora||e.trueDeathCounted)return false;
 e.trueDeathCounted=true;S.remaining=Math.max(0,S.remaining-1);S.defeated++;
 if(g)g.trueEndRemaining=S.remaining;
 api?.wave?.(e.x,e.y,225,'#ff97e1');api?.burst?.(e.x,e.y,'#ff76cd',28,235);api?.sound?.('bossDown');
 if(!S.remaining){
  S.finished=true;S.active=false;S.intro=0;S.finishPulse=1.5;S.despair=0;S.banner=3;
  if(g){g.trueEndCleared=true;g.trueEndPending=false;g.score+=(S.rare?6000:3500)}
  api?.toast?.('DEVORA COLLECTIVE // ANNIHILATED',true);api?.sound?.('victory');
 }else api?.toast?.('DEVORA CORE DESTROYED // '+S.remaining+' REMAIN',true);
 return true;
}
function status(g){return{queued:S.queued,active:S.active,finished:S.finished,total:S.total,remaining:S.remaining,
 rare:S.rare,intro:S.intro,rolls:S.rolls,
 hp:(g?.enemies||[]).reduce((v,e)=>v+(e.trueDevora&&e.hp>0?e.hp:0),0),
 maxHp:S.maxHp};}
function projectile(g,e,a,speed,damage,col,r=8){
 if(g.ebullets.length>=135)return false;
 g.ebullets.push({x:e.x+Math.cos(a)*e.r*.66,y:e.y+Math.sin(a)*e.r*.66,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,r,ttl:4.15,col,damage,trueDevora:true});
 return true;
}
function fire(e,g,api){
 const b=e.trueBrain,role=b.role,aim=Math.atan2(b.targetY-e.y,b.targetX-e.x);
 let count=0;const emit=(a,speed,damage,r=8)=>{if(projectile(g,e,a,speed,damage,e.col,r))count++};
 if(role==='HUNTER'){e.trueRageDash=.50;for(const d of [-.18,0,.18])emit(aim+d,255,11,7)}
 else if(role==='ORACLE'){for(const d of [-.26,-.13,0,.13,.26])emit(aim+d,305,13,7)}
 else if(role==='SIEGE')for(let j=0;j<17;j++){const a=j*TAU/17+.10,d=Math.abs(Math.atan2(Math.sin(a-b.angle),Math.cos(a-b.angle)));if(d>=.43&&Math.abs(d-Math.PI)>=.43)emit(a,225,12,8)}
 else if(role==='FRACTURE')for(let j=0;j<12;j++){if(j%6!==0)emit(j*TAU/12+b.angle,247,12,7)}
 else for(let j=0;j<7;j++)emit(aim+(j-3)*.145,302,13,7);
 b.shots+=count;api?.wave?.(e.x,e.y,e.r*2.2,e.col);api?.burst?.(e.x,e.y,e.col,14,175);
 api?.sound?.(role==='ORACLE'?'rail':role==='SIEGE'?'boss':'bolt');
}
function step(e,dt,g,api,q='auto'){
 if(!S.active||!e?.trueDevora||e.hp<=0||!g?.player)return;
 const b=e.trueBrain;if(!b)return;
 if(S.intro>0){e.attack=Math.max(e.attack||0,.28);return}
 const p=g.player,dist=Math.hypot(p.x-e.x,p.y-e.y);
 if(dist>1150){const a=Math.atan2(e.y-p.y,e.x-p.x);e.x=p.x+Math.cos(a)*750;e.y=p.y+Math.sin(a)*750}
 if(b.wind>0){b.wind-=dt;if(b.wind<=0){b.wind=0;fire(e,g,api);b.cd=([2.55,3.1,3.8,3.3,2.8][e.trueBossIndex]*(S.rare?1.2:1)+b.windMax)/BARRAGE_RATE-b.windMax}}
 else {b.cd-=dt;if(b.cd<=0&&dist<820){b.targetX=p.x;b.targetY=p.y;b.angle=Math.atan2(p.y-e.y,p.x-e.x);
  b.windMax=b.role==='SIEGE'?1.18:.88;b.wind=b.windMax;api?.sound?.('shield')}}
}
function tick(dt){if(dt<=0)return;S.clock+=dt;S.intro=Math.max(0,S.intro-dt);S.banner=Math.max(0,S.banner-dt);S.finishPulse=Math.max(0,S.finishPulse-dt);
 S.despair=clamp(S.despair+(S.active?dt*1.5:-dt*.7),0,1)}
function drawGround(ctx,cam,g,q='auto'){
 if(!S.active||!g?.enemies)return;
 ctx.save();ctx.globalCompositeOperation='screen';
 for(const e of g.enemies){if(!e.trueDevora||e.hp<=0)continue;const x=e.x-cam.x,y=e.y-cam.y;
  if(x<-150||x>1350||y<-150||y>825)continue;
  ctx.globalAlpha=.3;ctx.strokeStyle=e.col;ctx.lineWidth=q==='lite'?2:3;
  ctx.beginPath();ctx.arc(x,y,e.r+25+Math.sin(S.clock*3+e.trueBossIndex)*5,0,TAU);ctx.stroke()}
 ctx.restore();
}
function drawWorld(ctx,cam,g,q='auto'){
 if(!S.active||!g?.enemies)return;
 for(const e of g.enemies){if(!e.trueDevora||e.hp<=0)continue;const x=e.x-cam.x,y=e.y-cam.y,b=e.trueBrain;
  if(x<-220||x>1420||y<-220||y>895)continue;
  const width=108,yy=y-170;ctx.save();ctx.fillStyle='#090916e3';ctx.fillRect(x-width/2,yy,width,24);
  ctx.strokeStyle=e.col;ctx.lineWidth=1.5;ctx.strokeRect(x-width/2,yy,width,24);
  ctx.fillStyle=e.col;ctx.font='900 10px ui-monospace,monospace';ctx.textAlign='center';ctx.fillText('DEVORA / '+(e.trueBossIndex+1),x,yy+10);
  ctx.fillStyle='#241020';ctx.fillRect(x-width/2+6,yy+17,width-12,4);ctx.fillStyle=e.col;ctx.fillRect(x-width/2+6,yy+17,(width-12)*clamp(e.hp/e.maxHp,0,1),4);
  if(b?.wind>0){const a=Math.atan2(b.targetY-e.y,b.targetX-e.x),t=clamp(1-b.wind/b.windMax,0,1);
   ctx.strokeStyle=e.col;ctx.lineCap='round';ctx.globalAlpha=.13+.25*t;ctx.lineWidth=q==='lite'?11:21;ctx.beginPath();
   if(['SIEGE','FRACTURE'].includes(b.role)){ctx.arc(x,y,e.r+90,0,TAU);ctx.stroke();ctx.globalAlpha=.7;ctx.strokeStyle='#9dffcf';ctx.lineWidth=6;
    for(const k of [0,Math.PI]){ctx.beginPath();ctx.arc(x,y,e.r+90,b.angle+k-.40,b.angle+k+.40);ctx.stroke()}}
   else{ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a)*680,y+Math.sin(a)*680);ctx.stroke();ctx.globalAlpha=.82;ctx.strokeStyle='#fff3ee';ctx.lineWidth=2;
    ctx.setLineDash([13,11]);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a)*680,y+Math.sin(a)*680);ctx.stroke();ctx.setLineDash([])}}
  ctx.restore();}
}
function drawScreen(ctx,W,H,g,q='auto'){
 if(!g)return;
 if(S.despair>0){const power=S.despair,rare=S.rare,t=S.clock;ctx.save();
  ctx.globalAlpha=(rare?.26:.14)*power;
  const gr=ctx.createRadialGradient(W/2,H/2,W*.18,W/2,H/2,W*.8);gr.addColorStop(0,'#00000000');gr.addColorStop(1,rare?'#cb1746':'#7e1255');
  ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);
  ctx.globalAlpha=(rare?.49:.27)*power*(.78+.22*Math.sin(t*7));ctx.strokeStyle=rare?'#fc507e':'#e987d8';ctx.lineWidth=rare?11:7;ctx.strokeRect(6,6,W-12,H-12);
  if(q!=='lite'){ctx.globalAlpha=.10*power;ctx.strokeStyle='#ffb4f3';ctx.lineWidth=1;
   for(let i=0;i<(rare?8:4);i++){const y=(i*112+t*(rare?19:11))%H;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}}
  ctx.restore();}
 if(S.intro>0&&S.active){const t=S.intro,alpha=clamp(Math.min((S.introMax-t)*6,t*3),0,1),rare=S.rare;
  if(alpha<=0)return;ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle=rare?'#140612ed':'#110919e8';ctx.fillRect(0,H*.15,W,H*.73);
  const image=ART[rare?'five':'three'],x=W*.065,y=H*.19,w=W*.87,h=H*.56;
  // Native-aspect front layer keeps all three / five DEVORA figures proportional.
  // A faint cover layer behind it fills the wide panel without stretching the main art.
  if(image?.complete&&image.naturalWidth>0&&image.naturalHeight>0){
   const iw=image.naturalWidth,ih=image.naturalHeight,inset=Math.min(w,h)*.015;
   ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
   const cover=Math.max(w/iw,h/ih),cw=iw*cover,ch=ih*cover;
   ctx.globalAlpha=alpha*.17;
   ctx.drawImage(image,x+(w-cw)/2,y+(h-ch)/2,cw,ch);
   const contain=Math.min((w-inset*2)/iw,(h-inset*2)/ih),dw=iw*contain,dh=ih*contain;
   ctx.globalAlpha=alpha;ctx.drawImage(image,x+(w-dw)/2,y+(h-dh)/2,dw,dh);
   ctx.restore();
  }else{ctx.fillStyle='#381229';ctx.fillRect(x,y,w,h)}
  const gr=ctx.createLinearGradient(0,0,W,0);gr.addColorStop(0,'rgba(3,4,13,.90)');gr.addColorStop(.43,'rgba(8,4,15,.48)');gr.addColorStop(1,'rgba(4,4,11,.23)');
  ctx.fillStyle=gr;ctx.fillRect(x,y,w,h);ctx.fillStyle=rare?'#ff6794':'#e5a5ff';ctx.fillRect(W*.075,H*.195,7,H*.52);
  ctx.textAlign='left';ctx.fillStyle='#fff3e9';ctx.font='900 17px ui-monospace,Consolas,monospace';ctx.fillText('DEVORA // TRUE FINAL PHASE',W*.104,H*.39);
  ctx.font='900 50px ui-monospace,Consolas,monospace';ctx.fillText(rare?'× 5':'× 3',W*.104,H*.49);
  ctx.font='900 24px Yu Gothic,Meiryo,system-ui,sans-serif';ctx.fillText(rare?'絶望的顕現 / 五体同時侵攻':'真の終焉 / 三体同時侵攻',W*.105,H*.555);
  ctx.font='800 14px ui-monospace,Consolas,monospace';ctx.fillStyle=rare?'#ff95b4':'#f5bef5';ctx.fillText(rare?'EXTINCTION PROTOCOL // NO WAY BACK':'THE END WAS A LIE',W*.105,H*.62);
  ctx.strokeStyle=rare?'#ff387a':'#ffa7f3';ctx.lineWidth=3;ctx.strokeRect(x,y,w,h);ctx.restore();
 }else if(S.active&&S.banner>0){ctx.save();ctx.globalAlpha=clamp(S.banner/1.1,0,1)*.92;
  ctx.fillStyle='#100916d9';ctx.fillRect(W*.32,H*.85,W*.36,29);ctx.textAlign='center';ctx.fillStyle=S.rare?'#ff91a8':'#f6afd9';
  ctx.font='900 12px ui-monospace,monospace';ctx.fillText('DEVORA TRUE BOSS // '+S.remaining+' / '+S.total+' REMAINING',W/2,H*.85+19);ctx.restore()}
}
window.RUU_TRUE_END={VERSION:'1.22.1',RARE_FIVE_CHANCE,ROLES,reset,queue,spawnQueued,onKill,status,isIntro,step,tick,drawGround,drawWorld,drawScreen};
})();
