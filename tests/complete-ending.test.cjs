/* Execute the production ending, result gate, and secret-kill integration. */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const root=process.argv[2]||path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'index.html'),'utf8');
const publicSource=fs.readFileSync(path.join(root,'public-features.js'),'utf8');
const COMPLETE='assets/ending_complete_clear.png',NORMAL='assets/ending_11.webp';

function section(text,start,end){
  const a=text.indexOf(start),b=text.indexOf(end,a+start.length);
  assert.ok(a>=0&&b>a,'Missing production section: '+start);
  return text.slice(a,b);
}
const endingCode=section(source,'const ENDING_UNLOCK_KEY=','function showStart()');
const snapshotCode=section(source,'window.RUU_PUBLIC_SNAPSHOT =','window.addEventListener');
const resultCode=section(publicSource,'function result()','function shareUrl()');
const killCode=section(source,'function killEnemy(','function applyDamage(');

function fixture(options={}){
  let clock=1000,menuHTML='',titleVisits=0;
  const assignments=[],writes=[],nodes=new Map(),history=options.history||[];
  const storage=new Map(options.normalUnlocked?[['RUU_OVERRUN_ENDING_UNLOCK','1']]:[]);
  class Element{
    constructor(id=''){
      this.id=id;this.hidden=true;this.textContent='';this.innerHTML='';this.children=[];
      this.attributes=new Map();this.listeners=new Map();this.complete=false;this.naturalWidth=0;
      this.style={setProperty(name,value){this[name]=value}};
      const classes=new Set();
      this.classList={add:(...values)=>values.forEach(x=>classes.add(x)),remove:(...values)=>values.forEach(x=>classes.delete(x)),
        contains:value=>classes.has(value),toggle(value,force){const on=force===undefined?!classes.has(value):!!force;if(on)classes.add(value);else classes.delete(value);return on}};
    }
    setAttribute(name,value){this.attributes.set(name,String(value));}
    getAttribute(name){return this.attributes.get(name)??null;}
    removeAttribute(name){this.attributes.delete(name);}
    set src(value){this.setAttribute('src',value);assignments.push({id:this.id,url:value});}
    get src(){return this.getAttribute('src')||'';}
    set href(value){this.setAttribute('href',value);}
    get href(){return this.getAttribute('href')||'';}
    appendChild(child){this.children.push(child);return child;}
    addEventListener(type,listener){const list=this.listeners.get(type)||[];list.push(listener);this.listeners.set(type,list);}
    dispatch(type){for(const listener of this.listeners.get(type)||[])listener({type});}
    click(){this.onclick?.();}
    getBoundingClientRect(){return {left:0,width:100};}
  }
  function element(id){if(!nodes.has(id))nodes.set(id,new Element(id));return nodes.get(id);}
  const audio=new Element('audio');
  Object.assign(audio,{duration:205.139,currentTime:151.687,paused:true,muted:false,pause(){this.paused=true;}});
  const secret=!!options.secret;
  const g={mode:options.mode||'normal',time:180,kills:456,level:24,score:123456,rareFinds:3,crates:4,mythicFinds:2,maxCombo:99,
    combo:1,comboMilestones:0,scenePulse:0,shake:0,flash:0,enemies:[],ebullets:[],shards:[],chests:[],
    trueEndCleared:true,trueEndCount:3,secretBossCleared:secret,secretBossPending:false,
    player:{x:0,y:0,hp:80,maxHp:100,inv:0},
    bossProgress:{devora:true,nullEmperor:true,trueKilled:3,trueTotal:3,trueCleared:true,eclipseSeen:secret,eclipseCleared:secret}};
  const noop=()=>{};
  const box={
    state:options.phase||'playing',g:options.noGame?null:g,performance:{now:()=>clock},console,
    window:{RUU_LOCAL_DEV_MODE:!!options.dev,RUU_EXPANSION:{
      status(){if(options.achievementThrows)throw Error('Achievement storage unavailable');return history;},comboMilestone:()=>false}},
    document:{getElementById:element,createElement:()=>new Element(),createDocumentFragment:()=>new Element()},
    Image:class extends Element{constructor(){super('preload');}},
    localStorage:{getItem(key){if(options.storageThrows)throw Error('Storage unavailable');return storage.get(key)||null;},
      setItem(key,value){if(options.storageThrows)throw Error('Storage unavailable');storage.set(key,String(value));writes.push({key,value:String(value)});}},
    musicEls:[audio],ENDING_TRACK_INDEX:0,soundOn:options.soundOn!==false,musicStarted:false,
    ui:{pause:element('pause'),hud:element('hud'),bossbar:element('bossbar'),toasts:element('toasts'),mute:element('mute')},
    bossAlert:element('bossAlert'),musicIndicator:element('musicIndicator'),musicMeter:element('musicMeter'),
    pauseAllMusic(){audio.paused=true;},playEndingSong(){if(!options.audioBlocked&&box.soundOn)audio.paused=false;},
    ensureTrackLoaded:()=>audio,cancelPendingMusic:noop,hideOverlay:noop,
    formatTime:t=>Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0'),equippedTitle:()=>'',startGame:noop,
    setOverlay(html){menuHTML=html;for(const match of html.matchAll(/\bid="([^"]+)"/g))nodes.set(match[1],new Element(match[1]));},
    showStart(){box.state='start';menuHTML='';titleVisits++;},
    fxPreset:'auto',fxMax:false,makeEnemy:noop,shockwave:noop,burst:noop,sfx:noop,toast:noop,floatText:noop,
    gainDrive:noop,gainFinisher:noop,hitImpact:noop,sparkBurst:noop,spawnGem:noop,ri:()=>5,rand:()=>0,startBossBreak:noop,
    awardAchievement(id){if(!options.dev&&!history.some(a=>a.id===id))history.push({id,unlocked:true});}
  };
  vm.createContext(box);
  vm.runInContext(endingCode+'\n'+snapshotCode+'\n'+resultCode+'\n'+killCode,box);
  const run=code=>vm.runInContext(code,box);
  return {box,run,element,audio,assignments,writes,storage,history,
    ending:()=>run('endingState'),unlocked:()=>run('completeEndingUnlocked()'),
    cardResult:()=>JSON.parse(JSON.stringify(run('result()'))),html:()=>menuHTML,titleVisits:()=>titleVisits,
    advance(ms){clock+=ms;},completeAssignments:()=>assignments.filter(a=>a.url===COMPLETE),
    loadSecretBoss(){vm.runInContext(fs.readFileSync(path.join(root,'secret-ruu-boss.js'),'utf8'),box);}};
}

const tests=[];
function test(name,fn){try{fn();tests.push({name,status:'PASS'});}catch(error){tests.push({name,status:'FAIL',reason:error.stack});}}
function historicalClear(){return [{id:'eclipse_clear',unlocked:true}];}
function assertNormal(f){
  assert.equal(f.ending().completeClear,false);assert.equal(f.element('endingPhotoA').src,NORMAL);
  assert.equal(f.element('endingCinema').classList.contains('is-complete'),false);
  assert.equal(f.element('endingArtOpen').hidden,true);assert.equal(f.element('endingArtOpen').getAttribute('href'),null);
  assert.equal(f.element('endingCaption').style.display,'');assert.doesNotMatch(f.element('endingPhotoA').alt,/北海道|完全クリア|DM/);
}
function assertResult(f,complete){
  assert.equal(f.box.state,'won');assert.match(f.html(),/class="result-stats"/);
  const result=f.cardResult();assert.ok(result,'The real public result gate must accept the result');
  assert.equal(result.score,123456);assert.equal(result.kills,456);assert.equal(result.bossProgress.eclipseCleared,complete);
  assert.equal(f.element('endingCinema').hidden,true);assert.equal(f.element('endingPhotoA').getAttribute('src'),null);
  assert.equal(f.element('endingArtOpen').getAttribute('href'),null);
}

test('initial setup and an ordinary ending never request complete-clear art',()=>{
  const f=fixture();assert.equal(f.completeAssignments().length,0);
  f.run('startEndingCinema(false)');assertNormal(f);assert.equal(f.completeAssignments().length,0);
  assert.equal(f.unlocked(),false);f.run('setEndingScene(1)');assert.equal(f.element('endingCredits').hidden,false);
  f.element('endingSkip').click();assertResult(f,false);assert.equal(f.unlocked(),false);
});
test('a historical secret clear does not change a new ordinary ending',()=>{
  const f=fixture({history:historicalClear()});assert.equal(f.unlocked(),true);assert.equal(f.completeAssignments().length,0);
  f.run('startEndingCinema(false)');assertNormal(f);assert.equal(f.completeAssignments().length,0);
});
test('encounter, frenzy, ordinary clear, and true-core achievements cannot unlock complete replay',()=>{
  for(const history of [[],[{id:'clear',unlocked:true}],[{id:'eclipse_found',unlocked:true}],
    [{id:'eclipse_frenzy',unlocked:true}],[{id:'true_quintet',unlocked:true}],[{id:'eclipse_clear',unlocked:false}]]){
    const f=fixture({phase:'start',history,normalUnlocked:true,secret:true});
    f.run('startEndingCinema(true,true)');assert.equal(f.box.state,'start');assert.equal(f.ending(),null);
    assert.equal(f.completeAssignments().length,0);assert.equal(f.unlocked(),false);
  }
});
test('normal title replay ignores a stale secret-cleared run',()=>{
  const f=fixture({phase:'start',normalUnlocked:true,secret:true});f.run('startEndingCinema(true)');
  assertNormal(f);assert.equal(f.ending().returnTo,'title');assert.equal(f.unlocked(),false);
  f.element('endingSkip').click();assert.equal(f.box.state,'start');assert.equal(f.titleVisits(),1);assert.equal(f.cardResult(),null);
});
test('saved secret-clear achievement permits complete theater without creating a run result',()=>{
  const f=fixture({phase:'start',noGame:true,history:historicalClear()});f.run('startEndingCinema(true,true)');
  assert.equal(f.ending().completeClear,true);assert.equal(f.element('endingPhotoA').src,COMPLETE);
  assert.equal(f.ending().returnTo,'title');f.audio.dispatch('ended');
  assert.equal(f.box.state,'start');assert.equal(f.cardResult(),null);assert.equal(f.writes.length,0);assert.equal(f.box.g,null);
});
test('normal title theater still requires its own unlock',()=>{
  const f=fixture({phase:'start',history:historicalClear(),secret:true});f.run('startEndingCinema(true,false)');
  assert.equal(f.box.state,'start');assert.equal(f.ending(),null);assert.equal(f.assignments.length,0);
});
test('storage failures deny locked preview but cannot block a live complete clear',()=>{
  const f=fixture({phase:'start',secret:true,storageThrows:true,achievementThrows:true});
  f.run('startEndingCinema(true,true)');assert.equal(f.box.state,'start');assert.equal(f.unlocked(),false);
  f.box.state='playing';f.run('startEndingCinema(false)');assert.equal(f.element('endingPhotoA').src,COMPLETE);
  assert.equal(f.unlocked(),true);f.element('endingSkip').click();assertResult(f,true);
  f.box.state='start';f.run('startEndingCinema(true,true)');assert.equal(f.ending().completeClear,true);
});
test('local development ignores public achievement history and keeps unlocks in its own session',()=>{
  const f=fixture({phase:'start',secret:true,dev:true,history:historicalClear()});
  f.run('startEndingCinema(true,true)');assert.equal(f.box.state,'start');assert.equal(f.unlocked(),false);
  f.box.state='playing';f.run('startEndingCinema(false)');assert.equal(f.unlocked(),true);
  assert.equal(f.storage.has('RUU_OVERRUN_ENDING_UNLOCK'),false);assert.equal(f.storage.get('RUU_DEV_ENDING_UNLOCK'),'1');
  f.element('endingSkip').click();f.box.state='start';f.run('startEndingCinema(true,true)');assert.equal(f.ending().completeClear,true);
});
test('complete art keeps its captured variant and never receives ordinary captions or credits',()=>{
  const f=fixture({secret:true});f.run('startEndingCinema(false)');
  assert.equal(f.element('endingPhotoA').src,COMPLETE);assert.equal(f.element('endingArtOpen').href,COMPLETE);
  assert.equal(f.element('endingArtOpen').hidden,false);assert.equal(f.element('endingCinema').classList.contains('is-complete'),true);
  assert.equal(f.element('endingSparkles').children.length,0);
  f.box.g.secretBossCleared=false;
  for(const scene of [1,0]){f.run('setEndingScene('+scene+',true)');assert.equal(f.element('endingPhotoA').src,COMPLETE);
    assert.equal(f.element('endingCredits').hidden,true);assert.equal(f.element('endingCaption').style.display,'none');}
});
test('live complete ending reaches the original result-card gate with final run data',()=>{
  const f=fixture({secret:true});f.run('startEndingCinema(false)');assert.equal(f.cardResult(),null);
  assert.equal(f.unlocked(),true);assert.equal(f.storage.get('RUU_OVERRUN_ENDING_UNLOCK'),'1');
  assert.match(f.element('endingSkip').textContent,/結果/);f.element('endingSkip').click();assertResult(f,true);
});
test('result-screen replay returns the same ordinary or complete result without another save',()=>{
  for(const secret of [false,true]){
    const f=fixture({phase:'won',secret,storageThrows:true});f.run('showWinResult()');const before=f.cardResult();
    f.element('endingReplay').click();assert.equal(f.ending().returnTo,'result');assert.equal(f.ending().completeClear,secret);
    f.audio.dispatch('ended');assertResult(f,secret);assert.deepEqual(f.cardResult(),before);
    assert.equal(f.titleVisits(),0);assert.equal(f.writes.length,0);
  }
});
test('reentrant preview cannot replace an active ending or change its return target',()=>{
  const f=fixture({secret:true,normalUnlocked:true});f.run('startEndingCinema(false)');const active=f.ending();
  f.run('startEndingCinema(true,false)');assert.equal(f.ending(),active);assert.equal(f.ending().returnTo,'result');
  f.element('endingSkip').click();assertResult(f,true);
});
test('ordinary ending after a complete ending clears the complete art presentation',()=>{
  const f=fixture({secret:true});f.run('startEndingCinema(false)');f.element('endingSkip').click();
  f.box.state='playing';f.box.g.secretBossCleared=false;f.box.g.bossProgress.eclipseCleared=false;
  f.run('startEndingCinema(false)');assertNormal(f);assert.equal(f.element('endingArtStatus').hidden,true);
  f.run('setEndingScene(1)');assert.equal(f.element('endingCredits').hidden,false);
});
test('failed complete-art loading still permits immediate access to results',()=>{
  const f=fixture({secret:true});f.run('startEndingCinema(false)');f.element('endingPhotoA').dispatch('error');
  assert.equal(f.element('endingArtStatus').hidden,false);assert.match(f.element('endingArtStatus').textContent,/読み込めません/);
  f.element('endingSkip').click();assertResult(f,true);
});
test('silent ending completes through its wall clock and restores result access',()=>{
  const f=fixture({secret:true,audioBlocked:true,soundOn:false});f.run('startEndingCinema(false)');
  f.advance(54000);f.run('updateEndingCinema(performance.now())');assertResult(f,true);
});
test('complete-art preload runs only after an accepted secret kill and runs once',()=>{
  const f=fixture();f.loadSecretBoss();assert.equal(f.completeAssignments().length,0);
  f.box.enemy={kind:'secret_ruu',secretRuu:true,hp:0,x:0,y:0,r:34,xp:200,col:'#fff'};
  f.run('killEnemy(enemy)');assert.equal(f.box.g.secretBossCleared,false);assert.equal(f.completeAssignments().length,0);
  f.run("window.RUU_SECRET_BOSS.reveal(g,{spawn:()=>enemy})");assert.equal(f.completeAssignments().length,0);
  f.box.enemy.hp=0;f.run('killEnemy(enemy)');assert.equal(f.box.g.secretBossCleared,true);
  assert.equal(f.completeAssignments().length,1);assert.equal(f.completeAssignments()[0].id,'preload');assert.equal(f.unlocked(),true);
  f.run('killEnemy(enemy)');assert.equal(f.completeAssignments().length,1);
});

console.log(JSON.stringify({source:root,tests,pass:tests.filter(t=>t.status==='PASS').length,fail:tests.filter(t=>t.status==='FAIL').length},null,2));
if(tests.some(t=>t.status==='FAIL'))process.exitCode=1;
