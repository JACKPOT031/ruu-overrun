(() => {
  'use strict';
  const config = window.RUU_PUBLIC_CONFIG || {};
  const api = String(config.apiUrl || '').trim().replace(/\/+$/,'');
  const menu = document.getElementById('menu');
  const frame = document.getElementById('frame');
  if (!menu || !frame) return;
  const STORE_NAME = 'RUU_PUBLIC_NICKNAME_V1';
  const STORE_ID = 'RUU_PUBLIC_PLAYER_ID_V1';
  const API_MESSAGE = '共通ランキングはサーバー設定後に利用できるよ。ゲームとXシェアはすぐ使える。';
  const storage = {
    get(key) { try { return localStorage.getItem(key) || ''; } catch { return ''; } },
    set(key,value) { try { localStorage.setItem(key,value); } catch {} }
  };
  let nickname = storage.get(STORE_NAME);
  let busy = false;
  let boardMode='normal';let serverModes=null;
  async function supportedModes(){
    if(serverModes!==null)return serverModes;
    if(!api)return ['normal'];
    try{const r=await fetch(api+'/api/health',{cache:'no-store'});const d=await r.json();
      serverModes=Array.isArray(d.rankingModes)?d.rankingModes.filter(x=>x==='normal'||x==='endless'):['normal'];
    }catch(e){serverModes=['normal']};return serverModes;
  }
  function playerId() {
    let id=storage.get(STORE_ID);
    if (!/^[0-9a-f]{32}$/.test(id)) {
      const a=new Uint8Array(16);
      if (crypto?.getRandomValues) crypto.getRandomValues(a);
      else for(let i=0;i<a.length;i++) a[i]=Math.floor(Math.random()*256);
      id=Array.from(a,v=>v.toString(16).padStart(2,'0')).join('');
      storage.set(STORE_ID,id);
    }
    return id;
  }
  function safeName(value) {
    return Array.from(String(value||'').normalize('NFKC').trim().replace(/\s+/g,' ').replace(/[\x00-\x1F\x7F]/g,'')).slice(0,16).join('');
  }
  function result() {
    const r=window.RUU_PUBLIC_SNAPSHOT?.();
    if (!r || !['won','lost'].includes(r.phase)) return null;
    return r;
  }
  function shareUrl() {
    const explicit=String(config.siteUrl||'').trim();
    if (/^https:\/\//.test(explicit)) return explicit;
    if (location.protocol === 'https:' || location.protocol === 'http:') return location.origin + location.pathname;
    return '';
  }
  function inputElement() {
    const input=document.createElement('input');
    input.className='ruu-nickname';input.type='text';input.maxLength=24;
    input.setAttribute('aria-label','公開ランキングのプレイヤー名');
    input.placeholder='プレイヤー名（16文字以内）';input.value=nickname;
    input.addEventListener('change',()=>{nickname=safeName(input.value);input.value=nickname;storage.set(STORE_NAME,nickname)});
    // Global game keyboard controls should not fire while typing or pressing Enter in the field.
    input.addEventListener('keydown',e=>e.stopPropagation());
    return input;
  }
  function createButton(label,click) {
    const b=document.createElement('button');b.type='button';b.className='ruu-mini-btn';b.textContent=label;b.onclick=click;return b;
  }
  const modal=document.createElement('div');modal.className='ruu-public-modal';modal.id='ruu-public-modal';modal.hidden=true;
  modal.innerHTML='<div class="ruu-public-panel" role="dialog" aria-modal="true" aria-labelledby="ruu-board-title"><div class="ruu-public-top"><div><div class="ruu-public-caption">RUU//OVERRUN / COMMUNITY</div><h2 id="ruu-board-title">WORLD RANKING</h2></div><button type="button" class="ruu-mini-btn" id="ruu-board-close">✕ CLOSE</button></div><div id="ruu-board-message" class="ruu-public-note"></div><div style="overflow-x:auto"><table class="ruu-public-table"><thead><tr><th>RANK</th><th>PLAYER</th><th>TITLE</th><th>SCORE</th><th>KILLS</th><th>LEVEL</th><th>RESULT</th></tr></thead><tbody id="ruu-board-rows"></tbody></table></div><p class="ruu-public-note">登録されるのはプレイヤー名とゲーム記録だけ。名前は誰でも閲覧できるので本名や個人情報を入力しないでね。ランキングはβ版（認証なし）だよ。</p></div>';
  frame.append(modal);
  const tabs=document.createElement('div');tabs.className='ruu-mode-tabs';
  const normalTab=createButton('NORMAL TOP30',()=>showBoard('normal'));
  const endlessTab=createButton('∞ ENDLESS TOP30',()=>showBoard('endless'));
  tabs.append(normalTab,endlessTab);modal.querySelector('.ruu-public-top').appendChild(tabs);
  const message=modal.querySelector('#ruu-board-message');
  const rows=modal.querySelector('#ruu-board-rows');
  function closeBoard(){modal.hidden=true;}
  const forget=createButton('自分の記録を削除', async () => {
    if(!api){message.textContent=API_MESSAGE;return}
    if(!window.confirm('このブラウザで登録したランキング記録を削除する？'))return;
    try{
      if(boardMode==='endless'&&!(await supportedModes()).includes('endless')){message.textContent='ENDLESSの共通ランキングはCloudflare Workerの更新待ち。';return;}
      const r=await fetch(api+'/api/score',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({playerId:playerId(),mode:boardMode})});
      if(!r.ok)throw new Error('HTTP '+r.status);
      await showBoard();
      message.textContent='このブラウザの登録記録を削除したよ。';
    }catch(e){message.textContent='削除に失敗した。通信設定を確認してね。';console.warn(e)}
  });
  modal.querySelector('.ruu-public-top').appendChild(forget);
  modal.querySelector('#ruu-board-close').addEventListener('click',closeBoard);
  modal.addEventListener('click',e=>{if(e.target===modal)closeBoard()});
  window.addEventListener('keydown',e=>{if(!modal.hidden){e.stopImmediatePropagation();if(e.key==='Escape'){e.preventDefault();closeBoard();}}},true);
  async function showBoard(mode){
    if(mode==='normal'||mode==='endless')boardMode=mode;
    modal.hidden=false;message.textContent=api?'読み込み中…':API_MESSAGE;rows.replaceChildren();
    normalTab.disabled=boardMode==='normal';endlessTab.disabled=boardMode==='endless';
    if(!api)return;
    try{
      const modes=await supportedModes();
      if(boardMode==='endless'&&!modes.includes('endless')){
        message.textContent='∞ ENDLESS共通ランキングはCloudflare Worker更新待ち。通常ランキングとは完全分離。';
        const best=JSON.parse(storage.get('RUU_OVERRUN_ENDLESS_RECORD_V1')||'null');
        if(best){const tr=document.createElement('tr');
          ['LOCAL',nickname||'YOU','—',Number(best.score||0).toLocaleString('ja-JP'),String(best.kills||0),String(best.level||1),'ENDLESS'].forEach(t=>{const td=document.createElement('td');td.textContent=t;tr.appendChild(td)});
          rows.appendChild(tr);
        }
        return;
      }
      const response=await fetch(api+'/api/leaderboard?mode='+boardMode+'&t='+Date.now(),{cache:'no-store'});
      if(!response.ok)throw new Error('HTTP '+response.status);
      const data=await response.json();
      if(modal.hidden)return;
      const entries=Array.isArray(data.entries)?data.entries:[];
      message.textContent=entries.length?`${boardMode.toUpperCase()} TOP ${entries.length} / SCORE DESC`:'まだ登録記録がない。最初のプレイヤーになろう。';
      const fragment=document.createDocumentFragment();
      entries.forEach((v,index)=>{
        const tr=document.createElement('tr');
        [String(index+1),String(v.name||'—'),String(v.title||'—'),Number(v.score||0).toLocaleString('ja-JP'),String(v.kills??0),String(v.level??1),v.won?'CLEAR':'SURVIVED'].forEach(t=>{
          const td=document.createElement('td');td.textContent=t;tr.appendChild(td);
        });fragment.appendChild(tr);
      });
      rows.appendChild(fragment);
    }catch(err){message.textContent='ランキング取得に失敗した。通信やサーバー設定を確認してね。';console.warn('Ranking load error:',err)}
  }
  function shareToX(){
    const r=result();if(!r)return;
    const label=nickname?safeName(nickname):'ANONYMOUS';
    const text=`RUU//OVERRUN 🎮\n${r.mode==='challenge'?'✦ CHALLENGE / '+(r.challengeName||r.challengeId)+' / '+(r.challengeSuccess?'CLEARED':'FAILED'):r.mode==='endless'?'∞ ENDLESS MODE':r.won?'MISSION COMPLETE!':'SURVIVAL RESULT'}\nPLAYER: ${label}${r.title?' / '+r.title:''}\nSCORE: ${Number(r.score).toLocaleString('ja-JP')} / KILLS: ${r.kills} / LV: ${r.level}\n#RUUOVERRUN #JACKPOTØ31`;
    const qs=new URLSearchParams({text});
    const u=shareUrl();if(u)qs.set('url',u);
    window.open('https://twitter.com/intent/tweet?'+qs.toString(),'_blank','noopener,noreferrer');
  }
  function saveResultCard() {
    const r=result();if(!r)return;
    const W=1200,H=675,canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
    const c=canvas.getContext('2d');
    const base=c.createLinearGradient(0,0,W,H);
    base.addColorStop(0,'#101722');base.addColorStop(.55,'#271927');base.addColorStop(1,'#080c15');
    c.fillStyle=base;c.fillRect(0,0,W,H);
    const game=document.getElementById('game');
    if(game){try{c.globalAlpha=.36;c.drawImage(game,0,0,W,H)}catch{}}
    c.globalAlpha=1;
    const shade=c.createLinearGradient(0,0,W,0);shade.addColorStop(0,'#080b16ed');shade.addColorStop(.65,'#10111bdf');shade.addColorStop(1,'#100d1b55');
    c.fillStyle=shade;c.fillRect(0,0,W,H);
    c.strokeStyle='#ddbe8f';c.lineWidth=3;c.strokeRect(26,26,W-52,H-52);
    c.fillStyle='#c4ae92';c.font='800 21px ui-monospace,monospace';c.fillText('JACKPOTØ31 / ORIGINAL GAME',64,87);
    c.fillStyle='#fce7bd';c.font='italic 900 76px system-ui,sans-serif';c.fillText('RUU//OVERRUN',59,174);
    c.fillStyle=r.won?'#98fbd7':'#ffb1c6';c.font='900 31px system-ui,sans-serif';c.fillText(r.mode==='challenge'?'✦ CHALLENGE '+(r.challengeSuccess?'CLEARED':'FAILED'):r.mode==='endless'?'∞ ENDLESS MODE':r.won?'MISSION COMPLETE':'SURVIVAL RESULT',65,238);
    c.fillStyle='#fff3dc';c.font='900 116px ui-monospace,Consolas,monospace';c.fillText(Number(r.score).toLocaleString('ja-JP'),59,385);
    c.fillStyle='#d2bca2';c.font='800 23px system-ui,sans-serif';c.fillText('SCORE',65,281);
    c.fillStyle='#efdfc6';c.font='900 29px ui-monospace,monospace';c.fillText(`KILLS  ${r.kills}      LV  ${r.level}      TIME  ${String(Math.floor(r.durationSeconds/60)).padStart(2,'0')}:${String(r.durationSeconds%60).padStart(2,'0')}`,65,460);
    c.fillStyle='#f4dbad';c.font='800 29px system-ui,sans-serif';c.fillText(`PLAYER  ${safeName(nickname)||'ANONYMOUS'}`,65,520,1000);
    if(r.title){c.fillStyle='#ffe8b9';c.font='700 22px system-ui,sans-serif';c.fillText('TITLE  '+r.title,65,558,1000);}
    c.fillStyle='#a6a8b5';c.font='800 18px ui-monospace,monospace';c.fillText('#RUUOVERRUN     #JACKPOTØ31',65,596);
    const a=document.createElement('a');a.download='RUU_OVERRUN_RESULT.png';a.href=canvas.toDataURL('image/png');a.click();
  }
  async function submit(scoreInput,status){
    if(busy)return;
    nickname=safeName(scoreInput.value);scoreInput.value=nickname;storage.set(STORE_NAME,nickname);
    if(!nickname){status.textContent='まずプレイヤー名を入力してね。';scoreInput.focus();return}
    if(!api){status.textContent=API_MESSAGE;return}
    const r=result();if(!r){status.textContent='プレイ終了後の記録だけ登録できるよ。';return}if(r.mode==='challenge'){status.textContent='チャレンジ記録はローカル専用。通常ランキングに送信しないよ。';return;}
    if(r.mode==='endless'&&!(await supportedModes()).includes('endless')){status.textContent='ENDLESS自己ベストは保存済み。オンライン登録はCloudflare更新後に使えるよ。';return;}
    busy=true;status.textContent='送信中…';
    try{
      const response=await fetch(api+'/api/score',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({playerId:playerId(),name:nickname,title:r.title||'',mode:r.mode||'normal',score:r.score,kills:r.kills,level:r.level,timeSeconds:r.durationSeconds,won:r.won,version:r.version})});
      const body=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(body.error||('HTTP '+response.status));
      status.textContent=body.updated?'ランキングに登録した！':'登録済みの自己ベストを維持したよ。';
    }catch(err){status.textContent='送信失敗：'+String(err.message||err).slice(0,75);console.warn('Ranking submit error:',err)}
    finally{busy=false}
  }
  function addTitleControls(){
    const copy=menu.querySelector('.menu-copy');if(!copy||copy.querySelector('#ruu-public-start'))return;
    const p=document.createElement('div');p.id='ruu-public-start';p.className='ruu-public-start';
    const label=document.createElement('label');label.textContent='PLAYER NAME';const input=inputElement();
    p.append(label,input,createButton('🏆 世界ランキング',()=>showBoard('normal')));if(storage.get('RUU_OVERRUN_ENDING_UNLOCK')==='1')p.append(createButton('∞ ENDLESS順位',()=>showBoard('endless')));
    const hint=document.createElement('span');hint.textContent='※ 名前の登録はプレイ結果画面で行う';hint.style.fontSize='10px';hint.style.color='#a7a7a7';p.append(hint);
    const controls=copy.querySelector('.menu-controls');if(controls)copy.insertBefore(p,controls);else copy.append(p);
  }
  function addResultControls(){
    if(menu.querySelector('#ruu-public-result'))return;
    const stats=menu.querySelector('.result-stats');if(!stats)return;
    const p=document.createElement('div');p.id='ruu-public-result';p.className='ruu-score-box';
    const input=inputElement();const status=document.createElement('div');status.className='ruu-public-status';const challengeMode=result()?.mode==='challenge';
    if(challengeMode)p.append(createButton('𝕏 チャレンジ結果をポスト',shareToX),createButton('🖼 結果カード保存',saveResultCard));else p.append(input,createButton('🏆 ランキング登録',()=>submit(input,status)),createButton('🌐 みんなの順位',()=>showBoard(result()?.mode==='endless'?'endless':'normal')),createButton('𝕏 結果をポスト',shareToX),createButton('🖼 結果カード保存',saveResultCard));
    const hint=document.createElement('div');hint.className='ruu-public-hint';hint.textContent=challengeMode?'CHALLENGEはローカル記録専用。通常・ENDLESSの世界ランキングへ送信されません。Xと結果カードは共有できるよ。':'名前とスコアは公開ランキングに表示されるよ。匿名のニックネームを使ってね。Xへの投稿は確認画面が開くだけ。画像カードは保存後、Xで手動添付してね。';
    p.append(hint,status);
    const help=menu.querySelector('.help');if(help)menu.insertBefore(p,help);else menu.append(p);
    if(!api&&!challengeMode)status.textContent='共通ランキングの接続待ち。X共有は今すぐ利用可能。';
  }
  function refresh(){if(menu.querySelector('#startBtn'))addTitleControls();else if(menu.querySelector('.result-stats'))addResultControls();}
  new MutationObserver(refresh).observe(menu,{childList:true});
  refresh();
})();
