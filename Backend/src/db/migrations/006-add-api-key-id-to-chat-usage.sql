ALTER TABLE chat_usage
  ADD COLUMN IF NOT EXISTS api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_chat_usage_api_key_id ON chat_usage(api_key_id);
