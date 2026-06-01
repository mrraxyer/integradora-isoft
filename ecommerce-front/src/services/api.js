import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

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

// Express.js backend using pagination with page/limit
export const productService = {
  list: (skip = 0, limit = 20, categoryId = null, search = null) => {
    const page = Math.floor(skip / limit) + 1
    const params = { page, limit }
    if (categoryId !== null) params.category = categoryId
    if (search) params.search = search
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

export const cartService = {
  list: () => api.get('/cart'),
  add: (productId, quantity) => api.post('/cart', { productId, quantity }),
  update: (id, quantity) => api.put(`/cart/${id}`, { quantity }),
  remove: (id) => api.delete(`/cart/${id}`),
  clear: () => api.delete('/cart/clear/all'),
}

export default api
