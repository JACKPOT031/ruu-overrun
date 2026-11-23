/* Pressure regressions execute shipped combat/AI code in a Node VM.
   Canvas/audio are recorded or stubbed; simulated steps are not browser FPS. */
'use strict';
const assert=require('node:assert/strict');
const {root,index,section,TAU,fixture,recordingCanvas}=require('./combat-fixture.cjs');
const tests=[],simulations=[];
function test(name,fn){try{fn();tests.push({name,status:'PASS'});}catch(error){tests.push({name,status:'FAIL',reason:error.stack});}}
function near(a,b,message){assert.ok(Math.abs(a-b)<1e-7,message||`${a} != ${b}`);}
function ready(f){assert.equal(f.reveal(),true);f.advance(25.4);assert.equal(f.status().remainingThreats,7);}
function majorUnits(f){return [...f.eclipses(),...f.escorts(),...f.hostileAstraea()];}
function coreVolley(f,e){
  f.g.ebullets.length=0;e.trueIntro=0;e.x=200;e.y=0;
  Object.assign(e.trueBrain,{wind:.001,windMax:e.trueBossRole==='SIEGE'?1.18:.88,targetX:0,targetY:0,angle:0});
  f.trueEnd.step(e,.01,f.g,f.api);
  return [...f.g.ebullets];
}
function safeRing(shot,gap=.43){const a=Math.atan2(shot.vy,shot.vx),d=Math.abs(Math.atan2(Math.sin(a),Math.cos(a)));
  return d>=gap-1e-8&&Math.abs(d-Math.PI)>=gap-1e-8;}

test('boosted planned HP is stable across delayed spawns and finite screens have stronger melee stats',()=>{
  const f=fixture();f.reveal();const before=f.status();
  assert.equal(before.eclipseMaxHp,3*3928);
  assert.equal(before.reinforcementMaxHp,1495+1384+1730);
  assert.equal(before.astraeaMaxHp,4950);assert.equal(before.maxHp,21343);
  assert.equal(before.hp,before.maxHp);assert.equal(before.encounterLevel,24);
  f.g.level=100;f.advance(25.4);
  assert.deepEqual(Array.from(f.escorts(),e=>e.maxHp),[1495,1384,1730]);
  assert.equal(f.hostileAstraea()[0].maxHp,4950);
  assert.equal(f.status().maxHp,before.maxHp);assert.equal(f.status().hp,before.hp);
  assert.equal(f.screens().length,24);
  for(const e of f.screens()){
    assert.equal(e.maxHp,e.kind==='brute'?405:167);
    assert.equal(e.dmg,e.kind==='brute'?13:11);
    assert.equal(e.secretScreenSpeed,e.kind==='brute'?100:165);
  }
  for(const e of f.screens())f.kill(e);
  assert.equal(f.status().maxHp,before.maxHp,'Screen HP must stay outside the seven-major health bar');
});

test('ordinary TRUE trinity and quintet retain their original HP, contact stats and actual volleys',()=>{
  for(const rare of [false,true])for(const level of [1,24,100]){
    const f=fixture();f.g.level=level;f.trueEnd.queue(f.g,{kind:'final'},()=>rare?0:.5);
    f.trueEnd.spawnQueued(f.g,f.api);f.trueEnd.tick(3,f.g);
    const cores=f.g.enemies.filter(e=>e.trueDevora);assert.equal(cores.length,rare?5:3);
    for(const [i,e] of cores.entries()){
      assert.equal(e.maxHp,Math.ceil((555+level*23)*(i===2?1.25:i===0?1.08:1)));
      assert.equal(e.speed,[104,79,60,88,115][i]);assert.equal(e.dmg,[16,14,19,15,17][i]);
      const shots=coreVolley(f,e),originalSiege=Array.from({length:17},(_,j)=>j*TAU/17+.10)
        .filter(a=>{const d=Math.abs(Math.atan2(Math.sin(a),Math.cos(a)));return d>=.43&&Math.abs(d-Math.PI)>=.43;}).length;
      assert.equal(shots.length,[3,5,originalSiege,10,7][i]);
      assert.ok(shots.every(b=>b.damage===[11,13,12,12,13][i]&&!b.secretReinforcement));
      const wind=i===2?1.18:.88;
      near(e.trueBrain.cd,([2.55,3.1,3.8,3.3,2.8][i]*(rare?1.2:1)+wind)/1.20-wind);
      if(i===2)assert.ok(shots.every(b=>safeRing(b)));
      assert.equal(f.secret.armorLevel(e),0);e.hp=e.maxHp*.1;assert.equal(f.secret.incomingDamageScale(e),1);
    }
  }
});

