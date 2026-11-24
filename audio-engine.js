/* RUU//OVERRUN v1.35.0 — SOUND OVERDRIVE / AUDIO REFORGE
   Original procedural one-shot SFX. No audio downloads, no external libraries.
   Audio randomness is independent of combat RNG. Cached, bounded stereo playback. */
(()=>{
'use strict';
const KEY='RUU_AUDIO_MIX_V1', RATE=24000, TAU=2*Math.PI, LIMIT=24, ROUTINE=16;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const finite=(n,d)=>Number.isFinite(n)?n:d;
const levels={bgm:.8,sfx:.8};
try{const saved=JSON.parse(localStorage.getItem(KEY)||'null');if(saved)for(const k of ['bgm','sfx'])levels[k]=clamp(finite(saved[k],levels[k]),0,1);}catch{}
function volume(k){return levels[k]??.8;}
function setVolume(k,n){if(!Object.hasOwn(levels,k)||!Number.isFinite(n))return false;levels[k]=clamp(n,0,1);try{localStorage.setItem(KEY,JSON.stringify(levels));}catch{}return true;}
// t: modulated oscillator, n: band-limited noise, b: inharmonic resonator.
const T=(f,end,d,a,at=0,color=.25,attack=.004)=>({k:'t',f,end,d,a,at,color,attack});
const N=(lo,hi,d,a,at=0,attack=.003)=>({k:'n',lo,hi,d,a,at,attack});
const B=(f,d,a,at=0,color=.5)=>({k:'b',f,d,a,at,color,attack:.003});
const notes=(fs,step,d,a,at=0)=>fs.flatMap((f,i)=>[T(f,f*1.004,d,a,at+i*step,.12,.008),B(f*2,d*.82,a*.38,at+i*step,.3)]);
const slam=(f=100,d=.30,a=.85,at=0)=>[T(f*1.7,f*.48,d,a,at,.20,.003),N(90,1100,d*.82,a*.64,at),N(1500,5200,.065,a*.34,at)];
const specs=Object.create(null);
function add(key,p,g,tail,layers,jitter=.045){specs[key]={p,g,tail,layers,jitter};}
add('shoot',0,.25,.055,[T(1480,390,.095,.50,0,.68),N(1700,6900,.035,.35),B(310,.09,.22,.012,.7)],.085);
add('hit',0,.23,.045,[N(1100,5500,.058,.62),T(205,78,.09,.68,0,.23),B(790,.075,.19)],.10);
add('kill',0,.32,.12,[...slam(115,.19,.66),T(710,125,.18,.34,.02,.7),N(1800,6500,.12,.22,.038)],.09);
add('gem',0,.17,.16,[B(1200,.16,.56,0,.2),B(1798,.18,.38,.023,.2),T(700,1070,.08,.14)],.045);
add('dash',1,.46,.16,[N(320,4400,.25,.78,0,.016),T(170,510,.105,.36,0,.25,.012),T(700,84,.25,.69,.045,.42),N(2500,7400,.10,.25,.06)],.06);
add('hurt',3,.60,.18,[...slam(83,.32,1),T(240,81,.22,.38,.015,.65),T(370,285,.19,.26,.10,.3)],.02);
add('shield',2,.38,.19,[B(680,.26,.6),B(1120,.22,.32,.01),T(940,370,.14,.36,0,.48),N(900,3500,.08,.24)],.04);
add('heartbeat',2,.32,.10,[T(74,43,.15,.85),T(65,39,.19,.60,.18),N(45,240,.11,.22)],0);
add('bolt',1,.44,.12,[T(2600,390,.16,.64,0,.85),N(1700,8000,.12,.76),T(170,65,.16,.34,.04)],.06);
add('nova',1,.45,.17,[...slam(92,.37,.85),T(440,58,.32,.36,0,.48)],.045);
add('sonic',1,.43,.16,[T(104,48,.43,.84,0,.92,.014),T(150,72,.31,.35,.07,.55),N(180,900,.27,.45,.05,.03)],.035);
add('prism',1,.39,.30,[...notes([660,990,1485],.034,.28,.5),T(2380,710,.25,.22,.06,.52)],.035);
add('shard',1,.32,.13,[B(2150,.23,.55,0,.76),B(1380,.13,.32,.018),N(3300,8200,.06,.38)],.08);
add('meteor',1,.52,.24,[T(620,85,.29,.48,0,.52,.05),N(350,3200,.24,.4,0,.02),...slam(76,.40,.94,.20)],.04);
add('rail',1,.53,.23,[T(420,1550,.16,.48,0,.75,.015),T(1450,170,.22,.78,.095,.9),N(1800,7600,.17,.55,.095),T(125,48,.30,.73,.10)],.035);
add('frost',1,.36,.23,[B(1830,.25,.67,0,.85),B(2710,.20,.32,.035,.55),N(3000,7200,.14,.40,.02),T(950,650,.15,.27)],.055);
add('well',1,.45,.28,[T(65,152,.38,.78,0,.65,.04),T(235,47,.56,.54,.08,.72,.025),N(130,1100,.35,.45,.09,.045)],.035);
add('missile',1,.31,.09,[T(215,580,.18,.51,0,.82,.009),N(600,4600,.13,.62,0,.012),B(410,.12,.25)],.065);
add('explosion',1,.46,.24,[...slam(72,.36,.94),N(200,2400,.33,.65,.04)],.09);
add('satellite',1,.47,.25,[T(880,2100,.16,.30,0,.2,.025),T(1580,300,.27,.64,.12,.75),...slam(86,.29,.65,.13)],.035);
add('rift',1,.42,.21,[N(750,6200,.22,.61,0,.012),T(1100,83,.26,.76,0,.85),B(460,.31,.26,.04,.8)],.05);
add('fireworks',1,.46,.27,[T(620,1600,.14,.32,0,.4),...slam(128,.25,.62,.09),B(1640,.22,.46,.13),B(2210,.18,.28,.18)],.055);
add('cross',1,.44,.22,[T(1260,240,.25,.66,0,.6),T(740,1320,.23,.44,.03,.35),N(1800,6000,.11,.36,.04),T(145,55,.22,.58,.06)],.04);
add('ultimatePulse',1,.40,.16,[T(172,59,.19,.72,0,.5),T(840,1500,.12,.38,.025,.35),N(800,4600,.08,.37)],.045);
add('elite',2,.51,.25,[...slam(95,.35,.7),T(260,182,.42,.54,.09,.75),B(720,.35,.31,.16)],.02);
add('drive',2,.55,.30,[T(95,280,.48,.53,0,.48,.055),...notes([220,330,440,660,880],.067,.27,.45,.05),N(300,3300,.26,.34,.17,.035)],0);
add('chest',2,.45,.27,[B(380,.13,.55),N(1000,4100,.07,.30),...notes([523,659,784,1047],.071,.27,.52,.06)],0);
add('combo',2,.33,.18,notes([740,1110],.052,.19,.54),.025);
add('comboBig',2,.47,.25,[...notes([392,587,784,1175],.07,.25,.54),T(105,58,.23,.44,.20)],0);
add('reroll',1,.28,.10,[N(1800,6100,.09,.48),...notes([650,490,825],.047,.11,.42)],.035);
add('rare',2,.45,.27,notes([622,784,932,1244],.058,.25,.59),0);
add('mythic',3,.60,.38,[...notes([440,554,659,880,1108,1320],.063,.32,.53),T(110,52,.39,.70,.28),B(1760,.55,.30,.35)],0);
add('select',1,.30,.10,[T(545,815,.09,.64,0,.14),B(1120,.12,.28,.035),N(2400,6200,.025,.20)],.025);
add('menu',1,.26,.10,[T(445,670,.075,.54,0,.17),B(1010,.11,.32,.025),N(1600,5200,.018,.20)],.025);
add('start',2,.56,.31,[...notes([220,330,440,659],.072,.25,.55),...slam(110,.28,.65,.22)],0);
add('levelup',3,.59,.36,[...notes([440,554,659,880],.075,.31,.60),B(1760,.48,.30,.24),T(138,66,.28,.5,.22)],0);
add('evolve',3,.61,.39,[T(100,850,.41,.50,0,.62,.04),N(250,5000,.39,.46,0,.04),...notes([330,440,660,880,1320],.058,.30,.51,.19),...slam(95,.33,.67,.39)],0);
add('styleUnlock',3,.52,.36,[B(530,.23,.53),...notes([659,784,988,1318,1568],.060,.28,.53,.055),T(110,60,.22,.32,.27)],0);
add('pilotArrival',2,.47,.26,[T(285,560,.28,.42,0,.5,.02),...notes([310,465,698],.075,.29,.56,.08)],0);
add('pilotElio',1,.31,.20,[B(510,.27,.57,0,.2),T(1020,620,.29,.38,.05,.25)],.025);
add('pilotOz',1,.38,.15,[T(1580,200,.15,.72,0,.85),N(2400,7200,.09,.50),T(190,82,.18,.47,.045)],.04);
add('pilotKai',1,.35,.10,[0,.065,.13].flatMap((at,i)=>[T(680+i*90,240,.09,.5,at,.65),N(1800,6200,.047,.34,at)]),.035);
add('pilotSera',1,.32,.25,[T(740,890,.33,.50,0,.12,.025),B(1108,.38,.44,.07),B(1660,.28,.23,.12)],.025);
add('pilotMina',1,.29,.18,notes([715,1025,1335],.055,.16,.52),.035);
add('boss',3,.59,.34,[T(95,44,.75,.9,0,.78,.045),...slam(75,.38,.8,.05),T(185,110,.24,.53,.30,.65),T(185,106,.24,.53,.63,.65)],0);
add('devora',3,.64,.40,[T(86,39,.88,.95,0,.83,.06),N(120,2200,.72,.62,0,.05),T(172,94,.31,.72,.16,.72),T(162,80,.32,.60,.60,.82)],0);
add('nullEmperor',3,.67,.46,[T(53,42,.98,.93,0,.66,.05),T(316,155,.37,.63,.08,.82),T(316,143,.37,.63,.49,.82),B(450,.65,.31,.44,.9),...slam(71,.42,.78,.70)],0);
add('trueTrinity',3,.65,.42,[T(75,42,1.02,.78,0,.72,.06),...([0,.19,.38].flatMap((at,i)=>[T(220-i*32,84,.31,.63,at,.72),N(280,4100,.20,.44,at)])),...slam(70,.35,.70,.59)],0);
add('trueQuintet',3,.68,.46,[T(56,33,1.30,.95,0,.9,.07),...([0,.13,.26,.39,.52].flatMap((at,i)=>[T(265-i*22,76,.25,.60,at,.85),N(260,4200,.17,.48,at)])),...slam(57,.50,1,.72)],0);
add('eclipse',3,.66,.48,[T(64,44,.95,.83,0,.63,.07),B(415,.66,.51,.06,.9),B(587,.63,.43,.22,.95),B(831,.58,.35,.37,.8),N(1600,6400,.53,.45,.15,.045),...slam(58,.48,.9,.67)],0);
add('eclipseReinforce',3,.60,.35,[...slam(78,.32,.86),...slam(75,.30,.72,.15),...slam(69,.34,.70,.31),T(290,90,.48,.42,.12,.78)],0);
add('eclipsePhase',3,.58,.32,[T(150,620,.30,.62,0,.82,.015),N(400,5500,.28,.54,.02,.025),...slam(88,.37,.85,.23)],0);
add('eclipseLast',3,.65,.41,[T(65,210,.38,.85,0,.7,.04),T(530,1000,.20,.51,.18,.8),T(1000,100,.34,.72,.35,.9),...slam(60,.45,.88,.50)],0);
add('astraea',3,.60,.37,[T(150,780,.46,.67,0,.55,.04),T(220,925,.45,.44,.03,.3,.045),B(880,.34,.42,.32),...slam(97,.34,.75,.43)],0);
add('bossPhase3',3,.60,.35,[T(130,900,.34,.60,0,.75,.025),N(400,4400,.30,.53,0,.03),...slam(70,.37,.96,.29)],0);
add('bossDown',2,.57,.30,[...slam(76,.42,.85),N(1800,5800,.28,.45,.04),...notes([440,330,220],.065,.21,.28,.09)],.015);
add('bossBreak',3,.63,.40,[T(250,44,.52,.88,0,.82),...slam(68,.49,.92,.06),N(650,7400,.42,.63,.04),B(490,.62,.31,.14,.85)],0);
add('victory',3,.60,.48,[...notes([392,494,587,784,988,1175],.092,.33,.56),T(98,61,.46,.57,.38),B(1568,.59,.30,.48)],0);
add('defeat',3,.48,.38,[...notes([330,262,196,131],.12,.32,.5),T(90,43,.55,.55,.24,.6)],0);
add('death',3,.63,.43,[T(76,49,.16,.8),T(63,36,.20,.68,.19),T(245,32,.83,.83,.23,.82,.025),N(150,6500,.38,.84,.34),B(925,.58,.35,.43,.9),...slam(61,.44,.70,.41)],0);
add('deathEcho',3,.36,.48,[B(1380,.74,.50,0,.7),T(530,55,.70,.61,0,.50,.02),N(270,3900,.50,.35,.05,.03)],0);
add('jackpotDuo',3,.65,.38,[...notes([392,587,784,988,1175],.071,.29,.61),T(110,660,.33,.39,0,.5,.025),...slam(98,.32,.80,.36),B(1568,.45,.42,.40)],0);
add('jackpotWhite',3,.60,.41,[...notes([523,659,784,1047,1318,1568],.057,.29,.53),B(2093,.50,.45,.30,.25),T(130,70,.26,.45,.33)],0);
add('jackpotBlack',3,.68,.41,[T(82,42,.74,.95,0,.78,.025),T(330,120,.28,.67,0,.89),T(220,650,.29,.53,.24,.72),N(350,6000,.34,.65,.22),...slam(61,.43,.92,.43),B(831,.36,.36,.47,.95)],0);
// Nine distinct attack releases, each with a short anticipation and layered release.
const fin=[
 [185,920,92,[370,554,740],.70],[130,1260,85,[392,587,880],.35],
 [220,1800,102,[523,784,1175],.8],[95,610,68,[196,294,392],.85],
 [420,2400,115,[660,990,1485],.2],[155,780,69,[220,330,440],.75],
 [190,1550,85,[330,495,660],.58],[270,2050,75,[277,415,622],.9],
 [120,1060,78,[294,440,587],.60]
];
fin.forEach(([a,b,sub,fs,col],i)=>add('finisher'+i,3,.62,.38,[
 T(a,b,.26,.63,0,col,.028),N(250,3600,.24,.35,0,.035),
 T(b,Math.max(50,sub*1.3),.29,.65,.24,col),...slam(sub,.38,.85,.24),
 ...notes(fs,.053,.23,.33,.27),B(fs[2]*1.5,.40,.25,.36,.7)
],0));
function resolve(name,opt={}){
 if(opt.cue&&Object.hasOwn(specs,opt.cue))return opt.cue;
 if(name==='jackpot')return ['jackpotDuo','jackpotWhite','jackpotBlack'][clamp(Math.floor(finite(opt.jackpotType,0)),0,2)];
 if(name==='signature')return 'finisher'+clamp(Math.floor(finite(opt.finisherType,0)),0,8);
 return Object.hasOwn(specs,name)?name:null;
}
function seedFor(s){let n=2166136261;for(const c of s)n=Math.imul(n^c.charCodeAt(0),16777619);return n>>>0;}
let randomState=0x6c31e2d5;
function random(){randomState=(Math.imul(randomState,1664525)+1013904223)>>>0;return randomState/4294967296;}
function build(ac,key){
 const spec=specs[key],duration=Math.max(...spec.layers.map(l=>l.at+l.d)),dry=new Float32Array(Math.ceil(duration*RATE)+1);
 for(const [index,l] of spec.layers.entries()){
  const offset=Math.round(l.at*RATE),len=Math.min(dry.length-offset,Math.ceil(l.d*RATE));
  let phase=0,mod=0,lo=0,hi=0,seed=seedFor(key+index);
  const cLo=l.k==='n'?1-Math.exp(-TAU*l.lo/RATE):0,cHi=l.k==='n'?1-Math.exp(-TAU*l.hi/RATE):0;
  const sweep=l.k==='t'?Math.pow(l.end/l.f,1/Math.max(1,len-1)):1;
  let f=l.f||0;
  for(let i=0;i<len;i++){
   const u=i/Math.max(1,len-1),t=i/RATE;
   const env=Math.min(1,t/l.attack)*Math.pow(1-u,1.6)*Math.exp(-u*(l.k==='b'?2.7:1.6));
   let x;
   if(l.k==='n'){
    seed=(Math.imul(seed,1664525)+1013904223)>>>0;const w=seed/2147483648-1;hi+=cHi*(w-hi);lo+=cLo*(w-lo);x=(hi-lo)*1.8;
   }else if(l.k==='b'){
    phase+=TAU*l.f/RATE;
    x=Math.sin(phase)*.69+Math.sin(phase*2.37)*.20*Math.exp(-u*4)+Math.sin(phase*3.91)*.11*l.color*Math.exp(-u*7);
   }else{
    phase+=TAU*f/RATE;mod+=TAU*f*1.73/RATE;f*=sweep;
    x=.84*Math.sin(phase+Math.sin(mod)*l.color*(1-u)*1.6)+.12*l.color*Math.sin(phase*2)+.04*Math.sin(phase*.5);
   }
   dry[offset+i]+=x*env*l.a;
  }
 }
 const frames=dry.length+Math.ceil(spec.tail*RATE),buffer=ac.createBuffer(2,frames,RATE);
 const left=buffer.getChannelData(0),right=buffer.getChannelData(1);
 const taps=spec.tail>0?[[.033,.16,.08],[.061,.08,.14],[.101,.09,.055],[.149,.035,.075],[.211,.032,.017],[.287,.012,.025],[.355,.008,.005]].filter(t=>t[0]<spec.tail):[];
 const delays=taps.map(([d,l,r])=>[Math.round(d*RATE),l,r]);let peak=0;
 for(let i=0;i<frames;i++){
  let v=i<dry.length?dry[i]:0,l=v,r=v;
  for(const [d,a,b] of delays){const j=i-d;if(j>=0&&j<dry.length){l+=dry[j]*a;r+=dry[j]*b;}}
  const fade=Math.min(1,(frames-1-i)/Math.round(.012*RATE));
  left[i]=l*fade;right[i]=r*fade;peak=Math.max(peak,Math.abs(left[i]),Math.abs(right[i]));
 }
 const gain=.82/Math.max(.1,peak);
 for(let i=0;i<frames;i++){left[i]*=gain;right[i]*=gain;}
 return buffer;
}
const engines=new WeakMap();
function bank(engine){
 let b=engines.get(engine);if(!b){b={cache:new Map(),voices:new Set(),peakVoices:0,dropped:0,warm:false};engines.set(engine,b);}return b;
}
function sample(engine,key){const b=bank(engine);if(!b.cache.has(key))b.cache.set(key,build(engine.ac,key));return b.cache.get(key);}
function remove(b,v,stop=false){
 if(!b.voices.delete(v))return;
 if(stop)try{v.src.stop();}catch{}
 for(const n of v.nodes)try{n.disconnect();}catch{}
}
function stopAll(engine){if(!engine)return;const b=engines.get(engine);if(b)for(const v of [...b.voices])remove(b,v,true);}
function syncMaster(engine,on=true){
 if(!engine?.gain?.gain)return;const p=engine.gain.gain,v=on?.45*volume('sfx'):0;
 try{p.cancelScheduledValues(engine.ac.currentTime);p.setTargetAtTime(v,engine.ac.currentTime,.015);}catch{try{p.value=v;}catch{}}
 if(!on||v===0)stopAll(engine);
}
function play(name,engine,opt={}){
 const key=resolve(name,opt);if(!key||!engine?.ac||!engine.gain||engine.ac.state!=='running')return false;
 if(volume('sfx')===0)return true;
 const spec=specs[key],b=bank(engine),ac=engine.ac;
 // Keep slots free for boss warnings, danger, and milestone rewards.
 if(spec.p<2&&b.voices.size>=ROUTINE){b.dropped++;return true;}
 if(b.voices.size>=LIMIT){
  let victim=null;for(const v of b.voices)if(v.priority<spec.p&&(!victim||v.priority<victim.priority))victim=v;
  if(victim)remove(b,victim,true);else{b.dropped++;return true;}
 }
 let voice=null;
 try{
  const src=ac.createBufferSource(),amp=ac.createGain();
  voice={src,nodes:[src,amp],priority:spec.p};src.buffer=sample(engine,key);
  src.playbackRate.value=1+(random()*2-1)*spec.jitter;
  const distance=clamp(finite(opt.distance,0),0,1800),position=clamp(finite(opt.pan,0),-.85,.85);
  const attenuation=spec.p>=2?1:1/(1+distance/1400);
  amp.gain.value=spec.g*attenuation*(spec.jitter?(.93+.10*random()):1);
  src.connect(amp);
  if(typeof ac.createStereoPanner==='function'){const pan=ac.createStereoPanner();pan.pan.value=position;voice.nodes.push(pan);amp.connect(pan);pan.connect(engine.gain);}else amp.connect(engine.gain);
  b.voices.add(voice);b.peakVoices=Math.max(b.peakVoices,b.voices.size);
  src.onended=()=>remove(b,voice);src.start();return true;
 }catch(e){if(voice){if(b.voices.has(voice))remove(b,voice,true);else for(const n of voice.nodes)try{n.disconnect();}catch{}}return false;}
}
function prime(engine){
 if(!engine?.ac)return;const b=bank(engine);if(b.warm)return;b.warm=true;
 const queue=['shoot','hit','kill','gem','dash','select','menu','hurt','levelup','start','shield'];
 const schedule=fn=>typeof requestIdleCallback==='function'?requestIdleCallback(fn,{timeout:600}):typeof setTimeout==='function'?setTimeout(fn,30):null;
 function next(){const key=queue.shift();if(!key)return;if(!b.cache.has(key))try{sample(engine,key);}catch{}if(queue.length)schedule(next);}
 schedule(next);
}
function stats(engine){const b=engines.get(engine);return {active:b?.voices.size||0,peak:b?.peakVoices||0,cache:b?.cache.size||0,dropped:b?.dropped||0};}
function settingsMarkup(){
 return '<div class="kv-audio-grid">'+['bgm','sfx'].map(k=>'<label class="kv-setting kv-volume"><span>'+ (k==='bgm'?'BGM VOLUME / 楽曲音量':'SFX VOLUME / 効果音量')+' <output id="mix-'+k+'-value">'+Math.round(volume(k)*100)+'%</output></span><input type="range" min="0" max="100" step="1" value="'+Math.round(volume(k)*100)+'" data-audio-volume="'+k+'" aria-label="'+(k==='bgm'?'BGM音量':'効果音音量')+'"></label>').join('')+'<button type="button" class="kv-button" id="audioPreview"><span>♫ SFX PREVIEW</span><small>効果音の試聴</small></button><p class="kv-detail">BGM・SFXのON/OFFとは別に音量を保存します。</p></div>';
}
function bindSettings(doc,onChange,onPreview){
 for(const input of doc.querySelectorAll('[data-audio-volume]')){
  const k=input.dataset.audioVolume;if(!Object.hasOwn(levels,k))continue;
  input.value=String(Math.round(volume(k)*100));
  input.oninput=()=>{if(!setVolume(k,Number(input.value)/100))return;const o=doc.getElementById('mix-'+k+'-value');if(o)o.textContent=Math.round(volume(k)*100)+'%';onChange?.(k,volume(k));};
 }
 const button=doc.getElementById('audioPreview');if(button)button.onclick=()=>onPreview?.();
}
window.RUU_AUDIO={volume,setVolume,resolve,play,prime,stopAll,syncMaster,settingsMarkup,bindSettings,stats};
})();