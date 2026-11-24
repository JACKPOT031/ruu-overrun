/* RUU//OVERRUN v1.33.0 — BEYOND THE END
 * Cosmetic-only collection, wardrobe and discovery archive. No combat RNG,
 * damage, XP, score, spawn, ranking, or existing achievement changes.
 */
(()=>{
'use strict';
const KEY='RUU_COLLECTION_V1',MAX=999999999;
const tiers=[
 {name:'COMMON',color:'#a9b8c9',shards:1,cost:3},
 {name:'UNCOMMON',color:'#85e4bd',shards:2,cost:6},
 {name:'RARE',color:'#84baff',shards:4,cost:12},
 {name:'LEGENDARY',color:'#ffd38d',shards:8,cost:24},
 {name:'MYTHIC',color:'#e0a1ff',shards:16,cost:0}
];
const rows=[
 ['dust','星屑の欠片','小さな光は、まだ消えていない。','M12 2 21 12 12 22 3 12Z'],
 ['rust','赤錆の歯車','かつて何かを動かしていた、止まった歯車。','M10 2H14L15 6 19 5 22 10 19 13 21 17 17 21 13 19 10 22 5 20 5 15 2 12 4 7 8 7Z M12 8A4 4 0 1 0 12 16A4 4 0 1 0 12 8Z'],
 ['glass','侵食ガラス','向こう側の景色だけが、少し違って見える。','M4 4 21 6 17 21 3 17Z M4 4 11 12 21 6 M11 12 17 21 M11 12 3 17'],
 ['signal','残留信号','受信者のいない通信が、今も途切れず続く。','M2 12H6L9 5 13 19 16 9 18 12H22'],
 ['halo','監視体の環','壊れても監視を続ける、無音の輪。','M12 3A9 9 0 1 0 12 21A9 9 0 1 0 12 3Z M12 7A5 5 0 1 0 12 17A5 5 0 1 0 12 7Z M12 1V5 M12 19V23'],
 ['husk','装甲残片','何度も攻撃を受け止めた証。','M4 4 12 2 20 4 19 15 12 22 5 15Z M12 2V22 M4 4 12 8 20 4'],
 ['coil','共鳴コイル','かすかな音圧に反応して震える導体。','M3 17Q-1 8 7 7T14 15T21 6 M3 21Q-1 12 7 11T14 19T21 10'],
 ['lens','紫呪の瞳','見つめ返すと、時間の流れがずれる。','M1 12Q12 1 23 12Q12 23 1 12Z M12 7A5 5 0 1 0 12 17A5 5 0 1 0 12 7Z'],
 ['crown','王の破片','侵食の王から剥がれた黒い王冠。','M2 5 7 11 12 3 17 11 22 5 19 19H5Z M5 15H19'],
 ['prism','境界の結晶','二つの世界の光を一つに閉じ込めた結晶。','M12 1 21 7 19 19 12 23 5 19 3 7Z M12 1V23 M3 7 12 12 21 7 M5 19 12 12 19 19'],
 ['pulse','零式の残響','最初の一撃が、遠い未来まで残響する。','M3 12A9 9 0 1 0 12 3 M3 21 21 3 M9 12H15 M12 9V15'],
 ['wings','侵食翼の翅脈','薄い羽のような繊維が、光をほどいていく。','M12 13Q2 0 1 5Q0 17 12 19Q24 17 23 5Q22 0 12 13 M12 13V23 M4 5 12 16 20 5'],
 ['null','虚無の皇印','終わりを告げたはずの印章。','M12 2 21 7 21 17 12 22 3 17 3 7Z M8 8 16 16 M16 8 8 16'],
 ['heart','真核の鼓動','壊れた核の内部で、微かな脈動が続く。','M12 22 3 13Q-2 4 6 3Q10 2 12 7Q14 2 18 3Q26 4 21 13Z M5 12H9L11 8 14 16 16 12H20'],
 ['oracle','予見の断片','まだ訪れていない瞬間を映す記録媒体。','M12 1 21 12 12 23 3 12Z M6 12 12 6 18 12 12 18Z M12 9V15'],
 ['siege','包囲陣の欠環','閉じかけた円に、ひとつだけ出口が残る。','M10 2A10 10 0 1 0 22 12 M14 2 22 2 22 10 M12 5A7 7 0 1 0 19 12'],
 ['quintet','五重の終末','五つの侵食核が同時に沈黙した記録。','M12 1 15 9 23 9 17 14 19 22 12 17 5 22 7 14 1 9 9 9Z'],
 ['eclipse','月蝕の残光','月の影から、もう一つの光がこぼれ落ちる。','M18 2A10 10 0 1 0 22 17A9 9 0 0 1 18 2Z M15 7 17 11 21 13 17 15 15 19 13 15 9 13 13 11Z'],
 ['astraea','星屑の鎧・断章','白銀の翼に刻まれた、戦闘の記憶。','M12 2 15 10 23 3 19 15 14 17 12 23 10 17 5 15 1 3 9 10Z'],
 ['terminus','終焉の証','すべての脅威を越えた者だけが持つ最後の記録。','M12 1 15 5 21 5 23 12 21 19 15 19 12 23 9 19 3 19 1 12 3 5 9 5Z M7 12 10 15 17 8']
];
const relics=rows.map((r,i)=>({id:r[0],name:r[1],desc:r[2],path:r[3],tier:Math.floor(i/4),secret:i>=16}));
const relicById=new Map(relics.map(r=>[r.id,r]));
const catalog=new Map();
const groups=[['enemy','敵・ボス'],['weapon','武器'],['evolution','進化・複合技'],['finisher','必殺技'],['jackpot','JACKPOT'],['support','支援']];
const enemyRows=[
 ['wisp','MITE SWARM','群体侵食虫','enemy_wisp.webp'],['runner','RUST HOUND','赤錆の猟犬','enemy_runner.webp'],
 ['brute','OSSUARY GOLEM','骨鋼装甲兵','enemy_brute.webp'],['caster','HALO SENTINEL','円環監視体','enemy_caster.webp'],
 ['hex','HEX CHOIR','紫呪唱体','enemy_hex.webp'],['elite','GILT EXECUTIONER','黒金の処刑機','enemy_elite.webp'],
 ['boss','DEVORA','侵食の王','enemy_boss.webp'],['final','NULL EMPEROR','虚無の皇帝','enemy_final.webp'],
 ...['HUNTER','ORACLE','SIEGE','FRACTURE','REAPER'].map(role=>['true-'+role.toLowerCase(),'TRUE DEVORA / '+role,'真の侵食核','enemy_boss.webp',true]),
 ...['HUNTER','ORACLE','SIEGE'].map(role=>['reinforce-'+role.toLowerCase(),'DEVORA / '+role,'裏ボス戦の増援','enemy_boss.webp',true]),
 ['eclipse','RUU : ECLIPSE','隠された脅威','secret_ruu.webp',true],
 ['hostile-astraea','ASTRAEA // HOSTILE','敵機','astraea-companion.svg',true],
 ['screen-brute','SCREEN / BRUTE','防衛増援','enemy_brute.webp',true],['screen-runner','SCREEN / RUNNER','防衛増援','enemy_runner.webp',true],
 ['mutation-frenzy','FRENZY','変異：突進',''],['mutation-volatile','OVERLOAD','変異：自爆',''],
 ['mutation-fracture','FRACTURE','変異：分裂',''],['mutation-bulwark','BULWARK','変異：装甲','']
];
const evolutions=[
 ['evolve','Ø / 零環覚醒'],['evoGravity','星界崩壊'],['evoPrism','氷光万華鏡'],
 ['evoSat','天穹崩撃'],['evoRift','虚空裂華'],['evoBloom','星爆大祭']
];
const key=(group,id)=>group+'/'+id;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const bounded=v=>Number.isFinite(Number(v))?Math.max(0,Math.min(MAX,Math.floor(Number(v)))):0;
const map=()=>Object.create(null);
const empty=()=>({version:1,relics:map(),archive:map(),kills:map(),shards:0,style:'normal'});
function cleanMap(raw,max){
 const out=map();
 if(raw&&typeof raw==='object'&&!Array.isArray(raw))for(const [k,v] of Object.entries(raw).slice(0,250)){
  if(/^[a-zA-Z0-9_/-]{1,60}$/.test(k)&&!['__proto__','constructor','prototype'].includes(k)){
   const n=Math.min(max,bounded(v));if(n>0)out[k]=n;
  }
 }
 return out;
}
let data=empty(),storageError=false,dirty=false;
function load(){
 if(window.RUU_LOCAL_DEV_MODE)return;
 try{
  const raw=JSON.parse(localStorage.getItem(KEY)||'null');
  if(raw&&typeof raw==='object'&&raw.version===1){
   data.relics=cleanMap(raw.relics,MAX);data.archive=cleanMap(raw.archive,3);data.kills=cleanMap(raw.kills,MAX);
   data.shards=bounded(raw.shards);data.style=raw.style==='eclipse'?'eclipse':'normal';
  }
 }catch(e){storageError=true}
}
load();
function flush(){
 if(window.RUU_LOCAL_DEV_MODE||!dirty)return;
 try{localStorage.setItem(KEY,JSON.stringify(data));dirty=false;storageError=false}catch(e){storageError=true}
}
if(typeof window.addEventListener==='function')window.addEventListener('pagehide',flush);
function add(group,id,name,desc='',art='',secret=false){
 if(!id||!name)return;
 catalog.set(key(group,id),{group,id,name,desc,art,secret});
}
function register(config={}){
 for(const [id,name,desc,art,secret] of enemyRows)add('enemy',id,name,desc,art?'assets/'+art:'',!!secret);
 for(const w of config.weapons||[])if(w.type==='WEAPON')add('weapon',w.id,w.name,w.desc);
 for(const [id,name] of evolutions)add('evolution',id,name,'武器の進化を獲得');
 for(const f of config.fusions||[])add('evolution',f.id,f.name,f.desc);
 for(const f of config.finishers||[])add('finisher',f.id,f.name,f.jp,f.image);
 for(const j of config.jackpots||[])add('jackpot',j.key,j.label,j.title,j.asset);
 for(const p of config.pilots||[])add('support',p.id,p.jp,p.desc);
 add('support','astraea','ASTRAEA','緊急支援参戦');
 // Only migrate facts that the previous achievement actually proves.
 // Old aggregate achievements cannot identify a specific pilot, weapon,
 // true-core role, finisher or JACKPOT variant.
 if(!window.RUU_LOCAL_DEV_MODE){
  for(const k of Object.keys(data.archive))if(!catalog.has(k))delete data.archive[k];
  for(const k of Object.keys(data.kills))if(!catalog.has(k)||!k.startsWith('enemy/'))delete data.kills[k];
  for(const k of Object.keys(data.relics))if(!relicById.has(k))delete data.relics[k];
  for(const [a,id,bits] of [['boss','boss',3],['final','final',3],['eclipse_found','eclipse',1],['eclipse_clear','eclipse',3]]){
   if(achievement(a)){const k=key('enemy',id);const before=data.archive[k]||0;data.archive[k]=before|bits;if(before!==data.archive[k])dirty=true}
  }
  flush();
 }
}
function achievement(id){
 if(window.RUU_LOCAL_DEV_MODE)return false;
 try{return !!window.RUU_EXPANSION?.status?.().some(a=>a.id===id&&a.unlocked)}catch(e){return false}
}
function allowed(g){return !!g?.collectionRun&&!window.RUU_LOCAL_DEV_MODE}
function record(g,group,id,killed=false){
 if(!allowed(g))return false;
 const k=key(group,id);if(!catalog.has(k))return false;
 const old=data.archive[k]||0,now=old|(killed?3:1);
 if(killed){data.kills[k]=Math.min(MAX,(data.kills[k]||0)+1);dirty=true}
 if(old===now)return false;
 data.archive[k]=now;dirty=true;
 if(!old)g.collectionRun.discoveries++;
 // Save first discoveries; repetitive kill counts are batched.
 flush();return true;
}
function enemyId(e){
 const role=String(e.trueBossRole||e.trueBrain?.role||'').toLowerCase();
 if(e.secretScreen)return 'screen-'+e.kind;
 if(e.enemyAstraea)return 'hostile-astraea';
 if(e.secretRuu)return 'eclipse';
 if(e.secretReinforcement)return 'reinforce-'+role;
 if(e.trueDevora)return 'true-'+role;
 return e.elite?'elite':e.kind;
}
function observe(g,e,p){
 if(!allowed(g)||!e||e.hp<=0||e.collectionObserved)return;
 if(Math.abs(e.x-p.x)>600+(e.r||0)||Math.abs(e.y-p.y)>337.5+(e.r||0))return;
 e.collectionObserved=true;record(g,'enemy',enemyId(e));
 if(e.mutation?.type)record(g,'enemy','mutation-'+e.mutation.type);
}
function begin(g){
 if(!g||window.RUU_LOCAL_DEV_MODE)return;
 clearNotice();
 g.collectionRun={newRelics:[],duplicateCount:0,shards:0,discoveries:0,loot:0,quintet:false,complete:false,flushAt:0};
 g.collectionStyle=selectedStyle();
 record(g,'weapon','pulse');
}
let seed=(Date.now()>>>0)||0xBEEF0031;
function random(){
 // An independent stream: a collection roll never changes the next gameplay roll.
 try{
  if(typeof crypto!=='undefined'&&crypto.getRandomValues){
   const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]/4294967296;
  }
 }catch(e){}
 seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296;
}
function indices(first,last,weight){return relics.slice(first,last+1).map(r=>[r.id,weight])}
const pools={
 chest:[.40,[...indices(0,3,4),...indices(4,7,1)]],
 elite:[.18,[...indices(0,3,1),...indices(4,7,3)]],
 boss:[.45,[...indices(4,7,3),...indices(8,11,1)]],
 final:[.55,[...indices(8,11,3),...indices(12,15,1)]],
 core:[.35,[...indices(8,11,2),...indices(12,15,1)]],
 secretcore:[.45,[...indices(8,11,1),...indices(12,15,2)]],
 eclipse:[.45,[...indices(12,15,2),['eclipse',1]]],
 astraea:[.55,[...indices(12,15,2),['astraea',1]]]
};
function grant(g,id){
 if(!allowed(g))return null;const r=relicById.get(id);if(!r)return null;
 const run=g.collectionRun,t=tiers[r.tier],old=data.relics[id]||0;
 data.relics[id]=Math.min(MAX,old+1);run.loot++;
 if(old){data.shards=Math.min(MAX,data.shards+t.shards);run.duplicateCount++;run.shards+=t.shards}
 else run.newRelics.push(id);
 dirty=true;flush();
 if(typeof document!=='undefined'){
  const frame=document.getElementById('frame');
  if(frame){
   let note=document.getElementById('ruuCollectionNotice');
   if(!note){note=document.createElement('div');note.id='ruuCollectionNotice';note.className='ruu-collect-notice';note.setAttribute('role','status');frame.appendChild(note)}
   note.textContent=old?'RELIC DUPLICATE // SHARDS +'+t.shards:'NEW COLLECTION // '+r.name;
   note.style.color=t.color;note.hidden=false;g.collectionRun.noticeUntil=(g.time||0)+2.6;
  }
 }
 return {id,duplicate:!!old};
}
function roll(g,source,rng=random){
 if(!allowed(g)||!pools[source])return null;
 const [chance,choices]=pools[source];if(!(rng()<chance))return null;
 const total=choices.reduce((s,x)=>s+x[1],0);let v=Math.max(0,Math.min(.999999999,rng()))*total;
 for(const [id,w] of choices){v-=w;if(v<0)return grant(g,id)}
 return grant(g,choices[choices.length-1][0]);
}
function onChest(g,ch,rng=random){
 if(!allowed(g)||!ch||ch.collectionCounted)return;
 ch.collectionCounted=true;roll(g,'chest',rng);
}
function onKill(g,e,rng=random){
 if(!allowed(g)||!e||e.hp>0||e.collectionCounted||e.secretScreenCleaned)return;
 e.collectionCounted=true;record(g,'enemy',enemyId(e),true);
 if(e.mutation?.type)record(g,'enemy','mutation-'+e.mutation.type,true);
 const source=e.secretScreen?null:e.enemyAstraea?'astraea':e.secretRuu?'eclipse':e.secretReinforcement?'secretcore':e.trueDevora?'core':e.kind==='boss'?'boss':e.kind==='final'?'final':e.elite?'elite':null;
 if(source)roll(g,source,rng);
 const run=g.collectionRun;
 if(e.trueDevora&&!e.secretReinforcement&&g.trueEndCleared&&g.trueEndCount===5&&!run.quintet){
  run.quintet=true;grant(g,'quintet');
 }
 if(g.secretBossCleared&&!run.complete){run.complete=true;grant(g,'terminus')}
}
function onUpgrade(g,u){
 if(!allowed(g)||!u)return;
 if(u.type==='WEAPON'&&g.player?.mods?.[u.id]>0)record(g,'weapon',u.id);
 if(u.type==='FUSION'&&g.fusions?.[u.id])record(g,'evolution',u.id);
 const flags={evolve:'evolved',evoGravity:'evoGravity',evoPrism:'evoPrism',evoSat:'evoSat',evoRift:'evoRift',evoBloom:'evoBloom'};
 if(u.type==='EVOLUTION'&&g[flags[u.id]])record(g,'evolution',u.id);
}
function tick(g){
 if(!allowed(g))return;
 const run=g.collectionRun;
 if(g.time>=run.flushAt){run.flushAt=g.time+5;flush()}
 if(run.noticeUntil&&g.time>=run.noticeUntil){
  run.noticeUntil=0;if(typeof document!=='undefined'){const n=document.getElementById('ruuCollectionNotice');if(n)n.hidden=true}
 }
}
function finish(g){
 if(!allowed(g))return;
 flush();
 if(typeof document!=='undefined'){const n=document.getElementById('ruuCollectionNotice');if(n)n.hidden=true}
}
function clearNotice(){if(typeof document!=='undefined'){const n=document.getElementById('ruuCollectionNotice');if(n)n.hidden=true}}
function unlockedStyle(id){return id==='normal'||(id==='eclipse'&&achievement('eclipse_clear'))}
function selectedStyle(){return unlockedStyle(data.style)?data.style:'normal'}
function selectStyle(id){if(window.RUU_LOCAL_DEV_MODE||!unlockedStyle(id))return false;data.style=id;dirty=true;flush();return true}
function exchange(id){
 const r=relicById.get(id),cost=r?tiers[r.tier].cost:0;
 if(window.RUU_LOCAL_DEV_MODE||!r||!cost||data.relics[id]||data.shards<cost)return false;
 data.shards-=cost;data.relics[id]=1;dirty=true;flush();return true;
}
// Existing approved stage-outfit art, same logical drawing size as normal Ruu.
// The atlas has idle/walk/run/attack rows, not independent front/back rows.
function drawStyle(ctx,g,dir,moving,phase,height,anim){
 if(g?.collectionStyle!=='eclipse')return false;
 const atlas=window.RUU_SECRET_BOSS?.ATLAS,art=window.RUU_SECRET_BOSS?.ART;
 const ready=im=>im?.complete&&im.naturalWidth>0&&im.naturalHeight>0;
 ctx.save();
 // Existing player caller mirrors the right-facing side pose. The boss atlas
 // faces right natively, so flip once here for the correct net direction.
 if(dir==='left'||dir==='right')ctx.scale(-1,1);
 if(ready(atlas)&&atlas.naturalWidth>=1280&&atlas.naturalHeight>=1280){
  const row=!anim||!moving?0:g.player?.dashRemain>0?2:1;
  const col=anim?((Math.floor(phase||0)%4)+4)%4:0;
  ctx.drawImage(atlas,col*320,row*320,320,320,-height/2,-height+40,height,height);
 }else if(ready(art)){
  const width=art.naturalWidth*height/art.naturalHeight;
  ctx.drawImage(art,-width/2,-height+40,width,height);
 }else{ctx.restore();return false}
 ctx.restore();return true;
}
function counts(group){
 const list=[...catalog.values()].filter(x=>!group||x.group===group);
 return {found:list.filter(x=>data.archive[key(x.group,x.id)]&1).length,total:list.length};
}
function ownedCount(){return relics.filter(r=>data.relics[r.id]>0).length}
function meter(found,total){return '<div class="ruu-collect-meter"><span style="width:'+(total?100*found/total:0).toFixed(2)+'%"></span></div>'}
function icon(r,locked=false){
 const color=locked?'#586278':tiers[r.tier].color;
 return '<svg class="ruu-collect-icon" viewBox="-3 -3 30 30" aria-hidden="true"><circle cx="12" cy="12" r="14" fill="'+color+'" opacity=".08"/><path d="'+(locked?'M8 8Q8 3 12 3Q18 3 17 9L12 14 M12 19V21':r.path)+'" fill="none" stroke="'+color+'" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}
function relicHint(r){
 if(r.tier===0)return 'レリック回収・エリート撃破';
 if(r.tier===1)return 'レリック回収・エリート／中ボス撃破';
 if(r.tier===2)return '中ボス以降の主要戦';
 if(r.tier===3)return '最終ボス以降の主要戦';
 return '特殊な戦闘で獲得';
}
function renderRelics(filter){
 const list=relics.filter(r=>filter==='all'||filter===String(r.tier));
 const tabs=[['all','ALL'],...tiers.map((t,i)=>[String(i),t.name])].map(([id,name])=>'<button type="button" data-rc-filter="'+id+'" aria-pressed="'+(filter===id)+'">'+name+'</button>').join('');
 return '<div class="ruu-collect-summary"><b>'+ownedCount()+' / '+relics.length+' COLLECTION</b>'+meter(ownedCount(),relics.length)+'<strong>SHARDS '+data.shards+'</strong></div><p class="ruu-collect-note">戦闘中の既存レリックとは別の記念収集品。効果やスコア補正なし。重複分は交換用SHARDSへ自動変換。</p><div class="ruu-collect-tabs">'+tabs+'</div><div class="ruu-collect-grid">'+list.map(r=>{
  const owned=!!data.relics[r.id],locked=r.secret&&!owned,t=tiers[r.tier],cost=t.cost;
  return '<article class="ruu-collect-item" style="--relic-color:'+t.color+'">'+icon(r,locked)+'<div class="ruu-collect-body"><small>'+t.name+'</small><b>'+esc(locked?'??? / CLASSIFIED':r.name)+'</b><p>'+esc(owned?r.desc:relicHint(r))+'</p><span>'+ (owned?'獲得済み / 累計 '+data.relics[r.id]:'未収集')+'</span>'+
   (!owned&&cost?'<button type="button" data-rc-exchange="'+r.id+'" '+(data.shards<cost?'disabled':'')+'>交換 '+cost+' SHARDS</button>':'')+'</div></article>';
 }).join('')+'</div><details class="ruu-collect-note"><summary>入手確率・交換について</summary>回収40%／エリート18%／中ボス45%／最終ボス55%で収集品抽選。さらに先の戦闘では種類別に35〜55%の抽選。MYTHICは特殊戦闘のみ（特定条件の達成品は確定）。重複時COMMONから順に1／2／4／8／16 SHARDS。MYTHICは交換不可。</details>';
}
function renderStyle(){
 const active=selectedStyle(),eclipse=unlockedStyle('eclipse');
 return '<p class="ruu-collect-note">見た目だけを変更。攻撃力、移動、HP、当たり判定、ランキングは同一。必殺技カットインは各技の既存イラストを使用。</p><div class="ruu-style-grid">'+[
  {id:'normal',name:'ORIGINAL RUU',desc:'通常衣装 / 初期解放',src:'assets/ruu_front.webp',open:true},
  {id:'eclipse',name:eclipse?'ECLIPSE STYLE':'??? / CLASSIFIED',desc:eclipse?'黒ステージ衣装 / 完全クリア特典':'特別なクリア実績で解放',src:eclipse?'assets/secret_ruu.webp':'',open:eclipse}
 ].map(s=>'<article class="ruu-style-card">'+(s.src?'<img src="'+s.src+'" alt="'+esc(s.name)+'">':'<div class="ruu-style-locked">?</div>')+'<b>'+esc(s.name)+'</b><p>'+esc(s.desc)+'</p><button type="button" data-rc-style="'+s.id+'" '+(!s.open||active===s.id?'disabled':'')+'>'+ (active===s.id?'装備中':s.open?'装備する':'LOCKED')+'</button></article>').join('')+'</div><p class="ruu-collect-note">黒衣装は既存の待機・歩行・走行アニメを使用。衣装は次回開始時から適用。</p>';
}
function renderArchive(filter){
 const all=counts(),group=groups.some(g=>g[0]===filter)?filter:'enemy',c=counts(group);
 const tabs=groups.map(([id,title])=>{const n=counts(id);return '<button type="button" data-rc-filter="'+id+'" aria-pressed="'+(group===id)+'">'+title+' '+n.found+'/'+n.total+'</button>'}).join('');
 return '<div class="ruu-collect-summary"><b>'+all.found+' / '+all.total+' DISCOVERED</b>'+meter(all.found,all.total)+'<strong>'+ (all.total?Math.floor(all.found/all.total*100):0)+'%</strong></div><p class="ruu-collect-note">実際に遭遇・撃破・取得・発動・参戦した記録を登録。未発見の項目は伏せて表示。旧実績で確実に分かる事実だけ引き継ぎます。</p><div class="ruu-collect-tabs">'+tabs+'</div><div class="ruu-collect-note">'+c.found+' / '+c.total+' · '+esc(groups.find(x=>x[0]===group)[1])+'</div><div class="ruu-collect-grid">'+[...catalog.values()].filter(x=>x.group===group).map(x=>{
  const k=key(x.group,x.id),bits=data.archive[k]||0,seen=!!(bits&1),defeated=!!(bits&2);
  return '<article class="ruu-collect-item" style="--relic-color:'+(seen?'#a8dce3':'#596477')+'">'+(seen&&x.art?'<img class="ruu-archive-art" loading="lazy" src="'+esc(x.art)+'" alt="">':'<div class="ruu-archive-symbol">'+(seen?'✦':'?')+'</div>')+'<div class="ruu-collect-body"><small>'+(!seen?'CLASSIFIED':group==='enemy'?(defeated?'DEFEATED':'ENCOUNTERED'):'DISCOVERED')+'</small><b>'+esc(seen?x.name:'???')+'</b><p>'+esc(seen?x.desc:'未発見')+'</p>'+(seen&&group==='enemy'?'<span>'+(defeated?(data.kills[k]?'撃破 '+data.kills[k]+' 体（新規記録）':'撃破確認済（旧実績）'):'遭遇済 / 未撃破')+'</span>':'')+'</div></article>';
 }).join('')+'</div>';
}
function render(root,view='relics',filter='',back=()=>{}){
 if(!root)return;
 const tabs=[['relics','RELIC COLLECTION'],['style','RUU STYLE'],['archive','COMPLETE ARCHIVE']];
 if(!tabs.some(x=>x[0]===view))view='relics';
 filter=view==='relics'?(['all','0','1','2','3','4'].includes(filter)?filter:'all'):view==='archive'?(groups.some(x=>x[0]===filter)?filter:'enemy'):'';
 root.innerHTML='<section class="ruu-collect-panel"><div class="eyebrow">BEYOND THE END / RUU//OVERRUN</div><h2>COLLECTION ARCHIVE</h2><nav class="ruu-collect-tabs">'+tabs.map(([id,name])=>'<button type="button" data-rc-view="'+id+'" aria-pressed="'+(view===id)+'">'+name+'</button>').join('')+'</nav>'+(storageError?'<p class="ruu-collect-note">ブラウザ保存を確認できません。記録が保持されない場合があります。</p>':'')+
  (view==='relics'?renderRelics(filter):view==='style'?renderStyle():renderArchive(filter))+
  '<button type="button" class="primary ruu-collect-back" data-rc-back>← BACK TO TITLE</button><p class="ruu-collect-note">収集記録はこのブラウザ内に保存されます。</p></section>';
 for(const b of root.querySelectorAll('[data-rc-view]'))b.onclick=()=>render(root,b.dataset.rcView,'',back);
 for(const b of root.querySelectorAll('[data-rc-filter]'))b.onclick=()=>render(root,view,b.dataset.rcFilter,back);
 for(const b of root.querySelectorAll('[data-rc-exchange]'))b.onclick=()=>{exchange(b.dataset.rcExchange);render(root,view,filter,back)};
 for(const b of root.querySelectorAll('[data-rc-style]'))b.onclick=()=>{selectStyle(b.dataset.rcStyle);render(root,view,filter,back)};
 root.querySelector('[data-rc-back]').onclick=back;
}
function runHTML(g){
 if(!allowed(g))return '';
 const r=g.collectionRun;
 return '<div class="ruu-collect-result"><b>COLLECTION REPORT</b>　新規レリック '+r.newRelics.length+'　重複 '+r.duplicateCount+'　SHARDS +'+r.shards+'　新規図鑑 '+r.discoveries+
  (r.newRelics.length?'<div>'+r.newRelics.map(id=>esc(relicById.get(id)?.name)).join(' / ')+'</div>':'')+'</div>';
}
window.RUU_COLLECTION={VERSION:'1.33.0',register,begin,record,observe,onKill,onChest,onUpgrade,tick,finish,clearNotice,drawStyle,render,runHTML,
 selectedStyle,selectStyle,unlockedStyle,exchange,counts,ownedCount,
 snapshot:()=>JSON.parse(JSON.stringify(data))};
})();
