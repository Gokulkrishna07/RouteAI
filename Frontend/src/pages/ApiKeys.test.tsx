import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import { AxiosError } from 'axios'
import { renderWithProviders } from '../test/renderWithProviders'
import type { ApiKey } from '../lib/apiKeys'
import { REQUEST_ERRORS, VALIDATION_MESSAGES } from '../features/apiKeys/apiKeys.constants'
import { REVEAL_WARNING } from '../features/apiKeys/components/RevealKeyDialog'
import ApiKeys, { EMPTY_STATE_TITLE } from './ApiKeys'

const fetchApiKeysMock = vi.fn()
const createApiKeyMock = vi.fn()
const revokeApiKeyMock = vi.fn()
const rotateApiKeyMock = vi.fn()
const fetchApiKeyUsageMock = vi.fn()

vi.mock('../lib/apiKeys', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/apiKeys')>()),
  fetchApiKeys: (...args: unknown[]) => fetchApiKeysMock(...args),
  createApiKey: (...args: unknown[]) => createApiKeyMock(...args),
  revokeApiKey: (...args: unknown[]) => revokeApiKeyMock(...args),
  rotateApiKey: (...args: unknown[]) => rotateApiKeyMock(...args),
  fetchApiKeyUsage: (...args: unknown[]) => fetchApiKeyUsageMock(...args),
}))

const KEY: ApiKey = {
  id: 'key-1',
  name: 'Production',
  keyPrefix: 'amr_live_abcdef',
  lastFour: 'wxyz',
  scopes: ['chat:write', 'usage:read'],
  rateLimit: 60,
  lastUsedAt: null,
  expiresAt: null,
  revokedAt: null,
  createdAt: '2026-01-01T00:00:00.000Z',
}

function apiError(message?: string, status = 400) {
  return new AxiosError('Request failed', undefined, undefined, undefined, {
    status,
    statusText: 'Bad Request',
    headers: {},
    config: { headers: undefined as never },
    data: message ? { message } : {},
  })
}

async function openActionsMenu(user: ReturnType<typeof renderWithProviders>['user']) {
  await user.click(await screen.findByLabelText('Actions for Production'))
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  fetchApiKeysMock.mockResolvedValue([])
})

