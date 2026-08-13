CREATE INDEX IF NOT EXISTS idx_chat_usage_user_created_at
  ON chat_usage(user_id, created_at DESC);
