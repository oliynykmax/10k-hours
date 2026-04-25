-- Create skill table (replaces task)
CREATE TABLE IF NOT EXISTS "skill" (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'other' NOT NULL,
  deadline TEXT,
  completed INTEGER DEFAULT 0 NOT NULL,
  subtasks TEXT DEFAULT '[]' NOT NULL,
  created_at INTEGER NOT NULL,
  locked_in_at INTEGER,
  time_spent_ms INTEGER DEFAULT 0 NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_skill_user_id ON "skill"(user_id);

-- Migrate existing tasks to skills
INSERT INTO "skill" (id, user_id, title, category, deadline, completed, subtasks, created_at, locked_in_at, time_spent_ms, sort_order, updated_at)
SELECT id, user_id, title, 'other', deadline, completed, subtasks, created_at, locked_in_at, time_spent_ms, sort_order, updated_at
FROM "task";
