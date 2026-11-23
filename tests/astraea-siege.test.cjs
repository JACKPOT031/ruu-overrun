/* Execute the real siege scheduler, collision paths, hostile AI and support cap. */
'use strict';
const assert=require('node:assert/strict');
const {root,fixture,recordingCanvas}=require('./combat-fixture.cjs');
const tests=[];
function test(name,fn){try{fn();tests.push({name,status:'PASS'});}catch(error){tests.push({name,status:'FAIL',reason:error.stack});}}
function near(a,b){assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);}
function majors(f){return [...f.eclipses(),...f.escorts(),...f.hostileAstraea()];}
function ready(f){assert.equal(f.reveal(),true);f.advance(25.4);assert.equal(majors(f).length,7);assert.equal(f.screens().length,24);}
function noClear(f){
  assert.equal(f.g.secretBossPending,true);assert.equal(f.g.secretBossCleared,false);
  assert.equal(f.g.secretRewardClear,false);assert.equal(f.countAchievement('eclipse_clear'),0);
  assert.equal(f.effects.preloads,0);assert.equal(f.effects.ending.length,0);
}
function assertWave(f,wave){
  const units=Array.from(f.screens()).filter(e=>e.secretScreenWave===wave);
  assert.equal(units.length,12);assert.equal(units.filter(e=>e.kind==='brute').length,8);
  assert.equal(units.filter(e=>e.kind==='runner').length,4);
  assert.equal(new Set(units.map(e=>`${e.x},${e.y}`)).size,12,'Screen bodies must occupy distinct positions');
  for(const e of units){
    const d=Math.hypot(e.x-f.g.player.x,e.y-f.g.player.y);
    assert.ok(Number.isFinite(d)&&d>=170-1e-8&&d<400,'Screen bodies must arrive at a safe finite distance');
    assert.equal(e.elite,false);assert.ok(!e.mutation);assert.equal(e.speed,0);
    assert.equal(f.secret.isIntro(e),true);assert.ok(e.secretScreenIntro>0);
    const hp=e.hp;assert.equal(f.hit(e,100),0);assert.equal(e.hp,hp,'Arrival must prevent premature damage');
  }
  return units;
}

test('two finite melee screens arrive at combat start and 20 seconds, once each',()=>{
  const f=fixture();f.reveal();assert.equal(f.screens().length,0);
  f.advance(3);assert.equal(f.screens().length,0,'The first wave must wait for the opening intro');
  f.advance(.2);const first=assertWave(f,1);
  assert.equal(f.g.bossProgress.eclipseScreenWaves,1);assert.equal(f.g.bossProgress.eclipseScreenSpawned,12);
  assert.equal(f.g.bossProgress.eclipseScreenKilled,0);assert.equal(f.status().screenRemaining,12);
  f.advance(.75);
  for(const e of first){assert.equal(f.secret.isIntro(e),false);assert.equal(e.speed,e.kind==='brute'?70:120);}
  first[0].x=2500;first[0].y=0;f.update(.01);
  assert.ok(f.g.enemies.includes(first[0]),'An owned finite-wave body must not silently disappear at the ambient-enemy distance cutoff');
  f.advance(18.9);assert.equal(f.g.bossProgress.eclipseScreenWaves,1);assert.equal(f.hostileAstraea().length,0);
  f.advance(.35);assertWave(f,2);assert.equal(f.hostileAstraea().length,1);
  assert.equal(f.g.bossProgress.eclipseScreenWaves,2);assert.equal(f.g.bossProgress.eclipseScreenSpawned,24);
  f.advance(.8);
  for(const e of [...f.screens()])f.kill(e);
  assert.equal(f.g.bossProgress.eclipseScreenKilled,24);assert.equal(f.status().screenRemaining,0);
  f.advance(35);
  assert.equal(f.screens().length,0);assert.equal(f.g.bossProgress.eclipseScreenWaves,2);
  assert.equal(f.g.bossProgress.eclipseScreenSpawned,24);assert.equal(f.hostileAstraea().length,1);noClear(f);
});
test('defeating the original six early forces the second wave and hostile ASTRAEA exactly once',()=>{
  const f=fixture();f.reveal();f.advance(3.2);assert.equal(f.g.bossProgress.eclipseScreenWaves,1);
  for(const e of [...f.eclipses()])f.kill(e);
  assert.equal(f.escorts().length,3);f.advance(1.3);
  const escorts=[...f.escorts()];for(const e of escorts)f.kill(e);
  assert.equal(f.hostileAstraea().length,1);assert.equal(f.screens().length,24);
  assert.equal(f.g.bossProgress.eclipseScreenWaves,2);assert.equal(f.status().remainingThreats,1);noClear(f);
  for(const e of escorts)f.box.killEnemy(e);
  f.advance(25);assert.equal(f.hostileAstraea().length,1);assert.equal(f.g.bossProgress.eclipseScreenSpawned,24);noClear(f);
});
test('planned ASTRAEA HP is included from reveal and screen bodies never change the major HP total',()=>{
  const f=fixture();f.reveal();const before=f.status();
  assert.equal(before.totalThreats,7);assert.equal(before.astraeaTotal,1);assert.equal(before.astraeaRemaining,1);
  assert.equal(before.astraeaSpawned,false);assert.equal(before.astraeaMaxHp,3000+40*24);
  assert.equal(before.astraeaHp,before.astraeaMaxHp);
  f.g.level=99;f.advance(23.3);const after=f.status();
  assert.equal(after.astraeaSpawned,true);assert.equal(f.hostileAstraea()[0].maxHp,before.astraeaMaxHp);
  assert.equal(after.maxHp,before.maxHp);assert.equal(after.hp,before.hp);
  assert.equal(after.remainingThreats,7);assert.equal(after.screenSpawned,24);
  assert.equal(f.g.bossProgress.eclipseAstraeaSpawned,true);
});

