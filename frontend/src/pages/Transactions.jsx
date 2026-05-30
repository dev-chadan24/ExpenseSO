import React, { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  AlertCircle,
  X,
  FileSpreadsheet
} from 'lucide-react'
import { transactionsApi } from '../api/transactions'
import { categoriesApi } from '../api/categories'
import { reportsApi } from '../api/reports'
import { useCurrency } from '../context/CurrencyContext'
import { useAuth } from '../context/AuthContext'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import SkeletonLoader from '../components/ui/SkeletonLoader'
import TransactionModal from '../components/forms/TransactionModal'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import SectionHeader from '../components/ui/SectionHeader'
import PremiumTable from '../components/ui/PremiumTable'
import EmptyState from '../components/ui/EmptyState'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

export default function Transactions() {
  const { currencySymbol, formatCurrency, formatDate } = useCurrency()

  // State
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  // Filters state
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [category, setCategory] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [sortBy, setSortBy] = useState('-date')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTransaction, setActiveTransaction] = useState(null)

  const fetchCategories = async () => {
    try {
      const { data } = await categoriesApi.list()
      setCategories(data.results || data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const params = {
        page,
        search: search || undefined,
        transaction_type: type || undefined,
        category: category || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        ordering: sortBy,
      }
      const { data } = await transactionsApi.list(params)
      // DRF PageNumberPagination returns { count, next, previous, results }
      setTransactions(data.results || data || [])
      setTotalCount(data.count || (data.length || 0))
    } catch (err) {
      console.error(err)
      toast.error('Failed to fetch transactions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchTransactions()
  }, [page, type, category, startDate, endDate, sortBy])

  // Listen to global changes
  useEffect(() => {
    window.addEventListener('transaction-added', fetchTransactions)
    return () => {
      window.removeEventListener('transaction-added', fetchTransactions)
    }
  }, [sortBy, page])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setPage(1)
    fetchTransactions()
  }

  const handleClearFilters = () => {
    setSearch('')
    setType('')
    setCategory('')
    setStartDate('')
    setEndDate('')
    setSortBy('-date')
    setPage(1)
  }

  const handleOpenAddModal = () => {
    setActiveTransaction(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (tx) => {
    setActiveTransaction(tx)
    setIsModalOpen(true)
  }

  const handleModalSuccess = async (idOrData, maybeData) => {
    if (maybeData) {
      // Edit
      await transactionsApi.update(idOrData, maybeData)
      toast.success('Transaction updated')
    } else {
      // Create
      await transactionsApi.create(idOrData)
      toast.success('Transaction created')
    }
    fetchTransactions()
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      transactionsApi.delete(id)
        .then(() => {
          toast.success('Transaction deleted')
          fetchTransactions()
        })
        .catch(err => {
          console.error(err)
          toast.error('Failed to delete transaction')
        })
    }
  }

  const handleExportCSV = async () => {
    setExporting(true)
    try {
      const params = {
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      }
      const { data } = await reportsApi.exportCsv(params)
      // Download blob
      const url = window.URL.createObjectURL(new Blob([data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `expenseso_export_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('CSV Export downloaded')
    } catch (err) {
      console.error(err)
      toast.error('CSV Export failed')
    } finally {
      setExporting(false)
    }
  }

  // Handle columns sorting click
  const handleSort = (field) => {
    setSortBy((prev) => {
      if (prev === field) {
        return `-${field}` // invert order
      }
      return field
    })
    setPage(1)
  }

  const totalPages = Math.ceil(totalCount / 20)

  // Columns definition schema for PremiumTable
  const columns = [
    {
      key: 'description',
      label: 'Description',
      sortable: true,
      sortField: 'description',
      render: (tx) => (
        <div className="font-semibold text-white truncate max-w-[220px]" title={tx.description}>
          {tx.description || 'Untitled Transaction'}
        </div>
      )
    },
    {
      key: 'category_name',
      label: 'Category',
      sortable: true,
      sortField: 'category',
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
            className="w-1.5 h-1.5 rounded-full inline-block"
            style={{ backgroundColor: tx.category_color }}
          />
          {tx.category_name || 'Uncategorized'}
        </span>
      )
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      sortField: 'date',
      render: (tx) => (
        <span className="text-slate-400 text-xs font-semibold">
          {formatDate(tx.date, 'MMM dd, yyyy')}
        </span>
      )
    },
    {
      key: 'payment_method',
      label: 'Payment Method',
      render: (tx) => (
        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">
          {tx.payment_method}
        </span>
      )
    },
    {
      key: 'recurrence',
      label: 'Recurrence',
      render: (tx) => (
        <Badge variant={tx.is_recurring ? 'warning' : 'neutral'}>
          {tx.is_recurring ? `Recurring (${tx.recurrence_frequency})` : 'One-time'}
        </Badge>
      )
    },
    {
      key: 'amount',
      label: 'Amount',
      align: 'right',
      sortable: true,
      sortField: 'amount',
      render: (tx) => (
        <span className={`font-extrabold font-display ${
          tx.transaction_type === 'income' ? 'text-accent-green' : 'text-accent-red'
        }`}>
          {tx.transaction_type === 'income' ? '+' : '-'}
          {formatCurrency(tx.amount, currencySymbol)}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'center',
      render: (tx) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handleOpenEditModal(tx)}
            className="p-1.5 rounded-lg bg-dark-elevated text-slate-400 hover:text-white hover:bg-dark-muted transition-colors"
            title="Edit"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDelete(tx.id)}
            className="p-1.5 rounded-lg bg-accent-red/10 text-accent-red hover:bg-accent-red/20 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ]

  const emptyStateWidget = (
    <EmptyState
      title="No transactions logged"
      description="No record matches your search query. Try tweaking filters or creating a new transaction."
      icon={AlertCircle}
      action={
        <button onClick={handleClearFilters} className="btn-secondary">
          Reset Filters
        </button>
      }
    />
  )

  const cleanSortDirection = sortBy.startsWith('-') ? 'desc' : 'asc'
  const cleanSortKey = sortBy.replace(/^-/, '')

  return (
    <div className="space-y-6">
      {/* Header with SectionHeader */}
      <SectionHeader
        title="Transactions Registry"
        description="Review, filter, and organize all asset inflows and expenditures."
        actions={
          <>
            <Button
              variant="secondary"
              icon={FileSpreadsheet}
              onClick={handleExportCSV}
              loading={exporting}
            >
              Export CSV
            </Button>
            <Button
              variant="primary"
              icon={Plus}
              onClick={handleOpenAddModal}
            >
              New Transaction
            </Button>
          </>
        }
      />

      {/* Filter and search bar */}
      <Card className="p-5 border border-dark-border/60 hover:border-dark-subtle/40 transition-all duration-300">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search descriptions, payment memos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-dark-elevated border border-dark-border text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-primary-500 transition-all duration-200"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              {/* Type Filter */}
              <select
                value={type}
                onChange={(e) => { setType(e.target.value); setPage(1); }}
                className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-dark-elevated border border-dark-border text-slate-300 focus:outline-none focus:border-primary-500 cursor-pointer"
              >
                <option value="">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>

              {/* Category Filter */}
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-dark-elevated border border-dark-border text-slate-300 focus:outline-none focus:border-primary-500 cursor-pointer"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Sort Filter */}
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-dark-elevated border border-dark-border text-slate-300 focus:outline-none focus:border-primary-500 cursor-pointer"
              >
                <option value="-date">Newest Date</option>
                <option value="date">Oldest Date</option>
                <option value="-amount">Highest Amount</option>
                <option value="amount">Lowest Amount</option>
                <option value="description">Description (A-Z)</option>
                <option value="-description">Description (Z-A)</option>
              </select>

              <Button type="submit" variant="primary" className="py-2.5 px-5">
                Apply Search
              </Button>

              <button
                type="button"
                onClick={handleClearFilters}
                className="btn-ghost flex items-center gap-1.5 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Date range filters */}
          <div className="flex flex-wrap gap-4 items-center pt-3 border-t border-dark-border/40 text-xs font-semibold text-slate-400">
            <span className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span>Date Range:</span>
            </span>
            <div className="flex items-center gap-2">
              <label className="text-[10px] uppercase font-bold text-slate-500">From</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                className="bg-dark-elevated border border-dark-border rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-primary-500 cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[10px] uppercase font-bold text-slate-500">To</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                className="bg-dark-elevated border border-dark-border rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-primary-500 cursor-pointer"
              />
            </div>
          </div>
        </form>
      </Card>

      {/* Transactions Table Container */}
      <Card className="overflow-hidden p-0 border border-dark-border/60">
        {loading ? (
          <div className="p-6">
            <SkeletonLoader variant="table" />
          </div>
        ) : (
          <PremiumTable
            columns={columns}
            data={transactions}
            sortKey={cleanSortKey}
            sortDirection={cleanSortDirection}
            onSort={handleSort}
            emptyState={emptyStateWidget}
          />
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-dark-border/80 bg-dark-card/30">
            <span className="text-xs text-slate-400 font-semibold font-sans">
              Showing page {page} of {totalPages} ({totalCount} total results)
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                icon={ChevronLeft}
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="py-1.5 px-3.5"
              >
                Prev
              </Button>
              <Button
                variant="secondary"
                icon={ChevronRight}
                iconPosition="right"
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
                className="py-1.5 px-3.5"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Form Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transaction={activeTransaction}
        onSuccess={handleModalSuccess}
      />
    </div>
  )
}
