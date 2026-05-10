/**
 * HYPE VAULT API CLIENT
 * Axios instance with JWT interceptors for automatic token refresh
 * 
 * FEATURES:
 * - Auto-attach JWT to all requests
 * - Automatic token refresh on 401
 * - Request/response error handling
 * - Retry logic for failed token refresh
 */

import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
})

// Track if we're currently refreshing the token to avoid multiple refresh attempts
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })

  isRefreshing = false
  failedQueue = []
}

// REQUEST INTERCEPTOR: Attach JWT to all requests
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('access_token')
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// RESPONSE INTERCEPTOR: Handle 401 and refresh token
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config

    // Handle 401 (unauthorized) - try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Token refresh is already in progress, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return apiClient(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      isRefreshing = true
      originalRequest._retry = true

      // Attempt token refresh
      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) {
        // No refresh token, user needs to login again
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user_profile')
        window.location.href = '/auth/login'
        processQueue(new Error('Token refresh failed - login required'), null)
        return Promise.reject(error)
      }

      return apiClient
        .post('/api/auth/refresh', {}, {
          headers: { Authorization: `Bearer ${refreshToken}` },
        })
        .then((response) => {
          const { access_token: newAccessToken } = response.data
          localStorage.setItem('access_token', newAccessToken)
          apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          processQueue(null, newAccessToken)
          return apiClient(originalRequest)
        })
        .catch((err) => {
          // Refresh failed, force logout
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('user_profile')
          window.location.href = '/auth/login'
          processQueue(err, null)
          return Promise.reject(err)
        })
    }

    // For other errors, reject immediately
    return Promise.reject(error)
  }
)

export default apiClient
