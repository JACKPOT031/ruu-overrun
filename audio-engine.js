/* RUU//OVERRUN v1.38.0 — SPECTRAL FORGE
   Original layered one-shot sound design: energy, pressure, glass and fracture.
   PCM is cached in small idle slices; playback never consumes combat randomness. */
(()=>{
'use strict';
const M=Math;
const KEY='RUU_AUDIO_MIX_V1', RATE=24000, TAU=2*M.PI, LIMIT=24, ROUTINE=16;
const clamp=(n,a,b)=>M.max(a,M.min(b,n));
const finite=(n,d)=>Number.isFinite(n)?n:d;
const levels={bgm:.8,sfx:.8};
try{const saved=JSON.parse(localStorage.getItem(KEY)||'null');if(saved)for(const k of ['bgm','sfx'])levels[k]=clamp(finite(saved[k],levels[k]),0,1);}catch{}
function volume(k){return levels[k]??.8;}
function setVolume(k,n){if(!Object.hasOwn(levels,k)||!Number.isFinite(n))return false;levels[k]=clamp(n,0,1);try{localStorage.setItem(KEY,JSON.stringify(levels));}catch{}return true;}
// Separate materials with separate envelopes. Body is broad filtered air, never a
// falling bass oscillator. Pitched energy stays above the low percussion register.
const P=(f,end,d,a,at=0,color=.35)=>({k:'p',f,end,d,a,at,color,attack:.002});
const B=(lo,hi,d,a,at=0)=>({k:'b',lo,hi,d,a,at,attack:.003});
const N=(lo,hi,d,a,at=0)=>({k:'n',lo,hi,d,a,at,attack:.0007});
const W=(f,end,d,a,at=0)=>({k:'w',f,end,d,a,at,color:.55,attack:.003});
const C=(f,end,d,a,at=0,color=.35)=>({k:'c',f,end,d,a,at,color,attack:.008});
const G=(f,d,a,at=0,glass=1)=>({k:'g',f,end:f,d,a,at,color:glass,attack:.0012});
const F=(f,d,a,at=0)=>({k:'f',f,end:f*.72,d,a,at,color:.72,attack:.001});
const H=(f,d,a,at=0)=>({k:'h',f,end:f*1.018,d,a,at,color:.2,attack:.015});
const arc=(f=1000,d=.14,a=.8,at=0)=>[
 P(f*1.09,f*.86,d,a*.44,at,.48),B(210,1450,d*.9,a*.79,at),N(2400,6800,.015,a*.22,at),F(2200,d*.55,a*.19,at+.01)
];
const cut=(f=2400,d=.16,a=.8,at=0)=>[
 W(f*1.35,650,d,a*.64,at),B(260,1600,d*.65,a*.64,at+.008),G(f*.76,d*.9,a*.26,at+.006,.45),N(2800,6900,.009,a*.27,at)
];
const rupture=(d=.28,a=.9,at=0)=>[
 B(150,1500,d,a,at),F(1350,d*.92,a*.66,at+.006),W(3600,480,d*.8,a*.43,at),G(1050,d*1.2,a*.21,at+.032,.25)
];
const bloom=(f=1100,d=.35,a=.8,at=0)=>[
 B(180,1200,d*.65,a*.65,at),P(f,f*1.21,d*.6,a*.33,at,.3),G(f*1.4,d,a*.24,at+.018),H(f*.76,d*1.2,a*.17,at+.025)
];
const signal=(f=1100,d=.10,a=.5,at=0)=>[G(f,d,a*.55,at),P(f*.8,f*.84,d*.47,a*.28,at,.08),N(2200,4700,.009,a*.09,at)];
const specs=Object.create(null);
function add(key,p,g,tail,layers,opt={}){specs[key]={p,g,tail,layers,jitter:.018,drive:1.16,hp:120,lp:6700,wet:.11,variants:1,focus:0,...opt};}
// The rapid loop stays compact and centered. Three cached material variations
// per common action vary the fracture/noise pattern, not only its playback pitch.
add('shoot',0,.36,.032,[B(230,1200,.105,.88),P(920,770,.09,.39,0,.24),N(2300,6500,.012,.29),F(2300,.058,.17,.013)],{variants:3,jitter:.015,hp:145,wet:.07});
add('hit',0,.29,.04,[B(300,1900,.084,.77),F(2100,.079,.46),G(1750,.099,.20,.003,.15),N(3400,6900,.009,.23)],{variants:3,jitter:.026,hp:170,wet:.06});
add('kill',0,.43,.085,[...rupture(.18,.8),G(1880,.22,.23,.021,.45),N(3200,6000,.014,.18)],{variants:3,jitter:.024,hp:145,wet:.13});
add('gem',0,.115,.02,[G(1760,.065,.45),P(1160,1450,.036,.12,0,.04)],{variants:3,jitter:.009,hp:300,lp:5900,wet:.08});
add('dash',1,.40,.075,[W(450,3400,.14,.69),W(4300,630,.19,.53,.036),B(220,950,.13,.41,.022)],{hp:130,wet:.18});
add('hurt',3,.55,.085,[B(190,1400,.14,.90),F(1050,.16,.60),P(650,560,.12,.24,0,.73),N(1800,5600,.019,.35)],{hp:120,lp:5600,wet:.09,focus:.76});
add('shield',2,.39,.09,[G(920,.20,.58,0,.35),W(2100,3700,.09,.31),B(300,950,.09,.27)],{hp:180,wet:.19});
// Existing event name, now a restrained electrical warning rather than a pulse drum.
add('heartbeat',2,.23,.04,[P(680,730,.092,.44,0,.15),F(1900,.036,.19,.061),G(1460,.048,.11,.047)],{jitter:0,hp:250,lp:4300,wet:.04});
// Glass, current, air and ruptures carry distinct weapon identities.
add('bolt',1,.43,.055,[...arc(1150,.135,.84),F(3100,.056,.30,.023)],{variants:3,hp:145,wet:.10});
add('nova',1,.50,.15,[W(550,3200,.17,.39),...bloom(860,.31,.83,.025),F(1450,.13,.30,.037)],{hp:110,wet:.23});
add('sonic',1,.40,.075,[W(3400,480,.21,.87),B(250,1250,.17,.60,.018),P(710,990,.14,.19,.014,.1)],{hp:160,lp:5800,wet:.19});
add('prism',1,.39,.095,[G(1320,.23,.48),G(1980,.18,.27,.036),W(2900,1550,.10,.28),B(330,1400,.078,.23)],{variants:3,hp:230,wet:.24});
add('shard',1,.31,.047,[G(2250,.115,.55,0,.9),F(3400,.055,.21,.008),B(400,1600,.06,.28)],{variants:3,hp:250,wet:.12});
add('meteor',1,.51,.15,[W(700,3100,.12,.45),...rupture(.30,.91,.036),P(620,790,.15,.22,.043,.61)],{hp:90,lp:6100,wet:.21});
add('rail',1,.53,.12,[C(600,2200,.043,.26),...arc(1300,.24,.88,.034),W(4800,900,.20,.45,.035),G(2700,.27,.18,.044,.35)],{hp:125,wet:.22});
add('frost',1,.33,.085,[G(2600,.20,.45),G(1830,.17,.24,.025),F(3600,.072,.24,.013),B(430,1300,.066,.20)],{variants:3,hp:260,lp:7000,wet:.23});
add('well',1,.43,.17,[W(1800,330,.29,.68),B(160,1050,.32,.72),P(520,710,.23,.24,.035,.7),F(850,.17,.24,.15)],{hp:100,lp:4800,wet:.25});
add('missile',1,.34,.045,[W(450,3100,.113,.72),B(250,1000,.089,.43),N(2400,5800,.012,.17)],{variants:3,hp:140,wet:.10});
add('explosion',1,.49,.11,[...rupture(.245,.94),N(2200,5800,.019,.21)],{variants:3,hp:100,lp:6000,wet:.17});
add('satellite',1,.50,.16,[C(850,2100,.049,.25),...arc(1450,.26,.83,.038),H(1040,.34,.14,.075),W(3400,1200,.23,.32,.04)],{hp:135,wet:.24});
add('rift',1,.44,.12,[...cut(1850,.25,.83),F(930,.21,.35,.035),P(730,540,.14,.18,.02,.8)],{hp:115,lp:5900,wet:.20});
add('fireworks',1,.39,.13,[...arc(1100,.12,.53),G(2400,.26,.23,.073),F(3300,.14,.35,.083),B(350,1500,.10,.22,.085)],{hp:175,wet:.23});
add('cross',1,.45,.10,[...cut(2600,.18,.82),W(850,3700,.16,.38,.025),G(1590,.21,.18,.018,.3)],{hp:155,wet:.19});
add('ultimatePulse',1,.34,.045,[...arc(920,.10,.70),N(2100,6100,.015,.15)],{variants:3,hp:165,wet:.09});
add('elite',2,.45,.18,[C(570,1700,.15,.35),...rupture(.26,.65,.147),G(1320,.33,.19,.16,.35)],{hp:110,wet:.23,focus:.80});
add('drive',2,.48,.19,[C(510,1700,.20,.48),W(650,3600,.24,.29),...bloom(1100,.34,.65,.207)],{jitter:0,hp:120,wet:.24,focus:.73});
add('chest',2,.36,.15,[G(780,.13,.28,0,.2),...signal(1320,.16,.43,.045),...signal(1980,.20,.31,.13)],{jitter:0,hp:210,wet:.23});
add('combo',2,.24,.055,[...signal(1370,.09,.5),B(450,1400,.049,.15)],{hp:250,wet:.13});
add('comboBig',2,.38,.14,[...signal(1100,.15,.35),...bloom(1470,.24,.55,.075)],{jitter:0,hp:160,wet:.23});
add('reroll',1,.23,.035,[F(1400,.058,.37),G(2200,.07,.32,.045,.3)],{hp:250,wet:.08});
add('rare',2,.37,.20,[...signal(1320,.19,.43),G(1980,.29,.23,.076),H(990,.32,.16,.08)],{jitter:0,hp:220,wet:.28});
add('mythic',3,.52,.28,[C(650,2400,.20,.34),...bloom(1320,.43,.72,.21),G(2640,.39,.21,.29)],{jitter:0,hp:130,wet:.31,focus:.62});
add('select',1,.22,.035,[G(1100,.069,.48,0,.2),N(2400,5200,.009,.13)],{variants:3,jitter:.007,hp:300,lp:5800,wet:.10});
add('menu',1,.175,.024,[G(880,.05,.37,0,.1),N(1800,4300,.007,.15)],{variants:3,jitter:.006,hp:280,lp:5200,wet:.08});
add('start',2,.44,.21,[C(550,1600,.14,.37),...arc(1000,.19,.52,.145),...signal(1650,.25,.28,.235),H(825,.30,.16,.20)],{jitter:0,hp:125,wet:.24,focus:.73});
add('levelup',3,.47,.22,[...signal(990,.16,.31),...signal(1320,.23,.35,.092),...bloom(1650,.30,.46,.19)],{jitter:0,hp:190,wet:.27,focus:.70});
add('evolve',3,.54,.30,[C(480,2300,.25,.49),W(550,3400,.25,.28),...rupture(.29,.54,.257),...bloom(1320,.46,.66,.26)],{jitter:0,hp:105,wet:.29,focus:.58});
add('styleUnlock',3,.43,.25,[C(880,1760,.16,.26),G(1320,.36,.32,.15),G(1980,.35,.24,.24),H(990,.40,.14,.20)],{jitter:0,hp:240,wet:.29,focus:.73});
add('pilotArrival',2,.42,.19,[...signal(880,.10,.28),C(660,1760,.15,.26,.08),...bloom(1320,.30,.56,.22)],{jitter:0,hp:170,wet:.24});
add('pilotElio',1,.28,.10,[G(1250,.17,.35,0,.4),W(850,2100,.12,.38),B(300,1200,.09,.26)],{hp:200,wet:.18});
add('pilotOz',1,.39,.075,[...cut(2700,.14,.70),F(1300,.08,.24,.019)],{hp:155,wet:.13});
add('pilotKai',1,.32,.045,[0,.055,.11].flatMap((at,i)=>arc(950+i*95,.066,.41,at)),{hp:170,wet:.10});
add('pilotSera',1,.27,.15,[C(880,1760,.13,.25),G(2200,.25,.27,.10),H(1100,.25,.16,.09)],{hp:240,wet:.27});
add('pilotMina',1,.27,.09,[P(1200,1630,.09,.24,0,.2),F(2400,.11,.29,.032),G(1720,.16,.18,.037,.5)],{hp:210,wet:.16});
// Large threats have noisy physical mass and dissonant fields; their widening
// afterimages remain behind the centered dry hit. No beat or tom pattern.
add('boss',3,.55,.29,[C(420,1400,.22,.43,0,.6),F(800,.22,.25,.09),...rupture(.37,.84,.245),P(570,670,.26,.22,.27,.75)],{jitter:0,hp:90,lp:5700,wet:.28,focus:.58});
add('devora',3,.57,.32,[C(1300,430,.23,.35,0,.75),F(660,.29,.54,.12),...rupture(.42,.84,.27),P(510,650,.30,.24,.29,.85)],{jitter:0,hp:85,lp:5400,wet:.29,focus:.56});
add('nullEmperor',3,.59,.36,[C(440,1850,.32,.43,0,.6),W(1800,390,.27,.34,.12),...rupture(.39,.81,.345),H(660,.50,.19,.37),G(1030,.44,.19,.35,.2)],{jitter:0,hp:85,lp:5600,wet:.32,focus:.54});
add('trueTrinity',3,.57,.28,[C(540,1620,.22,.32),...[.17,.25,.33].flatMap((at,i)=>arc(1050+i*240,.105,.35,at)),...bloom(1050,.40,.74,.435)],{jitter:0,hp:110,wet:.29,focus:.57});
add('trueQuintet',3,.59,.30,[C(480,1900,.25,.35,0,.7),...[.15,.205,.26,.315,.37].flatMap((at,i)=>cut(1800+i*170,.081,.32,at)),...rupture(.38,.86,.45),G(1670,.38,.19,.46,.25)],{jitter:0,hp:90,wet:.29,focus:.55});
add('eclipse',3,.56,.30,[C(1480,440,.27,.40,0,.65),W(620,3200,.29,.38,.12),...cut(1900,.35,.81,.39),F(750,.31,.36,.41)],{jitter:0,hp:95,lp:5900,wet:.30,focus:.57});
add('eclipseReinforce',3,.51,.20,[...cut(2300,.12,.40),W(600,2900,.17,.38,.10),...rupture(.27,.69,.24)],{jitter:0,hp:115,wet:.25,focus:.65});
add('eclipsePhase',3,.52,.23,[C(520,2300,.18,.39,0,.6),...cut(2600,.32,.81,.185),B(200,1200,.21,.39,.19)],{jitter:0,hp:105,wet:.26,focus:.61});
add('eclipseLast',3,.59,.31,[C(1400,460,.22,.40,0,.7),W(700,3700,.24,.36,.10),...rupture(.40,.91,.33),...cut(2200,.23,.40,.42)],{jitter:0,hp:85,wet:.29,focus:.54});
add('astraea',3,.54,.31,[C(660,2400,.23,.34),...arc(1430,.33,.66,.24),...bloom(1760,.41,.47,.29)],{jitter:0,hp:125,wet:.32,focus:.59});
add('bossPhase3',3,.55,.26,[C(450,1850,.21,.43,0,.7),W(650,3400,.19,.27,.04),...rupture(.34,.86,.22)],{jitter:0,hp:95,wet:.27,focus:.57});
add('bossDown',2,.51,.23,[...rupture(.32,.83),F(2400,.21,.30,.09),G(1380,.35,.20,.045,.25)],{jitter:.01,hp:100,wet:.25,focus:.65});
add('bossBreak',3,.59,.30,[...rupture(.43,1),N(2300,6600,.025,.31),G(1760,.43,.23,.024,.2),F(3100,.25,.24,.16)],{jitter:0,hp:85,wet:.29,focus:.53});
add('victory',3,.48,.32,[...signal(990,.24,.32),...signal(1320,.30,.33,.15),...signal(1980,.42,.29,.32),H(660,.65,.18,.16)],{jitter:0,hp:190,wet:.32,focus:.65});
add('defeat',3,.40,.25,[G(1250,.29,.31,0,.25),P(880,570,.25,.22,.12,.2),F(1100,.27,.22,.19),H(620,.40,.15,.16)],{jitter:0,hp:150,lp:4900,wet:.27,focus:.76});
add('death',3,.55,.29,[W(650,3900,.10,.31),...rupture(.38,.86,.075),P(850,450,.25,.26,.09,.7),F(2200,.18,.24,.29)],{jitter:0,hp:95,lp:5600,wet:.28,focus:.57});
add('deathEcho',3,.27,.27,[F(1150,.28,.40),W(2300,580,.27,.31,.02),H(700,.38,.18,.036)],{jitter:0,hp:180,lp:4900,wet:.32});
add('jackpotDuo',3,.56,.31,[C(660,1980,.18,.32),...arc(1180,.24,.52,.19),G(1760,.36,.28,.25),...bloom(1320,.39,.61,.38)],{jitter:0,hp:115,wet:.31,focus:.57});
add('jackpotWhite',3,.53,.34,[C(880,2640,.22,.30),G(1760,.45,.37,.23),G(2640,.40,.26,.30),...bloom(1320,.41,.43,.24)],{jitter:0,hp:180,wet:.34,focus:.61});
add('jackpotBlack',3,.60,.33,[C(1400,450,.21,.41,0,.72),W(620,3200,.23,.32,.08),...rupture(.42,.95,.29),P(620,770,.27,.24,.31,.78)],{jitter:0,hp:85,lp:5700,wet:.30,focus:.53});
// Nine silhouettes: city beam / golden mirror / riot / ink / helix / silk /
// stencil fracture / broken sync / silver claws. Release matches the cut-in.
const finishers=[
 [C(550,2100,.20,.39),...arc(1270,.34,.80,.215),W(4400,780,.29,.47,.217),H(950,.44,.17,.255)],
 [C(880,2300,.22,.30),G(2640,.38,.28,.222),...cut(2900,.31,.85,.23),...bloom(1320,.39,.39,.25)],
 [C(660,2300,.20,.29),...[.08,.14,.20].flatMap((at,i)=>arc(1050+i*220,.085,.31,at)),...rupture(.35,.81,.29),F(2600,.22,.28,.37)],
 [C(1400,430,.22,.42,0,.69),W(1900,370,.23,.32),...rupture(.43,.91,.25),P(520,710,.29,.23,.28,.78),H(640,.46,.13,.32)],
 [C(550,2700,.26,.37),W(700,3600,.24,.34,.02),P(1600,770,.34,.37,.27,.5),...bloom(1100,.39,.60,.275),W(3600,1000,.28,.36,.29)],
 [C(660,1760,.23,.34,0,.5),W(950,2800,.20,.30,.03),...cut(2200,.37,.91,.24),F(1070,.28,.34,.25),G(1560,.38,.16,.29,.2)],
 [...[0,.075,.14,.195].flatMap((at,i)=>[F(2300-i*260,.061,.29,at),G(1200+i*190,.055,.16,at,.15)]),C(600,1800,.15,.24,.14),...cut(2700,.32,.86,.31),B(180,1400,.24,.45,.315)],
 [...[0,.04,.125,.20].flatMap((at,i)=>[P([1300,730,1750,960][i],850,.038,.27,at,.74),F(2400,.027,.24,at)]),C(950,2100,.12,.24,.18,.6),...rupture(.34,.78,.315),G(2400,.31,.20,.36,.25)],
 [C(660,1950,.17,.32),...[.18,.265,.35].flatMap((at,i)=>cut(3100-i*300,.17,.56,at)),G(2100,.32,.22,.37),B(200,1200,.22,.46,.35)]
];
finishers.forEach((layers,i)=>add('finisher'+i,3,.57,[.27,.30,.26,.33,.31,.28,.25,.27,.28][i],layers,{jitter:0,hp:[110,160,105,85,120,115,120,105,160][i],lp:i===3?5600:6700,wet:.29,focus:.55}));
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
function* buildSteps(ac,key,variant=0){
 const spec=specs[key],duration=M.max(...spec.layers.map(l=>l.at+l.d)),dry=new Float32Array(M.ceil(duration*RATE)+1);
 for(const [index,l] of spec.layers.entries()){
  const offset=M.round(l.at*RATE),len=M.min(dry.length-offset,M.ceil(l.d*RATE));
  const variation=spec.variants>1?[-.7,.45,.85][variant]:0;
  const detune=1+variation*(l.k==='g'?.012:.038),materialGain=1+variation*((index&1)?-.065:.065);
  let phase=0,mod=0,phase2=0,lo=0,hi=0,coarse=0,seed=seedFor(key+':'+variant+':'+index),f=(l.f||0)*detune;
  let band1=0,band2=0,n1=0,n2=0,b0=0,b2=0,a1=0,a2=0;
  const cLo=1-M.exp(-TAU*(l.lo||220)/RATE),cHi=1-M.exp(-TAU*(l.hi||5600)/RATE);
  const sweep=l.f?M.pow(l.end/l.f,1/M.max(1,len-1)):1;
  const modes=l.k==='g'||l.k==='h'?[1,1.497+(.27*l.color),2.141+(.11*l.color),2.893]:null;
  const phases=[0,0,0,0];
  for(let i=0;i<len;i++){
   const u=i/M.max(1,len-1),t=i/RATE,edge=M.min(1,t/l.attack),end=M.min(1,(l.d-t)/.006);
   seed=(M.imul(seed,1664525)+1013904223)>>>0;
   const noise=seed/2147483648-1;hi+=cHi*(noise-hi);lo+=cLo*(noise-lo);coarse+=.035*(noise-coarse);
   const air=(hi-lo)*1.75;
   let env=edge*end,x=0;
   if(l.k==='b'){
    // Aperiodic pressure: broad-band air with a rounded shoulder and no pitch.
    env*=M.exp(-u*3.4)*(1-u)*(.84+.16*M.sin(u*M.PI));x=air*2.35;
   }else if(l.k==='n'){
    env*=M.exp(-u*5)*(1-u);x=air;
   }else if(l.k==='w'||l.k==='f'){
    if((i&31)===0){const w=TAU*f/RATE,alpha=M.sin(w)/(2*(l.k==='f'?.68:.54)),a0=1+alpha;b0=alpha/a0;b2=-b0;a1=-2*M.cos(w)/a0;a2=(1-alpha)/a0;}
    x=b0*noise+b2*n2-a1*band1-a2*band2;n2=n1;n1=noise;band2=band1;band1=x;f*=sweep;
    if(l.k==='f'){
     // Irregular micro-fractures, not a periodic machine-gun gate.
     const grain=.47+.53*M.min(1,M.abs(coarse)*7);x=x*2.2*grain+air*.17;
     env*=M.exp(-u*3.2)*M.pow(1-u,1.1);
    }else{env*=M.pow(M.sin(M.PI*(u*.86+.04)),.65)*M.exp(-u*1.25)*(1-u);x*=2.1;}
   }else if(modes){
    for(let m=0;m<4;m++){
     phases[m]+=TAU*f*modes[m]/RATE;
     x+=M.sin(phases[m]+(l.k==='g'?coarse*.06:0))*[.50,.25,.16,.09][m]*M.exp(-u*(l.k==='h'?.8:1.5+m*1.1));
    }
    env*=M.pow(1-u,l.k==='h'?1.3:1.8);if(l.k==='h')env*=M.sin(M.PI*M.min(1,u*4)*.5);f*=sweep;
   }else{
    phase+=TAU*f/RATE;mod+=TAU*f*(l.k==='c'?1.013:1.47)/RATE;phase2+=TAU*f*2.003/RATE;f*=sweep;
    const grit=l.color,field=M.sin(phase+M.sin(mod)*grit*(l.k==='c'?.9:1.35)+coarse*grit*.9);
    x=field*.55+M.sin(phase2)*.13+air*(l.k==='c'?.32:.17);
    if(l.k==='c')env*=M.pow(M.sin(u*M.PI*.5),1.6);
    else env*=M.exp(-u*2.5)*M.pow(1-u,1.2);
   }
   dry[offset+i]+=x*env*l.a*materialGain;
   if((i&511)===511)yield;
  }
  yield;
 }
 const hp=filter('high',spec.hp),lp=filter('low',spec.lp),reflection=new Float32Array(dry.length);
 let low=0;const lowCoef=1-M.exp(-TAU*950/RATE);
 for(let i=0;i<dry.length;i++){
  const v=filtered(lp,filtered(hp,M.tanh(dry[i]*spec.drive)));
  dry[i]=v*M.min(1,i/(RATE*.0008),(dry.length-1-i)/(RATE*.006));
  low+=lowCoef*(dry[i]-low);reflection[i]=dry[i]-low;
  if((i&511)===511)yield;
 }
 yield;
 const frames=dry.length+M.ceil(spec.tail*RATE),buffer=ac.createBuffer(2,frames,RATE);
 const left=buffer.getChannelData(0),right=buffer.getChannelData(1);
 // Positive, decorrelated upper-band reflections leave the dry center and body
 // intact in mono. Large events get a deeper room, ordinary fire only a short edge.
 const taps=[[.011,.62,.17],[.019,.18,.58],[.031,.32,.11],[.043,.12,.30],[.067,.23,.08],[.089,.08,.20],[.127,.13,.04],[.173,.04,.10],[.229,.055,.025],[.281,.025,.05]].filter(t=>t[0]<spec.tail);
 const delays=taps.map(([d,l,r])=>[M.round(d*RATE),l*spec.wet,r*spec.wet]);let peak=0,energy=0;
 for(let i=0;i<frames;i++){
  const v=i<dry.length?dry[i]:0;let l=v,r=v;
  for(const [d,a,b] of delays){const j=i-d;if(j>=0&&j<dry.length){l+=reflection[j]*a;r+=reflection[j]*b;}}
  const fade=M.min(1,(frames-1-i)/M.round(.008*RATE));
  left[i]=l*fade;right[i]=r*fade;peak=M.max(peak,M.abs(left[i]),M.abs(right[i]));energy+=left[i]*left[i]+right[i]*right[i];
  if((i&511)===511)yield;
 }
 yield;
 // Peak ceiling preserves transient shape; an RMS ceiling stops noisy ruptures
 // from being promoted to the same sustained loudness as a thin metallic click.
 const rms=M.sqrt(energy/(frames*2));const gain=M.min(.80/M.max(.1,peak),.22/M.max(.001,rms));
 for(let i=0;i<frames;i++){left[i]*=gain;right[i]*=gain;if((i&511)===511)yield;}
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
function stats(engine){const b=engines.get(engine);return {active:b?.voices.size||0,peak:b?.peakVoices||0,cache:b?.cache.size||0,dropped:b?.dropped||0};}
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
window.RUU_AUDIO={volume,setVolume,masterGain,resolve,play,prime,stopAll,syncMaster,settingsMarkup,bindSettings,stats};
})();
