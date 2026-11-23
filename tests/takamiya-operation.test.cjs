/* OPERATION: TAKAMIYA combat, barrage and rendering regressions. */
'use strict';
const assert=require('node:assert/strict');
const {root,TAU,fixture,recordingCanvas}=require('./combat-fixture.cjs');

const tests=[];
function test(name,fn){try{fn();tests.push({name,status:'PASS'});}catch(error){tests.push({name,status:'FAIL',reason:error.stack});}}
function near(actual,expected,message){assert.ok(Math.abs(actual-expected)<1e-8,message||`${actual} != ${expected}`);}
function assertPending(f){
  assert.equal(f.g.secretBossPending,true);assert.equal(f.g.secretBossCleared,false);
  assert.equal(f.g.secretRewardClear,false);assert.equal(f.effects.preloads,0);
  assert.equal(f.countAchievement('eclipse_clear'),0);assert.equal(f.effects.ending.length,0);
  assert.equal(f.effects.texts.filter(t=>t==='+38,000 BONUS').length,0);
  assert.equal(f.g.bossRewardCinematic,0);
}
function finishCinema(f){f.advance(3.1);assert.equal(f.effects.ending.length,1);assert.equal(f.box.state,'ending');}
function readySix(f){assert.equal(f.reveal(),true);f.advance(15.3);assert.equal(f.eclipses().length,3);assert.equal(f.escorts().length,3);}
function readySeven(f){assert.equal(f.reveal(),true);f.advance(23.3);assert.equal(f.eclipses().length,3);
  assert.equal(f.escorts().length,3);assert.equal(f.hostileAstraea().length,1);}

