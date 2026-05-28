import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'

const CartContext = createContext(null)
const CART_STORAGE_KEY = 'ecommerce_cart'

const initialState = {
  items: [],
}

function loadCartFromStorage() {
  try {
    const stored = window.localStorage.getItem(CART_STORAGE_KEY)
    if (!stored) return initialState
    const parsed = JSON.parse(stored)
    return { items: Array.isArray(parsed) ? parsed : [] }
  } catch (error) {
    console.error('Error reading cart from localStorage:', error)
    return initialState
  }
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex(
        (item) => item.product_id === action.payload.product_id
      )

      const nextItems = [...state.items]
      if (existingIndex !== -1) {
        const existingItem = nextItems[existingIndex]
        nextItems[existingIndex] = {
          ...existingItem,
          quantity: Math.min(
            existingItem.quantity + action.payload.quantity,
            action.payload.stock
          ),
        }
      } else {
        nextItems.push({
          ...action.payload,
          quantity: Math.min(action.payload.quantity, action.payload.stock),
        })
      }

      return { ...state, items: nextItems }
    }

    case 'UPDATE_QUANTITY': {
      const nextItems = state.items.map((item) =>
        item.product_id === action.payload.product_id
          ? { ...item, quantity: Math.min(action.payload.quantity, item.stock) }
          : item
      )
      return { ...state, items: nextItems }
    }

    case 'REMOVE_ITEM': {
      return {
        ...state,
        items: state.items.filter((item) => item.product_id !== action.payload.product_id),
      }
    }

    case 'CLEAR_CART': {
      return { ...state, items: [] }
    }

    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState, loadCartFromStorage)

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items))
  }, [state.items])

  const addItem = (item) => {
    dispatch({ type: 'ADD_ITEM', payload: item })
  }

  const updateQuantity = (product_id, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { product_id, quantity } })
  }

  const removeItem = (product_id) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { product_id } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  const totalItems = useMemo(
    () => state.items.reduce((sum, item) => sum + item.quantity, 0),
    [state.items]
  )

  const totalAmount = useMemo(
    () => state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [state.items]
  )

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        totalItems,
        totalAmount,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
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
