/**
 * Single source of truth for client-side route paths.
 * Never hard-code a path string in a component — import from here so a rename
 * is a one-line change and TypeScript catches every call site.
 */
export const ROUTES = {
  root: '/',
  login: '/login',
  signup: '/signup',
  home: '/home',
  models: '/models',
  chat: '/chat',
  chatSession: '/chat/:sessionId',
  apiKeys: '/api-keys',
  usage: '/usage',
} as const

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES]

export const chatSessionPath = (sessionId: string) => `${ROUTES.chat}/${sessionId}`
