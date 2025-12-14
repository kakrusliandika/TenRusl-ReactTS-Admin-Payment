// src/features/users/pages/UsersPage.tsx

import React from 'react'
import { useT } from '../../../i18n'
import { UserForm } from '../components/UserForm'
import { UsersTable } from '../components/UsersTable'
import type { User } from '../types'
import { useKeyboardShortcut } from '../../../hooks/useKeyboardShortcuts'

/**
 * UsersPage – halaman pengelolaan user.
 *
 * Kiri: UserForm (create/edit)
 * Kanan: UsersTable (list + edit/hapus)
 */
export default function UsersPage(): React.ReactElement {
  const t = useT()
  const [editingUser, setEditingUser] = React.useState<User | null>(null)

  const formRef = React.useRef<HTMLDivElement | null>(null)
  const listRef = React.useRef<HTMLDivElement | null>(null)

  // Shortcut ke form: Ctrl+Shift+U
  useKeyboardShortcut('Ctrl+Shift+U', (event) => {
    event.preventDefault()
    if (formRef.current) {
      formRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  })

  // Shortcut ke list: Ctrl+Shift+J
  useKeyboardShortcut('Ctrl+Shift+J', (event) => {
    event.preventDefault()
    if (listRef.current) {
      listRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  })

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Intro atas halaman */}
      <section className="space-y-1">
        <p className="text-xs text-slate-400 sm:text-sm">
          {t(
            'users.page.intro',
            'Manage demo users, their roles, and access within this admin dashboard.',
          )}
        </p>
        <p className="text-[0.7rem] text-slate-500 sm:text-xs">
          {t(
            'users.page.shortcuts',
            'Keyboard shortcuts: Ctrl+Shift+U to jump to the user form, Ctrl+Shift+J to jump to the users list.',
          )}
        </p>
      </section>

      {/* Grid utama: form + tabel */}
      <section className="grid gap-4 lg:grid-cols-2">
        {/* Kolom kiri: form */}
        <div ref={formRef} className="scroll-mt-24">
          <UserForm selectedUser={editingUser} onFinish={() => setEditingUser(null)} />
        </div>

        {/* Kolom kanan: tabel */}
        <div ref={listRef} className="scroll-mt-24">
          <UsersTable
            onEditUser={(user) => {
              setEditingUser(user)
              if (formRef.current) {
                formRef.current.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start',
                })
              }
            }}
          />
        </div>
      </section>
    </div>
  )
}
