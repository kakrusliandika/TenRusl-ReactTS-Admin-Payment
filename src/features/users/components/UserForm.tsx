// src/features/users/components/UserForm.tsx

import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { useT } from '../../../i18n'
import { useToast } from '../../../hooks/useToast'
import { useUsersStore } from '../store'
import type { User, UserRole } from '../types'

const roles: UserRole[] = ['admin', 'editor', 'viewer']

const userFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  role: z.enum(roles as [UserRole, ...UserRole[]], {
    // Versi Zod di project ini memakai `message`, bukan `required_error`
    message: 'Role is required',
  }),
})

type UserFormValues = z.infer<typeof userFormSchema>

export interface UserFormProps {
  /**
   * Jika ada selectedUser → mode edit, kalau null → mode create.
   */
  selectedUser?: User | null
  /**
   * Dipanggil setelah create/update sukses.
   * Misalnya untuk clear selection di page.
   */
  onFinish?: () => void
}

export function UserForm({ selectedUser, onFinish }: UserFormProps): React.ReactElement {
  const t = useT()
  const { showSuccess, showError } = useToast()
  const { addUser, updateUser, isSaving, error: storeError, clearError } = useUsersStore()

  const mode: 'create' | 'edit' = selectedUser ? 'edit' : 'create'

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm<UserFormValues>({
    defaultValues: {
      name: selectedUser?.name ?? '',
      email: selectedUser?.email ?? '',
      role: selectedUser?.role ?? 'viewer',
    },
  })

  // Sync nilai form setiap kali selectedUser berubah
  React.useEffect(() => {
    reset({
      name: selectedUser?.name ?? '',
      email: selectedUser?.email ?? '',
      role: selectedUser?.role ?? 'viewer',
    })
  }, [selectedUser, reset])

  const onSubmit = async (rawValues: UserFormValues) => {
    if (storeError) {
      clearError()
    }

    const parsed = userFormSchema.safeParse(rawValues)
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0]
        if (!field) return
        setError(field as keyof UserFormValues, {
          type: 'manual',
          message: issue.message,
        })
      })
      return
    }

    const values = parsed.data

    try {
      if (mode === 'create') {
        const created = await addUser({
          name: values.name,
          email: values.email,
          role: values.role,
          isActive: true,
        })

        if (!created) {
          const msg =
            storeError ?? t('users.form.create.error', 'Failed to create user. Please try again.')
          showError(t('users.form.errorTitle', 'User error'), msg)
          return
        }

        showSuccess(
          t('users.form.create.successTitle', 'User created'),
          t('users.form.create.successBody', 'The user has been created successfully.'),
        )

        reset({
          name: '',
          email: '',
          role: 'viewer',
        })
      } else if (selectedUser) {
        const updated = await updateUser(selectedUser.id, {
          name: values.name,
          email: values.email,
          role: values.role,
        })

        if (!updated) {
          const msg =
            storeError ?? t('users.form.update.error', 'Failed to update user. Please try again.')
          showError(t('users.form.errorTitle', 'User error'), msg)
          return
        }

        showSuccess(
          t('users.form.update.successTitle', 'User updated'),
          t('users.form.update.successBody', 'The user has been updated successfully.'),
        )

        if (onFinish) {
          onFinish()
        }
      }
    } catch (error) {
      showError(
        t('users.form.errorTitle', 'User error'),
        error instanceof Error ? error.message : 'Unexpected error',
      )
    }
  }

  const title =
    mode === 'create'
      ? t('users.form.create.title', 'Create user')
      : t('users.form.edit.title', 'Edit user')

  const subtitle =
    mode === 'create'
      ? t('users.form.create.subtitle', 'Add a new user to manage permissions in this dashboard.')
      : t('users.form.edit.subtitle', 'Update user details or role. Changes apply immediately.')

  const submitLabel =
    mode === 'create'
      ? t('users.form.create.submit', 'Create user')
      : t('users.form.edit.submit', 'Save changes')

  const showCancel = mode === 'edit'

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>

      <form noValidate onSubmit={handleSubmit(onSubmit)} className="contents">
        <CardContent className="space-y-4">
          <Input
            label={t('users.fields.name.label', 'Name')}
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            type="email"
            label={t('users.fields.email.label', 'Email')}
            helperText={t(
              'users.fields.email.helper',
              'Use a valid email address for login or notifications.',
            )}
            error={errors.email?.message}
            {...register('email')}
          />

          <Select
            label={t('users.fields.role.label', 'Role')}
            options={roles.map((role) => ({
              value: role,
              label: t(`users.roles.${role}`, role),
            }))}
            placeholder={t('users.fields.role.placeholder', 'Select a role')}
            error={errors.role?.message}
            {...register('role')}
          />
        </CardContent>

        <CardFooter className="flex justify-end gap-2">
          {showCancel && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSaving}
              onClick={() => {
                reset({
                  name: selectedUser?.name ?? '',
                  email: selectedUser?.email ?? '',
                  role: selectedUser?.role ?? 'viewer',
                })
                if (onFinish) onFinish()
              }}
            >
              {t('users.form.cancel', 'Cancel')}
            </Button>
          )}

          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSaving}
            disabled={isSaving}
          >
            {submitLabel}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
