// src/test/fixtures/users.ts

import type { User, UserRole } from '../../features/users/types'

function makeUser(partial: Partial<User> & Pick<User, 'id' | 'email'>): User {
  const now = new Date().toISOString()

  const defaultNameFromEmail =
    partial.name ?? partial.email.replace(/@.*/, '').replace(/[._-]/g, ' ')

  const role: UserRole = partial.role ?? 'viewer'

  return {
    id: partial.id,
    name: defaultNameFromEmail,
    email: partial.email.toLowerCase(),
    role,
    isActive: partial.isActive ?? true,
    createdAt: partial.createdAt ?? now,
    updatedAt: partial.updatedAt ?? now,
  }
}

export const userAdmin: User = makeUser({
  id: 'usr_admin_1',
  email: 'admin@example.com',
  name: 'Admin Demo',
  role: 'admin',
  isActive: true,
})

export const userEditor: User = makeUser({
  id: 'usr_editor_1',
  email: 'editor@example.com',
  name: 'Editor Demo',
  role: 'editor',
  isActive: true,
})

export const userViewerActive: User = makeUser({
  id: 'usr_viewer_1',
  email: 'viewer@example.com',
  name: 'Viewer Active',
  role: 'viewer',
  isActive: true,
})

export const userViewerInactive: User = makeUser({
  id: 'usr_viewer_2',
  email: 'viewer.inactive@example.com',
  name: 'Viewer Inactive',
  role: 'viewer',
  isActive: false,
})

/**
 * Array utama fixture users.
 */
export const usersFixture: User[] = [userAdmin, userEditor, userViewerActive, userViewerInactive]

/**
 * Helper untuk clone fixture (biar aman dimodifikasi di test).
 */
export function getUsersFixtureClone(): User[] {
  return usersFixture.map((u) => ({ ...u }))
}
