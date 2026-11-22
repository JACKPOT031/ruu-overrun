/* RUU//OVERRUN v1.18.0 — DEVORA SWARM DIRECTOR
   Reinforcement clusters arrive from the arena perimeter.
   Spawn caps and warnings keep dense encounters readable and bounded.
*/
(()=>{
'use strict';
const TAU=Math.PI*2,clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const WAVES=[
 {at:35,count:5,interval:.33,name:'SCOUT PACK',jp:'小規模集団',color:'#eea377',
  kinds:['wisp','runner','runner','wisp','brute'],spread:.58},
 {at:66,count:8,interval:.27,name:'IRON FLOOD',jp:'侵攻集団',color:'#eeb1a4',
  kinds:['runner','brute','wisp','runner','caster','brute','runner','caster'],spread:.84},
 {at:82,count:12,interval:.22,name:'NULL TIDE',jp:'大規模集団',color:'#ff859b',
  kinds:['runner','hex','brute','runner','caster','hex','runner','brute','caster','runner','hex','brute'],spread:1.08}
];
let next=0,active=null,banner=null,completed=0;
function reset(){next=0;active=null;banner=null;completed=0}
function enemyCap(g){
 const baseline=55+Math.floor(Math.max(0,g.time)*1.4);
 return clamp(Math.ceil(baseline*1.14),62,g.mode==='endless'?242:205);
}
function begin(g,index,api){
 const w=WAVES[index],dir=(index*2.11+.37)%TAU;
 active={index,def:w,angle:dir,warning:.62,spawnClock:0,spawned:0};
 banner={title:'SWARM ALERT // '+w.name,subtitle:w.jp+' / '+w.count+' HOSTILES INBOUND',
 color:w.color,time:2.5,max:2.5};
 api?.toast?.('SWARM ALERT // '+w.name,true);
 api?.sfx?.('boss');
}
function tick(dt,g,api,q='auto'){
 if(!g?.player||dt<=0)return;
 if(banner){banner.time-=dt;if(banner.time<=0)banner=null}
 if(!active&&next<WAVES.length&&g.time>=WAVES[next].at)begin(g,next++,api);
 const s=active;if(!s)return;
 if(s.warning>0){s.warning-=dt;return}
 s.spawnClock-=dt;
 if(s.spawnClock>0)return;
 if(s.spawned>=s.def.count){active=null;completed++;return}
 if(g.enemies.length>=enemyCap(g)){active=null;completed++;return}
 const k=s.spawned,spread=s.def.spread;
 const angle=s.angle+(k-(s.def.count-1)/2)*spread/Math.max(1,s.def.count-1);
 // All enemies enter from beyond the player camera view, not directly on top of Ruu.
 const r=565+(k%3)*52,kind=s.def.kinds[k%s.def.kinds.length];
 const x=g.player.x+Math.cos(angle)*r,y=g.player.y+Math.sin(angle)*r;
 const mob=api?.spawn?.(kind,x,y,1.08);
 if(mob){
  mob.swarmWave=s.index;mob.swarmColor=s.def.color;
  // Mutation variants still obey their existing active cap and roll.
  api?.decorate?.(mob,g);
 }
 s.spawned++;s.spawnClock=s.def.interval;
 if(s.spawned>=s.def.count){active=null;completed++}
}
function drawScreen(ctx,W,H,g,q='auto'){
 if(!g?.player||!banner||banner.time<=0)return;
 const a=clamp(Math.min((banner.max-banner.time)*6,banner.time*2),0,1);
 if(a<=0)return;
 const x=W*.31,y=H*.765,w=W*.38,h=H*.095;
 ctx.save();ctx.globalAlpha=a;
 ctx.fillStyle='#0b0e1ecb';ctx.fillRect(x,y,w,h);
 ctx.strokeStyle=banner.color;ctx.lineWidth=2;ctx.strokeRect(x,y,w,h);
 ctx.fillStyle=banner.color;ctx.fillRect(x+7,y+7,4,h-14);
 ctx.textAlign='center';ctx.font='900 16px ui-monospace,Consolas,monospace';
 ctx.fillStyle='#fff1e3';ctx.fillText(banner.title,W*.5,y+h*.43,w-18);
 ctx.font='800 11px ui-monospace,Consolas,monospace';
 ctx.fillStyle=banner.color;ctx.fillText(banner.subtitle,W*.5,y+h*.74,w-18);
 ctx.restore();
}
function status(){return{next,completed,active:active?.def.name||null,remaining:active?active.def.count-active.spawned:0}}
window.RUU_SWARM={VERSION:'1.18.0',WAVES,reset,enemyCap,tick,drawScreen,status};
})();
