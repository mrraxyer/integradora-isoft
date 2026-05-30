import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShoppingCart, AlertCircle, Check, Smartphone, Shirt, UtensilsCrossed, Home, Trophy, Package } from 'lucide-react'
import { productService } from '../services/api'
import { useCart } from '../context/CartContext'

const getCategoryIcon = (categoryName) => {
  const iconMap = {
    'electrónica': Smartphone,
    'ropa': Shirt,
    'alimentos': UtensilsCrossed,
    'hogar': Home,
    'deportes': Trophy,
    'default': Package,
  }
  return iconMap[categoryName?.toLowerCase()] || iconMap.default
}

const CategoryIcon = ({ categoryName, size = 128, className = '' }) => {
  const Icon = getCategoryIcon(categoryName)
  return <Icon size={size} className={className} strokeWidth={1.5} />
}

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
      setProduct(response.data.data)
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
        <div className="error"><AlertCircle size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />{error}</div>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          <ArrowLeft size={18} />
          Volver a productos
        </button>
      </div>
    )
  }

  if (!product) {
    return (
      <div>
        <div className="error"><AlertCircle size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />Producto no encontrado</div>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          <ArrowLeft size={18} />
          Volver a productos
        </button>
      </div>
    )
  }

  return (
    <div>
      <button className="btn btn-outline" onClick={() => navigate('/')}>
        <ArrowLeft size={18} />
        Volver
      </button>

      <div className="product-detail">
        <div className="product-detail-image">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="product-detail-image-img" />
          ) : (
            <div className="product-detail-image-icon">
              <CategoryIcon categoryName={product.category?.name} size={150} />
            </div>
          )}
        </div>

        <div className="product-detail-info">
          <p className="card-category">{product.category?.name}</p>
          <h1 style={{ borderBottom: 'none', marginBottom: '0.25rem' }}>{product.name}</h1>
          <p className="text-muted" style={{ marginBottom: '1.5rem' }}>SKU: {product.sku}</p>

          {message && (
            <div className="success" style={{ marginBottom: '1rem' }}><Check size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />{message}</div>
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
            <ShoppingCart size={20} />
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  )
}
