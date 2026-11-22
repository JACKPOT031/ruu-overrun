/* RUU//OVERRUN v1.14.0 — SURVIVAL TRIALS
   30/60/90s DEVORA INVASION, LAST STAND, local-only challenges. */
(()=>{
'use strict';
const TAU=Math.PI*2;
const DB='RUU_TRIAL_RECORDS_V1',TITLE='RUU_TRIAL_TITLE_V1';
const MISSIONS=[
{id:'untouched',name:'UNTOUCHED',jp:'無傷の生還',title:'無傷の生還者',icon:'✧',desc:'HPダメージ0で100秒生存・最終ボス撃破。シールド吸収は可。'},
{id:'no_jackpot',name:'ZERO LUCK',jp:'運命への反抗',title:'運命に頼らぬ者',icon:'Ø',desc:'JACKPOT MODEを封印して100秒生存・最終ボス撃破。'},
{id:'one_weapon',name:'SINGLE BARREL',jp:'一条の光',title:'一条の光',icon:'Ⅰ',desc:'零式ネオン・バラージ以外の武器、進化、融合、JACKPOTを封印してクリア。'}
];
const WAVES=[
{at:30,num:10,goal:7,limit:17,interval:.40,name:'RUST SWARM',color:'#eabb85',score:1600,xp:30,drive:10,finisher:5,kinds:['runner','wisp','runner','wisp','brute']},
{at:60,num:13,goal:10,limit:19,interval:.34,name:'IRON SIEGE',color:'#c3a8ff',score:3200,xp:48,drive:18,finisher:12,kinds:['brute','caster','runner','brute','wisp']},
{at:90,num:16,goal:12,limit:20,interval:.29,name:'NULL ONSLAUGHT',color:'#ff8798',score:5000,xp:65,drive:24,finisher:20,kinds:['hex','caster','runner','brute','hex']}
];
function load(){
 try{
  const v=JSON.parse(localStorage.getItem(DB)||'{}'),out={};
  if(!v||typeof v!=='object'||Array.isArray(v))return out;
  for(const m of MISSIONS){const a=v[m.id];if(Number.isSafeInteger(a?.best)&&a.best>=0&&a.clears>0)out[m.id]={best:a.best,clears:Math.min(9999,Math.floor(a.clears))}}
  return out;
 }catch{return{}}
}
let equipped='';try{const id=localStorage.getItem(TITLE);if(MISSIONS.some(x=>x.id===id)&&load()[id])equipped=id}catch{}
let trial=null,nextWave=0,wave=null,banner=null,danger=false,beat=0,flash=0;
function reset(){trial=null;nextWave=0;wave=null;banner=null;danger=false;beat=0;flash=0}
function start(g,id=''){reset();if(g?.mode!=='challenge'||!MISSIONS.some(m=>m.id===id))return;g.challengeId=id;trial={id,failed:false,reason:'',success:false,done:false}}
function status(){const rec=load();return MISSIONS.map(m=>({...m,best:rec[m.id]?.best||0,clears:rec[m.id]?.clears||0,cleared:!!rec[m.id],equipped:equipped===m.id}))}
function selectedTitle(){return MISSIONS.find(m=>m.id===equipped&&load()[m.id])?.title||''}
function selectTitle(id=''){if(id&&!MISSIONS.some(m=>m.id===id&&load()[m.id]))return false;equipped=id;try{localStorage.setItem(TITLE,id)}catch{}return true}
function currentInfo(g){const m=MISSIONS.find(m=>m.id===g?.challengeId);return m?{...m,success:!!trial?.success,failed:!!trial?.failed,reason:trial?.reason||''}:null}
function allowJackpot(g){return !(g?.mode==='challenge'&&['no_jackpot','one_weapon'].includes(g.challengeId))}
function allowUpgrade(g,u){return g?.mode!=='challenge'||g.challengeId!=='one_weapon'||(u&&((u.type==='WEAPON'&&u.id==='pulse')||!['WEAPON','EVOLUTION','FUSION','JACKPOT_MODE'].includes(u.type)))}
function onDamage(g,hpLoss){if(g?.mode==='challenge'&&g.challengeId==='untouched'&&hpLoss>0&&trial){trial.failed=true;trial.reason='HPダメージを受けた'}}
function complete(g,win){
 if(g?.mode!=='challenge'||!trial)return null;
 if(!trial.done){
  trial.done=true;trial.success=!!win&&!trial.failed&&g.time>=100&&g.finalBossDead===true;
  if(trial.success){const a=load(),p=a[trial.id];a[trial.id]={best:Math.max(p?.best||0,Math.max(0,Math.floor(g.score))),clears:Math.min(9999,(p?.clears||0)+1)};try{localStorage.setItem(DB,JSON.stringify(a))}catch{}}
  if(!trial.success&&!trial.reason)trial.reason=win?'条件未達成':'クリア失敗';
 }
 return{success:trial.success,id:trial.id,reason:trial.reason,name:currentInfo(g)?.name||''};
}
function onKill(e){if(wave&&e?.invasionIndex===wave.id)wave.kills++}
function beginWave(g,api,id){
 const cfg=WAVES[id];
 wave={id,cfg,spawned:0,kills:0,clock:0,end:g.time+cfg.limit};
 banner={name:'DEVORA INVASION // '+cfg.name,col:cfg.color,life:2.5};
 api?.toast?.('DEVORA INVASION // '+cfg.name,true);api?.sound?.('boss');api?.wave?.(g.player.x,g.player.y,200,cfg.color);
}
function spawnWaveMob(g,api){
 const w=wave,c=w.cfg,i=w.spawned;
 if(i>=c.num||!api?.spawn)return;
 const ang=TAU*i/c.num+w.id*.2,rad=405+(i%3)*44;
 const e=api.spawn(c.kinds[i%c.kinds.length],g.player.x+Math.cos(ang)*rad,g.player.y+Math.sin(ang)*rad,1.1);
 if(e){e.invasionIndex=w.id;e.invasionMarker=true}
 w.spawned++;
}
function finishWave(g,api,won){
 if(!wave)return;const c=wave.cfg;
 if(won){
  const pilotBonus=window.RUU_PILOTS?.onInvasionRepelled?.(g,c.score)||0;
  const total=c.score+pilotBonus;
  g.score+=total;g.xp+=c.xp;api?.gainDrive?.(c.drive);api?.gainFinisher?.(c.finisher);
  api?.wave?.(g.player.x,g.player.y,240,c.color);api?.sound?.('victory');api?.toast?.('INVASION REPELLED // SCORE +'+total,true);
  banner={name:'INVASION REPELLED / +'+total,col:'#a5ffdd',life:2.3};
 }else banner={name:'INVASION BREACHED / NO BONUS',col:'#ff859c',life:1.75};
 wave=null;
}
function tick(dt,g,api){
 if(!g?.player||dt<=0)return;
 if(banner)banner.life=Math.max(0,banner.life-dt);
 flash=Math.max(0,flash-dt*.85);
 const ratio=g.player.hp/Math.max(g.player.maxHp,1);
 if(!danger&&ratio>0&&ratio<=.25){danger=true;beat=.01;flash=1;api?.toast?.('LAST STAND // CRITICAL HP',true);api?.sound?.('hurt')}
 else if(danger&&(ratio>.31||ratio<=0)){danger=false;beat=0}
 if(danger){beat-=dt;if(beat<=0){beat=.87;flash=.5;api?.sound?.('heartbeat')}}
 if(!wave&&nextWave<WAVES.length&&g.time>=WAVES[nextWave].at)beginWave(g,api,nextWave++);
 if(wave){
  if(wave.kills>=wave.cfg.goal)finishWave(g,api,true);
  else if(g.time>=wave.end)finishWave(g,api,false);
  else{wave.clock-=dt;if(wave.clock<=0&&wave.spawned<wave.cfg.num){spawnWaveMob(g,api);wave.clock=wave.cfg.interval}}
 }
}
function drawScreen(ctx,W,H,g,q='auto'){
 if(!g?.player)return;
 if(danger){
  const pulse=(Math.sin(g.time*8)+1)*.5;
  ctx.save();ctx.strokeStyle='#ff486d';ctx.lineWidth=q==='lite'?12:21;ctx.globalAlpha=.15+pulse*.13;
  ctx.strokeRect(0,0,W,H);
  const grd=ctx.createLinearGradient(0,0,W,0);grd.addColorStop(0,'rgba(232,34,70,.52)');grd.addColorStop(.17,'rgba(232,34,70,0)');grd.addColorStop(.83,'rgba(232,34,70,0)');grd.addColorStop(1,'rgba(232,34,70,.52)');
  ctx.fillStyle=grd;ctx.fillRect(0,0,W,H);
  ctx.globalAlpha=.78+.2*pulse;ctx.font='900 14px ui-monospace,Consolas,monospace';ctx.textAlign='center';ctx.fillStyle='#ff9ab0';
  ctx.fillText('! LAST STAND // CRITICAL HP !',W/2,H*.92);ctx.restore();
 }
 if(wave||banner?.life>0){
  const cfg=wave?.cfg||WAVES[Math.max(0,nextWave-1)];
  ctx.save();ctx.globalAlpha=wave?.88:Math.min(.9,banner.life/1.5);
  ctx.fillStyle='#111223ed';ctx.fillRect(W*.25,H*.11,W*.5,59);
  ctx.strokeStyle=banner?.col||cfg.color;ctx.lineWidth=2;ctx.strokeRect(W*.25,H*.11,W*.5,59);
  ctx.font='900 16px ui-monospace,Consolas,monospace';ctx.textAlign='center';ctx.fillStyle='#fff3e6';
  ctx.fillText(banner?.life>0?banner.name:'DEVORA INVASION // '+cfg.name,W/2,H*.11+24);
  ctx.font='800 11px ui-monospace,Consolas,monospace';ctx.fillStyle='#e3cce0';
  ctx.fillText(wave?'KILLS '+wave.kills+'/'+cfg.goal+' / '+Math.ceil(Math.max(0,wave.end-g.time))+'s':'SURVIVAL / BONUS PROTOCOL',W/2,H*.11+44);
  ctx.restore();
 }
 const mission=currentInfo(g);
 if(g.mode==='challenge'&&mission){ctx.save();ctx.textAlign='center';ctx.font='800 11px ui-monospace,Consolas,monospace';ctx.fillStyle=mission.failed?'#ff879a':'#e6cfae';ctx.fillText('TRIAL // '+mission.name+(mission.failed?' / FAILED':''),W/2,H*.062);ctx.restore()}
}
window.RUU_OPERATIONS={VERSION:'1.15.0',reset,start,status,selectedTitle,selectTitle,currentInfo,allowJackpot,allowUpgrade,onDamage,complete,onKill,tick,drawScreen};
})();
