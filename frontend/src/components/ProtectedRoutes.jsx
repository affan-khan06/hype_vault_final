/**
 * HYPE VAULT PROTECTED ROUTES
 * ProtectedRoute wrapper + navigation guards
 * 
 * FEATURES:
 * - Automatic redirect to login if not authenticated
 * - Show loading state during auth initialization
 * - Preserve intended destination after login
 */

import React from 'react'
import { useAuth } from '../context/AuthContext'

export const ProtectedRoute = ({ children, redirectTo = '/auth/login' }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="w-16 h-16 border-2 border-gray-400 border-t-white rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    // Store the intended destination
    const currentPath = window.location.pathname
    sessionStorage.setItem('redirectAfterLogin', currentPath)
    
    // Redirect to login
    window.location.href = redirectTo
    return null
  }

  return children
}

/**
 * Hook to handle post-login redirect
 * Usage: usePostLoginRedirect()
 */
export const usePostLoginRedirect = () => {
  return () => {
    const intended = sessionStorage.getItem('redirectAfterLogin')
    sessionStorage.removeItem('redirectAfterLogin')
    
    if (intended && intended !== '/auth/login' && intended !== '/auth/register') {
      return intended
    }
    return '/dashboard'
  }
}

/**
 * Hook for auth-aware navigation
 * Ensures navigation only happens if user is authenticated
 */
export const useAuthNavigation = () => {
  const { isAuthenticated } = useAuth()

  return (path, fallbackPath = '/auth/login') => {
    if (isAuthenticated) {
      window.location.href = path
    } else {
      sessionStorage.setItem('redirectAfterLogin', path)
      window.location.href = fallbackPath
    }
  }
}
