import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Plus, PiggyBank, FolderTree, FileSpreadsheet } from 'lucide-react'

export default function QuickActions({ onAddTransaction }) {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-dark-elevated hover:bg-dark-muted border border-dark-border hover:border-dark-subtle text-slate-200 transition-all active:scale-95 shadow-inner-glow"
      >
        <Sparkles className="w-3.5 h-3.5 text-primary-400 shrink-0" />
        <span>Actions</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-48 origin-top-right rounded-2xl bg-dark-card border border-dark-border shadow-glow-sm p-1.5 z-40 animate-scale-in">
          <button
            onClick={() => {
              setIsOpen(false)
              if (onAddTransaction) onAddTransaction()
            }}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-dark-elevated transition-colors text-left"
          >
            <Plus className="w-3.5 h-3.5 text-primary-400 shrink-0" />
            <span className="font-semibold">Add Transaction</span>
          </button>

          <button
            onClick={() => {
              setIsOpen(false)
              navigate('/budgets')
            }}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-dark-elevated transition-colors text-left"
          >
            <PiggyBank className="w-3.5 h-3.5 text-accent-green shrink-0" />
            <span className="font-semibold">Manage Budgets</span>
          </button>

          <button
            onClick={() => {
              setIsOpen(false)
              navigate('/categories')
            }}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-dark-elevated transition-colors text-left"
          >
            <FolderTree className="w-3.5 h-3.5 text-accent-purple shrink-0" />
            <span className="font-semibold">Categories</span>
          </button>

          <button
            onClick={() => {
              setIsOpen(false)
              navigate('/reports')
            }}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-dark-elevated transition-colors text-left"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-accent-cyan shrink-0" />
            <span className="font-semibold">Export CSV Summary</span>
          </button>
        </div>
      )}
    </div>
  )
}
