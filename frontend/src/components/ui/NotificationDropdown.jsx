import React, { useState, useEffect, useRef } from 'react'
import { Bell, Sparkles, AlertCircle, RefreshCw, BadgePercent } from 'lucide-react'
import { AUTH_BYPASS_MODE } from '../../config'

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const notifications = [
    {
      id: 1,
      title: 'Dev Mode Active',
      description: 'Zero-API authentication bypass is active for local development.',
      type: 'info',
      icon: RefreshCw,
      time: 'Just now',
      unread: true,
      show: AUTH_BYPASS_MODE
    },
    {
      id: 2,
      title: 'Budget Alert (Food)',
      description: 'You have consumed 87% of your set food budget limit for this month.',
      type: 'warning',
      icon: AlertCircle,
      time: '2 hours ago',
      unread: true,
      show: true
    },
    {
      id: 3,
      title: 'Savings Milestone',
      description: 'Congratulations! Your net savings rate is up 12% compared to last month.',
      type: 'success',
      icon: Sparkles,
      time: '1 day ago',
      unread: false,
      show: true
    },
    {
      id: 4,
      title: 'Recurring Invoice',
      description: 'Your monthly SaaS subscription invoice of $49.00 has been logged.',
      type: 'info',
      icon: BadgePercent,
      time: '2 days ago',
      unread: false,
      show: true
    }
  ].filter(n => n.show !== false)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-dark-elevated border border-dark-border text-slate-400 hover:text-white hover:border-dark-subtle transition-all active:scale-95"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-green animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 origin-top-right rounded-2xl bg-dark-card border border-dark-border shadow-glow-sm p-1.5 z-[60] animate-scale-in">
          {/* Header */}
          <div className="px-3.5 py-3 border-b border-dark-border/60 flex items-center justify-between">
            <span className="text-sm font-bold text-white font-display">Notifications</span>
            {unreadCount > 0 && (
              <span className="text-[10px] font-bold bg-primary-600 text-white px-2 py-0.5 rounded-full">
                {unreadCount} New
              </span>
            )}
          </div>

          {/* List items */}
          <div className="max-h-[280px] overflow-y-auto no-scrollbar py-1">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                All caught up! No new notifications.
              </div>
            ) : (
              notifications.map((notif) => {
                const Icon = notif.icon
                const typeColors = {
                  warning: 'text-accent-amber bg-accent-amber/10 border-accent-amber/20',
                  success: 'text-accent-green bg-accent-green/10 border-accent-green/20',
                  info: 'text-primary-400 bg-primary-500/10 border-primary-500/20'
                }
                return (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-xl hover:bg-dark-elevated/50 transition-colors flex gap-3 relative ${
                      notif.unread ? 'bg-dark-elevated/20' : ''
                    }`}
                  >
                    <div className={`p-2 rounded-lg border h-fit shrink-0 ${typeColors[notif.type] || typeColors.info}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-xs font-bold text-white truncate ${notif.unread ? 'pr-2' : ''}`}>{notif.title}</p>
                        <span className="text-[9px] text-slate-500 font-medium shrink-0">{notif.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{notif.description}</p>
                    </div>
                    {notif.unread && (
                      <span className="absolute top-4 right-3 w-1.5 h-1.5 rounded-full bg-primary-500" />
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-3 py-2 border-t border-dark-border/60 text-center">
            <button
              onClick={() => setIsOpen(false)}
              className="text-[10px] font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-wider"
            >
              Clear All Alerts
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
