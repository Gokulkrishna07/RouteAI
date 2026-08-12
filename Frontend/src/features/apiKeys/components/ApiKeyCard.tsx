import { useState } from 'react'
import { Box, CircularProgress, IconButton, Menu, MenuItem, Typography } from '@mui/material'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import { fonts, fontSizes } from '../../../constants'
import { useDocsTheme } from '../../../docs/DocsLayout'
import { getErrorMessage } from '../../../lib/apiClient'
import { fetchApiKeyUsage, getApiKeyStatus, maskApiKey, type ApiKey, type ApiKeyUsage } from '../../../lib/apiKeys'
import { REQUEST_ERRORS, SCOPE_OPTIONS, STATUS_LABELS } from '../apiKeys.constants'
import { formatCount, formatDate } from '../apiKeys.format'

const STATUS_COLORS = {
  active: { bg: 'rgba(5, 150, 105, 0.12)', text: '#059669' },
  expired: { bg: 'rgba(217, 119, 6, 0.12)', text: '#D97706' },
  revoked: { bg: 'rgba(220, 38, 38, 0.12)', text: '#DC2626' },
} as const

function scopeLabel(scope: string): string {
  return SCOPE_OPTIONS.find((option) => option.value === scope)?.label ?? scope
}

function Meta({ label, value }: { label: string; value: string }) {
  const { c } = useDocsTheme()
  return (
    <Box>
      <Typography sx={{ fontSize: fontSizes.tiny, color: c.textMuted, mb: 0.25 }}>{label}</Typography>
      <Typography sx={{ fontSize: fontSizes.small, color: c.textSecondary }}>{value}</Typography>
    </Box>
  )
}

export function ApiKeyCard({
  apiKey,
  onRotate,
  onRevoke,
}: {
  apiKey: ApiKey
  onRotate: (key: ApiKey) => void
  onRevoke: (key: ApiKey) => void
}) {
  const { c } = useDocsTheme()
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)
  const [usage, setUsage] = useState<ApiKeyUsage | null>(null)
  const [usageLoading, setUsageLoading] = useState(false)
  const [usageError, setUsageError] = useState<string | null>(null)

  const status = getApiKeyStatus(apiKey)
  const statusColor = STATUS_COLORS[status]
  const isActive = status === 'active'

  const closeMenu = () => setMenuAnchor(null)

  const handleShowUsage = async () => {
    closeMenu()
    setUsageLoading(true)
    setUsageError(null)
    try {
      setUsage(await fetchApiKeyUsage(apiKey.id))
    } catch (err) {
      setUsageError(getErrorMessage(err, REQUEST_ERRORS.usage))
    } finally {
      setUsageLoading(false)
    }
  }

  return (
    <Box
      component="li"
      sx={{
        listStyle: 'none',
        p: 2.5,
        borderRadius: 2,
        bgcolor: c.surface,
        border: `1px solid ${c.border}`,
        opacity: isActive ? 1 : 0.75,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.75 }}>
            <Typography
              sx={{
                fontFamily: fonts.heading,
                fontWeight: 700,
                fontSize: fontSizes.h3,
                color: c.textPrimary,
              }}
            >
              {apiKey.name}
            </Typography>
            <Box
              sx={{
                px: 1,
                py: 0.125,
                borderRadius: 1,
                bgcolor: statusColor.bg,
                color: statusColor.text,
                fontSize: fontSizes.tiny,
                fontWeight: 700,
              }}
            >
              {STATUS_LABELS[status]}
            </Box>
          </Box>
          <Typography
            component="code"
            sx={{
              fontFamily: fonts.mono,
              fontSize: fontSizes.small,
              color: c.textSecondary,
              wordBreak: 'break-all',
            }}
          >
            {maskApiKey(apiKey)}
          </Typography>
        </Box>

        <IconButton
          size="small"
          aria-label={`Actions for ${apiKey.name}`}
          onClick={(event) => setMenuAnchor(event.currentTarget)}
          sx={{ color: c.textSecondary }}
        >
          <MoreHorizIcon fontSize="small" />
        </IconButton>

        <Menu
          anchorEl={menuAnchor}
          open={menuAnchor !== null}
          onClose={closeMenu}
          slotProps={{ paper: { sx: { bgcolor: c.bg, border: `1px solid ${c.border}`, backgroundImage: 'none' } } }}
        >
          <MenuItem onClick={handleShowUsage} sx={{ fontSize: fontSizes.small, color: c.textPrimary }}>
            View usage
          </MenuItem>
          <MenuItem
            onClick={() => {
              closeMenu()
              onRotate(apiKey)
            }}
            disabled={!isActive}
            sx={{ fontSize: fontSizes.small, color: c.textPrimary }}
          >
            Rotate
          </MenuItem>
          <MenuItem
            onClick={() => {
              closeMenu()
              onRevoke(apiKey)
            }}
            disabled={status === 'revoked'}
            sx={{ fontSize: fontSizes.small, color: '#DC2626' }}
          >
            Revoke
          </MenuItem>
        </Menu>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
        {apiKey.scopes.map((scope) => (
          <Box
            key={scope}
            sx={{
              px: 1,
              py: 0.25,
              borderRadius: 1,
              bgcolor: c.accentBg,
              color: c.accent,
              fontSize: fontSizes.tiny,
              fontWeight: 600,
            }}
          >
            {scopeLabel(scope)}
          </Box>
        ))}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
          gap: 2,
        }}
      >
        <Meta label="Created" value={formatDate(apiKey.createdAt)} />
        <Meta label="Last used" value={formatDate(apiKey.lastUsedAt, 'Never')} />
        <Meta label="Rate limit" value={`${apiKey.rateLimit}/min`} />
        <Meta label="Expires" value={formatDate(apiKey.expiresAt, 'Never')} />
      </Box>

      {usageLoading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
          <CircularProgress size={14} sx={{ color: c.textMuted }} />
          <Typography sx={{ fontSize: fontSizes.small, color: c.textMuted }}>Loading usage...</Typography>
        </Box>
      ) : null}

      {usageError ? (
        <Typography sx={{ fontSize: fontSizes.small, color: '#DC2626', mt: 2 }}>{usageError}</Typography>
      ) : null}

      {usage ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
            gap: 2,
            mt: 2,
            pt: 2,
            borderTop: `1px solid ${c.border}`,
          }}
        >
          <Meta label="Requests" value={formatCount(usage.totalRequests)} />
          <Meta label="Prompt tokens" value={formatCount(usage.totalPromptTokens)} />
          <Meta label="Output tokens" value={formatCount(usage.totalOutputTokens)} />
          <Meta label="Total tokens" value={formatCount(usage.totalTokens)} />
        </Box>
      ) : null}
    </Box>
  )
}

export default ApiKeyCard
