import React from 'react'
import Card from './Card'
import CountUp from './CountUp'
import { TrendingUp, TrendingDown } from 'lucide-react'

export default function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendDirection, // 'up', 'down', 'neutral'
  color = 'primary', // 'primary', 'green', 'red', 'amber', 'purple', 'cyan'
  loading = false,
}) {
  const colorMaps = {
    primary: {
      bg: 'bg-primary-500/10 border-primary-500/20 text-primary-400',
      glow: 'from-primary-500/8 to-transparent',
    },
    green: {
      bg: 'bg-accent-green/10 border-accent-green/20 text-accent-green',
      glow: 'from-accent-green/8 to-transparent',
    },
    red: {
      bg: 'bg-accent-red/10 border-accent-red/20 text-accent-red',
      glow: 'from-accent-red/8 to-transparent',
    },
    amber: {
      bg: 'bg-accent-amber/10 border-accent-amber/20 text-accent-amber',
      glow: 'from-accent-amber/8 to-transparent',
    },
    purple: {
      bg: 'bg-accent-purple/10 border-accent-purple/20 text-accent-purple',
      glow: 'from-accent-purple/8 to-transparent',
    },
    cyan: {
      bg: 'bg-accent-cyan/10 border-accent-cyan/20 text-accent-cyan',
      glow: 'from-accent-cyan/8 to-transparent',
    },
  }

  const selectedColor = colorMaps[color] || colorMaps.primary

  if (loading) {
    return (
      <Card className="relative overflow-hidden p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-dark-muted rounded-full w-24 shimmer" />
          <div className="w-10 h-10 bg-dark-muted rounded-xl shimmer" />
        </div>
        <div className="h-8 bg-dark-muted rounded-full w-32 shimmer mt-1" />
        <div className="h-4 bg-dark-muted rounded-full w-48 shimmer" />
      </Card>
    )
  }

  // Parse numeric value for CountUp animation
  const cleanStringVal = String(value).replace(/,/g, '') // remove thousands separators
  const numericVal = parseFloat(cleanStringVal.replace(/[^0-9.-]/g, ''))
  const isNumeric = !isNaN(numericVal) && isFinite(numericVal)

  // Deduce prefix and suffix to preserve currency labels
  const prefixMatch = cleanStringVal.match(/^[^0-9.-]*/)
  const prefix = prefixMatch ? prefixMatch[0] : ''
  const suffixMatch = cleanStringVal.match(/[^0-9.]*$/)
  const suffix = suffixMatch ? suffixMatch[0] : ''

  const formatFn = (val) => {
    return `${prefix}${val.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}${suffix}`
  }

  return (
    <Card hover className="relative overflow-hidden p-5 flex flex-col gap-3 group border border-dark-border/60 hover:border-dark-subtle transition-all duration-300">
      {/* Background glow hover animation */}
      <div
        className={`absolute -right-4 -bottom-4 w-32 h-32 rounded-full bg-gradient-radial ${selectedColor.glow} pointer-events-none opacity-40 group-hover:opacity-75 group-hover:scale-135 transition-all duration-500`}
      />

      <div className="flex items-center justify-between z-10">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-xl border ${selectedColor.bg} transition-transform duration-300 group-hover:scale-110`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="z-10 mt-1">
        <h3 className="text-2xl font-extrabold text-white tracking-tight leading-none font-display">
          {isNumeric ? (
            <CountUp value={numericVal} formatter={formatFn} />
          ) : (
            value
          )}
        </h3>
        {(trend || description) && (
          <div className="flex items-center gap-1.5 mt-3 text-xs">
            {trend && (
              <span
                className={`inline-flex items-center gap-0.5 font-bold px-2 py-0.5 rounded-full ${
                  trendDirection === 'up'
                    ? 'bg-accent-green/10 text-accent-green border border-accent-green/20'
                    : trendDirection === 'down'
                    ? 'bg-accent-red/10 text-accent-red border border-accent-red/20'
                    : 'bg-dark-muted text-slate-400 border border-dark-border'
                }`}
              >
                {trendDirection === 'up' && <TrendingUp className="w-3 h-3" />}
                {trendDirection === 'down' && <TrendingDown className="w-3 h-3" />}
                {trend}
              </span>
            )}
            {description && <span className="text-slate-400 font-medium">{description}</span>}
          </div>
        )}
      </div>
    </Card>
  )
}
