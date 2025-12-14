import React from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'

type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
}

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * Button – tombol serbaguna dengan varian dan state loading.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      type = 'button',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const base =
      'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60'

    const variantClass: Record<ButtonVariant, string> = {
      primary: 'bg-sky-500 text-slate-950 hover:bg-sky-400 active:bg-sky-500',
      secondary: 'bg-slate-800 text-slate-100 hover:bg-slate-700 active:bg-slate-800',
      outline: 'border border-slate-700 bg-transparent text-slate-100 hover:bg-slate-900',
      ghost: 'bg-transparent text-slate-200 hover:bg-slate-900',
      danger: 'bg-rose-500 text-slate-950 hover:bg-rose-400 active:bg-rose-500',
    }

    const sizeClass: Record<ButtonSize, string> = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-9 px-4 text-sm',
      lg: 'h-10 px-5 text-sm',
      icon: 'h-9 w-9 text-sm',
    }

    return (
      <button
        ref={ref}
        type={type}
        className={classNames(
          base,
          variantClass[variant],
          sizeClass[size],
          isLoading && 'cursor-wait',
          className,
        )}
        disabled={disabled || isLoading}
        {...rest}
      >
        {isLoading && (
          <span
            className={classNames(
              'mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-200/70 border-t-transparent',
              size === 'icon' && 'mr-0',
            )}
            aria-hidden="true"
          />
        )}
        <span className={isLoading && size !== 'icon' ? 'opacity-80' : ''}>{children}</span>
      </button>
    )
  },
)

Button.displayName = 'Button'
