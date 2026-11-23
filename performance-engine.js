/* RUU//OVERRUN v1.28.0 — performance helpers (visual-only caching + hit-order-preserving spatial index) */
(function(){
  'use strict';
  const CELL=160;

  // Each living enemy occupies every grid cell touched by its collision circle.
  // A bullet queries every cell touched by its circle. This guarantees that any
  // pair that would collide in the original full scan shares at least one cell.
  class EnemySpatialGrid {
    constructor(){
      this.cellSize=CELL;
      this.cells=new Map();
      this.seen=new WeakMap();
      this.queryId=0;
      this.enemyCount=0;
      this.queryCount=0;
      this.testCount=0;
    }
    build(enemies){
      this.cells.clear();
      this.enemyCount=0;
      this.queryCount=0;
      this.testCount=0;
      const cell=this.cellSize;
      for(let order=0;order<enemies.length;order++){
        const e=enemies[order];
        if(!e||e.hp<=0)continue;
        this.enemyCount++;
        const r=Math.max(0,Number(e.r)||0);
        const x0=Math.floor((e.x-r)/cell),x1=Math.floor((e.x+r)/cell);
        const y0=Math.floor((e.y-r)/cell),y1=Math.floor((e.y+r)/cell);
        const entry={entity:e,order};
        for(let cy=y0;cy<=y1;cy++)for(let cx=x0;cx<=x1;cx++){
          const key=cx+','+cy;
          let bucket=this.cells.get(key);
          if(!bucket){bucket=[];this.cells.set(key,bucket);}
          bucket.push(entry);
        }
      }
    }
    candidates(x,y,r){
      this.queryCount++;
      const id=++this.queryId,cell=this.cellSize,rad=Math.max(0,Number(r)||0);
      const x0=Math.floor((x-rad)/cell),x1=Math.floor((x+rad)/cell);
      const y0=Math.floor((y-rad)/cell),y1=Math.floor((y+rad)/cell);
      const found=[];
      for(let cy=y0;cy<=y1;cy++)for(let cx=x0;cx<=x1;cx++){
        const bucket=this.cells.get(cx+','+cy);
        if(!bucket)continue;
        for(const entry of bucket){
          const e=entry.entity;
          if(this.seen.get(e)===id)continue;
          this.seen.set(e,id);
          found.push(entry);
        }
      }
      // Preserve the original enemy-array hit priority and piercing semantics.
      if(found.length>1)found.sort((a,b)=>a.order-b.order);
      this.testCount+=found.length;
      return found.map(entry=>entry.entity);
    }
  }

  const spriteCache=new Map(),MAX_SPRITES=128;
  let spriteHits=0,spriteMisses=0;
  function projectileSprite(color,r,len,ice){
    const tint=ice?'#b9e9ff':String(color||'#9afcf2');
    if(!/^#[0-9a-f]{6}$/i.test(tint))return null; // Retain caller fallback for unusual colors.
    const radius=Math.max(1,Math.min(24,Math.round(r||7)));
    const length=Math.max(12,Math.min(80,Math.round((len||22)/3)*3));
    const key=(ice?'ice:':'shot:')+tint+':'+radius+':'+length;
    const cached=spriteCache.get(key);
    if(cached){spriteHits++;return cached;}
    if(typeof document==='undefined')return null;
    const pad=5,left=-length-pad,top=-radius*2-pad;
    const width=length+radius*2+pad*2,height=radius*4+pad*2;
    const scale=2,canvas=document.createElement('canvas');
    canvas.width=width*scale;canvas.height=height*scale;
    const cx=canvas.getContext('2d');
    if(!cx)return null;
    cx.setTransform(scale,0,0,scale,-left*scale,-top*scale);
    const gr=cx.createLinearGradient(-length,0,radius*2,0);
    gr.addColorStop(0,tint+'00');
    gr.addColorStop(.66,tint+'bb');
    gr.addColorStop(.91,'#fffce9');
    gr.addColorStop(1,'#ffffff');
    cx.fillStyle=gr;
    cx.beginPath();
    cx.moveTo(-length,0);
    cx.quadraticCurveTo(-length*.17,-radius*(ice?.8:1.3),radius*2,0);
    cx.quadraticCurveTo(-length*.17,radius*(ice?.8:1.3),-length,0);
    cx.fill();
    if(ice){
      cx.fillStyle='#f9ffff';
      cx.beginPath();cx.moveTo(radius*2,0);
      cx.lineTo(-radius,-radius*.7);cx.lineTo(-radius*2,0);
      cx.lineTo(-radius,radius*.7);cx.closePath();cx.fill();
      cx.strokeStyle='#91d9ff';cx.lineWidth=1.4;cx.stroke();
    }else{
      cx.fillStyle='#fffef6';cx.beginPath();cx.arc(radius*.6,0,radius*.56,0,Math.PI*2);cx.fill();
    }
    const record={canvas,left,top,width,height};
    if(spriteCache.size>=MAX_SPRITES)spriteCache.delete(spriteCache.keys().next().value);
    spriteCache.set(key,record);spriteMisses++;
    return record;
  }

  const enemyGrid=new EnemySpatialGrid();
  window.RUU_PERF_ENGINE={
    enemyGrid,projectileSprite,
    spriteStats:()=>({cached:spriteCache.size,hits:spriteHits,misses:spriteMisses})
  };
})();
