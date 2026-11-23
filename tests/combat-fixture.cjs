/* Shared VM fixture: execute the shipped combat code without a browser.
   Only visual/audio boundaries are stubbed; private accessors are test-only. */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const root=process.argv[2]||path.resolve(__dirname,'..');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const files=Object.fromEntries(['devora-true-end.js','enemy-astraea.js','secret-ruu-boss.js','boss-rewards.js']
  .map(name=>[name,fs.readFileSync(path.join(root,name),'utf8')]));
const TAU=Math.PI*2;

function section(text,start,end){
  const a=text.indexOf(start),b=text.indexOf(end,a+start.length);
  assert.ok(a>=0&&b>a,'Missing production section: '+start);
  return text.slice(a,b);
}
const combatCode=[
  section(index,'function resetGame()','function startGame('),
  section(index,'function endGame(win)','function toast('),
  section(index,'function makeEnemy(','function spawnEnemy('),
  section(index,'function killEnemy(','function damagePlayer('),
  section(index,'function update(dt)','// ===== v1.5.2 JACKPOT MODE:')
].join('\n');
const patternNames=['fan','ring','rushShards','crossCage','slash','explodeHazard','eclipseCurtain','collapsingHalo'];
const secretExport='window.RUU_SECRET_BOSS=';
assert.ok(files['secret-ruu-boss.js'].includes(secretExport),'Missing production secret-boss export');
const instrumentedSecret=files['secret-ruu-boss.js'].replace(secretExport,
  'window.__takamiyaPatterns={'+patternNames.join(',')+'};\n'+secretExport);

