(() => {
  'use strict';
  function addPerformanceHelp() {
    const controls=document.querySelector('footer.controls');
    if(!controls||document.getElementById('ruu-performance-help'))return;
    const help=document.createElement('details');
    help.id='ruu-performance-help';help.className='ruu-performance-help';
    help.innerHTML=`<summary>動作が重いとき</summary><div class="ruu-performance-help-body">
      <p>ゲーム内の「FX LITE」「SCENE CALM」でも、演出の負荷を抑えられるよ。</p>
      <h3>PC版Chromeの描画設定</h3>
      <p>グラフィック（ハードウェア）アクセラレーションがオフなら、オンにすると描画が軽くなる場合がある。効果は端末や設定によって変わるよ。</p>
      <ol>
        <li>Chrome右上の「⋮」→「設定」→「システム」を開く。</li>
        <li>「グラフィック アクセラレーションが使用可能な場合は使用する」を確認し、オフならオンを試す。項目名は「ハードウェア アクセラレーション」の場合もある。</li>
        <li>設定を変えたら、<strong>プレイを終えてから</strong>Chromeを再起動する。</li>
      </ol>
      <p>アドレスバーに <code>chrome://settings/system</code> を入力・貼り付けても開けるよ。</p>
      <p>再起動すると進行中のプレイは終了する。表示が乱れる場合は元の設定に戻してね。上の設定項目がない端末では、ゲーム内のFX・SCENEを試してね。</p>
    </div>`;
    // Keep native disclosure keys, but do not start a run or dash while reading.
    // Let keyup reach the game so previously held movement keys still release.
    help.addEventListener('keydown',e=>e.stopPropagation());
    controls.after(help);
  }
  addPerformanceHelp();
  if (window.RUU_LOCAL_DEV_MODE) return;
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
  let boardMode='normal';let serverModes=null,modeRequest=null,boardRequest=0,deleting=false;
  async function supportedModes(){
    if(serverModes!==null)return serverModes;
    if(!api)return ['normal'];
    if(modeRequest)return modeRequest;
    modeRequest=(async()=>{
      try{const r=await fetch(api+'/api/health',{cache:'no-store'});if(!r.ok)throw new Error('HTTP '+r.status);const d=await r.json();
        serverModes=Array.isArray(d.rankingModes)?d.rankingModes.filter(x=>x==='normal'||x==='endless'):['normal'];
        return serverModes;
      }catch(e){return ['normal']}
    })();
    try{return await modeRequest}finally{modeRequest=null}
  }
  function playerId() {
    let id=storage.get(STORE_ID);
    if (!/^[0-9a-f]{32}$/.test(id)) {
      const a=new Uint8Array(16);
      if (window.crypto?.getRandomValues) window.crypto.getRandomValues(a);
      else for(let i=0;i<a.length;i++) a[i]=Math.floor(Math.random()*256);
      id=Array.from(a,v=>v.toString(16).padStart(2,'0')).join('');
      storage.set(STORE_ID,id);
    }
    return id;
  }
  function safeName(value) {
    return Array.from(String(value||'').normalize('NFKC').trim().replace(/\s+/g,' ').replace(/[<>\x00-\x1F\x7F]/g,'')).slice(0,16).join('');
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
  function closeBoard(){modal.hidden=true;boardRequest++;}
  const forget=createButton('自分の記録を削除', async () => {
    if(deleting)return;
    if(!api){message.textContent=API_MESSAGE;return}
    const deleteMode=boardMode;
    if(!window.confirm('このブラウザで登録したランキング記録を削除する？'))return;
    deleting=true;forget.disabled=true;
    try{
      if(deleteMode==='endless'&&!(await supportedModes()).includes('endless')){if(!modal.hidden&&boardMode===deleteMode)message.textContent=serverModes===null?'ランキングの対応状況を確認できません。通信を確認して再試行してね。':'ENDLESSの共通ランキングはサーバー更新待ち。';return;}
      const r=await fetch(api+'/api/score',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({playerId:playerId(),mode:deleteMode})});
      if(!r.ok)throw new Error('HTTP '+r.status);
      if(!modal.hidden&&boardMode===deleteMode){const refresh=showBoard(deleteMode),requestId=boardRequest;await refresh;if(!modal.hidden&&boardRequest===requestId)message.textContent=deleteMode.toUpperCase()+'の登録記録を削除したよ。';}
    }catch(e){if(!modal.hidden&&boardMode===deleteMode)message.textContent='削除に失敗した。通信設定を確認してね。';console.warn(e)}
    finally{deleting=false;forget.disabled=false}
  });
  modal.querySelector('.ruu-public-top').appendChild(forget);
  modal.querySelector('#ruu-board-close').addEventListener('click',closeBoard);
  modal.addEventListener('click',e=>{if(e.target===modal)closeBoard()});
  window.addEventListener('keydown',e=>{if(!modal.hidden){e.stopImmediatePropagation();if(e.key==='Escape'){e.preventDefault();closeBoard();}}},true);
  async function showBoard(mode){
    if(mode==='normal'||mode==='endless')boardMode=mode;
    const requestedMode=boardMode,requestId=++boardRequest;
    const isCurrent=()=>requestId===boardRequest&&!modal.hidden;
    modal.hidden=false;message.textContent=api?'読み込み中…':API_MESSAGE;rows.replaceChildren();
    normalTab.disabled=boardMode==='normal';endlessTab.disabled=boardMode==='endless';
    if(!api)return;
    try{
      const modes=await supportedModes();
      if(!isCurrent())return;
      if(requestedMode==='endless'&&!modes.includes('endless')){
        message.textContent=serverModes===null?'∞ ENDLESSの対応状況を確認できません。通信を確認して再試行してね。':'∞ ENDLESS共通ランキングはサーバー更新待ち。通常ランキングとは別に記録されます。';
        const best=JSON.parse(storage.get('RUU_OVERRUN_ENDLESS_RECORD_V1')||'null');
        if(best){const tr=document.createElement('tr');
          ['LOCAL',nickname||'YOU','—',Number(best.score||0).toLocaleString('ja-JP'),String(best.kills||0),String(best.level||1),'ENDLESS'].forEach(t=>{const td=document.createElement('td');td.textContent=t;tr.appendChild(td)});
          rows.appendChild(tr);
        }
        return;
      }
      const response=await fetch(api+'/api/leaderboard?mode='+requestedMode+'&t='+Date.now(),{cache:'no-store'});
      if(!response.ok)throw new Error('HTTP '+response.status);
      const data=await response.json();
      if(!isCurrent())return;
      const entries=Array.isArray(data.entries)?data.entries:[];
      message.textContent=entries.length?`${requestedMode.toUpperCase()} TOP ${entries.length} / SCORE DESC`:'まだ登録記録がない。最初のプレイヤーになろう。';
      const fragment=document.createDocumentFragment();
      entries.forEach((v,index)=>{
        const tr=document.createElement('tr');
        [String(index+1),String(v.name||'—'),String(v.title||'—'),Number(v.score||0).toLocaleString('ja-JP'),String(v.kills??0),String(v.level??1),v.won?'CLEAR':'SURVIVED'].forEach(t=>{
          const td=document.createElement('td');td.textContent=t;tr.appendChild(td);
        });fragment.appendChild(tr);
      });
      rows.appendChild(fragment);
    }catch(err){if(isCurrent())message.textContent='ランキング取得に失敗した。通信やサーバー設定を確認してね。';console.warn('Ranking load error:',err)}
  }
  function resultPostText(r){
    const label=nickname?safeName(nickname):'ANONYMOUS';
    const text=`RUU//OVERRUN 🎮\n${r.mode==='challenge'?'✦ CHALLENGE / '+(r.challengeName||r.challengeId)+' / '+(r.challengeSuccess?'CLEARED':'FAILED'):r.mode==='endless'?'∞ ENDLESS MODE':r.won?'MISSION COMPLETE!':'SURVIVAL RESULT'}\nPLAYER: ${label}${r.title?' / '+r.title:''}\nSCORE: ${Number(r.score).toLocaleString('ja-JP')} / KILLS: ${r.kills} / LV: ${r.level}\n#RUUOVERRUN #JACKPOTØ31`;
    return text;
  }

  function xPostUrl(text) {
    const qs=new URLSearchParams({text});
    const u=shareUrl();if(u)qs.set('url',u);
    return 'https://twitter.com/intent/tweet?'+qs.toString();
  }
  function shareFeedback(message) {
    const node=menu.querySelector('#ruu-public-result .ruu-public-status');
    if(node)node.textContent=message;
  }
  function resultCardBlob(canvas) {
    // A synchronous conversion preserves the click's transient user activation for native sharing.
    const encoded=canvas.toDataURL('image/png').split(',')[1];
    const raw=atob(encoded);
    const bytes=new Uint8Array(raw.length);
    for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
    return new Blob([bytes],{type:'image/png'});
  }
  function downloadResultPng(blob) {
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;a.download='RUU_OVERRUN_RESULT.png';
    document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),30000);
  }
  async function shareToX() {
    const r=result();if(!r)return;
    const text=resultPostText(r);
    let blob;
    try {
      const canvas=drawResultCard(r);
      if(!canvas)throw new Error('Result card canvas unavailable');
      blob=resultCardBlob(canvas);
    } catch(err) {
      console.warn('Result card creation failed:',err);
      shareFeedback('画像の生成に失敗したため、文章の投稿画面を開くよ。');
      window.open(xPostUrl(text),'_blank','noopener,noreferrer');
      return;
    }
    const file=typeof File==='function'?
      new File([blob],'RUU_OVERRUN_RESULT.png',{type:'image/png'}):null;
    const mobile=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)||
      (navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
    let nativeFilesSupported=false;
    if(file&&mobile&&typeof navigator.share==='function'&&typeof navigator.canShare==='function'){
      try{nativeFilesSupported=navigator.canShare({files:[file]});}catch{}
    }
    if(nativeFilesSupported){
      try {
        const u=shareUrl();
        await navigator.share({
          files:[file],title:'RUU//OVERRUN / RESULT CARD',
          text:text+(u?'\n'+u:'')
        });
        shareFeedback('画像付き共有画面へ送ったよ。投稿先で内容を確認してね。');
        return;
      } catch(err) {
        if(err?.name==='AbortError'){
          shareFeedback('共有をキャンセルした。画像保存や再共有はいつでもできるよ。');
          return;
        }
        console.warn('Native result card sharing unavailable:',err);
      }
    }
    // X Web Intent cannot pre-attach a local image. Copy it first, then open the composer.
    let copyTask=null;
    if(navigator.clipboard?.write&&typeof ClipboardItem==='function'){
      try{copyTask=navigator.clipboard.write([new ClipboardItem({'image/png':blob})]);}
      catch(err){console.warn('Image clipboard unavailable:',err);}
    }
    window.open(xPostUrl(text),'_blank','noopener,noreferrer');
    if(copyTask){
      try {
        await copyTask;
        shareFeedback('結果カードをコピーしたよ。開いたXの投稿画面で Ctrl+V（Macは⌘V）して画像を貼り付けてね。');
        return;
      } catch(err){console.warn('Image clipboard write failed:',err);}
    }
    downloadResultPng(blob);
    shareFeedback('結果カードをPNGで保存したよ。開いたXの投稿画面に画像を添付してね。');
  }
  function drawResultCard(r) {
    if(!r)return null;
    const W=1200,H=675,canvas=document.createElement('canvas');
    canvas.width=W;canvas.height=H;
    const c=canvas.getContext('2d');if(!c)return;
    const bp=r.bossProgress||{},mode=String(r.mode||'normal'),isChallenge=mode==='challenge';
    const completed=!!r.won,challengeCleared=!!r.challengeSuccess;
    const outcome=isChallenge?(challengeCleared?'TRIAL CLEARED':completed?'TRIAL FAILED / ROUTE CLEARED':'TRIAL FAILED'):
      mode==='endless'?'ENDLESS / RUN ENDED':completed?(bp.eclipseCleared&&bp.eclipseTotal?'COMPLETE CLEAR // TAKAMIYA':'MISSION COMPLETE'):'MISSION FAILED';
    const clearColor=completed?(isChallenge&&!challengeCleared?'#ffe1a0':'#91f0d3'):'#ffb0bb';
    const back=c.createLinearGradient(0,0,W,H);
    back.addColorStop(0,'#121e30');back.addColorStop(.48,'#261a29');back.addColorStop(1,'#0b0d1a');
    c.fillStyle=back;c.fillRect(0,0,W,H);
    const game=document.getElementById('game');
    if(game){try{c.globalAlpha=.14;c.drawImage(game,0,0,W,H)}catch{}}
    c.globalAlpha=1;
    const shade=c.createLinearGradient(0,0,W,0);
    shade.addColorStop(0,'#0a0d1de9');shade.addColorStop(.62,'#12101eea');shade.addColorStop(1,'#090b16f6');
    c.fillStyle=shade;c.fillRect(0,0,W,H);
    c.strokeStyle='#cfb68d';c.lineWidth=2;c.strokeRect(24,24,W-48,H-48);
    const panel=(x,y,w,h,fill='#131827e8',border='#71819670')=>{
      c.fillStyle=fill;c.fillRect(x,y,w,h);
      c.strokeStyle=border;c.lineWidth=1;c.strokeRect(x,y,w,h);
    };
    const text=(str,x,y,font,color,maxWidth,align='left')=>{
      c.font=font;c.fillStyle=color;c.textBaseline='alphabetic';c.textAlign=align;
      c.fillText(String(str??''),x,y,maxWidth);
    };
    const score=Math.max(0,Number(r.score)||0);
    const secs=Math.max(0,Math.floor(Number(r.durationSeconds)||0));
    const duration=`${String(Math.floor(secs/60)).padStart(2,'0')}:${String(secs%60).padStart(2,'0')}`;
    const name=safeName(nickname)||'ANONYMOUS';
    text('JACKPOTØ31 / '+String(r.operation||'ORIGINAL SURVIVAL GAME'),52,64,'800 16px ui-monospace,Consolas,monospace','#c1b7aa',820);
    text('v'+String(r.version||'1.26.0'),1145,64,'800 15px ui-monospace,Consolas,monospace','#aaa4b1',200,'right');
    text('RUU//OVERRUN',51,127,'italic 1000 64px system-ui,sans-serif','#f8e7c8',1070);
    c.strokeStyle='#c6a48088';c.lineWidth=1;c.beginPath();c.moveTo(53,152);c.lineTo(1146,152);c.stroke();

    panel(52,181,609,394,'#0d1723dc','#6b7d8d80');
    text(outcome,72,218,'900 23px ui-monospace,Consolas,monospace',clearColor,562);
    text('SCORE',72,256,'900 17px ui-monospace,Consolas,monospace','#dfc3a5',560);
    text(score.toLocaleString('ja-JP'),68,355,'900 92px ui-monospace,Consolas,monospace','#fff2dc',574);
    c.strokeStyle='#b9957a5a';c.beginPath();c.moveTo(71,378);c.lineTo(641,378);c.stroke();
    text('KILLS',73,406,'800 12px ui-monospace,Consolas,monospace','#9fbdbe',155);
    text('LEVEL',265,406,'800 12px ui-monospace,Consolas,monospace','#9fbdbe',155);
    text('TIME',465,406,'800 12px ui-monospace,Consolas,monospace','#9fbdbe',155);
    text(String(Math.max(0,Math.floor(Number(r.kills)||0))),72,448,'900 30px ui-monospace,Consolas,monospace','#f6e8d1',160);
    text(String(Math.max(1,Math.floor(Number(r.level)||1))),265,448,'900 30px ui-monospace,Consolas,monospace','#f6e8d1',140);
    text(duration,465,448,'900 30px ui-monospace,Consolas,monospace','#f6e8d1',170);
    text('PLAYER  '+name,73,500,'900 20px system-ui,sans-serif','#f3dbb6',568);
    text('TITLE  '+String(r.title||'—'),73,538,'800 17px system-ui,sans-serif','#d8c6d1',566);
    text('STYLE  '+String(r.styleName||'DEFAULT'),73,559,'800 14px ui-monospace,Consolas,monospace','#e6c48e',566);

    const cores=Math.max(0,Math.floor(Number(bp.trueTotal)||0));
    const killed=Math.max(0,Math.min(cores,Math.floor(Number(bp.trueKilled)||0)));
    const eclipseTotal=Math.max(0,Math.floor(Number(bp.eclipseTotal)||0));
    const eclipseKilled=Math.max(0,Math.min(eclipseTotal,Math.floor(Number(bp.eclipseKilled)||0)));
    const devoraTotal=Math.max(0,Math.floor(Number(bp.eclipseDevoraTotal)||0));
    const devoraKilled=Math.max(0,Math.min(devoraTotal,Math.floor(Number(bp.eclipseDevoraKilled)||0)));
    const astraeaTotal=Math.max(0,Math.floor(Number(bp.eclipseAstraeaTotal)||0));
    const astraeaKilled=Math.max(0,Math.min(astraeaTotal,Math.floor(Number(bp.eclipseAstraeaKilled)||0)));
    const screenWaves=Math.max(0,Math.min(2,Math.floor(Number(bp.eclipseScreenWaves)||0)));
    const operationRecord=eclipseTotal?`ECLIPSE ${eclipseKilled}/${eclipseTotal} · DEVORA ${devoraKilled}/${devoraTotal}`+(astraeaTotal?` · ASTRAEA ${astraeaKilled}/${astraeaTotal}`:'')+(bp.eclipseCleared?' / COMPLETE':''):'';
    const milestones=[
      {name:'01 DEVORA',status:bp.devora?'DEFEATED':bp.devoraReached?'ENGAGED':'NOT REACHED',clear:!!bp.devora},
      {name:'02 NULL EMPEROR',status:bp.nullEmperor?'DEFEATED':bp.nullReached?'ENGAGED':'NOT REACHED',clear:!!bp.nullEmperor},
      {name:'03 TRUE DEVORA'+(cores?' ×'+cores:''),status:bp.trueCleared?'ALL CORES CLEARED':cores?`${killed} / ${cores} CORES`:(bp.nullEmperor?'AWAKENING':'NOT REACHED'),clear:!!bp.trueCleared},
      {name:eclipseTotal?'04 OPERATION: TAKAMIYA':'04 RUU : ECLIPSE',status:operationRecord||(bp.eclipseCleared?'SECRET CLEAR':bp.eclipseSeen?'ENCOUNTERED':bp.trueCleared?'NOT TRIGGERED':'NOT REACHED'),detail:astraeaTotal?`WAVES ${screenWaves}/2`:'',clear:!!bp.eclipseCleared}
    ];
    panel(680,181,468,394,'#191427ed','#94779491');
    text('BOSS / CLEAR RECORD',697,213,'900 20px ui-monospace,Consolas,monospace','#f1d7e2',439);
    text('CURRENT RUN  /  撃破済みのボスのみCLEAR判定',697,235,'700 10px system-ui,sans-serif','#b4abbc',430);
    milestones.forEach((m,i)=>{
      const y=246+i*53,col=m.clear?'#a7f0d5':m.status==='ENGAGED'||m.status==='ENCOUNTERED'?'#ffd69d':'#a6a6b2';
      panel(696,y,435,47,m.clear?'#18312d9c':'#171b2adc',m.clear?'#729a8f8c':'#5a617457');
      text(m.name,709,y+19,'900 14px ui-monospace,Consolas,monospace','#f1e5e2',282);
      if(m.detail)text(m.detail,1091,y+19,'800 9px ui-monospace,Consolas,monospace',col,88,'right');
      text(m.clear?'✓':'—',1115,y+19,'900 15px ui-monospace,Consolas,monospace',col,28,'right');
      text(m.status,709,y+36,'800 11px ui-monospace,Consolas,monospace',col,409);
    });

    const pilot=String(r.supportPilot||'').trim(),pilotJp=String(r.supportPilotJp||'').trim();
    panel(696,467,435,90,'#241c2ded','#c090ba91');
    text('MASS-PRODUCED ASTRAL-SUIT / PILOT',707,489,'900 10px ui-monospace,Consolas,monospace','#e7aee2',410);
    text(pilot||'NO SUPPORT / NOT DEPLOYED',707,517,'900 19px ui-monospace,Consolas,monospace',pilot?'#fff1db':'#b8aabc',405);
    text(pilot?(pilotJp+(r.supportArrived?' / ALLIED REINFORCEMENT':' / INBOUND')):'No allied pilot joined this run',707,539,'800 12px system-ui,sans-serif','#c6b9c7',405);

    const highest=bp.eclipseCleared?(eclipseTotal?'OPERATION: TAKAMIYA CLEARED':'SECRET CLEAR'):bp.eclipseSeen&&eclipseTotal?'OPERATION: TAKAMIYA IN PROGRESS':bp.trueCleared?'TRUE DEVORA CLEARED':bp.nullEmperor?'NULL EMPEROR DEFEATED':bp.devora?'DEVORA DEFEATED':'SURVIVAL IN PROGRESS';
    text('LAST MILESTONE / '+highest,54,611,'800 14px ui-monospace,Consolas,monospace','#e4d2bd',1085);
    text('#RUUOVERRUN   #JACKPOTØ31',54,642,'800 15px ui-monospace,Consolas,monospace','#a3adb7',950);
    return canvas;
  }

  function saveResultCard() {
    const canvas=drawResultCard(result());
    if(!canvas)return;
    try {
      downloadResultPng(resultCardBlob(canvas));
      shareFeedback('結果カードをPNGで保存したよ。');
    } catch(err) {
      console.warn('Result card download failed:',err);
      shareFeedback('結果カードの保存に失敗した。もう一度試してね。');
    }
  }
    async function submit(scoreInput,status){
    if(busy)return;
    nickname=safeName(scoreInput.value);scoreInput.value=nickname;storage.set(STORE_NAME,nickname);
    if(!nickname){status.textContent='まずプレイヤー名を入力してね。';scoreInput.focus();return}
    if(!api){status.textContent=API_MESSAGE;return}
    const r=result();if(!r){status.textContent='プレイ終了後の記録だけ登録できるよ。';return}if(r.mode==='challenge'){status.textContent='チャレンジ記録はローカル専用。通常ランキングに送信しないよ。';return;}
    const submittedName=nickname;
    busy=true;status.textContent='送信中…';
    try{
      if(r.mode==='endless'&&!(await supportedModes()).includes('endless')){status.textContent=serverModes===null?'ランキングの対応状況を確認できません。通信を確認して、もう一度登録してね。':'ENDLESS自己ベストは保存済み。オンライン登録はサーバー更新後に使えるよ。';return;}
      const response=await fetch(api+'/api/score',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({playerId:playerId(),name:submittedName,title:r.title||'',mode:r.mode||'normal',score:r.score,kills:r.kills,level:r.level,timeSeconds:r.durationSeconds,won:r.won,version:r.version})});
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
    const mount=copy.querySelector('#titleCommunity');if(mount){mount.append(p);return;}const controls=copy.querySelector('.menu-controls');if(controls)copy.insertBefore(p,controls);else copy.append(p);
  }
  function addResultControls(){
    if(menu.querySelector('#ruu-public-result'))return;
    const stats=menu.querySelector('.result-stats');if(!stats)return;
    const p=document.createElement('div');p.id='ruu-public-result';p.className='ruu-score-box';
    const input=inputElement();const status=document.createElement('div');status.className='ruu-public-status';const challengeMode=result()?.mode==='challenge';
    if(challengeMode)p.append(createButton('𝕏 結果カードを投稿',shareToX),createButton('🖼 結果カード保存',saveResultCard));else p.append(input,createButton('🏆 ランキング登録',()=>submit(input,status)),createButton('🌐 みんなの順位',()=>showBoard(result()?.mode==='endless'?'endless':'normal')),createButton('𝕏 結果カードを投稿',shareToX),createButton('🖼 結果カード保存',saveResultCard));
    const hint=document.createElement('div');hint.className='ruu-public-hint';hint.textContent=challengeMode?'CHALLENGEはローカル記録専用。通常・ENDLESSの世界ランキングへ送信されません。結果カードはスマホで画像共有、PCで画像コピー＋X投稿画面に対応。':'名前とスコアは公開ランキングに表示されるよ。匿名のニックネームを使ってね。Xへの投稿は最終確認が必要。スマホは共有先でXを選択。PCはXの投稿画面でCtrl+V（Macは⌘V）で画像を添付できるよ。';
    p.append(hint,status);
    const help=menu.querySelector('.help');if(help)menu.insertBefore(p,help);else menu.append(p);
    if(!api&&!challengeMode)status.textContent='共通ランキングの接続待ち。X共有は今すぐ利用可能。';
  }
  function refresh(){if(menu.querySelector('#startBtn'))addTitleControls();else if(menu.querySelector('.result-stats'))addResultControls();}
  new MutationObserver(refresh).observe(menu,{childList:true});
  refresh();
})();
