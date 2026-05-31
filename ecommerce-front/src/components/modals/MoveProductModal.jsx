import { useState } from 'react'
import { X } from 'lucide-react'
import { productService } from '../../services/api'

export default function MoveProductModal({ product, categories, onSuccess, onClose }) {
  const [selectedCategory, setSelectedCategory] = useState(product?.categoryId || '')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await productService.update(product.id, {
        name: product.name,
        sku: product.sku,
        price: product.price,
        stock: product.stock,
        description: product.description || '',
        category: selectedCategory,
      })
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.error || 'Error moviendo producto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Mover a Categoría</h2>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="error" style={{ margin: '0 1.5rem 1rem' }}>{error}</div>}

          <div className="modal-body">
            <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Producto: <strong>{product?.name}</strong>
            </p>

            <div className="form-group">
              <label className="form-label">Nueva Categoría</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="form-select"
              >
                <option value="">Sin categoría</option>
                {(categories ?? []).map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-outline">Cancelar</button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Moviendo...' : 'Mover'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
