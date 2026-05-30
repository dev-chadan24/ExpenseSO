import React, { useState, useEffect } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  Wallet,
  Calendar,
  Zap,
  Target,
  Activity,
  AlertCircle
} from 'lucide-react'
import { dashboardApi } from '../api/dashboard'
import { transactionsApi } from '../api/transactions'
import { useAuth } from '../context/AuthContext'
import { useCurrency } from '../context/CurrencyContext'
import { AUTH_BYPASS_MODE } from '../config'
import { 
  NetWorthTracker, 
  GoalManagement, 
  FinancialCalendar, 
  AISpendingInsights, 
  AuditActivityLog 
} from '../components/dashboard/IntelligenceWidgets'
import SectionHeader from '../components/ui/SectionHeader'
import StatCard from '../components/ui/StatCard'
import Card from '../components/ui/Card'
import ChartCard from '../components/ui/ChartCard'
import EmptyState from '../components/ui/EmptyState'
import PremiumTable from '../components/ui/PremiumTable'
import SkeletonLoader from '../components/ui/SkeletonLoader'
import BudgetBar from '../components/ui/BudgetBar'
import AreaChart from '../components/charts/AreaChart'
import DonutChart from '../components/charts/DonutChart'
import TransactionModal from '../components/forms/TransactionModal'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

// Luxury Mock fallback data for bypass mode
const MOCK_DASHBOARD_DATA = {
  total_income: 185000.00,
  total_expense: 88500.00,
  net_savings: 96500.00,
  savings_rate: 52,
  monthly_budget: 120000.00,
  budget_used_percentage: 73,
  expenses_by_category: [
    { name: 'Housing', total: 35000.00, color: '#6366f1' },
    { name: 'Food & Dining', total: 18500.00, color: '#10d9a0' },
    { name: 'Transport', total: 12000.00, color: '#f59e0b' },
    { name: 'Entertainment', total: 8000.00, color: '#a855f7' },
    { name: 'Healthcare', total: 5000.00, color: '#06b6d4' },
    { name: 'Investments', total: 10000.00, color: '#e11d48' }
  ],
  recent_transactions: [
    { id: 101, description: 'Direct Deposit Transfer (Tata Tech)', category_name: 'Salary', category_color: '#10d9a0', date: new Date().toISOString(), payment_method: 'direct deposit', transaction_type: 'income', amount: 185000.00 },
    { id: 102, description: 'Landmark Properties Monthly Rent', category_name: 'Housing', category_color: '#6366f1', date: new Date(Date.now() - 86400000).toISOString(), payment_method: 'direct deposit', transaction_type: 'expense', amount: 35000.00 },
    { id: 103, description: 'HDFC Home Loan EMI Auto-Debit', category_name: 'Housing', category_color: '#6366f1', date: new Date(Date.now() - 172800000).toISOString(), payment_method: 'bank transfer', transaction_type: 'expense', amount: 24500.00 },
    { id: 104, description: 'Zerodha Mutual Fund SIP', category_name: 'Investments', category_color: '#e11d48', date: new Date(Date.now() - 259200000).toISOString(), payment_method: 'direct deposit', transaction_type: 'expense', amount: 10000.00 },
    { id: 105, description: 'Indian Oil Petrol Station', category_name: 'Transport', category_color: '#f59e0b', date: new Date(Date.now() - 345600000).toISOString(), payment_method: 'card', transaction_type: 'expense', amount: 3500.00 },
    { id: 106, description: 'Swiggy Gourmet Delivery', category_name: 'Food & Dining', category_color: '#10d9a0', date: new Date(Date.now() - 432000000).toISOString(), payment_method: 'card', transaction_type: 'expense', amount: 1850.00 }
  ],
  budget_progress: [
    { id: 201, category: 'Housing', spent: 59500.00, budget: 80000.00, color: '#6366f1' },
    { id: 202, category: 'Food & Dining', spent: 18500.00, budget: 25000.00, color: '#10d9a0' },
    { id: 203, category: 'Transport', spent: 12000.00, budget: 15000.00, color: '#f59e0b' },
    { id: 204, category: 'Entertainment', spent: 8000.00, budget: 12000.00, color: '#a855f7' }
  ],
  chart_data: [
    { name: 'Jan', income: 150000, expense: 65000 },
    { name: 'Feb', income: 150000, expense: 68000 },
    { name: 'Mar', income: 160000, expense: 72000 },
    { name: 'Apr', income: 185000, expense: 82000 },
    { name: 'May', income: 185000, expense: 88500 }
  ]
}

function calcHealthScore(total_income, total_expense, budget_used_percentage, savings_rate) {
  let score = 100
  if (total_income === 0) return 0
  if (budget_used_percentage > 100) score -= 40
  else if (budget_used_percentage > 85) score -= 20
  else if (budget_used_percentage > 70) score -= 10
  
  if (savings_rate >= 35) score += 0
  else if (savings_rate >= 25) score -= 5
  else if (savings_rate >= 15) score -= 15
  else score -= 30
  return Math.max(0, Math.min(100, score))
}

