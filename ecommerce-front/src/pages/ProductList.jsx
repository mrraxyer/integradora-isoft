import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { productService, categoryService } from '../services/api'

export default function ProductList() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(0)

  useEffect(() => {
    loadCategories()
    loadProducts()
  }, [])

  useEffect(() => {
    loadProducts()
  }, [selectedCategory, page])

  const loadCategories = async () => {
    try {
      const response = await categoryService.list()
      setCategories(response.data)
    } catch (err) {
      console.error('Error loading categories:', err)
    }
  }

  const loadProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await productService.list(page * 10, 10, selectedCategory)
      setProducts(response.data)
    } catch (err) {
      setError('Error al cargar productos: ' + err.message)
      console.error('Error loading products:', err)
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

  if (loading && page === 0) {
    return <div className="loading">Cargando productos...</div>
  }

  return (
    <div>
      <h1>🛒 Productos</h1>

      <div style={{ marginBottom: '2rem' }}>
        <h3>Filtrar por categoría:</h3>
        <button
          className={`btn ${selectedCategory === null ? 'btn-primary' : ''}`}
          onClick={() => {
            setSelectedCategory(null)
            setPage(0)
          }}
          style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
        >
          Todas
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`btn ${selectedCategory === cat.id ? 'btn-primary' : ''}`}
            onClick={() => {
              setSelectedCategory(cat.id)
              setPage(0)
            }}
            style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {error && <div className="error">{error}</div>}

      {products.length === 0 ? (
        <div className="loading">No hay productos disponibles</div>
      ) : (
        <div className="grid">
          {products.map((product) => (
            <div key={product.id} className="card">
              <div className="card-image">📦</div>
              <h3 className="card-title">{product.name}</h3>
              <p className="card-description">{product.description}</p>
              <p className="card-price">${product.price.toFixed(2)}</p>
              <p className="card-stock">
                Stock: <strong>{product.stock}</strong>
              </p>
              <p style={{ fontSize: '0.85rem', color: '#666' }}>
                SKU: {product.sku}
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link
                  to={`/producto/${product.id}`}
                  className="btn btn-primary btn-small"
                >
                  Ver detalle
                </Link>
                <button
                  className="btn btn-danger btn-small"
                  onClick={() => handleDelete(product.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && products.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button
            className="btn btn-secondary"
            onClick={() => setPage(page > 0 ? page - 1 : 0)}
            disabled={page === 0}
          >
            ← Anterior
          </button>
          <span style={{ margin: '0 1rem', fontWeight: 'bold' }}>
            Página {page + 1}
          </span>
          <button
            className="btn btn-secondary"
            onClick={() => setPage(page + 1)}
            disabled={products.length < 10}
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  )
}
