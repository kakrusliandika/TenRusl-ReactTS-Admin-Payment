import React, { useEffect, useRef } from 'react'
import { focusFirstFocusable } from '../../lib/keyboard'
import { Button } from './Button'

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

export interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children?: React.ReactNode
  /**
   * Optional footer custom; kalau tidak diisi, kamu bisa render button di children.
   */
  footer?: React.ReactNode
  /**
   * Aria-label custom untuk close button (kalau mau i18n).
   */
  closeLabel?: string
}

/**
 * Modal – kerangka dialog dengan overlay, tombol close, dan ESC support.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  closeLabel = 'Close dialog',
}: ModalProps): React.ReactElement | null {
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)

  // Lock scroll ketika modal open
  useEffect(() => {
    if (!open) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [open])

  // Fokus pertama kali ke panel / elemen fokus-able di dalam
  useEffect(() => {
    if (!open || !panelRef.current) return
    focusFirstFocusable(panelRef.current)
  }, [open])

  // ESC untuk close
  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  const titleId = title ? 'modal-title' : undefined
  const descId = description ? 'modal-description' : undefined

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === overlayRef.current) {
      onClose()
    }
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm"
      onClick={handleOverlayClick}
      aria-hidden={false}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className={classNames(
          'relative w-full max-w-lg rounded-xl border border-slate-800 bg-slate-950 shadow-xl',
          'mx-4',
        )}
      >
        <div className="flex items-start justify-between border-b border-slate-800 px-4 py-3 sm:px-5 sm:py-4">
          <div className="min-w-0">
            {title && (
              <h2
                id={titleId}
                className="truncate text-sm font-semibold text-slate-50 sm:text-base"
              >
                {title}
              </h2>
            )}
            {description && (
              <p id={descId} className="mt-1 text-xs text-slate-400 sm:text-sm">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            aria-label={closeLabel}
            onClick={onClose}
            className="ml-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div className="px-4 py-3 sm:px-5 sm:py-4">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-slate-800 px-4 py-3 sm:px-5">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Helper kecil: ModalConfirm siap pakai untuk konfirmasi delete, dsb.
 */
export interface ModalConfirmProps extends Omit<ModalProps, 'footer'> {
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  confirmVariant?: 'primary' | 'danger'
}

export function ModalConfirm({
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'danger',
  onConfirm,
  children,
  ...modalProps
}: ModalConfirmProps): React.ReactElement | null {
  return (
    <Modal
      {...modalProps}
      footer={
        <>
          <Button variant="outline" size="sm" type="button" onClick={modalProps.onClose}>
            {cancelLabel}
          </Button>
          <Button variant={confirmVariant} size="sm" type="button" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children}
    </Modal>
  )
}
