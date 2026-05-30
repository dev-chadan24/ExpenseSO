import { useLocation, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCurrency } from '../../context/CurrencyContext'
import { Menu, Search, User, LogOut, Settings, ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import CommandPalette from '../ui/CommandPalette'
import NotificationDropdown from '../ui/NotificationDropdown'
import QuickActions from '../ui/QuickActions'

const getTimeGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

const getPageTitle = (pathname) => {
  switch (pathname) {
    case '/': return 'Dashboard'
    case '/transactions': return 'Transactions'
    case '/categories': return 'Categories'
    case '/budgets': return 'Monthly Budgets'
    case '/reports': return 'Financial Reports'
    case '/analytics': return 'Analytics'
    case '/profile': return 'Account Settings'
    default: return 'ExpenseSO'
  }
}

const formatTopbarDate = () => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export default function Topbar({ onMenuOpen, onAddTransaction }) {
  const { user, logout } = useAuth()
  const { currency, setCurrency } = useCurrency()
  const location = useLocation()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [currencyOpen, setCurrencyOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  
  const dropdownRef = useRef(null)
  const currencyRef = useRef(null)

  const displayName = user?.first_name || user?.username || 'User'
  const avatarSrc = user?.profile?.image || null
  const gravatarFallback = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'

  const currenciesList = ['INR', 'USD', 'GBP', 'EUR', 'AED', 'SAR', 'SGD', 'AUD', 'CAD']

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
      if (currencyRef.current && !currencyRef.current.contains(event.target)) {
        setCurrencyOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <>
      <header className="flex items-center justify-between h-16 px-4 sm:px-6 border-b border-dark-border bg-dark-surface/60 backdrop-blur-lg sticky top-0 z-30 shadow-inner-glow">
        {/* Left: Hamburger + Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuOpen}
            className="p-2 -ml-1 rounded-xl text-slate-400 hover:text-white hover:bg-dark-elevated transition-colors lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-bold text-white font-display leading-tight">
              {getPageTitle(location.pathname)}
            </h1>
            <p className="hidden sm:flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5 font-sans font-medium">
              <span className="text-primary-400 font-semibold">{getTimeGreeting()}, {displayName}</span>
              <span className="text-slate-600">·</span>
              <span>{formatTopbarDate()}</span>
            </p>
          </div>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Command Palette search activator */}
          <div className="relative hidden lg:block cursor-pointer" onClick={() => setPaletteOpen(true)}>
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              readOnly
              placeholder="Search or type command... (Ctrl + K)"
              className="w-52 pl-9 pr-4 py-1.5 rounded-xl text-xs bg-dark-elevated hover:bg-dark-muted border border-dark-border hover:border-dark-subtle text-slate-400 cursor-pointer placeholder:text-slate-500 focus:outline-none transition-all duration-200"
            />
          </div>

          {/* Currency Dropdown Switcher */}
          <div className="relative" ref={currencyRef}>
            <button
              onClick={() => setCurrencyOpen(!currencyOpen)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-dark-elevated border border-dark-border hover:border-dark-subtle transition-all active:scale-95 text-[10px] font-bold text-slate-300 hover:text-white font-mono"
              aria-label="Change currency"
            >
              <span>{currency}</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${currencyOpen ? 'rotate-180' : ''}`} />
            </button>

            {currencyOpen && (
              <div className="absolute right-0 mt-2 w-32 origin-top-right rounded-2xl bg-dark-card border border-dark-border shadow-glow-sm p-1.5 z-50 max-h-60 overflow-y-auto no-scrollbar animate-scale-in">
                <p className="px-2 py-1 mb-1 text-[8px] font-bold text-slate-500 uppercase tracking-wider">Markets</p>
                {currenciesList.map((code) => (
                  <button
                    key={code}
                    onClick={() => {
                      setCurrency(code)
                      setCurrencyOpen(false)
                    }}
                    className={`w-full px-2.5 py-1.5 rounded-xl text-left text-xs font-semibold font-mono transition-colors ${
                      currency === code
                        ? 'bg-primary-600 text-white'
                        : 'text-slate-300 hover:text-white hover:bg-dark-elevated'
                    }`}
                  >
                    {code}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions Dropdown */}
          <QuickActions onAddTransaction={onAddTransaction} />

          {/* Notifications Dropdown Widget */}
          <NotificationDropdown />

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-xl bg-dark-elevated border border-dark-border hover:border-dark-subtle transition-all active:scale-95"
              aria-label="User menu"
            >
              <img
                src={avatarSrc || gravatarFallback}
                alt={displayName}
                className="w-7 h-7 rounded-lg object-cover"
                onError={(e) => { e.target.src = gravatarFallback }}
              />
              <span className="hidden sm:block text-xs font-bold text-slate-200 max-w-[80px] truncate font-sans">
                {displayName}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 origin-top-right rounded-2xl bg-dark-card border border-dark-border shadow-glow-sm p-1.5 animate-scale-in z-50">
                {/* User info header */}
                <div className="px-3 py-2.5 mb-1 border-b border-dark-border/60">
                  <p className="text-xs font-bold text-white truncate font-display">{displayName}</p>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5 font-sans">{user?.email || 'demo@expenseso.com'}</p>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-dark-elevated transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>My Profile</span>
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-dark-elevated transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>Preferences</span>
                </Link>

                <hr className="my-1 border-dark-border/60" />

                <button
                  onClick={() => {
                    setDropdownOpen(false)
                    logout()
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-xs font-semibold text-accent-red hover:bg-accent-red/10 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Command Palette search overlay */}
      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  )
}