describe('ApiKeys', () => {
  it('shows the empty state when the developer has no keys', async () => {
    renderWithProviders(<ApiKeys />)

    expect(await screen.findByText(EMPTY_STATE_TITLE)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create your first key/i })).toBeInTheDocument()
  })

  it('lists existing keys with their masked value and status', async () => {
    fetchApiKeysMock.mockResolvedValue([KEY])
    renderWithProviders(<ApiKeys />)

    expect(await screen.findByText('Production')).toBeInTheDocument()
    expect(screen.getByText(/amr_live_abcdef.*wxyz/)).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('60/min')).toBeInTheDocument()
    expect(screen.getByText('Send chat requests')).toBeInTheDocument()
  })

  it('marks an expired key as expired', async () => {
    fetchApiKeysMock.mockResolvedValue([{ ...KEY, expiresAt: '2000-01-01T00:00:00.000Z' }])
    renderWithProviders(<ApiKeys />)

    expect(await screen.findByText('Expired')).toBeInTheDocument()
  })

  it('surfaces a load failure', async () => {
    fetchApiKeysMock.mockRejectedValue(apiError())
    renderWithProviders(<ApiKeys />)

    expect(await screen.findByRole('alert')).toHaveTextContent(REQUEST_ERRORS.load)
  })

  it('creates a key and reveals it exactly once', async () => {
    createApiKeyMock.mockResolvedValue({ ...KEY, key: 'amr_live_supersecret' })
    const { user } = renderWithProviders(<ApiKeys />)

    await user.click(await screen.findByRole('button', { name: /create your first key/i }))
    await user.type(screen.getByLabelText('Name'), 'Production')
    await user.click(screen.getByRole('button', { name: 'Create key' }))

    expect(await screen.findByText('amr_live_supersecret')).toBeInTheDocument()
    expect(screen.getByText(REVEAL_WARNING)).toBeInTheDocument()
    expect(createApiKeyMock).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Production', rateLimit: 60 }),
    )

    await user.click(screen.getByRole('button', { name: /saved it/i }))

    await waitFor(() => {
      expect(screen.queryByText('amr_live_supersecret')).not.toBeInTheDocument()
    })
  })

  it('does not submit without a name', async () => {
    const { user } = renderWithProviders(<ApiKeys />)

    await user.click(await screen.findByRole('button', { name: /create your first key/i }))
    await user.click(screen.getByRole('button', { name: 'Create key' }))

    expect(await screen.findByText(VALIDATION_MESSAGES.nameRequired)).toBeInTheDocument()
    expect(createApiKeyMock).not.toHaveBeenCalled()
  })

  it('requires at least one permission', async () => {
    const { user } = renderWithProviders(<ApiKeys />)

    await user.click(await screen.findByRole('button', { name: /create your first key/i }))
    await user.type(screen.getByLabelText('Name'), 'Production')
    for (const checkbox of screen.getAllByRole('checkbox')) {
      await user.click(checkbox)
    }
    await user.click(screen.getByRole('button', { name: 'Create key' }))

    expect(await screen.findByText(VALIDATION_MESSAGES.scopesRequired)).toBeInTheDocument()
    expect(createApiKeyMock).not.toHaveBeenCalled()
  })

  it('surfaces a creation failure without closing the form', async () => {
    createApiKeyMock.mockRejectedValue(apiError('Name is already taken'))
    const { user } = renderWithProviders(<ApiKeys />)

    await user.click(await screen.findByRole('button', { name: /create your first key/i }))
    await user.type(screen.getByLabelText('Name'), 'Production')
    await user.click(screen.getByRole('button', { name: 'Create key' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Name is already taken')
    expect(screen.getByRole('button', { name: 'Create key' })).toBeInTheDocument()
  })

  it('revokes a key after confirmation', async () => {
    fetchApiKeysMock.mockResolvedValue([KEY])
    revokeApiKeyMock.mockResolvedValue(undefined)
    const { user } = renderWithProviders(<ApiKeys />)

    await openActionsMenu(user)
    await user.click(screen.getByRole('menuitem', { name: 'Revoke' }))
    await user.click(screen.getByRole('button', { name: 'Revoke key' }))

    expect(await screen.findByText('Revoked')).toBeInTheDocument()
    expect(revokeApiKeyMock).toHaveBeenCalledWith('key-1')
  })

  it('keeps the key untouched when the revoke dialog is cancelled', async () => {
    fetchApiKeysMock.mockResolvedValue([KEY])
    const { user } = renderWithProviders(<ApiKeys />)

    await openActionsMenu(user)
    await user.click(screen.getByRole('menuitem', { name: 'Revoke' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Revoke key' })).not.toBeInTheDocument()
    })
    expect(revokeApiKeyMock).not.toHaveBeenCalled()
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('rotates a key and reveals the replacement', async () => {
    fetchApiKeysMock.mockResolvedValue([KEY])
    rotateApiKeyMock.mockResolvedValue({ ...KEY, id: 'key-2', key: 'amr_live_rotated' })
    const { user } = renderWithProviders(<ApiKeys />)

    await openActionsMenu(user)
    await user.click(screen.getByRole('menuitem', { name: 'Rotate' }))
    await user.click(screen.getByRole('button', { name: 'Rotate key' }))

    expect(await screen.findByText('amr_live_rotated')).toBeInTheDocument()
    expect(rotateApiKeyMock).toHaveBeenCalledWith('key-1', 24 * 60 * 60)
  })

  it('loads usage for a key on demand', async () => {
    fetchApiKeysMock.mockResolvedValue([KEY])
    fetchApiKeyUsageMock.mockResolvedValue({
      totalRequests: 12,
      totalPromptTokens: 340,
      totalOutputTokens: 560,
      totalTokens: 900,
    })
    const { user } = renderWithProviders(<ApiKeys />)

    await openActionsMenu(user)
    await user.click(screen.getByRole('menuitem', { name: 'View usage' }))

    expect(await screen.findByText('Requests')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('900')).toBeInTheDocument()
    expect(fetchApiKeyUsageMock).toHaveBeenCalledWith('key-1')
  })

  it('surfaces a usage failure on the card', async () => {
    fetchApiKeysMock.mockResolvedValue([KEY])
    fetchApiKeyUsageMock.mockRejectedValue(apiError())
    const { user } = renderWithProviders(<ApiKeys />)

    await openActionsMenu(user)
    await user.click(screen.getByRole('menuitem', { name: 'View usage' }))

    expect(await screen.findByText(REQUEST_ERRORS.usage)).toBeInTheDocument()
  })

  it('does not offer rotation for a revoked key', async () => {
    fetchApiKeysMock.mockResolvedValue([{ ...KEY, revokedAt: '2026-02-01T00:00:00.000Z' }])
    const { user } = renderWithProviders(<ApiKeys />)

    await openActionsMenu(user)

    const menu = screen.getByRole('menu')
    expect(within(menu).getByRole('menuitem', { name: 'Rotate' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
    expect(within(menu).getByRole('menuitem', { name: 'Revoke' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
  })

  it('shows a copyable request example', async () => {
    renderWithProviders(<ApiKeys />)

    expect(await screen.findByText(/x-api-key: amr_live_your_key_here/)).toBeInTheDocument()
    expect(screen.getByLabelText('Copy example')).toBeInTheDocument()
  })

  it('copies the revealed key to the clipboard', async () => {
    createApiKeyMock.mockResolvedValue({ ...KEY, key: 'amr_live_supersecret' })
    const { user } = renderWithProviders(<ApiKeys />)

    await user.click(await screen.findByRole('button', { name: /create your first key/i }))
    await user.type(screen.getByLabelText('Name'), 'Production')
    await user.click(screen.getByRole('button', { name: 'Create key' }))

    await user.click(await screen.findByLabelText('Copy API key'))

    await expect(navigator.clipboard.readText()).resolves.toBe('amr_live_supersecret')
    expect(await screen.findByLabelText('Copied')).toBeInTheDocument()
  })

  it('sends the chosen expiry when creating a key', async () => {
    createApiKeyMock.mockResolvedValue({ ...KEY, key: 'amr_live_supersecret' })
    const { user } = renderWithProviders(<ApiKeys />)

    await user.click(await screen.findByRole('button', { name: /create your first key/i }))
    await user.type(screen.getByLabelText('Name'), 'Production')
    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: '90 days' }))
    await user.click(screen.getByRole('button', { name: 'Create key' }))

    await waitFor(() => {
      expect(createApiKeyMock).toHaveBeenCalledWith(
        expect.objectContaining({ expiresInDays: 90 }),
      )
    })
  })

  it('discards the form when the create dialog is cancelled', async () => {
    const { user } = renderWithProviders(<ApiKeys />)

    await user.click(await screen.findByRole('button', { name: /create your first key/i }))
    await user.type(screen.getByLabelText('Name'), 'Production')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    await waitFor(() => {
      expect(screen.queryByLabelText('Name')).not.toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /create your first key/i }))

    expect(await screen.findByLabelText('Name')).toHaveValue('')
    expect(createApiKeyMock).not.toHaveBeenCalled()
  })
})
