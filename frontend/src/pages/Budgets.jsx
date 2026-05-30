import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, PiggyBank, Calendar, Target } from 'lucide-react'
import { budgetsApi } from '../api/budgets'
import { categoriesApi } from '../api/categories'
import { useCurrency } from '../context/CurrencyContext'
import { useAuth } from '../context/AuthContext'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import BudgetBar from '../components/ui/BudgetBar'
import SkeletonLoader from '../components/ui/SkeletonLoader'
import SectionHeader from '../components/ui/SectionHeader'
import EmptyState from '../components/ui/EmptyState'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

export default function Budgets() {
  const { currencySymbol, formatCurrency } = useCurrency()
  const [budgets, setBudgets] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date()
    const m = String(today.getMonth() + 1).padStart(2, '0')
    return `${today.getFullYear()}-${m}`
  })
  const [loading, setLoading] = useState(true)

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeBudget, setActiveBudget] = useState(null)
  const [formData, setFormData] = useState({ category: '', amount: '' })
  const [loadingSubmit, setLoadingSubmit] = useState(false)

  const fetchCategories = async () => {
    try {
      const { data } = await categoriesApi.list()
      setCategories(data.results || data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const fetchBudgets = async () => {
    setLoading(true)
    try {
      const params = { month: selectedMonth }
      const { data } = await budgetsApi.list(params)
      const budgetList = data.results || data || []
      setBudgets(budgetList)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load budgets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchBudgets()
  }, [selectedMonth])

  // Listen to global changes
  useEffect(() => {
    window.addEventListener('transaction-added', fetchBudgets)
    return () => {
      window.removeEventListener('transaction-added', fetchBudgets)
    }
  }, [selectedMonth])

  const handleOpenAdd = () => {
    setActiveBudget(null)
    setFormData({
      category: categories.length > 0 ? categories[0].id : '',
      amount: '',
    })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (budget) => {
    setActiveBudget(budget)
    setFormData({
      category: budget.category,
      amount: budget.amount,
    })
    setIsModalOpen(true)
  }

  const handleModalSubmit = async (e) => {
    e.preventDefault()
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    setLoadingSubmit(true)
    try {
      const payload = {
        category: formData.category,
        amount: formData.amount,
        month: `${selectedMonth}-01`,
      }

      if (activeBudget) {
        await budgetsApi.update(activeBudget.id, payload)
        toast.success('Budget threshold updated!')
      } else {
        await budgetsApi.create(payload)
        toast.success('Budget threshold locked!')
      }
      setIsModalOpen(false)
      fetchBudgets()
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.detail || 'Failed to save budget (threshold for this category might already exist)')
    } finally {
      setLoadingSubmit(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this budget threshold?')) {
      try {
        await budgetsApi.delete(id)
        toast.success('Budget cap removed')
        fetchBudgets()
      } catch (err) {
        console.error(err)
        toast.error('Failed to remove budget')
      }
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.96, y: 10 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 220, damping: 20 } }
  }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <SectionHeader
        title="Monthly Budgets"
        description="Establish expenditure boundaries to secure financial goals."
        actions={
          <>
            <div className="relative flex-1 sm:flex-initial">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="pl-10 pr-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-dark-elevated border border-dark-border text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-primary-500 cursor-pointer w-full"
              />
            </div>
            <Button
              variant="primary"
              icon={Plus}
              onClick={handleOpenAdd}
            >
              Set Budget
            </Button>
          </>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => (
            <SkeletonLoader key={n} variant="rect" className="h-[210px] rounded-3xl" />
          ))}
        </div>
      ) : budgets.length === 0 ? (
        <EmptyState
          title={`No thresholds configured for ${selectedMonth}`}
          description="Protect your monthly finances. Set budget caps to keep track of spending channels."
          icon={PiggyBank}
          action={
            <Button variant="primary" onClick={handleOpenAdd} icon={Plus}>
              Configure Caps
            </Button>
          }
        />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {budgets.map((b) => {
            const spent = b.spent || 0
            const amount = b.amount || 0
            const remaining = b.remaining || 0
            const overBudget = b.over_budget || false

            return (
              <motion.div key={b.id} variants={cardVariants}>
                <Card hover className="relative overflow-hidden border border-dark-border/60 hover:border-dark-subtle/80 transition-all duration-300">
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1.5"
                    style={{ backgroundColor: b.category_color }}
                  />

                  <div className="flex justify-between items-start mb-4 pl-1">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-2.5 h-2.5 rounded-full inline-block animate-pulse"
                        style={{ backgroundColor: b.category_color }}
                      />
                      <h3 className="font-extrabold text-white text-lg leading-tight font-display">
                        {b.category_name}
                      </h3>
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(b)}
                        className="p-1.5 rounded-lg bg-dark-elevated text-slate-400 hover:text-white hover:bg-dark-muted transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(b.id)}
                        className="p-1.5 rounded-lg bg-accent-red/10 text-accent-red hover:bg-accent-red/20 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 pl-1 mt-6">
                    {/* Budget bar */}
                    <BudgetBar value={spent} max={amount} />

                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-dark-border/40 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                      <div>
                        <span>Limit Cap</span>
                        <span className="block text-sm font-extrabold text-slate-200 mt-1 leading-none font-display">
                          {formatCurrency(amount, currencySymbol)}
                        </span>
                      </div>
                      <div>
                        <span>Burnt</span>
                        <span className={`block text-sm font-extrabold mt-1 leading-none font-display ${
                          overBudget ? 'text-accent-red' : 'text-slate-200'
                        }`}>
                          {formatCurrency(spent, currencySymbol)}
                        </span>
                      </div>
                      <div>
                        <span>Balance</span>
                        <span className={`block text-sm font-extrabold mt-1 leading-none font-display ${
                          overBudget ? 'text-accent-red' : 'text-accent-green'
                        }`}>
                          {overBudget ? '-' : ''}
                          {formatCurrency(overBudget ? spent - amount : remaining, currencySymbol)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {/* Modal Dialog */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={activeBudget ? 'Edit Category Budget' : 'Configure Category Budget'}
      >
        <form onSubmit={handleModalSubmit} className="space-y-5">
          <div>
            <label className="input-label">Select Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="input-field appearance-none cursor-pointer"
              disabled={!!activeBudget}
              required
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {categories.length === 0 && (
              <p className="text-xs text-accent-red font-semibold mt-1">
                Create a category from settings before mapping a budget limit!
              </p>
            )}
          </div>

          <Input
            label="Budget Limit Cap"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
          />

          <div className="flex gap-3 justify-end pt-4 border-t border-dark-border">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={loadingSubmit}>
              Save Budget
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