test('secret DEVORA add 50 percent cumulative shots, preserve original rays and safe gaps, and shorten only cooldown',()=>{
  const normal=fixture();normal.trueEnd.queue(normal.g,{kind:'final'},()=>.5);
  normal.trueEnd.spawnQueued(normal.g,normal.api);normal.trueEnd.tick(3,normal.g);
  const f=fixture();ready(f);
  for(const [i,e] of f.escorts().entries()){
    const original=coreVolley(normal,normal.g.enemies.filter(x=>x.trueDevora)[i]);
    const originalAngles=original.map(b=>Math.atan2(b.vy,b.vx));
    const first=coreVolley(f,e),firstCd=e.trueBrain.cd,second=coreVolley(f,e);
    assert.deepEqual([first.length,second.length].sort((a,b)=>a-b),[Math.floor(original.length*1.5),Math.ceil(original.length*1.5)]);
    assert.equal(first.length+second.length,original.length*3);
    for(const volley of [first,second]){
      assert.ok(volley.every(b=>b.secretReinforcement&&b.damage===Math.ceil([11,13,12][i]*1.18)));
      const angles=volley.map(b=>Math.atan2(b.vy,b.vx));
      for(const angle of originalAngles)assert.ok(angles.some(a=>Math.abs(Math.atan2(Math.sin(a-angle),Math.cos(a-angle)))<1e-8));
      if(i===2)assert.ok(volley.every(b=>safeRing(b)),'Added SIEGE shots cannot close the original escape gaps');
    }
    const wind=i===2?1.18:.88;near(firstCd,(([2.55,3.1,3.8][i]+wind)/1.2-wind)*.85);
    e.trueBrain.cd=0;e.trueBrain.wind=0;e.x=200;e.y=0;
    f.trueEnd.step(e,.01,f.g,f.api);near(e.trueBrain.wind,wind,'Arrival/warning must not be shortened by pressure tuning');
  }
});

test('ECLIPSE stronger projectiles and faster cooldown retain each phase warning and independent frozen prediction',()=>{
  for(const phase of [{hp:1,hot:false,critical:false,wind:.80,cd:1.63},{hp:.48,hot:true,critical:false,wind:.64,cd:1.22},
    {hp:.20,hot:true,critical:true,wind:.46,cd:.82}]){
    const f=fixture();f.reveal();f.secret.tick(3.2,f.g,f.api);const e=f.eclipses()[0],b=e.secretBrain;
    e.hp=e.maxHp*phase.hp;e.x=-200;e.y=0;
    Object.assign(f.g.player,{x:0,y:0,px:-30,py:0});
    Object.assign(b,{enraged:phase.hot,frenzy:phase.critical,cooldown:0,pattern:0});
    f.secret.step(e,.05,f.g,f.api);near(b.windMax,phase.wind);assert.ok(b.targetX>f.g.player.x);
    assert.ok(b.targetX<=76+1e-8,'Extreme velocity/dashes must have bounded prediction');
    const frozen={x:b.targetX,y:b.targetY,aim:b.aim};f.g.player.x=-200;f.g.player.y=500;
    f.secret.step(e,.1,f.g,f.api);assert.deepEqual({x:b.targetX,y:b.targetY,aim:b.aim},frozen);
    f.secret.step(e,phase.wind,f.g,f.api);
    near(b.cooldown,((phase.cd+phase.wind)/1.2-phase.wind)*.85);
    assert.ok(f.g.ebullets.length>0);assert.ok(f.g.ebullets.every(shot=>shot.damage===Math.ceil((phase.hot?13:11)*1.15)));
  }
  const f=fixture();f.reveal();f.secret.tick(3.2,f.g,f.api);const e=f.eclipses()[0];
  assert.equal(e.dmg,21);e.hp=e.maxHp*.48;f.secret.step(e,.01,f.g,f.api);assert.equal(e.dmg,26);
});

