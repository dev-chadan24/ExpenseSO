import React from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useAuth } from '../../context/AuthContext'
import { formatCurrency } from '../../utils/formatters'

// Premium glassmorphic tooltip
const CustomTooltip = ({ active, payload, currencySymbol }) => {
  if (active && payload && payload.length) {
    const entry = payload[0]
    return (
      <div
        className="border rounded-2xl p-3 shadow-glow-sm"
        style={{
          background: 'rgba(18,18,21,0.92)',
          borderColor: 'rgba(39,39,42,0.8)',
          backdropFilter: 'blur(12px)',
          minWidth: '140px',
        }}
      >
        <div className="flex items-center gap-1.5 text-xs font-bold text-white mb-1">
          <span
            className="w-2.5 h-2.5 rounded-full inline-block"
            style={{ backgroundColor: entry.payload.color || '#6366f1' }}
          />
          {entry.name}
        </div>
        <p className="text-sm font-extrabold text-white font-display">
          {formatCurrency(entry.value, currencySymbol)}
        </p>
      </div>
    )
  }
  return null
}

export default function DonutChart({ data = [], height = 300 }) {
  const { currencySymbol } = useAuth()

  // Premium fallback colors
  const fallbackColors = [
    '#6366f1', '#10d9a0', '#f43f5e', '#f59e0b', '#a855f7',
    '#06b6d4', '#ec4899', '#3b82f6', '#14b8a6', '#f97316'
  ]

  const chartData = data.filter(item => item.value > 0)

  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-slate-500 text-xs font-semibold uppercase tracking-wider">
        No expense data to visualize.
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
            animationBegin={100}
            animationDuration={800}
            animationEasing="ease-out"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || fallbackColors[index % fallbackColors.length]}
                stroke="var(--card-bg-solid)"
                strokeWidth={3}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip currencySymbol={currencySymbol} />} />
          <Legend
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            iconSize={7}
            wrapperStyle={{
              fontSize: '10px',
              fontWeight: 700,
              fontFamily: 'Geist, Inter, sans-serif',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              paddingTop: '12px',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
