/* Live mixer behavior with a minimal DOM. The game callbacks remain authoritative. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(process.argv[2]||path.resolve(__dirname,'..'),'audio-mixer.js'),'utf8');
function fixture({available=true,state='playing'}={}){
 const nodes=new Map(),observers=[],levels={bgm:.8,sfx:.6},on={bgm:true,sfx:true},changed=[],keys=new Set(['w']);let previews=0;
 function event(type,extra={}){return {type,preventDefault(){this.defaultPrevented=true;},stopPropagation(){this.stopped=true;},...extra};}
 class El{
  constructor(tag='div'){this.tagName=tag.toUpperCase();this.listeners=new Map();this.attributes={};this.children=[];this.value='';this.textContent='';this.hidden=false;this.disabled=false;this.dataset={};const classes=new Set();this.classList={toggle:(k,v)=>v?classes.add(k):classes.delete(k),contains:k=>classes.has(k)};}
  set id(v){this._id=v;nodes.set(v,this);}get id(){return this._id;}
  get isConnected(){return this===doc.body||!!this.parentNode?.isConnected;}
  set innerHTML(text){for(const match of text.matchAll(/<([a-z]+)\b([^>]*\bid="([^"]+)"[^>]*)>/g)){const child=new El(match[1]);child.id=match[3];for(const a of match[2].matchAll(/([\w-]+)="([^"]*)"/g))child.setAttribute(a[1],a[2]);if(child.attributes.value)child.value=child.attributes.value;this.append(child);}}
  setAttribute(k,v){this.attributes[k]=String(v);if(k==='type')this.type=v;}removeAttribute(k){delete this.attributes[k];}getAttribute(k){return this.attributes[k]??null;}
  append(...els){for(const el of els){this.children.push(el);el.parentNode=this;}}
  remove(){if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(x=>x!==this);this.parentNode=null;nodes.delete(this.id);}
  contains(el){for(let n=el;n;n=n.parentNode)if(n===this)return true;return false;}
  closest(){return ['TEXTAREA','SELECT'].includes(this.tagName)||this.attributes.contenteditable==='true'||(this.tagName==='INPUT'&&!['range','button','checkbox','radio'].includes(this.type))?this:null;}
  matches(selector){return selector==='[data-audio-volume]'&&!!this.attributes['data-audio-volume'];}
  addEventListener(type,fn){if(!this.listeners.has(type))this.listeners.set(type,[]);this.listeners.get(type).push(fn);}
  removeEventListener(type,fn){this.listeners.set(type,(this.listeners.get(type)||[]).filter(x=>x!==fn));}
  dispatchEvent(e){e.target??=this;for(const fn of this.listeners.get(e.type)||[])fn(e);if(!e.stopped)this.parentNode?.dispatchEvent(e);return !e.defaultPrevented;}
  click(){if(!this.disabled)this.dispatchEvent(event('click'));}
  focus(){const relatedTarget=doc.activeElement;doc.activeElement=this;this.dispatchEvent(event('focusin',{relatedTarget}));}
 }
 const doc=new El();doc.body=new El('body');doc.body.parentNode=doc;doc.activeElement=doc.body;doc.createElement=tag=>new El(tag);doc.getElementById=id=>nodes.get(id)||null;
 doc.querySelectorAll=selector=>{const key=selector.match(/data-audio-volume="(bgm|sfx)"/)?.[1];return key?[...nodes.values()].filter(el=>el.attributes['data-audio-volume']===key):[];};
 const make=(id,tag='button',parent=doc.body)=>{const el=new El(tag);el.id=id;parent.append(el);return el;};
 const frame=make('frame','div'),button=make('audioMixerButton');make('mute');make('sfxToggle');
 const box={document:doc,MutationObserver:class{constructor(callback){this.callback=callback;observers.push(this);}observe(){}disconnect(){this.disconnected=true;}}};box.window=box;
 if(available)box.RUU_AUDIO={volume:k=>levels[k],setVolume:(k,v)=>{levels[k]=v;return true;}};
 vm.runInNewContext(source,box);
 const settings={state},api=box.RUU_AUDIO_MIXER;
 const config={frame,button,getState:()=>settings.state,getEnabled:k=>on[k],onToggle:k=>{on[k]=!on[k];},onVolume:(k,v)=>changed.push([k,v]),onPreview:()=>previews++,onFocus:()=>keys.clear()};
 api.init(config);
 return {api,config,doc,frame,button,nodes,levels,on,settings,changed,observers,keys,make,event,previews:()=>previews,get:id=>nodes.get(id)};
}
let count=0;function test(name,fn){fn();console.log('PASS',name);count++;}
test('opening live mixer keeps game state, clears held movement and restores trigger focus',()=>{
 const f=fixture();f.button.focus();f.button.click();assert.equal(f.settings.state,'playing');assert.equal(f.get('audioMixerPanel').hidden,false);assert.equal(f.keys.size,0);assert.equal(f.doc.activeElement,f.get('liveAudioBgm'));assert.equal(f.button.getAttribute('aria-expanded'),'true');assert.equal(f.get('audioMixerQuick').getAttribute('aria-expanded'),'true');
 f.get('audioMixerClose').click();assert.equal(f.get('audioMixerPanel').hidden,true);assert.equal(f.doc.activeElement,f.button);assert.equal(f.button.getAttribute('aria-expanded'),'false');
});
test('live levels apply immediately without changing independent mute flags; title controls synchronize',()=>{
 const f=fixture(),title=f.make('titleBgm','input'),out=f.make('mix-bgm-value','output');title.setAttribute('data-audio-volume','bgm');f.on.bgm=false;f.api.open();const range=f.get('liveAudioBgm');range.value='23';range.dispatchEvent(f.event('input'));assert.equal(f.levels.bgm,.23);assert.deepEqual(f.changed,[['bgm',.23]]);assert.equal(f.on.bgm,false);assert.equal(f.get('liveAudioBgmValue').textContent,'23%');assert.equal(title.value,'23');assert.equal(out.textContent,'23%');
 f.levels.bgm=.41;title.dispatchEvent(f.event('input'));assert.equal(range.value,'41');assert.equal(f.get('liveAudioBgmValue').textContent,'41%');assert.equal(f.doc.activeElement,range);
});
test('mute buttons use game callbacks and preview respects OFF and zero volume',()=>{
 const f=fixture();f.api.open();f.get('audioMixerPreview').click();assert.equal(f.previews(),1);f.get('liveAudioSfxToggle').click();assert.equal(f.on.sfx,false);assert.equal(f.levels.sfx,.6);assert.equal(f.get('audioMixerPreview').disabled,true);f.get('audioMixerPreview').click();assert.equal(f.previews(),1);
 f.get('liveAudioSfxToggle').click();const range=f.get('liveAudioSfx');range.value='0';range.dispatchEvent(f.event('input'));assert.equal(f.get('audioMixerPreview').disabled,true);range.value='50';range.dispatchEvent(f.event('input'));f.get('audioMixerPreview').click();assert.equal(f.previews(),2);
});
test('native slider keys stay native and keyup reaches game; O and ESC close without pause or ending skip',()=>{
 const f=fixture();f.api.open();const slider=f.get('liveAudioBgm');let downstream=0;f.doc.addEventListener('keydown',()=>downstream++);f.doc.addEventListener('keyup',()=>downstream++);
 for(const key of ['ArrowLeft','ArrowRight','Home','End',' ','p','n','m','1']){const e=f.event('keydown',{key});slider.dispatchEvent(e);assert.equal(!!e.defaultPrevented,false);assert.equal(downstream,0);}
 slider.dispatchEvent(f.event('keyup',{key:'w'}));assert.equal(downstream,1);
 slider.dispatchEvent(f.event('keydown',{key:'o'}));assert.equal(f.get('audioMixerPanel').hidden,true);assert.equal(f.settings.state,'playing');f.settings.state='ending';f.api.open();const e=f.event('keydown',{key:'Escape',target:f.doc.body});assert.equal(f.api.handleKey(e),true);assert.equal(e.defaultPrevented,true);assert.equal(f.get('audioMixerPanel').hidden,true);assert.equal(f.settings.state,'ending');
});
test('O shortcut is repeat-safe and ignores nickname fields and modified browser shortcuts',()=>{
 const f=fixture(),input=f.make('nickname','input');input.type='text';const key=(extra={})=>f.event('keydown',{key:'o',target:f.doc.body,...extra});assert.equal(f.api.handleKey(key({target:input})),false);assert.equal(f.api.handleKey(key({ctrlKey:true})),false);assert.equal(f.api.handleKey(key()),true);assert.equal(f.get('audioMixerPanel').hidden,false);f.api.handleKey(key({repeat:true}));assert.equal(f.get('audioMixerPanel').hidden,false);f.api.handleKey(key());assert.equal(f.get('audioMixerPanel').hidden,true);
});
test('returning focus to the trigger permits movement and pause, while native activation never dashes',()=>{
 const f=fixture();f.button.focus();f.button.click();f.api.close();assert.equal(f.doc.activeElement,f.button);const reached=[];f.doc.addEventListener('keydown',e=>reached.push(e.key));
 for(const key of ['w','a','s','d','ArrowRight','Escape','p'])f.button.dispatchEvent(f.event('keydown',{key}));assert.deepEqual(reached,['w','a','s','d','ArrowRight','Escape','p']);
 for(const key of [' ','Enter','Tab']){const e=f.event('keydown',{key});f.button.dispatchEvent(e);assert.equal(!!e.defaultPrevented,false);}assert.equal(reached.length,7);
});
test('external hotkeys and state transitions update panel without stealing focus or resuming',()=>{
 const f=fixture({state:'paused'});f.api.open();f.get('liveAudioSfx').focus();f.on.bgm=false;f.observers[0].callback();assert.equal(f.get('liveAudioBgmToggle').textContent,'OFF');assert.equal(f.doc.activeElement,f.get('liveAudioSfx'));assert.equal(f.settings.state,'paused');assert.match(f.get('audioMixerState').textContent,/PAUSED/);
 for(const state of ['playing','levelup','bossbreak','dying','ending']){f.settings.state=state;f.api.sync();assert.equal(f.get('audioMixerQuick').hidden,false);assert.equal(f.settings.state,state);}
 f.settings.state='start';f.api.close({restoreFocus:false});f.api.sync();assert.equal(f.get('audioMixerQuick').hidden,true);assert.equal(f.get('audioMixerPanel').hidden,true);
});
test('a ranking modal mounted later closes the mixer and takes keyboard priority without focus theft',()=>{
 const f=fixture({state:'start'});f.button.focus();f.button.click();assert.equal(f.get('audioMixerPanel').hidden,false);
 const board=f.make('ruu-public-modal','div',f.frame);board.hidden=false;
 const mountObserver=f.observers[1];mountObserver.callback([{addedNodes:[board]}]);
 assert.equal(mountObserver.disconnected,true);assert.equal(f.get('audioMixerPanel').hidden,true);assert.equal(f.button.disabled,true);assert.notEqual(f.doc.activeElement,f.button);assert.equal(f.api.open(),false);
 board.hidden=true;const boardObserver=f.observers[2];boardObserver.callback([{target:board,attributeName:'hidden'}]);assert.equal(f.button.disabled,false);assert.equal(f.api.open(),true);
 boardObserver.callback([{target:f.get('audioMixerPanel'),attributeName:'hidden'}]);assert.equal(f.get('audioMixerPanel').hidden,false);
 f.api.destroy();assert.equal(boardObserver.disconnected,true);
});
test('missing audio stays safe and reinitialization removes listeners and duplicate panels',()=>{
 const f=fixture({available:false});assert.equal(f.button.disabled,true);assert.equal(f.get('audioMixerQuick').hidden,true);assert.equal(f.api.open(),false);f.api.destroy();assert.equal(f.api.handleKey(f.event('keydown',{key:'o'})),false);
 const g=fixture();g.api.init(g.config);assert.equal(g.frame.children.filter(x=>x.id==='audioMixerPanel').length,1);g.button.click();assert.equal(g.get('audioMixerPanel').hidden,false);assert.equal(g.observers[0].disconnected,true);
});
console.log(count+' live audio mixer suites passed');
