/* RUU//OVERRUN v1.31.0 — OPERATION: TAKAMIYA / ASTRAEA SIEGE
   Three ECLIPSE, three DEVORA and one hostile ASTRAEA form the seven-boss gate.
   Two finite melee screens protect them; screen cleanup never grants rewards.
*/
(()=>{
'use strict';
const TAU=Math.PI*2;
const BARRAGE_RATE=1.20; // All phases incl. LAST LIGHT; same telegraph/safe patterns and projectile cap.
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const ART=new Image();ART.decoding='async';ART.src='assets/secret_ruu.webp';
const ATLAS=new Image();ATLAS.decoding='async';ATLAS.src='assets/secret_ruu_animation_atlas.webp';
const ATLAS_CELL=320,ATLAS_COLS=4,ECLIPSE_TOTAL=3,REINFORCEMENT_TOTAL=3;
const PROJECTILE_CAP=846,REINFORCEMENT_RESERVE=96,ECLIPSE_PROJECTILE_CAP=PROJECTILE_CAP-REINFORCEMENT_RESERVE;
const REINFORCEMENT_DELAY=12;
const ASTRAEA_TOTAL=1,ASTRAEA_DELAY=20,SCREEN_WAVE_TOTAL=2,SCREEN_WAVE_SIZE=12,SCREEN_ARRIVAL=.7;
// Pre-render 7 premium projectile glyphs only once. Each live bullet is one
// Canvas drawImage rather than a new shadowBlur + radial gradient per frame.
const GLYPHS=['crescent','halo','needle','blade','prism','core','ember'];
const GLYPH_CACHE=new Map();
const TAIL_CACHE=new Map();
function bulletTail(type){
 const key=type==='core'?'core':'normal';
 if(!TAIL_CACHE.has(key)){
  let canvas=null;
  if(typeof document!=='undefined'){
   canvas=document.createElement('canvas');canvas.width=256;canvas.height=16;
   const c=canvas.getContext('2d');
   if(c){const gradient=c.createLinearGradient(0,0,256,0);gradient.addColorStop(0,'#d5b0ff00');gradient.addColorStop(1,key==='core'?'#ff6c9b88':'#ffd9f59c');c.fillStyle=gradient;c.fillRect(0,0,256,16)}
   else canvas=null;
  }
  TAIL_CACHE.set(key,canvas);
 }
 return TAIL_CACHE.get(key);
}
function makeGlyph(type){
 if(typeof document==='undefined')return null;
 const canvas=document.createElement('canvas');canvas.width=112;canvas.height=112;
 const c=canvas.getContext('2d');if(!c)return null;
 c.translate(56,56);
 const rose='#ff78c9',violet='#c9a6ff',ivory='#fff2ee',gold='#ffd9b3';
 const color=type==='needle'||type==='blade'?gold:type==='core'?'#ff557d':type==='halo'?violet:rose;
 const aura=c.createRadialGradient(0,0,3,0,0,53);
 aura.addColorStop(0,ivory+'dd');aura.addColorStop(.20,color+'aa');aura.addColorStop(.50,color+'39');aura.addColorStop(1,color+'00');
 c.fillStyle=aura;c.beginPath();c.arc(0,0,53,0,TAU);c.fill();
 c.shadowColor=color;c.shadowBlur=12;c.lineWidth=3;
 if(type==='halo'){
  c.strokeStyle='#f9d9ff';c.lineWidth=5;c.beginPath();c.arc(0,0,20,.24,TAU-.24);c.stroke();
  c.strokeStyle=violet;c.lineWidth=2;c.beginPath();c.arc(0,0,28,-1.1,1.1);c.stroke();
  for(let i=0;i<4;i++){const a=i*TAU/4;c.fillStyle=ivory;c.beginPath();c.arc(Math.cos(a)*20,Math.sin(a)*20,2.9,0,TAU);c.fill()}
 }else if(type==='crescent'){
  c.fillStyle=ivory;c.strokeStyle=rose;c.beginPath();c.moveTo(-19,-28);
  c.bezierCurveTo(15,-36,32,-7,22,18);c.bezierCurveTo(9,30,-4,26,-22,15);
  c.bezierCurveTo(1,15,18,-7,-19,-28);c.closePath();c.fill();c.stroke();
 }else if(type==='needle'){
  c.fillStyle='#fffefa';c.strokeStyle='#f4a2cf';c.beginPath();c.moveTo(37,0);c.lineTo(-18,-8);c.lineTo(-31,0);c.lineTo(-18,8);c.closePath();c.fill();c.stroke();
  c.fillStyle='#9d6fd8';c.beginPath();c.moveTo(21,0);c.lineTo(-12,-3);c.lineTo(-17,0);c.lineTo(-12,3);c.closePath();c.fill();
 }else if(type==='blade'){
  c.fillStyle=ivory;c.strokeStyle='#ef83ad';c.beginPath();c.moveTo(36,-18);c.quadraticCurveTo(23,12,-30,28);
  c.quadraticCurveTo(-12,1,-18,-11);c.quadraticCurveTo(6,13,36,-18);c.closePath();c.fill();c.stroke();
 }else if(type==='prism'){
  c.fillStyle='#ffd7fd';c.strokeStyle='#aa69f5';c.beginPath();c.moveTo(29,0);c.lineTo(0,22);c.lineTo(-25,0);c.lineTo(0,-22);c.closePath();c.fill();c.stroke();
  c.fillStyle=ivory;c.beginPath();c.moveTo(20,0);c.lineTo(0,8);c.lineTo(-12,0);c.lineTo(0,-8);c.closePath();c.fill();
 }else if(type==='core'){
  c.fillStyle='#170c2d';c.strokeStyle='#ff7496';c.lineWidth=5;c.beginPath();c.arc(0,0,19,0,TAU);c.fill();c.stroke();
  c.strokeStyle=ivory;c.lineWidth=2;c.beginPath();c.arc(0,0,25,.75,4.4);c.stroke();
  c.fillStyle=rose;c.beginPath();c.arc(0,0,7,0,TAU);c.fill();
 }else{
  c.fillStyle='#fff4e6';c.strokeStyle='#f45f92';c.beginPath();
  for(let i=0;i<10;i++){const a=i*TAU/10-Math.PI/2,r=i%2?11:28;if(i===0)c.moveTo(Math.cos(a)*r,Math.sin(a)*r);else c.lineTo(Math.cos(a)*r,Math.sin(a)*r)}
  c.closePath();c.fill();c.stroke();
 }
 c.shadowBlur=0;return canvas;
}
function bulletGlyph(type){
 const key=GLYPHS.includes(type)?type:'prism';
 if(!GLYPH_CACHE.has(key))GLYPH_CACHE.set(key,makeGlyph(key));
 return GLYPH_CACHE.get(key);
}
function drawBullet(ctx,b,cam,q='auto'){
 if(!b?.secretRuu)return false;
 const x=b.x-cam.x,y=b.y-cam.y;if(x<-55||x>1255||y<-55||y>730)return true;
 const glyph=bulletGlyph(b.fxType),a=Math.atan2(b.vy,b.vx),speed=Math.hypot(b.vx,b.vy),size=Math.max(25,(b.r||7)*3.5);
 ctx.save();ctx.translate(x,y);ctx.rotate((b.fxType==='halo'||b.fxType==='core')?(b.born||0)*.4:a);
 ctx.globalCompositeOperation='lighter';
 if(q!=='lite'){
  const tail=Math.min(39,15+speed*.045),width=b.fxType==='needle'?2.6:4.5,sprite=bulletTail(b.fxType);
  ctx.globalAlpha=.58;
  // Crop the cached gradient at -5 while retaining its original -tail..0 scale.
  if(sprite)ctx.drawImage(sprite,0,0,256*(tail-5)/tail,16,-tail,-width/2,tail-5,width);
  else{ctx.strokeStyle=b.fxType==='core'?'#ff6c9b88':'#ffd9f59c';ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(-tail,0);ctx.lineTo(-5,0);ctx.stroke()}
 }
 ctx.globalAlpha=1;
 if(glyph)ctx.drawImage(glyph,-size/2,-size/2,size,size);
 else{ctx.fillStyle='#fff1f8';ctx.beginPath();ctx.arc(0,0,b.r,0,TAU);ctx.fill()}
 ctx.restore();return true;
}

const BRAIN=index=>({
 index,clock:index*.37,wind:0,windMax:0,cooldown:1.35+index*.4,pattern:(index*3)%8,targetX:0,targetY:0,aim:0,
 dash:0,dashPause:0,dashLeft:0,dashDirX:0,dashDirY:0,dashTrail:[],
 enraged:false,frenzy:false,phasePulse:0,frenzyPulse:0,emitted:0,attempted:0,shotRemainders:Object.create(null),
 events:[],hazards:[],crossWarning:null,slashFlash:0,slashAim:0,
 anim:'idle',animTimer:0,facing:1,releaseFlash:0,curtainClock:0,aftershock:0
});
const INITIAL=()=>({
 triggered:false,active:false,finished:false,intro:0,introMax:3.1,clock:0,combatClock:0,
 bosses:[],reinforcements:Array(REINFORCEMENT_TOTAL).fill(null),reinforcementsSpawned:false,
 astraea:null,astraeaSpawned:false,astraeaMaxHp:0,screens:[],screenWaves:0,
 screenSlots:Array.from({length:SCREEN_WAVE_TOTAL},()=>Array(SCREEN_WAVE_SIZE).fill(null)),
 level:1,qualifiedHp:0,eclipseMaxHp:0,reinforcementMaxHp:0,plannedReinforcementHp:[],
 finishPulse:0,emitted:0,attempted:0,budgetArray:null,budgetLength:-1,budget:null
});
let S=INITIAL();
function reset(){S=INITIAL()}
function isActive(){return S.active}
function isIntro(e){
 if(e?.secretScreen)return S.active&&e.secretScreenIntro>0;
 if(e?.enemyAstraea)return !!window.RUU_ENEMY_ASTRAEA?.isIntro?.(e);
 if(e?.secretReinforcement)return !!window.RUU_TRUE_END?.isIntro?.(e);
 return S.active&&S.intro>0;
}
function isBoss(e){return !!e?.secretRuu}
function isEncounterEnemy(e){return !!(e?.secretRuu||e?.secretReinforcement||e?.enemyAstraea||e?.secretScreen)}
function remainingBosses(){return S.bosses.reduce((n,e)=>n+(!e.secretDeathCounted?1:0),0)}
function remainingOriginalBosses(){return remainingBosses()+S.reinforcements.reduce((n,e)=>n+(!e?.secretDeathCounted?1:0),0)}
function status(){
 const alive=S.bosses.filter(e=>!e.secretDeathCounted&&e.hp>0),first=alive[0]?.secretBrain;
 const eclipseRemaining=remainingBosses(),reinforcementRemaining=S.triggered?S.reinforcements.reduce((n,e)=>n+(!e?.secretDeathCounted?1:0),0):0;
 const eclipseHp=S.bosses.reduce((n,e)=>n+Math.max(0,e.hp||0),0);
 const reinforcementHp=S.triggered?S.reinforcements.reduce((n,e,i)=>n+(e?Math.max(0,e.hp||0):S.plannedReinforcementHp[i]||0),0):0;
 const astraeaRemaining=S.triggered&&!S.astraea?.secretDeathCounted?ASTRAEA_TOTAL:0;
 const astraeaHp=S.triggered?(S.astraea?Math.max(0,S.astraea.hp||0):S.astraeaMaxHp):0;
 const screenRemaining=S.screens.reduce((n,e)=>n+(e.hp>0&&!e.secretDeathCounted?1:0),0);
 return {
  triggered:S.triggered,active:S.active,finished:S.finished,intro:S.intro,combatClock:S.combatClock,
  enraged:alive.some(e=>e.secretBrain.enraged),frenzy:alive.some(e=>e.secretBrain.frenzy),pattern:first?.pattern||0,
  eclipseTotal:S.triggered?ECLIPSE_TOTAL:0,eclipseRemaining,eclipseHp,eclipseMaxHp:S.eclipseMaxHp,
  reinforcementTotal:S.triggered?REINFORCEMENT_TOTAL:0,reinforcementRemaining,reinforcementHp,reinforcementMaxHp:S.reinforcementMaxHp,
  reinforcementsSpawned:S.reinforcementsSpawned,astraeaTotal:S.triggered?ASTRAEA_TOTAL:0,astraeaRemaining,astraeaHp,astraeaMaxHp:S.astraeaMaxHp,astraeaSpawned:S.astraeaSpawned,
  screenWaves:S.screenWaves,screenRemaining,screenSpawned:S.screens.length,
  totalThreats:S.triggered?ECLIPSE_TOTAL+REINFORCEMENT_TOTAL+ASTRAEA_TOTAL:0,remainingThreats:eclipseRemaining+reinforcementRemaining+astraeaRemaining,
  hp:eclipseHp+reinforcementHp+astraeaHp,maxHp:S.eclipseMaxHp+S.reinforcementMaxHp+S.astraeaMaxHp||1,
  qualifiedHp:S.qualifiedHp,encounterLevel:S.level,emitted:S.emitted,attempted:S.attempted,animation:first?.anim||'idle',
  projectilesCap:PROJECTILE_CAP,eclipseProjectilesCap:ECLIPSE_PROJECTILE_CAP,reinforcementProjectilesCap:REINFORCEMENT_RESERVE
 };
}
function reveal(g,api){
 if(!g?.player||!g.trueEndCleared||S.triggered||S.active||g.mode==='endless')return false;
 const p=g.player,ratio=p.hp/Math.max(1,p.maxHp);
 if(p.hp<=0||ratio+1e-9<.5)return false;
 if(typeof api?.spawn!=='function'||typeof window.RUU_TRUE_END?.spawnReinforcement!=='function'||typeof window.RUU_TRUE_END?.reinforcementHp!=='function')return false;
 if(typeof window.RUU_ENEMY_ASTRAEA?.spawn!=='function'||typeof window.RUU_ENEMY_ASTRAEA?.maxHp!=='function')return false;
 const bosses=[],level=Number(g.level)||1;
 for(let i=0;i<ECLIPSE_TOTAL;i++){
  const a=-Math.PI/3+i*TAU/ECLIPSE_TOTAL,dist=405+i*24;
  const e=api.spawn('secret_ruu',p.x+Math.cos(a)*dist,p.y+Math.sin(a)*dist,1);
  if(!e){g.enemies=g.enemies.filter(enemy=>!bosses.includes(enemy));return false}
  bosses.push(e);
 }
 S=INITIAL();S.triggered=true;S.active=true;S.bosses=bosses;S.qualifiedHp=ratio;S.level=level;S.intro=S.introMax;
 S.plannedReinforcementHp=Array.from({length:REINFORCEMENT_TOTAL},(_,i)=>window.RUU_TRUE_END.reinforcementHp(level,i));
 S.reinforcementMaxHp=S.plannedReinforcementHp.reduce((a,b)=>a+b,0);
 S.astraeaMaxHp=window.RUU_ENEMY_ASTRAEA.maxHp(level);
 for(let i=0;i<bosses.length;i++){
  const e=bosses[i];e.secretRuu=true;e.secretBossIndex=i;e.secretBrain=BRAIN(i);e.secretPhase=1;
  e.maxHp=Math.ceil(2350+level*33);e.hp=e.maxHp;S.eclipseMaxHp+=e.maxHp;
  e.r=34;e.speed=0;e.dmg=17;e.shoot=9999;e.attack=S.introMax+.4;
  e.xp=200;e.col='#d4baae';e.pushX=0;e.pushY=0;
 }
 g.secretBossPending=true;g.secretBossCleared=false;
 g.enemies=bosses.slice();g.ebullets.length=0;
 const progress=g.bossProgress||(g.bossProgress={});
 progress.eclipseTotal=ECLIPSE_TOTAL;progress.eclipseKilled=0;progress.eclipseDevoraTotal=REINFORCEMENT_TOTAL;progress.eclipseDevoraKilled=0;progress.eclipseDevoraSpawned=false;
 progress.eclipseAstraeaTotal=ASTRAEA_TOTAL;progress.eclipseAstraeaKilled=0;progress.eclipseAstraeaSpawned=false;
 progress.eclipseScreenWaves=0;progress.eclipseScreenSpawned=0;progress.eclipseScreenKilled=0;
 p.inv=Math.max(p.inv||0,S.introMax+.4);
 g.shake=Math.max(g.shake||0,25);g.flash=Math.max(g.flash||0,.45);
 g.scenePulse=Math.max(g.scenePulse||0,1.4);
 api?.wave?.(p.x,p.y,360,'#d2b7a8');
 for(const e of bosses)api?.burst?.(e.x,e.y,'#ffddd5',20,180);
 api?.sound?.('bossBreak');api?.toast?.('OPERATION: TAKAMIYA // ECLIPSE ×3',true);
 return true;
}
function spawnReinforcements(g,api){
 if(!S.active||S.reinforcementsSpawned||!g?.player)return false;
 for(let i=0;i<REINFORCEMENT_TOTAL;i++){
  if(S.reinforcements[i])continue;
  const e=window.RUU_TRUE_END?.spawnReinforcement?.(g,api,i,S.level);
  if(e)S.reinforcements[i]=e;
 }
 if(!S.reinforcements.every(Boolean))return false;
 S.reinforcementsSpawned=true;
 if(g.bossProgress)g.bossProgress.eclipseDevoraSpawned=true;
 api?.wave?.(g.player.x,g.player.y,330,'#ff97e1');api?.sound?.('bossBreak');
 api?.toast?.('TAKAMIYA REINFORCEMENTS // DEVORA ×3',true);
 return true;
}
function spawnAstraea(g,api){
 if(S.astraeaSpawned)return true;
 const e=window.RUU_ENEMY_ASTRAEA?.spawn?.(g,api,S.level);
 if(!e)return false;
 S.astraea=e;S.astraeaSpawned=true;
 if(g.bossProgress)g.bossProgress.eclipseAstraeaSpawned=true;
 return true;
}
function spawnScreenWave(g,api,index){
 const slots=S.screenSlots[index];
 if(!slots||!g?.player||typeof api?.spawn!=='function')return false;
 if(slots.every(Boolean))return true;
 const p=g.player,targets=[...S.bosses,...S.reinforcements,S.astraea].filter(e=>e&&e.hp>0&&!e.secretDeathCounted);
 const occupied=S.screens.filter(e=>e.hp>0&&!e.secretDeathCounted);
 const available=(x,y)=>occupied.every(e=>Math.hypot(e.x-x,e.y-y)>=30);
 for(let i=0;i<SCREEN_WAVE_SIZE;i++){
  if(slots[i]||S.screens.length>=SCREEN_WAVE_TOTAL*SCREEN_WAVE_SIZE)continue;
  const targetIndex=targets.length?i%targets.length:0,target=targets[targetIndex];
  const dx=target?target.x-p.x:0,dy=target?target.y-p.y:0,distance=Math.hypot(dx,dy);
  const angle=distance>1?Math.atan2(dy,dx):-Math.PI/2+(i%3)*TAU/3+index*.2;
  const groupSize=targets.length?Math.floor((SCREEN_WAVE_SIZE-1-targetIndex)/targets.length)+1:4;
  const rank=targets.length?Math.floor(i/targets.length):Math.floor(i/3);
  const side=(rank-(groupSize-1)/2)*34;
  // Favor the line between player and boss. A nearby boss never overrides safe arrival distance.
  const radius=target?clamp(distance*.55,170,Math.max(170,Math.min(320,distance-70))):220;
  let x=p.x+Math.cos(angle)*radius-Math.sin(angle)*side,y=p.y+Math.sin(angle)*radius+Math.cos(angle)*side;
  if(!available(x,y)){
   const bearing=Math.atan2(y-p.y,x-p.x),range=Math.hypot(x-p.x,y-p.y);
   // Nearby bearings can converge as bosses move. Keep individual screen bodies distinct.
   // Prefer a small angular adjustment; a finite outer ring handles a crowded arrival.
   for(let attempt=0;attempt<84;attempt++){
    const shift=attempt<12?Math.ceil((attempt+1)/2)*.12*(attempt%2?-1:1):(attempt-12)*TAU/72;
    const distance=attempt<12?range:390;
    const xx=p.x+Math.cos(bearing+shift)*distance,yy=p.y+Math.sin(bearing+shift)*distance;
    if(available(xx,yy)){x=xx;y=yy;break}
   }
  }
  const kind=i%3===2?'runner':'brute',e=api.spawn(kind,x,y,1);
  if(!e)continue;
  e.secretScreen=true;e.secretScreenWave=index+1;e.secretScreenIntro=SCREEN_ARRIVAL;
  e.secretScreenSpeed=kind==='brute'?70:120;e.speed=0;e.dmg=kind==='brute'?10:8;
  e.maxHp=(kind==='brute'?180+S.level*5:75+S.level*2);e.hp=e.maxHp;
  e.attack=SCREEN_ARRIVAL+.2;e.shoot=9999;e.elite=false;e.pushX=0;e.pushY=0;
  delete e.mutation;delete e.bossMutation;delete e.phase3;
  slots[i]=e;S.screens.push(e);occupied.push(e);
  if(g.bossProgress)g.bossProgress.eclipseScreenSpawned=S.screens.length;
 }
 if(!slots.every(Boolean))return false;
 S.screenWaves=Math.max(S.screenWaves,index+1);
 if(g.bossProgress)g.bossProgress.eclipseScreenWaves=S.screenWaves;
 api?.sound?.('shield');api?.toast?.('TAKAMIYA SCREEN // WAVE '+(index+1)+' / '+SCREEN_WAVE_TOTAL,true);
 return true;
}
function spawnSupport(g,api,force=false){
 if(!S.active||!g?.player)return;
 const finalWave=force||S.combatClock>=ASTRAEA_DELAY;
 // The new major target exists before its melee screen chooses positions.
 if(finalWave)spawnAstraea(g,api);
 if(force||S.intro<=0){
  if(spawnScreenWave(g,api,0)&&finalWave)spawnScreenWave(g,api,1);
 }
}
function cleanupScreens(g){
 const owned=new Set(S.screens);
 for(const e of S.screens){
  if(e.hp<=0||e.secretDeathCounted)continue;
  e.hp=0;e.killCounted=true;e.secretDeathCounted=true;e.secretScreenCleaned=true;e.secretScreenIntro=0;
 }
 // No kill callbacks: disposal grants no score, XP, drops, combo or recorded kills.
 g.enemies=g.enemies.filter(e=>!owned.has(e));
}
function onKill(e,g,api){
 if(!isEncounterEnemy(e)||e.hp>0||e.secretDeathCounted||!S.active||!g)return false;
 if(!S.bosses.includes(e)&&!S.reinforcements.includes(e)&&S.astraea!==e&&!S.screens.includes(e))return false;
 e.secretDeathCounted=true;
 if(e.secretBrain){const b=e.secretBrain;b.events.length=0;b.hazards.length=0;b.dashLeft=0;b.aftershock=0;b.wind=0;b.crossWarning=null}
 const progress=g.bossProgress||(g.bossProgress={});
 if(e.secretScreen){progress.eclipseScreenKilled=(progress.eclipseScreenKilled||0)+1;return false}
 if(e.secretRuu)progress.eclipseKilled=(progress.eclipseKilled||0)+1;
 else if(e.secretReinforcement)progress.eclipseDevoraKilled=(progress.eclipseDevoraKilled||0)+1;
 else if(e.enemyAstraea){progress.eclipseAstraeaKilled=(progress.eclipseAstraeaKilled||0)+1;window.RUU_ENEMY_ASTRAEA?.onDefeat?.(e,g,api)}
 api?.wave?.(e.x,e.y,225,'#ffd4c2');api?.burst?.(e.x,e.y,'#d7b2ff',28,200);
 if(!remainingBosses()&&!S.reinforcementsSpawned)spawnReinforcements(g,api);
 if(!remainingOriginalBosses())spawnSupport(g,api,true);
 if(!S.reinforcementsSpawned||!S.astraeaSpawned||status().remainingThreats>0)return false;
 cleanupScreens(g);
 S.active=false;S.finished=true;S.intro=0;S.finishPulse=1.7;
 if(g){g.secretBossPending=false;g.secretBossCleared=true;g.score+=8500;
  g.scenePulse=Math.max(g.scenePulse||0,1.4);g.shake=Math.max(g.shake||0,24)}
 api?.wave?.(e.x,e.y,390,'#ffd4c2');api?.burst?.(e.x,e.y,'#d7b2ff',54,250);
 api?.sound?.('victory');api?.toast?.('TAKAMIYA CLEARED // SECRET END UNLOCKED',true);
 return true;
}
function tick(dt,g,api){
 if(dt<=0)return;
 S.finishPulse=Math.max(0,S.finishPulse-dt);
 if(!S.active)return;
 S.budgetArray=null;
 const introElapsed=Math.min(dt,S.intro);S.clock+=dt;S.intro=Math.max(0,S.intro-dt);S.combatClock+=dt-introElapsed;
 for(const e of S.bosses){
  if(e.hp<=0)continue;const b=e.secretBrain;b.clock+=dt;
  b.phasePulse=Math.max(0,b.phasePulse-dt);b.frenzyPulse=Math.max(0,b.frenzyPulse-dt);b.slashFlash=Math.max(0,b.slashFlash-dt);
  b.releaseFlash=Math.max(0,b.releaseFlash-dt);b.aftershock=Math.max(0,b.aftershock-dt);
  for(let i=b.dashTrail.length-1;i>=0;i--){const t=b.dashTrail[i];t.life-=dt;if(t.life<=0)b.dashTrail.splice(i,1)}
  if(S.intro>0){e.speed=0;e.attack=Math.max(e.attack||0,.25)}
 }
 for(const e of S.screens){
  if(e.hp<=0||e.secretDeathCounted)continue;
  e.secretScreenIntro=Math.max(0,e.secretScreenIntro-dt);
  e.speed=e.secretScreenIntro>0?0:e.secretScreenSpeed;
  if(e.secretScreenIntro>0)e.attack=Math.max(e.attack||0,.22);
 }
 if(!S.reinforcementsSpawned&&(S.combatClock>=REINFORCEMENT_DELAY||!remainingBosses()))spawnReinforcements(g,api);
 spawnSupport(g,api,!remainingOriginalBosses());
}
function projectileCounts(g){
 const list=g?.ebullets;if(!Array.isArray(list))return null;
 if(S.budgetArray===list&&S.budgetLength===list.length)return S.budget;
 const counts={eclipse:0,reinforcement:0};
 for(const b of list){if(b.secretReinforcement)counts.reinforcement++;else if(b.secretRuu)counts.eclipse++}
 S.budgetArray=list;S.budgetLength=list.length;S.budget=counts;return counts;
}
function canEmitReinforcement(g){
 const counts=projectileCounts(g);
 return !!(S.active&&counts&&g.ebullets.length<PROJECTILE_CAP&&counts.reinforcement<REINFORCEMENT_RESERVE);
}
function bullet(g,e,x,y,a,speed,damage,col,r=7,ttl=3.45,fxType='prism'){
 const brain=e.secretBrain;S.attempted++;brain.attempted++;
 const counts=projectileCounts(g);
 if(!counts||g.ebullets.length>=PROJECTILE_CAP||counts.eclipse>=ECLIPSE_PROJECTILE_CAP)return false;
 g.ebullets.push({x,y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,r,ttl,col,damage,secretRuu:true,secretBossIndex:brain.index,fxType,born:brain.clock});
 counts.eclipse++;S.budgetLength=g.ebullets.length;S.emitted++;brain.emitted++;return true;
}
function shoot(g,e,a,speed,damage,col,r=7,fxType='prism'){
 return bullet(g,e,e.x+Math.cos(a)*e.r*.75,e.y+Math.sin(a)*e.r*.75,a,speed,damage,col,r,3.45,fxType);
}
function queue(e,type,time,data={}){const b=e.secretBrain;if(b.events.length<30)b.events.push({type,time,...data})}
function scaledCount(e,key,baseCount){
 // Preserve the exact cumulative 3/2 ratio even for odd counts: 7 -> 10, 11.
 const remainder=e.secretBrain.shotRemainders,total=baseCount*3+(remainder[key]||0);
 remainder[key]=total%2;return Math.floor(total/2);
}
function expandedOffsets(e,key,offsets){
 const extra=scaledCount(e,key,offsets.length)-offsets.length,result=offsets.slice(),gaps=[];
 for(let i=0;i<offsets.length-1;i++)gaps.push([offsets[i],offsets[i+1]]);
 for(let i=0;i<extra;i++){const gap=gaps[Math.floor((i+.5)*gaps.length/extra)];result.push((gap[0]+gap[1])/2)}
 return result;
}
function safeAngle(a,safe,gap){
 const diff=Math.abs(Math.atan2(Math.sin(a-safe),Math.cos(a-safe)));
 return diff>=gap&&Math.abs(diff-Math.PI)>=gap;
}
function boostedRing(e,key,n,rotation,safe,gap,emit){
 const allowed=[];
 for(let i=0;i<n;i++){const a=i*TAU/n+rotation;if(safeAngle(a,safe,gap))allowed.push({a,i})}
 const extra=scaledCount(e,key,allowed.length)-allowed.length;
 for(let j=0;j<allowed.length;j++){
  const {a,i}=allowed[j];emit(a,i);
  if(Math.floor((j+1)*extra/allowed.length)>Math.floor(j*extra/allowed.length)){
   const offset=TAU/n/3,shifted=safeAngle(a+offset,safe,gap)?a+offset:a-offset;
   emit(shifted,i);
  }
 }
}
function fan(e,g,a,angleShift=0,wide=false){
 const b=e.secretBrain,hot=b.enraged,base=b.frenzy?(wide?22:19):hot?(wide?17:15):(wide?14:12);
 const n=scaledCount(e,wide?'fanWide':'fan',base),spread=b.frenzy?1.62:hot?1.42:1.22;
 for(let i=0;i<n;i++){const angle=a+angleShift+(i-(n-1)/2)*spread/(n-1);const speed=(b.frenzy?334:hot?308:274)+((i%3)-1)*15;
  shoot(g,e,angle,speed,hot?13:11,hot?'#ff7fa5':'#cfa7fa',7,i%4===0?'needle':'crescent');}
}
function ring(e,g,safeAngle,rotation=0){
 const b=e.secretBrain,hot=b.enraged,n=b.frenzy?42:hot?34:28,speed=b.frenzy?256:hot?234:207;
 boostedRing(e,'ring',n,rotation,safeAngle,.42,(a,i)=>{
  shoot(g,e,a,speed+(i%4)*5,hot?12:10,hot?'#f88ab4':'#c5b1ff',7,'halo');
 });
}
function startDash(e,g,api){
 const b=e.secretBrain,p=g.player,a=Math.atan2(p.y-e.y,p.x-e.x),hot=b.enraged;
 b.dashDirX=Math.cos(a);b.dashDirY=Math.sin(a);
 b.dash=hot?.34:.30;b.dashPause=0;
 b.facing=p.x<e.x?-1:1;e.attack=0;
 api?.wave?.(e.x,e.y,88,'#ffb2ca');api?.sfx?.('rail');
}
function rushShards(e,g){
 const b=e.secretBrain,a=Math.atan2(b.dashDirY,b.dashDirX),hot=b.enraged;
 for(const d of expandedOffsets(e,'rush',[-.68,-.40,-.18,0,.18,.40,.68]))shoot(g,e,a+d,hot?305:253,hot?11:9,'#ffd1a9',6,'blade');
}
function crossCage(e,g,centerX,centerY){
 const p=g.player,hot=e.secretBrain.enraged,cx=centerX??p.x,cy=centerY??p.y;
 const speed=hot?270:230,damage=hot?12:10;
 // Add shots only between existing lanes on the same side of the central gap.
 const lanes=(count,spacing,key)=>{
  const offsets=[];for(let i=-count;i<=count;i++)if(i)offsets.push(i*spacing);
  const extra=scaledCount(e,key,offsets.length)-offsets.length,gaps=[];
  for(let i=0;i<offsets.length-1;i++)if(offsets[i]*offsets[i+1]>0)gaps.push((offsets[i]+offsets[i+1])/2);
  for(let i=0;i<extra;i++)offsets.push(gaps[Math.floor((i+.5)*gaps.length/extra)]);
  return offsets;
 };
 for(const off of lanes(5,43,'crossRows')){
  bullet(g,e,cx-460,cy+off,0,speed,damage,'#d7a4fc',7,3.7,'needle');
  bullet(g,e,cx+460,cy-off,Math.PI,speed,damage,'#d7a4fc',7,3.7,'needle');
 }
 for(const off of lanes(4,54,'crossColumns')){
  bullet(g,e,cx+off,cy-350,Math.PI/2,speed,damage,'#ff9fc1',7,3.7,'needle');
  bullet(g,e,cx-off,cy+350,-Math.PI/2,speed,damage,'#ff9fc1',7,3.7,'needle');
 }
}
function slash(e,g,ang,shift){
 const b=e.secretBrain,hot=b.enraged;
 for(const d of expandedOffsets(e,'slash',[-.15,-.075,0,.075,.15]))shoot(g,e,ang+shift+d,hot?464:410,hot?14:12,'#ffedcc',8,'blade');
 b.slashFlash=.30;b.slashAim=ang+shift;
}
function explodeHazard(e,h,g,api){
 const b=e.secretBrain,p=g.player,distance=Math.hypot(p.x-h.x,p.y-h.y);
 if(distance<h.r+(p.r||20)*.25)api?.hurt?.(b.enraged?17:13,h.x,h.y);
 const shots=scaledCount(e,'hazard',b.enraged?14:11);
 for(let j=0;j<shots;j++){
  const a=j*TAU/shots+b.clock*.11;
  bullet(g,e,h.x,h.y,a,b.enraged?255:214,b.enraged?11:9,'#fda8d6',6,3.6,'ember');
 }
 api?.wave?.(h.x,h.y,h.r*1.4,'#f49bc6');api?.burst?.(h.x,h.y,'#f6adce',12,140);
}
function eclipseCurtain(e,g,aim,layer=0){
 const b=e.secretBrain,n=scaledCount(e,'curtain',b.frenzy?24:b.enraged?20:17),spread=b.frenzy?2.65:2.38;
 for(let i=0;i<n;i++){
  const a=aim+(i-(n-1)/2)*spread/(n-1)+Math.sin(b.clock*2+layer)*.12;
  const speed=(b.frenzy?285:255)+((i+layer)%4)*15;
  shoot(g,e,a,speed,b.enraged?12:10,i%2?'#ff9ddc':'#d3b8ff',7,i%3===0?'needle':'prism');
 }
}
function collapsingHalo(e,g,focusX,focusY,layer=0){
 // A converging circle, with two opposite safe passages; aim is frozen at windup.
 const b=e.secretBrain,n=b.frenzy?38:b.enraged?31:26,rad=440+layer*40;
 const safe=b.aim+layer*.13;
 boostedRing(e,'collapse',n,layer*.10,safe,.39,a=>{
  const x=focusX+Math.cos(a)*rad,y=focusY+Math.sin(a)*rad;
  bullet(g,e,x,y,a+Math.PI,235+layer*20,b.enraged?12:10,'#e2a8ff',7,3.3,'core');
 });
}
function updateScheduled(e,dt,g,api){
 const b=e.secretBrain;
 for(let i=b.events.length-1;i>=0;i--){
  const v=b.events[i];v.time-=dt;if(v.time>0)continue;b.events.splice(i,1);
  if(v.type==='fan')fan(e,g,v.aim,v.shift||0,true);
  else if(v.type==='ring')ring(e,g,v.safe,v.rotation||0);
  else if(v.type==='slash')slash(e,g,v.aim,v.shift||0);
  else if(v.type==='cross'){crossCage(e,g,v.x,v.y);b.crossWarning=null}
  else if(v.type==='curtain')eclipseCurtain(e,g,v.aim,v.layer||0);
  else if(v.type==='collapse')collapsingHalo(e,g,v.x,v.y,v.layer||0);
  else if(v.type==='sigil'){
   b.hazards.push({x:v.x,y:v.y,r:v.r||90,time:v.delay||.9,max:v.delay||.9});
  }
 }
 for(let i=b.hazards.length-1;i>=0;i--){
  const z=b.hazards[i];z.time-=dt;
  if(z.time<=0){b.hazards.splice(i,1);explodeHazard(e,z,g,api)}
 }
}
function release(e,g,api){
 const b=e.secretBrain;
 const a=b.aim,hot=b.enraged,base=b.pattern;
 b.releaseFlash=.38;b.aftershock=.25;
 if(base===0){
  fan(e,g,a,-.12,false);queue(e,'fan',hot?.12:.18,{aim:a,shift:.16});
  queue(e,'fan',b.frenzy?.30:.41,{aim:a,shift:-.05});
 }else if(base===1){
  ring(e,g,a,b.clock*.18);queue(e,'ring',hot?.19:.27,{safe:a+.11,rotation:b.clock*.18+.16});
  queue(e,'ring',hot?.41:.55,{safe:a+.22,rotation:b.clock*.18+.31});
 }else if(base===2){
  // Three short, individually telegraphed rushes, no teleporting.
  b.dashLeft=3;b.dashPause=.23;b.dash=0;
 }else if(base===3){
  slash(e,g,a,-.19);queue(e,'slash',.14,{aim:a,shift:.18});
  queue(e,'slash',hot?.29:.36,{aim:a,shift:0});
 }else if(base===4){
  b.crossWarning={x:b.targetX,y:b.targetY,time:.48,max:.48};
  queue(e,'cross',.48,{x:b.targetX,y:b.targetY});
  if(hot)queue(e,'cross',.80,{x:b.targetX+30,y:b.targetY-24});
 }else if(base===5){
  queue(e,'sigil',.01,{x:b.targetX,y:b.targetY,r:hot?105:94,delay:.86});
  if(hot)queue(e,'sigil',.28,{x:b.targetX+105,y:b.targetY-78,r:85,delay:1.0});
 }else if(base===6){
  eclipseCurtain(e,g,a,0);queue(e,'curtain',.21,{aim:a,layer:1});queue(e,'curtain',.44,{aim:a,layer:2});
  if(b.frenzy)queue(e,'curtain',.65,{aim:a,layer:3});
 }else{
  collapsingHalo(e,g,b.targetX,b.targetY,0);queue(e,'collapse',hot?.25:.34,{x:b.targetX,y:b.targetY,layer:1});
  if(b.frenzy)queue(e,'collapse',.54,{x:b.targetX,y:b.targetY,layer:2});
 }
 api?.wave?.(e.x,e.y,185,hot?'#ff709c':'#d3aaff');
 api?.burst?.(e.x,e.y,hot?'#ffa8c6':'#c6adff',hot?22:16,230);
 api?.sfx?.(base===2||base===3?'rail':'boss');
 b.pattern=(b.pattern+1)%8;
 b.cooldown=((b.frenzy?.82:hot?1.22:1.63)+b.windMax)/BARRAGE_RATE-b.windMax;
}
function setAnim(e,mode,dt){
 const b=e.secretBrain;
 if(b.anim!==mode){b.anim=mode;b.animTimer=0}else b.animTimer+=dt;
}
function step(e,dt,g,api,q='auto'){
 if(!isBoss(e)||!S.active||!S.bosses.includes(e)||e.hp<=0||!g?.player)return;
 const b=e.secretBrain;
 if(S.intro>0){e.speed=0;setAnim(e,'idle',dt);e.attack=Math.max(e.attack||0,.22);return}
 if(!b.enraged&&e.hp<=e.maxHp*.48){
  b.enraged=true;b.phasePulse=2.4;b.cooldown=Math.max(b.cooldown,.9);
  e.secretPhase=2;e.dmg=21;e.col='#ff859f';g.scenePulse=Math.max(g.scenePulse||0,1.05);
  api?.wave?.(e.x,e.y,285,'#ff769c');api?.burst?.(e.x,e.y,'#ffc6dc',28,200);
  api?.toast?.('RUU : ECLIPSE // PHASE II',true);api?.sfx?.('bossBreak');
 }
 if(!b.frenzy&&e.hp<=e.maxHp*.20){
  b.frenzy=true;b.frenzyPulse=3.0;b.cooldown=Math.min(b.cooldown,.7);
  api?.wave?.(e.x,e.y,350,'#ff456e');api?.burst?.(e.x,e.y,'#fff2dc',34,230);
  api?.toast?.('ECLIPSE // LAST LIGHT / FINAL RUSH',true);api?.sfx?.('bossBreak');
 }
 b.facing=g.player.x<e.x?-1:1;
 // Block excessive knockback; keep the secret boss in the arena without teleporting.
 e.pushX*=.16;e.pushY*=.16;
 updateScheduled(e,dt,g,api);
 if(b.dash>0){
  const speed=b.frenzy?475:b.enraged?420:350;
  e.x+=b.dashDirX*speed*dt;e.y+=b.dashDirY*speed*dt;e.speed=0;
  b.dash=Math.max(0,b.dash-dt);
  if(b.dashTrail.length<12)b.dashTrail.push({x:e.x,y:e.y,life:.23});
  if(b.dash<=0){rushShards(e,g);b.dashLeft--;b.dashPause=b.dashLeft>0?.26:0}
  setAnim(e,'run',dt);return;
 }
 if(b.dashPause>0){
  b.dashPause-=dt;e.speed=0;
  if(b.dashPause<=0&&b.dashLeft>0)startDash(e,g,api);
  setAnim(e,b.dash>0?'run':'attack',dt);return;
 }
 if(b.wind>0){
  e.speed=20;b.wind=Math.max(0,b.wind-dt);
  if(b.wind<=0){b.wind=0;release(e,g,api)}
  setAnim(e,'attack',dt);return;
 }
 const p=g.player,dist=Math.hypot(p.x-e.x,p.y-e.y);
 e.speed=dist<95?0:b.frenzy?151:b.enraged?117:96;
 setAnim(e,b.releaseFlash>0?'attack':e.speed===0?'idle':e.speed>125?'run':'walk',dt);
 b.cooldown-=dt;
 if(b.cooldown<=0&&dist<900){
  b.targetX=p.x;b.targetY=p.y;
  b.aim=Math.atan2(b.targetY-e.y,b.targetX-e.x);
  b.windMax=b.frenzy?.46:b.enraged?.64:.80;b.wind=b.windMax;
  api?.sfx?.('shield');
 }
}
function drawGround(ctx,cam,g,q='auto'){
 if(!S.active)return;
 ctx.save();
 for(const e of S.screens){
  if(e.hp<=0||e.secretDeathCounted||e.secretScreenIntro<=0)continue;
  const x=e.x-cam.x,y=e.y-cam.y;if(x<-90||x>1290||y<-90||y>765)continue;
  const progress=clamp(1-e.secretScreenIntro/SCREEN_ARRIVAL,0,1),radius=e.r+16+(1-progress)*16;
  ctx.globalAlpha=.25+.45*progress;ctx.strokeStyle='#ffd394';ctx.fillStyle='#b46c3a22';ctx.lineWidth=2;
  ctx.setLineDash([6,6]);ctx.beginPath();ctx.arc(x,y,radius,0,TAU);ctx.fill();ctx.stroke();ctx.setLineDash([]);
  ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,e.r+10,0,TAU);ctx.stroke();
 }
 ctx.restore();
 for(const e of S.bosses)if(e.hp>0&&!e.secretDeathCounted)drawBossGround(ctx,e,cam,g,q);
}
function drawBossGround(ctx,e,cam,g,q){
 const b=e.secretBrain,x=e.x-cam.x,y=e.y-cam.y;
 ctx.save();ctx.globalAlpha=.22+.13*Math.sin(b.clock*3);
 ctx.strokeStyle=b.frenzy?'#ff4a77':b.enraged?'#ff728e':'#d1b7ee';ctx.lineWidth=q==='lite'?2:3;
 ctx.beginPath();ctx.ellipse(x,y+63,86,21,0,0,TAU);ctx.stroke();
 if(q!=='lite'){
  ctx.strokeStyle=b.frenzy?'#ff597c':'#bc9ee8';ctx.globalAlpha=.16;ctx.lineWidth=1.5;
  for(let i=0;i<5;i++){const a=(b.clock*(i%2?-.65:.8)+i*1.4)%TAU;ctx.beginPath();ctx.arc(x,y,90+i*17,a,a+(i%2?1.75:2.35));ctx.stroke()}
  ctx.globalAlpha=.25;ctx.strokeStyle=b.frenzy?'#ff89a9':'#ffe4fa';ctx.lineWidth=2.2;
  for(let i=0;i<8;i++){const a=i*TAU/8+b.clock*.17;ctx.beginPath();ctx.moveTo(x+Math.cos(a)*84,y+Math.sin(a)*84);ctx.lineTo(x+Math.cos(a)*104,y+Math.sin(a)*104);ctx.stroke()}
 }
 for(const h of b.hazards){
  const hx=h.x-cam.x,hy=h.y-cam.y,t=clamp(1-h.time/h.max,0,1);
  ctx.globalAlpha=.22+.40*t;ctx.strokeStyle='#ff84b8';ctx.lineWidth=3;
  ctx.fillStyle='#9f20522b';ctx.beginPath();ctx.arc(hx,hy,h.r,0,TAU);ctx.fill();ctx.stroke();
  ctx.lineWidth=1.8;ctx.strokeStyle='#fff0f5';ctx.beginPath();ctx.arc(hx,hy,h.r*(.24+.76*t),0,TAU);ctx.stroke();
 }
 if(b.wind>0&&(b.pattern===6||b.pattern===7)){
  const p=b.pattern===7?{x:b.targetX,y:b.targetY}:e;ctx.globalAlpha=.16+.24*(1-b.wind/Math.max(.01,b.windMax));
  ctx.strokeStyle=b.frenzy?'#ff8baa':'#e5b6ff';ctx.lineWidth=3;
  ctx.setLineDash([10,9]);ctx.beginPath();ctx.arc(p.x-cam.x,p.y-cam.y,b.pattern===7?420:220,0,TAU);ctx.stroke();ctx.setLineDash([]);
 }
 if(b.crossWarning){
  const v=b.crossWarning,cx=v.x-cam.x,cy=v.y-cam.y;
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
 const b=e.secretBrain;
 if(!b)return;
 const x=e.x-cam.x,y=e.y-cam.y;
 if(x<-260||x>1460||y<-250||y>930)return;
 const bob=Math.sin(b.clock*2.8)*1.7,size=228,rad=b.frenzy?'#ff4f83':b.enraged?'#ff6b9c':'#d5b7e9';
 ctx.save();ctx.fillStyle='#04040aa8';ctx.beginPath();ctx.ellipse(x,y+82,57,12,0,0,TAU);ctx.fill();
 ctx.strokeStyle=rad;ctx.globalAlpha=.55;ctx.lineWidth=2;
 ctx.beginPath();ctx.arc(x,y-10,83,b.clock*.63,b.clock*.63+Math.PI*1.58);ctx.stroke();ctx.restore();
 if(ATLAS.complete&&ATLAS.naturalWidth>=ATLAS_CELL*ATLAS_COLS){
  const mode=b.anim,frame=mode==='attack'&&b.wind>0?
    Math.min(3,Math.floor((1-b.wind/Math.max(.01,b.windMax))*4)):
    mode==='attack'&&b.releaseFlash>0?3:Math.floor(b.animTimer*(mode==='run'?10:mode==='walk'?6:mode==='idle'?3.5:6))%4;
  const mirror=b.facing<0;
  if(q!=='lite'&&b.dashTrail.length){
   for(let i=0;i<b.dashTrail.length;i+=3){const a=b.dashTrail[i],f=clamp(a.life/.23,0,1);
    drawSprite(ctx,'run',frame,a.x-cam.x,a.y-cam.y+bob,size,f*.24,mirror,'brightness(1.4)');}
  }
  if(q==='high'){ctx.save();ctx.shadowColor=rad;ctx.shadowBlur=15;ctx.fillStyle=rad;ctx.globalAlpha=.24;ctx.beginPath();ctx.arc(x,y-20,35,0,TAU);ctx.fill();ctx.restore()}
  drawSprite(ctx,mode,frame,x,y+bob,size,1,mirror,e.flash>0?'brightness(1.85) saturate(.8)':'none');
 }else if(ART.complete&&ART.naturalWidth>0&&ART.naturalHeight>0){
  const height=228,width=height*ART.naturalWidth/ART.naturalHeight;
  ctx.save();ctx.translate(x,y+bob);if(b.facing<0)ctx.scale(-1,1);
  if(e.flash>0)ctx.filter='brightness(1.85)';
  ctx.drawImage(ART,-width*.5,-height*.62,width,height);ctx.restore();
 }else{ctx.save();ctx.fillStyle='#2b2534';ctx.beginPath();ctx.ellipse(x,y-10,48,90,0,0,TAU);ctx.fill();ctx.restore()}
 if(b.wind>0||b.dashPause>0){
  const t=b.wind>0?clamp(1-b.wind/Math.max(.01,b.windMax),0,1):clamp(1-b.dashPause/.26,0,1);
  const a=b.dashPause>0?Math.atan2(b.dashDirY,b.dashDirX)||b.aim:b.aim;
  ctx.save();ctx.lineWidth=b.pattern===3?3:2;ctx.strokeStyle=b.frenzy?'#ff6d91':'#ffdec5';ctx.globalAlpha=.36+.45*t;
  ctx.setLineDash([12,8]);
  for(const offset of b.wind>0&&b.pattern===3?[-.16,0,.16]:[0]){
   ctx.beginPath();ctx.moveTo(x,y-25);ctx.lineTo(x+Math.cos(a+offset)*670,y-25+Math.sin(a+offset)*670);ctx.stroke();
  }ctx.restore();
 }
 if(b.releaseFlash>0){const alpha=clamp(b.releaseFlash/.38,0,1);ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.31*alpha;ctx.strokeStyle=b.frenzy?'#ff7699':'#f5d7ff';ctx.lineWidth=6;for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(x,y,58+i*27,0,TAU);ctx.stroke()}ctx.restore()}
 if(b.slashFlash>0){
  ctx.save();ctx.globalAlpha=clamp(b.slashFlash/.30,0,1)*.63;ctx.lineWidth=q==='lite'?4:8;
  ctx.strokeStyle='#ffe5f2';ctx.beginPath();ctx.moveTo(x,y-20);
  ctx.lineTo(x+Math.cos(b.slashAim)*510,y-20+Math.sin(b.slashAim)*510);ctx.stroke();ctx.restore();
 }
 ctx.save();ctx.fillStyle='#090916e3';ctx.fillRect(x-58,y-167,116,25);
 ctx.strokeStyle=rad;ctx.lineWidth=1;ctx.strokeRect(x-58,y-167,116,25);
 ctx.fillStyle=rad;ctx.textAlign='center';ctx.font='900 10px ui-monospace,monospace';
 ctx.fillText('ECLIPSE / '+(b.index+1)+(b.frenzy?' LAST LIGHT':b.enraged?' II':' I'),x,y-156,108);
 ctx.fillStyle='#291425';ctx.fillRect(x-51,y-150,102,4);
 ctx.fillStyle=rad;ctx.fillRect(x-51,y-150,102*clamp(e.hp/Math.max(1,e.maxHp),0,1),4);ctx.restore();
}
function drawScreen(ctx,W,H,g,q='auto'){
 if(!S.active)return;
 let frenzy=false,phasePulse=0,frenzyPulse=0;
 for(const e of S.bosses){if(e.hp<=0||e.secretDeathCounted)continue;const b=e.secretBrain;
  frenzy=frenzy||b.frenzy;phasePulse=Math.max(phasePulse,b.phasePulse);frenzyPulse=Math.max(frenzyPulse,b.frenzyPulse)}
 // Composite each screen-wide effect once, even if all three enter LAST LIGHT.
 if(frenzy&&S.intro<=0){
  ctx.save();ctx.globalAlpha=.12+.045*Math.sin(S.clock*11);ctx.fillStyle='#9c1636';ctx.fillRect(0,0,W,H);
  ctx.globalAlpha=.44;ctx.strokeStyle='#fa507f';ctx.lineWidth=q==='lite'?4:8;ctx.strokeRect(4,4,W-8,H-8);ctx.restore();
 }
 if(phasePulse>0||frenzyPulse>0){
  const t=Math.max(phasePulse/2.4,frenzyPulse/3);
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
 ctx.fillText('OPERATION: TAKAMIYA',W*.105,H*.34);
 ctx.fillStyle='#fff5ea';ctx.font='italic 900 54px Impact,Arial,sans-serif';ctx.fillText('RUU : ECLIPSE ×3',W*.105,H*.475,W*.6);
 ctx.font='900 23px Yu Gothic,Meiryo,sans-serif';ctx.fillText('DEVORA増援×3 / 敵ASTRAEA×1 / 雑魚2波',W*.105,H*.565,W*.68);
 ctx.fillStyle='#f0b0c2';ctx.font='800 13px ui-monospace,monospace';
 ctx.fillText('HIDDEN SIGNAL // HP ≥ 50% / DEFEAT ALL 7 BOSSES',W*.105,H*.64);
 ctx.strokeStyle='#bfa6d2';ctx.lineWidth=2;ctx.strokeRect(W*.065,H*.16,W*.87,H*.65);
 ctx.restore();
}
window.RUU_SECRET_BOSS={VERSION:'1.31.0',ART,ATLAS,ECLIPSE_TOTAL,REINFORCEMENT_TOTAL,REINFORCEMENT_DELAY,PROJECTILE_CAP,REINFORCEMENT_RESERVE,
 ASTRAEA_TOTAL,ASTRAEA_DELAY,SCREEN_WAVE_TOTAL,SCREEN_WAVE_SIZE,SCREEN_ARRIVAL,
 drawBullet,reset,reveal,tick,step,onKill,status,isActive,isIntro,isBoss,isEncounterEnemy,canEmitReinforcement,drawGround,drawCharacter,drawScreen};
})();
