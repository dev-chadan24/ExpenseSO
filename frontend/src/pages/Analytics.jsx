import React, { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { Calendar, TrendingUp, TrendingDown, PiggyBank, ArrowUpRight, ArrowDownRight, Tag } from 'lucide-react'
import { reportsApi } from '../api/reports'
import { useCurrency } from '../context/CurrencyContext'
import { useAuth } from '../context/AuthContext'
import Card from '../components/ui/Card'
import StatCard from '../components/ui/StatCard'
import SkeletonLoader from '../components/ui/SkeletonLoader'
import SectionHeader from '../components/ui/SectionHeader'
import ChartCard from '../components/ui/ChartCard'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

export default function Analytics() {
  const { currencySymbol, formatCurrency } = useCurrency()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear())

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const params = { year: selectedYear }
      const { data } = await reportsApi.analytics(params)
      setData(data)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load yearly analytics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [selectedYear])

  // Listen to global changes
  useEffect(() => {
    window.addEventListener('transaction-added', fetchAnalytics)
    return () => {
      window.removeEventListener('transaction-added', fetchAnalytics)
    }
  }, [selectedYear])

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <SkeletonLoader variant="rect" className="h-20 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => <SkeletonLoader key={n} variant="rect" className="h-24 rounded-3xl" />)}
        </div>
        <SkeletonLoader variant="chart" />
      </div>
    )
  }

  const {
    year_income = 0,
    year_expense = 0,
    year_savings = 0,
    yearly_chart = [],
    top_categories = [],
    available_years = [new Date().getFullYear()]
  } = data || {}

  // Format currency for Y-axis
  const formatYAxis = (val) => {
    if (val >= 1000) return `${currencySymbol}${(val / 1000).toFixed(0)}k`
    return `${currencySymbol}${val}`
  }

  // Custom tooltips matching Recharts custom-tooltip class in index.css
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip border border-dark-border bg-dark-surface/90 p-3 rounded-xl shadow-glow-sm">
          <p className="text-xs font-bold text-white mb-2">{label} {selectedYear}</p>
          <div className="flex flex-col gap-1.5 text-xs">
            {payload.map((entry, index) => (
              <div key={index} className="flex items-center justify-between gap-6">
                <span className="flex items-center gap-1.5 font-medium text-slate-400 font-sans">
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: entry.color }}
                  />
                  {entry.name}
                </span>
                <span className="font-extrabold text-white font-display">
                  {formatCurrency(entry.value, currencySymbol)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )
    }
    return null
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 220, damping: 20 } }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header section with SectionHeader */}
      <motion.div variants={itemVariants}>
        <SectionHeader
          title="Interactive Analytics"
          description="Evaluate year-over-year earnings, expenditures, and asset growth."
          actions={
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="input-field pl-10 pr-8 py-2.5 text-xs font-bold uppercase tracking-wider bg-dark-elevated border border-dark-border text-slate-100 rounded-xl focus:outline-none cursor-pointer appearance-none min-w-[130px]"
              >
                {available_years.length === 0 ? (
                  <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                ) : (
                  available_years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))
                )}
              </select>
            </div>
          }
        />
      </motion.div>

      {/* Year Widgets */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Annual Earnings"
          value={formatCurrency(year_income, currencySymbol)}
          icon={ArrowUpRight}
          color="green"
        />
        <StatCard
          title="Annual Expenditures"
          value={formatCurrency(year_expense, currencySymbol)}
          icon={ArrowDownRight}
          color="red"
        />
        <StatCard
          title="Net Cashflow Balance"
          value={formatCurrency(year_savings, currencySymbol)}
          icon={PiggyBank}
          color={year_savings >= 0 ? 'cyan' : 'amber'}
        />
      </motion.div>

      {/* Yearly comparison chart using ChartCard */}
      <motion.div variants={itemVariants}>
        <ChartCard
          title="Comparative Cashflow Breakdown"
          subtitle={`Income vs expense analysis for the fiscal year ${selectedYear}`}
        >
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={yearly_chart}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid stroke="var(--border-color)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="month"
                stroke="#64748b"
                fontSize={11}
                fontWeight={600}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                fontWeight={600}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatYAxis}
                dx={-5}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                height={36}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{
                  fontSize: '11px',
                  fontWeight: 600,
                  paddingBottom: '16px',
                }}
              />
              {/* Premium gradients and strokes applied directly */}
              <Bar 
                name="Income" 
                dataKey="income" 
                fill="url(#chartIncomeGrad)" 
                stroke="#10d9a0"
                strokeWidth={1.5}
                radius={[4, 4, 0, 0]} 
                maxBarSize={24} 
              />
              <Bar 
                name="Expenses" 
                dataKey="expense" 
                fill="url(#chartExpenseGrad)" 
                stroke="#f43f5e"
                strokeWidth={1.5}
                radius={[4, 4, 0, 0]} 
                maxBarSize={24} 
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </motion.div>

      {/* Top spending categories for the year */}
      <motion.div variants={itemVariants}>
        <Card className="border border-dark-border/60 hover:border-dark-subtle/40 transition-all duration-300">
          <h3 className="section-title mb-1">Top Spending Categories</h3>
          <p className="text-xs text-slate-400 mb-6 font-sans">Heaviest expenditure sources cataloged during {selectedYear}</p>

          {top_categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-sm font-sans">
              No expenditures recorded for this fiscal period.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {top_categories.map((c, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-dark-elevated/20 border border-dark-border/50 relative overflow-hidden flex flex-col justify-between h-28 hover:border-dark-subtle transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 truncate w-32 font-sans">{c.name}</span>
                    <div className="p-1.5 rounded-lg bg-dark-muted/20 border border-dark-border" style={{ color: c.color }}>
                      <Tag className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="block text-xl font-extrabold text-white leading-none font-display">
                      {formatCurrency(c.total, currencySymbol)}
                    </span>
                    <span className="text-[9px] text-slate-500 font-bold tracking-wider uppercase mt-1.5 block">
                      {c.count} transaction{c.count !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>
    </motion.div>
  )
}
