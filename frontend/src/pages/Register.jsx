import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, User, Wallet } from 'lucide-react'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import toast from 'react-hot-toast'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password2: '',
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.password2) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      await register(formData)
      toast.success('Account created successfully!')
      navigate('/')
    } catch (err) {
      console.error(err)
      const errData = err.response?.data
      if (errData && typeof errData === 'object') {
        const firstErr = Object.entries(errData)[0]
        if (firstErr) {
          toast.error(`${firstErr[0]}: ${firstErr[1]}`)
        }
      } else {
        toast.error('Registration failed. Please check your inputs.')
      }
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
            Start Your Journey to <br />
            <span className="gradient-text font-extrabold">Wealth Management</span>
          </h1>
          <p className="text-slate-400 leading-relaxed font-medium">
            Creating an account is the first step towards total visibility over your spending habits. Get access to smart budgeting, predictive analytics, and premium exports.
          </p>
        </div>

        {/* Footer */}
        <div className="z-10 text-xs text-slate-500 font-semibold tracking-wider uppercase">
          © {new Date().getFullYear()} ExpenseSO Technologies Inc.
        </div>
      </div>

      {/* Right side form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto max-h-screen">
        {/* Background glow for mobile */}
        <div className="absolute lg:hidden top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-radial from-primary-600/5 to-transparent pointer-events-none" />

        <div className="w-full max-w-md space-y-6 py-8 z-10">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white font-display tracking-tight">
              Create Account
            </h2>
            <p className="mt-2 text-sm text-slate-400 font-medium">
              Register to access your personal dashboard.
            </p>
          </div>

          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  name="first_name"
                  icon={User}
                  placeholder="John"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Last Name"
                  name="last_name"
                  icon={User}
                  placeholder="Doe"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <Input
                label="Username"
                name="username"
                icon={User}
                placeholder="johndoe"
                value={formData.username}
                onChange={handleChange}
                required
              />

              <Input
                label="Email Address"
                name="email"
                type="email"
                icon={Mail}
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <Input
                label="Password (min 8 chars)"
                name="password"
                type="password"
                icon={Lock}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <Input
                label="Confirm Password"
                name="password2"
                type="password"
                icon={Lock}
                placeholder="••••••••"
                value={formData.password2}
                onChange={handleChange}
                required
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full py-3 mt-4"
                loading={loading}
              >
                Sign Up
              </Button>
            </form>
          </Card>

          <p className="text-center text-sm text-slate-400 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-bold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
