-- One best result per anonymous browser installation. Do not store email or IP address.
CREATE TABLE IF NOT EXISTS scores (
  player_id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score>=0),
  kills INTEGER NOT NULL CHECK (kills>=0),
  level INTEGER NOT NULL CHECK (level>=1),
  time_seconds INTEGER NOT NULL CHECK (time_seconds>=0),
  won INTEGER NOT NULL CHECK (won IN (0,1)),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_scores_rank ON scores (score DESC, won DESC, kills DESC);
