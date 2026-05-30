import React from 'react'

export default function Card({ children, className = '', hover = false, ...props }) {
  const baseClass = hover ? 'glass-card-hover' : 'glass-card'
  return (
    <div className={`${baseClass} p-6 ${className}`} {...props}>
      {children}
    </div>
  )
}
