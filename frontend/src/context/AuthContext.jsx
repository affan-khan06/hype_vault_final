/**
 * HYPE VAULT AUTHENTICATION CONTEXT
 * Handles persistent JWT auth, token refresh, automatic logout, and session recovery
 * 
 * FEATURES:
 * - Persistent JWT tokens in localStorage (auto-refresh before expiry)
 * - Automatic session recovery on app load
 * - Logout with token cleanup
 * - User profile cache + update mechanism
 * - Auth state available globally via useAuth hook
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext()

// JWT decode helper (simple base64 decode - assumes no verification needed client-side)
const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.warn('Failed to decode JWT:', error)
    return null
  }
}

// Check if token is expired (with 2-minute buffer)
const isTokenExpired = (token) => {
  const decoded = decodeJWT(token)
  if (!decoded || !decoded.exp) return true
  return Date.now() >= (decoded.exp - 120) * 1000
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [tokens, setTokens] = useState({
    access: localStorage.getItem('access_token'),
    refresh: localStorage.getItem('refresh_token'),
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isRefreshingToken, setIsRefreshingToken] = useState(false)

  const API_URL = import.meta.env.VITE_API_URL || ''

  // Persist tokens to localStorage
  const saveTokens = useCallback((accessToken, refreshToken) => {
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('refresh_token', refreshToken)
    setTokens({ access: accessToken, refresh: refreshToken })
  }, [])

  // Clear tokens and user
  const clearAuth = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_profile')
    setTokens({ access: null, refresh: null })
    setUser(null)
  }, [])

  // Fetch current user profile from backend
  const fetchUserProfile = useCallback(async (accessToken) => {
    if (!accessToken) return null
    
    try {
      const res = await fetch(`${API_URL}/api/auth/current-user`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          clearAuth()
        }
        return null
      }

      const data = await res.json()
      const userProfile = data.user
      
      // Cache profile in localStorage
      localStorage.setItem('user_profile', JSON.stringify(userProfile))
      setUser(userProfile)
      setError(null)
      
      return userProfile
    } catch (err) {
      console.error('Failed to fetch user profile:', err)
      // Do not clear auth here; it might be a network error
      setError(err.message)
      return null
    }
  }, [API_URL, clearAuth])

  // Refresh access token using refresh token
  const refreshAccessToken = useCallback(async () => {
    if (isRefreshingToken || !tokens.refresh) return false

    setIsRefreshingToken(true)
    try {
      const res = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokens.refresh}`,
        },
      })

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
           clearAuth()
        }
        return false
      }

      const data = await res.json()
      saveTokens(data.access_token, tokens.refresh)
      setError(null)
      
      return true
    } catch (err) {
      console.error('Token refresh failed:', err)
      // Do not clearAuth on network failure to avoid aggressive logouts
      return false
    } finally {
      setIsRefreshingToken(false)
    }
  }, [tokens.refresh, API_URL, saveTokens, clearAuth, isRefreshingToken])

  // Initialize auth on app load - recover session if tokens exist
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true)

      const storedAccessToken = localStorage.getItem('access_token')
      const storedRefreshToken = localStorage.getItem('refresh_token')
      const cachedProfile = localStorage.getItem('user_profile')

      if (!storedAccessToken || !storedRefreshToken) {
        setLoading(false)
        return
      }

      // Try to use cached profile while checking token validity
      if (cachedProfile) {
        try {
          setUser(JSON.parse(cachedProfile))
        } catch (e) {
          localStorage.removeItem('user_profile')
        }
      }

      // Check if access token is expired
      if (isTokenExpired(storedAccessToken)) {
        // Try to refresh
        const refreshed = await refreshAccessToken()
        if (refreshed) {
          await fetchUserProfile(localStorage.getItem('access_token'))
        }
      } else {
        // Token is valid, fetch fresh profile
        await fetchUserProfile(storedAccessToken)
      }

      setLoading(false)
    }

    initializeAuth()
  }, [refreshAccessToken, fetchUserProfile])

  // Register user
  const register = useCallback(
    async (email, password, fullName, phone) => {
      try {
        setError(null)
        const res = await fetch(`${API_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            full_name: fullName,
            phone,
          }),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Registration failed')
        }

        const data = await res.json()
        saveTokens(data.access_token, data.refresh_token)
        setUser(data.user)
        localStorage.setItem('user_profile', JSON.stringify(data.user))

        return { success: true, user: data.user }
      } catch (err) {
        setError(err.message)
        return { success: false, error: err.message }
      }
    },
    [API_URL, saveTokens]
  )

  // Login user
  const login = useCallback(
    async (email, password) => {
      try {
        setError(null)
        const res = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Login failed')
        }

        const data = await res.json()
        saveTokens(data.access_token, data.refresh_token)
        setUser(data.user)
        localStorage.setItem('user_profile', JSON.stringify(data.user))

        return { success: true, user: data.user }
      } catch (err) {
        setError(err.message)
        return { success: false, error: err.message }
      }
    },
    [API_URL, saveTokens]
  )

  // Logout user
  const logout = useCallback(async () => {
    try {
      if (tokens.access) {
         await fetch(`${API_URL}/api/auth/logout`, {
           method: 'POST',
           headers: { Authorization: `Bearer ${tokens.access}` }
         });
      }
    } catch(e) {
      console.error('Logout sync with server failed', e);
    }
    clearAuth()
    setError(null)
  }, [clearAuth, tokens.access, API_URL])

  // Update user profile
  const updateProfile = useCallback(
    async (updates) => {
      if (!tokens.access) {
        setError('Not authenticated')
        return { success: false }
      }

      try {
        setError(null)
        const res = await fetch(`${API_URL}/api/auth/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokens.access}`,
          },
          body: JSON.stringify(updates),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Profile update failed')
        }

        const data = await res.json()
        setUser(data.user)
        localStorage.setItem('user_profile', JSON.stringify(data.user))

        return { success: true, user: data.user }
      } catch (err) {
        setError(err.message)
        return { success: false, error: err.message }
      }
    },
    [tokens.access, API_URL]
  )

  const value = {
    user,
    tokens,
    loading,
    error,
    isAuthenticated: !!tokens.access && !!user,
    login,
    register,
    logout,
    updateProfile,
    refreshAccessToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
