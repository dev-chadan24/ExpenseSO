import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, Wallet } from 'lucide-react'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Successfully logged in!')
      navigate('/')
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.detail || 'Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-dark-bg text-slate-100 overflow-hidden">
      {/* Left side banner */}
      <div className="hidden lg:flex lg:w-1/2 bg-dark-surface relative flex-col justify-between p-12 overflow-hidden border-r border-dark-border">
        {/* Decorative background glow */}
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-gradient-radial from-primary-600/10 to-transparent pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full bg-gradient-radial from-accent-purple/10 to-transparent pointer-events-none" />

        {/* Brand */}
        <div className="flex items-center gap-3 z-10">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-purple shadow-glow-sm">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white font-display">
              Expense<span className="text-primary-400">SO</span>
            </span>
          </div>
        </div>

        {/* Mid-content */}
        <div className="z-10 max-w-md my-auto space-y-6">
          <h1 className="text-4xl font-extrabold text-white font-display leading-tight">
            Take Control of Your <br />
            <span className="gradient-text font-extrabold">Financial Destiny</span>
          </h1>
          <p className="text-slate-400 leading-relaxed font-medium">
            ExpenseSO helps you track, categorize, budget, and analyze your finances in one single dashboard. Engineered for Financial Excellence.
          </p>
        </div>

        {/* Footer */}
        <div className="z-10 text-xs text-slate-500 font-semibold tracking-wider uppercase">
          © {new Date().getFullYear()} ExpenseSO Technologies Inc.
        </div>
      </div>

      {/* Right side form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        {/* Background glow for mobile */}
        <div className="absolute lg:hidden top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-radial from-primary-600/5 to-transparent pointer-events-none" />

        <div className="w-full max-w-md space-y-8 z-10">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white font-display tracking-tight">
              Welcome Back
            </h2>
            <p className="mt-2 text-sm text-slate-400 font-medium">
              Log in to manage your premium expense dashboard.
            </p>
          </div>

          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Email Address"
                type="email"
                icon={Mail}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="input-label mb-0">Password</label>
                </div>
                <Input
                  type="password"
                  icon={Lock}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full py-3 mt-4"
                loading={loading}
              >
                Sign In
              </Button>
            </form>
          </Card>

          <p className="text-center text-sm text-slate-400 font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-bold transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