test('screen and major catch-up increases smoothly without teleporting or bypassing arrival protection',()=>{
  const f=fixture();ready(f);const p=f.g.player;
  for(const kind of ['brute','runner']){
    const e=f.screens().find(x=>x.kind===kind),base=kind==='brute'?100:165,far=kind==='brute'?260:290;
    e.secretScreenIntro=.7;e.x=p.x-2000;e.y=p.y;const initial={x:e.x,y:e.y};
    f.secret.tick(.1,f.g,f.api);assert.equal(e.speed,0);assert.deepEqual({x:e.x,y:e.y},initial);
    e.secretScreenIntro=0;
    const speeds=[];
    for(const d of [200,420,720,1020,2000]){e.x=p.x-d;f.secret.tick(.001,f.g,f.api);speeds.push(e.speed);assert.equal(e.x,p.x-d);}
    near(speeds[0],base);near(speeds[1],base);near(speeds[2],(base+far)/2);near(speeds[3],far);near(speeds[4],far);
  }
  for(const [i,e] of f.escorts().entries()){
    Object.assign(e.trueBrain,{cd:100,wind:0});e.x=p.x-1600;e.y=p.y;
    f.trueEnd.step(e,.1,f.g,f.api);assert.equal(e.x,p.x-1600);assert.equal(e.speed,[300,285,270][i]);
  }
  for(const [i,e] of f.eclipses().entries()){
    e.x=p.x-1600;e.y=p.y;e.hp=e.maxHp*[1,.4,.1][i];
    Object.assign(e.secretBrain,{cooldown:100,wind:0,dash:0,dashPause:0,events:[],hazards:[]});
    f.secret.step(e,.1,f.g,f.api);assert.equal(e.x,p.x-1600);assert.equal(e.speed,[282,320,360][i]);
  }
});

test('armor activates at exact living-HP boundaries for all four secret tags and never stacks',()=>{
  const f=fixture();ready(f);
  const cases=[[f.eclipses()[0],.78],[f.escorts()[0],.74],[f.hostileAstraea()[0],.74],[f.screens()[0],1]];
  for(const [e,resistance] of cases){
    for(const [hp,scale,level] of [[500.001,1,0],[500,.88,1],[200.001,.88,1],[200,.72,2]]){
      e.maxHp=1000;e.hp=hp;assert.equal(f.secret.armorLevel(e),level);near(f.secret.incomingDamageScale(e),scale);
      near(f.hit(e,100),100*resistance*scale);near(e.hp,hp-100*resistance*scale);
    }
    for(const hp of [0,-1]){e.hp=hp;assert.equal(f.secret.armorLevel(e),0);assert.equal(f.secret.incomingDamageScale(e),1);assert.equal(f.hit(e,100),0);}
  }
  const e=cases[0][0];e.maxHp=1000;e.hp=501;near(f.hit(e,400),312);near(e.hp,189);
  near(f.hit(e,100),56.16,'A hit uses pre-hit HP; a later critical hit gets .72, never .88 × .72');
  for(const target of [{hp:1,maxHp:100,kind:'runner'},{hp:1,maxHp:100,trueDevora:true},
    {hp:50,maxHp:0,secretRuu:true},{hp:NaN,maxHp:100,secretScreen:true}]){
    assert.equal(f.secret.armorLevel(target),0);assert.equal(f.secret.incomingDamageScale(target),1);
  }
});

test('actual allied ASTRAEA caps damage after armor, including critical armor and the nonlethal floor',()=>{
  const f=fixture();ready(f);const ally=f.loadAlly();f.g.driveTime=10;f.g.player.crit=1;
  f.box.window.RUU_PILOTS={markedMultiplier:()=>4};
  const api={hit:(target,damage,col,limits)=>f.box.applyDamage(target,damage,0,0,col,limits)};
  for(const e of [f.eclipses()[0],f.escorts()[0],f.hostileAstraea()[0]]){
    e.maxHp=1000;e.hp=490;e.astraeaAssistDamage=0;
    ally.hitAssist(e,100000,api);near(e.hp,210);near(e.astraeaAssistDamage,280);
    ally.hitAssist(e,100000,api);near(e.hp,210,'Exhausted per-boss support budget must stay exhausted');
    e.hp=190;e.astraeaAssistDamage=200;ally.hitAssist(e,100000,api);near(e.hp,110);near(e.astraeaAssistDamage,280);
    e.hp=5;e.astraeaAssistDamage=0;const kills=f.g.kills;ally.hitAssist(e,100000,api);
    near(e.hp,1);near(e.astraeaAssistDamage,4);assert.equal(f.g.kills,kills);assert.equal(f.g.secretBossCleared,false);
  }
});

