// src/features/users/components/UsersTable.tsx

import React from 'react'
import { useT } from '../../../i18n'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../../../components/ui/Card'
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from '../../../components/ui/Table'
import { Button } from '../../../components/ui/Button'
import { Badge } from '../../../components/ui/Badge'
import { Spinner } from '../../../components/ui/Spinner'
import { Input } from '../../../components/ui/Input'
import { ModalConfirm } from '../../../components/ui/Modal'
import { useUsersStore } from '../store'
import type { User } from '../types'
import { formatDateTime } from '../../../lib/format'
import { useToast } from '../../../hooks/useToast'

export interface UsersTableProps {
  onEditUser: (user: User) => void
}

/**
 * UsersTable – tabel utama daftar user demo.
 *
 * Catatan penting:
 * - Komponen ini TIDAK lagi memanggil loadUsers() otomatis di useEffect.
 *   Pemanggilan loadUsers diserahkan ke event user (tombol Refresh / Search)
 *   atau ke komponen parent, agar menghindari kemungkinan loop update.
 */
export function UsersTable({ onEditUser }: UsersTableProps): React.ReactElement {
  const t = useT()
  const { showError, showInfo } = useToast()

  const { users, isLoading, isSaving, error, clearError, loadUsers, removeUser } = useUsersStore()

  const [search, setSearch] = React.useState('')
  const [userToDelete, setUserToDelete] = React.useState<User | null>(null)

  const hasUsers = users.length > 0
  const busy = isLoading || isSaving

  const handleRefresh = async () => {
    try {
      await loadUsers({ search: search || undefined })
    } catch (e) {
      showError(
        t('users.table.loadErrorTitle', 'Failed to load users'),
        e instanceof Error ? e.message : 'Unexpected error',
      )
    }
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setSearch(value)

    // Pencarian akan memuat ulang daftar user sesuai query.
    Promise.resolve(loadUsers({ search: value || undefined })).catch((e) => {
      showError(
        t('users.table.loadErrorTitle', 'Failed to load users'),
        e instanceof Error ? e.message : 'Unexpected error',
      )
    })
  }

  const handleDelete = async () => {
    if (!userToDelete) return

    const id = userToDelete.id
    const name = userToDelete.name

    const success = await removeUser(id)
    if (!success) {
      showError(
        t('users.table.deleteErrorTitle', 'Failed to delete user'),
        t('users.table.deleteErrorBody', 'The user could not be deleted. Please try again.'),
      )
    } else {
      showInfo(
        t('users.table.deleteSuccessTitle', 'User deleted'),
        t('users.table.deleteSuccessBody', 'The user "{{name}}" has been removed.').replace(
          '{{name}}',
          name,
        ),
      )
    }

    setUserToDelete(null)
  }

  return (
    <Card>
      <CardHeader className="space-y-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>{t('users.table.title', 'Users')}</CardTitle>
            <CardDescription>
              {t('users.table.subtitle', 'Manage demo users and their roles for this admin panel.')}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={busy}
            >
              {t('users.table.refresh', 'Refresh')}
            </Button>
          </div>
        </div>

        <div className="mt-2">
          <Input
            label={t('users.table.search.label', 'Search')}
            placeholder={t('users.table.search.placeholder', 'Search by name or email…')}
            value={search}
            onChange={handleSearchChange}
          />
        </div>

        {error && (
          <div className="mt-2 rounded-md border border-rose-500/40 bg-rose-950/60 px-3 py-2 text-[0.75rem] text-rose-100">
            <div className="flex items-start justify-between gap-2">
              <p>{error}</p>
              <button
                type="button"
                onClick={clearError}
                className="text-xs text-rose-200 hover:text-rose-50"
              >
                {t('common.actions.dismiss', 'Dismiss')}
              </button>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {isLoading && !hasUsers ? (
          <div className="flex items-center justify-center py-10">
            <Spinner size={24} accent />
          </div>
        ) : !hasUsers ? (
          <p className="py-6 text-center text-[0.8rem] text-slate-400">
            {t(
              'users.table.empty',
              'No users found. Create a new user using the form on the left.',
            )}
          </p>
        ) : (
          <div className="space-y-2">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>{t('users.table.columns.name', 'Name')}</TableHeaderCell>
                  <TableHeaderCell>{t('users.table.columns.email', 'Email')}</TableHeaderCell>
                  <TableHeaderCell>{t('users.table.columns.role', 'Role')}</TableHeaderCell>
                  <TableHeaderCell>{t('users.table.columns.status', 'Status')}</TableHeaderCell>
                  <TableHeaderCell>
                    {t('users.table.columns.createdAt', 'Created at')}
                  </TableHeaderCell>
                  <TableHeaderCell>{t('users.table.columns.actions', 'Actions')}</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="text-[0.8rem]">{user.name}</TableCell>
                    <TableCell className="text-[0.8rem] text-slate-300">{user.email}</TableCell>
                    <TableCell className="text-[0.8rem] capitalize">
                      {t(`users.roles.${user.role}`, user.role)}
                    </TableCell>
                    <TableCell>
                      {user.isActive ? (
                        <Badge variant="success">{t('users.status.active', 'Active')}</Badge>
                      ) : (
                        <Badge variant="muted">{t('users.status.inactive', 'Inactive')}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-[0.75rem] text-slate-300">
                      {formatDateTime(user.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => onEditUser(user)}
                          disabled={busy}
                        >
                          {t('users.table.actions.edit', 'Edit')}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="danger"
                          onClick={() => setUserToDelete(user)}
                          disabled={busy}
                        >
                          {t('users.table.actions.delete', 'Delete')}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {busy && hasUsers && (
              <div className="flex items-center gap-2 text-[0.75rem] text-slate-400">
                <Spinner size={14} accent />
                <span>{t('users.table.loadingInline', 'Processing user changes…')}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Modal konfirmasi hapus */}
      <ModalConfirm
        open={Boolean(userToDelete)}
        onClose={() => setUserToDelete(null)}
        title={t('users.delete.title', 'Delete user')}
        description={t(
          'users.delete.description',
          'Are you sure you want to delete this user? This action cannot be undone.',
        )}
        confirmLabel={t('users.delete.confirm', 'Delete')}
        cancelLabel={t('users.delete.cancel', 'Cancel')}
        confirmVariant="danger"
        onConfirm={handleDelete}
      >
        {userToDelete ? (
          <p className="text-[0.8rem] text-slate-200">
            {t('users.delete.body', 'You are about to delete "{{name}}" ({{email}}).')
              .replace('{{name}}', userToDelete.name)
              .replace('{{email}}', userToDelete.email)}
          </p>
        ) : null}
      </ModalConfirm>
    </Card>
  )
}
