import { useEffect, useRef, useState, type Dispatch, type FormEvent, type SetStateAction } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Typography, TextField, IconButton, CircularProgress, Drawer, Menu, MenuItem } from '@mui/material'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import SendRoundedIcon from '@mui/icons-material/SendRounded'
import MenuIcon from '@mui/icons-material/Menu'
import AddCommentOutlinedIcon from '@mui/icons-material/AddCommentOutlined'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import { fonts, fontSizes } from '../constants'
import type { DocsColors } from '../constants'
import { Logo, LogoutButton, useDocsTheme } from '../docs/DocsLayout'
import { apiClient, getErrorMessage } from '../lib/apiClient'
import { getSession } from '../lib/session'
import {
  deleteSession,
  fetchSessionMessages,
  fetchSessions,
  renameSession,
  type ChatSession,
} from '../lib/chatSessions'
import { groupSessionsByRecency } from '../lib/groupSessionsByRecency'

const NAV_HEIGHT = 56
const SIDEBAR_WIDTH = 280

const SUGGESTIONS = [
  { level: 'Simple', text: 'What is the capital of France?' },
  { level: 'Quick chat', text: 'Give me a fun fact about octopuses' },
  { level: 'Moderate', text: 'Suggest a simple weekly meal plan for a vegetarian' },
  { level: 'Complex', text: 'Compare electric and hybrid cars and explain which is better for city driving' },
]

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
  provider?: string
  model?: string
}

type ChatResponse = {
  provider: string
  model: string
  response: string
  sessionId: string
}

