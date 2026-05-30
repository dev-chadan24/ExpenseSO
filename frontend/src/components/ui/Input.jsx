import React, { forwardRef } from 'react'

const Input = forwardRef(({
  label,
  type = 'text',
  error,
  description,
  className = '',
  icon: Icon,
  ...props
}, ref) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="input-label">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={`input-field ${Icon ? 'pl-11' : ''} ${
            error ? 'border-accent-red focus:border-accent-red focus:ring-accent-red/20' : ''
          }`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-xs font-semibold text-accent-red">
          {error.message || error}
        </p>
      )}
      {description && !error && (
        <p className="mt-1.5 text-xs text-slate-500">
          {description}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
