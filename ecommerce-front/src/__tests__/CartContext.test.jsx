import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mockeamos el servicio de carrito y el hook de autenticación
vi.mock('../services/api', () => ({
  default: { defaults: { headers: {} } },
  cartService: {
    list: vi.fn(),
    add: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    clear: vi.fn(),
  },
}))
vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }))

import { CartProvider, useCart } from '../context/CartContext'
import * as api from '../services/api'
import * as auth from '../context/AuthContext'

function Consumer() {
  const { totalItems, totalAmount, addItem, updateQuantity, removeItem, clearCart, error } = useCart()
  return (
    <div>
      <div>totalItems: {totalItems}</div>
      <div>totalAmount: {totalAmount}</div>
      <div>error: {error}</div>
      <button onClick={async () => await addItem(1, 2)}>add</button>
      <button onClick={async () => await updateQuantity(10, 3)}>update</button>
      <button onClick={async () => await removeItem(10)}>remove</button>
      <button onClick={async () => await clearCart()}>clear</button>
    </div>
  )
}

beforeEach(() => {
  api.cartService.list.mockReset()
  api.cartService.add.mockReset()
  api.cartService.update.mockReset()
  api.cartService.remove.mockReset()
  api.cartService.clear.mockReset()
  auth.useAuth.mockReset()
})

describe('CartContext', () => {
  it('no permite agregar si no está autenticado y setea error', async () => {
    auth.useAuth.mockReturnValue({ isAuthenticated: false })

    render(
      <CartProvider>
        <Consumer />
      </CartProvider>
    )

    fireEvent.click(screen.getByText('add'))

    await waitFor(() => {
      expect(screen.getByText(/Must be logged in to add items/)).toBeInTheDocument()
    })

    expect(api.cartService.add).not.toHaveBeenCalled()
  })

  it('carga items cuando está autenticado y actualiza totales tras add', async () => {
    auth.useAuth.mockReturnValue({ isAuthenticated: true })

    // Primera llamada devuelve 1 item (2 unidades a $10)
    api.cartService.list
      .mockResolvedValueOnce({ data: { data: [{ id: 1, quantity: 2, Product: { price: '10.00' } }] } })
      // Segunda llamada (después de add) devuelve 2 items (2*10 + 1*5)
      .mockResolvedValueOnce({ data: { data: [{ id: 1, quantity: 2, Product: { price: '10.00' } }, { id: 2, quantity: 1, Product: { price: '5.00' } }] } })

    api.cartService.add.mockResolvedValue({})

    render(
      <CartProvider>
        <Consumer />
      </CartProvider>
    )

    // Esperamos el estado inicial cargado
    await waitFor(() => expect(screen.getByText('totalItems: 2')).toBeInTheDocument())

    // Llamamos a add (disparará fetchCart internamente)
    fireEvent.click(screen.getByText('add'))

    // Esperamos que los totales se actualicen
    await waitFor(() => expect(screen.getByText('totalItems: 3')).toBeInTheDocument())
    expect(screen.getByText('totalAmount: 25')).toBeInTheDocument()
  })
})