test('armor roster counts and the shipped shield renderer distinguish I, II, healthy and dead units',()=>{
  const probe=recordingCanvas(),f=fixture({canvasProbe:probe});ready(f);
  const units=[f.eclipses()[0],f.escorts()[0],f.hostileAstraea()[0],f.screens()[0]];
  f.loadArmorDrawing(probe.context('armor'));
  for(const e of units){
    Object.assign(e,{x:500,y:300});
    e.hp=e.maxHp*.5;f.box.drawEnemyArmor(e,{x:0,y:0});
    e.hp=e.maxHp*.2;f.box.drawEnemyArmor(e,{x:0,y:0});
    e.hp=e.maxHp;f.box.drawEnemyArmor(e,{x:0,y:0});
    e.hp=0;f.box.drawEnemyArmor(e,{x:0,y:0});
    e.hp=e.maxHp;
  }
  assert.deepEqual(probe.calls.texts.filter(c=>c.tag==='armor').map(c=>c.args[0]),['I','II','I','II','I','II','I','II']);
  units[0].hp=units[0].maxHp*.5;units[1].hp=units[1].maxHp*.2;units[2].hp=units[2].maxHp*.19;units[3].hp=0;
  assert.equal(f.status().armoredCount,3);assert.equal(f.status().criticalArmorCount,2);
  units[0].x=5000;f.box.drawEnemyArmor(units[0],{x:0,y:0});assert.equal(probe.calls.texts.length,8);
  assert.ok(index.includes('drawEnemy(e,cam);drawEnemyArmor(e,cam);'),'Main render must actually draw the shield after the sprite');
});

const attacks=[['laser',.95],['fan',1.05],['triple',1.15],['pincer',1.15],['charge',1.2],['ring',1.2]];
function hostileFixture(ratio=1,options={}){
  const f=fixture(options);f.g.finalBossDead=false;f.usePlayerDamage();
  Object.assign(f.g.player,{hp:100000,maxHp:100000,shield:0,inv:0});
  const e=f.astraea.spawn(f.g,f.api,24);e.astraeaBrain.intro=0;e.hp=e.maxHp*ratio;
  return {f,e,b:e.astraeaBrain};
}
function beginHostile(f,e,pattern){
  const b=e.astraeaBrain;Object.assign(b,{pattern,cooldown:0,wind:0,warning:null,charge:null});
  f.astraea.step(e,.01,f.g,f.api);assert.ok(b.warning);return b.warning;
}
function fireHostile(f,e,pattern=1){
  const warning=beginHostile(f,e,pattern);f.astraea.step(e,warning.duration+.001,f.g,f.api);return warning;
}
function distanceToPath(x,y,s){
  const dx=s.x2-s.x,dy=s.y2-s.y,length2=dx*dx+dy*dy;
  const t=Math.max(0,Math.min(1,((x-s.x)*dx+(y-s.y)*dy)/Math.max(1e-30,length2)));
  return Math.hypot(x-s.x-t*dx,y-s.y-t*dy);
}
function projectileGeometry(s){return {x:s.x,y:s.y,vx:s.vx,vy:s.vy,r:s.r,ttl:s.ttl,damage:s.damage};}