function collisionFixture(){
  const f=fixture();f.loadWeapons();f.reveal();f.secret.tick(4,f.g,f.api);f.secret.tick(.8,f.g,f.api);
  const body=f.screens()[0],boss=f.eclipses()[0];
  for(const e of f.g.enemies){e.x=1100;e.y=1000;e.speed=0;e.pushX=0;e.pushY=0;}
  Object.assign(body,{x:120,y:0,hp:300,secretScreenIntro:0,speed:0});
  Object.assign(boss,{x:300,y:0,hp:1000,speed:0});
  Object.assign(boss.secretBrain,{cooldown:100,wind:0});
  return {f,body,boss};
}
test('front screen bodies absorb ordinary non-piercing projectiles and become new automatic targets',()=>{
  const {f,body,boss}=collisionFixture();
  assert.equal(f.box.nearestEnemy(0,0,710),body);
  f.box.fireBullet(body.x,body.y,100,0,30,7,0);f.update(0);
  assert.equal(body.hp,270);assert.equal(boss.hp,1000);assert.equal(f.g.bullets.length,0);
  f.g.player.mods.missile=1;f.box.launchMissiles();
  assert.equal(f.g.missiles[0].target,body,'New homing missiles must target the nearer screen body');
  f.g.player.mods.missile=0;
  for(let i=0;i<60&&f.g.missiles.length;i++)f.box.updateNewWeapons(.05);
  assert.equal(f.g.missiles.length,0);assert.ok(body.hp<270);assert.equal(boss.hp,1000);
});
test('screen bodies preserve piercing, area damage and already-locked homing-missile behavior',()=>{
  const {f,body,boss}=collisionFixture();
  f.box.fireBullet(body.x,body.y,0,0,20,7,1);f.update(0);
  assert.equal(body.hp,280);assert.equal(f.g.bullets.length,1);
  f.g.bullets[0].x=boss.x;f.update(0);assert.ok(boss.hp<1000);assert.equal(f.g.bullets.length,0);
  const hp=[body.hp,boss.hp];assert.equal(f.box.areaStrike(210,0,110,10,'#fff'),2);
  assert.ok(body.hp<hp[0]);assert.ok(boss.hp<hp[1]);
  const bodyHp=body.hp;
  f.g.missiles.push({x:body.x,y:body.y,vx:0,vy:0,speed:425,target:boss,ttl:2,damage:20,r:50,trail:[]});
  f.box.updateNewWeapons(0);assert.equal(f.g.missiles.length,1);assert.equal(body.hp,bodyHp);
  f.g.missiles[0].x=boss.x;f.box.updateNewWeapons(0);assert.equal(f.g.missiles.length,0);
  assert.equal(body.hp,bodyHp,'The existing target-only homing collision must not be rewritten by screen tags');
});

