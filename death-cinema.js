/* RUU//OVERRUN v1.10.0 — SIGNAL LOST CINEMATIC
 * Draws an approximately three-second defeat transition on the existing game canvas.
 * No new media files, no damage or ranking changes, low-cost fixed effect budgets.
 */
(()=>{
'use strict';
const TAU=Math.PI*2, DURATION=3.05, clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
let shards=[],faults=[],started=false,seed=19031;
const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)|0;return(seed>>>0)/4294967296;};
const ease=t=>t*t*(3-2*t);
function start(game,quality){
 started=true;shards=[];faults=[];seed=19031+(game?.kills||0)*17;
 const count=quality==='lite'?20:quality==='high'?76:43;
 for(let i=0;i<count;i++){
   const angle=TAU*random(),radius=14+random()*68,v=75+random()*360;
   shards.push({angle,radius,v,spin:(random()-.5)*4,rotation:random()*TAU,
     size:2.8+random()*13,twinkle:random()*TAU,life:.85+random()*1.85,
     shade:i%5===0?'#fff0de':i%3===0?'#f18eac':'#90dce5'});
 }
 for(let j=0;j<14;j++){
   const a=j*TAU/14+(random()-.5)*.27;
   const bends=Array.from({length:4},(_,i)=>({r:35+i*(27+random()*24),offset:(random()-.5)*.25}));
   faults.push({angle:a,bends,weight:1+random()*2.1});
 }
}
function draw(ctx,W,H,time,quality){
 if(!started)return;
 const t=clamp(time,0,DURATION),u=t/DURATION,cx=W*.5,cy=H*.5;
 ctx.save();
 // The game remains visible under the shock, then slowly fades out.
 const darkness=clamp(ease(clamp((t-.12)/2.55,0,1))*.91,0,.91);
 const vignette=ctx.createRadialGradient(cx,cy,35,cx,cy,Math.max(W,H)*.63);
 vignette.addColorStop(0,'rgba(7,9,20,'+(darkness*.66).toFixed(3)+')');
 vignette.addColorStop(.44,'rgba(6,8,17,'+(darkness*.94).toFixed(3)+')');
 vignette.addColorStop(1,'rgba(2,3,9,'+clamp(darkness+.13,0,.97).toFixed(3)+')');
 ctx.fillStyle=vignette;ctx.fillRect(0,0,W,H);
 // The impact freezes the player in a broken signal flash.
 if(t<.28){
   const a=Math.pow(1-t/.28,2)*.34;
   ctx.fillStyle='rgba(246,249,255,'+a.toFixed(3)+')';ctx.fillRect(0,0,W,H);
 }
 ctx.save();ctx.globalCompositeOperation='lighter';ctx.translate(cx,cy);ctx.lineCap='round';ctx.lineJoin='round';
 const shake=Math.sin(t*75)*Math.exp(-t*6)*4;
 ctx.translate(shake,-shake*.6);
 // Shock rings break into fragments as the hero's signal collapses.
 for(let i=0;i<3;i++){
   const p=clamp((t-i*.14)/(.92+i*.09),0,1);
   if(p<=0||p>=1)continue;
   const r=22+Math.pow(p,.64)*(240+i*72);
   ctx.strokeStyle=i===1?'#f0b2cc':i===2?'#b6d9ff':'#fff1da';
   ctx.globalAlpha=(1-p)*(.66-i*.13);
   ctx.lineWidth=(i===0?4:2.3)*(1-p)+.7;
   for(let j=0;j<7;j++){
     const startA=(j/7)*TAU+t*.35;
     ctx.beginPath();ctx.arc(0,0,r,startA,startA+.36+j%3*.04);ctx.stroke();
   }
 }
 // Cracks radiate from the player, with a few glassy offset branches.
 const f=clamp((t-.07)/.65,0,1);
 if(f>0){
  ctx.globalAlpha=Math.pow(1-clamp((t-1.1)/1.25,0,1),1.7)*.55;
  faults.forEach((fault,index)=>{
   ctx.lineWidth=fault.weight;ctx.strokeStyle=index%3===0?'#e9fbff':'#eaa6b6';
   let px=0,py=0;ctx.beginPath();ctx.moveTo(px,py);
   fault.bends.forEach((b,i)=>{
     const r=b.r*ease(f)*2.1,ang=fault.angle+b.offset*i;
     const x=Math.cos(ang)*r,y=Math.sin(ang)*r;
     if(i===0){ctx.lineTo(x,y);}else{ctx.lineTo(x,y);}
     px=x;py=y;
   });ctx.stroke();
   if(index%3===0){
    const rr=fault.bends[2].r*ease(f)*2.1,ang=fault.angle+1.0;
    ctx.beginPath();ctx.moveTo(px*.67,py*.67);
    ctx.lineTo(px*.67+Math.cos(ang)*rr*.33,py*.67+Math.sin(ang)*rr*.33);ctx.stroke();
   }
  });
 }
 const count=quality==='lite'?20:quality==='high'?76:43;
 for(let i=0;i<Math.min(count,shards.length);i++){
   const s=shards[i],age=t-.14;if(age<0||age>s.life)continue;
   const p=age/s.life,dist=s.radius+s.v*age*(.35+.65*ease(p));
   const x=Math.cos(s.angle)*dist,y=Math.sin(s.angle)*dist;
   ctx.save();ctx.translate(x,y);ctx.rotate(s.rotation+age*s.spin);
   ctx.fillStyle=s.shade;ctx.globalAlpha=(1-p)*(.64+.2*Math.sin(age*17+s.twinkle));
   const w=s.size*(.44+.66*p);
   ctx.beginPath();ctx.moveTo(0,-w*1.65);ctx.lineTo(w*.62,0);ctx.lineTo(0,w*1.65);ctx.lineTo(-w*.62,0);ctx.closePath();ctx.fill();
   if(quality!=='lite'&&i%4===0){
    ctx.strokeStyle='#fffdf9';ctx.globalAlpha*=(.5+.5*Math.sin(age*23+i));
    ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-w*2.3,0);ctx.lineTo(w*2.3,0);
    ctx.moveTo(0,-w*2.3);ctx.lineTo(0,w*2.3);ctx.stroke();
   }
   ctx.restore();
 }
 // A collapsing, broken halo emphasizes the character's last frame.
 if(t>.25&&t<1.9){
   const p=clamp((t-.25)/1.65,0,1),r=90*(1-p*.73);
   ctx.strokeStyle='#e9d1e7';ctx.lineWidth=2;ctx.globalAlpha=.49*(1-p);
   for(let j=0;j<8;j++){
     const a=j*TAU/8+t*.24;
     ctx.beginPath();ctx.arc(0,0,r,a,a+.37);ctx.stroke();
   }
 }
 ctx.restore();
 // Scanline/interference bands—not a noisy full-screen flash.
 const scan=quality==='lite'?6:quality==='high'?22:13;
 if(t>.25&&t<2.42){
   ctx.globalCompositeOperation='source-over';ctx.fillStyle='#eac4d0';
   for(let j=0;j<scan;j++){
     const a=(j*71+Math.floor(t*25)*23)%Math.max(1,H);
     ctx.globalAlpha=(.013+.012*(j%3))*Math.max(0,1-(t-1.3)*.8);
     ctx.fillRect(0,a,W,quality==='high'?2:1);
   }
 }
 if(t>1.15){
  const a=ease(clamp((t-1.15)/.49,0,1))*(1-ease(clamp((t-2.56)/.42,0,1)));
  ctx.globalAlpha=a;ctx.textAlign='center';
  ctx.fillStyle='#f3d9e2';ctx.font='900 17px ui-monospace,Consolas,monospace';
  ctx.fillText('JACKPOTØ31  /  CONNECTION TERMINATED',cx,cy-107);
  ctx.shadowColor='#f879a9';ctx.shadowBlur=23;
  ctx.fillStyle='#fff5f3';ctx.font='900 68px ui-monospace,Consolas,monospace';
  ctx.fillText('SIGNAL LOST',cx,cy-15);
  ctx.shadowBlur=0;
  ctx.fillStyle='#cbb5c4';ctx.font='700 17px system-ui,sans-serif';
  ctx.fillText('接続が、途切れた。',cx,cy+32);
  ctx.fillStyle='#f4b7d0';ctx.font='700 11px ui-monospace,Consolas,monospace';
  ctx.fillText('RUU // NO RESPONSE',cx,cy+70);
  if(t>1.67&&t<2.5){
   ctx.globalAlpha=a*.68;ctx.fillStyle='#a7a6b9';ctx.font='700 10px system-ui,sans-serif';
   ctx.fillText('ENTER / タップでスキップ',cx,H-42);
  }
 }
 if(t>2.75){
   ctx.globalAlpha=ease(clamp((t-2.75)/.30,0,1));ctx.fillStyle='#060712';ctx.fillRect(0,0,W,H);
 }
 ctx.restore();
}
window.RUU_DEATH={DURATION,start,draw};
})();