import React from 'react'

export default function Skeleton({ className = '', variant = 'text' }) {
  const variantClasses = {
    text: 'h-4 w-full rounded',
    title: 'h-6 w-1/3 rounded-lg',
    circle: 'h-10 w-10 rounded-full',
    rect: 'h-32 w-full rounded-2xl',
  }

  const selectedClass = variantClasses[variant] || variantClasses.text

  return (
    <div className={`bg-dark-muted shimmer ${selectedClass} ${className}`} />
  )
}
