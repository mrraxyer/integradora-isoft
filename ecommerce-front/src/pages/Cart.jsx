import { useState } from 'react'
import { orderService } from '../services/api'

export default function Cart() {
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

    setLoading(true)
    try {
      // Este es un ejemplo, en un carrito real habría que agregar items
      const orderData = {
        customer_name: customerName,
        customer_email: customerEmail,
        notes: notes,
        items: [
          // Aquí irían los items del carrito
        ],
      }

      // Por ahora, solo mostramos un mensaje
      setMessage({
        type: 'success',
        text: '✓ En la próxima fase integraremos el carrito completo',
      })
      setCustomerName('')
      setCustomerEmail('')
      setNotes('')
    } catch (err) {
      setMessage({
        type: 'error',
        text: 'Error: ' + err.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1>🛍️ Carrito de Compras</h1>

      <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
        {message && (
          <div className={message.type === 'error' ? 'error' : 'success'}>
            {message.text}
          </div>
        )}

        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3>Estado del Carrito</h3>
          <p style={{ textAlign: 'center', fontSize: '1.2rem', color: '#666' }}>
            El carrito integrado será completado en la fase de checkout
          </p>
          <p style={{ textAlign: 'center', marginTop: '1rem' }}>
            Detalles del cliente:
          </p>

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
              disabled={loading}
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