test('original final-core HP is checked before healing at the exact 50-percent boundary',()=>{
  for(const hp of [49,49.999,50,80]){
    const f=fixture();f.originalClear(hp);
    assert.ok(f.g.player.hp>hp,'The real core/collective reward must have healed the player');
    assert.equal(f.status().triggered,hp>=50,`Eligibility changed by reward healing at ${hp}%`);
    assert.equal(f.eclipses().length,hp>=50?3:0);
    if(hp>=50){near(f.status().qualifiedHp,hp/100);assertPending(f);}
  }
});
test('secret encounter requires true-end completion, a live player, and a non-ENDLESS run',()=>{
  for(const mode of ['normal','challenge','endless']){
    const f=fixture({mode});f.g.trueEndCleared=true;
    assert.equal(f.secret.reveal(f.g,f.api),mode!=='endless');
  }
  for(const scenario of [{cleared:false,hp:100},{cleared:true,hp:0}]){
    const f=fixture();f.g.trueEndCleared=scenario.cleared;f.g.player.hp=scenario.hp;
    assert.equal(f.secret.reveal(f.g,f.api),false);assert.equal(f.g.enemies.length,0);
  }
  const endless=fixture({mode:'endless'});endless.originalClear(100);
  assert.equal(endless.status().triggered,false);endless.update(.05);assert.equal(endless.effects.ending.length,0);
});
test('three independent full-health ECLIPSE units spawn once and reinforcements wait for combat time',()=>{
  const f=fixture();assert.equal(f.reveal(),true);
  const bosses=f.eclipses();assert.equal(bosses.length,3);assert.equal(new Set(bosses).size,3);
  assert.equal(new Set(bosses.map(e=>e.secretBrain)).size,3,'Each boss needs its own brain');
  for(const e of bosses){assert.equal(e.maxHp,Math.ceil((2350+24*33)*1.25));assert.equal(e.hp,e.maxHp);}
  assert.equal(f.status().eclipseTotal,3);assert.equal(f.status().eclipseRemaining,3);
  assert.equal(f.status().reinforcementTotal,3);assert.equal(f.status().reinforcementsSpawned,false);
  assert.equal(f.reveal(),false);assert.equal(f.eclipses().length,3);
  f.advance(3.1);assert.equal(f.escorts().length,0,'Intro cannot count toward the 12 combat seconds');
  f.advance(11.8);assert.equal(f.escorts().length,0);
  f.advance(.4);assert.equal(f.escorts().length,3);
  assert.deepEqual(Array.from(f.escorts(),e=>e.trueBossRole),['HUNTER','ORACLE','SIEGE']);
  assert.equal(f.status().reinforcementRemaining,3);assert.equal(f.status().reinforcementsSpawned,true);
  f.advance(2);assert.equal(f.escorts().length,3,'The reinforcement timer must not spawn a second wave');
});
test('defeating all three ECLIPSE early immediately summons the required DEVORA without clearing',()=>{
  const f=fixture();assert.equal(f.reveal(),true);const bosses=[...f.eclipses()];
  f.kill(bosses[0]);f.kill(bosses[1]);assert.equal(f.escorts().length,0);assertPending(f);
  f.kill(bosses[2]);assert.equal(f.escorts().length,3);assert.equal(f.status().eclipseRemaining,0);
  assert.equal(f.status().reinforcementRemaining,3);assertPending(f);
  f.update(.05);assert.equal(f.effects.ending.length,0);
});
test('each ECLIPSE changes phase and advances its own attack without overwriting another brain',()=>{
  const f=fixture();f.reveal();f.secret.tick(3.2,f.g,f.api);
  const [a,b,c]=f.eclipses();a.hp=a.maxHp*.47;b.hp=b.maxHp*.19;
  const bBefore=b.secretBrain.cooldown,cBefore=c.secretBrain.cooldown;
  f.secret.step(a,.1,f.g,f.api);
  assert.equal(a.secretBrain.enraged,true);assert.equal(a.secretBrain.frenzy,false);
  assert.equal(b.secretBrain.enraged,false);assert.equal(c.secretBrain.enraged,false);
  assert.equal(b.secretBrain.cooldown,bBefore);assert.equal(c.secretBrain.cooldown,cBefore);
  f.secret.step(b,.1,f.g,f.api);f.secret.step(c,.1,f.g,f.api);
  assert.equal(b.secretBrain.enraged,true);assert.equal(b.secretBrain.frenzy,true);
  assert.equal(c.secretBrain.enraged,false);assert.equal(c.secretBrain.frenzy,false);
  assert.notEqual(a.secretBrain.events,b.secretBrain.events);assert.notEqual(b.secretBrain.hazards,c.secretBrain.hazards);
  Object.assign(a.secretBrain,{pattern:0,wind:.001,windMax:.8,aim:0});
  const patternB=b.secretBrain.pattern,emittedB=b.secretBrain.emitted,patternC=c.secretBrain.pattern;
  f.secret.step(a,.01,f.g,f.api);
  assert.ok(a.secretBrain.emitted>0);assert.equal(a.secretBrain.pattern,1);
  assert.equal(b.secretBrain.emitted,emittedB);assert.equal(b.secretBrain.pattern,patternB);
  assert.equal(c.secretBrain.pattern,patternC);
});
test('reinforcements retain their own arrival protection and attack after the old true-end has finished',()=>{
  const f=fixture();f.originalClear(80);const original=f.trueEnd.status(f.g);
  assert.equal(original.active,false);f.advance(15.3);
  const escort=f.escorts()[0];assert.equal(f.trueEnd.isIntro(escort),true);
  const hp=escort.hp;assert.equal(f.hit(escort,100),0);assert.equal(escort.hp,hp);
  f.advance(1.3);assert.equal(f.trueEnd.isIntro(escort),false);assert.ok(f.hit(escort,100)>0);
  for(const e of f.escorts())Object.assign(e.trueBrain,{cd:0,wind:0});
  f.advance(1.5);
  assert.ok(f.escorts().every(e=>e.trueBrain.shots>0),'All three original roles must actually attack');
  assert.ok(f.g.ebullets.some(b=>b.secretReinforcement));
  assert.equal(f.trueEnd.status(f.g).active,false);assert.equal(f.trueEnd.status(f.g).remaining,0);
  assert.equal(f.trueEnd.status(f.g).hp,0,'Secret escorts must not repopulate the original collective health bar');
});