test('all six ASTRAEA attacks retain fixed warnings through both phase boundaries and release only warned geometry',()=>{
  for(const [ratio,tier] of [[1,0],[.500001,0],[.5,1],[.200001,1],[.2,2]])for(let pattern=0;pattern<attacks.length;pattern++){
    const {f,e,b}=hostileFixture(ratio),warning=beginHostile(f,e,pattern);
    assert.equal(b.phase2,tier>=1);assert.equal(b.critical,tier===2);
    assert.equal(warning.type,attacks[pattern][0]);near(b.windMax,attacks[pattern][1]);
    const captured=JSON.parse(JSON.stringify(warning)),origin={x:e.x,y:e.y},hp=f.g.player.hp;
    // Changing course after the signal cannot move origins or retarget the warning.
    f.g.player.x+=200;f.g.player.y+=300;
    f.astraea.step(e,warning.duration-.01,f.g,f.api);
    assert.equal(f.g.player.hp,hp);assert.equal(f.g.ebullets.length,0);
    assert.deepEqual({x:e.x,y:e.y},origin);assert.deepEqual(JSON.parse(JSON.stringify(b.warning)),captured);
    f.astraea.step(e,.02,f.g,f.api);assert.equal(b.warning,null);assert.equal(b.lastAttack,warning.type);
    if(warning.projectiles.length){
      assert.equal(f.g.ebullets.length,warning.projectiles.length);
      assert.deepEqual(Array.from(f.g.ebullets,projectileGeometry),Array.from(warning.projectiles,projectileGeometry));
      assert.ok(f.g.ebullets.every(shot=>shot.enemyAstraeaShot&&shot.astraeaOwner===e&&shot.damage===14+tier*2));
      if(pattern===1)assert.equal(f.g.ebullets.length,[19,27,35][tier]);
    }else if(warning.type==='charge'){
      assert.deepEqual(JSON.parse(JSON.stringify(b.charge.segment)),captured.segments[0]);
      assert.equal(b.charge.speed,880+tier*100);assert.equal(b.charge.damage,22+tier*2);
    }else assert.deepEqual(Array.from(b.rays,r=>({x:r.x,y:r.y,x2:r.x2,y2:r.y2,halfWidth:r.halfWidth})),captured.segments);
  }
});

test('ASTRAEA pincer and ring keep the full visible lateral escape lane free for a player-sized body',()=>{
  for(const ratio of [1,.5,.2])for(const pattern of [3,5]){
    const {f,e,b}=hostileFixture(ratio),warning=fireHostile(f,e,pattern);
    assert.ok(warning.safeSegments.length===1);assert.ok(f.g.ebullets.length>0);
    const lane=warning.safeSegments[0],dx=lane.x2-lane.x,dy=lane.y2-lane.y;
    // Sample the advertised lane width, including its edges, against every
    // actual bullet's complete lifetime. This checks projectile radius too.
    const length=Math.hypot(dx,dy),nx=-dy/length,ny=dx/length;
    for(const along of [0,.2,.4,.5,.6,.8,1])for(const offset of [-lane.halfWidth,0,lane.halfWidth]){
      const x=lane.x+dx*along+nx*offset,y=lane.y+dy*along+ny*offset;
      for(const shot of f.g.ebullets){const travel={x:shot.x,y:shot.y,x2:shot.x+shot.vx*shot.ttl,y2:shot.y+shot.vy*shot.ttl};
        assert.ok(distanceToPath(x,y,travel)>=f.g.player.r+shot.r-1e-7,`${warning.type} crosses its displayed escape lane`);}
    }
    // Run the actual collision/update path with the player in the lane center.
    const hp=f.g.player.hp;f.g.player.x=warning.target.x;f.g.player.y=warning.target.y;
    b.cooldown=100;f.advance(3,.01);assert.equal(f.g.player.hp,hp);assert.equal(f.g.ebullets.length,0);
  }
});

