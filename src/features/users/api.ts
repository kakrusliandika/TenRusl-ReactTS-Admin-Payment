// src/features/users/api.ts

import type { User, UserCreateInput, UserId, UserRole, UserUpdateInput } from './types'

/**
 * Untuk sementara kita pakai in-memory mock.
 * Nanti kalau sudah ada endpoint users beneran,
 * function-function di file ini yang diganti.
 */

let mockUsers: User[] = createInitialMockUsers()

function createInitialMockUsers(): User[] {
  const now = new Date().toISOString()

  const base: Array<{
    id: string
    name: string
    email: string
    role: UserRole
    isActive: boolean
  }> = [
    {
      id: 'u_admin',
      name: 'Admin Demo',
      email: 'admin@example.com',
      role: 'admin',
      isActive: true,
    },
    {
      id: 'u_editor',
      name: 'Editor Demo',
      email: 'editor@example.com',
      role: 'editor',
      isActive: true,
    },
    {
      id: 'u_viewer',
      name: 'Viewer Demo',
      email: 'viewer@example.com',
      role: 'viewer',
      isActive: false,
    },
  ]

  return base.map((u) => ({
    ...u,
    createdAt: now,
    updatedAt: now,
  }))
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function generateUserId(): string {
  return `usr_${Math.random().toString(36).slice(2, 10)}`
}

export interface FetchUsersParams {
  /**
   * Optional pencarian nama/email sederhana.
   */
  search?: string
}

/**
 * Ambil semua users (mock).
 */
export async function fetchUsers(params: FetchUsersParams = {}): Promise<User[]> {
  await delay(200)

  const search = (params.search ?? '').trim().toLowerCase()
  if (!search) {
    return [...mockUsers]
  }

  return mockUsers.filter((user) => {
    const nameMatch = user.name.toLowerCase().includes(search)
    const emailMatch = user.email.toLowerCase().includes(search)
    return nameMatch || emailMatch
  })
}

/**
 * Buat user baru (mock).
 */
export async function createUser(input: UserCreateInput): Promise<User> {
  await delay(200)

  const now = new Date().toISOString()

  const user: User = {
    id: generateUserId(),
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    role: input.role,
    isActive: input.isActive ?? true,
    createdAt: now,
    updatedAt: now,
  }

  mockUsers = [user, ...mockUsers]

  return user
}

/**
 * Update user (mock).
 */
export async function updateUser(id: UserId, input: UserUpdateInput): Promise<User> {
  await delay(200)

  const index = mockUsers.findIndex((u) => u.id === id)
  if (index === -1) {
    throw new Error('User not found')
  }

  const now = new Date().toISOString()
  const existing = mockUsers[index]

  const updated: User = {
    ...existing,
    ...input,
    name: input.name?.trim() ?? existing.name,
    email: input.email?.trim().toLowerCase() ?? existing.email,
    updatedAt: now,
  }

  mockUsers = [...mockUsers]
  mockUsers[index] = updated

  return updated
}

/**
 * Hapus user (mock).
 */
export async function deleteUser(id: UserId): Promise<void> {
  await delay(150)

  mockUsers = mockUsers.filter((u) => u.id !== id)
}