for(const order of ['eclipse-first','devora-first','interleaved','same-update']){
  test(`all-seven clear, reward, achievement and ending are single-shot (${order})`,()=>{
    const f=fixture();f.originalClear(80);f.advance(23.3);
    const bosses=[...f.eclipses()],escorts=[...f.escorts()],astraea=f.hostileAstraea()[0];assert.ok(astraea);
    const baseline={grants:f.rewards.status().grants,core:f.countAchievement('true_core'),
      trinity:f.countAchievement('true_trinity'),trueKilled:f.g.bossProgress.trueKilled,
      trueTotal:f.g.bossProgress.trueTotal};
    const enemies=order==='eclipse-first'?[...bosses,...escorts,astraea]:order==='devora-first'?[...escorts,astraea,...bosses]:
      [bosses[0],escorts[0],astraea,bosses[1],escorts[1],bosses[2],escorts[2]];
    if(order==='same-update')for(const e of enemies)e.hp=0;
    for(const [i,e] of enemies.entries()){
      f.kill(e);
      if(i<6){assertPending(f);if(order!=='same-update')f.update(.01);}
    }
    assert.equal(f.status().eclipseRemaining,0);assert.equal(f.status().reinforcementRemaining,0);
    assert.equal(f.status().finished,true);assert.equal(f.status().active,false);
    assert.equal(f.g.secretBossPending,false);assert.equal(f.g.secretBossCleared,true);
    assert.equal(f.g.bossProgress.eclipseTotal,3);assert.equal(f.g.bossProgress.eclipseKilled,3);
    assert.equal(f.g.bossProgress.eclipseDevoraTotal,3);assert.equal(f.g.bossProgress.eclipseDevoraKilled,3);
    assert.equal(f.g.bossProgress.eclipseAstraeaTotal,1);assert.equal(f.g.bossProgress.eclipseAstraeaKilled,1);
    assert.equal(f.g.secretRewardClear,true);assert.equal(f.g.bossRewardCinematic,2.75);
    assert.equal(f.countAchievement('eclipse_clear'),1);assert.equal(f.effects.preloads,1);
    assert.equal(f.rewards.status().grants-baseline.grants,4,'Three escort rewards plus one grand package');
    assert.equal(f.effects.texts.filter(t=>t==='+38,000 BONUS').length,1,'The 38,000-point grand package must be granted exactly once');
    assert.equal(f.effects.toasts.filter(t=>t==='DEVORA COLLECTIVE // ANNIHILATED').length,1);
    assert.equal(f.countAchievement('true_core'),baseline.core);assert.equal(f.countAchievement('true_trinity'),baseline.trinity);
    assert.equal(f.g.bossProgress.trueKilled,baseline.trueKilled);assert.equal(f.g.bossProgress.trueTotal,baseline.trueTotal);
    assert.equal(f.trueEnd.status(f.g).remaining,0);assert.equal(f.trueEnd.status(f.g).total,3);
    const after={score:f.g.score,kills:f.g.kills,xp:f.g.xp,grants:f.rewards.status().grants};
    for(const e of enemies){f.box.killEnemy(e);assert.equal(f.secret.onKill(e,f.g,f.api),false);}
    assert.deepEqual({score:f.g.score,kills:f.g.kills,xp:f.g.xp,grants:f.rewards.status().grants},after);
    assert.equal(f.countAchievement('eclipse_clear'),1);assert.equal(f.effects.preloads,1);
    assert.equal(f.effects.ending.length,0);f.advance(2.5);assert.equal(f.effects.ending.length,0);
    finishCinema(f);f.box.endGame(true);f.update(.05);
    assert.equal(f.effects.ending.length,1);assert.equal(f.effects.saves,1);
    assert.deepEqual(f.effects.ending[0],{preview:false,complete:true});
  });
}
test('quintet progression and collective rewards are not repeated by secret DEVORA',()=>{
  const f=fixture();f.originalClear(80,true);assert.equal(f.g.bossProgress.trueKilled,5);
  assert.equal(f.countAchievement('true_quintet'),1);f.advance(15.3);
  const before=f.rewards.status().grants;
  for(const e of [...f.escorts()])f.kill(e);
  assert.equal(f.rewards.status().grants-before,3);assert.equal(f.countAchievement('true_core'),5);
  assert.equal(f.countAchievement('true_quintet'),1);assert.equal(f.g.bossProgress.trueTotal,5);
  assert.equal(f.trueEnd.status(f.g).total,5);assert.equal(f.trueEnd.status(f.g).remaining,0);assertPending(f);
});
test('lethal enemy contact cannot trigger a postmortem final kill, reward heal or complete ending',()=>{
  const f=fixture();readySeven(f);f.advance(2.1);
  const enemies=[...f.eclipses(),...f.hostileAstraea(),...f.escorts()],last=enemies.at(-1);
  for(const e of enemies.slice(0,-1))f.kill(e);
  f.g.player.hp=1;f.g.player.inv=0;last.x=f.g.player.x;last.y=f.g.player.y;
  last.hp=1;last.attack=0;last.trueIntro=0;
  Object.assign(last.trueBrain,{cd:100,wind:0});
  let orbitCalls=0;
  f.box.damagePlayer=()=>{f.g.player.hp=0;f.box.state='dying';};
  f.box.applyOrbit=()=>{orbitCalls++;f.kill(last);};
  f.g.bullets.push({x:last.x,y:last.y,vx:0,vy:0,r:20,ttl:1,dmg:9999,kind:'pulse',hit:new Set(),pierce:0});
  const before={score:f.g.score,grants:f.rewards.status().grants,kills:f.g.kills};
  f.update(.05);
  assert.equal(f.box.state,'dying');assert.equal(f.g.player.hp,0);assert.equal(orbitCalls,0);
  assert.equal(last.hp,1,'Already-fired player bullets must not kill after the lethal contact');
  assert.deepEqual({score:f.g.score,grants:f.rewards.status().grants,kills:f.g.kills},before);
  assertPending(f);
});
test('a new run resets encounter totals, timers, rewards and completion state',()=>{
  const f=fixture();readySeven(f);for(const e of [...f.eclipses(),...f.escorts(),...f.hostileAstraea()])f.kill(e);
  assert.equal(f.g.secretBossCleared,true);assert.ok(f.rewards.status().grants>0);
  f.reset();const status=f.status();
  assert.equal(status.triggered,false);assert.equal(status.active,false);assert.equal(status.finished,false);
  assert.equal(status.emitted,0);assert.equal(status.reinforcementsSpawned,false);
  assert.equal(f.g.secretBossCleared,false);assert.equal(f.g.secretBossPending,false);
  assert.equal(f.g.secretRewardClear,false);assert.equal(f.g.trueEndRewardGranted,false);
  assert.equal(f.g.bossProgress.eclipseKilled,0);assert.equal(f.g.bossProgress.eclipseDevoraKilled,0);
  assert.equal(f.rewards.status().grants,0);assert.equal(f.g.enemies.length,0);assert.equal(f.g.ebullets.length,0);
  assert.equal(f.reveal(),true);assert.equal(f.eclipses().length,3);
  for(const e of f.eclipses()){assert.equal(e.secretBrain.emitted,0);assert.equal(e.secretBrain.frenzy,false);}
  f.advance(3.1);assert.equal(f.escorts().length,0);
});

