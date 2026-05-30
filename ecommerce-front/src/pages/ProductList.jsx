import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { productService } from '../services/api'
import { useCart } from '../context/CartContext'

const LIMIT = 20

export default function ProductList() {
  const { addItem } = useCart()
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
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`btn btn-filter ${selectedCategoryId === cat.id ? 'active' : ''}`}
            onClick={() => { setSelectedCategoryId(cat.id); setPage(1) }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {error && <div className="error">{error}</div>}

      {products.length === 0 ? (
        <div className="empty-state">No hay productos disponibles</div>
      ) : (
        <div className="grid">
          {products.map((product) => (
            <div key={product.id} className="card">
              <div className="card-image">
                <span className="product-icon">{product.category?.name?.[0] ?? 'P'}</span>
              </div>
              <div className="card-body">
                <p className="card-category">{product.category?.name}</p>
                <h3 className="card-title">{product.name}</h3>
                <p className="card-description">{product.description}</p>
                <p className="card-price">${product.price.toFixed(2)}</p>
                <div className="card-footer">
                  <span className={`badge ${product.stock > 0 ? 'badge-success' : 'badge-danger'}`}>
                    {product.stock > 0 ? `${product.stock} en stock` : 'Agotado'}
                  </span>
                  <p className="card-sku">SKU: {product.sku}</p>
                </div>
                <div className="card-actions">
                  <Link to={`/producto/${product.id}`} className="btn btn-primary btn-small">
                    Ver detalle
                  </Link>
                  <button
                    className="btn btn-success btn-small"
                    disabled={!product.is_active || product.stock === 0}
                    onClick={() =>
                      addItem({
                        product_id: product.id,
                        name: product.name,
                        price: product.price,
                        sku: product.sku,
                        stock: product.stock,
                        category: product.category?.name,
                        quantity: 1,
                      })
                    }
                  >
                    Agregar
                  </button>
                  <button
                    className="btn btn-danger btn-small"
                    onClick={() => handleDelete(product.id)}
                  >
                    Eliminar
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
            Anterior
          </button>
          <span className="pagination-info">Página {page}</span>
          <button
            className="btn btn-outline"
            onClick={() => setPage(page + 1)}
            disabled={!hasMore}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  )
}
