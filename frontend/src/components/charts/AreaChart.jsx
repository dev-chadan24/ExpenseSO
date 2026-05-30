import React from 'react'
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { useAuth } from '../../context/AuthContext'
import { formatCurrency } from '../../utils/formatters'

// Custom premium glassmorphic tooltip
const CustomTooltip = ({ active, payload, label, currencySymbol }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="border rounded-2xl p-3 shadow-glow-sm"
        style={{
          background: 'rgba(18,18,21,0.92)',
          borderColor: 'rgba(39,39,42,0.8)',
          backdropFilter: 'blur(12px)',
          minWidth: '160px',
        }}
      >
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4 py-0.5">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name}
            </span>
            <span className="text-xs font-extrabold text-white font-display">
              {formatCurrency(entry.value, currencySymbol)}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function AreaChart({ data = [], height = 300 }) {
  const { currencySymbol } = useAuth()

  const formatYAxis = (val) => {
    if (val >= 1000000) return `${currencySymbol}${(val / 1000000).toFixed(1)}M`
    if (val >= 1000) return `${currencySymbol}${(val / 1000).toFixed(0)}k`
    return `${currencySymbol}${val}`
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <RechartsAreaChart
          data={data}
          margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
        >
          {/* Gradient definitions using ChartCard's shared SVG defs OR define inline */}
          <defs>
            <linearGradient id="areaIncomeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10d9a0" stopOpacity={0.3} />
              <stop offset="60%" stopColor="#10d9a0" stopOpacity={0.05} />
              <stop offset="100%" stopColor="#10d9a0" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="areaExpenseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.3} />
              <stop offset="60%" stopColor="#f43f5e" stopOpacity={0.05} />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            stroke="rgba(39,39,42,0.6)"
            strokeDasharray="4 4"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            stroke="#52525b"
            fontSize={10}
            fontWeight={700}
            tickLine={false}
            axisLine={false}
            dy={10}
            tick={{ fill: '#71717a', fontFamily: 'Geist, Inter, sans-serif', letterSpacing: '0.05em' }}
          />
          <YAxis
            stroke="#52525b"
            fontSize={10}
            fontWeight={700}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatYAxis}
            dx={-5}
            tick={{ fill: '#71717a', fontFamily: 'Geist, Inter, sans-serif' }}
          />
          <Tooltip content={<CustomTooltip currencySymbol={currencySymbol} />} />
          <Legend
            verticalAlign="top"
            align="right"
            height={36}
            iconType="circle"
            iconSize={7}
            wrapperStyle={{
              fontSize: '10px',
              fontWeight: 700,
              fontFamily: 'Geist, Inter, sans-serif',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              paddingBottom: '12px',
            }}
          />
          <Area
            name="Income"
            type="monotone"
            dataKey="income"
            stroke="#10d9a0"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#areaIncomeGrad)"
            dot={false}
            activeDot={{ r: 5, fill: '#10d9a0', stroke: '#09090b', strokeWidth: 2 }}
          />
          <Area
            name="Expenses"
            type="monotone"
            dataKey="expense"
            stroke="#f43f5e"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#areaExpenseGrad)"
            dot={false}
            activeDot={{ r: 5, fill: '#f43f5e', stroke: '#09090b', strokeWidth: 2 }}
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  )
}
