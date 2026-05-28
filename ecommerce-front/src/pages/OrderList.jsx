import { useState, useEffect } from 'react'
import { orderService } from '../services/api'

export default function OrderList() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState(null)

  useEffect(() => {
    loadOrders()
  }, [statusFilter])

  const loadOrders = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await orderService.list(0, 10, statusFilter)
      setOrders(response.data)
    } catch (err) {
      setError('Error al cargar órdenes: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'badge-warning',
      processing: 'badge-warning',
      shipped: 'badge-success',
      delivered: 'badge-success',
      cancelled: 'badge-danger',
    }
    const labels = {
      pending: 'Pendiente',
      processing: 'Procesando',
      shipped: 'Enviado',
      delivered: 'Entregado',
      cancelled: 'Cancelado',
    }
    return <span className={`badge ${colors[status]}`}>{labels[status]}</span>
  }

  if (loading) {
    return <div className="loading">Cargando órdenes...</div>
  }

  return (
    <div>
      <h1>📦 Órdenes</h1>

      <div style={{ marginBottom: '2rem' }}>
        <h3>Filtrar por estado:</h3>
        <button
          className={`btn ${statusFilter === null ? 'btn-primary' : ''}`}
          onClick={() => setStatusFilter(null)}
          style={{ marginRight: '0.5rem' }}
        >
          Todas
        </button>
        {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
          <button
            key={status}
            className={`btn ${statusFilter === status ? 'btn-primary' : ''}`}
            onClick={() => setStatusFilter(status)}
            style={{ marginRight: '0.5rem' }}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {error && <div className="error">{error}</div>}

      {orders.length === 0 ? (
        <div className="loading">No hay órdenes disponibles</div>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Cliente</th>
                <th>Email</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <strong>#{order.id}</strong>
                  </td>
                  <td>{order.customer_name}</td>
                  <td>{order.customer_email}</td>
                  <td>${order.total_amount.toFixed(2)}</td>
                  <td>{getStatusBadge(order.status)}</td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
