import React from 'react'

export default function Button({
  children,
  type = 'button',
  variant = 'primary', // 'primary', 'secondary', 'danger', 'ghost'
  className = '',
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  ...props
}) {
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    ghost: 'btn-ghost',
  }

  const selectedClass = variantClasses[variant] || variantClasses.primary

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${selectedClass} justify-center items-center ${className}`}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : Icon && iconPosition === 'left' ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      {children}
      {!loading && Icon && iconPosition === 'right' ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
    </button>
  )
}
