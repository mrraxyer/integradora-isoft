import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach stored JWT on every request (AuthContext also sets this via defaults,
// but the interceptor covers requests made before the context mounts).
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token && !config.headers['Authorization']) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

// Auto-logout when the server returns 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      // Redirect to login only when not already on an auth page
      if (!window.location.pathname.startsWith('/login') &&
          !window.location.pathname.startsWith('/registro')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Products
export const productService = {
  list: (page = 1, limit = 20, category = null, available = null) => {
    const params = { page, limit }
    if (category) params.category = category
    if (available !== null) params.available = available
    return api.get('/products', { params })
  },
  get: (id) => api.get(`/products/${id}`),
  availability: (id) => api.get(`/products/${id}/availability`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
}

// Categories  (endpoints por agregar al servidor Express)
export const categoryService = {
  list: () => api.get('/categories'),
  get: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
}

// Orders  (endpoints por agregar al servidor Express)
export const orderService = {
  list: (page = 1, limit = 20, status = null) => {
    const params = { page, limit }
    if (status) params.status = status
    return api.get('/orders', { params })
  },
  get: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  update: (id, data) => api.put(`/orders/${id}`, data),
  cancel: (id) => api.delete(`/orders/${id}`),
}

// Auth
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password) => api.post('/auth/register', { name, email, password }),
  me: () => api.get('/auth/me'),
}

export default api
