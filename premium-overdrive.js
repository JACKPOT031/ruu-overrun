/* RUU//OVERRUN v1.9.0 — JACKPOT ROYALE / CINEMATIC SOUND ENGINE
   Visual-only enhancement. No changes to HP, attack damage, score or ranking.
   Lightweight layered WebAudio sound effects are generated at runtime. */
(()=>{
'use strict';
const TAU=Math.PI*2, min=Math.min,max=Math.max,clamp=(x,a,b)=>max(a,min(b,x));
const themes=[
  {main:'#a998ff',accent:'#ff79b9',white:'#fff0fd',rgb:[167,119,255],label:'DUO SIGNAL',line:'DUAL HARMONIC ASSAULT'},
  {main:'#fff1bf',accent:'#9beefc',white:'#ffffff',rgb:[255,232,170],label:'WHITE POP',line:'PRISMATIC HALO CASCADE'},
  {main:'#ff426b',accent:'#b186ff',white:'#ffcada',rgb:[255,73,110],label:'BLACK TRACE',line:'REDLINE ANOMALY SLASH'}
];
let visualClock=0,bloom=0,step=0,hitTick=0,shots=[],lastSoundContext=null;
function color(theme){return themes[clamp(theme|0,0,2)];}
function push(item,q){if(!item||!Number.isFinite(item.x)||!Number.isFinite(item.y))return;
 const maxItems=q==='high'?174:q==='lite'?42:100;
 if(shots.length>=maxItems)shots.shift();
 item.max=item.life;shots.push(item);
}
function reset(){shots.length=0;visualClock=0;bloom=0;step=0;hitTick=0;}
function update(dt,g,q){
 visualClock+=dt;bloom=max(0,bloom-dt*2.1);
 for(let i=shots.length-1;i>=0;i--){
  const s=shots[i];s.life-=dt;s.x+=s.vx*dt;s.y+=s.vy*dt;
  if(s.life<=0)shots.splice(i,1);
 }
 if(g&&g.jackpotTime>0&&g.player&&q!=='lite'){
  // Deterministic, tiny orbiting trails around the player: max 7 updates/second.
  step+=dt;
  if(step>.14){
   step=0;const k=clamp(g.jackpotType|0,0,2),p=g.player,i=Math.floor(visualClock*21);
   for(let n=0;n<2;n++){
    const a=visualClock*(k===2?-2.9:2.3)+TAU*(n/2)+i*.17;
    const r=k===1?94:k===0?108:87;
    push({type:k===1?'star':k===2?'glyph':'glint',x:p.x+Math.cos(a)*r,y:p.y+Math.sin(a)*r,vx:Math.cos(a)*25,vy:Math.sin(a)*25-17,life:.55,size:k===1?10:7,rot:a,k},q);
   }
  }
 }
}
function burstAt(x,y,k,q,n=9,size=24,style='glint'){
 const amt=q==='lite'?Math.ceil(n*.36):q==='high'?n*2:n;
 for(let i=0;i<amt;i++){
  const a=(i/amt)*TAU+visualClock*.7,r=(i%3)*6+size*.2,vel=55+((i*37)%95);
  push({type:style,x:x+Math.cos(a)*r,y:y+Math.sin(a)*r,vx:Math.cos(a)*vel,vy:Math.sin(a)*vel,life:.33+(i%4)*.11,size:size*(.28+((i%4)*.08)),rot:a,k},q);
 }
}
function jackpotStart(kind,p,q){
 if(!p)return;const k=clamp(kind|0,0,2);bloom=1.4;
 burstAt(p.x,p.y,k,q,20,35,k===1?'star':k===2?'glyph':'glint');
 push({type:'crown',x:p.x,y:p.y,vx:0,vy:0,life:1.6,size:220,k,rot:0},q);
 push({type:'shock',x:p.x,y:p.y,vx:0,vy:0,life:1.0,size:380,k,rot:0},q);
}
function jackpotPulse(kind,p,enemies,q){
 if(!p)return;const k=clamp(kind|0,0,2),targets=Array.isArray(enemies)?enemies:[];
 bloom=max(bloom,.12);
 if(k===0){
  // Paired crimson/lilac electric splinters travel along target lines.
  for(let i=0;i<min(targets.length,q==='high'?5:3);i++){
   const e=targets[i];if(!e||!Number.isFinite(e.x))continue;
   push({type:'wire',x:p.x,y:p.y,x2:e.x,y2:e.y,vx:0,vy:0,life:.23,size:14,k,rot:i*1.7},q);
   burstAt(e.x,e.y,k,q,5,19,'glint');
  }
  push({type:'shock',x:p.x,y:p.y,vx:0,vy:0,life:.36,size:135,k},q);
 }else if(k===1){
  // Pop-art stellar halo and pearl/chrome confetti.
  push({type:'halo',x:p.x,y:p.y,vx:0,vy:0,life:.54,size:210,k,rot:visualClock},q);
  burstAt(p.x,p.y,k,q,12,27,'star');
 }else{
  // Glitch slash bursts at actual enemy locations, no hitbox change.
  for(let i=0;i<min(targets.length,q==='high'?7:4);i++){
   const e=targets[i];if(!e||!Number.isFinite(e.x))continue;
   push({type:'rift',x:e.x,y:e.y,vx:0,vy:0,life:.33,size:80+(i%3)*25,k,rot:visualClock*3.3+i*1.8},q);
   if(i%2===0)burstAt(e.x,e.y,k,q,4,21,'glyph');
  }
 }
}
function impact(e,c,d,q,activeKind){
 if(!e||!Number.isFinite(e.x))return;
 hitTick++;if(hitTick%(q==='lite'?8:q==='high'?3:5)!==0)return;
 const k=Number.isInteger(activeKind)&&activeKind>=0?activeKind:1;
 const intense=d>42;
 push({type:intense?'star':'glint',x:e.x,y:e.y,vx:0,vy:0,life:intense?.27:.20,size:intense?24:11,k,rot:visualClock*5},q);
 if(intense&&q!=='lite')burstAt(e.x,e.y,k,q,5,16,'glint');
}
function weapon(f,q){
 if(!f||q==='lite')return;
 const kind=f.kind||'';
 if(['rail','finisherRay','rift','cross','sigGlitch','sigClaw'].includes(kind)&&Number.isFinite(f.x2)){
  push({type:'wire',x:f.x,y:f.y,x2:f.x2,y2:f.y2,vx:0,vy:0,life:clamp(f.life||.24,.12,.38),size:12,k:2,rot:visualClock},q);
 }else if(['blast','meteor','fireworks','sigArc'].includes(kind)){
  push({type:'shock',x:f.x,y:f.y,vx:0,vy:0,life:.42,size:clamp((f.r||70)*1.4,52,180),k:1,rot:visualClock},q);
 }
}
function finisher(kind,p,q){
 if(!p)return;bloom=.7;
 burstAt(p.x,p.y,kind%3,q,17,27,kind%2?'star':'glyph');
 push({type:'crown',x:p.x,y:p.y,vx:0,vy:0,life:1.25,size:180,k:kind%3,rot:kind*.4},q);
}
function finisherPulse(kind,p,q){
 if(!p||q==='lite')return;
 if((kind===1||kind===5||kind===8)&&Math.floor(visualClock*11)%2===0){
  burstAt(p.x,p.y,kind%3,q,5,12,'glint');
 }
}
function polygon(ctx,points,outer,inner,angle){
 ctx.beginPath();
 for(let i=0;i<2*points;i++){let a=angle+i*Math.PI/points,r=i%2?inner:outer;
  if(!i)ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r);else ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);
 }
 ctx.closePath();
}
function line(ctx,x1,y1,x2,y2){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();}
function drawWorld(ctx,cam,g,q){
 if(!g||!g.player)return;
 ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';ctx.lineJoin='round';
 const limit=q==='high'?174:q==='lite'?42:100,first=max(0,shots.length-limit);
 for(let i=first;i<shots.length;i++){
  const s=shots[i],t=clamp(s.life/s.max,0,1),u=1-t,x=s.x-cam.x,y=s.y-cam.y,theme=color(s.k);
  if(x<-520||x>1800||y<-520||y>1200)continue;
  ctx.save();ctx.translate(x,y);ctx.rotate(s.rot||0);
  if(s.type==='wire'){
   const dx=s.x2-s.x,dy=s.y2-s.y,dist=Math.hypot(dx,dy);
   if(dist>1){
    ctx.rotate(Math.atan2(dy,dx));
    ctx.globalAlpha=t*.32;ctx.lineWidth=s.size*1.2;ctx.strokeStyle=theme.main;line(ctx,0,0,dist,0);
    ctx.globalAlpha=t*.93;ctx.lineWidth=2.2;ctx.strokeStyle=theme.white;line(ctx,0,0,dist,0);
    for(let k=1;k<4;k++){
     const xx=dist*k/4,offset=Math.sin(visualClock*35+k*5)*9;
     ctx.globalAlpha=t*.5;ctx.strokeStyle=k%2?theme.accent:theme.main;ctx.lineWidth=2;
     ctx.beginPath();ctx.moveTo(xx-24,0);ctx.lineTo(xx,offset);ctx.lineTo(xx+25,0);ctx.stroke();
    }
   }
  }else if(s.type==='shock'||s.type==='halo'||s.type==='crown'){
   const radius=s.size*(s.type==='shock'?.15+u*.86:s.type==='crown'?.55+u*.2:.50+u*.44);
   ctx.globalAlpha=t*(s.type==='crown'?.53:.68);
   ctx.lineWidth=s.type==='crown'?3:4.5*t;ctx.strokeStyle=s.type==='crown'?theme.main:theme.accent;
   ctx.beginPath();ctx.arc(0,0,radius,0,TAU);ctx.stroke();
   ctx.lineWidth=1.4;ctx.strokeStyle=theme.white;ctx.globalAlpha=t*.5;
   ctx.beginPath();ctx.arc(0,0,radius*.91,0,TAU);ctx.stroke();
   const n=s.type==='halo'?16:s.type==='crown'?12:8;
   ctx.rotate(visualClock*(s.type==='halo'?.17:.47));
   for(let k=0;k<n;k++){
    const a=TAU*k/n;
    ctx.globalAlpha=t*(k%3===0?.74:.4);ctx.lineWidth=k%4===0?3:1.2;ctx.strokeStyle=k%2?theme.main:theme.white;
    line(ctx,Math.cos(a)*radius*.93,Math.sin(a)*radius*.93,Math.cos(a)*radius*(k%4===0?1.18:1.08),Math.sin(a)*radius*(k%4===0?1.18:1.08));
   }
   if(s.type==='halo'){
    ctx.globalAlpha=.5*t;ctx.strokeStyle=theme.white;ctx.lineWidth=2;
    polygon(ctx,8,radius*.87,radius*.7,visualClock*.22);ctx.stroke();
   }
  }else if(s.type==='rift'){
   ctx.globalAlpha=t*.7;ctx.lineWidth=9*t;ctx.strokeStyle=theme.accent;
   ctx.beginPath();ctx.arc(0,0,s.size*.6+u*35,-1.7,1.1);ctx.stroke();
   ctx.globalAlpha=t;ctx.lineWidth=2.4;ctx.strokeStyle=theme.white;
   ctx.beginPath();ctx.arc(0,0,s.size*.6+u*35,-1.7,1.1);ctx.stroke();
   for(let k=0;k<3;k++){ctx.globalAlpha=t*.5;ctx.lineWidth=2;ctx.strokeStyle=theme.main;line(ctx,-s.size*.53,k*18-18,s.size*.48,k*14-22);}
  }else{
   ctx.globalAlpha=t*.92;
   ctx.fillStyle=s.type==='glyph'?theme.accent:theme.white;
   if(s.type==='star'){polygon(ctx,4,s.size*(.6+u*.6),max(1,s.size*.12),visualClock*2);ctx.fill();}
   else if(s.type==='glyph'){
    ctx.strokeStyle=theme.main;ctx.lineWidth=2*t;ctx.strokeRect(-s.size/2,-s.size/2,s.size,s.size);
    line(ctx,-s.size,-s.size,s.size,s.size);line(ctx,s.size,-s.size,-s.size,s.size);
   }else{
    ctx.lineWidth=2.4*t;ctx.strokeStyle=theme.white;
    line(ctx,-s.size*.9,0,s.size*.9,0);line(ctx,0,-s.size*.9,0,s.size*.9);
    ctx.fillRect(-1.6,-1.6,3.2,3.2);
   }
  }
  ctx.restore();
 }
 // A rotating aura, always centred on the real player, never on the screen.
 if(g.jackpotTime>0){
  const k=clamp(g.jackpotType|0,0,2),theme=color(k),p=g.player,x=p.x-cam.x,y=p.y-cam.y;
  ctx.save();ctx.translate(x,y);
  const beat=1+.07*Math.sin(visualClock*8.5);
  for(let layer=0;layer<(q==='lite'?2:4);layer++){
   const r=(82+layer*18)*beat,a=visualClock*(layer%2?-.85:1.0)+layer*.8;
   ctx.strokeStyle=layer%2?theme.accent:theme.main;ctx.lineWidth=layer%2?2.1:3.3;
   ctx.globalAlpha=(.42-layer*.045);
   ctx.beginPath();ctx.arc(0,0,r,a,a+Math.PI*(layer%2?.75:1.15));ctx.stroke();
  }
  if(q!=='lite'){
   ctx.globalAlpha=.24;ctx.strokeStyle=theme.white;ctx.lineWidth=1.2;
   polygon(ctx,k===1?8:k===2?6:10,128*beat,110*beat,visualClock*(k===2?-0.42:.31));ctx.stroke();
  }
  ctx.restore();
 }
 ctx.restore();
}
function drawScreen(ctx,W,H,g,q,bands){
 if(!g||g.jackpotTime<=0)return;
 const k=clamp(g.jackpotType|0,0,2),theme=color(k),time=g.jackpotTime,dur=13,ratio=clamp(time/dur,0,1);
 const bass=clamp(bands?.bass||0,0,1),high=clamp(bands?.high||0,0,1);
 const wave=Math.sin(visualClock*(k===1?8:11)),pulse=.75+.2*wave+bass*.25;
 ctx.save();ctx.globalCompositeOperation='source-over';
 // Side rails only: preserve the playfield and enemy hitbox visibility.
 const gradL=ctx.createLinearGradient(0,0,148,0);
 gradL.addColorStop(0,'rgba('+theme.rgb.join(',')+',.14)');gradL.addColorStop(1,'rgba('+theme.rgb.join(',')+',0)');
 ctx.fillStyle=gradL;ctx.fillRect(0,0,148,H);
 const gradR=ctx.createLinearGradient(W,0,W-148,0);
 gradR.addColorStop(0,'rgba('+theme.rgb.join(',')+',.14)');gradR.addColorStop(1,'rgba('+theme.rgb.join(',')+',0)');
 ctx.fillStyle=gradR;ctx.fillRect(W-148,0,148,H);
 ctx.globalCompositeOperation='lighter';ctx.lineJoin='round';
 // Four corner crests + rhythmic animated side etching.
 const edge=k===2?theme.accent:theme.main;
 ctx.strokeStyle=edge;ctx.lineWidth=2;
 const inset=13,l=80;
 for(let side=0;side<2;side++){
  const x=side?W-inset:inset,sign=side?-1:1;
  for(let vert=0;vert<2;vert++){
   const y=vert?H-inset:inset,vy=vert?-1:1;
   ctx.globalAlpha=.55*pulse;ctx.beginPath();ctx.moveTo(x+sign*l,y);ctx.lineTo(x,y);ctx.lineTo(x,y+vy*l);ctx.stroke();
   ctx.globalAlpha=.2*pulse;ctx.beginPath();ctx.moveTo(x+sign*(l+8),y+vy*9);ctx.lineTo(x+sign*9,y+vy*9);ctx.lineTo(x+sign*9,y+vy*(l+8));ctx.stroke();
  }
 }
 // Crown above the game, occupying a slim strip along the border.
 const cx=W*.5,cy=32;
 ctx.globalAlpha=.25;ctx.fillStyle='#090a16';ctx.fillRect(cx-260,9,520,46);
 ctx.strokeStyle=theme.main;ctx.lineWidth=1.6;ctx.globalAlpha=.56;ctx.strokeRect(cx-262,8,524,48);
 ctx.fillStyle=theme.white;ctx.textAlign='center';ctx.globalAlpha=.95;
 ctx.font='900 17px ui-monospace,Consolas,monospace';ctx.fillText('✦  JACKPOT MODE  ✦',cx,27);
 ctx.font='800 10px ui-monospace,Consolas,monospace';ctx.fillStyle=theme.accent;ctx.fillText(theme.label+'  //  '+theme.line,cx,44);
 // Progress jewels. Their removal is the countdown; no numerical duplication of HUD.
 const seg=24,unit=468/seg;
 for(let i=0;i<seg;i++){
  const x=cx-234+i*unit;
  ctx.globalAlpha=i/seg<ratio?.70:.13;
  ctx.fillStyle=i%5===0?theme.white:theme.main;
  ctx.fillRect(x,59,unit-4,3.2);
 }
 // Side inscriptions slide subtly and avoid the player at centre.
 ctx.textAlign='center';ctx.save();ctx.translate(32,H*.50);ctx.rotate(-Math.PI/2);
 ctx.globalAlpha=.48;ctx.fillStyle=theme.accent;ctx.font='800 10px ui-monospace,Consolas,monospace';
 ctx.fillText(k===0?'TWIN SIGNAL CROSSOVER':k===1?'WHITE NOVA RADIANCE':'BLACK TRACE ERROR',0,0);
 ctx.restore();
 ctx.save();ctx.translate(W-32,H*.50);ctx.rotate(Math.PI/2);
 ctx.fillText('JACKPOTØ31 / RUU//OVERRUN',0,0);ctx.restore();
 // Distinct additional motif along the outer edges.
 if(q!=='lite'){
  const count=q==='high'?30:18;
  for(let i=0;i<count;i++){
   const at=visualClock*.75+i*2.399,dist=i%2?92:49,yy=88+i*(H-176)/count;
   const xx=i%2?W-48:48;
   ctx.save();ctx.translate(xx+Math.sin(at)*10,yy);ctx.rotate(at*(k===2?-2:1));
   ctx.globalAlpha=.18+.18*(.5+.5*Math.sin(at*3));
   ctx.strokeStyle=i%3===0?theme.accent:theme.main;ctx.lineWidth=1.6;
   if(k===1){polygon(ctx,4,11+high*5,2,0);ctx.stroke();}
   else if(k===0){line(ctx,-dist*.3,0,dist*.3,0);line(ctx,0,-7,0,7);}
   else{ctx.strokeRect(-12,-2,24,4);line(ctx,-7,-10,7,10);}
   ctx.restore();
  }
 }
 // Large 'signature stamp' flashes at entry, but transparent and corner-only.
 if(bloom>0){
  const alpha=clamp(bloom/1.4,0,1)*.6;
  ctx.globalAlpha=alpha;ctx.fillStyle=theme.main;ctx.font='900 25px ui-monospace,Consolas,monospace';
  ctx.textAlign='left';ctx.fillText(k===0?'DUAL SIGNAL':k===1?'WHITE POP':'BLACK TRACE',35,H-78);
  ctx.font='700 11px ui-monospace,Consolas,monospace';ctx.fillStyle=theme.white;
  ctx.fillText('ABSOLUTE INVULNERABILITY',35,H-58);
 }
 ctx.restore();
}
const soundPresets={
 shoot:{d:.085,f:950,end:430,tone:.44,noise:.18,sub:.08,metal:.16,gain:.105,bright:.72},
 hit:{d:.103,f:590,end:95,tone:.34,noise:.42,sub:.29,metal:.12,gain:.103,bright:.72},
 kill:{d:.20,f:340,end:70,tone:.32,noise:.36,sub:.48,metal:.2,gain:.13,bright:.58},
 gem:{d:.19,f:930,end:1360,tone:.53,noise:.035,sub:0,metal:.51,gain:.11,bright:.81},
 dash:{d:.29,f:460,end:85,tone:.18,noise:.65,sub:.28,metal:.16,gain:.15,bright:.4},
 hurt:{d:.30,f:150,end:36,tone:.26,noise:.48,sub:.64,metal:.03,gain:.22,bright:.32},
 bolt:{d:.16,f:1800,end:210,tone:.50,noise:.47,sub:.06,metal:.41,gain:.16,bright:.85},
 boom:{d:.39,f:160,end:35,tone:.12,noise:.53,sub:.85,metal:.12,gain:.17,bright:.34},
 laser:{d:.35,f:980,end:125,tone:.43,noise:.31,sub:.45,metal:.38,gain:.17,bright:.62},
 frost:{d:.29,f:1700,end:610,tone:.45,noise:.09,sub:.10,metal:.60,gain:.14,bright:.84},
 rare:{d:.48,f:640,end:1450,tone:.64,noise:.05,sub:.03,metal:.47,gain:.15,bright:.81},
 level:{d:.58,f:510,end:1180,tone:.63,noise:.07,sub:.12,metal:.43,gain:.15,bright:.76},
 boss:{d:.68,f:128,end:48,tone:.31,noise:.48,sub:.68,metal:.18,gain:.18,bright:.34},
 chorus:{d:.77,f:420,end:1160,tone:.53,noise:.14,sub:.32,metal:.5,gain:.17,bright:.72},
 jackpotDuo:{d:.83,f:580,end:1740,tone:.63,noise:.20,sub:.50,metal:.64,gain:.17,bright:.75},
 jackpotWhite:{d:.91,f:790,end:2370,tone:.69,noise:.11,sub:.27,metal:.76,gain:.17,bright:.85},
 jackpotBlack:{d:.91,f:335,end:72,tone:.50,noise:.40,sub:.77,metal:.56,gain:.18,bright:.56},
 slash:{d:.25,f:870,end:130,tone:.39,noise:.49,sub:.19,metal:.34,gain:.16,bright:.68},
 pop:{d:.29,f:530,end:1280,tone:.53,noise:.29,sub:.28,metal:.62,gain:.16,bright:.79},
 death:{d:1.28,f:238,end:29,tone:.30,noise:.40,sub:.91,metal:.32,gain:.19,bright:.44},
 deathEcho:{d:.86,f:1450,end:72,tone:.40,noise:.36,sub:.41,metal:.50,gain:.11,bright:.67},
 bossBreak:{d:1.27,f:340,end:39,tone:.44,noise:.56,sub:.85,metal:.3,gain:.20,bright:.53},
 comboBig:{d:.69,f:750,end:1660,tone:.63,noise:.10,sub:.23,metal:.75,gain:.13,bright:.81},
 select:{d:.18,f:610,end:960,tone:.60,noise:.07,sub:0,metal:.46,gain:.12,bright:.82}
};
const soundAliases={
 shoot:'shoot',hit:'hit',kill:'kill',gem:'gem',dash:'dash',hurt:'hurt',
 shield:'pop',bolt:'bolt',nova:'boom',sonic:'boom',prism:'frost',
 shard:'slash',elite:'boss',drive:'chorus',chest:'rare',satellite:'laser',
 rift:'slash',fireworks:'boom',cross:'laser',signature:'chorus',
 ultimatePulse:'laser',combo:'rare',reroll:'select',mythic:'rare',
 meteor:'boom',rail:'laser',frost:'frost',well:'boom',missile:'slash',
 explosion:'boom',rare:'rare',start:'chorus',levelup:'level',select:'select',
 evolve:'chorus',boss:'boss',bossDown:'boom',victory:'chorus',
 defeat:'boss',jackpot:'jackpotDuo',death:'death',deathEcho:'deathEcho',bossBreak:'bossBreak',comboBig:'comboBig'
};
const samples=new WeakMap();let soundTick=0,soundLive=0;
function buildSample(ac,key){
 const data=soundPresets[key];if(!data)return null;
 const rate=ac.sampleRate||44100,frames=Math.max(128,Math.ceil(data.d*rate));
 const buffer=ac.createBuffer(2,frames,rate);
 const ch=[buffer.getChannelData(0),buffer.getChannelData(1)];
 for(let c=0;c<2;c++){
  const target=ch[c];let phase=0,subPhase=0,ringPhase=0,lp=0;
  let seed=(1793+c*461+key.length*8397)|0;
  for(let i=0;i<frames;i++){
   const u=i/frames,sec=i/rate;
   const freq=data.f*Math.pow(data.end/data.f,u);
   phase+=TAU*freq/rate;
   subPhase+=TAU*freq*.48/rate;
   ringPhase+=TAU*freq*2.413/rate;
   seed=(Math.imul(seed,1664525)+1013904223)|0;
   const white=((seed>>>0)/2147483648-1);
   lp+=((.06+data.bright*.34)*(white-lp));
   const filtered=white-lp*.9;
   const transient=Math.exp(-u*17);
   const harmonic=Math.sin(phase+Math.sin(ringPhase)*(.27+data.metal*.47))*.73+Math.sin(phase*1.99)*.22;
   const metallic=Math.sin(ringPhase)*Math.exp(-u*6.5);
   const bass=Math.sin(subPhase)*Math.exp(-u*5.8);
   const env=Math.min(1,sec/.0035)*Math.pow(Math.max(0,1-u),.9)*Math.exp(-u*3.7);
   let v=(harmonic*data.tone+metallic*data.metal+bass*data.sub+filtered*data.noise*(.35+.65*transient))*env;
   if(key==='jackpotBlack')v+=.2*Math.sin(phase*.25)*env;
   target[i]=Math.tanh(v*1.04)*.80;
  }
 }
 return buffer;
}
function playSound(name,engine,kind,active){
 if(!engine||!engine.ac||engine.ac.state!=='running')return false;
 if(!Object.prototype.hasOwnProperty.call(soundAliases,name))return false;
 const ac=engine.ac,output=engine.gain;if(!output||typeof ac.createBufferSource!=='function')return false;
 let key=soundAliases[name],k=clamp(kind|0,0,2);
 if(name==='jackpot')key=['jackpotDuo','jackpotWhite','jackpotBlack'][k];
 if(name==='bolt'&&active)key=k===0?'laser':k===1?'pop':'slash';
 const major=['jackpot','boss','bossDown','signature','mythic','levelup','victory','death','deathEcho','bossBreak','comboBig'].includes(name);
 if(soundLive>(major?20:15))return true;
 try{
  let cache=samples.get(ac);if(!cache){cache=new Map();samples.set(ac,cache);}
  if(!cache.has(key))cache.set(key,buildSample(ac,key));
  const now=ac.currentTime,volume=soundPresets[key].gain*(major?2.2:3.3);
  const play=(preset,delay=0,mult=1,rate=1,pan=0)=>{
   if(soundLive>23)return;
   if(!cache.has(preset))cache.set(preset,buildSample(ac,preset));
   const buffer=cache.get(preset);if(!buffer)return;
   const src=ac.createBufferSource();src.buffer=buffer;src.playbackRate.value=rate;
   const gain=ac.createGain();gain.gain.value=volume*mult;
   let final=gain;
   if(typeof ac.createStereoPanner==='function'){const p=ac.createStereoPanner();p.pan.value=clamp(pan,-.7,.7);gain.connect(p);final=p;}
   src.connect(gain);final.connect(output);soundLive++;
   src.onended=()=>{soundLive=Math.max(0,soundLive-1);try{src.disconnect();gain.disconnect();if(final!==gain)final.disconnect()}catch(e){}};
   src.start(now+delay);
  };
  const alter=1+Math.sin(soundTick++*11.78)*.035;
  if(name==='bossBreak'){
    play('bossBreak',0,1.2,.9,-.1);play('boom',.06,.8,.75,.2);play('deathEcho',.28,.39,1.1,-.25);
  }else if(name==='comboBig'){
    play('comboBig',0,1.0,1,-.15);play('rare',.12,.58,1.17,.18);
  }else if(name==='death'){
    play('death',0,1.14,.96,0);
    play('boom',.045,.57,.69,-.25);
    play('slash',.22,.45,.78,.3);
  }else if(name==='deathEcho'){
    play('deathEcho',0,.85,.72,0);
    play('frost',.21,.28,.43,.22);
  }else if(name==='jackpot'){
    play(key,0,1.2,1,0);
    play('boom',.04,.94,k===2?.68:.89,-.23);
    play(k===0?'laser':k===1?'rare':'slash',.20,.80,k===1?1.23:.92,.24);
    play(k===0?'jackpotDuo':k===1?'jackpotWhite':'jackpotBlack',.45,.72,1.23,-.18);
  }else if(['signature','drive','victory','levelup','mythic','boss'].includes(name)){
    play(key,0,1,alter,-.13);
    play(name==='boss'?'boom':name==='levelup'?'rare':'pop',.14,.52,1.12,.24);
  }else if(name==='rail'||name==='satellite'){
    play(key,0,1.05,alter,-.15);play('boom',.085,.38,.8,.16);
  }else{
    play(key,0,1,alter,Math.sin(soundTick*1.2)*.18);
  }
  return true;
 }catch(err){return false;}
}
window.RUU_PREMIUM={reset,update,jackpotStart,jackpotPulse,impact,weapon,finisher,finisherPulse,drawWorld,drawScreen,playSound};
})();