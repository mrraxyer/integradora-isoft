import { useState, useEffect } from 'react'
import { orderService } from '../services/api'

const STATUS_LABELS = {
  pending: 'Pendiente',
  processing: 'Procesando',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

const STATUS_BADGE = {
  pending: 'badge-warning',
  processing: 'badge-warning',
  shipped: 'badge-success',
  delivered: 'badge-success',
  cancelled: 'badge-danger',
}

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
      const response = await orderService.list(0, 50, statusFilter)
      setOrders(response.data.data)
    } catch (err) {
      setError('Error al cargar órdenes: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="loading">Cargando órdenes...</div>

  return (
    <div>
      <h1>Órdenes</h1>

      <div className="filter-bar">
        <button
          className={`btn btn-filter ${statusFilter === null ? 'active' : ''}`}
          onClick={() => setStatusFilter(null)}
        >
          Todas
        </button>
        {Object.keys(STATUS_LABELS).map((status) => (
          <button
            key={status}
            className={`btn btn-filter ${statusFilter === status ? 'active' : ''}`}
            onClick={() => setStatusFilter(status)}
          >
            {STATUS_LABELS[status]}
          </button>
        ))}
      </div>

      {error && <div className="error">{error}</div>}

      {orders.length === 0 ? (
        <div className="empty-state">No hay órdenes disponibles</div>
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
                  <td><strong>#{order.id}</strong></td>
                  <td>{order.customer_name}</td>
                  <td>{order.customer_email}</td>
                  <td><strong>${order.total_amount.toFixed(2)}</strong></td>
                  <td>
                    <span className={`badge ${STATUS_BADGE[order.status] || 'badge-warning'}`}>
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </td>
                  <td>{new Date(order.created_at).toLocaleDateString('es-MX')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
