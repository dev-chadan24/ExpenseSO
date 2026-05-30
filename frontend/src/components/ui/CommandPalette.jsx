import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, LayoutDashboard, ArrowLeftRight, FolderTree, PiggyBank, FileText, LineChart, User, Moon, Sun, Sparkles, X } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export default function CommandPalette({ isOpen, onClose }) {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setSelectedIndex(0)
      setQuery('')
    }
  }, [isOpen])

  // Listen for global open command (Ctrl + K or Cmd + K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        if (isOpen) onClose()
        else onClose(true) // trigger open parent-state
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const commands = [
    { id: 'dash',     title: 'Go to Dashboard',    category: 'Navigation', icon: LayoutDashboard, action: () => navigate('/') },
    { id: 'tx',       title: 'Go to Transactions', category: 'Navigation', icon: ArrowLeftRight,   action: () => navigate('/transactions') },
    { id: 'cat',      title: 'Go to Categories',   category: 'Navigation', icon: FolderTree,       action: () => navigate('/categories') },
    { id: 'budgets',  title: 'Go to Budgets',      category: 'Navigation', icon: PiggyBank,        action: () => navigate('/budgets') },
    { id: 'reports',  title: 'Go to Reports',      category: 'Navigation', icon: FileText,         action: () => navigate('/reports') },
    { id: 'analytics',title: 'Go to Analytics',    category: 'Navigation', icon: LineChart,        action: () => navigate('/analytics') },
    { id: 'profile',  title: 'Go to Profile Settings', category: 'Navigation', icon: User,         action: () => navigate('/profile') },
    { id: 'theme',    title: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`, category: 'Preferences', icon: theme === 'dark' ? Sun : Moon, action: () => toggleTheme() },
  ]

  const filtered = commands.filter(cmd =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  )

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev + 1) % filtered.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev - 1 + filtered.length) % filtered.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action()
        onClose()
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Palette Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-xl bg-[#09090b]/95 border border-dark-border rounded-3xl shadow-glow-md overflow-hidden z-10"
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-dark-border">
              <Search className="w-5 h-5 text-slate-500 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Type a command or search sections... (Ctrl + K)"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent text-slate-100 text-base placeholder:text-slate-500 focus:outline-none"
              />
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-dark-elevated transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List results */}
            <div className="max-h-[360px] overflow-y-auto p-2 no-scrollbar">
              {filtered.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-sm flex flex-col items-center gap-2">
                  <Sparkles className="w-6 h-6 text-slate-600 animate-pulse" />
                  <span>No matching commands found</span>
                </div>
              ) : (
                <div className="space-y-1">
                  {filtered.map((cmd, idx) => {
                    const isSelected = selectedIndex === idx
                    const Icon = cmd.icon
                    return (
                      <div
                        key={cmd.id}
                        onClick={() => { cmd.action(); onClose(); }}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`
                          flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer transition-all duration-150
                          ${isSelected ? 'bg-primary-600 text-white shadow-glow-sm' : 'text-slate-300 hover:bg-dark-elevated'}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                          <span className="text-sm font-medium">{cmd.title}</span>
                        </div>
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-dark-elevated text-slate-500 border border-dark-border'
                        }`}>
                          {cmd.category}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer tips */}
            <div className="px-4 py-2 bg-dark-surface/40 border-t border-dark-border/40 text-[10px] text-slate-500 font-semibold flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span>↑↓ to navigate</span>
                <span>↵ to select</span>
                <span>esc to close</span>
              </div>
              <span className="text-primary-400">ExpenseSO Command Menu</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
