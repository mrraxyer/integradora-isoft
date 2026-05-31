import { useState, useEffect } from 'react'
import { X, ImageOff } from 'lucide-react'
import { productService } from '../../services/api'

export default function ProductFormModal({ product, categories, onSuccess, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    sku: '',
    category: '',
    image_url: '',
  })
  const [imgError, setImgError] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        stock: product.stock,
        sku: product.sku,
        category: product.categoryId || '',
        image_url: product.image_url || '',
      })
      setImgError(false)
    }
  }, [product])

  const handleChange = (e) => {
    if (e.target.name === 'image_url') setImgError(false)
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const data = { ...formData, price: parseFloat(formData.price), stock: parseInt(formData.stock, 10) }
      if (product) {
        await productService.update(product.id, data)
      } else {
        await productService.create(data)
      }
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.error || 'Error guardando producto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{product ? 'Editar Producto' : 'Nuevo Producto'}</h2>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="error" style={{ margin: '0 1.5rem 1rem' }}>{error}</div>}

          <div className="modal-body">
            {/* Image preview */}
            {formData.image_url && !imgError ? (
              <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                <img
                  src={formData.image_url}
                  alt="Preview"
                  onError={() => setImgError(true)}
                  style={{ maxHeight: '180px', maxWidth: '100%', borderRadius: 'var(--radius)', objectFit: 'contain', border: '1px solid var(--border)' }}
                />
              </div>
            ) : imgError ? (
              <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80px', border: '1px dashed var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-muted)', gap: '0.5rem', fontSize: '0.875rem' }}>
                <ImageOff size={18} />
                URL inválida o imagen no disponible
              </div>
            ) : null}

            <div className="form-group">
              <label className="form-label">URL de imagen</label>
              <input name="image_url" type="url" value={formData.image_url} onChange={handleChange} className="form-input" placeholder="https://ejemplo.com/imagen.jpg" />
            </div>

            <div className="form-group">
              <label className="form-label">Nombre *</label>
              <input name="name" type="text" value={formData.name} onChange={handleChange} required className="form-input" placeholder="Ej: Monitor 24 pulgadas" />
            </div>

            <div className="form-group">
              <label className="form-label">SKU *</label>
              <input name="sku" type="text" value={formData.sku} onChange={handleChange} required className="form-input" placeholder="Ej: MON-24-001" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Precio *</label>
                <input name="price" type="number" value={formData.price} onChange={handleChange} required step="0.01" min="0" className="form-input" placeholder="0.00" />
              </div>
              <div className="form-group">
                <label className="form-label">Stock *</label>
                <input name="stock" type="number" value={formData.stock} onChange={handleChange} required min="0" className="form-input" placeholder="0" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Categoría</label>
              <select name="category" value={formData.category} onChange={handleChange} className="form-select">
                <option value="">Sin categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Descripción</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className="form-textarea" rows="3" placeholder="Descripción del producto" />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-outline">Cancelar</button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
