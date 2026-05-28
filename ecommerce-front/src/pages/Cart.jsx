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
      setMessage({ type: 'error', text: 'Por favor completa todos los campos' })
      return
    }

    if (items.length === 0) {
      setMessage({ type: 'error', text: 'El carrito está vacío. Agrega productos antes de completar la compra.' })
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
        text: `✓ Pedido #${response.data.id} creado con éxito. Total: $${response.data.total_amount.toFixed(2)}`,
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
      <h1>🛍️ Carrito de Compras</h1>

      <div style={{ maxWidth: '900px', margin: '2rem auto' }}>
        {message && (
          <div className={message.type === 'error' ? 'error' : 'success'}>
            {message.text}
          </div>
        )}

        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3>Contenido del carrito</h3>
          {items.length === 0 ? (
            <div className="loading">No hay productos en el carrito.</div>
          ) : (
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
                      <td>{item.name}</td>
                      <td>${item.price.toFixed(2)}</td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          max={item.stock}
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.product_id, Math.max(1, parseInt(e.target.value) || 1))}
                          className="form-input"
                          style={{ width: '4rem' }}
                        />
                      </td>
                      <td>${(item.price * item.quantity).toFixed(2)}</td>
                      <td>
                        <button
                          className="btn btn-danger btn-small"
                          onClick={() => removeItem(item.product_id)}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ marginTop: '1rem', textAlign: 'right' }}>
            <strong>Total items:</strong> {totalItems} <br />
            <strong>Total carrito:</strong> ${totalAmount.toFixed(2)}
          </div>
        </div>

        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3>Datos del cliente</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Nombre completo:</label>
              <input
                type="text"
                className="form-input"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Juan Pérez"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email:</label>
              <input
                type="email"
                className="form-input"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="juan@ejemplo.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Notas (opcional):</label>
              <textarea
                className="form-textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Añade comentarios sobre tu pedido..."
              />
            </div>

            <button
              type="submit"
              className="btn btn-secondary"
              disabled={loading || items.length === 0}
              style={{ width: '100%', padding: '0.8rem', fontSize: '1.1rem' }}
            >
              {loading ? 'Procesando...' : '✓ Completar compra'}
            </button>
          </form>
        </div>

        <div className="card" style={{ backgroundColor: '#f0f0f0' }}>
          <h4>📋 Próximos pasos:</h4>
          <ul style={{ paddingLeft: '1.5rem' }}>
            <li>Integración completa del carrito</li>
            <li>Cálculo automático de totales</li>
            <li>Validación de disponibilidad de stock</li>
            <li>Procesamiento de pagos</li>
            <li>Historial de compras del usuario</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