function HealthScoreRing({ score }) {
  const radius = 38
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 75 ? '#10d9a0' : score >= 50 ? '#f59e0b' : '#f43f5e'
  const label = score >= 75 ? 'Excellent' : score >= 50 ? 'Fair' : 'Critical'

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 90 90">
          <circle cx="45" cy="45" r={radius} fill="none" stroke="var(--border-color)" strokeWidth="6" />
          <circle
            cx="45"
            cy="45"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold text-white leading-none font-display">{score}</span>
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">/ 100</span>
        </div>
      </div>
      <span className="text-xs font-bold uppercase tracking-wider" style={{ color }}>{label}</span>
    </div>
  )
}

export default function Dashboard() {
  const { currencySymbol, formatCurrency, formatDate } = useCurrency()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  const fetchDashboardData = async () => {
    try {
      const response = await dashboardApi.get()
      
      // If we got back empty or failed data structure, use mocks in bypass mode
      const hasRealRecords = response.data && (response.data.total_income > 0 || response.data.total_expense > 0 || response.data.recent_transactions?.length > 0)
      
      if (!hasRealRecords && AUTH_BYPASS_MODE) {
        setData(MOCK_DASHBOARD_DATA)
      } else {
        setData(response.data)
      }
    } catch (err) {
      console.warn('Dashboard API failed to fetch, loading mock data fallback:', err)
      if (AUTH_BYPASS_MODE) {
        setData(MOCK_DASHBOARD_DATA)
      } else {
        toast.error('Failed to load dashboard metrics')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()

    // Global events refresh
    window.addEventListener('transaction-added', fetchDashboardData)
    return () => {
      window.removeEventListener('transaction-added', fetchDashboardData)
    }
  }, [])

  const handleAddTransactionSuccess = async (formData) => {
    try {
      await transactionsApi.create(formData)
      toast.success('Transaction logged!')
      fetchDashboardData()
    } catch (err) {
      console.error(err)
      toast.error('Failed to log transaction')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader variant="stats" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SkeletonLoader variant="chart" className="lg:col-span-2" />
          <SkeletonLoader variant="rect" className="h-[350px] rounded-3xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SkeletonLoader variant="table" className="lg:col-span-2" />
          <SkeletonLoader variant="rect" className="h-[350px] rounded-3xl" />
        </div>
      </div>
    )
  }

  const {
    total_income = 0,
    total_expense = 0,
    net_savings = 0,
    savings_rate = 0,
    monthly_budget = 0,
    budget_used_percentage = 0,
    expenses_by_category = [],
    recent_transactions = [],
    budget_progress = [],
    chart_data = []
  } = data || {}

  const healthScore = calcHealthScore(total_income, total_expense, budget_used_percentage, savings_rate)

  const donutData = expenses_by_category.map(c => ({
    name: c.name,
    value: c.total,
    color: c.color,
  }))

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
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 240, damping: 20 } }
  }

  // Schema columns definition for premium table
  const transactionColumns = [
    {
      key: 'description',
      label: 'Description',
      render: (tx) => (
        <div className="font-semibold text-white truncate max-w-[200px]" title={tx.description}>
          {tx.description || 'Untitled Transaction'}
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
          <span
            className="w-1.5 h-1.5 rounded-full inline-block animate-pulse"
            style={{ backgroundColor: tx.category_color }}
          />
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
      key: 'payment_method',
      label: 'Method',
      render: (tx) => (
        <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">
          {tx.payment_method}
        </span>
      )
    },
    {
      key: 'amount',
      label: 'Amount',
      align: 'right',
      render: (tx) => (
        <span className={`font-extrabold font-display ${
          tx.transaction_type === 'income' ? 'text-accent-green' : 'text-accent-red'
        }`}>
          {tx.transaction_type === 'income' ? '+' : '-'}
          {formatCurrency(tx.amount, currencySymbol)}
        </span>
      )
    }
  ]

  const emptyStateWidget = (
    <EmptyState
      title="No transaction history"
      description="You haven't logged any transactions yet. Tap the button to start mapping your capital."
      icon={AlertCircle}
      action={
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          <span>Add Transaction</span>
        </button>
      }
    />
  )

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
          title="ExpenseSO Dashboard"
          description="Synthesize, organize, and monitor your premium cashflow accounts."
          actions={
            <button
              onClick={() => setModalOpen(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" />
              <span>Add Transaction</span>
            </button>
          }
        />
      </motion.div>

      {/* KPI Stats grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Earnings / Inflow"
          value={formatCurrency(total_income, currencySymbol)}
          icon={ArrowUpRight}
          trend={total_income > 0 ? '+Active Portfolio' : 'No Inflow'}
          trendDirection={total_income > 0 ? 'up' : 'neutral'}
          color="green"
        />
        <StatCard
          title="Expenditures"
          value={formatCurrency(total_expense, currencySymbol)}
          icon={ArrowDownRight}
          trend={total_expense > 0 ? 'Outflow Logged' : 'Zero Expense'}
          trendDirection={total_expense > 0 ? 'down' : 'neutral'}
          color="red"
        />
        <StatCard
          title="Net Cashflow"
          value={formatCurrency(net_savings, currencySymbol)}
          icon={PiggyBank}
          trend={`${savings_rate}% savings rate`}
          trendDirection={net_savings >= 0 ? 'up' : 'down'}
          color={net_savings >= 0 ? 'cyan' : 'amber'}
        />
        <StatCard
          title="Limit Burned"
          value={formatCurrency(total_expense, currencySymbol)}
          icon={Wallet}
          trend={`${budget_used_percentage}% consumed`}
          trendDirection={budget_used_percentage > 85 ? 'down' : budget_used_percentage > 60 ? 'neutral' : 'up'}
          description={`Cap: ${formatCurrency(monthly_budget, currencySymbol)}`}
          color={budget_used_percentage > 85 ? 'red' : budget_used_percentage > 60 ? 'amber' : 'primary'}
        />
      </motion.div>

      {/* Wealth & Intelligence Section */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <NetWorthTracker />
        <div className="lg:col-span-2">
          <GoalManagement />
        </div>
      </motion.div>

      {/* Charts section with ChartCard */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Area Chart */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Capital Fluctuations"
            subtitle="Income vs expenditure trajectory"
            actions={
              <div className="flex items-center gap-1.5 px-3 py-1 bg-dark-elevated border border-dark-border rounded-xl text-[10px] uppercase font-bold text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Last 6 Months</span>
              </div>
            }
          >
            <AreaChart data={chart_data} />
          </ChartCard>
        </div>

        {/* Right side widgets */}
        <div className="flex flex-col gap-5">
          {/* Health index card */}
          <Card className="flex flex-col items-center justify-center py-6 gap-4 border border-dark-border/60 hover:border-dark-subtle/80 transition-all duration-300">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Activity className="w-4 h-4 text-primary-400" />
                <h3 className="section-title text-[10px]">Health Quotient</h3>
              </div>
              <p className="text-xs text-slate-500">Synthesized billing stability score</p>
            </div>
            <HealthScoreRing score={healthScore} />
            <div className="w-full grid grid-cols-2 gap-3 pt-4 border-t border-dark-border/40">
              <div className="text-center border-r border-dark-border/40">
                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Savings Rate</p>
                <p className="text-sm font-extrabold text-white mt-1 leading-none">{savings_rate}%</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Burn Rate</p>
                <p className={`text-sm font-extrabold mt-1 leading-none ${budget_used_percentage > 85 ? 'text-accent-red' : 'text-white'}`}>
                  {budget_used_percentage}%
                </p>
              </div>
            </div>
          </Card>

          {/* Donut Breakdown */}
          <ChartCard
            title="Spending Channels"
            subtitle="Allocation by category"
          >
            <DonutChart data={donutData} />
          </ChartCard>
        </div>
      </motion.div>

      {/* Tables and Budgets progression */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Transactions List with PremiumTable */}
        <div className="lg:col-span-2 flex flex-col h-full">
          <Card className="flex-1 flex flex-col justify-between p-6">
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="section-title text-sm">Recent Operations</h3>
                  <p className="text-xs text-slate-400 mt-1 font-sans">Latest cash flows and invoices</p>
                </div>
                <Link
                  to="/transactions"
                  className="text-[10px] font-bold text-primary-400 hover:text-primary-300 transition-colors uppercase tracking-wider"
                >
                  Inspect All →
                </Link>
              </div>

              <PremiumTable
                columns={transactionColumns}
                data={recent_transactions}
                emptyState={emptyStateWidget}
              />
            </div>
          </Card>
        </div>

        {/* Budgets Progress indicator widget */}
        <Card className="flex flex-col justify-between p-6 border border-dark-border/60 hover:border-dark-subtle/80 transition-all duration-300">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="section-title text-sm">Active Budgets</h3>
                <p className="text-xs text-slate-400 mt-1 font-sans">Budget thresholds vs monthly spending</p>
              </div>
              <Link
                to="/budgets"
                className="text-[10px] font-bold text-primary-400 hover:text-primary-300 transition-colors uppercase tracking-wider"
              >
                Tuning →
              </Link>
            </div>

            {budget_progress.length === 0 ? (
              <EmptyState
                title="No active thresholds"
                description="Keep your spending aligned by defining category budget caps."
                icon={Target}
                action={
                  <Link to="/budgets" className="btn-secondary py-2 px-4 text-[10px] font-bold">
                    + Set Caps
                  </Link>
                }
              />
            ) : (
              <div className="space-y-5">
                {budget_progress.map((b) => (
                  <div key={b.id} className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full inline-block"
                          style={{ backgroundColor: b.color }}
                        />
                        {b.category}
                      </span>
                      <span className="text-slate-400 font-semibold font-sans">
                        {formatCurrency(b.spent, currencySymbol)} / {formatCurrency(b.budget, currencySymbol)}
                      </span>
                    </div>
                    <BudgetBar value={b.spent} max={b.budget} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Financial Calendar & AI Insights Section */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <FinancialCalendar />
        <AISpendingInsights />
        <AuditActivityLog />
      </motion.div>

      {/* Modal addition */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleAddTransactionSuccess}
      />
    </motion.div>
  )
}
