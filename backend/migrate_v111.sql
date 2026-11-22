-- RUU//OVERRUN v1.11.0: run ONCE in Cloudflare D1 Console before deploying the new Worker.
-- Existing normal scores are preserved. Do not drop or rename scores.
ALTER TABLE scores ADD COLUMN title TEXT NOT NULL DEFAULT '';
CREATE TABLE IF NOT EXISTS endless_scores (
  player_id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  score INTEGER NOT NULL CHECK (score>=0),
  kills INTEGER NOT NULL CHECK (kills>=0),
  level INTEGER NOT NULL CHECK (level>=1),
  time_seconds INTEGER NOT NULL CHECK (time_seconds>=100),
  won INTEGER NOT NULL CHECK (won=0),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_endless_scores_rank ON endless_scores (score DESC, time_seconds DESC, kills DESC);
