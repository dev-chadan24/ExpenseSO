import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../api/auth'
import { AUTH_BYPASS_MODE, DUMMY_USER } from '../config'
import { tokenStorage } from '../services/tokenStorage'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // Load user from localStorage or fetch auto-authenticated profile on mount
  useEffect(() => {
    async function initAuth() {
      // 1. If in Auth Bypass Mode, instantly load dummy user and stop startup API dependence
      if (AUTH_BYPASS_MODE) {
        setUser(DUMMY_USER)
        setLoading(false)
        return
      }

      // 2. Original production authentication initialization
      const stored = tokenStorage.getUser()
      const token  = tokenStorage.getAccessToken()
      if (stored && token) {
        try {
          setUser(stored)
          setLoading(false)
          return
        } catch {
          clearAuth()
        }
      }

      // If no stored credentials, try to fetch the profile from the backend (which auto-authenticates as admin)
      try {
        const { data } = await authApi.getProfile()
        tokenStorage.setUser(data)
        setUser(data)
      } catch (err) {
        console.warn('Silent auto-auth profile fetch failed, using admin fallback:', err)
        const fallbackUser = {
          id: 1,
          username: 'admin',
          email: 'admin@expenseso.com',
          first_name: 'Admin',
          last_name: 'User',
          full_name: 'Admin User',
          profile: {
            currency: 'INR',
            monthly_budget: 150000.00,
            phone: '',
            bio: 'ExpenseSO Account Administrator',
            theme_preference: 'dark',
            image: null
          }
        }
        setUser(fallbackUser)
      } finally {
        setLoading(false)
      }
    }
    initAuth()
  }, [])

  const clearAuth = () => {
    tokenStorage.clearAll()
    setUser(null)
  }

  const saveAuth = (userData, access, refresh) => {
    tokenStorage.setAccessToken(access)
    tokenStorage.setRefreshToken(refresh)
    tokenStorage.setUser(userData)
    setUser(userData)
  }

  const login = useCallback(async (email, password) => {
    if (AUTH_BYPASS_MODE) {
      setUser(DUMMY_USER)
      return DUMMY_USER
    }

    const data = await authApi.login(email, password)
    // Save tokens first so subsequent request (getProfile) can use them
    tokenStorage.setAccessToken(data.access)
    tokenStorage.setRefreshToken(data.refresh)
    try {
      const profileRes = await authApi.getProfile()
      tokenStorage.setUser(profileRes.data)
      setUser(profileRes.data)
      return profileRes.data
    } catch (err) {
      // Clean up in case profile loading fails
      tokenStorage.clearAll()
      throw err
    }
  }, [])

  const register = useCallback(async (formData) => {
    if (AUTH_BYPASS_MODE) {
      setUser(DUMMY_USER)
      return DUMMY_USER
    }

    const { data } = await authApi.register(formData)
    saveAuth(data.user, data.access, data.refresh)
    return data.user
  }, [])

  const logout = useCallback(async () => {
    if (AUTH_BYPASS_MODE) {
      toast.success('Bypass mode active: Session preserved.')
      return
    }

    try {
      const refresh = tokenStorage.getRefreshToken()
      if (refresh) await authApi.logout(refresh)
    } catch { /* ignore */ }
    clearAuth()
  }, [])

  const refreshProfile = useCallback(async () => {
    if (AUTH_BYPASS_MODE) {
      return DUMMY_USER
    }

    try {
      const { data } = await authApi.getProfile()
      tokenStorage.setUser(data)
      setUser(data)
      return data
    } catch (err) {
      console.error('Failed to refresh profile', err)
    }
  }, [])

  const updateProfile = useCallback(async (formData) => {
    if (AUTH_BYPASS_MODE) {
      // In bypass mode, simulate profile update locally
      const updatedUser = {
        ...user,
        first_name: formData.get('first_name') || user.first_name,
        last_name: formData.get('last_name') || user.last_name,
        email: formData.get('email') || user.email,
        profile: {
          ...user?.profile,
          phone: formData.get('phone') || user?.profile?.phone,
          bio: formData.get('bio') || user?.profile?.bio,
          currency: formData.get('currency') || user?.profile?.currency,
          monthly_budget: parseFloat(formData.get('monthly_budget')) || user?.profile?.monthly_budget,
        }
      }
      setUser(updatedUser)
      toast.success('Profile updated (bypass mode simulation)!')
      return updatedUser
    }

    const { data } = await authApi.updateProfile(formData)
    tokenStorage.setUser(data)
    setUser(data)
    toast.success('Profile updated!')
    return data
  }, [user])

  return (
    <AuthContext.Provider value={{
      user, loading,
      login, register, logout,
      refreshProfile, updateProfile,
      isAuthenticated: !!user,
      currency: user?.profile?.currency || 'INR',
      currencySymbol: getCurrencySymbol(user?.profile?.currency || 'INR'),
    }}>
      {children}
    </AuthContext.Provider>
  )
}

function getCurrencySymbol(currency) {
  const map = { 
    INR: '₹', 
    USD: '$', 
    GBP: '£', 
    EUR: '€', 
    AED: 'AED ', 
    SAR: 'SAR ', 
    SGD: 'S$', 
    AUD: 'A$', 
    CAD: 'C$' 
  }
  return map[currency] || currency || '₹'
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
