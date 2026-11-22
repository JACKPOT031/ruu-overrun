/* RUU//OVERRUN v1.17.0 — DEVORA MUTATION / PHASE III INTEGRATION
   Enemy variants, readable danger telegraphs, boss phase II, bounded hit FX.
   No new assets. All gameplay effects are independent of visual quality.
*/
(()=>{
'use strict';
const TAU=Math.PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const COLOR={frenzy:'#ff667d',volatile:'#ffb45d',fracture:'#b58aff',bulwark:'#73f8df',boss:'#ff578f'};
const LABEL={frenzy:'FRENZY',volatile:'OVERLOAD',fracture:'FRACTURE',bulwark:'BULWARK'};
let sparks=[],rings=[],screenImpact=0,screenColor='#f9b679',pulseClock=0;
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const visible=(x,y,cam,W,H,margin=120)=>x-cam.x>-margin&&x-cam.x<W+margin&&y-cam.y>-margin&&y-cam.y<H+margin;

function reset(){sparks=[];rings=[];screenImpact=0;pulseClock=0}
function tick(dt){
  pulseClock+=dt;screenImpact=Math.max(0,screenImpact-dt*2.7);
  for(let i=sparks.length-1;i>=0;i--){const s=sparks[i];s.life-=dt;s.x+=s.vx*dt;s.y+=s.vy*dt;s.vx*=Math.exp(-2.8*dt);s.vy*=Math.exp(-2.8*dt);if(s.life<=0)sparks.splice(i,1)}
  for(let i=rings.length-1;i>=0;i--){rings[i].life-=dt;if(rings[i].life<=0)rings.splice(i,1)}
}
function spark(x,y,color,n,power,q){
  const count=q==='lite'?Math.ceil(n*.26):q==='high'?n:Math.ceil(n*.52);
  for(let i=0;i<count;i++){
    if(sparks.length>=110)sparks.shift();
    const a=Math.random()*TAU,v=(.4+Math.random()*.6)*power,life=.22+Math.random()*.34;
    sparks.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life,max:life,color,size:1.2+Math.random()*2.4});
  }
}
function ring(x,y,r,color,life=.42){
  if(rings.length>=28)rings.shift();
  rings.push({x,y,r,color,life,max:life});
}
function shock(x,y,color,intensity,q){
  spark(x,y,color,Math.round(8+intensity*15),90+intensity*150,q);
  ring(x,y,35+intensity*95,color);
  screenImpact=Math.max(screenImpact,Math.min(.65,intensity*.33));
  screenColor=color;
}
function chooseVariant(kind,r){
  if(kind==='runner')return r<.53?'frenzy':r<.81?'fracture':'volatile';
  if(kind==='brute')return r<.68?'bulwark':r<.86?'volatile':'frenzy';
  if(kind==='wisp')return r<.44?'fracture':r<.78?'volatile':'frenzy';
  return r<.50?'volatile':r<.76?'bulwark':'frenzy';
}
function decorate(e,g,random=Math.random){
  if(!e||!g||g.time<24||e.elite||e.mutationChild||e.kind==='boss'||e.kind==='final')return e;
  let active=0;for(const other of g.enemies)if(other.hp>0&&other.mutation)active++;
  if(active>=14)return e;
  const chance=clamp(.09+Math.max(0,g.time-24)*.00245,.09,g.mode==='endless'?.34:.28);
  if(random()>=chance)return e;
  const type=chooseVariant(e.kind,random());
  e.mutation={type,cd:1.5+random()*2,wind:0,windMax:.88,dash:0,
    targetX:0,targetY:0,dx:0,dy:0,guard:0,stun:0};
  const m=e.mutation;
  if(type==='frenzy'){e.speed*=1.16;e.maxHp*=1.14;e.hp=e.maxHp;e.dmg=Math.ceil(e.dmg*1.14)}
  if(type==='volatile'){e.maxHp*=.94;e.hp=e.maxHp;e.speed*=.94}
  if(type==='fracture'){e.maxHp*=1.22;e.hp=e.maxHp}
  if(type==='bulwark'){e.maxHp*=1.38;e.hp=e.maxHp;e.speed*=.85;e.dmg=Math.ceil(e.dmg*1.10);m.guard=e.maxHp*.22}
  e.xp=Math.ceil(e.xp*1.30);
  return e;
}
function bossSpawn(e){
  if(!e)return;
  const mult=e.kind==='final'?1.13:1.10;
  e.maxHp*=mult;e.hp=e.maxHp;
  e.bossMutation={phase:1,cd:2.4,wind:0,windMax:.97,targetX:0,targetY:0};
}
function modifyDamage(e,dmg,g,api,q){
  const m=e.mutation;
  if(!m||m.type!=='bulwark'||m.guard<=0)return dmg;
  m.guard-=dmg;
  if(m.guard<=0){
    m.guard=0;m.stun=1.05;
    ring(e.x,e.y,e.r*2.2,'#a2ffe9',.5);
    spark(e.x,e.y,'#a2ffe9',26,215,q);
    if(api)api.sfx('shield');
    if(api)api.text(e.x,e.y-e.r-23,'ARMOR BREAK','#b8fff1',16);
    if(g)g.shake=Math.max(g.shake,5);
  }
  return dmg*.72;
}
function onEnemyKilled(e,g,api,q){
  if(!e||!g)return;
  const m=e.mutation;
  if(m?.type==='fracture'&&g.enemies.length<166&&api&&api.spawn){
    const count=g.enemies.length<146?2:1;
    for(let i=0;i<count;i++){
      const a=i*TAU/count+Math.random()*.24,child=api.spawn('wisp',e.x+Math.cos(a)*29,e.y+Math.sin(a)*29);
      if(!child)continue;
      child.mutationChild=true;child.mutation=null;
      child.maxHp*=.72;child.hp=child.maxHp;child.speed*=1.23;
      child.xp=Math.max(2,Math.round(child.xp*.55));
      child.col='#c5a7ff';child.shoot=Math.max(child.shoot,.7);
    }
  }
  if(m){g.score+=130;g.impactFreeze=Math.max(g.impactFreeze||0,.045);shock(e.x,e.y,COLOR[m.type],1.15,q)}
  else if(e.elite){g.impactFreeze=Math.max(g.impactFreeze||0,.075);shock(e.x,e.y,'#ffe2ae',1.3,q)}
  else if(e.kind!=='boss'&&e.kind!=='final'&&g.kills%5===0){shock(e.x,e.y,e.col,.42,q)}
  if(m?.type==='volatile'){
    ring(e.x,e.y,145,COLOR.volatile,.58);
    spark(e.x,e.y,'#ffe0a6',32,255,q);
    if(api)api.sfx('fireworks');
  }
  if(m?.type==='fracture'&&api)api.text(e.x,e.y-42,'FRACTURE','#d5b7ff',15);
  if(m?.type==='bulwark'&&api)api.text(e.x,e.y-42,'SHATTERED','#b3fff0',15);
}
function onPlayerHit(damage,g){
  if(!(damage>0))return;
  screenColor='#ff5574';screenImpact=Math.max(screenImpact,.48);
}
function fireFan(e,g,api,q){
  const b=e.bossMutation;
  const a=Math.atan2(b.targetY-e.y,b.targetX-e.x),count=e.kind==='final'?7:5;
  const spread=e.kind==='final'?.68:.55,velocity=e.kind==='final'?305:262;
  for(let i=0;i<count&&g.ebullets.length<130;i++){
    const dir=a+(i-(count-1)/2)*spread/(count-1);
    g.ebullets.push({x:e.x+Math.cos(dir)*e.r*.72,y:e.y+Math.sin(dir)*e.r*.72,
      vx:Math.cos(dir)*velocity,vy:Math.sin(dir)*velocity,
      r:e.kind==='final'?8:7,ttl:3.8,col:'#ff728d',damage:e.kind==='final'?12:10});
  }
  if(api){api.wave(e.x,e.y,e.r*2,'#ff789a');api.burst(e.x,e.y,'#ff8fa9',22,180);api.sfx('boss')}
  shock(e.x,e.y,'#ff718e',1.5,q);
}
function step(e,dt,g,api,q){
  if(!e||e.hp<=0||!g)return;
  const p=g.player,d=distance(e,p);
  const b=e.bossMutation;
  if(b){
    if(b.phase===1&&e.hp/e.maxHp<=.55){
      b.phase=2;b.cd=Math.max(b.cd,1.2);
      e.speed*=1.10;e.shoot=Math.min(e.shoot,1.9);
      if(api){api.wave(e.x,e.y,220,'#ff6f96');api.burst(e.x,e.y,'#ff729b',35,220);api.sfx('boss');api.text(e.x,e.y-e.r-24,'PHASE II','#ffc0d4',19);api.toast(e.kind==='final'?'NULL EMPEROR // SECOND FORM':'DEVORA // MUTATION PHASE',true)}
      shock(e.x,e.y,'#ff7095',1.7,q);
    }
    if(b.phase!==2)return;
    if(b.wind>0){
      b.wind-=dt;
      if(b.wind<=0){b.wind=0;fireFan(e,g,api,q);b.cd=e.kind==='final'?3.25:4.1}
    }else{
      b.cd-=dt;
      if(b.cd<=0&&d<780){
        b.wind=b.windMax;b.targetX=p.x;b.targetY=p.y;
        if(api)api.sfx('shield');
      }
    }
    return;
  }
  const m=e.mutation;if(!m)return;
  m.stun=Math.max(0,m.stun-dt);
  if(m.stun>0){e.slow=Math.max(e.slow,m.stun);return}
  if(m.type==='frenzy'){
    if(m.wind>0){
      m.wind-=dt;
      if(m.wind<=0){
        m.wind=0;m.dash=.39;
        const d2=Math.hypot(m.targetX-e.x,m.targetY-e.y)||1;
        m.dx=(m.targetX-e.x)/d2;m.dy=(m.targetY-e.y)/d2;
        if(api)api.sfx('dash');
        shock(e.x,e.y,COLOR.frenzy,.55,q);
      }
    }else if(m.dash>0){
      m.dash=Math.max(0,m.dash-dt);
      e.x+=m.dx*460*dt;e.y+=m.dy*460*dt;
    }else{
      m.cd-=dt;
      if(m.cd<=0&&d>96&&d<375){
        m.targetX=p.x;m.targetY=p.y;m.wind=.82;m.windMax=.82;
        m.cd=3.6+Math.random()*.7;
      }
    }
  }else if(m.type==='volatile'){
    if(m.wind>0){
      m.wind-=dt;
      if(m.wind<=0){
        m.wind=0;e.hp=0;e.selfDetonated=true;
        ring(e.x,e.y,155,COLOR.volatile,.58);
        shock(e.x,e.y,COLOR.volatile,1.65,q);
        if(api){api.wave(e.x,e.y,155,COLOR.volatile);api.burst(e.x,e.y,COLOR.volatile,38,280);api.sfx('explosion')}
        if(d<142+p.r&&api)api.hurt(Math.round(20+Math.min(15,g.time*.085)),e.x,e.y);
      }
    }else if(d<155){
      m.wind=1.02;m.windMax=1.02;
      if(api)api.sfx('shield');
    }
  }
}
function drawTelegraph(ctx,x,y,rad,col,fraction,q){
  const t=clamp(fraction,0,1);
  ctx.save();ctx.globalAlpha=.80;
  ctx.lineWidth=q==='lite'?2.2:3.4;ctx.strokeStyle=col;
  ctx.beginPath();ctx.arc(x,y,rad,0,TAU);ctx.stroke();
  ctx.lineWidth=q==='lite'?2:5;ctx.globalAlpha=.20+.72*t;
  ctx.beginPath();ctx.arc(x,y,rad*.7,-Math.PI/2,-Math.PI/2+TAU*t);ctx.stroke();
  if(q!=='lite'){
    ctx.globalAlpha=.08+.15*t;ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y,rad,0,TAU);ctx.fill();
  }
  ctx.restore();
}
function drawLine(ctx,x,y,toX,toY,color,progress,q){
  const dx=toX-x,dy=toY-y,a=Math.atan2(dy,dx),endX=x+Math.cos(a)*690,endY=y+Math.sin(a)*690;
  ctx.save();ctx.strokeStyle=color;ctx.lineCap='round';
  ctx.lineWidth=q==='lite'?10:18;ctx.globalAlpha=.075+.15*progress;
  ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(endX,endY);ctx.stroke();
  ctx.lineWidth=q==='lite'?2.6:3.8;ctx.globalAlpha=.65+.3*progress;
  ctx.setLineDash([12,9]);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(endX,endY);ctx.stroke();
  ctx.setLineDash([]);ctx.translate(endX,endY);ctx.rotate(a);
  ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(11,0);ctx.lineTo(-12,-8);ctx.lineTo(-12,8);ctx.closePath();ctx.fill();
  ctx.restore();
}
function drawGround(ctx,cam,g,q){
  if(!g)return;
  const W=ctx.canvas.width,H=ctx.canvas.height,sx=W/1200,sy=H/675;
  // World coordinates are drawn in logical 1200x675 units by the host context.
  for(const e of g.enemies){
    if(e.hp<=0||!visible(e.x,e.y,cam,1200,675,160))continue;
    const m=e.mutation,b=e.bossMutation,x=e.x-cam.x,y=e.y-cam.y;
    if(m?.type==='volatile'&&m.wind>0)drawTelegraph(ctx,x,y,142,COLOR.volatile,1-m.wind/m.windMax,q);
    if(m?.type==='frenzy'&&m.wind>0){
      drawLine(ctx,x,y,m.targetX-cam.x,m.targetY-cam.y,COLOR.frenzy,1-m.wind/m.windMax,q);
      drawTelegraph(ctx,x,y,e.r*1.7,COLOR.frenzy,1-m.wind/m.windMax,q);
    }
    if(b?.wind>0){
      drawLine(ctx,x,y,b.targetX-cam.x,b.targetY-cam.y,COLOR.boss,1-b.wind/b.windMax,q);
      drawTelegraph(ctx,x,y,e.r*1.7,COLOR.boss,1-b.wind/b.windMax,q);
    }
  }
}
function drawEnemies(ctx,cam,g,q){
  if(!g)return;
  let drawn=0;
  for(const e of g.enemies){
    if(e.hp<=0||!visible(e.x,e.y,cam,1200,675,100))continue;
    const m=e.mutation,b=e.bossMutation;if(!m&&!b)continue;
    if(++drawn>(q==='lite'?12:28))break;
    const color=m?COLOR[m.type]:b?.phase===3?'#ffc375':COLOR.boss,x=e.x-cam.x,y=e.y-cam.y,t=pulseClock;
    const r=e.r+(m?.type==='bulwark'&&m.guard>0?13:8);
    ctx.save();ctx.globalAlpha=.75;ctx.strokeStyle=color;
    ctx.lineWidth=q==='lite'?1.5:2.5;
    ctx.beginPath();ctx.arc(x,y,r,Math.sin(t*2)*.3,Math.sin(t*2)*.3+Math.PI*1.55);ctx.stroke();
    const label=b?(b.phase===3?'PHASE III':b.phase===2?'PHASE II':'DEVORA'):LABEL[m.type];
    ctx.font='800 10px ui-monospace,Consolas,monospace';ctx.textAlign='center';ctx.textBaseline='middle';
    const yy=y-e.r-(b?37:29);
    const w=ctx.measureText(label).width+15;
    ctx.fillStyle='#090d18d9';ctx.fillRect(x-w/2,yy-10,w,20);
    ctx.strokeStyle=color;ctx.lineWidth=1;ctx.strokeRect(x-w/2,yy-10,w,20);
    ctx.fillStyle=color;ctx.globalAlpha=1;ctx.fillText(label,x,yy);
    if(m?.type==='bulwark'&&m.guard>0){
      ctx.fillStyle='#10231f';ctx.fillRect(x-24,y-e.r-13,48,3);
      ctx.fillStyle=COLOR.bulwark;ctx.fillRect(x-24,y-e.r-13,48*clamp(m.guard/(e.maxHp*.22),0,1),3);
    }
    ctx.restore();
  }
}
function drawWorld(ctx,cam,g,q){
  if(!g)return;
  ctx.save();ctx.globalCompositeOperation='screen';
  let count=0;
  for(const r of rings){
    if(!visible(r.x,r.y,cam,1200,675,220))continue;
    if(++count>(q==='lite'?9:20))break;
    const ratio=1-r.life/r.max,x=r.x-cam.x,y=r.y-cam.y;
    ctx.globalAlpha=(1-ratio)*.85;ctx.strokeStyle=r.color;ctx.lineWidth=(q==='lite'?2:4)*(1-ratio)+1;
    ctx.beginPath();ctx.arc(x,y,r.r*(.2+.95*ratio),0,TAU);ctx.stroke();
  }
  const cap=q==='lite'?35:q==='high'?105:65;
  for(let i=Math.max(0,sparks.length-cap);i<sparks.length;i++){
    const p=sparks[i];if(!visible(p.x,p.y,cam,1200,675,15))continue;
    const a=clamp(p.life/p.max,0,1),x=p.x-cam.x,y=p.y-cam.y;
    ctx.globalAlpha=a;ctx.strokeStyle=p.color;ctx.lineWidth=p.size*a;
    const dx=p.vx*.028,dy=p.vy*.028;
    ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-dx,y-dy);ctx.stroke();
  }
  ctx.restore();
}
function drawScreen(ctx,W,H,q){
  if(screenImpact<=0)return;
  const amount=clamp(screenImpact,0,.65);
  ctx.save();ctx.globalAlpha=amount*(q==='lite'?.14:.27);
  ctx.strokeStyle=screenColor;ctx.lineWidth=q==='lite'?6:12;
  ctx.strokeRect(6,6,W-12,H-12);
  if(q!=='lite'){
    ctx.globalAlpha=amount*.16;
    const grad=ctx.createRadialGradient(W/2,H/2,120,W/2,H/2,Math.max(W,H)*.73);
    grad.addColorStop(0,'#00000000');grad.addColorStop(1,screenColor);
    ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);
  }
  ctx.restore();
}
window.RUU_MUTATION={reset,tick,decorate,bossSpawn,modifyDamage,onEnemyKilled,onPlayerHit,step,drawGround,drawEnemies,drawWorld,drawScreen,
  VERSION:'1.17.0'};
})();
