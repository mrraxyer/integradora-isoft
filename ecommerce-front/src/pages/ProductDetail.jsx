import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { productService } from '../services/api'
import { useCart } from '../context/CartContext'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    loadProduct()
  }, [id])

  const loadProduct = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await productService.get(id)
      setProduct(response.data)
    } catch (err) {
      setError('Error al cargar el producto: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!product) return
    addItem({
      product_id: product.id,
      name: product.name,
      price: product.price,
      sku: product.sku,
      stock: product.stock,
      category: product.category?.name,
      quantity,
    })
    setMessage(`Se agregaron ${quantity} unidad(es) de "${product.name}" al carrito.`)
  }

  if (loading) return <div className="loading">Cargando producto...</div>

  if (error) {
    return (
      <div>
        <div className="error">{error}</div>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Volver a productos
        </button>
      </div>
    )
  }

  if (!product) {
    return (
      <div>
        <div className="error">Producto no encontrado</div>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Volver a productos
        </button>
      </div>
    )
  }

  return (
    <div>
      <button className="btn btn-outline" onClick={() => navigate('/')}>
        Volver a productos
      </button>

      <div className="product-detail">
        <div className="product-detail-image">
          <span className="product-icon-lg">{product.category?.name?.[0] ?? 'P'}</span>
        </div>

        <div className="product-detail-info">
          <p className="card-category">{product.category?.name}</p>
          <h1 style={{ borderBottom: 'none', marginBottom: '0.25rem' }}>{product.name}</h1>
          <p className="text-muted" style={{ marginBottom: '1.5rem' }}>SKU: {product.sku}</p>

          {message && (
            <div className="success" style={{ marginBottom: '1rem' }}>{message}</div>
          )}

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              {product.description}
            </p>
            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1rem 0' }} />
            <p className="detail-price">${product.price.toFixed(2)}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <strong>Stock:</strong>
              <span className={`badge ${product.stock > 0 ? 'badge-success' : 'badge-danger'}`}>
                {product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}
              </span>
            </div>
            {product.category?.name && (
              <p><strong>Categoría:</strong> {product.category.name}</p>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Cantidad</label>
            <input
              type="number"
              min="1"
              max={product.stock}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="form-input"
              style={{ maxWidth: '100px' }}
              disabled={product.stock === 0}
            />
          </div>

          <button
            className="btn btn-success"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}
          >
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  )
}
