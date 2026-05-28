import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { productService } from '../services/api'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)

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
    alert(`✓ Se agregaron ${quantity} unidades de "${product.name}" al carrito`)
    // Aquí iría la lógica real del carrito
  }

  if (loading) {
    return <div className="loading">Cargando producto...</div>
  }

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
      <button className="btn btn-secondary" onClick={() => navigate('/')}>
        ← Volver a productos
      </button>

      <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div>
          <div className="card-image" style={{ height: '300px', fontSize: '5rem' }}>
            📦
          </div>
        </div>

        <div>
          <h1>{product.name}</h1>
          <p style={{ color: '#666', marginBottom: '1rem' }}>SKU: {product.sku}</p>

          <div className="card" style={{ marginBottom: '1rem' }}>
            <h3>Detalles</h3>
            <p>{product.description}</p>

            <hr style={{ margin: '1rem 0' }} />

            <p style={{ fontSize: '1.2rem' }}>
              <strong>Precio:</strong> <span style={{ color: '#27ae60', fontSize: '1.5rem' }}>${product.price.toFixed(2)}</span>
            </p>
            <p>
              <strong>Stock:</strong>{' '}
              <span className={`badge ${product.stock > 0 ? 'badge-success' : 'badge-danger'}`}>
                {product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}
              </span>
            </p>

            <p>
              <strong>Categoría:</strong> {product.category.name}
            </p>

            {product.is_active ? (
              <span className="badge badge-success">Activo</span>
            ) : (
              <span className="badge badge-danger">Inactivo</span>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Cantidad:</label>
            <input
              type="number"
              min="1"
              max={product.stock}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="form-input"
              disabled={product.stock === 0}
            />
          </div>

          <button
            className="btn btn-secondary"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            style={{ fontSize: '1.1rem', padding: '0.8rem 1.5rem' }}
          >
            🛒 Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  )
}