function permittedAngles(n,safe,gap,rotation=0){
  return Array.from({length:n},(_,i)=>i*TAU/n+rotation).filter(a=>{
    const d=Math.abs(Math.atan2(Math.sin(a-safe),Math.cos(a-safe)));
    return d>=gap&&Math.abs(d-Math.PI)>=gap;
  });
}
function assertOutsideGaps(angles,safe,gap){
  for(const a of angles){const d=Math.abs(Math.atan2(Math.sin(a-safe),Math.cos(a-safe)));
    assert.ok(d+1e-9>=gap&&Math.abs(d-Math.PI)+1e-9>=gap,'A new projectile filled an original safe passage');}
}
function assertOriginalRays(actual,original){
  for(const a of original)assert.ok(actual.some(b=>Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)))<1e-8),
    'An original safe projectile ray was removed rather than adding density');
}
const phases=[
  {name:'normal',hot:false,frenzy:false,fan:12,wide:14,ring:28,hazard:11,curtain:17,halo:26},
  {name:'phase II',hot:true,frenzy:false,fan:15,wide:17,ring:34,hazard:14,curtain:20,halo:31},
  {name:'LAST LIGHT',hot:true,frenzy:true,fan:19,wide:22,ring:42,hazard:14,curtain:24,halo:38}
];
for(const phase of phases){
  test(`every actual barrage pattern delivers 200-percent counts with safe lanes in ${phase.name}`,()=>{
    const safe=.17,rotation=.09,haloLayer=1;
    const originalRing=permittedAngles(phase.ring,safe,.42,rotation);
    const originalHalo=permittedAngles(phase.halo,safe+haloLayer*.13,.39,haloLayer*.10);
    const cases=[
      {name:'fan',base:phase.fan,damage:phase.hot?13:11,fire:(p,e,g)=>p.fan(e,g,0)},
      {name:'wide fan',base:phase.wide,damage:phase.hot?13:11,fire:(p,e,g)=>p.fan(e,g,0,0,true)},
      {name:'ring',base:originalRing.length,damage:phase.hot?12:10,fire:(p,e,g)=>p.ring(e,g,safe,rotation),
        verify:bullets=>{const angles=bullets.map(b=>Math.atan2(b.vy,b.vx));assertOutsideGaps(angles,safe,.42);assertOriginalRays(angles,originalRing);}},
      {name:'rush',base:7,damage:phase.hot?11:9,fire:(p,e,g)=>p.rushShards(e,g)},
      {name:'cross',base:36,damage:phase.hot?12:10,fire:(p,e,g)=>p.crossCage(e,g,0,0),verify:bullets=>{
        for(const b of bullets){if(Math.abs(b.vx)>Math.abs(b.vy))assert.ok(Math.abs(b.y)>=43-1e-8);
          else assert.ok(Math.abs(b.x)>=54-1e-8);}}},
      {name:'slash',base:5,damage:phase.hot?14:12,fire:(p,e,g)=>p.slash(e,g,0,0)},
      {name:'hazard',base:phase.hazard,damage:phase.hot?11:9,fire:(p,e,g,api)=>p.explodeHazard(e,{x:100,y:100,r:90},g,api)},
      {name:'curtain',base:phase.curtain,damage:phase.hot?12:10,fire:(p,e,g)=>p.eclipseCurtain(e,g,0)},
      {name:'halo',base:originalHalo.length,damage:phase.hot?12:10,fire:(p,e,g)=>p.collapsingHalo(e,g,0,0,haloLayer),
        verify:bullets=>{const angles=bullets.map(b=>Math.atan2(b.y,b.x));
          assertOutsideGaps(angles,safe+haloLayer*.13,.39);assertOriginalRays(angles,originalHalo);}}
    ];
    for(const quality of ['lite','auto','max'])for(const pattern of cases){
      const f=fixture({quality});f.reveal();const e=f.eclipses()[0];
      Object.assign(e.secretBrain,{enraged:phase.hot,frenzy:phase.frenzy,aim:safe,dashDirX:1,dashDirY:0});
      const counts=[];
      for(let cast=0;cast<2;cast++){
        f.g.ebullets.length=0;pattern.fire(f.patterns,e,f.g,f.api);counts.push(f.g.ebullets.length);
        pattern.verify?.(f.g.ebullets);
        assert.ok(f.g.ebullets.every(b=>[b.x,b.y,b.vx,b.vy,b.ttl].every(Number.isFinite)),pattern.name+' emitted invalid geometry');
        assert.ok(f.g.ebullets.every(b=>b.damage===Math.ceil(pattern.damage*1.15)),pattern.name+' lost the stronger projectile damage');
      }
      assert.deepEqual(counts,[pattern.base*2,pattern.base*2],`${pattern.name} (${quality})`);
      assert.equal(counts[0]+counts[1],pattern.base*4);
    }
  });
}
test('each ECLIPSE doubles odd-sized patterns without a leftover half-shot carry',()=>{
  const f=fixture();f.reveal();const [a,b]=f.eclipses();
  const fire=(e,name)=>{f.g.ebullets.length=0;
    if(name==='rush')f.patterns.rushShards(e,f.g);else f.patterns.slash(e,f.g,0,0);
    return f.g.ebullets.length;};
  assert.deepEqual([fire(a,'rush'),fire(b,'rush'),fire(a,'slash'),fire(b,'slash')],[14,14,10,10]);
  assert.deepEqual([fire(a,'rush'),fire(b,'rush'),fire(a,'slash'),fire(b,'slash')],[14,14,10,10]);
});
test('ECLIPSE and DEVORA respect their 660/180 quotas and leave ASTRAEA its 120-shot reserve',()=>{
  const f=fixture();readySix(f);const bosses=f.eclipses(),escorts=f.escorts();f.g.ebullets.length=0;
  for(let i=0;i<70;i++)f.patterns.fan(bosses[i%3],f.g,0);
  assert.equal(f.g.ebullets.length,660,'ECLIPSE must leave both reinforcement reserves');
  for(const e of escorts)e.trueIntro=0;
  for(let i=0;i<100;i++){
    const e=escorts[i%3];Object.assign(e.trueBrain,{wind:.001,windMax:.88,targetX:0,targetY:0,angle:0});
    f.trueEnd.step(e,.01,f.g,f.api);
  }
  assert.equal(f.g.ebullets.filter(b=>b.secretReinforcement).length,180);
  assert.equal(f.g.ebullets.length,840);assert.equal(f.secret.canEmitReinforcement(f.g),false);
  f.patterns.fan(bosses[0],f.g,0);assert.equal(f.g.ebullets.length,840);
  const removed=f.g.ebullets.findIndex(b=>b.secretReinforcement);f.g.ebullets.splice(removed,1);
  assert.equal(f.secret.canEmitReinforcement(f.g),true);
  Object.assign(escorts[0].trueBrain,{wind:.001});f.trueEnd.step(escorts[0],.01,f.g,f.api);
  assert.equal(f.g.ebullets.length,840);assert.equal(f.g.ebullets.filter(b=>b.secretReinforcement).length,180);
  assert.equal(f.status().projectilesCap,960);assert.equal(f.secret.canEmitAstraea(f.g),true);
});

