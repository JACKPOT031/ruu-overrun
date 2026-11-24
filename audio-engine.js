/* RUU//OVERRUN v1.40.0 — SLASH WIND
   Approved G wind/cut PCM, with source-derived gameplay arrangements.
   PCM is cached in small idle slices; playback never consumes combat randomness. */
(()=>{
'use strict';
const M=Math;
const KEY='RUU_AUDIO_MIX_V1', RATE=48000, TAU=2*M.PI, LIMIT=24, ROUTINE=16;
const clamp=(n,a,b)=>M.max(a,M.min(b,n));
const finite=(n,d)=>Number.isFinite(n)?n:d;
const levels={bgm:.8,sfx:.8};
try{const saved=JSON.parse(localStorage.getItem(KEY)||'null');if(saved)for(const k of ['bgm','sfx'])levels[k]=clamp(finite(saved[k],levels[k]),0,1);}catch{}
function volume(k){return levels[k]??.8;}
function setVolume(k,n){if(!Object.hasOwn(levels,k)||!Number.isFinite(n))return false;levels[k]=clamp(n,0,1);try{localStorage.setItem(KEY,JSON.stringify(levels));}catch{}return true;}
// The five approved audition sounds are the source of the whole palette.
// Direct cues bypass envelopes, filtering, normalization and pitch variation.
const CAL=1.4, SOURCE_FRAMES={shoot:7584,hit:3984,kill:15600,gem:8736,signature:117600};
const S=(source,at=0,gain=1,opt={})=>({source,at,gain,rate:1,from:0,reverse:false,width:1,pan:0,...opt});
const cut=(at=0,gain=1,rate=1,pan=0)=>S('shoot',at,gain,{rate,pan});
const flick=(at=0,gain=1,rate=1,pan=0)=>S('hit',at,gain,{rate,pan});
const brush=(at=0,gain=1,rate=1,pan=0)=>S('gem',at,gain,{rate,pan});
const wake=(at=0,gain=1,rate=1,pan=0)=>S('kill',at,gain,{rate,pan});
const wind=(at=0,gain=.7,span=.66,opt={})=>S('signature',at,gain,{from:1.12,span,...opt});
const intake=(at=0,gain=.5,span=.12,opt={})=>S('kill',at,gain,{span,reverse:true,...opt});
const specs=Object.create(null);
function add(key,p,layers,opt={}){specs[key]={p,g:CAL,layers,tail:.012,variants:1,jitter:0,focus:0,...opt};}
for(const key of ['shoot','hit','kill','gem'])add(key,0,[],{direct:key,variants:3});
add('dash',1,[intake(0,.30,.08),cut(.018,.72,1.04,.35)],{g:CAL*.90});
add('hurt',3,[flick(0,1.25,.91),S('kill',.014,.52,{span:.12,lp:3400}),S('hit',.074,.28,{span:.042,reverse:true})],{g:CAL*1.12,focus:.76});
add('shield',2,[brush(0,.72),intake(.032,.36,.11,{pan:-.25}),cut(.08,.38,1.18,.22)],{g:CAL*.92});
// Existing low-health event: one dry breath warning, with no drum pattern.
add('heartbeat',2,[S('hit',0,.62,{rate:.82,lp:2700}),S('gem',.016,.22,{span:.08,reverse:true})],{g:CAL*.65});
add('bolt',1,[cut(0,.95,1.13),flick(.015,.30,1.18)],{variants:3,g:CAL*.92});
add('nova',1,[flick(0,.52,.88),intake(.01,.32,.08),wake(.045,.80,.94)],{g:CAL*.97});
add('sonic',1,[S('kill',0,.76,{span:.21,rate:.89,lp:3800}),brush(.034,.30,1.11)],{g:CAL*.86});
add('prism',1,[brush(0,.90,1.12,-.25),cut(.026,.36,1.21,.25)],{variants:3,g:CAL*.86});
add('shard',1,[S('shoot',0,.64,{span:.095,rate:1.20}),flick(.004,.32,1.16)],{variants:3,g:CAL*.79});
add('meteor',1,[flick(0,.64,.91),wake(.025,.94,.88,-.20)],{g:CAL*.98});
add('rail',1,[intake(0,.29,.09),cut(.028,.89,.90,.26),wind(.058,.43,.31)],{g:CAL*.97});
add('frost',1,[brush(0,.76,.94,.20),S('gem',.048,.29,{span:.105,rate:1.14,reverse:true,pan:-.25})],{variants:3,g:CAL*.82});
add('well',1,[S('kill',0,.68,{rate:.77,lp:2600,width:.60}),intake(.112,.44,.17,{rate:.86,lp:3100})],{g:CAL*.87});
add('missile',1,[intake(0,.32,.052),cut(.01,.68,1.17,.12)],{variants:3,g:CAL*.82});
add('explosion',1,[wake(0,.97,.94),flick(.012,.34,.85)],{variants:3,g:CAL*.92});
add('satellite',1,[cut(0,.61,.95,-.30),cut(.065,.42,1.10,.30),wind(.12,.37,.30)],{g:CAL*.92});
add('rift',1,[intake(0,.27,.075,{pan:-.18}),cut(.018,.78,.91,.24),wake(.071,.35,1.18)],{g:CAL*.88});
add('fireworks',1,[brush(0,.63,1.06,-.22),flick(.028,.40,1.17,.22),S('kill',.074,.38,{span:.18,rate:1.12})],{g:CAL*.84});
add('cross',1,[cut(0,.61,1.04,-.34),cut(.034,.56,1.13,.34)],{g:CAL*.87});
add('ultimatePulse',1,[S('shoot',0,.64,{span:.11,rate:1.11}),flick(.008,.17,1.10)],{variants:3,g:CAL*.72});
add('elite',2,[flick(0,.51,.88),intake(.026,.46,.16),wake(.17,.71,.94)],{g:CAL*.96,focus:.80});
add('drive',2,[cut(0,.44,1.09),intake(.058,.45,.18),wind(.235,.68,.55)],{g:CAL*.97,focus:.73});
add('chest',2,[brush(0,.76,1.10,-.22),brush(.092,.57,.93,.22),cut(.17,.31,1.17)],{g:CAL*.86});
add('combo',2,[S('gem',0,.61,{span:.10,rate:1.13}),flick(0,.17,1.21)],{g:CAL*.72});
add('comboBig',2,[brush(0,.82,1.08),cut(.072,.43,1.14,.20)],{g:CAL*.89});
add('reroll',1,[S('gem',0,.56,{span:.08,reverse:true}),S('shoot',.049,.33,{span:.09,rate:1.19})],{g:CAL*.74});
add('rare',2,[brush(0,.87,1.04,-.20),brush(.073,.47,1.18,.20),wind(.15,.29,.33)],{g:CAL*.88});
add('mythic',3,[cut(0,.42),intake(.04,.46,.18),wake(.20,.67),wind(.28,.62,.63)],{g:CAL*1.02,focus:.62});
add('select',1,[S('gem',0,.62,{span:.10,rate:1.13}),S('hit',.009,.17,{span:.045})],{variants:3,g:CAL*.66});
add('menu',1,[S('hit',0,.34,{span:.049,rate:1.17}),S('gem',.007,.21,{span:.055,rate:1.16})],{variants:3,g:CAL*.58});
add('start',2,[flick(0,.37),brush(.046,.61),cut(.14,.56,.96),wind(.22,.31,.37)],{g:CAL*.94,focus:.73});
add('levelup',3,[brush(0,.74,.98),brush(.081,.48,1.15),cut(.17,.43,1.02),wind(.21,.34,.40)],{g:CAL*.94,focus:.70});
add('evolve',3,[cut(0,.43),intake(.035,.48,.18),wake(.21,.67),wind(.30,.67,.72)],{g:CAL*1.02,focus:.58});
add('styleUnlock',3,[brush(0,.77,.95,-.22),brush(.09,.47,1.17,.22),wind(.18,.36,.48)],{g:CAL*.92,focus:.73});
add('pilotArrival',2,[flick(0,.34),brush(.036,.64),cut(.12,.45,1.09),wind(.20,.30,.35)],{g:CAL*.89});
add('pilotElio',1,[brush(0,.74,1.08),cut(.042,.30,1.18)],{g:CAL*.79});
add('pilotOz',1,[cut(0,.83,1.19,-.22),flick(.017,.32,.94,.22)],{g:CAL*.88});
add('pilotKai',1,[0,.054,.108].map((at,i)=>S('shoot',at,.37,{span:.067,rate:1.18,pan:i===1?.24:-.24})),{g:CAL*.84});
add('pilotSera',1,[brush(0,.65,.90,-.15),wind(.083,.25,.26,{rate:1.06,pan:.16})],{g:CAL*.77});
add('pilotMina',1,[S('gem',0,.57,{reverse:true,span:.11}),cut(.062,.35,1.16,.22)],{g:CAL*.78});
// Warnings retain the approved air texture. Their timing and darker releases
// distinguish danger from the quick foreground cuts, without pitched alarms.
add('boss',3,[flick(0,.70,.88),intake(.025,.52,.17),wake(.19,.77,.92),wind(.27,.60,.55)],{g:CAL*1.01,focus:.58});
add('devora',3,[S('kill',0,.61,{span:.18,rate:.82,lp:2900}),intake(.11,.48,.20,{lp:3200}),wind(.31,.79,.62,{rate:.91,lp:3900})],{g:CAL*1.04,focus:.56});
add('nullEmperor',3,[flick(0,.65,.80),intake(.03,.55,.23,{rate:.87,lp:2700}),wind(.31,.89,.74,{rate:.90,lp:3500}),wake(.35,.35,.85)],{g:CAL*1.05,focus:.54});
add('trueTrinity',3,[...[0,.105,.21].map((at,i)=>cut(at,.37,1+i*.07,i%2?.28:-.28)),wind(.32,.74,.65),wake(.34,.33)],{g:CAL*1.02,focus:.57});
add('trueQuintet',3,[...[0,.075,.15,.225,.30].map((at,i)=>S('shoot',at,.31,{span:.10,rate:1+i*.04,pan:i%2?.25:-.25})),wind(.41,.79,.69),wake(.43,.31)],{g:CAL*1.03,focus:.55});
add('eclipse',3,[cut(0,.46,.87),intake(.057,.47,.23,{lp:3400}),wind(.30,.73,.68,{rate:.95,lp:4200})],{g:CAL*1.01,focus:.57});
add('eclipseReinforce',3,[flick(0,.54),cut(.079,.51,.96),wake(.19,.65,.95)],{g:CAL*.98,focus:.65});
add('eclipsePhase',3,[cut(0,.47,1.06,-.26),intake(.036,.39,.15),cut(.20,.65,1.14,.26),wind(.25,.50,.44)],{g:CAL*.98,focus:.61});
add('eclipseLast',3,[wake(0,.54,.86),intake(.08,.47,.20),wind(.29,.85,.72,{rate:.93,lp:3900}),flick(.30,.42)],{g:CAL*1.05,focus:.54});
add('astraea',3,[brush(0,.72),cut(.063,.43,1.18,-.25),intake(.14,.33,.13,{pan:.25}),wind(.28,.62,.72,{rate:1.08}),brush(.38,.34)],{g:CAL*.99,focus:.59});
add('bossPhase3',3,[flick(0,.65,.88),cut(.052,.45,.92),intake(.11,.40,.14),wind(.26,.77,.59)],{g:CAL*1.02,focus:.57});
add('bossDown',2,[wake(0,.81,.91,-.24),brush(.08,.43,.95,.24),wind(.19,.34,.36)],{g:CAL*.96,focus:.65});
add('bossBreak',3,[wake(0,.94,.87,-.25),cut(.047,.42,1.09,.25),wind(.12,.69,.69)],{g:CAL*1.04,focus:.53});
add('victory',3,[brush(0,.74),cut(.12,.45,1.14,-.20),brush(.24,.68,.94,.20),wind(.37,.55,.68)],{g:CAL*.94,focus:.65});
add('defeat',3,[S('kill',0,.55,{rate:.80,lp:3100}),wind(.19,.39,.46,{rate:.82,lp:2600})],{g:CAL*.88,focus:.76});
add('death',3,[flick(0,1.04,.90),S('kill',.018,.87,{rate:.78,lp:3700}),wind(.17,.51,.46,{rate:.84,lp:2900})],{g:CAL*1.08,focus:.57});
add('deathEcho',3,[wind(0,.38,.48,{rate:.87,lp:2600,width:.60})],{g:CAL*.75});
add('jackpotDuo',3,[cut(0,.53,1.05,-.28),cut(.092,.51,.96,.28),brush(.18,.41),wind(.29,.75,.78)],{g:CAL*1.01,focus:.57});
add('jackpotWhite',3,[brush(0,.79,1.07,-.24),intake(.055,.40,.16),cut(.21,.53,1.16,.24),wind(.26,.65,.76,{rate:1.08})],{g:CAL*.98,focus:.61});
add('jackpotBlack',3,[wake(0,.61,.84,-.20),intake(.093,.48,.18,{lp:3100}),wind(.29,.86,.76,{rate:.91,lp:3800}),flick(.31,.36,.89)],{g:CAL*1.04,focus:.53});
// Finisher 0 is the complete, unmodified G audition signature (2.45 seconds).
// The other eight are distinct compact arrangements of its wind/cut materials.
add('finisher0',3,[],{direct:'signature',focus:.58});
const finishers=[
 [cut(0,.43,1.12,-.32),brush(.065,.66,1.09,.28),cut(.19,.46,1.19,-.28),wind(.29,.73,.72,{rate:1.05}),brush(.36,.30)],
 [cut(0,.43,1.12,-.24),cut(.075,.41,1.17,.24),cut(.145,.40,1.22,-.24),wake(.22,.55,1.08),wind(.31,.64,.60)],
 [S('kill',0,.57,{rate:.82,lp:3100}),intake(.11,.46,.15,{lp:2900}),wind(.28,.81,.73,{rate:.90,lp:3700})],
 [cut(0,.43,1.07,-.35),intake(.035,.39,.17,{pan:.35}),cut(.205,.46,.98,.35),cut(.31,.37,1.17,-.35),wind(.39,.69,.63)],
 [brush(0,.66,.91),cut(.034,.33,.95,-.24),intake(.09,.38,.17,{pan:.24}),wind(.27,.69,.79,{rate:1.04}),brush(.37,.28)],
 [...[0,.081,.162,.243].map((at,i)=>S('shoot',at,.34,{span:.098,rate:1.12,pan:i%2?.28:-.28})),wake(.325,.48,1.10),wind(.38,.65,.60)],
 [...[0,.045,.14,.22].map((at,i)=>S(i===1?'hit':'shoot',at,.37,{span:.092,rate:1.18,pan:i%2?.26:-.26})),intake(.23,.27,.11),wind(.35,.74,.67)],
 [cut(0,.53,1.12,-.34),cut(.135,.49,1.02,.34),cut(.27,.47,.94,-.34),wake(.32,.47,1.08,.24),wind(.41,.68,.67)]
];
finishers.forEach((layers,i)=>add('finisher'+(i+1),3,layers,{g:CAL,focus:.58}));
function resolve(name,opt={}){
 if(opt.cue&&Object.hasOwn(specs,opt.cue))return opt.cue;
 if(name==='jackpot')return ['jackpotDuo','jackpotWhite','jackpotBlack'][clamp(M.floor(finite(opt.jackpotType,0)),0,2)];
 if(name==='signature')return 'finisher'+clamp(M.floor(finite(opt.finisherType,0)),0,8);
 return Object.hasOwn(specs,name)?name:null;
}
function seedFor(s){let n=2166136261;for(const c of s)n=M.imul(n^c.charCodeAt(0),16777619);return n>>>0;}
let randomState=0x6c31e2d5;
function random(){randomState=(M.imul(randomState,1664525)+1013904223)>>>0;return randomState/4294967296;}
function filter(kind,f,q=.7071){
 const w=TAU*f/RATE,c=M.cos(w),alpha=M.sin(w)/(2*q),a0=1+alpha;
 const high=kind==='high',b0=(high?1+c:1-c)*.5;
 return {b0:b0/a0,b1:(high?-(1+c):1-c)/a0,b2:b0/a0,a1:-2*c/a0,a2:(1-alpha)/a0,z1:0,z2:0};
}
function filtered(f,x){const y=f.b0*x+f.z1;f.z1=f.b1*x-f.a1*y+f.z2;f.z2=f.b2*x-f.a2*y;return y;}
const cacheKey=(key,variant)=>key+':'+variant;
const asset=window.RUU_SLASH_SAMPLES;
const assetReady=asset?.sampleRate===RATE&&asset.channels===2&&asset.format==='s16le'&&typeof atob==='function'&&Object.entries(SOURCE_FRAMES).every(([key,frames])=>{
 const cue=asset.cues?.[key];return cue?.frames===frames&&typeof cue.pcm==='string'&&cue.pcm.length===M.ceil(frames*4/3)*4;
});
const sources=new Map();let sourceStatus=assetReady?'approved-g':'wind-fallback',fallbackReported=false;
function sampleSource(){return sourceStatus;}
function reportFallback(){
 sourceStatus='wind-fallback';if(fallbackReported)return;fallbackReported=true;
 if(typeof console!=='undefined'&&typeof console.warn==='function')console.warn('RUU audio: approved G sample data unavailable; using the wind-only fallback.');
}
function* sourceSteps(key){
 let src=sources.get(key);
 if(!src){const frames=SOURCE_FRAMES[key];src={frames,a:[new Float32Array(frames),new Float32Array(frames)],position:0,bytes:0,done:false,failed:!assetReady};sources.set(key,src);}
 if(src.done)return src;
 if(!src.failed){
  try{
   const pcm=asset.cues[key].pcm;
   // 2048 base64 characters = 384 complete stereo frames. No large atob call
   // can block the first shot or an idle deadline while decoding the long cut.
   while(src.bytes<pcm.length){
    const binary=atob(pcm.slice(src.bytes,src.bytes+2048));
    if(binary.length%4||src.position+binary.length/4>src.frames)throw Error('Invalid G PCM');
    for(let i=0;i<binary.length;i+=4){
     const l=binary.charCodeAt(i)|(binary.charCodeAt(i+1)<<8),r=binary.charCodeAt(i+2)|(binary.charCodeAt(i+3)<<8);
     src.a[0][src.position]=(l<<16>>16)/32768;src.a[1][src.position]=(r<<16>>16)/32768;src.position++;
    }
    src.bytes+=2048;yield;
   }
   if(src.position!==src.frames)throw Error('Incomplete G PCM');
   src.done=true;return src;
  }catch{src.failed=true;src.position=0;}
 }
 // A missing/corrupt asset must never fall through to the old pitched effects.
 // This deterministic, quiet band of air is diagnostic fallback only.
 reportFallback();
 let seed=seedFor('wind-fallback:'+key),low=0,high=0,trail=0;
 const peak={shoot:.17,hit:.10,kill:.20,gem:.075,signature:.22}[key];
 const lo=1-M.exp(-TAU*650/RATE),hi=1-M.exp(-TAU*4400/RATE);
 for(let i=0;i<src.frames;i++){
  seed=(M.imul(seed,1664525)+1013904223)>>>0;const noise=seed/2147483648-1;
  low+=lo*(noise-low);high+=hi*(noise-high);const u=i/(src.frames-1);
  const env=M.min(1,i/(RATE*.002),(src.frames-1-i)/(RATE*.018))*M.exp(-u*4.2);
  const air=(high-low)*env*peak;trail+=.16*(air-trail);
  src.a[0][i]=air+trail*.025;src.a[1][i]=air-trail*.015;
  if((i&511)===511)yield;
 }
 src.a[0][0]=src.a[1][0]=src.a[0][src.frames-1]=src.a[1][src.frames-1]=0;src.done=true;return src;
}
function* buildSteps(ac,key,variant=0){
 const spec=specs[key],variation=variant===0?1:variant===1?.978:1.018,width=variant===0?1:variant===1?.97:1.025;
 if(spec.direct){
  const src=yield* sourceSteps(spec.direct),buffer=ac.createBuffer(2,src.frames,RATE),left=buffer.getChannelData(0),right=buffer.getChannelData(1);
  for(let i=0;i<src.frames;i++){
   if(variant===0){left[i]=src.a[0][i];right[i]=src.a[1][i];}
   else{const mid=(src.a[0][i]+src.a[1][i])*.5,side=(src.a[0][i]-src.a[1][i])*.5*width;left[i]=(mid+side)*variation;right[i]=(mid-side)*variation;}
   if((i&511)===511)yield;
  }
  return buffer;
 }
 const layers=[];
 for(const l of spec.layers){
  const src=yield* sourceSteps(l.source),start=M.round(l.from*RATE),span=M.min(src.frames-start,M.round((l.span??(src.frames/RATE-l.from))*RATE));
  layers.push({...l,src,start,span,length:M.max(1,M.ceil(span/l.rate)),offset:M.round(l.at*RATE)});
 }
 const frames=M.max(...layers.map(l=>l.offset+l.length))+M.ceil(spec.tail*RATE),buffer=ac.createBuffer(2,frames,RATE);
 const left=buffer.getChannelData(0),right=buffer.getChannelData(1);
 for(const l of layers){
  const lp=l.lp?[filter('low',l.lp),filter('low',l.lp)]:null;
  for(let i=0;i<l.length;i++){
   const pos=clamp(l.start+(l.reverse?l.span-1-i*l.rate:i*l.rate),l.start,l.start+l.span-1),j=M.floor(pos),fraction=pos-j,next=M.min(j+1,l.src.frames-1);
   let a=l.src.a[0][j]+(l.src.a[0][next]-l.src.a[0][j])*fraction,b=l.src.a[1][j]+(l.src.a[1][next]-l.src.a[1][j])*fraction;
   if(lp){a=filtered(lp[0],a);b=filtered(lp[1],b);}
   const mid=(a+b)*.5,side=(a-b)*.5*l.width,env=M.min(1,i/(RATE*.0015),(l.length-1-i)/(RATE*.008));
   left[l.offset+i]+=(mid+side)*(1-l.pan*.25)*l.gain*env;
   right[l.offset+i]+=(mid-side)*(1+l.pan*.25)*l.gain*env;
   if((i&511)===511)yield;
  }
  yield;
 }
 let peak=0;
 for(let i=0;i<frames;i++){peak=M.max(peak,M.abs(left[i]),M.abs(right[i]));if((i&511)===511)yield;}
 // Only derived arrangements get a downward ceiling. G's five direct sounds
 // keep their original PCM and relative levels; CAL is their shared mix gain.
 const scale=M.min(1,.58/M.max(.001,peak))*variation;
 for(let i=0;i<frames;i++){
  const mid=(left[i]+right[i])*.5,side=(left[i]-right[i])*.5*width;
  left[i]=(mid+side)*scale;right[i]=(mid-side)*scale;
  if((i&511)===511)yield;
 }
 return buffer;
}
const engines=new WeakMap();
function bank(engine){
 let b=engines.get(engine);if(!b){b={cache:new Map(),building:new Map(),variants:new Map(),voices:new Set(),peakVoices:0,dropped:0,warm:false,muted:false,focusUntil:0,focusLevel:1};engines.set(engine,b);}return b;
}
function sample(engine,key,variant=0){
 const b=bank(engine),id=cacheKey(key,variant);
 if(!b.cache.has(id)){
  const task=b.building.get(id)||buildSteps(engine.ac,key,variant);
  try{let step;do{step=task.next();}while(!step.done);b.cache.set(id,step.value);}
  finally{b.building.delete(id);}
 }
 return b.cache.get(id);
}
function remove(b,v,stop=false){
 if(!b.voices.delete(v))return;
 if(stop)try{v.src.stop();}catch{}
 for(const n of v.nodes)try{n.disconnect();}catch{}
}
function stopAll(engine){if(!engine)return;const b=engines.get(engine);if(b){for(const v of [...b.voices])remove(b,v,true);b.focusUntil=0;b.focusLevel=1;}}
function masterGain(on=true){return on ? .58*volume('sfx'):0;}
function syncMaster(engine,on=true){
 if(!engine?.gain?.gain)return;bank(engine).muted=!on;const p=engine.gain.gain,v=masterGain(on);
 try{p.cancelScheduledValues(engine.ac.currentTime);p.setTargetAtTime(v,engine.ac.currentTime,.015);}catch{try{p.value=v;}catch{}}
 if(!on||v===0)stopAll(engine);
}
function focusVoice(v,b,now){
 if(v.priority>=2||b.focusUntil<=now)return;
 const p=v.amp.gain;
 try{p.cancelScheduledValues(now);p.setTargetAtTime(v.baseGain*b.focusLevel,now,.012);p.setTargetAtTime(v.baseGain,b.focusUntil,.15);}catch{}
}
function play(name,engine,opt={}){
 const key=resolve(name,opt);if(!key||!engine?.ac||!engine.gain||engine.ac.state!=='running')return false;
 if(volume('sfx')===0)return true;
 const spec=specs[key],b=bank(engine),ac=engine.ac;
 if(b.muted)return true;
 if(spec.p<2&&b.voices.size>=ROUTINE){b.dropped++;return true;}
 if(b.voices.size>=LIMIT){
  let victim=null;for(const v of b.voices)if(v.priority<spec.p&&(!victim||v.priority<victim.priority))victim=v;
  if(victim)remove(b,victim,true);else{b.dropped++;return true;}
 }
 let voice=null;
 try{
  const src=ac.createBufferSource();voice={src,amp:null,baseGain:0,nodes:[src],priority:spec.p};
  const amp=ac.createGain(),variant=b.variants.get(key)||0;voice.amp=amp;voice.nodes.push(amp);
  src.buffer=sample(engine,key,variant);b.variants.set(key,(variant+1)%spec.variants);
  src.playbackRate.value=1+(random()*2-1)*spec.jitter;
  const distance=clamp(finite(opt.distance,0),0,1800),position=clamp(finite(opt.pan,0),-.85,.85);
  const attenuation=spec.p>=2?1:1/(1+distance/1400);
  const baseGain=spec.g*attenuation*(spec.jitter?(.96+.07*random()):1);
  amp.gain.value=baseGain;
  voice.baseGain=baseGain;src.connect(amp);
  if(typeof ac.createStereoPanner==='function'){const pan=ac.createStereoPanner();pan.pan.value=position;voice.nodes.push(pan);amp.connect(pan);pan.connect(engine.gain);}else amp.connect(engine.gain);
  b.voices.add(voice);b.peakVoices=M.max(b.peakVoices,b.voices.size);
  src.onended=()=>remove(b,voice);src.start();
  if(spec.focus){
   const now=ac.currentTime;b.focusLevel=b.focusUntil>now?M.min(b.focusLevel,spec.focus):spec.focus;
   b.focusUntil=M.max(b.focusUntil,now+M.min(.70,src.buffer.duration*.70));
   for(const v of b.voices)focusVoice(v,b,now);
  }
  focusVoice(voice,b,ac.currentTime);
  return true;
 }catch(e){if(voice){if(b.voices.has(voice))remove(b,voice,true);else for(const n of voice.nodes)try{n.disconnect();}catch{}}return false;}
}
function prime(engine){
 if(!engine?.ac)return;const b=bank(engine);if(b.warm)return;b.warm=true;
 const quick=['shoot','hit','kill','gem'],opening=['dash','hurt','select','menu','start','shield','levelup'];
 const rest=Object.keys(specs).filter(k=>!quick.includes(k)&&!opening.includes(k));
 const takes=(keys,from=0)=>keys.flatMap(key=>Array.from({length:specs[key].variants-from},(_,i)=>({key,variant:i+from})));
 // The second and third rapid hits must be ready before distant boss cues.
 // First give each core action one take, then finish its small variation bank.
 const queue=[...quick.map(key=>({key,variant:0})),...takes(quick,1),...takes(opening),...takes(rest)];
 let item=null;
 const clock=typeof performance!=='undefined'&&typeof performance.now==='function'?()=>performance.now():()=>Date.now();
 const schedule=fn=>typeof requestIdleCallback==='function'?requestIdleCallback(fn,{timeout:600}):typeof setTimeout==='function'?setTimeout(fn,16):null;
 function next(deadline){
  if(engine.ac.state==='closed'){b.building.clear();queue.length=0;item=null;return;}
  const begin=clock();let chunks=0;
  while(item||queue.length){
   if(chunks&&(clock()-begin>=3||chunks>=64))break;
   if(typeof deadline?.timeRemaining==='function'&&deadline.timeRemaining()<1&&(!deadline.didTimeout||chunks))break;
   if(!item)item=queue.shift();
   const {key,variant}=item,id=cacheKey(key,variant);
   if(b.cache.has(id)){b.building.delete(id);item=null;continue;}
   let task=b.building.get(id);
   if(!task){task=buildSteps(engine.ac,key,variant);b.building.set(id,task);}
   try{
    const step=task.next();chunks++;
    if(step.done){if(!b.cache.has(id))b.cache.set(id,step.value);b.building.delete(id);item=null;}
   }catch{b.building.delete(id);item=null;chunks++;}
  }
  if(item||queue.length)schedule(next);
 }
 schedule(next);
}
function stats(engine){const b=engines.get(engine);return {active:b?.voices.size||0,peak:b?.peakVoices||0,cache:b?.cache.size||0,dropped:b?.dropped||0,source:sourceStatus,sourceBytes:[...sources.values()].reduce((n,s)=>n+s.frames*8,0)};}
function settingsMarkup(){
 return '<div class="kv-audio-grid">'+['bgm','sfx'].map(k=>'<label class="kv-setting kv-volume"><span>'+ (k==='bgm'?'BGM VOLUME / 楽曲音量':'SFX VOLUME / 効果音量')+' <output id="mix-'+k+'-value">'+M.round(volume(k)*100)+'%</output></span><input type="range" min="0" max="100" step="1" value="'+M.round(volume(k)*100)+'" data-audio-volume="'+k+'" aria-label="'+(k==='bgm'?'BGM音量':'効果音音量')+'"></label>').join('')+'<button type="button" class="kv-button" id="audioPreview"><span>♫ SFX PREVIEW</span><small>効果音の試聴</small></button><p class="kv-detail">BGM・SFXのON/OFFとは別に音量を保存します。</p></div>';
}
function bindSettings(doc,onChange,onPreview){
 const find=id=>typeof doc.getElementById==='function'?doc.getElementById(id):doc.querySelector?.('#'+id);
 for(const input of doc.querySelectorAll('[data-audio-volume]')){
  const k=input.dataset.audioVolume;if(!Object.hasOwn(levels,k))continue;
  input.value=String(M.round(volume(k)*100));
  const output=find('mix-'+k+'-value');if(output)output.textContent=input.value+'%';
  input.oninput=()=>{if(!setVolume(k,Number(input.value)/100))return;const o=find('mix-'+k+'-value');if(o)o.textContent=M.round(volume(k)*100)+'%';onChange?.(k,volume(k));};
 }
 const button=find('audioPreview');if(button)button.onclick=()=>onPreview?.();
}
window.RUU_AUDIO={volume,setVolume,masterGain,resolve,play,prime,stopAll,syncMaster,settingsMarkup,bindSettings,stats,sampleSource};
})();
