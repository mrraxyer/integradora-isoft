import { useState, useEffect } from 'react'
import { Clock, Loader2, Truck, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { orderService } from '../services/api'
import { useAuth } from '../context/AuthContext'

const STATUS_LABELS = {
  pending: 'Pendiente',
  processing: 'Procesando',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

const STATUS_ICONS = {
  pending: Clock,
  processing: Loader2,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
}

const STATUS_BADGE = {
  pending: 'badge-warning',
  processing: 'badge-warning',
  shipped: 'badge-success',
  delivered: 'badge-success',
  cancelled: 'badge-danger',
}

export default function OrderList() {
  const { user } = useAuth()
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

      {user?.role === 'admin' && (
        <div className="filter-bar">
          <button
            className={`btn btn-filter ${statusFilter === null ? 'active' : ''}`}
            onClick={() => setStatusFilter(null)}
          >
            Todas
          </button>
          {Object.keys(STATUS_LABELS).map((status) => {
            const Icon = STATUS_ICONS[status]
            return (
              <button
                key={status}
                className={`btn btn-filter ${statusFilter === status ? 'active' : ''}`}
                onClick={() => setStatusFilter(status)}
              >
                <Icon size={16} />
                {STATUS_LABELS[status]}
              </button>
            )
          })}
        </div>
      )}

      {error && <div className="error"><AlertCircle size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />{error}</div>}

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
              {orders.map((order) => {
                const date = order.createdAt || order.created_at
                const dateStr = date ? new Date(date).toLocaleDateString('es-MX') : 'N/A'
                return (
                <tr key={order.id}>
                  <td><strong>#{order.id}</strong></td>
                  <td>{order.user?.name || 'N/A'}</td>
                  <td>{order.user?.email || 'N/A'}</td>
                  <td><strong>${parseFloat(order.total_amount).toFixed(2)}</strong></td>
                  <td>
                    {(() => {
                      const Icon = STATUS_ICONS[order.status]
                      return (
                        <span className={`badge ${STATUS_BADGE[order.status] || 'badge-warning'}`} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          {Icon && <Icon size={14} />}
                          {STATUS_LABELS[order.status] || order.status}
                        </span>
                      )
                    })()}
                  </td>
                  <td>{dateStr}</td>
                </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