for(const lastKind of ['enemyAstraea','secretRuu','secretReinforcement']){
  test(`seven-major clear removes live screens without phantom kills or rewards (${lastKind} last)`,()=>{
    const f=fixture();ready(f);const all=majors(f),last=all.find(e=>e[lastKind]);
    const screens=[...f.screens()];assert.equal(screens.filter(e=>e.hp>0).length,24);
    const baseline={kills:f.g.kills,xp:f.g.xp,grants:f.rewards.status().grants};
    for(const e of all.filter(e=>e!==last))f.kill(e);
    assert.equal(f.g.kills,baseline.kills+6);assert.equal(f.screens().length,24);noClear(f);
    f.kill(last);
    assert.equal(f.g.secretBossCleared,true);assert.equal(f.g.kills,baseline.kills+7);
    assert.equal(f.screens().length,0);assert.equal(f.status().screenRemaining,0);
    assert.equal(f.g.bossProgress.eclipseScreenSpawned,24);assert.equal(f.g.bossProgress.eclipseScreenKilled,0);
    assert.equal(f.g.xp-baseline.xp,62*3+300,'Only three DEVORA packages and the grand package grant bonus XP');
    assert.equal(f.rewards.status().grants-baseline.grants,4);
    assert.equal(f.effects.texts.filter(t=>t==='+38,000 BONUS').length,1);
    assert.equal(f.countAchievement('eclipse_clear'),1);assert.equal(f.effects.preloads,1);
    const after={kills:f.g.kills,score:f.g.score,xp:f.g.xp,grants:f.rewards.status().grants};
    for(const e of screens){assert.equal(e.secretScreenCleaned,true);assert.equal(e.hp,0);f.box.killEnemy(e);}
    f.box.killEnemy(last);
    assert.deepEqual({kills:f.g.kills,score:f.g.score,xp:f.g.xp,grants:f.rewards.status().grants},after);
    f.advance(3.1);assert.equal(f.effects.ending.length,1);assert.equal(f.effects.ending[0].complete,true);
  });
}
test('a new run clears the screen and hostile-ASTRAEA scheduler, counters and completion flags',()=>{
  const f=fixture();ready(f);f.kill(f.screens()[0]);f.kill(f.hostileAstraea()[0]);f.reset();
  for(const key of ['eclipseScreenWaves','eclipseScreenSpawned','eclipseScreenKilled','eclipseAstraeaTotal','eclipseAstraeaKilled'])
    assert.equal(f.g.bossProgress[key],0,key);
  assert.equal(f.g.bossProgress.eclipseAstraeaSpawned,false);assert.equal(f.g.enemies.length,0);
  assert.equal(f.status().astraeaSpawned,false);assert.equal(f.status().screenWaves,0);
  f.reveal();f.advance(3.2);assert.equal(f.screens().length,12);assert.equal(f.hostileAstraea().length,0);
});