test('all three real firing paths fill the 960 shared ceiling, honor 660/180/120 quotas, and recover only their own capacity',()=>{
  const f=fixture();ready(f);f.g.ebullets.length=0;
  for(let i=0;i<70;i++)f.patterns.fan(f.eclipses()[i%3],f.g,0);
  for(let i=0;i<100;i++){
    const e=f.escorts()[i%3];Object.assign(e.trueBrain,{wind:.001,windMax:.88,targetX:0,targetY:0,angle:0});
    f.trueEnd.step(e,.01,f.g,f.api);
  }
  const astraea=f.hostileAstraea()[0];
  for(let i=0;i<10;i++)fireHostile(f,astraea);
  assert.equal(f.g.ebullets.length,960);
  assert.deepEqual([f.g.ebullets.filter(b=>b.secretRuu).length,f.g.ebullets.filter(b=>b.secretReinforcement).length,
    f.g.ebullets.filter(b=>b.enemyAstraeaShot).length],[660,180,120]);
  assert.equal(f.secret.canEmitAstraea(f.g),false);assert.equal(f.secret.canEmitReinforcement(f.g),false);
  f.g.ebullets.splice(f.g.ebullets.findIndex(b=>b.enemyAstraeaShot),1);
  assert.equal(f.secret.canEmitAstraea(f.g),true);fireHostile(f,astraea);assert.equal(f.g.ebullets.length,960);
  f.g.ebullets.splice(f.g.ebullets.findIndex(b=>b.secretRuu),1);
  fireHostile(f,astraea);assert.equal(f.g.ebullets.length,959,'ASTRAEA cannot spend another group\'s free slot');
  f.patterns.fan(f.eclipses()[0],f.g,0);assert.equal(f.g.ebullets.length,960);
  assert.ok(f.g.ebullets.every(b=>[b.x,b.y,b.vx,b.vy,b.ttl,b.damage].every(Number.isFinite)));
});

test('standalone ASTRAEA uses its reserve and quota checks notice equal-length projectile replacements',()=>{
  const {f,e}=hostileFixture();assert.equal(f.secret.isActive(),false);
  for(let i=0;i<10;i++)fireHostile(f,e);
  assert.equal(f.g.ebullets.length,120);assert.equal(f.secret.canEmitAstraea(f.g),false);
  // Another system may replace a projectile without changing array identity or
  // length; allocator admission must inspect ownership rather than reuse a stale count.
  const list=f.g.ebullets,original=list[0];list.splice(0,1,{...original,enemyAstraeaShot:false,secretRuu:true});
  assert.equal(f.g.ebullets,list);assert.equal(f.g.ebullets.length,120);
  assert.equal(f.secret.canEmitAstraea(f.g),true);fireHostile(f,e);
  assert.equal(f.g.ebullets.length,121);assert.equal(f.g.ebullets.filter(b=>b.enemyAstraeaShot).length,120);
  assert.equal(f.secret.canEmitAstraea(f.g),false);
});

test('each large volley scans the shared projectile pool once rather than once per shot',()=>{
  const f=fixture();ready(f);let scans=0;
  const bullets=[];Object.defineProperty(bullets,Symbol.iterator,{value:function*(){scans++;yield* Array.prototype[Symbol.iterator].call(this);}});
  f.g.ebullets=bullets;
  f.patterns.fan(f.eclipses()[0],f.g,0);assert.equal(scans,1);assert.equal(bullets.length,24);
  scans=0;const e=f.escorts()[1];Object.assign(e.trueBrain,{wind:.001,windMax:.88,targetX:0,targetY:0,angle:0});
  f.trueEnd.step(e,.01,f.g,f.api);assert.equal(scans,1);
  scans=0;fireHostile(f,f.hostileAstraea()[0],5);assert.equal(scans,1);
});

test('hostile defeat and reset remove owned shots and attack registry without deleting other enemy projectiles',()=>{
  const {f,e,b}=hostileFixture();fireHostile(f,e,1);
  assert.ok(f.g.ebullets.length>0);const unrelated={x:1,y:2,vx:3,vy:4,r:5,ttl:6,damage:7,secretReinforcement:true};
  f.g.ebullets.push(unrelated);beginHostile(f,e,3);b.rays.push({life:.2});b.trails.push({life:.2});
  assert.equal(f.astraea.onDefeat(e),true);assert.equal(f.astraea.onDefeat(e),false);
  assert.deepEqual(Array.from(f.g.ebullets),[unrelated]);assert.equal(b.warning,null);assert.equal(b.charge,null);
  assert.equal(b.rays.length,0);assert.equal(b.trails.length,0);assert.equal(b.wind,0);
  f.astraea.step(e,10,f.g,f.api);assert.equal(f.g.ebullets.length,1);assert.equal(f.astraea.status(f.g).active,false);
  const next=f.astraea.spawn(f.g,f.api,24);next.astraeaBrain.intro=0;fireHostile(f,next,1);
  assert.ok(f.g.ebullets.some(shot=>shot.astraeaOwner===next));f.astraea.reset();
  assert.deepEqual(Array.from(f.g.ebullets),[unrelated]);assert.equal(f.astraea.status(f.g).active,false);
});

