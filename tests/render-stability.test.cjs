/* Focused call-order regression: execute the real canvas sizing and rAF loop. */
'use strict';
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const path=require('node:path');
const root=process.argv[2]||path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'index.html'),'utf8');

function extractFunction(name,required=true){
  const match=new RegExp('\\bfunction\\s+'+name+'\\s*\\(').exec(source);
  if(!match){if(required)throw Error('Missing function: '+name);return '';}
  const start=match.index,open=source.indexOf('{',start);
  let depth=0,quote=null,lineComment=false,blockComment=false;
  for(let i=open;i<source.length;i++){
    const ch=source[i],next=source[i+1];
    if(lineComment){if(ch==='\n')lineComment=false;continue;}
    if(blockComment){if(ch==='*'&&next==='/'){blockComment=false;i++;}continue;}
    if(quote){if(ch==='\\'){i++;continue;}if(ch===quote)quote=null;continue;}
    if(ch==='/'&&next==='/'){lineComment=true;i++;continue;}
    if(ch==='/'&&next==='*'){blockComment=true;i++;continue;}
    if(ch==='"'||ch==="'"||ch==='`'){quote=ch;continue;}
    if(ch==='{')depth++;
    if(ch==='}'&&--depth===0)return source.slice(start,i+1);
  }
  throw Error('Unclosed function: '+name);
}
const code=[extractFunction('syncCanvasResolution'),extractFunction('applyCanvasResolution',false),extractFunction('loop')].join('\n');

function fixture(phase='playing'){
  const events=[];let bitmap='DRAWN',width=1200,height=675,clock=0,updates=0,draws=0;
  const rect={width:1200,height:675};
  const canvas={
    getBoundingClientRect:()=>rect,
    get width(){return width},set width(value){width=value;bitmap='CLEARED';events.push('width:'+value)},
    get height(){return height},set height(value){height=value;bitmap='CLEARED';events.push('height:'+value)}
  };
  const context={setTransform(){events.push('transform')},imageSmoothingEnabled:true,imageSmoothingQuality:'high'};
  const box={
    c:canvas,ctx:context,W:1200,H:675,clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),
    window:{devicePixelRatio:1},document:{hidden:false},performance:{now:()=>++clock*8},
    state:phase,g:{},lastRafGap:0,lastRafAt:1000,rafGapSinceDraw:0,last:1000,lastUpdateMs:0,
    lastFpsState:phase,lastPaintState:phase,lastPaint:1000,updateCount:0,updateTotalMs:0,
    paintCount:0,paintTotalMs:0,perfTick:1000,nextPaintDue:2000,renderInterval:1000/30,
    renderScale:1,autoQuality:1,fxPreset:'auto',musicFade:null,canvasResizePending:false,autoHealthyWindows:0,
    update(){updates++},updateBossBreak(){},updateDeathSequence(){},updateEndingCinema(){},
    updateMusicFade(){},resetFpsMeter(){},render(){draws++;bitmap='DRAWN';events.push('render')},
    drawJoy(){},recordFpsSample(){},updateMusicUI(){},
    requestAnimationFrame(){events.push('yield:'+bitmap)}
  };
  vm.createContext(box);
  const perfPath=path.join(root,'performance-engine.js');
  if(fs.existsSync(perfPath))vm.runInContext(fs.readFileSync(perfPath,'utf8'),box);
  vm.runInContext(code,box);
  return {box,rect,events,canvas,bitmap:()=>bitmap,updates:()=>updates,draws:()=>draws,
    frame(now){vm.runInContext('loop('+now+');',box)},
    resize(){vm.runInContext('syncCanvasResolution();',box)}};
}

const tests=[];
function test(name,fn){try{fn();tests.push({name,status:'PASS'});}catch(error){tests.push({name,status:'FAIL',reason:error.message});}}
test('no extra painting without a deadline or resize',()=>{
  const f=fixture();f.frame(1016);assert.equal(f.draws(),0);assert.equal(f.bitmap(),'DRAWN');
});
test('AUTO pressure never exposes a cleared bitmap after painting',()=>{
  const f=fixture();Object.assign(f.box,{perfTick:0,lastRafAt:1200,last:1200,nextPaintDue:0,paintCount:29,paintTotalMs:800,updateCount:29,updateTotalMs:500});
  f.frame(1300);
  assert.equal(f.bitmap(),'DRAWN','Call order: '+f.events.join(' -> '));
  f.frame(1316);
  assert.equal(f.bitmap(),'DRAWN','Queued resize must be followed by a complete draw before yielding');
});
for(const phase of ['playing','start','paused','levelup','ending']){
  test('external resize is atomic and repaints '+phase,()=>{
    const f=fixture(phase);f.rect.width=1680;f.rect.height=945;f.resize();
    assert.equal(f.bitmap(),'DRAWN','Resize notification cleared the displayed bitmap before the next frame');
    f.frame(1016);
    assert.equal(f.draws(),1,'Dirty canvas must repaint even before normal deadline or in a frozen state');
    assert.equal(f.bitmap(),'DRAWN');
    assert.equal(f.canvas.width,1680);assert.equal(f.canvas.height,945);
    if(phase!=='playing')assert.equal(f.updates(),0,'Resize must not advance a frozen simulation');
  });
}
test('multiple resize notifications coalesce to one redraw',()=>{
  const f=fixture();
  for(const scale of [1.1,1.2,1.3]){f.rect.width=1200*scale;f.rect.height=675*scale;f.resize();}
  assert.equal(f.events.length,0,'Notifications must not mutate the live bitmap');
  f.frame(1016);assert.equal(f.draws(),1);assert.equal(f.canvas.width,1560);
  assert.equal(f.events.filter(x=>x.startsWith('width:')).length,1);
  assert.equal(f.events.filter(x=>x.startsWith('height:')).length,1);
});
test('same-size resize avoids backing-store clears',()=>{
  const f=fixture();f.resize();f.frame(1016);
  assert.equal(f.events.filter(x=>x.startsWith('width:')||x.startsWith('height:')).length,0);
  assert.equal(f.bitmap(),'DRAWN');
});
test('continued moderate pressure cannot raise already-low AUTO quality',()=>{
  const f=fixture();Object.assign(f.box,{autoQuality:.72,perfTick:0,last:1200,lastRafAt:1200,nextPaintDue:0,paintCount:25,paintTotalMs:520,updateCount:50,updateTotalMs:250});
  f.frame(1250);assert.ok(f.box.autoQuality<=.72,'AUTO quality increased to '+f.box.autoQuality+' during moderate pressure');
});

