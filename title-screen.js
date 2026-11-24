/* RUU//OVERRUN v1.34.0 — KEY VISUAL / title UI only. */
(()=>{
'use strict';
const ART='assets/title-keyvisual.webp?v=1.34.0';
const version='v1.38.0';
const btn=(id,label,sub,extra='')=>`<button id="${id}" type="button" class="kv-button ${extra}"><span>${label}</span><small>${sub}</small></button>`;
const safeCount=(n,limit)=>Math.min(limit,Math.max(0,Math.floor(Number(n)||0)));
const score=n=>Number.isFinite(n)&&n>=0?Math.floor(n).toLocaleString('ja-JP'):'—';
function home({unlocked=1,best=null,normal=false,complete=false}={}){
 return `<section class="kv-home" aria-label="RUU//OVERRUN タイトル画面">
 <img class="kv-art" src="${ART}" alt="月光の下、弾幕を駆けるルー。RUU//OVERRUN" fetchpriority="high" draggable="false">
 <div class="kv-shade" aria-hidden="true"></div><div class="kv-edge" aria-hidden="true"></div>
 <h1 class="kv-sr">RUU//OVERRUN</h1>
 <div class="kv-edition"><i>///</i> ${version} <span>PUBLIC BETA</span></div>
 <div class="menu-copy kv-rail">
  <div class="kv-brand">JACKPOT<b>Ø</b>31 <span>/ ORIGINAL GAME</span></div>
  <div class="kv-signal"><i></i> SPECTRAL FORGE // RUU STYLE</div>
  <p class="kv-intro">押し寄せる侵食を生き抜き、<br>最後の脅威を撃ち砕け。</p>
  <button id="startBtn" class="kv-button kv-start" type="button"><span>▶ START GAME</span><small>NORMAL // DEPLOY　[ENTER]</small></button>
  <nav class="kv-nav" aria-label="メインメニュー">
   ${btn('ruuStyleBtn','RUU STYLE',`${safeCount(unlocked,9)||1} / 9　衣装`)}
   ${btn('achievementsBtn','ACHIEVEMENTS','実績・称号')}
   ${btn('enemyArchive','DEVORA FILES','敵・支援機図鑑')}
   ${btn('titleExtrasBtn','EXTRA MODES',normal?'追加モード':'クリア後解放')}
   ${btn('titleEndingBtn','ENDING THEATER',complete?'通常・完全クリアED':normal?'エンディング':'クリア後解放')}
   ${btn('titleSettingsBtn','SETTINGS','音楽・描画設定')}
   ${btn('titleGalleryBtn','VISUAL ARCHIVE','イラストギャラリー','kv-wide')}
  </nav>
  <div id="titleCommunity" class="kv-community"></div>
  <div class="kv-keyhint">WASD / ↑↓←→　MOVE　·　SPACE　DASH</div>
 </div>
 <div class="kv-record"><span>PERSONAL BEST</span><strong>${score(best)}</strong><small>NORMAL / SURVIVAL RECORD</small></div>
 <div class="kv-foot"><span>攻撃は自動。一定確率で『星屑の鎧 -Guardian Genome-』のキャラクターが参戦。</span><span>MUSIC &amp; VISUAL ART // JACKPOTØ31</span></div>
 </section>`;
}
const back='<button type="button" class="kv-button kv-back" id="titleBack"><span>← TITLE</span><small>タイトルに戻る</small></button>';
function panel(kicker,title,desc,body){return `<section class="kv-sub"><header><div><div class="kv-kicker">${kicker}</div><h2>${title}</h2><p>${desc}</p></div>${back}</header>${body}</section>`;}
function locked(label,desc){return `<div class="kv-locked"><strong>${label}</strong><small>◇ LOCKED / ${desc}</small></div>`;}
function extras(normal,endlessBest){return panel('MISSION SELECT','EXTRA MODES','通常クリアで追加モードを解放。',`<div class="kv-sub-grid">${normal?btn('challengeBtn','✦ CHALLENGE MISSIONS','特殊条件で挑戦'):locked('CHALLENGE MISSIONS','NORMALクリア')}${normal?btn('endlessBtn','∞ ENDLESS MODE','BEST '+score(endlessBest)):locked('ENDLESS MODE','NORMALクリア')}</div><p class="kv-detail">CHALLENGEの記録はローカル専用。ENDLESSは通常モードと別のランキングで集計。</p>`);}
function endings(normal,complete){return panel('EPILOGUE ARCHIVE','ENDING THEATER','エンディングテーマ：さすらえば / JACKPOTØ31',`<div class="kv-sub-grid">${normal?btn('endingTheater','♫ ENDING THEATER','通常エンディング'):locked('ENDING THEATER','NORMALクリア')}${complete?btn('completeEndingTheater','✦ COMPLETE ENDING','完全クリア記念エンディング'):locked('COMPLETE ENDING','完全クリア')}</div>`);}
function gallery(){return panel('ARTWORK COLLECTION','VISUAL ARCHIVE','ルーの公式ビジュアルとアートワーク。',`<div class="kv-gallery"><div class="hero-figure" id="heroArt"><div class="hero-hint">RUU // VISUAL ARCHIVE</div></div></div>`);}
const toggles=[['mute','BGM / 楽曲'],['sfxToggle','SFX / 効果音'],['animToggle','ANIMATION / 歩行'],['sceneToggle','SCENE / 背景'],['fxMode','VISUAL FX / 画質']];
const selects=[['trackSelect','SOUNDTRACK / 通常BGM'],['finisherSelect','SIGNATURE FINISHER / 必殺技']];
function settings(){return panel('SYSTEM CONFIGURATION','SETTINGS','実際のゲーム設定を変更。画面下のコントロールと共通です。',`<div class="kv-settings">${toggles.map(([id,label])=>`<div class="kv-setting"><span>${label}</span><button type="button" class="kv-button" data-kv-toggle="${id}">—</button></div>`).join('')}${selects.map(([id,label])=>`<label class="kv-setting"><span>${label}</span><select data-kv-select="${id}"></select></label>`).join('')}</div>${window.RUU_AUDIO?.settingsMarkup()||''}<p class="kv-detail">WASD / 矢印：移動　SPACE：ダッシュ　ESC：ポーズ　I：装備・支援効果　1–3：強化選択　O：音量パネル。スマホは左側ドラッグで移動。</p>`);}
let cleanup=()=>{};
function layout(frame,overlay,kind=''){
 cleanup();cleanup=()=>{};
 frame.classList.toggle('kv-title-active',kind==='home');frame.classList.toggle('kv-sub-active',kind==='sub');
 overlay.classList.toggle('kv-title-overlay',kind==='home');overlay.classList.toggle('kv-sub-overlay',kind==='sub');
}
function bindSettings(doc=document){
 const disposers=[],pairs=[];
 for(const proxy of doc.querySelectorAll('[data-kv-toggle]')){const actual=doc.getElementById(proxy.dataset.kvToggle);if(!actual)continue;
  const sync=()=>{proxy.textContent=actual.textContent;proxy.disabled=actual.disabled;};sync();proxy.onclick=()=>{actual.click();sync();};pairs.push([actual,sync]);
 }
 for(const proxy of doc.querySelectorAll('[data-kv-select]')){const actual=doc.getElementById(proxy.dataset.kvSelect);if(!actual)continue;
  proxy.innerHTML=actual.innerHTML;proxy.value=actual.value;const sync=()=>{proxy.value=actual.value;};proxy.onchange=()=>{actual.value=proxy.value;actual.dispatchEvent(new Event('change',{bubbles:true}));sync();};
  actual.addEventListener('change',sync);disposers.push(()=>actual.removeEventListener('change',sync));
 }
 if(typeof MutationObserver!=='undefined'&&pairs.length){const ob=new MutationObserver(()=>pairs.forEach(([,sync])=>sync()));pairs.forEach(([el])=>ob.observe(el,{childList:true,characterData:true,subtree:true,attributes:true,attributeFilter:['disabled']}));disposers.push(()=>ob.disconnect());}
 cleanup=()=>disposers.forEach(fn=>fn());
}
window.RUU_TITLE_SCREEN={home,extras,endings,gallery,settings,layout,bindSettings};
})();