function escapeSimulation(ratio,{dashes=true,seconds=70}={}){
  const {f,e,b}=hostileFixture(ratio);f.applyMaximumSpeed();f.loadMovement();
  near(f.g.player.speed,304.5328);assert.equal(f.g.player.mods.speed,4);
  e.x=-1800;e.y=0;b.cooldown=1.1;f.box.keys.add('d');
  const metrics={phase:ratio===1?'normal':ratio===.5?'phase II':'critical',seconds,playerRunSpeed:f.g.player.speed,
    dashCount:0,hits:0,damage:0,attacks:[],maximumProjectiles:0,minimumRange:Infinity,maximumRange:0};
  let lastAttack=null;
  for(let frame=0;frame<seconds*100;frame++){
    if(dashes&&f.g.player.dash<=0){f.box.dash();metrics.dashCount++;}
    const hp=f.g.player.hp;f.update(.01);
    if(f.g.player.hp<hp){metrics.hits++;metrics.damage+=hp-f.g.player.hp;}
    if(b.lastAttack&&b.lastAttack!==lastAttack){metrics.attacks.push(b.lastAttack);lastAttack=b.lastAttack;}
    const range=Math.hypot(e.x-f.g.player.x,e.y-f.g.player.y);
    metrics.minimumRange=Math.min(metrics.minimumRange,range);metrics.maximumRange=Math.max(metrics.maximumRange,range);
    metrics.maximumProjectiles=Math.max(metrics.maximumProjectiles,f.g.ebullets.length);
    assert.ok(Number.isFinite(range));assert.ok(b.trails.length<=12&&b.rays.length<=3);
    assert.ok(!b.warning||b.warning.projectiles.length<=64);assert.ok(f.g.ebullets.length<=120);
  }
  metrics.minimumRange=+metrics.minimumRange.toFixed(2);metrics.maximumRange=+metrics.maximumRange.toFixed(2);
  metrics.damage=+metrics.damage.toFixed(2);simulations.push(metrics);
  return {f,e,b,metrics};
}
for(const ratio of [1,.5,.2])test(`natural six-attack cycle pressures maximum-speed straight retreat with repeated dashes (${ratio===1?'normal':ratio===.5?'phase II':'critical'})`,()=>{
  const {f,metrics}=escapeSimulation(ratio);
  assert.equal(f.box.state,'playing');assert.ok(metrics.dashCount>=23);
  assert.deepEqual(metrics.attacks.slice(0,6),attacks.map(a=>a[0]));
  assert.ok(metrics.hits>0,'Maximum run speed plus cooldown-limited dashes must not trivially outrun every attack');
  assert.ok(metrics.maximumRange<3200,'A simple retreat must not leave the encounter permanently out of reach');
});

test('changing direction after a predictive laser warning escapes damage while straight retreat is hit',()=>{
  function run(turn){
    const {f,e,b}=hostileFixture();f.applyMaximumSpeed();f.loadMovement();e.x=-1800;e.y=0;b.cooldown=.3;
    f.box.keys.add('d');let warning=null,hpAtSignal=0;
    for(let i=0;i<500;i++){
      f.update(.01);
      if(!warning&&b.warning){warning=JSON.parse(JSON.stringify(b.warning));hpAtSignal=f.g.player.hp;
        if(turn){f.box.keys.delete('d');f.box.keys.add('s');}}
      if(warning&&b.lastAttack==='laser')return {damage:hpAtSignal-f.g.player.hp,warning};
    }
    assert.fail('Natural first laser did not release');
  }
  const straight=run(false),turned=run(true);
  assert.equal(straight.damage,22);assert.equal(turned.damage,0);
  assert.deepEqual(straight.warning,turned.warning,'The same displayed attack must permit the direction-change escape');
  simulations.push({scenario:'predictive first laser',straightDamage:straight.damage,turnedDamage:turned.damage});
});