function MarkdownMessage({ content, c }: { content: string; c: DocsColors }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => (
          <Typography sx={{ fontSize: fontSizes.body, lineHeight: 1.65, m: 0, mb: 1.25, '&:last-child': { mb: 0 } }}>
            {children}
          </Typography>
        ),
        strong: ({ children }) => (
          <Box component="strong" sx={{ fontWeight: 700, color: c.textPrimary }}>
            {children}
          </Box>
        ),
        em: ({ children }) => <Box component="em">{children}</Box>,
        h1: ({ children }) => (
          <Typography sx={{ fontSize: fontSizes.h2, fontWeight: 700, mt: 1.5, mb: 1, '&:first-of-type': { mt: 0 } }}>
            {children}
          </Typography>
        ),
        h2: ({ children }) => (
          <Typography sx={{ fontSize: fontSizes.h3, fontWeight: 700, mt: 1.5, mb: 1, '&:first-of-type': { mt: 0 } }}>
            {children}
          </Typography>
        ),
        h3: ({ children }) => (
          <Typography sx={{ fontSize: fontSizes.body, fontWeight: 700, mt: 1.5, mb: 0.75, '&:first-of-type': { mt: 0 } }}>
            {children}
          </Typography>
        ),
        ul: ({ children }) => <Box component="ul" sx={{ pl: 3, m: 0, mb: 1.25 }}>{children}</Box>,
        ol: ({ children }) => <Box component="ol" sx={{ pl: 3, m: 0, mb: 1.25 }}>{children}</Box>,
        li: ({ children }) => (
          <Box component="li" sx={{ mb: 0.5, fontSize: fontSizes.body, lineHeight: 1.6 }}>
            {children}
          </Box>
        ),
        a: ({ href, children }) => (
          <Box component="a" href={href} target="_blank" rel="noreferrer" sx={{ color: c.accent }}>
            {children}
          </Box>
        ),
        blockquote: ({ children }) => (
          <Box sx={{ borderLeft: `3px solid ${c.border}`, pl: 1.5, my: 1.25, color: c.textSecondary }}>
            {children}
          </Box>
        ),
        hr: () => <Box component="hr" sx={{ border: 'none', borderTop: `1px solid ${c.border}`, my: 1.5 }} />,
        pre: ({ children }) => (
          <Box
            component="pre"
            sx={{
              bgcolor: c.codeBg,
              color: c.codeText,
              border: `1px solid ${c.codeBorder}`,
              borderRadius: 2,
              p: 1.5,
              my: 1.25,
              overflowX: 'auto',
              fontFamily: fonts.mono,
              fontSize: '0.8125rem',
              lineHeight: 1.6,
            }}
          >
            {children}
          </Box>
        ),
        code: ({ children }) => (
          <Box
            component="code"
            sx={{ fontFamily: fonts.mono, fontSize: '0.85em', bgcolor: c.surfaceHover, borderRadius: 0.75, px: 0.5, py: 0.125 }}
          >
            {children}
          </Box>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

function SessionRow({
  session,
  isActive,
  onNavigate,
  onRenamed,
  onDeleted,
}: {
  session: ChatSession
  isActive: boolean
  onNavigate: () => void
  onRenamed: (id: string, title: string) => void
  onDeleted: (id: string) => void
}) {
  const { c } = useDocsTheme()
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)
  const [editing, setEditing] = useState(false)
  const [draftTitle, setDraftTitle] = useState(session.title)

  const closeMenu = () => setMenuAnchor(null)

  const startRename = () => {
    setDraftTitle(session.title)
    setEditing(true)
    closeMenu()
  }

  const commitRename = async () => {
    const title = draftTitle.trim()
    setEditing(false)
    if (!title || title === session.title) return

    try {
      await renameSession(session.id, title)
      onRenamed(session.id, title)
    } catch {
      // keep the old title displayed if the rename request fails
    }
  }

  const handleDelete = async () => {
    closeMenu()
    if (!window.confirm(`Delete "${session.title}"? This can't be undone.`)) return

    try {
      await deleteSession(session.id)
      onDeleted(session.id)
    } catch {
      // leave the session in the list if the delete request fails
    }
  }

  if (editing) {
    return (
      <Box sx={{ px: 1.5, py: 0.5 }}>
        <TextField
          autoFocus
          size="small"
          fullWidth
          value={draftTitle}
          onChange={(event) => setDraftTitle(event.target.value)}
          onBlur={() => void commitRename()}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              void commitRename()
            }
            if (event.key === 'Escape') setEditing(false)
          }}
          sx={{
            '& .MuiOutlinedInput-root': { bgcolor: c.bg },
            '& .MuiOutlinedInput-input': { color: c.textPrimary },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: c.border },
          }}
        />
      </Box>
    )
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        borderRadius: 1.5,
        px: 0.5,
        bgcolor: isActive ? c.accentBg : 'transparent',
        '&:hover': { bgcolor: isActive ? c.accentBg : c.surfaceHover },
      }}
    >
      <Box
        component="button"
        onClick={onNavigate}
        sx={{
          flex: 1,
          minWidth: 0,
          textAlign: 'left',
          cursor: 'pointer',
          fontFamily: 'inherit',
          fontSize: fontSizes.small,
          color: isActive ? c.accent : c.textSecondary,
          bgcolor: 'transparent',
          border: 'none',
          borderRadius: 1.5,
          px: 1,
          py: 0.875,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {session.title}
      </Box>
      <IconButton size="small" onClick={(event) => setMenuAnchor(event.currentTarget)} sx={{ color: c.textMuted }}>
        <MoreHorizIcon sx={{ fontSize: 17 }} />
      </IconButton>
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem onClick={startRename}>Rename</MenuItem>
        <MenuItem onClick={() => void handleDelete()} sx={{ color: '#EF4444' }}>
          Delete
        </MenuItem>
      </Menu>
    </Box>
  )
}

