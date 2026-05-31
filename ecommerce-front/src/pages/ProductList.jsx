import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Trash2, ShoppingCart, Eye, AlertCircle, Smartphone, Shirt, UtensilsCrossed, Home, Trophy, Package } from 'lucide-react'
import { productService } from '../services/api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const LIMIT = 20

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

const CategoryIcon = ({ categoryName, size = 64, className = '' }) => {
  const Icon = getCategoryIcon(categoryName)
  return <Icon size={size} className={className} strokeWidth={1.5} />
}

export default function ProductList() {
  const { addItem } = useCart()
  const { isAuthenticated } = useAuth()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategoryId, setSelectedCategoryId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    loadProducts()
  }, [selectedCategoryId, page])

  const loadProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const skip = (page - 1) * LIMIT
      const response = await productService.list(skip, LIMIT, selectedCategoryId)
      const data = response.data.data
      setProducts(data)
      setHasMore(data.length === LIMIT)
      if (page === 1) {
        const cats = [
          ...new Map(
            data.filter((p) => p.category).map((p) => [p.category.id, p.category])
          ).values(),
        ]
        setCategories(cats)
      }
    } catch (err) {
      setError('Error al cargar productos: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        await productService.delete(id)
        loadProducts()
      } catch (err) {
        alert('Error al eliminar producto: ' + err.message)
      }
    }
  }

  if (loading && page === 1) {
    return <div className="loading">Cargando productos...</div>
  }

  return (
    <div>
      <h1>Productos</h1>

      <div className="filter-bar">
        <button
          className={`btn btn-filter ${selectedCategoryId === null ? 'active' : ''}`}
          onClick={() => { setSelectedCategoryId(null); setPage(1) }}
        >
          Todas
        </button>
        {categories.map((cat) => {
          const Icon = getCategoryIcon(cat.name)
          return (
            <button
              key={cat.id}
              className={`btn btn-filter ${selectedCategoryId === cat.id ? 'active' : ''}`}
              onClick={() => { setSelectedCategoryId(cat.id); setPage(1) }}
            >
              <Icon size={16} />
              {cat.name}
            </button>
          )
        })}
      </div>

      {error && <div className="error"><AlertCircle size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />{error}</div>}

      {products.length === 0 ? (
        <div className="empty-state">No hay productos disponibles</div>
      ) : (
        <div className="grid">
          {products.map((product) => (
            <div key={product.id} className="card">
              <div className="card-image">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="card-image-img" />
                ) : (
                  <div className="card-image-icon">
                    <CategoryIcon categoryName={product.category?.name} size={80} />
                  </div>
                )}
              </div>
              <div className="card-body">
                <p className="card-category">{product.category?.name}</p>
                <h3 className="card-title">{product.name}</h3>
                <p className="card-description">{product.description}</p>
                <p className="card-price">${parseFloat(product.price).toFixed(2)}</p>
                <div className="card-footer">
                  <span className={`badge ${product.stock > 0 ? 'badge-success' : 'badge-danger'}`}>
                    {product.stock > 0 ? `${product.stock} en stock` : 'Agotado'}
                  </span>
                  <p className="card-sku">SKU: {product.sku}</p>
                </div>
                <div className="card-actions">
                  <Link to={`/producto/${product.id}`} className="btn btn-primary btn-small">
                    <Eye size={16} />
                    Ver
                  </Link>
                  {isAuthenticated ? (
                    <button
                      className="btn btn-success btn-small"
                      disabled={product.stock === 0}
                      onClick={() =>
                        addItem(product.id, 1)
                      }
                  >
                      <ShoppingCart size={16} />
                      Agregar
                    </button>
                  ) : (
                    <Link to="/login" className="btn btn-primary btn-small">
                      <ShoppingCart size={16} />
                      Ingresar
                    </Link>
                  )}
                  <button
                    className="btn btn-danger btn-small"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && products.length > 0 && (
        <div className="pagination">
          <button
            className="btn btn-outline"
            onClick={() => setPage(page > 1 ? page - 1 : 1)}
            disabled={page === 1}
          >
            ← Anterior
          </button>
          <span className="pagination-info">Página {page}</span>
          <button
            className="btn btn-outline"
            onClick={() => setPage(page + 1)}
            disabled={!hasMore}
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  )
}
