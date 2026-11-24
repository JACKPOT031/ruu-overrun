/* Integration tests: exercise actual inline production audio and BGM functions. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=process.argv[2]||path.resolve(__dirname,'..');
const src=fs.readFileSync(path.join(root,'index.html'),'utf8');
function section(a,b){const i=src.indexOf(a),j=src.indexOf(b,i+a.length);assert.ok(i>=0&&j>i,a);return src.slice(i,j);}
const code=[section('const SFX_GAP=','function updateMusic()'),section('function musicTrackEnvelope(el)','musicEls.forEach((el,i)=>{'),section('function startDeathSequence()','let bossBreakScene=null;'),section('function startBossBreak(e)','function endGame(win)')].join('\n');
function fixture(){
 const levels={bgm:.37,sfx:.8},sounds=[],old=[],noop=()=>{};
 const musicEls=Array.from({length:16},()=>({volume:1,paused:false,readyState:2,play(){this.paused=false;},pause(){this.paused=true;}}));
 const box={window:{RUU_AUDIO:{volume:k=>levels[k],resolve:(name,o)=>o.cue||name,play:(name,a,o)=>{sounds.push([name,o]);return true;}},RUU_PREMIUM:{playSound:name=>{old.push(name);return true;}},RUU_EXPANSION:{bossStart:()=>({duration:1}),tick:noop,endBoss:noop}},audio:{ac:{state:'running',currentTime:5}},sfxEnabled:true,musicFocus:{level:1,target:1,hold:0},deathScene:null,deathSequenceDone:false,sfxCooldown:Object.create(null),g:{player:{x:0,y:0},jackpotType:2,finisherType:8,time:40,bossBreaks:0},state:'playing',levels,activeTrack:0,musicEls,musicRequest:0,musicStarted:true,musicFade:null,mixSlot:0,musicMode:'0',mixRunIndex:0,musicSeq:0,pendingMusic:null,soundOn:false,ENDING_TRACK_INDEX:15,NORMAL_TRACK_COUNT:12,ENDING_AUDIO_CUE:151.687,ENDING_TITLE:'ED',endingState:{paused:false},endingClock:()=>0,MUSIC_TRACKS:musicEls.map((_,i)=>({title:'song'+i})),musicIndicator:{classList:{add:noop},style:{}},musicMeter:{classList:{add:noop}},ui:{pause:{},hud:{style:{}},toasts:{}},bossAlert:{classList:{remove:noop}},saveBest:noop,keys:new Set(),joy:{active:false},bossBreakScene:null,fxPreset:'lite',clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),cancelPendingMusic:noop,ensureTrackLoaded:i=>musicEls[i],activeMusic:()=>musicEls[box.activeTrack],musicLabel:noop,musicOnScreen:noop,showMusicRetry:noop,nowTrackName:()=>'',pauseAllMusic:()=>{musicEls.forEach(e=>e.pause());box.musicFade=null;},unloadTrack:noop};
 vm.createContext(box);vm.runInContext(code,box);return {box,sounds,old,musicEls,levels};
}
let count=0;function test(n,f){f();console.log('PASS',n);count++;}
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,a+' vs '+b);
test('actual SFX hook preserves cooldown, context and stereo location',()=>{const {box,sounds,old}=fixture();box.sfx('hit',{x:-300,y:400});box.sfx('hit',{x:300,y:400});assert.equal(sounds.length,1);near(sounds[0][1].pan,-.5);near(sounds[0][1].distance,500);assert.equal(sounds[0][1].jackpotType,2);assert.equal(sounds[0][1].finisherType,8);box.audio.ac.currentTime+=.11;box.sfx('hit',{x:300,y:400});near(sounds[1][1].pan,.5);assert.equal(old.length,0);});
test('player muzzle stays centered while target impacts retain their own position',()=>{
 const {box,sounds}=fixture(),bullets=[];
 box.g.player={x:80,y:-20,damage:13,mods:{pulse:1,echo:0}};
 let target={x:680,y:-20};
 Object.assign(box,{nearestEnemy:()=>target,fireBullet:(...args)=>bullets.push(args),burst(){},addMuzzle(){},fxMax:false});
 vm.runInContext(section('function attackPulse()','function strikeLightning()'),box);
 box.attackPulse();near(sounds[0][1].pan,0);near(sounds[0][1].distance,0);near(bullets[0][2],580);
 box.audio.ac.currentTime+=.2;target={x:-220,y:-20};box.attackPulse();
 near(sounds[1][1].pan,0);near(sounds[1][1].distance,0);near(bullets[1][2],-580);
 box.sfx('hit',target);near(sounds[2][1].pan,-.5);near(sounds[2][1].distance,300);
});
test('live audition uses the actual shot without consuming combat cooldown or bypassing mute',()=>{
 const {box,sounds}=fixture();box.getAudio=()=>box.audio;
 vm.runInContext(section('function userSfx(name','function tone('),box);
 box.sfx('shoot');assert.equal(sounds.length,1);const cooldown=box.sfxCooldown.shoot;
 box.userSfx('shoot',{preview:true});assert.equal(sounds.length,2);near(box.sfxCooldown.shoot,cooldown);
 box.userSfx('shoot');assert.equal(sounds.length,2,'normal gesture still respects combat cooldown');
 box.sfxEnabled=false;box.userSfx('shoot',{preview:true});assert.equal(sounds.length,2,'muted preview never reaches playback');
 box.sfxEnabled=true;box.audio.ac.state='closed';box.userSfx('shoot',{preview:true});assert.equal(sounds.length,2);
});
test('different boss warnings do not mask each other; repeated cue cooldown',()=>{const {box,sounds}=fixture();box.sfx('boss',{cue:'devora'});box.sfx('boss',{cue:'nullEmperor'});box.sfx('boss',{cue:'devora'});assert.equal(sounds.length,2);box.sfxEnabled=false;box.sfx('gem');assert.equal(sounds.length,2);});
test('old audio fallback remains usable when new module unavailable',()=>{const {box,old}=fixture();delete box.window.RUU_AUDIO;box.sfx('hit');assert.equal(old.length,1);});
test('selected BGM volume in battle, exclusive song, ending and resume',()=>{const {box,musicEls,levels}=fixture();box.startStageMusic();near(musicEls[0].volume,.37);box.setExclusiveTrack(14);near(musicEls[14].volume,.37);box.playEndingSong(true);near(musicEls[15].volume,.37);box.soundOn=true;box.state='playing';box.resumeStageMusic();near(musicEls[0].volume,.37);levels.bgm=0;box.soundOn=false;box.setExclusiveTrack(12);near(musicEls[12].volume,0);box.playEndingSong(true);near(musicEls[15].volume,0);});
test('crossfade and boss cinematic use selected level, never reset it to 80%',()=>{const {box,musicEls}=fixture();box.musicFade={from:musicEls[0],to:musicEls[1],elapsed:.94,duration:2};box.updateMusicFade(.06);near(musicEls[0].volume,.185);near(musicEls[1].volume,.185);box.musicFade.elapsed=1.98;box.updateMusicFade(.06);near(musicEls[1].volume,.37);near(musicEls[0].volume,.37);box.activeTrack=1;musicEls[1].paused=false;box.startBossBreak({kind:'boss'});near(musicEls[1].volume,.37*.39/.8);box.updateBossBreak(1);near(musicEls[1].volume,.37);});
test('actual JACKPOT MODE and finisher hooks avoid preselection duplicate audio',()=>{assert.match(src,/if\(u\.type!=='JACKPOT_MODE'\)sfx\(/);assert.match(src,/if\(!window\.RUU_AUDIO\)sfx\(index===1/);assert.match(src,/g\.jackpotType=index;g\.jackpotTime=j\.duration/);assert.match(src,/setExclusiveTrack\(j\.song\);toast\([^;\n]+\);sfx\('jackpot'\)/);assert.match(src,/msg\.startsWith\('RUU STYLE UNLOCKED \/\/ '\)\)sfx\('styleUnlock'\)/);});
test('changing the mix mid-crossfade preserves both envelopes through boss break',()=>{
 const {box,musicEls,levels}=fixture();
 box.activeTrack=1;box.musicFade={from:musicEls[0],to:musicEls[1],elapsed:.5,duration:2};
 levels.bgm=.2;box.applyMusicVolumes();near(musicEls[0].volume,.15);near(musicEls[1].volume,.05);
 box.startBossBreak({kind:'boss'});near(musicEls[0].volume,.15*.39/.8);near(musicEls[1].volume,.05*.39/.8);
 levels.bgm=.64;box.applyMusicVolumes();near(musicEls[0].volume,.48*.39/.8);near(musicEls[1].volume,.16*.39/.8);
 box.updateMusicFade(.06);near(musicEls[0].volume,.64*.72*.39/.8);near(musicEls[1].volume,.64*.28*.39/.8);
 box.updateBossBreak(1);near(musicEls[0].volume,.64*.72);near(musicEls[1].volume,.64*.28);
 levels.bgm=0;box.updateMusicFade(.06);near(musicEls[0].volume,0);near(musicEls[1].volume,0);
});
test('death keeps a relative fade when volume changes, including zero and mute resume',()=>{
 const {box,musicEls,levels}=fixture();box.activeTrack=1;
 box.musicFade={from:musicEls[0],to:musicEls[1],elapsed:1,duration:2};box.applyMusicVolumes();
 box.startDeathSequence();assert.equal(box.state,'dying');assert.equal(box.deathScene.source,musicEls[1]);near(box.deathScene.startGain,.5);
 box.updateDeathSequence(.875);levels.bgm=.24;box.applyMusicVolumes();near(musicEls[1].volume,.24*.5*Math.pow(.5,1.5));
 near(musicEls[0].volume,0);levels.bgm=0;box.applyMusicVolumes();near(musicEls[1].volume,0);
 levels.bgm=.5;box.pauseAllMusic();box.soundOn=true;box.resumeStageMusic();assert.equal(box.activeTrack,1);assert.equal(musicEls[1].paused,false);
 near(musicEls[1].volume,.5*.5*Math.pow(.5,1.5));
 box.updateDeathSequence(.875);box.pauseAllMusic();box.resumeStageMusic();assert.ok(musicEls.every(el=>el.paused));near(musicEls[1].volume,0);
});
test('major cue focus is short, smoothed and respects the selected BGM level',()=>{
 const {box,musicEls,levels}=fixture();box.soundOn=true;
 box.focusMusicForCue('shoot');near(box.musicFocus.target,1);
 box.focusMusicForCue('signature');near(box.musicFocus.target,.76);
 box.updateMusicFocus(.016);assert.ok(box.musicFocus.level<1&&box.musicFocus.level>.76);
 levels.bgm=.4;box.applyMusicVolumes();near(musicEls[0].volume,.4*box.musicFocus.level);
 for(let i=0;i<20;i++)box.updateMusicFocus(.016);
 assert.ok(box.musicFocus.level<.78,'opening gesture has room through the release');
 box.focusMusicForCue('jackpot');near(box.musicFocus.target,.76,'weaker overlapping accent must not release focus early');
 for(let i=0;i<160;i++)box.updateMusicFocus(.016);
 assert.ok(Math.abs(musicEls[0].volume-.4)<.001);
 levels.sfx=0;box.musicFocus.target=1;box.focusMusicForCue('boss');near(box.musicFocus.target,1);
 levels.sfx=.8;box.sfxEnabled=false;box.focusMusicForCue('jackpot');near(box.musicFocus.target,1);
 box.sfxEnabled=true;box.state='ending';box.focusMusicForCue('signature');near(box.musicFocus.target,1);
});
test('exclusive song entrance uses gentle focus and repeated combat never pumps music',()=>{
 const {box,musicEls,levels}=fixture();box.soundOn=true;
 box.focusMusicForCue('jackpot');near(box.musicFocus.target,.86);
 box.updateMusicFocus(.025);levels.bgm=0;box.applyMusicVolumes();near(musicEls[0].volume,0);
 levels.bgm=.23;
 for(let i=0;i<220;i++){
  for(const cue of ['shoot','hit','kill','rail','explosion','gem'])box.focusMusicForCue(cue);
  box.updateMusicFocus(.016);
 }
 near(box.musicFocus.target,1);assert.ok(Math.abs(musicEls[0].volume-.23)<.0001);near(levels.bgm,.23);
});
console.log(count+' audio integration suites passed');

