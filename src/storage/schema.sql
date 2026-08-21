CREATE TABLE IF NOT EXISTS player_profiles (
  user_id TEXT PRIMARY KEY,
  payload JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE player_profiles ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS economy_ledger (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES player_profiles(user_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL,
  entry_type TEXT NOT NULL,
  amount BIGINT NOT NULL,
  balance_after BIGINT NOT NULL,
  note TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_player_profiles_updated_at ON player_profiles(updated_at);
CREATE INDEX IF NOT EXISTS idx_economy_ledger_user_created ON economy_ledger(user_id, created_at DESC);
