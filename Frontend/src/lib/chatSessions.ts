import { apiClient } from './apiClient'

export type ChatSession = {
  id: string
  title: string
  created_at: string
  updated_at: string
}

export type ChatSessionMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  provider: string | null
  model: string | null
  created_at: string
}

export async function fetchSessions(): Promise<ChatSession[]> {
  const response = await apiClient.get<{ data: ChatSession[] }>('/sessions')
  return response.data.data
}

export async function fetchSessionMessages(sessionId: string): Promise<ChatSessionMessage[]> {
  const response = await apiClient.get<{ data: ChatSessionMessage[] }>(`/sessions/${sessionId}/messages`)
  return response.data.data
}

export async function renameSession(sessionId: string, title: string): Promise<void> {
  await apiClient.patch(`/sessions/${sessionId}`, { title })
}

export async function deleteSession(sessionId: string): Promise<void> {
  await apiClient.delete(`/sessions/${sessionId}`)
}