function hostileFixture(pattern=0,options={}){
  const f=fixture(options);f.usePlayerDamage();
  Object.assign(f.g.player,{hp:1000,maxHp:1000,shield:0,inv:0});
  const e=f.astraea.spawn(f.g,f.api,24),b=e.astraeaBrain;
  assert.equal(f.hit(e,100),0);f.astraea.step(e,2,f.g,f.api);
  assert.equal(f.astraea.isIntro(e),false);assert.equal(f.g.player.hp,1000);
  b.pattern=pattern;b.cooldown=0;f.astraea.step(e,.01,f.g,f.api);
  return {f,e,b};
}
for(const [pattern,name,duration,rayCount] of [[0,'aimed laser',.95,1],[1,'triple laser',1.15,3]]){
  test(`${name} warns before one damage pulse and fires along its frozen warning geometry`,()=>{
    const {f,e,b}=hostileFixture(pattern),warning=JSON.parse(JSON.stringify(b.warning));
    assert.equal(b.windMax,duration);assert.equal(warning.segments.length,rayCount);
    const origin={x:e.x,y:e.y};
    f.astraea.step(e,duration-.01,f.g,f.api);assert.equal(f.g.player.hp,1000);
    assert.deepEqual({x:e.x,y:e.y},origin,'The warning origin must not move during windup');
    f.astraea.step(e,.02,f.g,f.api);assert.equal(f.g.player.hp,982);assert.equal(b.rays.length,rayCount);
    assert.deepEqual(Array.from(b.rays,r=>({x:r.x,y:r.y,x2:r.x2,y2:r.y2,halfWidth:r.halfWidth})),warning.segments);
    f.g.player.inv=0;f.astraea.step(e,.1,f.g,f.api);assert.equal(f.g.player.hp,982,'Afterglow must not repeat damage');
    assert.equal(f.g.ebullets.length,0,'ASTRAEA beams must not consume shared projectile capacity');
  });
}
test('moving outside a telegraphed laser avoids damage without retargeting the beam',()=>{
  const {f,e,b}=hostileFixture(1),warning=JSON.parse(JSON.stringify(b.warning));
  f.g.player.x=0;f.g.player.y=1000;f.astraea.step(e,1.16,f.g,f.api);
  assert.equal(f.g.player.hp,1000);
  assert.deepEqual(Array.from(b.rays,r=>({x:r.x,y:r.y,x2:r.x2,y2:r.y2,halfWidth:r.halfWidth})),warning.segments);
  assert.equal(f.g.ebullets.length,0);
});
test('charge warns for 1.2 seconds, then damages only its swept path once without projectiles',()=>{
  const {f,e,b}=hostileFixture(2),warning=JSON.parse(JSON.stringify(b.warning)),origin={x:e.x,y:e.y};
  assert.equal(b.windMax,1.2);assert.equal(warning.segments.length,1);
  f.astraea.step(e,1.19,f.g,f.api);assert.equal(f.g.player.hp,1000);assert.deepEqual({x:e.x,y:e.y},origin);
  f.astraea.step(e,.02,f.g,f.api);assert.equal(f.g.player.hp,1000);assert.ok(b.charge);
  const charge=b.charge;assert.deepEqual(JSON.parse(JSON.stringify(charge.segment)),warning.segments[0]);
  f.astraea.step(e,.1,f.g,f.api);assert.equal(f.g.player.hp,1000,'Charge must not hit the entire warned lane at release');
  f.astraea.step(e,1,f.g,f.api);assert.equal(f.g.player.hp,982);assert.equal(charge.hit,true);
  f.g.player.inv=0;f.astraea.step(e,.1,f.g,f.api);assert.equal(f.g.player.hp,982);
  assert.equal(f.g.ebullets.length,0);assert.ok(b.trails.length<=12);assert.ok(b.rays.length<=3);
});
test('defeat cancels hostile warnings, rays and charge, and prevents future attacks',()=>{
  const {f,e,b}=hostileFixture(1);b.rays.push({life:.2});b.trails.push({life:.2});
  const hp=f.g.player.hp;assert.equal(f.astraea.onDefeat(e),true);assert.equal(f.astraea.onDefeat(e),false);
  assert.equal(b.warning,null);assert.equal(b.charge,null);assert.equal(b.wind,0);
  assert.equal(b.rays.length,0);assert.equal(b.trails.length,0);
  f.astraea.step(e,10,f.g,f.api);assert.equal(f.g.player.hp,hp);assert.equal(f.g.ebullets.length,0);
});
test('a lethal hostile laser cannot be followed by a postmortem final clear or reward heal',()=>{
  const f=fixture();ready(f);const hostile=f.hostileAstraea()[0];
  for(const e of majors(f).filter(e=>e!==hostile))f.kill(e);
  for(const e of f.screens()){e.x=1000;e.y=1000;}
  f.usePlayerDamage();Object.assign(f.g.player,{hp:1,shield:0,inv:0});
  Object.assign(hostile,{x:300,y:0,hp:1});Object.assign(hostile.astraeaBrain,{intro:0,pattern:0,cooldown:0,wind:0,charge:null});
  f.astraea.step(hostile,.01,f.g,f.api);hostile.astraeaBrain.wind=.001;
  f.g.bullets.push({x:hostile.x,y:hostile.y,vx:0,vy:0,r:20,ttl:1,dmg:99999,kind:'pulse',hit:new Set(),pierce:0});
  const before={score:f.g.score,kills:f.g.kills,grants:f.rewards.status().grants};f.update(.01);
  assert.equal(f.box.state,'dying');assert.equal(f.g.player.hp,0);assert.equal(hostile.hp,1);
  assert.deepEqual({score:f.g.score,kills:f.g.kills,grants:f.rewards.status().grants},before);noClear(f);
});
test('allied ASTRAEA respects hostile arrival, the 28-percent actual-damage cap and nonlethal floor',()=>{
  const f=fixture(),ally=f.loadAlly(),e=f.astraea.spawn(f.g,f.api,24);
  const api={hit:(target,damage,col,limits)=>f.box.applyDamage(target,damage,0,0,col,limits)};
  ally.hitAssist(e,100000,api);assert.equal(e.hp,e.maxHp);assert.equal(e.astraeaAssistDamage||0,0);
  e.astraeaBrain.intro=0;f.g.driveTime=10;f.g.player.crit=1;
  f.box.window.RUU_PILOTS={markedMultiplier:()=>4};
  for(let i=0;i<6;i++)ally.hitAssist(e,100000,api);
  near(e.astraeaAssistDamage,e.maxHp*.28);near(e.hp,e.maxHp*.72);
  const kills=f.g.kills;e.hp=5;e.astraeaAssistDamage=0;ally.hitAssist(e,100000,api);
  assert.equal(e.hp,1);assert.equal(e.astraeaAssistDamage,4);assert.equal(f.g.kills,kills);
  assert.equal(f.countAchievement('eclipse_clear'),0);
});
test('gravity wells preserve hostile warning and charge positions while retaining damage and patrol pull',()=>{
  for(const phase of ['intro','wind','charge','patrol']){
    const f=fixture();f.loadWeapons();const e=f.astraea.spawn(f.g,f.api,24),b=e.astraeaBrain;
    if(phase!=='intro')b.intro=0;
    if(phase==='wind'||phase==='charge'){
      b.pattern=2;b.cooldown=0;f.astraea.step(e,.01,f.g,f.api);
      if(phase==='charge')f.astraea.step(e,1.21,f.g,f.api);
    }
    if(phase==='patrol')b.cooldown=100;
    const before={x:e.x,y:e.y,hp:e.hp};
    const warned=b.warning?.segments[0]||b.charge?.segment;
    const geometry=warned?JSON.parse(JSON.stringify(warned)):null;
    f.g.wells.push({x:e.x+80,y:e.y+40,r:150,life:1,tick:0,damage:20});
    f.box.updateNewWeapons(.1);
    if(phase==='patrol')assert.ok(Math.hypot(e.x-before.x,e.y-before.y)>0,'Ordinary patrol must retain the existing well pull');
    else assert.deepEqual({x:e.x,y:e.y},{x:before.x,y:before.y},phase+' must not slide away from its telegraph');
    if(phase==='intro')assert.equal(e.hp,before.hp);
    else near(before.hp-e.hp,20*.74);
    if(warned)assert.deepEqual(JSON.parse(JSON.stringify(warned)),geometry);
    if(phase==='charge'){
      const charge=b.charge;f.astraea.step(e,.1,f.g,f.api);
      near(e.x,before.x+charge.dx*68);near(e.y,before.y+charge.dy*68);
    }
  }
});
test('hostile rendering bounds all eight atlas frames and supports short-atlas, SVG and missing-art fallbacks',()=>{
  for(const mode of ['atlas','short-atlas','svg','missing'])for(const quality of ['lite','auto','high']){
    const probe=recordingCanvas(),f=fixture({canvasProbe:probe}),e=f.astraea.spawn(f.g,f.api,24),ctx=probe.context('hostile');
    const flight=f.images.find(i=>i.src==='assets/astraea_flight_atlas.webp');
    const fallback=f.images.find(i=>i.src==='assets/astraea-companion.svg');
    Object.assign(flight,{complete:mode==='atlas'||mode==='short-atlas',naturalWidth:1024,naturalHeight:mode==='short-atlas'?256:512});
    Object.assign(fallback,{complete:mode!=='missing',naturalWidth:300,naturalHeight:300});
    e.x=500;e.y=300;f.astraea.drawGround(ctx,{x:0,y:0},f.g,quality);
    for(let frame=0;frame<8;frame++){
      e.astraeaBrain.clock=frame*.12+.001;e.astraeaBrain.facing=frame%2?1:-1;
      f.astraea.drawCharacter(ctx,e,{x:0,y:0},quality);
    }
    const imageCalls=probe.calls.images.filter(c=>c.tag==='hostile');
    if(mode==='atlas'){
      assert.equal(imageCalls.length,8);assert.equal(new Set(imageCalls.map(c=>`${c.args[1]},${c.args[2]}`)).size,8);
      for(const {args} of imageCalls){assert.equal(args[0],flight);assert.equal(args.length,9);
        assert.ok(args[1]>=0&&args[2]>=0&&args[1]+args[3]<=1024&&args[2]+args[4]<=512);}
    }else if(mode!=='missing'){
      assert.equal(imageCalls.length,8);assert.ok(imageCalls.every(c=>c.args[0]===fallback&&c.args.length===5));
    }else assert.equal(imageCalls.length,0);
    assert.equal(probe.calls.texts.filter(c=>c.args[0]==='ASTRAEA // HOSTILE').length,8);
    e.astraeaBrain.intro=0;e.astraeaBrain.cooldown=0;
    f.astraea.step(e,.01,f.g,f.api);f.astraea.drawGround(ctx,{x:0,y:0},f.g,quality);
    f.astraea.step(e,1,f.g,f.api);f.astraea.drawWorld(ctx,{x:0,y:0},f.g,quality);
  }
});

console.log(JSON.stringify({source:root,tests,pass:tests.filter(t=>t.status==='PASS').length,
  fail:tests.filter(t=>t.status==='FAIL').length},null,2));
if(tests.some(t=>t.status==='FAIL'))process.exitCode=1;
