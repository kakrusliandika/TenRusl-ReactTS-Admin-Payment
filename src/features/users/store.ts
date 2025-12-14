// src/features/users/store.ts

import { create } from 'zustand'
import type { User, UserCreateInput, UserId, UserUpdateInput } from './types'
import { fetchUsers, createUser, updateUser, deleteUser } from './api'

/**
 * Bentuk state utama untuk fitur Users.
 */
export interface UsersState {
  users: User[]
  isLoading: boolean
  isSaving: boolean
  error: string | null

  /** Ambil user by id dari state. */
  getById: (id: UserId) => User | undefined

  /** Reset error global. */
  clearError: () => void

  /** Muat ulang daftar users (mock fetch). */
  loadUsers: (params?: { search?: string }) => Promise<void>

  /** Tambah user baru. */
  addUser: (input: UserCreateInput) => Promise<User | null>

  /** Update user. */
  updateUser: (id: UserId, input: UserUpdateInput) => Promise<User | null>

  /** Hapus user. */
  removeUser: (id: UserId) => Promise<boolean>
}

/**
 * Helper: ambil pesan error dari Error biasa (karena masih mock).
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message
  }
  return 'Unexpected error in user store.'
}

export const useUsersStore = create<UsersState>((set, get) => ({
  users: [],
  isLoading: false,
  isSaving: false,
  error: null,

  getById: (id: UserId) => {
    return get().users.find((u) => u.id === id)
  },

  clearError: () => {
    set({ error: null })
  },

  async loadUsers(params) {
    set({ isLoading: true, error: null })

    try {
      const users = await fetchUsers({
        search: params?.search,
      })

      set({
        users,
        isLoading: false,
      })
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(error),
      })
    }
  },

  async addUser(input) {
    set({ isSaving: true, error: null })

    try {
      const user = await createUser(input)

      set((state) => ({
        users: [user, ...state.users],
        isSaving: false,
      }))

      return user
    } catch (error) {
      set({
        isSaving: false,
        error: getErrorMessage(error),
      })
      return null
    }
  },

  async updateUser(id, input) {
    set({ isSaving: true, error: null })

    try {
      const updated = await updateUser(id, input)

      set((state) => {
        const index = state.users.findIndex((u) => u.id === id)
        if (index === -1) {
          return {
            users: [updated, ...state.users],
            isSaving: false,
          }
        }

        const next = [...state.users]
        next[index] = updated

        return {
          users: next,
          isSaving: false,
        }
      })

      return updated
    } catch (error) {
      set({
        isSaving: false,
        error: getErrorMessage(error),
      })
      return null
    }
  },

  async removeUser(id) {
    set({ isSaving: true, error: null })

    try {
      await deleteUser(id)

      set((state) => ({
        users: state.users.filter((u) => u.id !== id),
        isSaving: false,
      }))

      return true
    } catch (error) {
      set({
        isSaving: false,
        error: getErrorMessage(error),
      })
      return false
    }
  },
}))