// Seed a real 1.25-second measurement window, then execute its final real loop.
// Counters represent work already completed; this keeps recovery tests fast and
// deterministic without reimplementing the production quality decision.
function measurement(f,now,{priorDraws=37,drawMs=8,updateMs=3}={}){
  Object.assign(f.box,{perfTick:now-1250,last:now-16,lastRafAt:now-16,nextPaintDue:0,
    paintCount:priorDraws,paintTotalMs:priorDraws*drawMs,updateCount:75,updateTotalMs:75*updateMs});
  f.frame(now);
}
test('quality recovery requires five consecutive healthy measurement windows',()=>{
  const f=fixture();f.box.autoQuality=.8;
  for(let i=1;i<=4;i++){measurement(f,i*1250);assert.equal(f.box.autoQuality,.8,'Recovered before the fifth healthy window');}
  measurement(f,6250);assert.ok(Math.abs(f.box.autoQuality-.84)<1e-9);
  measurement(f,7500);assert.ok(Math.abs(f.box.autoQuality-.84)<1e-9,'A recovery must start a fresh healthy-window count');
});
test('pressure interrupts and resets accumulated recovery headroom',()=>{
  const f=fixture();f.box.autoQuality=.8;
  for(let i=1;i<=4;i++)measurement(f,i*1250);
  measurement(f,6250,{priorDraws:26,drawMs:20});
  const lower=f.box.autoQuality;assert.ok(lower<.8,'Pressure should reduce quality when above its floor');
  assert.equal(f.box.autoHealthyWindows,0);
  for(let i=6;i<=9;i++){measurement(f,i*1250);assert.equal(f.box.autoQuality,lower,'Old healthy samples leaked through the pressure event');}
  measurement(f,12500);assert.ok(f.box.autoQuality>lower);
});
test('severe pressure cannot raise quality at its floor',()=>{
  const f=fixture();f.box.autoQuality=.72;
  measurement(f,1250,{priorDraws:21,drawMs:30,updateMs:18});
  assert.ok(f.box.autoQuality<=.72);assert.equal(f.box.autoHealthyWindows,0);
  assert.equal(f.bitmap(),'DRAWN');
});
test('AUTO lowers actual backing pixels below the former 95-percent floor',()=>{
  const f=fixture();f.box.autoQuality=.72;f.resize();f.frame(1016);
  assert.equal(f.canvas.width,864);assert.equal(f.canvas.height,486);
  assert.ok(f.canvas.width*f.canvas.height<1200*675*.6,'A low AUTO setting must materially reduce raster work');
  assert.equal(f.box.W,1200);assert.equal(f.box.H,675,'Logical gameplay coordinates must stay unchanged');
});
test('full quality and HIGH retain sharp sizing while capping excessive DPR',()=>{
  for(const [preset,quality,dpr,expected] of [['auto',1,1,1200],['auto',1,2,2400],['high',.72,2,2400],['high',1,4,2400]]){
    const f=fixture();Object.assign(f.box,{fxPreset:preset,autoQuality:quality});f.box.window.devicePixelRatio=dpr;
    f.resize();f.frame(1016);assert.equal(f.canvas.width,expected);assert.equal(f.canvas.height,expected*675/1200);
    assert.equal(f.bitmap(),'DRAWN');
  }
});
test('background-tab timing does not trigger AUTO quality changes',()=>{
  const f=fixture();f.box.autoQuality=.8;f.box.document.hidden=true;
  measurement(f,1250,{priorDraws:5,drawMs:30,updateMs:18});assert.equal(f.box.autoQuality,.8);
});

console.log(JSON.stringify({source:root,tests,pass:tests.filter(x=>x.status==='PASS').length,fail:tests.filter(x=>x.status==='FAIL').length},null,2));
if(tests.some(x=>x.status==='FAIL'))process.exitCode=1;