test('all three bosses render with atlas, static-art fallback and missing art in every quality mode',()=>{
  for(const artMode of ['atlas','static','missing'])for(const quality of ['lite','auto','high','max']){
    const probe=recordingCanvas(),f=fixture({canvasProbe:probe,quality});f.reveal();
    Object.assign(f.secret.ART,{complete:artMode!=='missing',naturalWidth:900,naturalHeight:1400});
    Object.assign(f.secret.ATLAS,{complete:artMode==='atlas',naturalWidth:artMode==='atlas'?1280:0,naturalHeight:1280});
    const ctx=probe.context('live'),cam={x:0,y:0};
    f.secret.tick(.2,f.g,f.api);f.secret.drawScreen(ctx,1200,675,f.g,quality);
    f.secret.tick(3.1,f.g,f.api);
    for(const [i,e] of f.eclipses().entries()){
      e.x=250+i*320;e.y=350;e.flash=.1;
      Object.assign(e.secretBrain,{anim:'attack',wind:.35,windMax:.8,pattern:[3,6,7][i],
        facing:i%2?-1:1,targetX:600,targetY:337,aim:.3,dashPause:.1,dashDirX:1,dashDirY:0,
        releaseFlash:.2,slashFlash:.1,slashAim:.5,enraged:i>0,frenzy:i===2,
        dashTrail:[{x:e.x-30,y:e.y,life:.15}],hazards:[{x:e.x+20,y:e.y+30,r:90,time:.4,max:1}],
        crossWarning:{x:600,y:337,time:.3,max:.48}});
      f.secret.drawCharacter(ctx,e,cam,quality);
    }
    f.secret.drawGround(ctx,cam,f.g,quality);f.secret.drawScreen(ctx,1200,675,f.g,quality);
    const labels=probe.calls.texts.filter(c=>c.tag==='live'&&String(c.args[0]).startsWith('ECLIPSE / '));
    assert.equal(labels.length,3,`${artMode}/${quality}: every boss needs its own rendered label`);
    if(artMode==='atlas')assert.ok(probe.calls.images.filter(c=>c.args[0]===f.secret.ATLAS).length>=3);
    if(artMode==='static')assert.ok(probe.calls.images.filter(c=>c.args[0]===f.secret.ART).length>=3);
  }
});
test('three frenzied bosses composite one shared full-screen tint and one phase pulse',()=>{
  const probe=recordingCanvas(),f=fixture({canvasProbe:probe});f.reveal();f.secret.tick(3.2,f.g,f.api);
  const ctx=probe.context('screen');
  for(const e of f.eclipses())Object.assign(e.secretBrain,{frenzy:true,phasePulse:0,frenzyPulse:0});
  f.secret.drawScreen(ctx,1200,675,f.g,'auto');
  const fills=()=>probe.calls.rects.filter(c=>c.tag==='screen'&&c.args.join(',')==='0,0,1200,675').length;
  assert.equal(fills(),1,'The three individual boss tints must not multiply screen darkness');
  probe.calls.rects.length=0;
  for(const e of f.eclipses())Object.assign(e.secretBrain,{frenzy:false,phasePulse:1.2,frenzyPulse:1.5});
  f.secret.drawScreen(ctx,1200,675,f.g,'auto');assert.equal(fills(),1);
});
test('all seven projectile glyphs and premium tails reuse cached gradients after warmup',()=>{
  const probe=recordingCanvas(),f=fixture({canvasProbe:probe}),ctx=probe.context('bullets'),cam={x:0,y:0};
  const bullets=['crescent','halo','needle','blade','prism','core','ember'].map((fxType,i)=>
    ({secretRuu:true,fxType,x:120+i*40,y:200,vx:250,vy:30,r:7,born:.5}));
  for(const b of bullets)assert.equal(f.secret.drawBullet(ctx,b,cam,'auto'),true);
  const warmed=probe.calls.gradients;assert.ok(warmed>0,'Warmup must actually build cached glyph/tail art');
  for(const quality of ['auto','high','max','lite'])for(const b of bullets)
    assert.equal(f.secret.drawBullet(ctx,b,cam,quality),true);
  assert.equal(probe.calls.gradients,warmed,'Warm projectile rendering must not create new gradients');
  assert.ok(probe.calls.images.filter(c=>c.tag==='bullets').length>=35);
});

console.log(JSON.stringify({source:root,tests,pass:tests.filter(t=>t.status==='PASS').length,
  fail:tests.filter(t=>t.status==='FAIL').length},null,2));
if(tests.some(t=>t.status==='FAIL'))process.exitCode=1;
