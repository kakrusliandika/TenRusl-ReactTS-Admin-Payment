// src/features/payments/components/CreatePaymentForm.tsx
import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Input } from '../../../components/ui/Input'
import { Textarea } from '../../../components/ui/Textarea'
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
import { createPaymentIdempotencyKey } from '../../../lib/idempotency'
import { usePaymentsStore } from '../store'
import type { CreatePaymentPayload } from '../types'

const createPaymentSchema = z.object({
  provider: z.string().min(1, 'Provider is required'),
  amount: z
    .union([z.number(), z.string()])
    .transform((value) => (typeof value === 'string' ? Number(value) : value))
    .refine((value) => !Number.isNaN(value), {
      message: 'Amount must be a valid number',
    })
    .refine((value) => value > 0, {
      message: 'Amount must be greater than 0',
    }),
  currency: z.string().min(1, 'Currency is required'),
  description: z
    .string()
    .max(500, 'Description is too long')
    .optional()
    .transform((value) => (value && value.trim().length ? value.trim() : undefined)),
  orderId: z
    .string()
    .max(100, 'Order ID is too long')
    .optional()
    .transform((value) => (value && value.trim().length ? value.trim() : undefined)),
})

type CreatePaymentFormValues = z.infer<typeof createPaymentSchema>

const PROVIDER_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'xendit', label: 'Xendit' },
  { value: 'midtrans', label: 'Midtrans' },
  { value: 'tripay', label: 'Tripay' },
  { value: 'mock', label: 'Mock' },
  { value: 'airwallex', label: 'Airwallex' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'stripe', label: 'Stripe' },
  { value: 'skrill', label: 'Skrill' },
  { value: 'payoneer', label: 'Payoneer' },
  { value: 'paddle', label: 'Paddle' },
  { value: 'oy', label: 'OY!' },
  { value: 'dana', label: 'DANA' },
  { value: 'doku', label: 'DOKU' },
  { value: 'lemonsqueezy', label: 'Lemon Squeezy' },
  { value: 'amazon_bwp', label: 'Amazon BWP' },
]

const CURRENCY_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'IDR', label: 'IDR' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
]

export function CreatePaymentForm(): React.ReactElement {
  const t = useT()
  const { showSuccess, showError } = useToast()
  const { createPayment, isCreating, error: storeError, clearError } = usePaymentsStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm<CreatePaymentFormValues>({
    defaultValues: {
      provider: '',
      amount: 0,
      currency: 'IDR',
      description: '',
      orderId: '',
    },
  })

  const onSubmit = async (rawValues: CreatePaymentFormValues) => {
    if (storeError) {
      clearError()
    }

    const parsed = createPaymentSchema.safeParse(rawValues)
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0]
        if (!field) return
        setError(field as keyof CreatePaymentFormValues, {
          type: 'manual',
          message: issue.message,
        })
      })
      return
    }

    const values = parsed.data

    const payload: CreatePaymentPayload = {
      provider: values.provider,
      amount: values.amount,
      currency: values.currency,
      description: values.description,
      // kirim orderId ke meta/metadata agar backend bisa pakai
      meta: values.orderId ? { order_id: values.orderId } : undefined,
    }

    const idempotencyKey = createPaymentIdempotencyKey()

    const payment = await createPayment(payload, {
      idempotencyKey,
    })

    if (!payment) {
      const message =
        storeError ??
        t('payments.create.error.generic', 'Failed to create payment. Please try again.')
      showError(t('payments.create.error.title', 'Create payment failed'), message)
      return
    }

    showSuccess(
      t('payments.create.success.title', 'Payment created'),
      t('payments.create.success.body', 'The simulated payment was created successfully.'),
    )

    reset({
      provider: values.provider,
      amount: 0,
      currency: values.currency,
      description: '',
      orderId: '',
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('payments.create.title', 'Create payment')}</CardTitle>
        <CardDescription>
          {t(
            'payments.create.subtitle',
            'Simulate a new payment using one of the supported providers.',
          )}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="contents">
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Provider */}
            <Select
              label={t('payments.fields.provider.label', 'Provider')}
              placeholder={t('payments.fields.provider.placeholder', 'Select provider')}
              options={PROVIDER_OPTIONS.map((opt) => ({
                value: opt.value,
                label: t(`payments.providers.${opt.value}`, opt.label),
              }))}
              error={errors.provider?.message}
              {...register('provider')}
            />

            {/* Currency */}
            <Select
              label={t('payments.fields.currency.label', 'Currency')}
              options={CURRENCY_OPTIONS}
              error={errors.currency?.message}
              {...register('currency')}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Amount */}
            <Input
              type="number"
              step="0.01"
              label={t('payments.fields.amount.label', 'Amount')}
              error={errors.amount?.message}
              helperText={t(
                'payments.fields.amount.helper',
                'Use positive values only. The simulator will not charge real money.',
              )}
              {...register('amount')}
            />

            {/* Order ID */}
            <Input
              label={t('payments.fields.orderId.label', 'Order ID')}
              optional
              helperText={t(
                'payments.fields.orderId.helper',
                'Optional reference to link this payment with your system.',
              )}
              error={errors.orderId?.message}
              {...register('orderId')}
            />
          </div>

          {/* Description */}
          <Textarea
            label={t('payments.fields.description.label', 'Description')}
            optional
            helperText={t(
              'payments.fields.description.helper',
              'Optional description shown in logs or simulator UI.',
            )}
            error={errors.description?.message}
            rows={4}
            {...register('description')}
          />
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isCreating}
            disabled={isCreating}
          >
            {t('payments.create.submit', 'Create payment')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
