import React from 'react'
import Card from './Card'

export default function ChartCard({
  title,
  subtitle,
  actions,
  children,
  className = ''
}) {
  return (
    <Card className={`flex flex-col relative ${className}`}>
      {/* Visual Header */}
      <div className="flex justify-between items-start mb-6 gap-2 shrink-0">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight font-display">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-1 font-sans">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-1.5">{actions}</div>}
      </div>

      {/* SVG Gradient Repository for child Recharts components */}
      <div className="flex-1 w-full relative" style={{ minHeight: '260px' }}>
        <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
          <defs>
            <linearGradient id="chartIncomeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10d9a0" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#10d9a0" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="chartExpenseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="chartSavingsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
          </defs>
        </svg>
        {children}
      </div>
    </Card>
  )
}
