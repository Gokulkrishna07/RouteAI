import type { ChatSession } from './chatSessions'

export type SessionGroup = { label: string; sessions: ChatSession[] }

export function groupSessionsByRecency(sessions: ChatSession[]): SessionGroup[] {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfYesterday = new Date(startOfToday)
  startOfYesterday.setDate(startOfYesterday.getDate() - 1)
  const sevenDaysAgo = new Date(startOfToday)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const groups: Record<string, ChatSession[]> = {
    Today: [],
    Yesterday: [],
    'Previous 7 Days': [],
    Older: [],
  }

  for (const session of sessions) {
    const updatedAt = new Date(session.updated_at)
    if (updatedAt >= startOfToday) groups.Today.push(session)
    else if (updatedAt >= startOfYesterday) groups.Yesterday.push(session)
    else if (updatedAt >= sevenDaysAgo) groups['Previous 7 Days'].push(session)
    else groups.Older.push(session)
  }

  return Object.entries(groups)
    .filter(([, list]) => list.length > 0)
    .map(([label, list]) => ({ label, sessions: list }))
}
