// src/features/users/types.ts

/**
 * Role user di sistem admin.
 */
export type UserRole = 'admin' | 'editor' | 'viewer'

/**
 * Bentuk user utama yang dipakai di frontend.
 */
export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  isActive: boolean
  createdAt: string
  updatedAt: string
}

/**
 * Input untuk membuat user baru (tanpa id, createdAt, updatedAt).
 */
export interface UserCreateInput {
  name: string
  email: string
  role: UserRole
  isActive?: boolean
}

/**
 * Input untuk update user.
 * Minimal satu field harus diisi.
 */
export interface UserUpdateInput {
  name?: string
  email?: string
  role?: UserRole
  isActive?: boolean
}

/**
 * Id user.
 */
export type UserId = string
