import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token && !config.headers['Authorization']) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      if (
        !window.location.pathname.startsWith('/login') &&
        !window.location.pathname.startsWith('/registro')
      ) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// FastAPI uses skip/limit; category_id is an integer; returns arrays directly
export const productService = {
  list: (skip = 0, limit = 20, categoryId = null, isActive = true) => {
    const params = { skip, limit, is_active: isActive }
    if (categoryId !== null) params.category_id = categoryId
    return api.get('/products', { params })
  },
  get: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
}

export const categoryService = {
  list: () => api.get('/categories'),
  get: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
}

export const orderService = {
  list: (skip = 0, limit = 10, status = null) => {
    const params = { skip, limit }
    if (status) params.status = status
    return api.get('/orders', { params })
  },
  get: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  update: (id, data) => api.put(`/orders/${id}`, data),
  cancel: (id) => api.delete(`/orders/${id}`),
}

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password) => api.post('/auth/register', { name, email, password }),
  me: () => api.get('/auth/me'),
}

export default api
