import React from 'react'

export default function Badge({ children, variant = 'neutral', className = '' }) {
  const badgeClasses = {
    income:  'badge-income',
    expense: 'badge-expense',
    neutral: 'badge-neutral',
    warning: 'badge-warning',
    success: 'badge-income',
    danger:  'badge-expense',
  }

  const selectedClass = badgeClasses[variant] || badgeClasses.neutral

  return (
    <span className={`${selectedClass} ${className}`}>
      {children}
    </span>
  )
}
