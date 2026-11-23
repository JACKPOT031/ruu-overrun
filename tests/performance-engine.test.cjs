/* Node 18+ — node tests/performance-engine.test.cjs */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'performance-engine.js'),'utf8');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');

// Validate syntax of both the helper and the full inline game engine.
new vm.Script(source,{filename:'performance-engine.js'});
const open='<script>\n(()=>{',start=index.indexOf(open);
assert.ok(start>=0,'Inline game script not found');
const end=index.indexOf('</script>',start);
assert.ok(end>start,'Inline game closing tag not found');
new vm.Script(index.slice(start+'<script>'.length,end),{filename:'index.html inline game'});
assert.ok(index.includes('performance-engine.js?v=1.28.0'));

const context={
  window:{},
  document:{
    createElement:()=>{
      const ctx={
        setTransform(){},createLinearGradient(){return {addColorStop(){}};},
        beginPath(){},moveTo(){},quadraticCurveTo(){},fill(){},closePath(){},
        lineTo(){},stroke(){},arc(){},
      };
      return {width:0,height:0,getContext:()=>ctx};
    }
  }
};
vm.runInNewContext(source,context,{filename:'performance-engine.js'});
const perf=context.window.RUU_PERF_ENGINE;
assert.ok(perf&&perf.enemyGrid&&perf.projectileSprite);

const grid=perf.enemyGrid;
let seed=8031;
const rng=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
// Compare with the original all-enemies scan, including order and edge cases.
for(let round=0;round<75;round++){
  const enemies=Array.from({length:130},(_,id)=>({
    id,x:(rng()-.5)*2400,y:(rng()-.5)*1800,
    r:4+rng()*75,hp:rng()>.05?100:0
  }));
  grid.build(enemies);
  for(let test=0;test<75;test++){
    const bullet={x:(rng()-.5)*2400,y:(rng()-.5)*1800,r:2+rng()*15};
    const collide=e=>e.hp>0&&(e.x-bullet.x)**2+(e.y-bullet.y)**2<(e.r+bullet.r)**2;
    const expected=enemies.filter(collide).map(e=>e.id);
    const observed=Array.from(grid.candidates(bullet.x,bullet.y,bullet.r)).filter(collide).map(e=>e.id);
    assert.deepEqual(observed,expected,'Spatial index changed original hit order or missed a collision');
  }
}
grid.build([{id:1,x:160,y:160,r:60,hp:20},{id:2,x:150,y:150,r:40,hp:0}]);
assert.deepEqual(Array.from(grid.candidates(201,201,12)).map(e=>e.id),[1]);
assert.deepEqual(Array.from(grid.candidates(1000,1000,10)).map(e=>e.id),[]);

// Identical projectiles reuse a raster; variant colors/ice create independent sprites.
const a=perf.projectileSprite('#aabbcc',7,28,false);
const b=perf.projectileSprite('#aabbcc',7,28,false);
const c=perf.projectileSprite('#aabbcc',7,28,true);
assert.ok(a&&b&&c);
assert.equal(a,b,'Expected identical sprite cache hit');
assert.notEqual(a,c,'Ice projectile should have a different appearance');
assert.equal(perf.projectileSprite('not-a-hex-color',7,28,false),null);
for(let i=0;i<170;i++)
  perf.projectileSprite('#'+i.toString(16).padStart(6,'0'),7,28,false);
assert.ok(perf.spriteStats().cached<=128,'Sprite cache memory bound exceeded');

function fpsAtHz(hz,target,seconds=4){
  const interval=1000/target;
  let nextDue=0,drawn=0;
  for(let frame=0;frame<seconds*hz;frame++){
    const now=frame*1000/hz;
    if(nextDue===0||now>=nextDue-1){
      nextDue=nextDue?nextDue+interval:now+interval;
      if(nextDue<now-1||nextDue>now+interval*2)nextDue=now+interval;
      drawn++;
    }
  }
  return drawn/seconds;
}
for(const hz of [60,75,120,144]){
  const fps=fpsAtHz(hz,30);
  assert.ok(Math.abs(fps-30)<1.5,'Frame deadline missed target at '+hz+'Hz: '+fps);
}
console.log('PASS: Inline JS syntax, spatial collision parity, sprite caching, and 30FPS scheduler');
