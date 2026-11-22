/* RUU//OVERRUN 1.7.0 — SPECTACLE ENGINE
 * Purely visual effects: no changes to collision, damage, score or ranking.
 * World-coordinate particles, bounded draw budgets, and FX AUTO/HIGH/LITE support.
 */
(function () {
  'use strict';
  var TAU=Math.PI*2, frame=0, clock=0, lastHit=-1, particles=[];
  var palette={
    ice:['#8deaff','#e8ffff','#5697ff'],
    pink:['#ff70cb','#fff0fa','#a66aff'],
    fire:['#ff815b','#fff1b1','#ffcf63'],
    gold:['#ffd36b','#fffbe3','#ff8c6c'],
    violet:['#bd81ff','#fce9ff','#805eff'],
    mint:['#66fff0','#f4fff9','#3c8eff'],
    ink:['#d5d8ed','#ffffff','#8278b9']
  };
  var special=[
    ['#7cffff','#f58cff','#ffcc84'],
    ['#f5fdff','#ffe190','#ffa9fb'],
    ['#ff476e','#edb3ff','#ffb274']
  ];
  function clamp(n,a,b){return Math.min(b,Math.max(a,n));}
  function tier(q){return q==='lite'?0:q==='high'?2:1;}
  function cap(q){return q==='lite'?23:q==='high'?100:58;}
  function colorSet(col){
    var c=(col||'').toLowerCase();
    if(/a8caff|9be8ff|9bddff|b9e9ff|9bcaff/.test(c))return palette.ice;
    if(/ff9|ffb1a9|ffae|ffd09c|ff956f|ffb9b2/.test(c))return palette.fire;
    if(/ffe|ffd|fff1/.test(c))return palette.gold;
    if(/e4b|df8|d2a3|c7|a3ff|bd8/.test(c))return palette.violet;
    if(/f9|ff7|ff6|fc8/.test(c))return palette.pink;
    return palette.mint;
  }
  function push(fx,q){
    if(!fx||!Number.isFinite(fx.x)||!Number.isFinite(fx.y))return;
    if(particles.length>=cap(q))particles.shift();
    fx.t=fx.life;particles.push(fx);
  }
  function nearby(x,y,p){
    return !p || (x-p.x)*(x-p.x)+(y-p.y)*(y-p.y)<950*950;
  }
  function onHit(e,col,damage,q,player){
    if(!e||!nearby(e.x,e.y,player))return;
    var interval=q==='lite'?.115:q==='high'?.028:.058;
    if(clock-lastHit<interval)return;
    lastHit=clock;
    var c=colorSet(col), critical=damage>46, size=clamp((e.r||17)*.95+(critical?13:2),13,48);
    push({type:'hit',x:e.x,y:e.y,col:c,life:critical?.38:.25,angle:frame*2.399,size:size,seed:frame++},q);
    if(critical&&q!=='lite')push({type:'star',x:e.x,y:e.y,col:c,life:.40,size:size*1.5,angle:frame*.91,seed:frame++},q);
  }
  function onKill(e,q){
    if(!e)return;
    var boss=e.kind==='boss'||e.kind==='final',big=boss||e.elite;
    if(!big && q!=='high' && frame++%3!==0)return;
    var c=colorSet(e.col);
    push({type:big?'star':'shatter',x:e.x,y:e.y,col:c,life:big?.82:.44,size:big?100:29,angle:frame*2.399,seed:frame++},q);
    if(big)push({type:'ripple',x:e.x,y:e.y,col:c,life:1.0,size:boss?270:140,angle:0,seed:frame++},q);
  }
  function onWeapon(f,q){
    if(!f)return;
    var k=f.kind||'';
    if(['rail','finisherRay','rift','sigGlitch','sigClaw'].indexOf(k)>=0&&Number.isFinite(f.x2)){
      push({type:'beam',x:f.x,y:f.y,x2:f.x2,y2:f.y2,col:colorSet(f.col),life:Math.min(.59,f.life||.36),size:Math.max(6,f.width||10),angle:frame*.1,seed:frame++},q);
    }else if(['meteor','blast','fireworks','sigArc','ultimateRing','sigGrid','cross'].indexOf(k)>=0){
      var r=clamp(f.r||70,42,190);
      push({type:k==='fireworks'?'star':k==='sigGrid'?'sigil':'ripple',x:f.x,y:f.y,col:colorSet(f.col),life:Math.min(.72,f.life||.47),size:r,angle:frame*.79,seed:frame++},q);
    }
  }
  function onFinisher(index,p,col,q){
    if(!p)return;
    var c=colorSet(col);
    push({type:'sigil',x:p.x,y:p.y,col:c,life:1.65,size:200,angle:index*.68,seed:frame++},q);
    push({type:'ripple',x:p.x,y:p.y,col:c,life:.82,size:340,angle:0,seed:frame++},q);
    if(q!=='lite')push({type:'star',x:p.x,y:p.y,col:c,life:.72,size:115,angle:index,seed:frame++},q);
  }
  function onFinisherPulse(index,p,q){
    if(!p||q==='lite')return;
    if(index===0||index===7){push({type:'sigil',x:p.x,y:p.y,col:palette.mint,life:.36,size:130,angle:clock,seed:frame++},q);}
    else if(index===4){push({type:'ripple',x:p.x,y:p.y,col:palette.violet,life:.36,size:220,angle:0,seed:frame++},q);}
    else if(index===8){push({type:'star',x:p.x,y:p.y,col:palette.ink,life:.35,size:110,angle:clock,seed:frame++},q);}
  }
  function onJackpot(index,p,q){
    if(!p)return;
    var c=special[clamp(index,0,2)]||special[0];
    push({type:'sigil',x:p.x,y:p.y,col:c,life:1.45,size:252,angle:index,seed:frame++},q);
    push({type:'star',x:p.x,y:p.y,col:c,life:1.1,size:190,angle:Math.PI/6,seed:frame++},q);
    push({type:'ripple',x:p.x,y:p.y,col:c,life:1.0,size:440,angle:0,seed:frame++},q);
  }
  function onJackpotPulse(index,p,q){
    if(!p)return;
    if(q==='lite'&&frame++%3!==0)return;
    var c=special[clamp(index,0,2)]||special[0];
    if(index===0){
      push({type:'beam',x:p.x-260,y:p.y-125,x2:p.x+260,y2:p.y+125,col:c,life:.38,size:14,angle:0,seed:frame++},q);
      push({type:'beam',x:p.x-240,y:p.y+125,x2:p.x+240,y2:p.y-125,col:[c[1],c[0],c[2]],life:.38,size:12,angle:0,seed:frame++},q);
    } else if(index===1){
      push({type:'star',x:p.x,y:p.y,col:c,life:.44,size:125,angle:clock*3,seed:frame++},q);
    } else {
      push({type:'shatter',x:p.x,y:p.y,col:c,life:.43,size:125,angle:clock*4,seed:frame++},q);
    }
  }
  function update(dt){
    clock+=dt;
    for(var i=particles.length-1;i>=0;i--){
      particles[i].life-=dt;
      if(particles[i].life<=0)particles.splice(i,1);
    }
  }
  function reset(){particles.length=0;lastHit=-1;clock=0;frame=0;}
  function ring(ctx,r,width,color,alpha){
    ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=width;
    ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.stroke();
  }
  function ray(ctx,a,start,end,width,color,alpha){
    ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=width;
    ctx.beginPath();ctx.moveTo(Math.cos(a)*start,Math.sin(a)*start);
    ctx.lineTo(Math.cos(a)*end,Math.sin(a)*end);ctx.stroke();
  }
  function star(ctx,points,r1,r2,rotation){
    ctx.beginPath();
    for(var i=0;i<points*2;i++){
      var a=rotation+i*Math.PI/points,rr=i%2?r2:r1;
      if(i===0)ctx.moveTo(Math.cos(a)*rr,Math.sin(a)*rr);
      else ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);
    }
    ctx.closePath();
  }
  function drawOne(ctx,f,cam,q){
    var x=f.x-cam.x,y=f.y-cam.y,level=tier(q);
    if((x< -500||x>1700||y< -500||y>1175)&&f.type!=='beam')return;
    var t=clamp(f.life/f.t,0,1),u=1-t,cols=f.col||palette.mint;
    ctx.save();ctx.translate(x,y);ctx.globalCompositeOperation='lighter';ctx.lineCap='round';
    if(f.type==='beam'){
      var dx=(f.x2-f.x),dy=(f.y2-f.y),len=Math.hypot(dx,dy);
      if(len>2){
        ctx.rotate(Math.atan2(dy,dx));
        var w=f.size*(.52+.65*t);
        ctx.shadowBlur=level===2?19:6;ctx.shadowColor=cols[0];
        ctx.globalAlpha=.17*t;ctx.strokeStyle=cols[2];ctx.lineWidth=w*3.3;
        ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(len,0);ctx.stroke();
        ctx.globalAlpha=.80*t;ctx.strokeStyle=cols[0];ctx.lineWidth=Math.max(3,w*.8);
        ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(len,0);ctx.stroke();
        ctx.shadowBlur=0;ctx.globalAlpha=t;ctx.strokeStyle=cols[1];ctx.lineWidth=Math.max(1.7,w*.2);
        ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(len,0);ctx.stroke();
        var segments=level===0?3:level===1?5:8;
        for(var j=1;j<segments;j++){
          var xx=len*j/segments,ss=(j%2?1:-1)*w*(.85+.5*u);
          ctx.globalAlpha=.46*t;ctx.strokeStyle=cols[j%2?0:2];ctx.lineWidth=1.8;
          ctx.beginPath();ctx.moveTo(xx-w*2,ss);ctx.lineTo(xx,0);ctx.lineTo(xx+w*2,-ss);ctx.stroke();
        }
      }
    }else if(f.type==='hit'){
      var sz=f.size;
      ring(ctx,sz*(.45+u*1.16),Math.max(1,3.0*t),cols[0],.67*t);
      ring(ctx,sz*(.2+u*.57),1.4,cols[1],.85*t);
      ctx.rotate(f.angle);
      for(var k=0;k<(level===0?4:8);k++){
        var a=k*TAU/(level===0?4:8),start=sz*.13,end=sz*(.6+u*1.9)*(k%2?.72:1.15);
        ray(ctx,a,start,end,k%2?1.4:2.2,cols[k%3],(.5+.45*(k%2))*t);
      }
      ctx.globalAlpha=.93*t;ctx.fillStyle=cols[1];star(ctx,4,sz*.4*t+3,sz*.1,Math.PI/4);ctx.fill();
    }else if(f.type==='star'||f.type==='shatter'){
      var n=f.type==='star'?12:level===0?5:9;
      ctx.rotate(f.angle+u*.95);
      ring(ctx,f.size*(.16+u*.90),2.4*t,cols[0],.68*t);
      for(var m=0;m<n;m++){
        var a=m*TAU/n+Math.sin(f.seed+m*4)*.11,dist=f.size*(.16+u*(.7+(m%3)*.12)),length=f.size*(.29+(m%4)*.08)*t;
        ray(ctx,a,dist,dist+length,m%3===0?4*t:2*t,cols[m%3],.75*t);
        if(level===2&&m%3===0){
          ctx.fillStyle=cols[1];ctx.globalAlpha=.4*t;
          star(ctx,4,4+t*7,2,a);ctx.fill();
        }
      }
    }else if(f.type==='ripple'){
      ring(ctx,f.size*(.14+u*.96),level===0?2:4*t,cols[0],.65*t);
      ring(ctx,f.size*(.05+u*.71),level===0?1:2.2*t,cols[1],.5*t);
      if(level>0){
        for(var n=0;n<10;n++){
          var a=n*TAU/10+f.angle+clock*.2;
          ray(ctx,a,f.size*(.16+u*.74),f.size*(.19+u*.74),2.7*t,cols[n%3],t*.65);
        }
      }
    }else if(f.type==='sigil'){
      var rad=f.size*(.7+u*.16);
      ctx.rotate(f.angle+u*.48);
      ring(ctx,rad,level===0?1.5:3,cols[0],.64*t);
      ring(ctx,rad*.83,1.5,cols[1],.68*t);
      ring(ctx,rad*.40,1,cols[2],.53*t);
      var count=level===0?8:16;
      for(var j=0;j<count;j++){
        var a=j*TAU/count;
        ray(ctx,a,rad*.88,rad*(j%4===0?1.22:1.04),j%4===0?2.5:1.3,cols[j%3],.8*t);
      }
      for(var k=0;k<2;k++){
        ctx.rotate(Math.PI/4);ctx.globalAlpha=.45*t;ctx.strokeStyle=cols[k%3];ctx.lineWidth=1.6;
        ctx.strokeRect(-rad*.6,-rad*.6,rad*1.2,rad*1.2);
      }
    }
    ctx.restore();
  }
  function drawAura(ctx,cam,g,q){
    if(!g||!g.player)return;
    var p=g.player,x=p.x-cam.x,y=p.y-cam.y;
    if(g.driveTime<=0&&g.jackpotTime<=0&&g.finisherTime<=0)return;
    var jackpot=g.jackpotTime>0,finish=g.finisherTime>0,lv=tier(q);
    var cols=jackpot?(special[g.jackpotType]||special[0]):finish?palette.pink:palette.mint;
    ctx.save();ctx.translate(x,y);ctx.globalCompositeOperation='lighter';
    var rad=jackpot?92:finish?75:62,sp=jackpot?2.2:1.5;
    ctx.rotate(clock*sp);
    for(var j=0;j<(lv===0?2:4);j++){
      ctx.strokeStyle=cols[j%3];ctx.lineWidth=j%2?2:3;
      ctx.globalAlpha=.48+.16*Math.sin(clock*7+j);
      ctx.beginPath();ctx.arc(0,0,rad+j*10,j*TAU/4,(j+.72)*TAU/4);ctx.stroke();
    }
    if(jackpot){
      for(var k=0;k<(lv===0?4:8);k++){
        var a=clock*1.3+k*TAU/(lv===0?4:8);
        var d=105+8*Math.sin(clock*5+k);
        ctx.globalAlpha=.75;ctx.fillStyle=cols[k%3];
        ctx.save();ctx.translate(Math.cos(a)*d,Math.sin(a)*d);star(ctx,4,9,2,a);ctx.fill();ctx.restore();
      }
    }
    ctx.restore();
  }
  function drawTrails(ctx,cam,g,q){
    if(!g||!g.bullets)return;
    var n=g.bullets.length,limit=q==='lite'?35:q==='high'?105:72,step=Math.max(1,Math.ceil(n/limit));
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';
    for(var i=0;i<n;i+=step){
      var b=g.bullets[i],x=b.x-cam.x,y=b.y-cam.y;
      if(x< -70||x>1270||y< -70||y>745)continue;
      var sp=Math.hypot(b.vx,b.vy)||1,len=q==='lite'?26:q==='high'?82:52,dx=b.vx/sp,dy=b.vy/sp;
      var cols=colorSet(b.col),r=Math.min(10,b.r||6);
      ctx.strokeStyle=cols[0];ctx.globalAlpha=q==='lite'?.34:.45;ctx.lineWidth=r*1.8;
      ctx.beginPath();ctx.moveTo(x-dx*len,y-dy*len);ctx.lineTo(x+dx*r,y+dy*r);ctx.stroke();
      ctx.strokeStyle=cols[1];ctx.globalAlpha=.65;ctx.lineWidth=Math.max(1.2,r*.33);
      ctx.beginPath();ctx.moveTo(x-dx*len*.73,y-dy*len*.73);ctx.lineTo(x+dx*r,y+dy*r);ctx.stroke();
      if(q==='high'&&i%3===0){
        ctx.strokeStyle=cols[2];ctx.globalAlpha=.5;ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(x-dx*len*.45-dy*8,y-dy*len*.45+dx*8);
        ctx.lineTo(x+dy*9,y-dx*9);ctx.stroke();
      }
    }
    ctx.restore();
  }
  function drawGround(ctx,cam,g,q){
    if(!g||!g.player)return;
    drawAura(ctx,cam,g,q);
    var n=Math.min(particles.length,q==='lite'?14:34);
    for(var i=particles.length-n;i<particles.length;i++){
      var f=particles[i];
      if(f&&(f.type==='sigil'||f.type==='ripple'))drawOne(ctx,f,cam,q);
    }
  }
  function drawFront(ctx,cam,g,q){
    if(!g||!g.player)return;
    drawTrails(ctx,cam,g,q);
    var limit=q==='lite'?23:q==='high'?100:58,n=Math.min(limit,particles.length);
    for(var i=particles.length-n;i<particles.length;i++){
      var f=particles[i];if(f&&f.type!=='sigil'&&f.type!=='ripple')drawOne(ctx,f,cam,q);
    }
  }
  function drawScreen(ctx,w,h,g,q){
    if(!g||q==='lite')return;
    var jack=g.jackpotTime>0,fin=g.finisherTime>0;
    if(!jack&&!fin)return;
    var cols=jack?(special[g.jackpotType]||special[0]):palette.pink;
    var a=jack?.19:.10,pulse=.6+.4*Math.sin(clock*9);
    ctx.save();ctx.globalCompositeOperation='screen';ctx.strokeStyle=cols[0];ctx.lineWidth=jack?4:2;
    ctx.globalAlpha=a*pulse;
    ctx.strokeRect(8,8,w-16,h-16);
    ctx.strokeStyle=cols[1];ctx.lineWidth=1;
    ctx.strokeRect(17,17,w-34,h-34);
    var amount=jack?8:5;
    for(var i=0;i<amount;i++){
      var y=40+i*(h-80)/Math.max(1,amount-1),left=i%2===0;
      ctx.strokeStyle=cols[i%3];ctx.lineWidth=i%3===0?3:1.6;ctx.globalAlpha=(jack?.28:.14)*pulse;
      ctx.beginPath();
      if(left){ctx.moveTo(0,y-22);ctx.lineTo(30,y);ctx.lineTo(0,y+25);}
      else {ctx.moveTo(w,y-22);ctx.lineTo(w-30,y);ctx.lineTo(w,y+25);}
      ctx.stroke();
    }
    ctx.restore();
  }
  window.RUU_SPECTACLE={update:update,reset:reset,onHit:onHit,onKill:onKill,onWeapon:onWeapon,onFinisher:onFinisher,onFinisherPulse:onFinisherPulse,onJackpot:onJackpot,onJackpotPulse:onJackpotPulse,drawGround:drawGround,drawFront:drawFront,drawScreen:drawScreen};
})();