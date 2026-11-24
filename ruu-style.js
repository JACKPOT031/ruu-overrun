/* RUU//OVERRUN v1.33.0 — RUU STYLE / WARDROBE UNLOCKED. Cosmetic only. */
(()=>{
'use strict';
const KEY='RUU_STYLE_V1', DIR='assets/styles/';
const items=[
 ['default','DEFAULT','通常衣装','初期衣装',1,'#dcc2a2'],
 ['eclipse','ECLIPSE','月蝕','完全クリア（裏ボス戦の主要7体を撃破）',1,'#c6b9d5'],
 ['desire','DESIRE','欲望','1プレイで異なる3種類のJACKPOT MODEを発動',3,'#e2bed4'],
 ['neo_japonism','NEO JAPONISM','新和装','NORMALを累計5回クリア',5,'#ef9c8b'],
 ['white_resonance','WHITE RESONANCE','白の共鳴','NORMALを初クリア',1,'#e8dfce'],
 ['noir_divide','NOIR DIVIDE','黒の分界','異なる4種類の複合攻撃を累計で獲得',4,'#c7c3cf'],
 ['golden_sovereign','GOLDEN SOVEREIGN','黄金の覇者','1プレイで500体撃破',500,'#e8c47c'],
 ['summer_drift','SUMMER DRIFT','夏の漂流','累計100回ダッシュ',100,'#99dfdc'],
 ['pale_revenant','PALE REVENANT','蒼白の帰還者','HP25%以下で主要ボスを撃破',1,'#b8cfff']
].map(([id,name,jp,condition,target,color])=>({id,name,jp,condition,target,color}));
const byId=new Map(items.map(v=>[v.id,v]));
const FUSIONS=['frostThunder','meteorBloom','railRift','sonicCross'];
const number=x=>Number.isFinite(x)?Math.max(0,Math.min(Number.MAX_SAFE_INTEGER,Math.floor(x))):0;
const empty=()=>({schema:1,selected:'default',unlocked:['default'],plays:0,clears:0,complete:0,kills:0,dashes:0,bestKills:0,bestJackpots:0,fusions:[],criticalBoss:false});
let data=empty(),persistOk=true, loaded=false,images=new Map();
function dev(){return !!window.RUU_LOCAL_DEV_MODE;}
function save(){if(dev())return;try{localStorage.setItem(KEY,JSON.stringify(data));persistOk=true;}catch(e){persistOk=false;}}
function sanitize(v){const d=empty();if(!v||typeof v!=='object'||v.schema!==1)return d;
 for(const key of ['plays','clears','complete','kills','dashes','bestKills','bestJackpots'])d[key]=number(v[key]);
 d.bestJackpots=Math.min(3,d.bestJackpots);d.fusions=Array.isArray(v.fusions)?[...new Set(v.fusions.filter(x=>FUSIONS.includes(x)))]:[];d.criticalBoss=v.criticalBoss===true;
 d.unlocked=Array.isArray(v.unlocked)?[...new Set(['default',...v.unlocked.filter(x=>byId.has(x))])]:['default'];
 d.selected=d.unlocked.includes(v.selected)?v.selected:'default';return d;}
function value(id){switch(id){case'default':return 1;case'eclipse':return data.complete;case'desire':return data.bestJackpots;case'neo_japonism':case'white_resonance':return data.clears;case'noir_divide':return data.fusions.length;case'golden_sovereign':return data.bestKills;case'summer_drift':return data.dashes;case'pale_revenant':return data.criticalBoss?1:0;default:return 0;}}
function check(g){if(dev())return [];const added=[];for(const item of items)if(!data.unlocked.includes(item.id)&&value(item.id)>=item.target){data.unlocked.push(item.id);added.push(item);if(g?.styleRun)g.styleRun.newStyles.push(item.id);}return added;}
function migrate(){if(dev())return;let history=[];try{history=window.RUU_EXPANSION?.status?.()||[];}catch(e){}const legacy=new Set(history.filter(x=>x.unlocked).map(x=>x.id));
 // Historical achievements prove a minimum, never invent unrecorded counts.
 if(legacy.has('clear'))data.clears=Math.max(1,data.clears);
 if(legacy.has('eclipse_clear'))data.complete=Math.max(1,data.complete);
 if(legacy.has('kills500'))data.bestKills=Math.max(500,data.bestKills);
 data.plays=Math.max(data.plays,data.clears,data.complete);check(null);save();}
function init(){if(loaded)return;loaded=true;if(dev())return;try{data=sanitize(JSON.parse(localStorage.getItem(KEY)||'null'));}catch(e){persistOk=false;data=empty();}migrate();asset(data.selected);}
function eligible(g){return !dev()&&g&&g.styleRun&&!g.styleRun.finished;}
function name(id){return byId.get(id)?.name||'DEFAULT';}
function selected(){init();return data.selected;}
function asset(id){if(id==='default'||!byId.has(id))return null;if(!images.has(id)&&typeof Image!=='undefined'){const im=new Image();im.decoding='async';im.src=DIR+id+'.webp';images.set(id,im);}return images.get(id)||null;}
function atlas(id){const im=asset(id);return im?.complete&&im.naturalWidth===1536&&im.naturalHeight===1024?im:null;}
function choose(id){init();if(!data.unlocked.includes(id)||!byId.has(id))return false;data.selected=id;asset(id);save();return true;}
function start(g){init();if(!g)return;g.ruuStyle=selected();asset(g.ruuStyle);g.styleRun={jackpots:[],finished:false,newStyles:[]};if(dev())return;data.plays++;save();}
function announce(added,notice){if(!added.length)return;const msg='RUU STYLE UNLOCKED // '+added.map(x=>x.name).join(' / ');if(typeof notice==='function')notice(msg,true);try{const frame=document.getElementById('frame');if(!frame)return;document.getElementById('styleUnlockAlert')?.remove();const el=document.createElement('div');el.id='styleUnlockAlert';el.className='style-unlock-alert';el.setAttribute('role','status');el.textContent=msg;frame.appendChild(el);setTimeout(()=>el.remove(),3500);}catch(e){}}
function event(g,notice){const added=check(g);save();announce(added,notice);return added;}
function dash(g,notice){if(!eligible(g))return [];data.dashes++;return event(g,notice);}
function jackpot(g,index,notice){if(!eligible(g)||!Number.isInteger(index)||index<0||index>2)return [];if(!g.styleRun.jackpots.includes(index))g.styleRun.jackpots.push(index);data.bestJackpots=Math.max(data.bestJackpots,g.styleRun.jackpots.length);return event(g,notice);}
function fusion(g,id,notice){if(!eligible(g)||!FUSIONS.includes(id)||data.fusions.includes(id))return [];data.fusions.push(id);return event(g,notice);}
function major(e){return !!e&&!e.secretScreen&&(e.kind==='boss'||e.kind==='final'||e.trueDevora||e.secretRuu||e.secretReinforcement||e.enemyAstraea);}
function kill(g,e,notice){if(!eligible(g))return [];data.kills++;data.bestKills=Math.max(data.bestKills,number(g.kills));const p=g.player;
 if(major(e)&&p?.maxHp>0&&p.hp>0&&p.hp<=p.maxHp*.25)data.criticalBoss=true;
 // Avoid storage IO for every defeated mob. Check milestones immediately; counters flush every 25 kills, on finish and pagehide.
 const added=check(g);if(added.length){save();announce(added,notice);}else if(data.kills%25===0)save();return added;}
function finish(g,win,notice){if(!eligible(g))return [];g.styleRun.finished=true;
 if(win&&g.mode==='normal')data.clears++;
 if(win&&g.secretBossCleared&&g.mode!=='endless')data.complete++;
 data.bestKills=Math.max(data.bestKills,number(g.kills));return event(g,notice);}
function status(){init();return items.map(x=>({...x,unlocked:data.unlocked.includes(x.id),selected:x.id===data.selected,current:Math.min(x.target,value(x.id))}));}
function stats(){init();return {plays:data.plays,clears:data.clears,complete:data.complete,kills:data.kills,dashes:data.dashes,unlocked:data.unlocked.length,persistOk};}
function markup(){const s=stats(),cards=status().map(x=>`<button type="button" class="style-card ${x.selected?'style-selected':''} ${x.unlocked?'':'style-locked'}" data-style="${x.id}" style="--style-accent:${x.color}" aria-pressed="${x.selected}" aria-disabled="${!x.unlocked}"><span class="style-status">${x.selected?'◆ EQUIPPED':x.unlocked?'✓ UNLOCKED':'◇ LOCKED'}</span><img loading="lazy" decoding="async" src="${DIR}${x.id}_preview.webp" alt="${x.name}"><strong>${x.name}</strong><span class="style-jp">${x.jp}</span><span class="style-condition">${x.condition}</span><span class="style-progress"><i style="width:${100*x.current/x.target}%"></i></span><span class="style-count">${x.current} / ${x.target}</span></button>`).join('');
 return `<section class="style-screen"><header class="style-header"><div><div class="style-kicker">JACKPOTØ31 / COSMETIC COLLECTION</div><h2>RUU <em>STYLE</em></h2><p>9 STYLES. ONE RUU. / 衣装による性能変化なし</p></div><div class="style-owned">${s.unlocked} / 9<small>UNLOCKED</small></div><button class="enemy-archive-btn" type="button" id="styleBack">← TITLE</button></header><div class="style-stats"><span>PLAY <b>${s.plays}</b></span><span>NORMAL CLEAR <b>${s.clears}</b></span><span>COMPLETE <b>${s.complete}</b></span><span>KILLS <b>${s.kills}</b></span><span>DASH <b>${s.dashes}</b></span></div><p class="style-note" id="styleNote" aria-live="polite">${s.persistOk?'解放済みの衣装を選択して装備。未解放衣装も条件を確認できます。':'ブラウザに保存できません。このセッション中のみ記録されます。'} 過去の実績から確認できる分を引継ぎ。データはこのブラウザに保存。</p><div class="style-grid">${cards}</div></section>`;}
function bind(back,redraw){const b=document.getElementById('styleBack');if(b)b.onclick=back;document.querySelectorAll('[data-style]').forEach(el=>el.onclick=()=>{if(choose(el.dataset.style)){redraw();document.querySelector(`[data-style="${el.dataset.style}"]`)?.focus();}else{const note=document.getElementById('styleNote');if(note)note.textContent='LOCKED // '+(byId.get(el.dataset.style)?.condition||'');}});}
function resultHtml(g){if(!g)return '';const added=(g.styleRun?.newStyles||[]).filter(x=>byId.has(x));return `<div class="style-result">RUU STYLE / ${name(g.ruuStyle)}${added.length?`<br><strong>NEW STYLE UNLOCKED // ${added.map(name).join(' / ')}</strong>`:''}</div>`;}
if(typeof window.addEventListener==='function')window.addEventListener('pagehide',()=>{if(loaded)save();});
window.RUU_STYLE={init,selected,choose,atlas,name,start,dash,jackpot,fusion,kill,finish,status,stats,markup,bind,resultHtml};
})();
