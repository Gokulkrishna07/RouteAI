export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  role: MessageRole;
  content: string;
}

export interface Session {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface SessionMessage {
  id: string;
  role: MessageRole;
  content: string;
  provider: string | null;
  model: string | null;
  created_at: string;
}
