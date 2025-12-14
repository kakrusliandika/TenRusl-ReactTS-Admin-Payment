// src/test/features/users/UsersTable.test.tsx

import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UsersTable } from '../../../features/users/components/UsersTable'
import { useUsersStore } from '../../../features/users/store'
import { usersFixture, getUsersFixtureClone } from '../../fixtures/users'
import { I18nProvider } from '../../../i18n'

// Mock useToast supaya tidak perlu ToastProvider
const mockShowError = vi.fn()
const mockShowInfo = vi.fn()

vi.mock('../../../hooks/useToast', () => {
  return {
    useToast: () => ({
      showSuccess: vi.fn(),
      showError: mockShowError,
      showInfo: mockShowInfo,
      dismiss: vi.fn(),
    }),
  }
})

/**
 * Helper render dengan I18nProvider
 * supaya useT/useI18n tidak error.
 */
function renderWithProviders(ui: React.ReactElement) {
  return render(<I18nProvider initialLocaleCode="en">{ui}</I18nProvider>)
}

describe('UsersTable', () => {
  const mockLoadUsers = vi.fn()
  const mockRemoveUser = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    useUsersStore.setState((state) => ({
      ...state,
      users: getUsersFixtureClone(),
      isLoading: false,
      isSaving: false,
      error: null,
      loadUsers: mockLoadUsers,
      removeUser: mockRemoveUser,
    }))
  })

  it('merender data user dari store', () => {
    const handleEdit = vi.fn()

    renderWithProviders(<UsersTable onEditUser={handleEdit} />)

    expect(screen.getByText(/admin demo/i)).toBeInTheDocument()
    expect(screen.getByText(/editor demo/i)).toBeInTheDocument()
    expect(screen.getByText(/viewer active/i)).toBeInTheDocument()

    expect(screen.getByText(/admin@example.com/i)).toBeInTheDocument()
    expect(screen.getByText(/editor@example.com/i)).toBeInTheDocument()
  })

  it('memanggil callback onEditUser ketika tombol Edit diklik', async () => {
    const user = userEvent.setup()
    const handleEdit = vi.fn()

    renderWithProviders(<UsersTable onEditUser={handleEdit} />)

    // Ambil tombol Edit pertama (untuk Admin Demo)
    const editButtons = screen.getAllByRole('button', {
      name: /edit/i,
    })

    await user.click(editButtons[0])

    expect(handleEdit).toHaveBeenCalledTimes(1)
    expect(handleEdit).toHaveBeenCalledWith(
      expect.objectContaining({
        id: usersFixture[0].id,
        email: usersFixture[0].email,
      }),
    )
  })

  it('membuka modal konfirmasi dan memanggil removeUser ketika Delete dikonfirmasi', async () => {
    const user = userEvent.setup()
    const handleEdit = vi.fn()

    mockRemoveUser.mockResolvedValueOnce(true)

    renderWithProviders(<UsersTable onEditUser={handleEdit} />)

    // Klik tombol Delete pertama
    const deleteButtons = screen.getAllByRole('button', {
      name: /delete/i,
    })
    await user.click(deleteButtons[0])

    // Modal harus muncul
    expect(await screen.findByText(/delete user/i)).toBeInTheDocument()

    // Pastikan nama user muncul DI DALAM dialog, bukan asal di halaman
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText(/admin demo/i)).toBeInTheDocument()

    // Cari tombol Delete di dalam modal (ambil yang terakhir)
    const allDeleteButtons = screen.getAllByRole('button', {
      name: /delete/i,
    })
    const confirmButton = allDeleteButtons[allDeleteButtons.length - 1]

    await user.click(confirmButton)

    await waitFor(() => {
      expect(mockRemoveUser).toHaveBeenCalledTimes(1)
    })

    expect(mockRemoveUser).toHaveBeenCalledWith(usersFixture[0].id)

    // Toast info di-trigger
    expect(mockShowInfo).toHaveBeenCalled()
  })
})
