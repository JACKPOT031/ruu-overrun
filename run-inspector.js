/* RUU//OVERRUN v1.25.0 — LIVE EQUIPMENT & ALLIED SUPPORT INSPECTOR. READ ONLY. */
(function initRunInspector(){
'use strict';
const E=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const num=x=>Number.isFinite(Number(x))?Number(x):0;
const EVOLUTIONS=[
 {flag:'evolved',name:'Ø / 零環覚醒',desc:'零式ネオン・バラージとヘル・ハローの進化。追尾主砲が覚醒。',mark:'Ø'},
 {flag:'evoGravity',name:'星界崩壊',desc:'墜星雨と零界重力渦の進化。隕石爆発の範囲・威力を強化。',mark:'◉'},
 {flag:'evoPrism',name:'氷光万華鏡',desc:'虹彩光槍と氷晶散華の進化。光槍が強化され敵を氷結。',mark:'✳'},
 {flag:'evoSat',name:'天穹崩撃',desc:'天蓋衛星砲とレールブレイカーの進化。砲撃火力と本数を増幅。',mark:'☼'},
 {flag:'evoRift',name:'虚空裂華',desc:'裂界スラッシャーと虹彩光槍の進化。斬撃数と光刃が増加。',mark:'╳'},
 {flag:'evoBloom',name:'星爆大祭',desc:'超新星ファイアワークスと音圧ディストーションの進化。爆発範囲と威力を増幅。',mark:'✺'}
];
const PILOT_EFFECTS={
 elio:[['防御シールド','約10.3秒ごとにSHIELD +8。シールド上限は最低18まで拡張。'],['敵弾迎撃','通常より短い約5.5秒間隔で近くの敵弾を1発迎撃。']],
 oz:[['処刑標識','約6.6秒ごとに強敵を優先マーキング。4.5秒間、その標的へのダメージが約11%増加。'],['精密射撃','マーキング時に対象へ追加狙撃。']],
 kai:[['高速連射','通常の随伴射撃が約0.92秒間隔。1射撃につき小型弾を2発発射。'],['クロスファイア','約7.1秒ごとに周囲の最大3体へ追撃。']],
 sera:[['支援フィールド','約8.3秒ごとに周囲の敵を一時減速。'],['ゲージ補給','フィールド発動時にDRIVE +4／FINISHER +3。']],
 mina:[['経験値回収','合流後の取得XPを約12%増幅。さらに回収範囲 +24。'],['スキャン支援','約8.4秒ごとに敵を解析して減速し、近くのXP結晶を引き寄せる。'],['侵攻報酬','DEVORA INVASION撃退時の追加スコア +12%。']]
};
const ICON={pulse:'✦',orbit:'◈',nova:'◎',lightning:'ϟ',meteor:'☄',rail:'━',frost:'❄',well:'◉',missile:'➠',sonic:'◎',prism:'✳',shard:'◆',satellite:'☼',rift:'╳',fireworks:'✺',cross:'✚',echo:'❖',crit:'✧',damage:'⚔',haste:'⌛',speed:'➤',magnet:'◆',vital:'♥',shield:'⬡'};
function item({name,desc,mark='◆',level=0,max=0,type='WEAPON'}){
 const levelText=max?`LV ${Math.floor(level)} / ${Math.floor(max)}`:'ACTIVE';
 const pct=max?Math.round(clamp(level/max,0,1)*100):100;
 return `<article class="loadout-item" data-type="${E(type)}"><div class="loadout-item-top"><span class="loadout-item-mark" aria-hidden="true">${E(mark)}</span><strong>${E(name)}</strong><span class="loadout-item-level">${E(levelText)}</span></div><p>${E(desc)}</p>${max?`<div class="loadout-level-track" aria-hidden="true"><span style="width:${pct}%"></span></div>`:''}</article>`;
}
function group(heading,items){
 if(!items.length)return '';
 return `<section class="loadout-group"><div class="loadout-group-heading"><h3>${E(heading)}</h3><span>${items.length} EQUIPPED</span></div><div class="loadout-items">${items.join('')}</div></section>`;
}
function stat(k,v){return `<span class="loadout-stat"><small>${E(k)}</small><b>${E(v)}</b></span>`}
function support(g){
 const pil=window.RUU_PILOTS?.status?.()||null;
 const current=window.RUU_PILOTS?.active?.()||null;
 const help=window.RUU_COMPANION?.status?.(g)||null;
 if(!pil){
  return `<section class="loadout-support loadout-support-empty"><div class="loadout-support-heading">✧ GUARDIAN LINK</div><h3>NO ALLIED SIGNAL</h3><p>このプレイでは量産型ASTRAL-SUITは参戦していない。</p><p>各プレイ開始時に25%の確率で、5人のパイロットから1人が選ばれる。</p><div class="loadout-support-foot">25% SUPPORT LOTTERY / NOT SELECTED</div></section>`;
 }
 const effects=(PILOT_EFFECTS[pil.id]||[]).map(([t,d])=>`<div class="loadout-support-effect"><b>${E(t)}</b><span>${E(d)}</span></div>`).join('');
 const rate=num(current?.rate),arr=!!pil.arrived;
 const astraeaText=help?.active>0?'ASTRAEA 出撃中 / 残り '+num(help.active).toFixed(1)+'秒':help?.queued?'ASTRAEA 緊急出撃を待機中':help?.used?'ASTRAEA 出撃済み（1プレイ1回）':'ASTRAEA 未出撃';
 return `<section class="loadout-support">
   <div class="loadout-support-heading">✧ MASS-PRODUCED ASTRAL-SUIT <span>${arr?'ACTIVE':'INBOUND'}</span></div>
   <div class="loadout-pilot"><div class="loadout-pilot-avatar">18</div><div><div class="loadout-pilot-jp">${E(pil.jp||'')}</div><h3>${E(pil.name)}</h3><p>${E(pil.role||'')} / ${arr?'戦闘参加中':'戦闘エリアへ移動中'}</p></div></div>
   <div class="loadout-support-effect"><b>量産型の基本支援</b><span>随伴射撃${rate?'（基本間隔 約'+rate.toFixed(2)+'秒）':''}と近距離の敵弾迎撃。パイロットごとに射撃・迎撃間隔と固有能力が変化する。</span></div>
   ${effects}
   <div class="loadout-astraea"><b>${E(astraeaText)}</b><span>出撃条件：量産型が選ばれ、NULL EMPEROR出現時のルーのHPが50%以下。1プレイ最大1回・約12秒支援。</span></div>
   <div class="loadout-support-foot">${arr?'PILOT LINK ESTABLISHED':'PILOT APPROACHING // EFFECTS ACTIVATE ON ARRIVAL'}</div>
  </section>`;
}
function render(g,upgrades,backLabel='▶ 戦闘に戻る'){
 const p=g?.player||{},mods=p.mods||{},registry=Array.isArray(upgrades)?upgrades:[],allFusions=window.RUU_EXPANSION?.fusions||[];
 const active=registry.filter(u=>u?.id&&num(mods[u.id])>0&&u.id!=='heal');
 const weapons=active.filter(u=>u.type==='WEAPON');
 const synergies=active.filter(u=>u.type==='SYNERGY');
 const passives=active.filter(u=>u.type==='PASSIVE'||u.type==='SURVIVAL');
 const fusion=allFusions.filter(f=>!!g?.fusions?.[f.id]),evolves=EVOLUTIONS.filter(e=>!!g?.[e.flag]);
 const gear=arr=>arr.map(u=>item({name:u.name,desc:u.desc,mark:ICON[u.id]||'✦',level:num(mods[u.id]),max:u.max,type:u.type}));
 const sections=[
  group('WEAPON / 武装',gear(weapons)),
  group('SYNERGY / 追撃',gear(synergies)),
  group('PASSIVE & DEFENSE / 強化・防御',gear(passives)),
  group('EVOLUTION / 進化',evolves.map(e=>item({...e,type:'EVOLUTION'}))),
  group('FUSION / 複合攻撃',fusion.map(f=>item({name:f.name,desc:f.desc,mark:'✥',type:'FUSION'})))
 ].filter(Boolean).join('');
 const summary=[
  stat('LEVEL',String(Math.max(1,Math.floor(num(g?.level)||1))).padStart(2,'0')),
  stat('HP',Math.ceil(num(p.hp))+' / '+Math.ceil(num(p.maxHp))),
  stat('SHIELD',Math.ceil(num(p.shield))+' / '+Math.ceil(num(p.maxShield))),
  stat('BASE ATK',num(p.damage).toFixed(1)),
  stat('CRIT',Math.round(num(p.crit)*100)+'%'),
  stat('HASTE','×'+num(p.haste||1).toFixed(2)),
  stat('MOVE',Math.round(num(p.speed))),
  stat('MAGNET',Math.round(num(p.magnet)))
 ].join('');
 return `<section class="loadout-panel" role="dialog" aria-modal="true" aria-labelledby="loadoutHeading">
   <div class="loadout-kicker">RUU//OVERRUN / LIVE MISSION RECORD</div>
   <header class="loadout-header"><div><h2 id="loadoutHeading">LOADOUT / 装備・支援情報</h2><p>現在の装備と量産型ASTRAL-SUITの効果を確認。閲覧中は戦闘時間・敵・弾幕が停止する。</p></div><button class="loadout-back" id="runInspectorClose" type="button">${E(backLabel)}</button></header>
   <div class="loadout-stats">${summary}</div>
   <div class="loadout-columns"><div class="loadout-main"><div class="loadout-section-caption">ACTIVE EQUIPMENT / 取得済み装備だけを表示</div>${sections||'<p class="loadout-empty">現在装備なし</p>'}<p class="loadout-note">※ 緊急修復などの即時回復は装備として残らない。表示値は閲覧開始時点の状態。</p></div>${support(g)}</div>
   <footer class="loadout-footer"><span>PAUSED / NO PROGRESS WHILE VIEWING</span><button class="loadout-back" id="runInspectorCloseBottom" type="button">${E(backLabel)}</button><small>PC：I / ESC / P で閉じる</small></footer>
  </section>`;
}
window.RUU_RUN_INSPECTOR={VERSION:'1.25.0',render,EVOLUTIONS,PILOT_EFFECTS};
})();