test('a three-minute full encounter stays bounded and finite through stationary and moving pressure',()=>{
  const f=fixture();f.reveal();f.usePlayerDamage();f.applyMaximumSpeed();f.loadMovement();
  Object.assign(f.g.player,{hp:100000,maxHp:100000,shield:0,inv:0});
  const metrics={scenario:'full seven-major encounter',seconds:180,maxEnemies:0,maxProjectiles:0,maxEclipse:0,maxDevora:0,maxAstraea:0};
  for(let frame=0;frame<180*50;frame++){
    const t=frame*.02;
    f.box.keys.clear();if(t>=40)f.box.keys.add(Math.floor((t-40)/12)%2?'s':'d');
    if(t>=40&&f.g.player.dash<=0)f.box.dash();
    if(t>=60&&t<60.02)for(const e of majorUnits(f))e.hp=e.maxHp*.19;
    f.update(.02);
    metrics.maxEnemies=Math.max(metrics.maxEnemies,f.g.enemies.length);
    metrics.maxProjectiles=Math.max(metrics.maxProjectiles,f.g.ebullets.length);
    const groups=[f.g.ebullets.filter(b=>b.secretRuu).length,f.g.ebullets.filter(b=>b.secretReinforcement).length,
      f.g.ebullets.filter(b=>b.enemyAstraeaShot).length];
    metrics.maxEclipse=Math.max(metrics.maxEclipse,groups[0]);metrics.maxDevora=Math.max(metrics.maxDevora,groups[1]);metrics.maxAstraea=Math.max(metrics.maxAstraea,groups[2]);
    assert.ok(groups[0]<=660&&groups[1]<=180&&groups[2]<=120&&f.g.ebullets.length<=960);
    assert.ok(f.g.enemies.length<=31);assert.ok(f.g.ebullets.every(b=>[b.x,b.y,b.vx,b.vy,b.ttl,b.damage].every(Number.isFinite)));
    for(const e of f.g.enemies){assert.ok([e.x,e.y,e.hp,e.speed].every(Number.isFinite));
      if(e.secretBrain)assert.ok(e.secretBrain.events.length<=30&&e.secretBrain.hazards.length<=30&&e.secretBrain.dashTrail.length<=12);
      if(e.astraeaBrain)assert.ok(e.astraeaBrain.trails.length<=12&&e.astraeaBrain.rays.length<=3);}
  }
  assert.equal(f.box.state,'playing');assert.equal(f.g.bossProgress.eclipseScreenSpawned,24);assert.equal(f.g.bossProgress.eclipseScreenWaves,2);
  assert.equal(f.status().remainingThreats,7);assert.equal(f.g.secretBossCleared,false);assert.equal(f.effects.ending.length,0);
  assert.ok(metrics.maxProjectiles>200,'The stress scenario must actually exercise a dense shared pool');
  simulations.push(metrics);
});

test('new ASTRAEA telegraphs and cached hostile shots render in every quality without fresh gradients after warmup',()=>{
  for(const quality of ['lite','auto','high','max']){
    const probe=recordingCanvas(),{f,e,b}=hostileFixture(.2,{canvasProbe:probe,quality}),ctx=probe.context('pressure');
    e.x=500;e.y=300;
    for(let pattern=0;pattern<attacks.length;pattern++){
      f.g.ebullets.length=0;const warning=beginHostile(f,e,pattern);
      f.astraea.drawGround(ctx,{x:0,y:0},f.g,quality);f.astraea.drawCharacter(ctx,e,{x:0,y:0},quality);
      f.astraea.step(e,warning.duration+.001,f.g,f.api);f.astraea.drawWorld(ctx,{x:0,y:0},f.g,quality);
      for(const shot of f.g.ebullets)assert.equal(f.secret.drawBullet(ctx,shot,{x:0,y:0},quality),true);
      const warm=probe.calls.gradients;
      for(const shot of f.g.ebullets)assert.equal(f.secret.drawBullet(ctx,shot,{x:0,y:0},quality),true);
      assert.equal(probe.calls.gradients,warm);b.charge=null;
    }
  }
  assert.ok(index.includes('(b.secretRuu||b.enemyAstraeaShot)&&window.RUU_SECRET_BOSS?.drawBullet'));
});

console.log(JSON.stringify({source:root,tests,simulations,pass:tests.filter(t=>t.status==='PASS').length,
  fail:tests.filter(t=>t.status==='FAIL').length},null,2));
if(tests.some(t=>t.status==='FAIL'))process.exitCode=1;