function fixture(options={}){
  const effects={achievements:[],sounds:[],toasts:[],texts:[],ending:[],saves:0,preloads:0};
  const images=[];
  const noop=()=>{};
  const node=()=>({disabled:false,hidden:false,style:{},classList:{add:noop,remove:noop}});
  const box={
    console,window:{RUU_EXPANSION:{comboMilestone:()=>false,tick:noop,fusionStep:noop}},
    Image:class{constructor(){this.complete=false;this.naturalWidth=0;this.naturalHeight=0;images.push(this);}},
    state:'playing',g:null,keys:new Set(),joy:{active:false},uiTimer:0,
    ANIM_COLS:4,WIN_TIME:100,BARRAGE_RATE:1.20,TAU,fxPreset:options.quality||'auto',fxMax:false,
    clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),
    norm:(x,y)=>{const d=Math.hypot(x,y)||1;return {x:x/d,y:y/d};},
    distance:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),lerp:(a,b,t)=>a+(b-a)*t,
    rand:(a,b)=>(a+b)/2,ri:(a,b)=>Math.floor((a+b)/2),
    ui:{pause:node(),bossbar:node()},loadoutButton:node(),quickLoadoutButton:node(),
    musicIndicator:node(),musicMeter:node(),deathSequenceDone:false,
    shockwave:noop,burst:noop,floatText:(x,y,text)=>effects.texts.push(text),hitImpact:noop,sparkBurst:noop,spawnGem:noop,
    gainDrive:noop,gainFinisher:noop,startBossBreak:noop,damagePlayer:noop,
    startDeathSequence:()=>{box.state='dying';},addMuzzle:noop,updateCrystals:noop,
    castSonic:noop,castPrism:noop,castShards:noop,castSatellite:noop,castRift:noop,castFireworks:noop,castCross:noop,
    updateAutoMix:noop,updateV06Rewards:noop,advanceFx:noop,attackPulse:noop,strikeLightning:noop,
    updateNewWeapons:noop,applyNova:noop,updateFinisher:noop,updateJackpot:noop,applyOrbit:noop,
    expToLevel:noop,updateHUD:noop,updateMusicUI:noop,updateMusic:noop,pauseAllMusic:noop,
    spawnEnemy:noop,spawnElite:noop,spawnBoss:noop,
    sfx:name=>effects.sounds.push(name),toast:message=>effects.toasts.push(message),
    awardAchievement:id=>effects.achievements.push(id),
    preloadCompleteEndingArt:()=>effects.preloads++,saveBest:()=>effects.saves++,
    startEndingCinema(preview){effects.ending.push({preview,complete:box.g.secretBossCleared});box.state='ending';}
  };
  if(options.canvasProbe)box.document=options.canvasProbe.document;
  vm.createContext(box);
  for(const name of ['devora-true-end.js','enemy-astraea.js','secret-ruu-boss.js','boss-rewards.js'])
    vm.runInContext(name==='secret-ruu-boss.js'?instrumentedSecret:files[name],box,{filename:name});
  vm.runInContext(combatCode,box,{filename:'index-combat.js'});
  box.resetGame();
  const prepare=()=>{
    Object.assign(box.g,{mode:options.mode||'normal',time:180,level:24,boss1:true,boss2:true,
      finalBossDead:true,elite1:true,elite2:true,mutationAlert:true,hexAnnounced:true,phase:3,
      spawnT:1000,shotT:1000,damageTaken:1});
    Object.assign(box.g.player,{maxHp:100,hp:80});
    box.state='playing';
  };
  prepare();
  const api={spawn:box.makeEnemy,wave:box.shockwave,burst:box.burst,sound:box.sfx,sfx:box.sfx,
    toast:box.toast,text:box.floatText,hurt:(...args)=>box.damagePlayer(...args)};
  const f={box,effects,api,images,
    get g(){return box.g;},secret:box.window.RUU_SECRET_BOSS,trueEnd:box.window.RUU_TRUE_END,
    astraea:box.window.RUU_ENEMY_ASTRAEA,
    rewards:box.window.RUU_BOSS_REWARDS,patterns:box.window.__takamiyaPatterns,
    status:()=>box.window.RUU_SECRET_BOSS.status(box.g),
    eclipses:()=>box.g.enemies.filter(e=>e.secretRuu),
    escorts:()=>box.g.enemies.filter(e=>e.secretReinforcement),
    hostileAstraea:()=>box.g.enemies.filter(e=>e.enemyAstraea),
    screens:()=>box.g.enemies.filter(e=>e.secretScreen),
    countAchievement:id=>effects.achievements.filter(value=>value===id).length,
    reset(){box.resetGame();prepare();},
    run:code=>vm.runInContext(code,box),
    loadWeapons(){vm.runInContext(section(index,'function fireBullet(','function drawWeaponGround('),box);},
    usePlayerDamage(){vm.runInContext(section(index,'function damagePlayer(','function expToLevel('),box);},
    loadAlly(){const source=fs.readFileSync(path.join(root,'astral-companion.js'),'utf8');
      vm.runInContext(source.replace('window.RUU_COMPANION=',
        'window.__companionTest={hitAssist};\nwindow.RUU_COMPANION='),box);
      return box.window.__companionTest;},
    update(dt){box.update(dt);},
    advance(seconds,dt=.05){for(let left=seconds;left>1e-8;left-=dt)box.update(Math.min(dt,left));},
    kill(e){e.hp=0;box.killEnemy(e);},
    hit(e,damage){return box.applyDamage(e,damage,0,0,'#fff');},
    reveal(){box.g.trueEndCleared=true;box.g.trueEndPending=false;return f.secret.reveal(box.g,api);},
    originalClear(hp=50,rare=false){
      assert.equal(f.trueEnd.queue(box.g,{kind:'final'},()=>rare?0:.5),true);
      assert.equal(f.trueEnd.spawnQueued(box.g,api),true);
      const cores=box.g.enemies.filter(e=>e.trueDevora);
      assert.equal(cores.length,rare?5:3);
      f.trueEnd.tick(3,box.g);
      for(const e of cores.slice(0,-1))f.hit(e,e.maxHp*10);
      box.g.player.hp=hp;
      f.hit(cores.at(-1),cores.at(-1).maxHp*10);
      return cores;
    }
  };
  return f;
}

function recordingCanvas(){
  const calls={gradients:0,rects:[],images:[],texts:[]};let serial=0;
  function context(tag){
    const ctx={canvas:{width:1200,height:675},globalAlpha:1,
      createLinearGradient(){calls.gradients++;return {addColorStop(){}};},
      createRadialGradient(){calls.gradients++;return {addColorStop(){}};},
      fillRect(...args){calls.rects.push({tag,args});},
      drawImage(...args){calls.images.push({tag,args});},
      fillText(...args){calls.texts.push({tag,args});},
      measureText(text){return {width:String(text).length*8};},getLineDash:()=>[]};
    for(const method of ['save','restore','translate','rotate','scale','setTransform','resetTransform',
      'beginPath','closePath','arc','arcTo','ellipse','moveTo','lineTo','bezierCurveTo','quadraticCurveTo',
      'rect','roundRect','clip','stroke','fill','strokeRect','clearRect','setLineDash','strokeText'])ctx[method]=()=>{};
    return ctx;
  }
  return {calls,context,document:{createElement(name){
    assert.equal(name,'canvas','Rendering smoke expects only offscreen canvas elements');
    const c=context('cache-'+(++serial)),canvas={width:0,height:0,getContext:()=>c};c.canvas=canvas;return canvas;
  }}};
}

module.exports={root,index,files,TAU,section,fixture,recordingCanvas};
