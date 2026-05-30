import axios from 'axios'
import { AUTH_BYPASS_MODE, API_BASE_URL } from '../config'
import { tokenStorage } from '../services/tokenStorage'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// Startup Validation check
if (typeof window !== 'undefined') {
  axios.get(`${API_BASE_URL}/auth/profile/`, { timeout: 3000 }).catch(err => {
    if (!err.response) {
      console.warn('⚠️ ExpenseSO Startup Alert: Backend service is unreachable at', API_BASE_URL)
    }
  })
}

// ── Request interceptor: attach access token & check offline state ──────────
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined' && !navigator.onLine) {
      toast.error('Offline Mode: Directing operations to local fallback.')
      return Promise.reject(new axios.Cancel('Application is currently offline.'))
    }
    // In bypass mode, if we don't have a token, we don't attach one.
    // The backend BypassAuthentication will handle the request as 'admin'.
    const token = tokenStorage.getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor: auto refresh on 401 & retry on 5xx ────────────────
let isRefreshing = false
let refreshQueue = []

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (!originalRequest) return Promise.reject(error)

    // Auto-retry transient failures (500-504 or raw connection drops) up to 2 times
    const shouldRetry = !originalRequest._retryCount || originalRequest._retryCount < 2
    const isTransientError = !error.response || (error.response.status >= 500 && error.response.status <= 504)
    
    if (isTransientError && shouldRetry) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1
      console.warn(`Axios Interceptor: Transient error. Retrying request (${originalRequest._retryCount}/2)...`)
      return new Promise(resolve => setTimeout(resolve, 1500)).then(() => api(originalRequest))
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (AUTH_BYPASS_MODE) {
        console.warn('Axios Interceptor: 401 encountered in AUTH_BYPASS_MODE. Bypassing clear & redirect.')
        // In bypass mode, just return or reject the error without redirecting or cleaning state.
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = tokenStorage.getRefreshToken()
        if (!refreshToken) throw new Error('No refresh token available')

        const { data } = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, { refresh: refreshToken })
        const newAccess = data.access

        tokenStorage.setAccessToken(newAccess)

        // Flush queue
        refreshQueue.forEach(({ resolve }) => resolve(newAccess))
        refreshQueue = []

        originalRequest.headers.Authorization = `Bearer ${newAccess}`
        return api(originalRequest)
      } catch (refreshError) {
        refreshQueue.forEach(({ reject }) => reject(refreshError))
        refreshQueue = []

        // Clear auth and let pages handle unauthorized state
        tokenStorage.clearAll()
        console.warn('Axios Interceptor: Auto-refresh failed. Credentials cleared.')
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
