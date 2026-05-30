import React, { useState } from 'react'
import { User, Mail, Phone, FileText, DollarSign, Shield, Camera, Globe, Moon, Sun } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useCurrency } from '../context/CurrencyContext'
import { authApi } from '../api/auth'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import toast from 'react-hot-toast'

import { motion } from 'framer-motion'

export default function Profile() {
  const { user, updateProfile, refreshProfile } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { currency: activeCurrency, setCurrency: setGlobalCurrency } = useCurrency()

  // Profile forms
  const [profileForm, setProfileForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.profile?.phone || '',
    bio: user?.profile?.bio || '',
    currency: user?.profile?.currency || 'INR',
    monthly_budget: user?.profile?.monthly_budget || '',
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(user?.profile?.image || '')
  const [savingProfile, setSavingProfile] = useState(false)

  // Password forms
  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    new_password2: '',
  })
  const [savingPassword, setSavingPassword] = useState(false)

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value })
  }

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value })
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setSavingProfile(true)

    try {
      // Must use FormData since we are supporting image uploads (Multipart)
      const data = new FormData()
      data.append('first_name', profileForm.first_name)
      data.append('last_name', profileForm.last_name)
      data.append('username', profileForm.username)
      data.append('email', profileForm.email)
      data.append('phone', profileForm.phone)
      data.append('bio', profileForm.bio)
      data.append('currency', profileForm.currency)
      data.append('monthly_budget', profileForm.monthly_budget)

      if (avatarFile) {
        data.append('image', avatarFile)
      }

      await updateProfile(data)
      // Sync global currency state
      if (profileForm.currency) {
        setGlobalCurrency(profileForm.currency)
      }
      // Re-fetch profile to sync changes
      await refreshProfile()
    } catch (err) {
      console.error(err)
      toast.error('Failed to update profile settings')
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (passwordForm.new_password !== passwordForm.new_password2) {
      toast.error('New passwords do not match')
      return
    }

    setSavingPassword(true)
    try {
      await authApi.changePassword(passwordForm)
      toast.success('Password changed successfully!')
      setPasswordForm({
        old_password: '',
        new_password: '',
        new_password2: '',
      })
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.old_password || 'Failed to change password. Make sure current password is correct.')
    } finally {
      setSavingPassword(false)
    }
  }

  const currencies = [
    { code: 'INR', label: 'Indian Rupee (₹)' },
    { code: 'USD', label: 'US Dollar ($)' },
    { code: 'GBP', label: 'British Pound (£)' },
    { code: 'EUR', label: 'Euro (€)' },
    { code: 'AED', label: 'UAE Dirham (AED)' },
    { code: 'SAR', label: 'Saudi Riyal (SAR)' },
    { code: 'SGD', label: 'Singapore Dollar (S$)' },
    { code: 'AUD', label: 'Australian Dollar (A$)' },
    { code: 'CAD', label: 'Canadian Dollar (C$)' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight font-display">
          Account Settings
        </h2>
        <p className="text-slate-400 text-sm mt-0.5">
          Manage your personal details, preferences, and account security.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Avatar card & theme */}
        <div className="space-y-6">
          {/* Avatar Upload */}
          <Card className="text-center p-6 flex flex-col items-center justify-center">
            <div className="relative group w-28 h-28 mb-4">
              <img
                src={avatarPreview || '/default.jpg'}
                alt={user?.username || 'Profile'}
                className="w-full h-full rounded-2xl object-cover border border-dark-border"
                onError={(e) => {
                  e.target.src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
                }}
              />
              <label className="absolute inset-0 flex items-center justify-center bg-dark-bg/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="w-6 h-6 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            <h3 className="font-bold text-white text-base leading-tight">
              {profileForm.first_name || profileForm.username}
            </h3>
            <p className="text-xs text-slate-400 mt-1">{profileForm.email}</p>

            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-4">
              Hover to change photo
            </p>
          </Card>

          {/* Theme Quick Toggle */}
          <Card className="p-5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Application Theme
            </h4>
            <button
              onClick={toggleTheme}
              className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-dark-elevated hover:bg-dark-muted text-slate-300 hover:text-white transition-colors text-sm font-medium"
            >
              <span className="flex items-center gap-2">
                {theme === 'dark' ? (
                  <>
                    <Moon className="w-4 h-4 text-primary-400" />
                    <span>Dark Theme</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-4 h-4 text-accent-amber" />
                    <span>Light Theme</span>
                  </>
                )}
              </span>
              <span className="text-xs text-slate-500 font-semibold uppercase">Toggle</span>
            </button>
          </Card>
        </div>

        {/* Right column: Edit forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile form */}
          <Card>
            <h3 className="section-title mb-6">Profile Settings</h3>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  name="first_name"
                  icon={User}
                  value={profileForm.first_name}
                  onChange={handleProfileChange}
                />
                <Input
                  label="Last Name"
                  name="last_name"
                  icon={User}
                  value={profileForm.last_name}
                  onChange={handleProfileChange}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Username"
                  name="username"
                  icon={User}
                  value={profileForm.username}
                  onChange={handleProfileChange}
                  required
                />
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  icon={Mail}
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Default Currency</label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <select
                      name="currency"
                      value={profileForm.currency}
                      onChange={handleProfileChange}
                      className="input-field pl-11 appearance-none cursor-pointer"
                    >
                      {currencies.map((curr) => (
                        <option key={curr.code} value={curr.code}>
                          {curr.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <Input
                  label="Monthly Expense Budget Limit"
                  name="monthly_budget"
                  type="number"
                  step="0.01"
                  icon={DollarSign}
                  value={profileForm.monthly_budget}
                  onChange={handleProfileChange}
                />
              </div>

              <Input
                label="Phone Number"
                name="phone"
                icon={Phone}
                value={profileForm.phone}
                onChange={handleProfileChange}
              />

              <div>
                <label className="input-label">Bio Description</label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-3 w-5 h-5 text-slate-500" />
                  <textarea
                    name="bio"
                    value={profileForm.bio}
                    onChange={handleProfileChange}
                    rows="3"
                    className="input-field pl-11 py-2.5"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-dark-border/40">
                <Button type="submit" variant="primary" loading={savingProfile}>
                  Save Profile Details
                </Button>
              </div>
            </form>
          </Card>

          {/* Change password form */}
          <Card>
            <h3 className="section-title mb-6">Security Settings</h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Input
                label="Current Password"
                name="old_password"
                type="password"
                icon={Shield}
                value={passwordForm.old_password}
                onChange={handlePasswordChange}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="New Password"
                  name="new_password"
                  type="password"
                  icon={Shield}
                  value={passwordForm.new_password}
                  onChange={handlePasswordChange}
                  required
                />
                <Input
                  label="Confirm New Password"
                  name="new_password2"
                  type="password"
                  icon={Shield}
                  value={passwordForm.new_password2}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <div className="flex justify-end pt-3 border-t border-dark-border/40">
                <Button type="submit" variant="danger" loading={savingPassword}>
                  Update Security Password
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
