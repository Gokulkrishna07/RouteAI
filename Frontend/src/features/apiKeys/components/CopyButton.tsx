import { useEffect, useRef, useState } from 'react'
import { IconButton, Tooltip } from '@mui/material'
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import { useDocsTheme } from '../../../docs/DocsLayout'
import { COPIED_LABEL, COPY_LABEL } from '../apiKeys.constants'

const RESET_DELAY_MS = 1600

export function CopyButton({ value, label = COPY_LABEL }: { value: string; label?: string }) {
  const { c } = useDocsTheme()
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }, [])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      return
    }
    setCopied(true)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setCopied(false), RESET_DELAY_MS)
  }

  return (
    <Tooltip title={copied ? COPIED_LABEL : label} arrow>
      <IconButton
        onClick={handleCopy}
        size="small"
        aria-label={copied ? COPIED_LABEL : label}
        sx={{ color: copied ? c.get : c.textSecondary }}
      >
        {copied ? (
          <CheckRoundedIcon sx={{ fontSize: 17 }} />
        ) : (
          <ContentCopyOutlinedIcon sx={{ fontSize: 17 }} />
        )}
      </IconButton>
    </Tooltip>
  )
}

export default CopyButton
