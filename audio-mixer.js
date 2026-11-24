/* RUU//OVERRUN v1.40.0 — live audio controls. Opening the mixer never changes game state. */
(()=>{
'use strict';
let current=null;
const clamp=n=>Math.max(0,Math.min(100,Number.isFinite(n)?n:80));
const editingText=el=>!!el?.closest?.('textarea,select,[contenteditable=""],[contenteditable="true"],input:not([type="range"]):not([type="button"]):not([type="checkbox"]):not([type="radio"])');
function init(options={}){
 destroy();
 const doc=options.document||document,frame=options.frame,button=options.button;
 if(!frame||!button)return false;
 const panel=doc.createElement('section');
 panel.id='audioMixerPanel';panel.className='audio-mixer';panel.hidden=true;
 panel.setAttribute('role','region');panel.setAttribute('aria-labelledby','audioMixerHeading');
 panel.innerHTML=`<header class="audio-mixer-head"><div><span class="audio-mixer-kicker">SLASH WIND</span><h2 id="audioMixerHeading">AUDIO MIXER <small>音量</small></h2></div><button id="audioMixerClose" type="button" aria-label="音量パネルを閉じる" title="閉じる / O・ESC">×</button></header>
 <p class="audio-mixer-state" id="audioMixerState"></p>
 ${['Bgm','Sfx'].map(k=>`<div class="audio-mixer-channel" data-channel="${k.toLowerCase()}"><label for="liveAudio${k}">${k==='Bgm'?'BGM <small>楽曲</small>':'SFX <small>効果音</small>'}</label><output id="liveAudio${k}Value" for="liveAudio${k}">80%</output><button id="liveAudio${k}Toggle" type="button" aria-label="${k==='Bgm'?'BGM':'効果音'}の再生" aria-pressed="true">ON</button><input id="liveAudio${k}" type="range" min="0" max="100" step="1" value="80" data-live-audio-volume="${k.toLowerCase()}" aria-label="${k==='Bgm'?'BGM':'効果音'}音量" aria-valuetext="80%"></div>`).join('')}
 <div class="audio-mixer-foot"><button id="audioMixerPreview" type="button">⚡ 効果音を試聴</button><span>設定は自動保存</span></div>
 <p class="audio-mixer-help">O / ESC で閉じる · 音量はその場で反映</p>`;
 const quick=doc.createElement('button');
 quick.id='audioMixerQuick';quick.type='button';quick.className='audio-mixer-quick';quick.textContent='♫ AUDIO';quick.hidden=true;
 quick.setAttribute('aria-label','音量パネルを開く');quick.title='BGM・効果音の音量 / O';
 frame.append(quick,panel);
 const get=id=>doc.getElementById(id),channels={};
 for(const k of ['bgm','sfx']){const id=k==='bgm'?'Bgm':'Sfx';channels[k]={input:get('liveAudio'+id),output:get('liveAudio'+id+'Value'),toggle:get('liveAudio'+id+'Toggle')};}
 const m={doc,frame,button,quick,panel,options,channels,close:get('audioMixerClose'),preview:get('audioMixerPreview'),state:get('audioMixerState'),opener:null,disposers:[],observer:null,boardObserver:null,mountObserver:null};
 current=m;
 const listen=(el,name,fn,opts)=>{el.addEventListener(name,fn,opts);m.disposers.push(()=>el.removeEventListener(name,fn,opts));};
 for(const trigger of [button,quick]){
  trigger.setAttribute('aria-controls',panel.id);trigger.setAttribute('aria-expanded','false');
  listen(trigger,'click',ev=>{ev.stopPropagation();toggle(trigger);});
  listen(trigger,'keydown',ev=>{if(handleKey(ev))ev.stopPropagation();});
 }
 listen(m.close,'click',()=>close());
 for(const [k,ch] of Object.entries(channels)){
  listen(ch.input,'input',()=>{
   const audio=window.RUU_AUDIO,value=clamp(Number(ch.input.value))/100;
   if(!audio?.setVolume?.(k,value))return;
   options.onVolume?.(k,value);sync();
  });
  listen(ch.toggle,'click',()=>{options.onToggle?.(k);sync();});
 }
 listen(m.preview,'click',()=>{if(enabled('sfx')&&volume('sfx')>0){options.onPreview?.();sync();}});
 // Native slider keys keep their normal browser behavior. No keydown in this
 // panel reaches the game's movement/dash/ending shortcuts; keyup still does.
 listen(panel,'keydown',ev=>{handleKey(ev);ev.stopPropagation();});
 for(const name of ['click','pointerdown','pointerup','pointermove','touchstart','touchmove','touchend'])listen(panel,name,ev=>ev.stopPropagation());
 listen(panel,'focusin',ev=>{if(!panel.contains(ev.relatedTarget))options.onFocus?.();});
 listen(doc,'input',ev=>{if(ev.target?.matches?.('[data-audio-volume]'))sync();});
 // The existing M/N shortcuts, title proxies and ED controls update these
 // authoritative buttons. Observe their labels instead of polling every frame.
 if(typeof MutationObserver!=='undefined'){
  const observer=new MutationObserver(()=>sync());m.observer=observer;
  for(const id of ['mute','sfxToggle']){const el=get(id);if(el)observer.observe(el,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['disabled']});}
  // Ranking is a modal with its own keyboard capture. It must take priority
  // over this nonmodal panel, including when public-features mounts it later.
  const observeBoard=()=>{
   const board=get('ruu-public-modal');if(!board)return false;
   m.boardObserver=new MutationObserver(records=>{if(records.some(r=>r.target===board&&r.attributeName==='hidden'))sync();});
   m.boardObserver.observe(board,{attributes:true,attributeFilter:['hidden']});
   m.mountObserver?.disconnect();return true;
  };
  if(!observeBoard()){
   m.mountObserver=new MutationObserver(records=>{
    if(records.some(r=>Array.from(r.addedNodes||[]).some(n=>n.id==='ruu-public-modal'))&&observeBoard())sync();
   });
   m.mountObserver.observe(frame,{childList:true});
  }
 }
 sync();return true;
}
function volume(k){const n=window.RUU_AUDIO?.volume?.(k);return Number.isFinite(n)?Math.max(0,Math.min(1,n)):.8;}
function enabled(k){return current?.options.getEnabled?!!current.options.getEnabled(k):true;}
function modalOpen(){const modal=current?.doc.getElementById('ruu-public-modal');return !!modal&&!modal.hidden;}
function sync(){
 const m=current;if(!m)return;
 const state=m.options.getState?.()||'start',available=typeof window.RUU_AUDIO?.setVolume==='function';
 const blocked=modalOpen();
 m.button.disabled=!available||blocked;
 m.quick.hidden=!available||blocked||!['playing','paused','levelup','bossbreak','dying','ending'].includes(state);
 m.quick.classList.toggle('is-ending',state==='ending');m.panel.classList.toggle('is-ending',state==='ending');
 const messages={playing:'LIVE MIX · 戦闘は進行中',paused:'PAUSED · 一時停止中',levelup:'UPGRADE · 強化を選択中',bossbreak:'BOSS BREAK · 演出中',dying:'SIGNAL LOST · 演出中',ending:'ENDING · 楽曲の音量を調整'};
 const message=messages[state]||'BGM / SFX · 独立した音量設定';if(m.state.textContent!==message)m.state.textContent=message;
 m.state.classList.toggle('is-live',state==='playing');
 for(const [k,ch] of Object.entries(m.channels)){
  const value=String(Math.round(volume(k)*100)),on=enabled(k);
  if(ch.input.value!==value)ch.input.value=value;
  ch.input.setAttribute('aria-valuetext',value+'%');
  if(ch.output.textContent!==value+'%')ch.output.textContent=value+'%';
  if(ch.toggle.textContent!==(on?'ON':'OFF'))ch.toggle.textContent=on?'ON':'OFF';
  ch.toggle.setAttribute('aria-pressed',String(on));ch.toggle.title=on?'クリックして消音':'クリックして再生を有効化';
  // Keep title-screen controls current even if the live mixer is used on top.
  for(const input of m.doc.querySelectorAll('[data-audio-volume="'+k+'"]'))if(input.value!==value)input.value=value;
  const output=m.doc.getElementById('mix-'+k+'-value');if(output&&output.textContent!==value+'%')output.textContent=value+'%';
 }
 m.preview.disabled=!available||!enabled('sfx')||volume('sfx')===0;
 m.preview.title=m.preview.disabled?'SFXをONにして音量を上げると試聴できます':'現在の効果音量で試聴';
 if((!available||blocked)&&!m.panel.hidden)close({restoreFocus:false});
}
function open(opener){
 const m=current;if(!m||typeof window.RUU_AUDIO?.setVolume!=='function'||modalOpen()||m.options.canOpen?.()===false)return false;
 if(!m.panel.hidden){sync();return true;}
 m.opener=opener||m.doc.activeElement;
 m.panel.hidden=false;for(const trigger of [m.button,m.quick])trigger.setAttribute('aria-expanded','true');
 sync();m.channels.bgm.input.focus({preventScroll:true});return true;
}
function close({restoreFocus=true}={}){
 const m=current;if(!m||m.panel.hidden)return false;
 const hadFocus=m.panel.contains(m.doc.activeElement);
 m.panel.hidden=true;for(const trigger of [m.button,m.quick])trigger.setAttribute('aria-expanded','false');
 if(restoreFocus&&hadFocus){const target=m.opener;if(target?.isConnected&&!target.hidden&&!target.disabled)target.focus?.({preventScroll:true});}
 m.opener=null;return true;
}
function toggle(opener){return current?.panel.hidden?open(opener):close();}
function handleKey(ev){
 const m=current;if(!m)return false;
 const key=String(ev.key||'').toLowerCase(),inside=m.panel.contains(ev.target),trigger=ev.target===m.button||ev.target===m.quick;
 if(!m.panel.hidden&&key==='escape'){
  ev.preventDefault();ev.stopPropagation();if(!ev.repeat)close();return true;
 }
 if(key==='o'&&!ev.ctrlKey&&!ev.metaKey&&!ev.altKey&&!editingText(ev.target)){
  if(!ev.repeat){if(m.panel.hidden){if(!open(trigger?ev.target:undefined))return false;}else close();}
  ev.preventDefault();ev.stopPropagation();return true;
 }
 if(inside||(trigger&&['enter',' ','tab'].includes(key))){ev.stopPropagation();return true;}
 return false;
}
function destroy(){
 const m=current;if(!m)return;
 close({restoreFocus:false});m.observer?.disconnect();m.boardObserver?.disconnect();m.mountObserver?.disconnect();for(const off of m.disposers)off();
 m.quick.remove();m.panel.remove();m.button.removeAttribute('aria-controls');m.button.removeAttribute('aria-expanded');current=null;
}
window.RUU_AUDIO_MIXER={init,sync,open,close,toggle,handleKey,destroy};
})();
