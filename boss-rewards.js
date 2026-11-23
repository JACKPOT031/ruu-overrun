/* RUU//OVERRUN v1.22.0 — BOSS SPOILS / CINEMATIC REWARDS
   Extra rewards stacked ON TOP OF the game's original kill score and gems.
   This module runs only after TRUE DEVORA's last-core HP gate is evaluated.
*/
(()=>{
'use strict';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const REWARDS=Object.freeze({
 boss:      {name:'DEVORA // CORE BREAK',score:5000,xp:90,drive:30,finisher:25,heal:.12,shield:8,color:'#ffb6c9'},
 final:     {name:'NULL EMPEROR // SYSTEM BREACH',score:15000,xp:170,drive:40,finisher:35,heal:.18,shield:12,color:'#ffda9f'},
 true_devora:{name:'DEVORA // CORE SHATTER',score:3750,xp:62,drive:12,finisher:12,heal:.055,shield:5,color:'#e7aaff'},
 secret_ruu:{name:'ECLIPSE // SECRET TERMINUS',score:38000,xp:300,drive:55,finisher:55,heal:.25,shield:25,color:'#ffb4d9'}
});
const COLLECTIVE=Object.freeze({
 3:{name:'TRUE END // THREE CORES ANNIHILATED',score:16500,xp:175,drive:25,finisher:24,heal:.10,shield:12,color:'#f5b6fa'},
 5:{name:'EXTINCTION PROTOCOL // FIVE CORES CLEARED',score:24500,xp:260,drive:30,finisher:30,heal:.12,shield:16,color:'#ff91b9'}
});
let banner=null,clock=0,rewards=0;
function reset(){banner=null;clock=0;rewards=0}
function status(){return {banner:banner?.name||'',remaining:banner?.life||0,grants:rewards}}
function rechargeGauge(value,amount){
 const current=Math.max(0,Number(value)||0);
 // Stop newly granted charge at 95%, while preserving a higher existing charge.
 return Math.max(current,Math.min(95,current+amount));
}
function grant(g,detail,e,api,cinema=false){
 if(!g?.player)return false;
 const p=g.player,oldHp=Number(p.hp)||0;
 const hpAdd=Math.min(Math.max(0,p.maxHp-oldHp),Math.ceil((p.maxHp||0)*detail.heal));
 p.hp=oldHp+hpAdd;
 const oldShield=Math.max(0,Number(p.shield)||0);
 p.shield=oldShield<120?Math.min(120,oldShield+detail.shield):oldShield;
 p.maxShield=Math.max(p.maxShield||0,p.shield);
 g.score=(Number(g.score)||0)+detail.score;
 g.xp=(Number(g.xp)||0)+detail.xp;
 if(g.driveTime>0)g.driveTime=Math.min(10,g.driveTime+1.5);
 else g.driveGauge=rechargeGauge(g.driveGauge,detail.drive);
 // Recharge without auto-firing a finisher during the victory cut-in.
 if(g.finisherTime<=0)g.finisherGauge=rechargeGauge(g.finisherGauge,detail.finisher);
 const description=`SCORE +${detail.score.toLocaleString('en-US')}  /  XP +${detail.xp}  /  HP +${hpAdd}  /  SHIELD +${Math.round(p.shield-oldShield)}`;
 banner={name:detail.name,description,color:detail.color,life:cinema?2.7:2.0,max:cinema?2.7:2.0};
 rewards++;
 g.scenePulse=Math.max(g.scenePulse||0,cinema?1.45:.9);
 g.shake=Math.max(g.shake||0,cinema?19:10);
 g.flash=Math.max(g.flash||0,cinema?.28:.16);
 api?.wave?.(e?.x??p.x,e?.y??p.y,cinema?330:220,detail.color);
 api?.burst?.(e?.x??p.x,e?.y??p.y,detail.color,cinema?36:18,220);
 api?.text?.(e?.x??p.x,e?.y??p.y,`+${detail.score.toLocaleString('en-US')} BONUS`,detail.color,cinema?24:18);
 if(cinema)api?.sound?.('bossBreak');
 return true;
}
function onKill(e,g,api){
 if(!e||!g||e.bossRewardGranted)return false;
 const key=e.secretRuu?'secret_ruu':e.trueDevora?'true_devora':e.kind;
 const detail=REWARDS[key];if(!detail)return false;
 e.bossRewardGranted=true;
 // Major bosses also drop a guaranteed collectible relic chest.
 if((key==='boss'||key==='final')&&Array.isArray(g.chests)){
  g.chests.push({x:e.x,y:e.y,t:0});
  if(g.chests.length>6)g.chests.shift();
 }
 const finalCore=key==='true_devora'&&g.trueEndCleared&&!g.trueEndRewardGranted;
 const isLast=key==='secret_ruu';
 grant(g,detail,e,api,isLast);
 if(finalCore){
  g.trueEndRewardGranted=true;
  const count=g.trueEndCount===5?5:3;
  grant(g,COLLECTIVE[count],e,api,true);
  // ECLIPSE has already been selected (or rejected) using the HP value BEFORE this heal.
  if(!g.secretBossPending){g.bossRewardCinematic=2.65;persistentInvulnerability(g,2.85)}
 }
 if(isLast){
  g.secretRewardClear=true;
  g.bossRewardCinematic=2.75;persistentInvulnerability(g,2.95);
 }
 return true;
}
function persistentInvulnerability(g,seconds){
 g.player.inv=Math.max(g.player.inv||0,seconds);
 g.spawnT=Math.max(g.spawnT||0,seconds+.25);
}
function tick(dt){clock+=Math.max(0,dt);if(banner)banner.life=Math.max(0,banner.life-dt)}
function drawScreen(ctx,W,H){
 if(!banner||banner.life<=0)return;
 const a=clamp(Math.min((banner.max-banner.life)*7,banner.life*2.2),0,1),p=1-banner.life/banner.max;
 const boxW=W*.68,boxH=110,x=(W-boxW)/2,y=H*.71+Math.sin(p*Math.PI)*-12;
 ctx.save();ctx.globalAlpha=a;
 const gr=ctx.createLinearGradient(x,y,x+boxW,y);
 gr.addColorStop(0,'#0b091300');gr.addColorStop(.15,'#190e27df');gr.addColorStop(.5,'#201026f2');gr.addColorStop(.85,'#190e27df');gr.addColorStop(1,'#0b091300');
 ctx.fillStyle=gr;ctx.fillRect(x,y,boxW,boxH);
 ctx.strokeStyle=banner.color;ctx.lineWidth=2;ctx.globalAlpha=a*.65;
 ctx.beginPath();ctx.moveTo(x+boxW*.13,y+4);ctx.lineTo(x+boxW*.87,y+4);ctx.moveTo(x+boxW*.17,y+boxH-4);ctx.lineTo(x+boxW*.83,y+boxH-4);ctx.stroke();
 ctx.globalAlpha=a;
 const cx=W*.5,cy=y+38;
 for(let k=0;k<12;k++){
  const theta=(k/12)*Math.PI*2+clock*.10;
  const dx=Math.cos(theta),dy=Math.sin(theta);
  ctx.globalAlpha=a*.35;ctx.strokeStyle=k%2?'#ffe9ed':banner.color;ctx.lineWidth=k%3===0?2:1;
  ctx.beginPath();ctx.moveTo(cx+dx*49,cy+dy*39);ctx.lineTo(cx+dx*67,cy+dy*47);ctx.stroke();
 }
 ctx.globalAlpha=a;ctx.textAlign='center';ctx.textBaseline='middle';
 ctx.font='1000 25px ui-monospace,Consolas,monospace';ctx.fillStyle='#fff6ec';ctx.shadowColor=banner.color;ctx.shadowBlur=10;
 ctx.fillText(banner.name,W*.5,y+34,boxW*.86);ctx.shadowBlur=0;
 ctx.font='800 12px ui-monospace,Consolas,monospace';ctx.fillStyle=banner.color;
 ctx.fillText(banner.description,W*.5,y+73,boxW*.90);
 ctx.font='800 11px ui-monospace,Consolas,monospace';ctx.fillStyle='#f3dcc6';
 ctx.fillText('✦ BOSS REWARDS // DRIVE + FINISHER CHARGE ✦',W*.5,y+95,boxW*.90);
 ctx.restore();
}
window.RUU_BOSS_REWARDS={VERSION:'1.22.0',REWARDS,COLLECTIVE,reset,onKill,tick,status,drawScreen};
})();
