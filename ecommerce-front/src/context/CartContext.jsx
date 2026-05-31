import { createContext, useContext, useEffect, useMemo, useCallback, useState } from 'react'
import { cartService } from '../services/api'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      setLoading(true)
      const res = await cartService.list()
      setItems(res.data.data || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching cart:', err)
      setError(err.response?.data?.error || 'Error loading cart')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const addItem = useCallback(
    async (productId, quantity) => {
      if (!isAuthenticated) {
        setError('Must be logged in to add items')
        return { ok: false, error: 'Not authenticated' }
      }
      try {
        const res = await cartService.add(productId, quantity)
        await fetchCart()
        return { ok: true }
      } catch (err) {
        const message = err.response?.data?.error || 'Error adding item'
        setError(message)
        return { ok: false, error: message }
      }
    },
    [isAuthenticated, fetchCart]
  )

  const updateQuantity = useCallback(
    async (cartItemId, quantity) => {
      if (!isAuthenticated) return { ok: false, error: 'Not authenticated' }
      try {
        await cartService.update(cartItemId, quantity)
        await fetchCart()
        return { ok: true }
      } catch (err) {
        const message = err.response?.data?.error || 'Error updating quantity'
        setError(message)
        return { ok: false, error: message }
      }
    },
    [isAuthenticated, fetchCart]
  )

  const removeItem = useCallback(
    async (cartItemId) => {
      if (!isAuthenticated) return { ok: false, error: 'Not authenticated' }
      try {
        await cartService.remove(cartItemId)
        await fetchCart()
        return { ok: true }
      } catch (err) {
        const message = err.response?.data?.error || 'Error removing item'
        setError(message)
        return { ok: false, error: message }
      }
    },
    [isAuthenticated, fetchCart]
  )

  const clearCart = useCallback(async () => {
    if (!isAuthenticated) return { ok: false, error: 'Not authenticated' }
    try {
      await cartService.clear()
      setItems([])
      setError(null)
      return { ok: true }
    } catch (err) {
      const message = err.response?.data?.error || 'Error clearing cart'
      setError(message)
      return { ok: false, error: message }
    }
  }, [isAuthenticated])

  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items])

  const totalAmount = useMemo(
    () =>
      items.reduce((sum, item) => {
        const price = parseFloat(item.Product?.price || 0)
        return sum + price * item.quantity
      }, 0),
    [items]
  )

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalAmount,
        loading,
        error,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        refetch: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
