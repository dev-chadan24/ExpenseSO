import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from './context/AuthContext'
import { AUTH_BYPASS_MODE } from './config'
import { Toaster } from 'react-hot-toast'
import Layout from './components/layout/Layout'
import SkeletonLoader from './components/ui/SkeletonLoader'

// Lazy-loaded Pages for better bundle performance
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Transactions = lazy(() => import('./pages/Transactions'))
const Categories = lazy(() => import('./pages/Categories'))
const Budgets = lazy(() => import('./pages/Budgets'))
const Reports = lazy(() => import('./pages/Reports'))
const Analytics = lazy(() => import('./pages/Analytics'))
const Profile = lazy(() => import('./pages/Profile'))
const NotFound = lazy(() => import('./pages/NotFound'))

// Page wrapper for smooth page-level transitions
function PageTransitionWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  )
}

// Helper component for protecting routes
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen bg-dark-bg items-center justify-center text-slate-400">
        <SkeletonLoader variant="rect" className="w-12 h-12 rounded-full" />
      </div>
    )
  }

  // If auth bypass mode is disabled and user is not authenticated, force redirect to login
  if (!isAuthenticated && !AUTH_BYPASS_MODE) {
    return <Navigate to="/login" replace />
  }

  return <Layout>{children}</Layout>
}

// Helper component for anonymous-only routes (Login, Register)
function AnonymousRoute({ children }) {
  const { isAuthenticated } = useAuth()

  // If authenticated and not in bypass mode, route directly to Dashboard
  if (isAuthenticated && !AUTH_BYPASS_MODE) {
    return <Navigate to="/" replace />
  }

  return children
}

// Inner app with AnimatePresence using location key
function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Auth routes */}
        <Route
          path="/login"
          element={
            <AnonymousRoute>
              <Suspense fallback={<div className="min-h-screen bg-dark-bg flex items-center justify-center text-slate-400">Loading Login...</div>}>
                <PageTransitionWrapper>
                  <Login />
                </PageTransitionWrapper>
              </Suspense>
            </AnonymousRoute>
          }
        />
        <Route
          path="/register"
          element={
            <AnonymousRoute>
              <Suspense fallback={<div className="min-h-screen bg-dark-bg flex items-center justify-center text-slate-400">Loading Register...</div>}>
                <PageTransitionWrapper>
                  <Register />
                </PageTransitionWrapper>
              </Suspense>
            </AnonymousRoute>
          }
        />

        {/* Protected application routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Suspense fallback={<div className="p-6 space-y-6"><SkeletonLoader variant="stats" /><SkeletonLoader variant="chart" /></div>}>
                <PageTransitionWrapper>
                  <Dashboard />
                </PageTransitionWrapper>
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <Suspense fallback={<div className="p-6 space-y-6"><SkeletonLoader variant="table" /></div>}>
                <PageTransitionWrapper>
                  <Transactions />
                </PageTransitionWrapper>
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/categories"
          element={
            <ProtectedRoute>
              <Suspense fallback={<div className="p-6 space-y-6"><SkeletonLoader variant="table" /></div>}>
                <PageTransitionWrapper>
                  <Categories />
                </PageTransitionWrapper>
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/budgets"
          element={
            <ProtectedRoute>
              <Suspense fallback={<div className="p-6 space-y-6"><SkeletonLoader variant="chart" /></div>}>
                <PageTransitionWrapper>
                  <Budgets />
                </PageTransitionWrapper>
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Suspense fallback={<div className="p-6 space-y-6"><SkeletonLoader variant="chart" /><SkeletonLoader variant="table" /></div>}>
                <PageTransitionWrapper>
                  <Reports />
                </PageTransitionWrapper>
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Suspense fallback={<div className="p-6 space-y-6"><SkeletonLoader variant="chart" /></div>}>
                <PageTransitionWrapper>
                  <Analytics />
                </PageTransitionWrapper>
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Suspense fallback={<div className="p-6 space-y-6"><SkeletonLoader variant="rect" className="h-64 rounded-3xl" /></div>}>
                <PageTransitionWrapper>
                  <Profile />
                </PageTransitionWrapper>
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* 404 Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <Router>
      <AnimatedRoutes />

      {/* Global Hot Toaster Notification Widget */}
      <Toaster
        position="top-right"
        toastOptions={{
          className: '',
          style: {
            background: '#09090b',
            color: '#f4f4f5',
            border: '1px solid #27272a',
            borderRadius: '16px',
            fontSize: '14px',
            padding: '12px 16px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
          },
          success: {
            iconTheme: {
              primary: '#10d9a0',
              secondary: '#09090b',
            },
          },
          error: {
            iconTheme: {
              primary: '#f43f5e',
              secondary: '#09090b',
            },
          },
        }}
      />
    </Router>
  )
}
