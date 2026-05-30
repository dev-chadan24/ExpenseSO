import React from 'react'

export default function SectionHeader({ title, description, actions, className = '' }) {
  return (
    <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 ${className}`}>
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight font-display leading-tight">
          {title}
        </h2>
        {description && (
          <p className="text-slate-400 text-sm mt-1 font-sans">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto z-10">
          {actions}
        </div>
      )}
    </div>
  )
}
