'use client'

import { useState, useEffect } from 'react'
import bcrypt from 'bcryptjs'
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa'
import { getPasswordHash, isPasswordProtectionEnabled } from '@/config/password'

const SESSION_KEY = 'edit-auth-token'
const SESSION_EXPIRY_KEY = 'edit-auth-expiry'
const SESSION_DURATION = 1000 * 60 * 60 * 24 // 24 hours

interface PasswordProtectionProps {
  children: React.ReactNode
}

export default function PasswordProtection({
  children,
}: PasswordProtectionProps) {
  const passwordHash = getPasswordHash()
  const isProtectionEnabled = isPasswordProtectionEnabled()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // If password protection is not enabled, grant immediate access
    if (!isProtectionEnabled) {
      setIsAuthenticated(true)
      setIsChecking(false)
      return
    }

    // Check sessionStorage for existing valid auth
    const checkAuth = () => {
      try {
        const token = sessionStorage.getItem(SESSION_KEY)
        const expiry = sessionStorage.getItem(SESSION_EXPIRY_KEY)

        if (token === 'authenticated' && expiry) {
          const expiryTime = parseInt(expiry, 10)
          const now = Date.now()

          if (now < expiryTime) {
            setIsAuthenticated(true)
          } else {
            // Session expired
            sessionStorage.removeItem(SESSION_KEY)
            sessionStorage.removeItem(SESSION_EXPIRY_KEY)
          }
        }
      } catch (err) {
        console.error('Auth check error:', err)
      } finally {
        setIsChecking(false)
      }
    }

    checkAuth()
  }, [isProtectionEnabled])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Check if password hash is configured
      if (!passwordHash) {
        setError(
          'Password protection is not configured. Please set NEXT_PUBLIC_EDIT_PASSWORD_HASH.'
        )
        setIsLoading(false)
        return
      }

      // Compare password with hash
      const isValid = await bcrypt.compare(password, passwordHash)

      if (isValid) {
        // Set authenticated state with expiry
        const expiryTime = Date.now() + SESSION_DURATION
        sessionStorage.setItem(SESSION_KEY, 'authenticated')
        sessionStorage.setItem(SESSION_EXPIRY_KEY, expiryTime.toString())
        setIsAuthenticated(true)
        setError('')
        setPassword('')
      } else {
        setError('Incorrect password. Please try again.')
        setPassword('')
      }
    } catch (err) {
      console.error('Authentication error:', err)
      setError('Authentication error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(SESSION_EXPIRY_KEY)
    setIsAuthenticated(false)
    setPassword('')
  }

  // Show loading state while checking authentication
  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="text-xl text-white">Verifying access...</div>
      </div>
    )
  }

  // Show protected content if authenticated
  if (isAuthenticated) {
    return (
      <>
        {/* Logout button - only show if password protection is enabled */}
        {isProtectionEnabled && (
          <div className="exclude-print fixed top-4 right-4 z-50">
            <button
              onClick={handleLogout}
              className="cursor-pointer rounded-lg bg-red-600 px-4 py-2 text-sm text-white shadow-lg transition-all hover:bg-red-700"
              data-tooltip-id="app-tooltip"
              data-tooltip-content="End your session and return to the login screen"
              data-tooltip-place="bottom"
            >
              Logout
            </button>
          </div>
        )}
        {children}
      </>
    )
  }

  // Show password entry form
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-lg">
        {/* Lock Icon */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg">
            <FaLock className="text-3xl text-white" />
          </div>
        </div>

        {/* Header */}
        <h2 className="mb-2 text-center text-2xl font-bold text-white">
          Protected Area
        </h2>
        <p className="mb-6 text-center text-sm text-white/60">
          Enter password to access the editor
        </p>

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-white/80"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 pr-12 text-white placeholder-white/40 transition-all focus:border-transparent focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="Enter password"
                autoFocus
                autoComplete="off"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-white/60 transition-colors hover:text-white"
                tabIndex={-1}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !password}
            className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-medium text-white shadow-lg transition-all hover:from-purple-700 hover:to-pink-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? 'Verifying...' : 'Unlock'}
          </button>
        </form>

        {/* Info */}
        <div className="mt-6 rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
          <p className="text-center text-xs text-blue-300">
            Session expires after 24 hours of inactivity
          </p>
        </div>
      </div>
    </div>
  )
}
