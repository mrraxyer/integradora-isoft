import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)
const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

const ERROR_MESSAGES = {
  'Invalid credentials.': 'Correo o contraseña incorrectos.',
  'Email already registered.': 'Este correo ya está registrado.',
  'Internal server error': 'Error del servidor. Intenta más tarde.',
  'User not found.': 'Usuario no encontrado.',
}

function parseApiError(err, fallback) {
  const data = err.response?.data
  if (!data) return fallback

  if (data.error) {
    const msg = String(data.error)
    return ERROR_MESSAGES[msg] ?? msg
  }

  if (data.detail) {
    if (Array.isArray(data.detail)) return data.detail.map((d) => d.msg).join('; ')
    return String(data.detail)
  }

  if (Array.isArray(data.errors)) {
    return data.errors.map((e) => e.message || e.msg).filter(Boolean).join('. ')
  }

  return fallback
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete api.defaults.headers.common['Authorization']
    }
  }, [token])

  const saveSession = (newToken, newUser) => {
    localStorage.setItem(TOKEN_KEY, newToken)
    localStorage.setItem(USER_KEY, JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }

  const clearSession = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }

  const login = useCallback(async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.post('/auth/login', { email, password })
      saveSession(res.data.token, res.data.user)
      return { ok: true }
    } catch (err) {
      const message = parseApiError(err, 'Error al iniciar sesión')
      setError(message)
      return { ok: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (name, email, password) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.post('/auth/register', { name, email, password })
      saveSession(res.data.token, res.data.user)
      return { ok: true }
    } catch (err) {
      const message = parseApiError(err, 'Error al registrarse')
      setError(message)
      return { ok: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => clearSession(), [])

  const isAuthenticated = Boolean(token && user)

  return (
    <AuthContext.Provider
      value={{ user, token, loading, error, isAuthenticated, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
