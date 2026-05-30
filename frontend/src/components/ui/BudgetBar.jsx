import React from 'react'

export default function BudgetBar({ value, max, className = '' }) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0
  const formattedPct = percentage.toFixed(0)

  // Determine progress bar color based on usage
  let barColor = 'bg-accent-green shadow-[0_0_12px_rgba(16,217,160,0.4)]'
  if (percentage > 85) {
    barColor = 'bg-accent-red shadow-[0_0_12px_rgba(244,63,94,0.4)]'
  } else if (percentage > 60) {
    barColor = 'bg-accent-amber shadow-[0_0_12px_rgba(245,158,11,0.4)]'
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
        <span className="text-slate-400">Spending Progress</span>
        <span className={`${percentage > 85 ? 'text-accent-red font-bold' : 'text-slate-200'}`}>
          {formattedPct}% Used
        </span>
      </div>
      <div className="w-full h-2 rounded-full bg-dark-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
