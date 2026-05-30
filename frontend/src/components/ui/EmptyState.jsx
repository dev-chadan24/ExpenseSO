import React from 'react'

export default function EmptyState({
  title,
  description,
  icon: Icon,
  action,
  className = ''
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center rounded-3xl border border-dashed border-dark-border bg-dark-card/25 backdrop-blur-sm ${className}`}>
      {Icon && (
        <div className="p-4 rounded-full bg-dark-elevated border border-dark-border text-primary-400 mb-4 animate-float shadow-glow-sm">
          <Icon className="w-8 h-8" />
        </div>
      )}
      <h3 className="text-lg font-bold text-white font-display tracking-tight mb-2">
        {title}
      </h3>
      <p className="text-slate-400 text-sm max-w-sm leading-relaxed mb-6">
        {description}
      </p>
      {action && (
        <div className="flex justify-center">
          {action}
        </div>
      )}
    </div>
  )
}
