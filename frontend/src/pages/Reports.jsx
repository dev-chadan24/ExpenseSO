import React, { useState, useEffect } from 'react'
import {
  FileText,
  Calendar,
  FileSpreadsheet,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  BarChart3,
  Inbox
} from 'lucide-react'
import { reportsApi } from '../api/reports'
import { useCurrency } from '../context/CurrencyContext'
import { useAuth } from '../context/AuthContext'
import Card from '../components/ui/Card'
import StatCard from '../components/ui/StatCard'
import Button from '../components/ui/Button'
import SkeletonLoader from '../components/ui/SkeletonLoader'
import SectionHeader from '../components/ui/SectionHeader'
import PremiumTable from '../components/ui/PremiumTable'
import EmptyState from '../components/ui/EmptyState'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

export default function Reports() {
  const { currencySymbol, formatCurrency, formatDate } = useCurrency()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  // Filter States — default to last 30 days
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return d.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const params = { start_date: startDate, end_date: endDate }
      const { data } = await reportsApi.get(params)
      setData(data)
    } catch (err) {
      console.error(err)
      toast.error('Failed to generate report summaries')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  // Listen to global changes
  useEffect(() => {
    window.addEventListener('transaction-added', fetchReports)
    return () => window.removeEventListener('transaction-added', fetchReports)
  }, [startDate, endDate])

  const handleApplyFilters = (e) => {
    e.preventDefault()
    fetchReports()
  }

  const handleExportCSV = async () => {
    setExporting(true)
    try {
      const params = { start_date: startDate, end_date: endDate }
      const { data } = await reportsApi.exportCsv(params)
      const url = window.URL.createObjectURL(new Blob([data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `expenseso_report_${startDate}_to_${endDate}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('CSV Report downloaded!')
    } catch (err) {
      console.error(err)
      toast.error('CSV Export failed')
    } finally {
      setExporting(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 220, damping: 20 } }
  }

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <SkeletonLoader variant="rect" className="h-20 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => <SkeletonLoader key={n} variant="rect" className="h-24 rounded-3xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SkeletonLoader variant="rect" className="h-[350px] rounded-3xl" />
          <SkeletonLoader variant="table" className="lg:col-span-2" />
        </div>
      </div>
    )
  }

  const {
    total_income = 0,
    total_expense = 0,
    net = 0,
    by_category = [],
    transactions = []
  } = data || {}

  // Columns for the transactions sub-table
  const txColumns = [
    {
      key: 'description',
      label: 'Description',
      render: (tx) => (
        <div className="font-semibold text-white truncate max-w-[180px]" title={tx.description}>
          {tx.description || 'Untitled'}
        </div>
      )
    },
    {
      key: 'category_name',
      label: 'Category',
      render: (tx) => (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border"
          style={{
            backgroundColor: `${tx.category_color}12`,
            borderColor: `${tx.category_color}25`,
            color: tx.category_color,
          }}
        >
          {tx.category_name || 'Uncategorized'}
        </span>
      )
    },
    {
      key: 'date',
      label: 'Date',
      render: (tx) => (
        <span className="text-slate-400 text-xs font-semibold">
          {formatDate(tx.date, 'MMM dd, yyyy')}
        </span>
      )
    },
    {
      key: 'amount',
      label: 'Amount',
      align: 'right',
      render: (tx) => (
        <span className={`font-extrabold font-display ${tx.transaction_type === 'income' ? 'text-accent-green' : 'text-accent-red'}`}>
          {tx.transaction_type === 'income' ? '+' : '-'}
          {formatCurrency(tx.amount, currencySymbol)}
        </span>
      )
    }
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <SectionHeader
          title="Financial Statements"
          description="Examine, filter, and export aggregated reports for arbitrary periods."
          actions={
            <Button
              variant="secondary"
              icon={FileSpreadsheet}
              onClick={handleExportCSV}
              loading={exporting}
            >
              Export CSV
            </Button>
          }
        />
      </motion.div>

      {/* Date filter controls */}
      <motion.div variants={itemVariants}>
        <Card className="p-5 border border-dark-border/60 hover:border-dark-subtle/40 transition-all duration-300">
          <form onSubmit={handleApplyFilters} className="flex flex-col md:flex-row items-end gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 w-full">
              <div>
                <label className="input-label">Start Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="input-field pl-10 cursor-pointer"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="input-label">End Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="input-field pl-10 cursor-pointer"
                    required
                  />
                </div>
              </div>
            </div>
            <Button type="submit" variant="primary" className="w-full md:w-auto px-6 py-2.5" loading={loading}>
              Generate Report
            </Button>
          </form>
        </Card>
      </motion.div>

      {/* Summary KPIs */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Period Income"
          value={formatCurrency(total_income, currencySymbol)}
          icon={ArrowUpRight}
          color="green"
        />
        <StatCard
          title="Period Expense"
          value={formatCurrency(total_expense, currencySymbol)}
          icon={ArrowDownRight}
          color="red"
        />
        <StatCard
          title="Net Cashflow"
          value={formatCurrency(net, currencySymbol)}
          icon={PiggyBank}
          color={net >= 0 ? 'cyan' : 'amber'}
        />
      </motion.div>

      {/* Category Breakdown + Transactions Log */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Category Aggregations */}
        <Card className="flex flex-col border border-dark-border/60 hover:border-dark-subtle/40 transition-all duration-300">
          <h3 className="section-title mb-1">Spending Breakdown</h3>
          <p className="text-xs text-slate-400 mb-6 font-sans">Aggregated category spending for the selected range</p>

          {by_category.length === 0 ? (
            <EmptyState
              title="No expenditure data"
              description="No spending records were found in this date range."
              icon={BarChart3}
            />
          ) : (
            <div className="space-y-4">
              {by_category.map((cat, idx) => {
                const percentage = total_expense > 0 ? (cat.total / total_expense) * 100 : 0
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-white flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full inline-block"
                          style={{ backgroundColor: cat.color }}
                        />
                        {cat.name}
                        <span className="text-slate-500 font-medium">({cat.count} tx)</span>
                      </span>
                      <span className="text-slate-300 font-bold font-display">
                        {formatCurrency(cat.total, currencySymbol)}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-dark-elevated overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: idx * 0.05 }}
                        style={{ backgroundColor: cat.color }}
                      />
                    </div>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                      {percentage.toFixed(1)}% of total spend
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        {/* Transactions log table */}
        <div className="lg:col-span-2 flex flex-col">
          <Card className="flex-1 p-0 overflow-hidden border border-dark-border/60 hover:border-dark-subtle/40 transition-all duration-300">
            <div className="px-6 pt-6 pb-4 border-b border-dark-border/60">
              <h3 className="section-title mb-1">Period Transaction Registry</h3>
              <p className="text-xs text-slate-400 font-sans">Full transaction log matching selected date range</p>
            </div>

            <div className="max-h-[400px] overflow-y-auto no-scrollbar">
              <PremiumTable
                columns={txColumns}
                data={transactions}
                emptyState={
                  <EmptyState
                    title="No transactions found"
                    description="No records exist within the selected date range."
                    icon={Inbox}
                  />
                }
              />
            </div>

            {transactions.length > 0 && (
              <div className="px-5 py-3 bg-dark-card/20 border-t border-dark-border/60 text-xs text-slate-400 font-semibold">
                {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} in range · {startDate} → {endDate}
              </div>
            )}
          </Card>
        </div>
      </motion.div>
    </motion.div>
  )
}
