/* Node audio test: approved G PCM and runtime mixing with a mock WebAudio graph. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),crypto=require('node:crypto');
const {atob}=require('node:buffer');
const root=process.argv[2]||path.resolve(__dirname,'..');
const code=fs.readFileSync(path.join(root,'audio-engine.js'),'utf8');
const assetCode=fs.readFileSync(path.join(root,'audio-slash-samples.js'),'utf8');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
function setup(store=new Map(),blocked=false,stereo=true,assetMode='approved'){
 let sounds=[],buffers=[],tasks=[],decodes=[],warnings=[],master=0,stopped=0;
 const param=()=>({value:0,events:[],cancelScheduledValues(t){this.events=this.events.filter(e=>e.t<t);},setTargetAtTime(v,t,tau){this.events.push({v,t,tau});this.value=v;master=v;}});
 const node=()=>({connections:[],connect(n){this.connections.push(n);},disconnect(){this.disconnected=true;}});
 const ac={state:'running',currentTime:5,createBuffer(ch,len,rate){const a=Array.from({length:ch},()=>new Float32Array(len));const b={duration:len/rate,sampleRate:rate,numberOfChannels:ch,length:len,getChannelData:i=>a[i],a};buffers.push(b);return b;},createBufferSource(){const src={...node(),playbackRate:{value:1},start(){sounds.push(src);},stop(){stopped++;this.onended?.();}};return src;},createGain(){return {...node(),gain:param()};}};
 if(stereo)ac.createStereoPanner=()=>({...node(),pan:{value:0}});
 const isolatedMath=Object.create(Math);isolatedMath.random=()=>{throw Error('audio consumed game RNG');};
 const box={Math:isolatedMath,Float32Array,Number,Array,Object,Map,Set,WeakMap,atob(s){decodes.push(s.length);return atob(s);},console:{warn:m=>warnings.push(m)},requestIdleCallback:fn=>tasks.push(fn),localStorage:{getItem:k=>{if(blocked)throw Error('blocked');return store.get(k)||null;},setItem:(k,v)=>{if(blocked)throw Error('blocked');store.set(k,v);}}};box.window=box;
 if(assetMode!=='missing')vm.runInNewContext(assetCode,box);
 if(assetMode==='corrupt')box.RUU_SLASH_SAMPLES.cues.shoot.pcm='!'.repeat(box.RUU_SLASH_SAMPLES.cues.shoot.pcm.length);
 if(assetMode==='no-atob')delete box.atob;
 vm.runInNewContext(code,box);
 const engine={ac,gain:{...node(),gain:param()}};
 return {s:box.RUU_AUDIO,asset:box.RUU_SLASH_SAMPLES,engine,sounds,buffers,tasks,decodes,warnings,store,master:()=>master,stopped:()=>stopped};
}
let count=0;function test(n,fn){fn();console.log('PASS',n);count++;}
test('all original cooldown events resolve and produce finite stereo bounded PCM',()=>{const f=setup();const gap=index.match(/const SFX_GAP=\{([^}]+)\}/)[1];for(const name of gap.split(',').map(x=>x.split(':')[0])){assert.ok(f.s.resolve(name),name);assert.equal(f.s.play(name,f.engine),true);const src=f.sounds.at(-1);assert.ok(src.buffer.duration>0&&src.buffer.duration<3,name);assert.equal(src.buffer.sampleRate,48000);let p=0,diff=0;for(let i=0;i<src.buffer.a[0].length;i++){const l=src.buffer.a[0][i],r=src.buffer.a[1][i];assert.ok(Number.isFinite(l)&&Number.isFinite(r));p=Math.max(p,Math.abs(l),Math.abs(r));diff+=Math.abs(l-r);}assert.ok(p>.005&&p<1,name+' audible unclipped source');assert.ok(diff>0);src.onended();}assert.equal(f.s.stats(f.engine).active,0);assert.equal(f.s.sampleSource(),'approved-g');assert.equal(f.warnings.length,0);});
test('three distinct JACKPOT and nine distinct finisher buffers',()=>{const f=setup(),keys=[];for(const [name,n,field] of [['jackpot',3,'jackpotType'],['signature',9,'finisherType']])for(let i=0;i<n;i++){keys.push(f.s.resolve(name,{[field]:i}));f.s.play(name,f.engine,{[field]:i});f.sounds.at(-1).onended();}assert.equal(new Set(keys).size,12);assert.equal(new Set(f.buffers).size,12);const signatures=f.buffers.map(b=>{let hash=2166136261;for(let i=0;i<b.a[0].length;i+=23)hash=Math.imul(hash^Math.round(b.a[0][i]*32767),16777619);return hash;});assert.equal(new Set(signatures).size,12,'each variant has a different waveform');});
test('boss cues distinct and audio-only, cache reused',()=>{const f=setup(),cues=['devora','nullEmperor','trueTrinity','trueQuintet','eclipse','astraea','eclipseReinforce','eclipsePhase','eclipseLast','bossPhase3'];for(const cue of cues){assert.equal(f.s.resolve('boss',{cue}),cue);f.s.play('boss',f.engine,{cue});f.sounds.at(-1).onended();}assert.equal(f.buffers.length,cues.length);f.s.play('boss',f.engine,{cue:'devora'});assert.equal(f.buffers.length,cues.length);});
test('routine voice cap, reserve for major and bounded priority stealing',()=>{const f=setup();for(let i=0;i<100;i++)f.s.play('hit',f.engine);assert.equal(f.s.stats(f.engine).active,16);assert.equal(f.s.stats(f.engine).cache,3);for(let i=0;i<20;i++)f.s.play('boss',f.engine);assert.equal(f.s.stats(f.engine).active,24);assert.equal(f.s.stats(f.engine).peak,24);assert.ok(f.stopped()>0);assert.ok(f.s.stats(f.engine).dropped>0);f.s.stopAll(f.engine);assert.equal(f.s.stats(f.engine).active,0);});
test('voice release and spatial mix preserve G playback speed',()=>{const f=setup();f.s.play('shoot',f.engine,{pan:-.5,distance:200});f.s.play('shoot',f.engine,{pan:.5,distance:300});assert.equal(f.buffers.length,2);assert.notEqual(f.sounds[0].buffer,f.sounds[1].buffer);for(const s of f.sounds)assert.equal(s.playbackRate.value,1);assert.ok(f.sounds[1].connections[0].gain.value<f.sounds[0].connections[0].gain.value);assert.equal(f.sounds[0].connections[0].connections[0].pan.value,-.5);assert.equal(f.sounds[1].connections[0].connections[0].pan.value,.5);f.sounds[0].onended();f.sounds[0].onended();assert.equal(f.s.stats(f.engine).active,1);f.sounds[1].onended();assert.equal(f.s.stats(f.engine).active,0);});
test('volume saved independently, defaults, invalid values and zero',()=>{const f=setup();assert.equal(f.s.volume('bgm'),.8);assert.equal(f.s.volume('sfx'),.8);f.s.setVolume('bgm',.25);f.s.setVolume('sfx',.6);assert.equal(f.s.volume('bgm'),.25);f.s.syncMaster(f.engine,true);assert.ok(Math.abs(f.master()-.348)<1e-8);const n=setup(f.store);assert.equal(n.s.volume('bgm'),.25);assert.equal(n.s.volume('sfx'),.6);assert.equal(n.s.setVolume('sfx',NaN),false);n.s.setVolume('sfx',2);assert.equal(n.s.volume('sfx'),1);n.s.setVolume('sfx',0);assert.equal(n.s.play('kill',n.engine),true);assert.equal(n.sounds.length,0);});
test('mute stops all active voices without changing saved levels',()=>{const f=setup();f.s.play('death',f.engine);f.s.syncMaster(f.engine,false);assert.equal(f.master(),0);assert.equal(f.s.stats(f.engine).active,0);assert.equal(f.s.volume('sfx'),.8);f.s.syncMaster(f.engine,true);assert.ok(Math.abs(f.master()-.464)<1e-8);});
test('storage blocked, no stereo panner, suspended/unknown events safe',()=>{const f=setup(new Map(),true,false);f.s.setVolume('sfx',.5);assert.equal(f.s.play('styleUnlock',f.engine),true);assert.equal(f.s.play('not-a-sound',f.engine),false);f.engine.ac.state='suspended';assert.equal(f.s.play('shoot',f.engine),false);});
test('settings sliders and actual user event callback',()=>{const f=setup(),input={dataset:{audioVolume:'bgm'},value:'0'},out={},button={},changes=[];const doc={querySelectorAll:()=>[input],getElementById:id=>id==='audioPreview'?button:out};let preview=0;assert.match(f.s.settingsMarkup(),/data-audio-volume="bgm"/);f.s.bindSettings(doc,(k,n)=>changes.push([k,n]),()=>preview++);assert.equal(input.value,'80');input.value='37';input.oninput();assert.equal(out.textContent,'37%');assert.equal(changes[0][1],.37);button.onclick();assert.equal(preview,1);});
test('master level is shared with the inline graph and direct plays stay muted',()=>{const f=setup();assert.ok(Math.abs(f.s.masterGain()-.464)<1e-8);assert.equal(f.s.masterGain(false),0);f.s.syncMaster(f.engine,false);f.s.play('shoot',f.engine);assert.equal(f.sounds.length,0);f.s.syncMaster(f.engine,true);f.s.play('shoot',f.engine);assert.equal(f.sounds.length,1);});
test('live volume changes affect active voices and zero releases them immediately',()=>{
 const f=setup();f.s.play('signature',f.engine);const src=f.sounds.at(-1);
 f.s.setVolume('sfx',.23);f.s.syncMaster(f.engine,true);assert.ok(Math.abs(f.engine.gain.gain.value-.58*.23)<1e-8);assert.equal(f.s.stats(f.engine).active,1);assert.ok(!src.disconnected);
 f.s.setVolume('sfx',0);f.s.syncMaster(f.engine,true);assert.equal(f.s.stats(f.engine).active,0);assert.equal(src.disconnected,true);assert.equal(f.s.volume('bgm'),.8);
 f.s.setVolume('sfx',.23);f.s.syncMaster(f.engine,true);f.s.play('shoot',f.engine);assert.equal(f.s.stats(f.engine).active,1);
});
test('missing or corrupt samples stay on a finite wind fallback and warn once',()=>{
 for(const mode of ['missing','corrupt','no-atob']){
  const f=setup(new Map(),false,true,mode);
  for(const key of ['shoot','shoot','heartbeat','signature']){
   assert.equal(f.s.play(key,f.engine),true,mode+' '+key+' handled by new engine');
   const src=f.sounds.at(-1);assert.equal(src.playbackRate.value,1);
   for(const a of src.buffer.a){assert.equal(a[0],0);assert.equal(a.at(-1),0);let peak=0;for(const x of a){assert.ok(Number.isFinite(x));peak=Math.max(peak,Math.abs(x));}assert.ok(peak>0&&peak<1);}
   src.onended();
  }
  assert.equal(f.s.sampleSource(),'wind-fallback',mode);assert.equal(f.warnings.length,1,mode+' one diagnostic');
 }
});
test('cold approved cues play without idle scheduling or eager decoding on load',()=>{
 const f=setup();assert.equal(f.decodes.length,0);assert.equal(f.buffers.length,0);
 for(const key of ['start','shoot','signature']){assert.equal(f.s.play(key,f.engine),true);assert.ok(f.sounds.at(-1).buffer.duration>0);f.sounds.at(-1).onended();}
 assert.equal(f.s.sampleSource(),'approved-g');assert.equal(f.tasks.length,0);assert.ok(Math.max(...f.decodes)<=2048);
});
function spectralShares(samples,sampleRate){
 let n=1;while(n<samples.length)n*=2;
 const re=new Float64Array(n),im=new Float64Array(n);re.set(samples);
 for(let i=1,j=0;i<n;i++){let bit=n>>1;for(;j&bit;bit>>=1)j^=bit;j^=bit;if(i<j){const v=re[i];re[i]=re[j];re[j]=v;}}
 for(let len=2;len<=n;len*=2){
  const theta=-2*Math.PI/len,dr=Math.cos(theta),di=Math.sin(theta);
  for(let offset=0;offset<n;offset+=len){let wr=1,wi=0;for(let j=0;j<len/2;j++){
   const a=offset+j,b=a+len/2,tr=wr*re[b]-wi*im[b],ti=wr*im[b]+wi*re[b];
   re[b]=re[a]-tr;im[b]=im[a]-ti;re[a]+=tr;im[a]+=ti;
   const old=wr;wr=wr*dr-wi*di;wi=old*di+wi*dr;
  }}
 }
 let total=0,low=0,air=0,sub=0,core=0,peak=0,pitch=0;
 for(let k=1;k<=n/2;k++){
  const f=k*sampleRate/n,p=re[k]*re[k]+im[k]*im[k];total+=p;
  if(f>=20&&f<=300)low+=p;if(f>=8000)air+=p;if(f<100)sub+=p;
  if(f>=500&&f<=6800){core+=p;if(p>peak){peak=p;pitch=f;}}
 }
 return {low:low/total,air:air/total,sub:sub/total,core:core/total,pitch};
}
test('sample edges are quiet and routine decays remain bounded by their role',()=>{
 const f=setup();
 const limits={shoot:.18,hit:.18,kill:.36,bolt:.22,shard:.20,frost:.30,rail:.50,explosion:.46};
 for(const [key,from] of Object.entries(limits)){
  f.s.play(key,f.engine);const a=f.sounds.at(-1).buffer.a[0];assert.equal(a[0],0,key+' start');assert.equal(a.at(-1),0,key+' end');
  let all=0,tail=0;for(let i=0;i<a.length;i++){const p=a[i]*a[i];all+=p;if(i>=from*f.sounds.at(-1).buffer.sampleRate)tail+=p;}
  assert.ok(tail/all<.02,key+' must finish its role-specific decay');f.sounds.at(-1).onended();
 }
});
test('wind palette avoids subbass thumps and abrasive ultrasonic tails',()=>{
 const f=setup();
 for(const key of ['shoot','hit','kill','gem','heartbeat','bolt','explosion','hurt','death','start','devora','astraea','finisher0','finisher3','finisher8']){
  f.s.play(key,f.engine);const b=f.sounds.at(-1).buffer;
  for(const a of b.a){const share=spectralShares(a,b.sampleRate);assert.ok(share.sub<.01,key+' excessive subbass '+share.sub);assert.ok(share.low<.03,key+' low-band domination '+share.low);assert.ok(share.core>.80,key+' audible wind band '+share.core);assert.ok(share.air<.025,key+' excessive high hiss '+share.air);}
  f.sounds.at(-1).onended();
 }
});
test('core gestures keep the approved five PCM sources and their relative levels',()=>{
 const f=setup();
 // Fixed hashes are from the exported audition, independently of asset metadata.
 const approved={
  shoot:[7584,'39d28ec3a79e1956181ac9d71461ae27e229acdb533258b67dbf6a78fc08a7a5'],
  hit:[3984,'9969d19e99a8b2df5459c87f9e7c5ae221e13bba385f8c4d8905975f43853006'],
  kill:[15600,'2e2e500b3acc54d91c56db6025eb895e6f069cb1c9a24fbf6e09d443f110cad0'],
  gem:[8736,'bda4ff4e99661123242693723ea60b87c2e395e5c805f5df9684d4154e10a09d'],
  signature:[117600,'b61096602c90f48e9f1acc041e2474d9478f9a7b6c404f96af65d9b96f596748']
 };
 const levels=[];
 for(const [key,[frames,hash]] of Object.entries(approved)){
  const pcm=Buffer.from(f.asset.cues[key].pcm,'base64');
  assert.equal(crypto.createHash('sha256').update(pcm).digest('hex'),hash,key+' approved source');
  assert.equal(pcm.length,frames*4);assert.equal(f.s.play(key,f.engine),true);
  const src=f.sounds.at(-1),b=src.buffer;assert.equal(b.length,frames);assert.equal(b.sampleRate,48000);assert.equal(b.numberOfChannels,2);assert.equal(src.playbackRate.value,1);
  for(let i=0;i<frames;i++)for(let ch=0;ch<2;ch++)assert.equal(b.a[ch][i],pcm.readInt16LE(i*4+ch*2)/32768,key+' original PCM');
  levels.push(src.connections[0].gain.value);src.onended();
 }
 assert.equal(new Set(levels).size,1,'all approved sounds share calibration');
 assert.equal(f.s.sampleSource(),'approved-g');assert.ok(Math.max(...f.decodes)<=2048,'source decoding stays in short chunks');
});
test('rapid variations preserve articulation without retiming or new pitches',()=>{
 const f=setup();
 for(const key of ['shoot','hit','kill','gem']){
  let base=null;
  for(let i=0;i<3;i++){
   f.s.play(key,f.engine);const src=f.sounds.at(-1),a=src.buffer.a[0];assert.equal(src.playbackRate.value,1);
   if(base){let xy=0,xx=0,yy=0;assert.equal(a.length,base.length);for(let j=0;j<a.length;j++){xy+=a[j]*base[j];xx+=a[j]*a[j];yy+=base[j]*base[j];}assert.ok(xy/Math.sqrt(xx*yy)>.99,key+' same articulation');assert.ok(xx/yy>.9&&xx/yy<1.1,key+' restrained level variation');}
   else base=a;
   src.onended();
  }
 }
});
test('maximum core gameplay cadence allows original tails with bounded overlap',()=>{
 const f=setup(),gap=index.match(/const SFX_GAP=\{([^}]+)\}/)[1],gaps=Object.fromEntries(gap.split(',').map(x=>{const [k,v]=x.split(':');return [k,Number(v)];}));
 const events=[],active=[];
 for(const key of ['shoot','hit','kill','gem'])for(let t=0;t<2;t+=gaps[key])events.push({key,t});
 events.sort((a,b)=>a.t-b.t);
 for(const {key,t} of events){
  for(let i=active.length-1;i>=0;i--)if(active[i].end<=t){active[i].src.onended();active.splice(i,1);}
  f.engine.ac.currentTime=t;assert.equal(f.s.play(key,f.engine),true);
  const src=f.sounds.at(-1);assert.equal(src.playbackRate.value,1);assert.ok(src.buffer.duration<=gaps[key]*3,key+' bounded original tail');
  active.push({src,end:t+src.buffer.duration});
 }
 assert.equal(f.sounds.length,events.length);assert.equal(f.s.stats(f.engine).dropped,0);assert.ok(f.s.stats(f.engine).peak<12);f.s.stopAll(f.engine);
 f.s.play('hurt',f.engine);assert.ok(f.sounds.at(-1).buffer.duration<=.18,'hurt stays brief when repeated');f.sounds.at(-1).onended();
 f.s.play('death',f.engine);assert.ok(f.sounds.at(-1).buffer.duration>.30,'death gets a separate falling release');
});
test('all finishers begin with an immediate signal before their longer flourish',()=>{
 const f=setup();
 for(let i=0;i<9;i++){
  f.s.play('signature',f.engine,{finisherType:i});const src=f.sounds.at(-1),a=src.buffer.a[0];let early=0,total=0;
  for(let j=0;j<a.length;j++){const e=a[j]*a[j];total+=e;if(j<.025*src.buffer.sampleRate)early+=e;}
  assert.ok(early/total>.001,'finisher '+i+' must signal the immediate gameplay pulse');src.onended();
 }
});
test('common actions have three distinct deterministic takes and never immediately repeat',()=>{
 const f=setup();
 for(const key of ['shoot','hit','kill','gem','bolt','prism','shard','frost','missile','explosion','ultimatePulse','select','menu']){
  const takes=[];for(let i=0;i<7;i++){f.s.play(key,f.engine);const src=f.sounds.at(-1);takes.push(src.buffer);src.onended();}
  assert.equal(new Set(takes).size,3,key+' bounded cache');for(let i=1;i<takes.length;i++)assert.notEqual(takes[i],takes[i-1],key+' repetition');
  assert.equal(takes[0],takes[3],key+' reuse after one cycle');assert.notDeepEqual(takes[0].a,takes[1].a,key+' real articulation variation');
 }
});
test('stereo detail retains a stable center and major events have longer richer silhouettes',()=>{
 const f=setup(),energy={};
 for(const key of ['shoot','hit','gem','rail','finisher0','finisher1','finisher3','finisher8','bossBreak']){
  f.s.play(key,f.engine);const src=f.sounds.at(-1),[l,r]=src.buffer.a;let sum=0,mono=0,side=0,tail=0;
  for(let i=0;i<l.length;i++){const e=(l[i]*l[i]+r[i]*r[i])*.5;sum+=e;mono+=((l[i]+r[i])*.5)**2;side+=((l[i]-r[i])*.5)**2;if(i>.35*src.buffer.sampleRate)tail+=e;}
  assert.ok(mono/sum>.85,key+' mono compatibility');assert.ok(side/sum>.000001,key+' stereo detail');energy[key]=sum*src.connections[0].gain.value**2;
  if(key.startsWith('finisher')){if(key==='finisher0')assert.equal(src.buffer.duration,2.45,'complete audition signature');else assert.ok(src.buffer.duration>.60&&src.buffer.duration<1.3,key+' compact derived gesture');assert.ok(tail/sum>.015,key+' audible afterimage');}
  src.onended();
 }
 for(const key of ['finisher0','finisher1','finisher3','finisher8','bossBreak'])assert.ok(energy[key]>energy.shoot*3,key+' major-event hierarchy');
 assert.ok(energy.gem<energy.shoot,'approved pickup remains below a shot');
});
test('major accents briefly make space in routine voices and recover without altering settings',()=>{
 const f=setup();f.s.play('shoot',f.engine);const shot=f.sounds.at(-1),amp=shot.connections[0],base=amp.gain.value;
 f.s.play('signature',f.engine,{finisherType:0});const major=f.sounds.at(-1),events=amp.gain.events;
 assert.equal(events.length,2);assert.ok(events[0].v<base*.7);assert.equal(events[1].v,base);assert.ok(events[1].t>f.engine.ac.currentTime);
 assert.equal(major.connections[0].gain.events.length,0,'the accent keeps its own attack');
 f.s.play('hit',f.engine);assert.equal(f.sounds.at(-1).connections[0].gain.events.length,2,'new routine voice observes focus window');
 assert.equal(f.s.volume('sfx'),.8);f.s.stopAll(f.engine);f.s.play('shoot',f.engine);assert.equal(f.sounds.at(-1).connections[0].gain.events.length,0,'stop clears focus window');
});
test('routine interface cues stay short and lower energy than combat',()=>{
 const f=setup();f.s.play('shoot',f.engine);const shot=f.sounds.at(-1);
 const energy=s=>s.buffer.a.reduce((sum,a)=>sum+a.reduce((n,v)=>n+v*v,0),0)*s.connections[0].gain.value**2;
 const reference=energy(shot);shot.onended();
 for(const key of ['gem','menu','select']){f.s.play(key,f.engine);const s=f.sounds.at(-1);assert.ok(s.buffer.duration<=(key==='gem'?.20:.12),key+' short release');assert.ok(energy(s)<reference*(key==='gem'?1:.3),key+' unobtrusive mix');s.onended();}
});
test('sample decoding and arrangements never consume combat randomness and are reproducible',()=>{const a=setup(),b=setup();for(const key of ['shoot','kill','finisher7']){a.s.play(key,a.engine);b.s.play(key,b.engine);assert.deepEqual(a.sounds.at(-1).buffer.a,b.sounds.at(-1).buffer.a);a.sounds.at(-1).onended();b.sounds.at(-1).onended();}});
test('settings bind to a scoped panel and refresh initial output values',()=>{const f=setup();f.s.setVolume('sfx',.23);const input={dataset:{audioVolume:'sfx'}},out={},button={},queries=[];const panel={querySelectorAll:()=>[input],querySelector:q=>{queries.push(q);return q==='#audioPreview'?button:out;}};let changed=0;f.s.bindSettings(panel,()=>changed++);assert.equal(input.value,'23');assert.equal(out.textContent,'23%');input.value='42';input.oninput();assert.equal(out.textContent,'42%');assert.equal(f.s.volume('sfx'),.42);assert.equal(changed,1);assert.ok(queries.includes('#mix-sfx-value'));});
test('idle prewarming fills one finite cache without starting audio or duplicating work',()=>{const f=setup();f.s.syncMaster(f.engine,false);f.s.prime(f.engine);f.s.prime(f.engine);assert.equal(f.tasks.length,1);let jobs=0;while(f.tasks.length){assert.ok(++jobs<20000);f.tasks.shift()();}const stats=f.s.stats(f.engine);assert.ok(stats.cache>90&&stats.cache<130);assert.equal(f.sounds.length,0);assert.equal(stats.active,0);const bytes=f.buffers.reduce((n,b)=>n+b.a.reduce((a,v)=>a+v.byteLength,0),0);assert.ok(bytes<20*1024*1024,'whole bank fits under 20 MiB');f.s.prime(f.engine);assert.equal(f.tasks.length,0);});
test('idle warming stops on closed context and source-start failure releases the graph',()=>{const f=setup();f.s.prime(f.engine);f.engine.ac.state='closed';f.tasks.shift()();assert.equal(f.buffers.length,0);assert.equal(f.tasks.length,0);f.engine.ac.state='running';const made=[],base=f.engine.ac.createBufferSource;f.engine.ac.createBufferSource=()=>{const n=base();n.start=()=>{throw Error('start failed')};made.push(n);return n;};assert.equal(f.s.play('shoot',f.engine),false);assert.equal(f.s.stats(f.engine).active,0);assert.equal(made[0].disconnected,true);});
test('incremental warming respects idle deadlines and matches synchronous PCM byte-for-byte',()=>{const warm=setup(),sync=setup(),timeout={didTimeout:true,timeRemaining:()=>0};warm.s.prime(warm.engine);warm.tasks.shift()({didTimeout:false,timeRemaining:()=>0});assert.equal(warm.buffers.length,0);warm.tasks.shift()(timeout);assert.equal(warm.s.stats(warm.engine).cache,0,'one short step cannot build a whole cue');assert.equal(warm.buffers.length,0);let jobs=0;while(warm.tasks.length){assert.ok(++jobs<20000);warm.tasks.shift()();}for(const name of ['shoot','nova','levelup','trueQuintet','finisher7']){warm.s.play(name,warm.engine);sync.s.play(name,sync.engine);assert.deepEqual(warm.sounds.at(-1).buffer.a,sync.sounds.at(-1).buffer.a,name);warm.sounds.at(-1).onended();sync.sounds.at(-1).onended();}});
test('on-demand playback completes partial warm work without rebuilding the same take',()=>{
 const f=setup(),timeout={didTimeout:true,timeRemaining:()=>0};f.s.prime(f.engine);f.tasks.shift()(timeout);f.s.play('shoot',f.engine);const cached=f.sounds.at(-1).buffer;
 assert.equal(f.buffers.length,1);assert.equal(f.s.stats(f.engine).cache,1);f.sounds.at(-1).onended();f.tasks.shift()(timeout);
 for(let i=0;i<2;i++){f.s.play('shoot',f.engine);f.sounds.at(-1).onended();}
 assert.equal(f.buffers.length,3);f.s.play('shoot',f.engine);assert.equal(f.sounds.at(-1).buffer,cached);assert.equal(f.buffers.length,3,'idle resume must not duplicate the finished take');
 f.sounds.at(-1).onended();f.engine.ac.state='closed';f.tasks.shift()();assert.equal(f.tasks.length,0);assert.equal(f.s.stats(f.engine).cache,3);
});
test('failed accent start cleans nodes and does not duck already playing voices',()=>{
 const f=setup();f.s.play('shoot',f.engine);const amp=f.sounds.at(-1).connections[0],base=f.engine.ac.createBufferSource,made=[];
 f.engine.ac.createBufferSource=()=>{const n=base();n.start=()=>{throw Error('start failed');};made.push(n);return n;};
 assert.equal(f.s.play('signature',f.engine),false);assert.equal(f.s.stats(f.engine).active,1);assert.equal(amp.gain.events.length,0);assert.equal(made[0].disconnected,true);
});
console.log(count+' audio suites passed');
