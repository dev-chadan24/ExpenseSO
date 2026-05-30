import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  ArrowLeftRight,
  FolderTree,
  PiggyBank,
  FileText,
  LineChart,
  User,
  LogOut,
  Sun,
  Moon,
  Wallet,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

const links = [
  { to: '/',            label: 'Dashboard',   icon: LayoutDashboard, end: true },
  { to: '/transactions',label: 'Transactions', icon: ArrowLeftRight },
  { to: '/categories',  label: 'Categories',   icon: FolderTree },
  { to: '/budgets',     label: 'Budgets',      icon: PiggyBank },
  { to: '/reports',     label: 'Reports',      icon: FileText },
  { to: '/analytics',   label: 'Analytics',    icon: LineChart },
  { to: '/profile',     label: 'Profile',      icon: User },
]

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [isCollapsed, setIsCollapsed] = useState(() =>
    localStorage.getItem('sidebar_collapsed') === 'true'
  )

  const handleToggleCollapse = () => {
    const next = !isCollapsed
    setIsCollapsed(next)
    localStorage.setItem('sidebar_collapsed', String(next))
  }

  const gravatarFallback = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
  const avatarSrc = user?.profile?.image || null
  const displayName = user?.first_name && user?.last_name
    ? `${user.first_name} ${user.last_name}`
    : user?.username || 'User'

  // Framer Motion variant configurations
  const sidebarVariants = {
    expanded: { width: 256 },
    collapsed: { width: 72 }
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar with framer-motion width transition */}
      <motion.aside
        initial={isCollapsed ? 'collapsed' : 'expanded'}
        animate={isCollapsed ? 'collapsed' : 'expanded'}
        variants={sidebarVariants}
        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        className={`
          fixed top-0 bottom-0 left-0 z-50 flex flex-col
          border-r border-dark-border/80
          lg:static lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          w-64 shrink-0
        `}
        style={{ background: 'var(--card-bg-solid)' }}
      >
        {/* Header / Brand */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-dark-border/80 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden min-w-0">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-purple shadow-glow-sm shrink-0">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            {!isCollapsed && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <span className="text-sm font-bold tracking-tight text-slate-100 font-display block">
                  Expense<span className="text-primary-400">SO</span>
                </span>
                <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider -mt-0.5">
                  Premium SaaS
                </span>
              </motion.div>
            )}
          </div>

          {/* Collapse toggle — desktop */}
          <button
            onClick={handleToggleCollapse}
            className="hidden lg:flex shrink-0 p-1.5 rounded-lg text-slate-500 hover:text-slate-100 hover:bg-dark-elevated transition-colors border border-transparent hover:border-dark-border"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Close — mobile */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-dark-elevated transition-colors lg:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
          {links.map(({ to, label, icon: Icon, end }, index) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `nav-link relative group ${isActive ? 'active' : ''}
                 ${isCollapsed ? 'lg:justify-center lg:px-0' : ''}`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="w-[18px] h-[18px] shrink-0 z-10" />
                  {!isCollapsed && (
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="z-10 font-medium whitespace-nowrap"
                    >
                      {label}
                    </motion.span>
                  )}
                  
                  {/* Left Active border indicator */}
                  {isActive && (
                    <motion.div 
                      layoutId="activeSideIndicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-primary-500 rounded-r-md"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}

                  {/* Tooltip on collapse */}
                  {isCollapsed && (
                    <div className="
                      absolute left-full ml-3 px-2.5 py-1.5
                      bg-[#09090b] border border-dark-border rounded-xl
                      text-[10px] font-bold text-slate-100 uppercase tracking-wider
                      opacity-0 group-hover:opacity-100
                      pointer-events-none transition-opacity duration-150
                      z-[60] shadow-glow-sm whitespace-nowrap
                      hidden lg:block
                    ">
                      {label}
                    </div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-dark-border/80 space-y-2 shrink-0">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl
              text-xs font-semibold text-slate-400 hover:text-white
              hover:bg-dark-elevated transition-colors
              ${isCollapsed ? 'lg:justify-center lg:px-0' : ''}`}
            title="Toggle theme"
          >
            {theme === 'dark' ? (
              <Moon className="w-[18px] h-[18px] text-primary-400 shrink-0" />
            ) : (
              <Sun className="w-[18px] h-[18px] text-accent-amber shrink-0" />
            )}
            {!isCollapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="whitespace-nowrap">
                {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </motion.span>
            )}
          </button>

          {/* User info + logout */}
          <div className={`flex items-center gap-2.5 px-2 py-1.5 rounded-xl border border-transparent hover:border-dark-border/40 hover:bg-dark-elevated/20 transition-all ${
            isCollapsed ? 'lg:justify-center lg:px-0' : ''
          }`}>
            <img
              src={avatarSrc || gravatarFallback}
              alt={displayName}
              className="w-8 h-8 rounded-xl object-cover border border-dark-border/80 shrink-0"
              onError={(e) => { e.target.src = gravatarFallback }}
            />
            {!isCollapsed && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="flex-1 min-w-0"
              >
                <p className="text-xs font-bold text-slate-100 truncate leading-tight">
                  {displayName}
                </p>
                <p className="text-[9px] text-slate-500 truncate mt-0.5 font-medium">
                  {user?.email || 'demo@expenseso.com'}
                </p>
              </motion.div>
            )}

            {!isCollapsed && (
              <button
                onClick={logout}
                className="p-1.5 rounded-lg hover:bg-accent-red/10 text-slate-500 hover:text-accent-red transition-all active:scale-95 shrink-0"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  )
}
