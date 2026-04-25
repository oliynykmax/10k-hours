-- Migration: 0004_practice_log
-- Track daily practice minutes per user

CREATE TABLE IF NOT EXISTS "practice_log" (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  minutes INTEGER DEFAULT 0 NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_practice_log_user_date ON "practice_log"(user_id, date);
