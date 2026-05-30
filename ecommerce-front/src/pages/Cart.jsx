import { useState } from 'react'
import { orderService } from '../services/api'
import { useCart } from '../context/CartContext'

export default function Cart() {
  const { items, totalItems, totalAmount, updateQuantity, removeItem, clearCart } = useCart()
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!customerName || !customerEmail) {
      setMessage({ type: 'error', text: 'Por favor completa todos los campos requeridos.' })
      return
    }

    if (items.length === 0) {
      setMessage({ type: 'error', text: 'El carrito está vacío. Agrega productos antes de continuar.' })
      return
    }

    setLoading(true)
    try {
      const orderData = {
        customer_name: customerName,
        customer_email: customerEmail,
        notes,
        items: items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
      }
      const response = await orderService.create(orderData)
      setMessage({
        type: 'success',
        text: `Pedido #${response.data.data.id} creado con éxito. Total: $${response.data.data.total_amount.toFixed(2)}`,
      })
      setCustomerName('')
      setCustomerEmail('')
      setNotes('')
      clearCart()
    } catch (err) {
      setMessage({
        type: 'error',
        text: 'Error: ' + (err.response?.data?.detail || err.message),
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
                    {items.map((item) => (
                      <tr key={item.product_id}>
                        <td>
                          <strong>{item.name}</strong>
                          {item.category && (
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                              {item.category}
                            </p>
                          )}
                        </td>
                        <td>${item.price.toFixed(2)}</td>
                        <td>
                          <input
                            type="number"
                            min="1"
                            max={item.stock}
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(item.product_id, Math.max(1, parseInt(e.target.value) || 1))
                            }
                            className="form-input"
                            style={{ width: '4.5rem' }}
                          />
                        </td>
                        <td><strong>${(item.price * item.quantity).toFixed(2)}</strong></td>
                        <td>
                          <button
                            className="btn btn-danger btn-small"
                            onClick={() => removeItem(item.product_id)}
                          >
                            Quitar
                          </button>
                        </td>
                      </tr>
                    ))}
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
          <h3 style={{ marginBottom: '1.5rem' }}>Datos del cliente</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Nombre completo *</label>
              <input
                type="text"
                className="form-input"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Juan Pérez"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Correo electrónico *</label>
              <input
                type="email"
                className="form-input"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="juan@ejemplo.com"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Notas (opcional)</label>
              <textarea
                className="form-textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Instrucciones especiales para tu pedido..."
              />
            </div>
            <button
              type="submit"
              className="btn btn-success"
              disabled={loading || items.length === 0}
              style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}
            >
              {loading ? 'Procesando...' : 'Completar compra'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
