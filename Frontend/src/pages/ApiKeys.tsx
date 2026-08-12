import { useState } from 'react'
import { Box, Button, CircularProgress, Typography } from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined'
import { fonts, fontSizes } from '../constants'
import { API_BASE_URL } from '../config/env'
import {
  DocsShell,
  DocsThemeProvider,
  Keyword,
  NAV_HEIGHT,
  SectionHeading,
  useDocsTheme,
} from '../docs/DocsLayout'
import { getErrorMessage } from '../lib/apiClient'
import type { ApiKey, CreateApiKeyInput, CreatedApiKey } from '../lib/apiKeys'
import { REQUEST_ERRORS } from '../features/apiKeys/apiKeys.constants'
import { useApiKeys } from '../features/apiKeys/useApiKeys'
import { ApiKeyCard } from '../features/apiKeys/components/ApiKeyCard'
import { ConfirmDialog } from '../features/apiKeys/components/ConfirmDialog'
import { CopyButton } from '../features/apiKeys/components/CopyButton'
import { CreateKeyDialog } from '../features/apiKeys/components/CreateKeyDialog'
import { InlineAlert } from '../features/apiKeys/components/InlineAlert'
import { RevealKeyDialog } from '../features/apiKeys/components/RevealKeyDialog'

const TOC_LINKS = [
  { label: 'Overview', href: '#overview' },
  { label: 'Your Keys', href: '#your-keys' },
  { label: 'Using Your Key', href: '#using-your-key' },
]

export const EMPTY_STATE_TITLE = 'No API keys yet'

const CURL_SAMPLE = `curl ${API_BASE_URL}/chat \\
  -H "x-api-key: amr_live_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "Explain quantum tunnelling in one paragraph"}'`

function CodeSample({ code }: { code: string }) {
  const { c } = useDocsTheme()
  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: 2,
        bgcolor: c.codeBg,
        border: `1px solid ${c.codeBorder}`,
        p: 2,
        pr: 6,
        overflowX: 'auto',
      }}
    >
      <Box sx={{ position: 'absolute', top: 6, right: 6 }}>
        <CopyButton value={code} label="Copy example" />
      </Box>
      <Typography
        component="pre"
        sx={{
          m: 0,
          fontFamily: fonts.mono,
          fontSize: fontSizes.small,
          color: c.codeText,
          lineHeight: 1.7,
          whiteSpace: 'pre',
        }}
      >
        {code}
      </Typography>
    </Box>
  )
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  const { c } = useDocsTheme()
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        py: 6,
        px: 3,
        borderRadius: 2,
        border: `1px dashed ${c.border}`,
        bgcolor: c.surface,
      }}
    >
      <Box
        sx={{
          width: 42,
          height: 42,
          borderRadius: 1.5,
          bgcolor: c.accentBg,
          color: c.accent,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 1.75,
        }}
      >
        <KeyOutlinedIcon sx={{ fontSize: 20 }} />
      </Box>
      <Typography sx={{ fontWeight: 700, fontSize: fontSizes.h3, color: c.textPrimary, mb: 0.75 }}>
        {EMPTY_STATE_TITLE}
      </Typography>
      <Typography sx={{ fontSize: fontSizes.small, color: c.textSecondary, maxWidth: 420, mb: 2.5, lineHeight: 1.6 }}>
        Create one to call AI Model Router from your own application, without signing a user in.
      </Typography>
      <Button
        onClick={onCreate}
        variant="contained"
        disableElevation
        startIcon={<AddRoundedIcon />}
        sx={{
          bgcolor: c.textPrimary,
          color: c.bg,
          fontSize: fontSizes.small,
          borderRadius: 1.5,
          px: 2.5,
          '&:hover': { bgcolor: c.textPrimary, opacity: 0.85 },
        }}
      >
        Create your first key
      </Button>
    </Box>
  )
}

