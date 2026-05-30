import React, { useState, useEffect } from 'react'
import { Plus, X, Calendar, DollarSign, FileText } from 'lucide-react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { categoriesApi } from '../../api/categories'
import toast from 'react-hot-toast'

export default function TransactionModal({ isOpen, onClose, transaction, onSuccess }) {
  const [categories, setCategories] = useState([])
  const [loadingCats, setLoadingCats] = useState(false)
  const [loadingSubmit, setLoadingSubmit] = useState(false)

  const [formData, setFormData] = useState({
    transaction_type: 'expense',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    description: '',
    payment_method: 'card',
    is_recurring: false,
    recurrence_frequency: 'monthly',
  })

  // Load categories on open
  useEffect(() => {
    if (isOpen) {
      setLoadingCats(true)
      categoriesApi.list()
        .then(({ data }) => {
          setCategories(data.results || data || [])
          // Pre-select category if editing or pre-select first category if available
          if (transaction) {
            setFormData({
              transaction_type: transaction.transaction_type,
              amount: transaction.amount,
              date: transaction.date,
              category: transaction.category || '',
              description: transaction.description || '',
              payment_method: transaction.payment_method || 'card',
              is_recurring: transaction.is_recurring || false,
              recurrence_frequency: transaction.recurrence_frequency || 'monthly',
            })
          } else {
            setFormData(prev => ({
              ...prev,
              category: data.length > 0 ? data[0].id : '',
            }))
          }
        })
        .catch(err => {
          console.error(err)
          toast.error('Failed to load categories')
        })
        .finally(() => setLoadingCats(false))
    }
  }, [isOpen, transaction])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount greater than 0')
      return
    }
    if (!formData.category) {
      toast.error('Please select or create a category first')
      return
    }

    setLoadingSubmit(true)
    try {
      if (transaction) {
        // Edit mode (note: in transactionsApi we use update(id, data))
        await onSuccess(transaction.id, formData)
        toast.success('Transaction updated!')
      } else {
        // Create mode
        await onSuccess(formData)
        toast.success('Transaction created!')
      }
      onClose()
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.detail || 'Failed to save transaction')
    } finally {
      setLoadingSubmit(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={transaction ? 'Edit Transaction' : 'Add New Transaction'}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Transaction Type Toggle */}
        <div className="grid grid-cols-2 p-1 bg-dark-elevated rounded-2xl border border-dark-border">
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, transaction_type: 'expense' }))}
            className={`py-2 text-sm font-bold rounded-xl transition-all duration-200 ${
              formData.transaction_type === 'expense'
                ? 'bg-accent-red text-white shadow-glow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, transaction_type: 'income' }))}
            className={`py-2 text-sm font-bold rounded-xl transition-all duration-200 ${
              formData.transaction_type === 'income'
                ? 'bg-accent-green text-white shadow-glow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Income
          </button>
        </div>

        {/* Amount & Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Amount"
            name="amount"
            type="number"
            step="0.01"
            icon={DollarSign}
            placeholder="0.00"
            value={formData.amount}
            onChange={handleChange}
            required
          />
          <Input
            label="Date"
            name="date"
            type="date"
            icon={Calendar}
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        {/* Category & Payment Method */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="input-label">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="input-field appearance-none"
              required
            >
              {loadingCats ? (
                <option>Loading categories...</option>
              ) : categories.length === 0 ? (
                <option value="">No categories (Create one first)</option>
              ) : (
                categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="input-label">Payment Method</label>
            <select
              name="payment_method"
              value={formData.payment_method}
              onChange={handleChange}
              className="input-field appearance-none"
            >
              <option value="card">Card / Credit</option>
              <option value="cash">Cash</option>
              <option value="transfer">Bank Transfer</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Description / Notes */}
        <Input
          label="Description"
          name="description"
          icon={FileText}
          placeholder="e.g. Weekly Groceries"
          value={formData.description}
          onChange={handleChange}
        />

        {/* Recurring Switch */}
        <div className="p-4 bg-dark-elevated rounded-2xl border border-dark-border">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-sm font-bold text-white block">Recurring Transaction</span>
              <span className="text-xs text-slate-500">Automatically repeat this transaction</span>
            </div>
            {/* Toggle switch */}
            <div
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                formData.is_recurring ? 'bg-primary-600' : 'bg-dark-muted'
              }`}
            >
              <input
                type="checkbox"
                name="is_recurring"
                checked={formData.is_recurring}
                onChange={handleChange}
                className="sr-only"
              />
              <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow transition-transform duration-200 ${
                formData.is_recurring ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </div>
          </label>

          {formData.is_recurring && (
            <div className="mt-4 animate-fade-in">
              <label className="input-label">Frequency</label>
              <select
                name="recurrence_frequency"
                value={formData.recurrence_frequency}
                onChange={handleChange}
                className="input-field appearance-none"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 justify-end pt-3 border-t border-dark-border">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loadingSubmit}>
            Save Transaction
          </Button>
        </div>
      </form>
    </Modal>
  )
}
