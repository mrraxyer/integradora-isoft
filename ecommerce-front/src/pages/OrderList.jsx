import { useState, useEffect } from 'react'
import { Clock, Loader2, Truck, CheckCircle, XCircle, AlertCircle, Eye, X, ShoppingBag } from 'lucide-react'
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
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

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

  const openDetail = async (orderId) => {
    setDetailLoading(true)
    setSelectedOrder(null)
    try {
      const response = await orderService.get(orderId)
      setSelectedOrder(response.data?.data)
    } catch (err) {
      setError('Error al cargar detalle: ' + err.message)
    } finally {
      setDetailLoading(false)
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
          {
            key: 'actions',
            header: '',
            width: '60px',
            render: (o) => (
              <button
                className="btn btn-small"
                title="Ver detalle"
                onClick={() => openDetail(o.id)}
                style={{ padding: '0.3rem 0.5rem' }}
              >
                <Eye size={15} />
              </button>
            ),
          },
        ]}
      />

      {(detailLoading || selectedOrder) && (
        <div className="modal-overlay" onClick={() => { if (!detailLoading) setSelectedOrder(null) }}>
          <div className="modal" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                <ShoppingBag size={18} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                {selectedOrder ? `Detalle de Orden #${selectedOrder.id}` : 'Cargando...'}
              </h2>
              <button className="modal-close" onClick={() => setSelectedOrder(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {detailLoading && <div className="loading">Cargando detalle...</div>}

              {selectedOrder && (() => {
                const Icon = STATUS_ICONS[selectedOrder.status]
                const d = selectedOrder.createdAt || selectedOrder.created_at
                const items = selectedOrder.items || []
                return (
                  <>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      {d && <span>Fecha: <strong style={{ color: 'var(--text)' }}>{new Date(d).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</strong></span>}
                      <span>Estado: <span className={`badge ${STATUS_BADGE[selectedOrder.status] || 'badge-warning'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', verticalAlign: 'middle' }}>{Icon && <Icon size={13} />}{STATUS_LABELS[selectedOrder.status] || selectedOrder.status}</span></span>
                      {isAdmin && selectedOrder.user && (
                        <span>Cliente: <strong style={{ color: 'var(--text)' }}>{selectedOrder.user.name} ({selectedOrder.user.email})</strong></span>
                      )}
                    </div>

                    {items.length === 0 ? (
                      <div className="empty-state">Sin productos registrados.</div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Producto</th>
                              <th style={{ textAlign: 'center' }}>Cantidad</th>
                              <th style={{ textAlign: 'right' }}>Precio unit.</th>
                              <th style={{ textAlign: 'right' }}>Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((item, i) => {
                              const price = item.product_price ?? item.price ?? null
                              const subtotal = price !== null ? price * item.quantity : null
                              return (
                                <tr key={i}>
                                  <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                      {item.product_image && (
                                        <img src={item.product_image} alt={item.product_name} style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 'var(--radius)' }} />
                                      )}
                                      <span>{item.product_name || `Producto #${item.product_id}`}</span>
                                    </div>
                                  </td>
                                  <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                                  <td style={{ textAlign: 'right' }}>{price !== null ? `$${price.toFixed(2)}` : '—'}</td>
                                  <td style={{ textAlign: 'right' }}><strong>{subtotal !== null ? `$${subtotal.toFixed(2)}` : '—'}</strong></td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <div style={{ textAlign: 'right', marginTop: '1rem', fontSize: '1rem' }}>
                      Total: <strong style={{ fontSize: '1.15rem' }}>${parseFloat(selectedOrder.total_amount).toFixed(2)}</strong>
                    </div>
                  </>
                )
              })()}
            </div>

            <div className="modal-footer">
              <button className="btn" onClick={() => setSelectedOrder(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