function ApiKeysContent() {
  const { c } = useDocsTheme()
  const { keys, loading, error, create, revoke, rotate } = useApiKeys()

  const [createOpen, setCreateOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [createdKey, setCreatedKey] = useState<CreatedApiKey | null>(null)
  const [pendingRevoke, setPendingRevoke] = useState<ApiKey | null>(null)
  const [pendingRotate, setPendingRotate] = useState<ApiKey | null>(null)
  const [busy, setBusy] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const openCreate = () => {
    setCreateError(null)
    setCreateOpen(true)
  }

  const handleCreate = async (input: CreateApiKeyInput) => {
    setSubmitting(true)
    setCreateError(null)
    try {
      const created = await create(input)
      setCreateOpen(false)
      setCreatedKey(created)
    } catch (err) {
      setCreateError(getErrorMessage(err, REQUEST_ERRORS.create))
    } finally {
      setSubmitting(false)
    }
  }

  const handleRevoke = async () => {
    if (!pendingRevoke) return
    setBusy(true)
    setActionError(null)
    try {
      await revoke(pendingRevoke.id)
      setPendingRevoke(null)
    } catch (err) {
      setActionError(getErrorMessage(err, REQUEST_ERRORS.revoke))
    } finally {
      setBusy(false)
    }
  }

  const handleRotate = async () => {
    if (!pendingRotate) return
    setBusy(true)
    setActionError(null)
    try {
      const created = await rotate(pendingRotate.id)
      setPendingRotate(null)
      setCreatedKey(created)
    } catch (err) {
      setActionError(getErrorMessage(err, REQUEST_ERRORS.rotate))
    } finally {
      setBusy(false)
    }
  }

  const closeRevoke = () => {
    setActionError(null)
    setPendingRevoke(null)
  }

  const closeRotate = () => {
    setActionError(null)
    setPendingRotate(null)
  }

  return (
    <DocsShell tocLinks={TOC_LINKS} ctaLabel="Open Chat" ctaHref="/chat">
      <Typography sx={{ color: c.accent, fontWeight: 600, fontSize: fontSizes.small, mb: 1 }}>
        Developers
      </Typography>
      <Typography
        id="overview"
        component="h1"
        sx={{
          scrollMarginTop: NAV_HEIGHT + 24,
          fontFamily: fonts.heading,
          fontWeight: 800,
          fontSize: fontSizes.h1,
          letterSpacing: '-0.02em',
          mb: 2,
        }}
      >
        API keys
      </Typography>
      <Typography sx={{ fontSize: fontSizes.body, lineHeight: 1.7, color: c.textSecondary, mb: 6 }}>
        An API key lets your own application call <Keyword>AI Model Router</Keyword> directly &mdash; no
        login screen, no session to keep alive. Each key carries its own permissions and rate limit, and
        you can revoke any one of them without touching the others.
      </Typography>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <SectionHeading id="your-keys" mt={0}>
          Your Keys
        </SectionHeading>
        {keys.length > 0 ? (
          <Button
            onClick={openCreate}
            variant="contained"
            disableElevation
            startIcon={<AddRoundedIcon />}
            sx={{
              bgcolor: c.textPrimary,
              color: c.bg,
              fontSize: fontSizes.small,
              borderRadius: 1.5,
              px: 2,
              '&:hover': { bgcolor: c.textPrimary, opacity: 0.85 },
            }}
          >
            Create key
          </Button>
        ) : null}
      </Box>

      {error ? (
        <Box sx={{ mb: 2.5 }}>
          <InlineAlert message={error} />
        </Box>
      ) : null}

      {loading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 4 }}>
          <CircularProgress size={18} sx={{ color: c.textMuted }} />
          <Typography sx={{ fontSize: fontSizes.small, color: c.textMuted }}>
            Loading your keys...
          </Typography>
        </Box>
      ) : keys.length === 0 ? (
        <EmptyState onCreate={openCreate} />
      ) : (
        <Box component="ul" sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 0, m: 0 }}>
          {keys.map((apiKey) => (
            <ApiKeyCard
              key={apiKey.id}
              apiKey={apiKey}
              onRotate={setPendingRotate}
              onRevoke={setPendingRevoke}
            />
          ))}
        </Box>
      )}

      <SectionHeading id="using-your-key">Using Your Key</SectionHeading>
      <Typography sx={{ fontSize: fontSizes.body, lineHeight: 1.7, color: c.textSecondary, mb: 2.5 }}>
        Send the key as an <Keyword>x-api-key</Keyword> header from your server. It works as an
        <Keyword> Authorization: Bearer</Keyword> token too, if that fits your HTTP client better.
      </Typography>
      <CodeSample code={CURL_SAMPLE} />
      <Typography sx={{ fontSize: fontSizes.small, lineHeight: 1.7, color: c.textMuted, mt: 2 }}>
        Requests made with an API key are not saved as conversations by default. Pass{' '}
        <Keyword>&quot;store&quot;: true</Keyword> if you want them to appear in your chat history.
      </Typography>

      <CreateKeyDialog
        open={createOpen}
        submitting={submitting}
        error={createError}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
      />

      <RevealKeyDialog createdKey={createdKey} onClose={() => setCreatedKey(null)} />

      <ConfirmDialog
        open={pendingRevoke !== null}
        title="Revoke this key?"
        description={`Any application still using ${pendingRevoke?.name ?? 'this key'} will start failing immediately. This cannot be undone.`}
        confirmLabel="Revoke key"
        destructive
        busy={busy}
        error={actionError}
        onConfirm={handleRevoke}
        onClose={closeRevoke}
      />

      <ConfirmDialog
        open={pendingRotate !== null}
        title="Rotate this key?"
        description={`You'll get a new key straight away. ${pendingRotate?.name ?? 'The old key'} keeps working for 24 hours so you have time to deploy the replacement.`}
        confirmLabel="Rotate key"
        busy={busy}
        error={actionError}
        onConfirm={handleRotate}
        onClose={closeRotate}
      />
    </DocsShell>
  )
}

function ApiKeys() {
  return (
    <DocsThemeProvider>
      <ApiKeysContent />
    </DocsThemeProvider>
  )
}

export default ApiKeys
