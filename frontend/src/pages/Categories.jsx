import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, FolderTree, Tag, Info, AlertTriangle } from 'lucide-react'
import { categoriesApi } from '../api/categories'
import { formatCurrency } from '../utils/formatters'
import { useAuth } from '../context/AuthContext'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import Skeleton from '../components/ui/Skeleton'
import toast from 'react-hot-toast'

import { motion } from 'framer-motion'

export default function Categories() {
  const { currencySymbol } = useAuth()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState(null)
  const [formData, setFormData] = useState({ name: '', color: '#6366f1', icon: 'tag' })
  const [loadingSubmit, setLoadingSubmit] = useState(false)

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const { data } = await categoriesApi.list()
      setCategories(data.results || data || [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleOpenAdd = () => {
    setActiveCategory(null)
    setFormData({ name: '', color: '#6366f1', icon: 'tag' })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (cat) => {
    setActiveCategory(cat)
    setFormData({ name: cat.name, color: cat.color || '#6366f1', icon: cat.icon || 'tag' })
    setIsModalOpen(true)
  }

  const handleModalSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error('Category name is required')
      return
    }

    setLoadingSubmit(true)
    try {
      if (activeCategory) {
        await categoriesApi.update(activeCategory.id, formData)
        toast.success('Category updated')
      } else {
        await categoriesApi.create(formData)
        toast.success('Category created')
      }
      setIsModalOpen(false)
      fetchCategories()
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.detail || 'Failed to save category')
    } finally {
      setLoadingSubmit(false)
    }
  }

  const handleDelete = async (cat) => {
    if (window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
      try {
        await categoriesApi.delete(cat.id)
        toast.success('Category deleted')
        fetchCategories()
      } catch (err) {
        console.error(err)
        // If categories view returns 400 with detail (cannot delete if transactions exist)
        toast.error(err.response?.data?.detail || 'Failed to delete category')
      }
    }
  }

  const premiumColors = [
    '#6366f1', '#10d9a0', '#f43f5e', '#f59e0b', '#a855f7',
    '#06b6d4', '#ec4899', '#3b82f6', '#14b8a6', '#f97316'
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Header quick welcome + Quick Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight font-display">
            Transaction Categories
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Organize payments using tags with dedicated color identifiers.
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={handleOpenAdd}
        >
          Add Category
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => (
            <Skeleton key={n} variant="rect" className="h-44" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 text-sm gap-2">
          <FolderTree className="w-12 h-12 text-dark-subtle" />
          <span>No categories found. Create one to begin tracking expenses.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const totalSpent = cat.total_spent || 0
            const totalIncome = cat.total_income || 0
            const txCount = cat.transaction_count || 0

            return (
              <Card key={cat.id} hover className="relative overflow-hidden group">
                {/* Visual border colored as the category */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1.5"
                  style={{ backgroundColor: cat.color }}
                />

                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3 pl-1">
                    <div
                      className="p-2.5 rounded-xl border"
                      style={{
                        backgroundColor: `${cat.color}15`,
                        borderColor: `${cat.color}35`,
                        color: cat.color,
                      }}
                    >
                      <Tag className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white leading-tight text-lg">
                        {cat.name}
                      </h3>
                      <span className="text-xs text-slate-400 font-medium">
                        {txCount} transaction{txCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1.5 rounded-lg bg-dark-elevated text-slate-400 hover:text-white hover:bg-dark-muted transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      className="p-1.5 rounded-lg bg-accent-red/10 text-accent-red hover:bg-accent-red/20 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-dark-border/40 pl-1">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Total Expended
                    </span>
                    <span className="text-sm font-bold text-accent-red leading-none">
                      {formatCurrency(totalSpent, currencySymbol)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Total Inbound
                    </span>
                    <span className="text-sm font-bold text-accent-green leading-none">
                      {formatCurrency(totalIncome, currencySymbol)}
                    </span>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal Dialog */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={activeCategory ? 'Edit Category' : 'Create Category'}
      >
        <form onSubmit={handleModalSubmit} className="space-y-5">
          <Input
            label="Category Name"
            placeholder="e.g. Restaurants, Rent, Dividends"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          {/* Color Selection Palette */}
          <div>
            <label className="input-label">Theme Color</label>
            <div className="flex flex-wrap gap-2.5 mt-2">
              {premiumColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-9 h-9 rounded-xl border-2 transition-all cursor-pointer ${
                    formData.color === color
                      ? 'border-white scale-110 shadow-glow-sm'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
              {/* Custom input picker */}
              <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-dark-border hover:scale-105 transition-transform cursor-pointer">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="absolute inset-0 w-full h-full p-0 border-none cursor-pointer scale-125"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-3 border-t border-dark-border">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={loadingSubmit}>
              Save Category
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  )
}
