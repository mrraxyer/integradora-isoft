import { useState, useEffect } from 'react'
import { Clock, Loader2, Truck, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { orderService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import DataTable from '../components/DataTable'

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

const STATUS_OPTIONS = Object.keys(STATUS_LABELS)

export default function OrderList() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

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
      setOrders(response.data?.data ?? [])
    } catch (err) {
      setError('Error al cargar órdenes: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderService.update(orderId, { status: newStatus })
      loadOrders()
    } catch (err) {
      setError('Error actualizando estado: ' + (err.response?.data?.error || err.message))
    }
  }

  if (loading) return <div className="loading">Cargando órdenes...</div>

  return (
    <div>
      <h1>Órdenes</h1>

      {isAdmin && (
        <div className="filter-bar">
          <button
            className={`btn btn-filter ${statusFilter === null ? 'active' : ''}`}
            onClick={() => setStatusFilter(null)}
          >
            Todas
          </button>
          {STATUS_OPTIONS.map((status) => {
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

      <DataTable
        data={orders}
        empty="No hay órdenes disponibles"
        columns={[
          {
            key: 'id',
            header: '#',
            width: '60px',
            render: (o) => <strong>#{o.id}</strong>,
          },
          ...(isAdmin
            ? [
                { key: 'user_name', header: 'Cliente', render: (o) => o.user?.name || 'N/A' },
                { key: 'user_email', header: 'Email', render: (o) => o.user?.email || 'N/A' },
              ]
            : []),
          {
            key: 'total_amount',
            header: 'Total',
            render: (o) => <strong>${parseFloat(o.total_amount).toFixed(2)}</strong>,
          },
          {
            key: 'status',
            header: 'Estado',
            render: (o) => {
              const Icon = STATUS_ICONS[o.status]
              return isAdmin ? (
                <select
                  value={o.status}
                  onChange={(e) => handleStatusChange(o.id, e.target.value)}
                  className="form-select"
                  style={{ width: 'auto', padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
              ) : (
                <span className={`badge ${STATUS_BADGE[o.status] || 'badge-warning'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  {Icon && <Icon size={14} />}
                  {STATUS_LABELS[o.status] || o.status}
                </span>
              )
            },
          },
          {
            key: 'date',
            header: 'Fecha',
            render: (o) => {
              const d = o.createdAt || o.created_at
              return d ? new Date(d).toLocaleDateString('es-MX') : 'N/A'
            },
          },
        ]}
      />
    </div>
  )
}
