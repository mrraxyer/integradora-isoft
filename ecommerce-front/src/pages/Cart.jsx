import { useState, useEffect } from 'react'
import { Trash2, Plus, Minus, Check, AlertCircle } from 'lucide-react'
import { orderService } from '../services/api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function Cart() {
  const { items, totalItems, totalAmount, updateQuantity, removeItem, clearCart } = useCart()
  const { user } = useAuth()
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    if (user) {
      setCustomerName(user.name || '')
      setCustomerEmail(user.email || '')
    }
  }, [user])

  const outOfStockItems = items.filter((item) => (item.Product?.stock ?? 0) === 0)
  const exceedsStockItems = items.filter(
    (item) => (item.Product?.stock ?? 0) > 0 && item.quantity > (item.Product?.stock ?? 0)
  )
  const hasOutOfStock = outOfStockItems.length > 0
  const hasExceedsStock = exceedsStockItems.length > 0

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (items.length === 0) {
      setMessage({ type: 'error', text: 'El carrito está vacío. Agrega productos antes de continuar.' })
      return
    }

    if (hasOutOfStock) {
      setMessage({ type: 'error', text: 'Hay productos agotados en tu carrito. Elimínalos para continuar.' })
      return
    }

    if (hasExceedsStock) {
      setMessage({ type: 'error', text: 'La cantidad de algunos productos supera el stock disponible. Ajusta las cantidades para continuar.' })
      return
    }

    setLoading(true)
    try {
      const orderData = {
        total_amount: totalAmount,
        items: items.map((item) => ({
          product_id: item.productId,
          quantity: item.quantity,
        })),
      }
      const response = await orderService.create(orderData)
      const amount = parseFloat(response.data.data.total_amount)
      setMessage({
        type: 'success',
        text: `Pedido #${response.data.data.id} creado con éxito. Total: $${amount.toFixed(2)}`,
      })
      await clearCart()
    } catch (err) {
      setMessage({
        type: 'error',
        text: 'Error: ' + (err.response?.data?.error || err.message),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1>Carrito de Compras</h1>

      <div className="cart-layout">
        {message && (
          <div className={message.type === 'error' ? 'error' : 'success'}>
            {message.type === 'error' ? <AlertCircle size={18} style={{ display: 'inline', marginRight: '0.5rem' }} /> : <Check size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />}
            {message.text}
          </div>
        )}

        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Contenido del carrito</h3>
          {items.length === 0 ? (
            <div className="empty-state">No hay productos en el carrito.</div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Precio</th>
                      <th>Cantidad</th>
                      <th>Subtotal</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => {
                      const product = item.Product || {}
                      const price = parseFloat(product.price || 0)
                      const stockEmpty = (product.stock ?? 0) === 0
                      return (
                        <tr key={item.id} style={stockEmpty ? { opacity: 0.6 } : {}}>
                          <td>
                            <strong>{product.name}</strong>
                            {stockEmpty && (
                              <span className="badge badge-danger" style={{ marginLeft: '0.5rem' }}>Agotado</span>
                            )}
                            {!stockEmpty && item.quantity > (product.stock ?? 0) && (
                              <span className="badge badge-danger" style={{ marginLeft: '0.5rem' }}>
                                Máx. {product.stock}
                              </span>
                            )}
                          </td>
                          <td>${price.toFixed(2)}</td>
                          <td>
                            <input
                              type="number"
                              min="1"
                              max={product.stock || 1}
                              value={item.quantity}
                              onChange={(e) => {
                                const val = Math.max(1, parseInt(e.target.value) || 1)
                                const capped = product.stock > 0 ? Math.min(product.stock, val) : val
                                updateQuantity(item.id, capped)
                              }}
                              className="form-input"
                              style={{ width: '4.5rem' }}
                              disabled={stockEmpty}
                            />
                          </td>
                          <td><strong>${(price * item.quantity).toFixed(2)}</strong></td>
                          <td>
                            <button
                              className="btn btn-danger btn-small"
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 size={16} />
                              Quitar
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div className="cart-totals">
                <span>Total items: <strong>{totalItems}</strong></span>
                <span className="cart-total-amount">Total: <strong>${totalAmount.toFixed(2)}</strong></span>
              </div>
            </>
          )}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1.5rem' }}>Detalles del pedido</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Notas (opcional)</label>
              <textarea
                className="form-textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Instrucciones especiales para tu pedido..."
              />
            </div>
            {hasOutOfStock && (
              <div className="error" style={{ marginBottom: '1rem' }}>
                <AlertCircle size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Retira los productos agotados para poder completar tu compra.
              </div>
            )}
            {hasExceedsStock && (
              <div className="error" style={{ marginBottom: '1rem' }}>
                <AlertCircle size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />
                La cantidad de algunos productos supera el stock disponible. Ajusta las cantidades.
              </div>
            )}
            <button
              type="submit"
              className="btn btn-success"
              disabled={loading || items.length === 0 || hasOutOfStock || hasExceedsStock}
              style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}
            >
              {loading ? 'Procesando...' : <>
                <Check size={18} />
                Completar compra
              </>}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
