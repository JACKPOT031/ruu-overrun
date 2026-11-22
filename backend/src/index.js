// RUU//OVERRUN community ranking API — Cloudflare Worker + D1.
// This is a casual, unauthenticated leaderboard. Client-reported scores are not cheat-proof.

const response = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...headers
    }
  });

const validInt = (v, min, max) => Number.isSafeInteger(v) && v >= min && v <= max;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const allowedOrigins = String(env.ALLOWED_ORIGINS || '')
      .split(',').map(s => s.trim()).filter(Boolean);
    const corsOK = !!origin && allowedOrigins.includes(origin);
    const corsHeaders = corsOK ? {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '600',
      Vary: 'Origin'
    } : { Vary: 'Origin' };
    const json = (data, status=200) => response(data,status,corsHeaders);
    if (request.method === 'OPTIONS') {
      return corsOK ? new Response(null, {status:204,headers:corsHeaders}) : json({error:'Origin is not allowed'},403);
    }
    // Unknown browser origins are rejected. This is not a substitute for authentication.
    if (origin && !corsOK) return json({error:'Origin is not allowed'},403);
    if (!env.DB) return json({error:'Database binding unavailable'},503);
    if (url.pathname === '/api/health' && request.method === 'GET') {
      return json({ok:true,game:'RUU//OVERRUN',ranking:'beta',rankingModes:['normal','endless'],version:'1.11.0'});
    }
    if (url.pathname === '/api/leaderboard' && request.method === 'GET') {
      const limit = Math.max(1, Math.min(50, Number(url.searchParams.get('limit')) || 30));
      const mode=url.searchParams.get('mode')==='endless'?'endless':'normal';
      const table=mode==='endless'?'endless_scores':'scores';
      const {results} = await env.DB.prepare(`
        SELECT name, title, score, kills, level, time_seconds AS timeSeconds,
               won, updated_at AS updatedAt
        FROM ${table} ORDER BY score DESC, won DESC, kills DESC, updated_at ASC LIMIT ?
      `).bind(limit).all();
      return json({mode,entries: (results || []).map(r => ({
        name: r.name, title:r.title||'', score:r.score, kills:r.kills, level:r.level,
        timeSeconds:r.timeSeconds, won:!!r.won, updatedAt:r.updatedAt
      }))});
    }
    if (url.pathname === '/api/score' && (request.method==='POST' || request.method==='DELETE')) {
      if (!corsOK) return json({error:'Submit from the published game page'},403);
      if (!(request.headers.get('Content-Type') || '').toLowerCase().includes('application/json')) return json({error:'JSON required'},415);
      const raw = await request.text();
      if (raw.length > 2048) return json({error:'Payload too large'},413);
      let data;
      try {data=JSON.parse(raw)} catch {return json({error:'Invalid JSON'},400)}
      if (!data || typeof data !== 'object') return json({error:'Invalid body'},400);
      const playerId = String(data.playerId || '');
      const mode=String(data.mode||'normal');
      if(!['normal','endless'].includes(mode))return json({error:'Invalid game mode'},400);
      const table=mode==='endless'?'endless_scores':'scores';
      if (!/^[0-9a-f]{32}$/.test(playerId)) return json({error:'Invalid anonymous player ID'},400);
      if (request.method==='DELETE') {
        // The 128-bit browser-generated ID is a private deletion token. It is never shown in public results.
        await env.DB.prepare(`DELETE FROM ${table} WHERE player_id = ?`).bind(playerId).run();
        return json({ok:true});
      }
      const name = typeof data.name==='string' ? data.name.normalize('NFKC').trim().replace(/\s+/g,' ') : '';
      if (!name || Array.from(name).length>16 || /[<>\x00-\x1F\x7F]/.test(name)) return json({error:'Name must be 1–16 characters'},400);
      const title=typeof data.title==='string'?data.title.normalize('NFKC').trim():'';
      if(Array.from(title).length>24||/[<>\x00-\x1F\x7F]/.test(title))return json({error:'Invalid achievement title'},400);
      const {score,kills,level,timeSeconds,won}=data;
      if (!validInt(score,0,500000000) || !validInt(kills,0,100000) ||
          !validInt(level,1,1000) || !validInt(timeSeconds,0,mode==='endless'?43200:1000) ||
          typeof won!=='boolean' || (mode==='normal' && won && timeSeconds<99) || (mode==='endless' && won)) {
        return json({error:'Invalid game result'},400);
      }
      const prior=await env.DB.prepare(`SELECT score, updated_at FROM ${table} WHERE player_id = ?`).bind(playerId).first();
      // The 10-second limit is a low-cost guard against accidental rapid repeats.
      if (prior && score > prior.score && (Date.now()-Date.parse(prior.updated_at)) < 10000)
        return json({error:'Please wait a few seconds before submitting again'},429);
      const result=await env.DB.prepare(`
        INSERT INTO ${table} (player_id,name,title,score,kills,level,time_seconds,won,updated_at)
        VALUES (?,?,?,?,?,?,?,?,strftime('%Y-%m-%dT%H:%M:%SZ','now'))
        ON CONFLICT(player_id) DO UPDATE SET
          name=excluded.name, title=excluded.title, score=excluded.score, kills=excluded.kills,
          level=excluded.level, time_seconds=excluded.time_seconds,
          won=excluded.won, updated_at=excluded.updated_at
        WHERE excluded.score > scores.score
           OR (excluded.score = scores.score AND excluded.won > scores.won)
      `).bind(playerId,name,title,score,kills,level,timeSeconds,won?1:0).run();
      const saved=await env.DB.prepare(`SELECT score, name, title FROM ${table} WHERE player_id=?`).bind(playerId).first();
      return json({ok:true,mode,updated:(result.meta?.changes||0)>0,bestScore:saved?.score??score,displayName:saved?.name??name,title:saved?.title??title});
    }
    return json({error:'Not found'},404);
  }
};