function SessionListContent({
  sessions,
  activeSessionId,
  onNavigate,
  onSessionsChange,
}: {
  sessions: ChatSession[]
  activeSessionId: string | null
  onNavigate?: () => void
  onSessionsChange: Dispatch<SetStateAction<ChatSession[]>>
}) {
  const { c } = useDocsTheme()
  const navigate = useNavigate()
  const groups = groupSessionsByRecency(sessions)

  const handleRenamed = (id: string, title: string) => {
    onSessionsChange((prev) => prev.map((item) => (item.id === id ? { ...item, title } : item)))
  }

  const handleDeleted = (id: string) => {
    onSessionsChange((prev) => prev.filter((item) => item.id !== id))
    if (id === activeSessionId) navigate('/chat')
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 2 }}>
        <Box
          component="button"
          onClick={() => {
            navigate('/chat')
            onNavigate?.()
          }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            width: '100%',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: fontSizes.small,
            fontWeight: 600,
            color: c.textPrimary,
            bgcolor: 'transparent',
            border: `1px solid ${c.border}`,
            borderRadius: 1.5,
            px: 1.5,
            py: 1,
            '&:hover': { bgcolor: c.surfaceHover },
          }}
        >
          <AddCommentOutlinedIcon sx={{ fontSize: 17 }} />
          New Chat
        </Box>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', px: 1, pb: 2 }}>
        {groups.map((group) => (
          <Box key={group.label} sx={{ mb: 2 }}>
            <Typography
              sx={{
                fontSize: fontSizes.tiny,
                fontWeight: 700,
                letterSpacing: 0.6,
                textTransform: 'uppercase',
                color: c.textMuted,
                px: 1.5,
                mb: 0.5,
              }}
            >
              {group.label}
            </Typography>
            {group.sessions.map((sessionItem) => (
              <SessionRow
                key={sessionItem.id}
                session={sessionItem}
                isActive={sessionItem.id === activeSessionId}
                onNavigate={() => {
                  navigate(`/chat/${sessionItem.id}`)
                  onNavigate?.()
                }}
                onRenamed={handleRenamed}
                onDeleted={handleDeleted}
              />
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  )
}

function Chat() {
  const { c } = useDocsTheme()
  const navigate = useNavigate()
  const { sessionId: activeSessionId } = useParams<{ sessionId: string }>()
  const session = getSession()

  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchSessions()
      .then(setSessions)
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!activeSessionId) {
      setMessages([])
      return
    }

    let cancelled = false
    setMessagesLoading(true)
    setError(null)

    fetchSessionMessages(activeSessionId)
      .then((data) => {
        if (cancelled) return
        setMessages(
          data.map((message) => ({
            role: message.role,
            content: message.content,
            provider: message.provider ?? undefined,
            model: message.model ?? undefined,
          })),
        )
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, 'Could not load this conversation.'))
      })
      .finally(() => {
        if (!cancelled) setMessagesLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [activeSessionId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendPrompt(prompt: string) {
    if (!prompt.trim() || loading) return

    setMessages((prev) => [...prev, { role: 'user', content: prompt }])
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const response = await apiClient.post<{ data: ChatResponse }>('/chat', {
        prompt,
        sessionId: activeSessionId ?? undefined,
      })
      const { data } = response.data

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.response, provider: data.provider, model: data.model },
      ])

      const now = new Date().toISOString()
      if (!activeSessionId) {
        navigate(`/chat/${data.sessionId}`, { replace: true })
        setSessions((prev) => [
          { id: data.sessionId, title: prompt.slice(0, 60), created_at: now, updated_at: now },
          ...prev,
        ])
      } else {
        setSessions((prev) => {
          const current = prev.find((item) => item.id === data.sessionId)
          const rest = prev.filter((item) => item.id !== data.sessionId)
          return current ? [{ ...current, updated_at: now }, ...rest] : prev
        })
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Something went wrong. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    void sendPrompt(input)
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: c.bg, color: c.textPrimary, fontFamily: fonts.base }}>
      {/* Desktop sidebar */}
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          borderRight: `1px solid ${c.border}`,
        }}
      >
        <SessionListContent sessions={sessions} activeSessionId={activeSessionId ?? null} onSessionsChange={setSessions} />
      </Box>

      {/* Mobile sidebar */}
      <Drawer anchor="left" open={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)}>
        <Box sx={{ width: SIDEBAR_WIDTH, height: '100%', bgcolor: c.bg }}>
          <SessionListContent
            sessions={sessions}
            activeSessionId={activeSessionId ?? null}
            onNavigate={() => setMobileSidebarOpen(false)}
            onSessionsChange={setSessions}
          />
        </Box>
      </Drawer>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Header */}
        <Box
          sx={{
            height: NAV_HEIGHT,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            px: { xs: 2, md: 3 },
            borderBottom: `1px solid ${c.border}`,
            bgcolor: c.navBg,
            backdropFilter: 'blur(8px)',
          }}
        >
          <IconButton
            onClick={() => setMobileSidebarOpen(true)}
            sx={{ display: { xs: 'inline-flex', md: 'none' }, color: c.textSecondary }}
            size="small"
          >
            <MenuIcon fontSize="small" />
          </IconButton>
          <Logo />
          <Box sx={{ flex: 1 }} />
          {session && (
            <Typography sx={{ fontSize: fontSizes.small, color: c.textMuted, display: { xs: 'none', sm: 'block' } }}>
              {session.user.name}
            </Typography>
          )}
          <LogoutButton />
        </Box>

        {/* Messages */}
        <Box sx={{ flex: 1, overflowY: 'auto', px: { xs: 2, md: 0 } }}>
          <Box sx={{ maxWidth: 760, mx: 'auto', py: 4, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {messagesLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                <CircularProgress size={20} sx={{ color: c.textMuted }} />
              </Box>
            )}

            {!messagesLoading && messages.length === 0 && (
              <Box sx={{ textAlign: 'center', mt: { xs: 4, sm: 8 } }}>
                <Typography sx={{ fontFamily: fonts.heading, fontWeight: 800, fontSize: fontSizes.h1, mb: 1.5 }}>
                  What can I help with?
                </Typography>
                <Typography sx={{ fontSize: fontSizes.body, color: c.textSecondary, mb: 4 }}>
                  Ask anything &mdash; the right AI model is picked for you automatically.
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
                  {SUGGESTIONS.map((suggestion) => (
                    <Box
                      key={suggestion.text}
                      component="button"
                      onClick={() => void sendPrompt(suggestion.text)}
                      sx={{
                        cursor: 'pointer',
                        textAlign: 'left',
                        width: '100%',
                        maxWidth: 480,
                        fontFamily: 'inherit',
                        color: c.textSecondary,
                        bgcolor: c.surface,
                        border: `1px solid ${c.border}`,
                        borderRadius: 2,
                        px: 2,
                        py: 1.25,
                        transition: 'border-color 120ms ease',
                        '&:hover': { borderColor: c.accent, color: c.textPrimary },
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: fontSizes.tiny,
                          fontWeight: 700,
                          letterSpacing: 0.4,
                          textTransform: 'uppercase',
                          color: c.accent,
                          mb: 0.25,
                        }}
                      >
                        {suggestion.level}
                      </Typography>
                      <Typography sx={{ fontSize: fontSizes.small, color: 'inherit' }}>{suggestion.text}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {messages.map((message, index) => (
              <Box
                key={index}
                sx={{ display: 'flex', flexDirection: 'column', alignItems: message.role === 'user' ? 'flex-end' : 'flex-start' }}
              >
                <Box
                  sx={{
                    maxWidth: '85%',
                    px: 2,
                    py: 1.25,
                    borderRadius: 2.5,
                    fontSize: fontSizes.body,
                    lineHeight: 1.6,
                    bgcolor: message.role === 'user' ? c.accent : c.surface,
                    color: message.role === 'user' ? c.bg : c.textPrimary,
                    border: message.role === 'user' ? 'none' : `1px solid ${c.border}`,
                  }}
                >
                  {message.role === 'assistant' ? (
                    <MarkdownMessage content={message.content} c={c} />
                  ) : (
                    <Box sx={{ whiteSpace: 'pre-wrap' }}>{message.content}</Box>
                  )}
                </Box>
                {message.role === 'assistant' && message.provider && (
                  <Typography sx={{ fontSize: fontSizes.tiny, color: c.textMuted, mt: 0.5, px: 0.5 }}>
                    Answered by {message.provider} &middot; {message.model}
                  </Typography>
                )}
              </Box>
            ))}

            {loading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: c.textMuted }}>
                <CircularProgress size={14} sx={{ color: c.textMuted }} />
                <Typography sx={{ fontSize: fontSizes.small }}>Thinking&hellip;</Typography>
              </Box>
            )}

            {error && <Typography sx={{ fontSize: fontSizes.small, color: '#EF4444' }}>{error}</Typography>}

            <div ref={bottomRef} />
          </Box>
        </Box>

        {/* Composer */}
        <Box sx={{ flexShrink: 0, borderTop: `1px solid ${c.border}`, bgcolor: c.bg, px: { xs: 2, md: 0 } }}>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ maxWidth: 760, mx: 'auto', py: 2, display: 'flex', gap: 1, alignItems: 'flex-end' }}
          >
            <TextField
              fullWidth
              multiline
              maxRows={6}
              placeholder="Message AI Model Router..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  void sendPrompt(input)
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': { bgcolor: c.surface, borderRadius: 3 },
                '& .MuiOutlinedInput-input': { color: c.textPrimary },
                '& .MuiOutlinedInput-input::placeholder': { color: c.textMuted, opacity: 1 },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: c.border },
              }}
            />
            <IconButton
              type="submit"
              disabled={loading || !input.trim()}
              sx={{
                bgcolor: c.textPrimary,
                color: c.bg,
                '&:hover': { bgcolor: c.textPrimary, opacity: 0.85 },
                '&.Mui-disabled': { bgcolor: c.surfaceHover, color: c.textMuted },
              }}
            >
              <SendRoundedIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default Chat
