import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Trash2, ShoppingCart, Eye, AlertCircle, Edit, Plus, ArrowRight, Package } from 'lucide-react'
import { productService, categoryService } from '../services/api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import ProductFormModal from '../components/modals/ProductFormModal'
import MoveProductModal from '../components/modals/MoveProductModal'
import { getCategoryIcon } from '../components/modals/CategoryFormModal'
import DataTable from '../components/DataTable'

const LIMIT = 20

const CategoryIcon = ({ iconName, size = 64, className = '' }) => {
  const Icon = getCategoryIcon(iconName)
  return <Icon size={size} className={className} strokeWidth={1.5} />
}

export default function ProductList() {
  const { addItem } = useCart()
  const { isAuthenticated, user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  const [showFormModal, setShowFormModal] = useState(false)
  const [showMoveModal, setShowMoveModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    loadProducts()
  }, [selectedCategory, page])

  const loadCategories = async () => {
    try {
      const response = await categoryService.list()
      setCategories(response.data?.data ?? [])
    } catch (err) {
      console.error('Error loading categories:', err)
    }
  }

  const loadProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const skip = (page - 1) * LIMIT
      const response = await productService.list(skip, LIMIT, selectedCategory)
      const data = response.data?.data ?? []
      setProducts(data)
      setHasMore(data.length === LIMIT)
    } catch (err) {
      setError('Error al cargar productos: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este producto?')) return
    try {
      await productService.delete(id)
      loadProducts()
    } catch (err) {
      alert('Error al eliminar: ' + (err.response?.data?.error || err.message))
    }
  }

  const handleProductSuccess = async () => {
    setShowFormModal(false)
    setSelectedProduct(null)
    await loadCategories()
    loadProducts()
  }

  const handleMoveSuccess = async () => {
    setShowMoveModal(false)
    setSelectedProduct(null)
    await loadCategories()
    loadProducts()
  }

  if (loading && page === 1) {
    return <div className="loading">Cargando productos...</div>
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', paddingBottom: '0.75rem', borderBottom: '2px solid var(--border)' }}>
        <h1 style={{ margin: 0, border: 'none', padding: 0 }}>Productos</h1>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => { setSelectedProduct(null); setShowFormModal(true) }}>
            <Plus size={18} />
            Agregar Producto
          </button>
        )}
      </div>

      <div className="filter-bar">
        <button
          className={`btn btn-filter ${selectedCategory === null ? 'active' : ''}`}
          onClick={() => { setSelectedCategory(null); setPage(1) }}
        >
          Todas
        </button>
        {categories.map((cat) => {
          const Icon = getCategoryIcon(cat.icon)
          return (
            <button
              key={cat.id}
              className={`btn btn-filter ${selectedCategory === cat.name ? 'active' : ''}`}
              onClick={() => { setSelectedCategory(cat.name); setPage(1) }}
            >
              <Icon size={16} />
              {cat.name}
            </button>
          )
        })}
      </div>

      {error && <div className="error"><AlertCircle size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />{error}</div>}

      {isAdmin ? (
        <DataTable
          data={products}
          empty="No hay productos disponibles"
          columns={[
            {
              key: 'id',
              header: 'ID',
              width: '60px',
              render: (p) => <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{p.id}</span>,
            },
            { key: 'name', header: 'Nombre', render: (p) => <strong>{p.name}</strong> },
            { key: 'sku', header: 'SKU' },
            { key: 'price', header: 'Precio', render: (p) => `$${parseFloat(p.price).toFixed(2)}` },
            {
              key: 'stock',
              header: 'Stock',
              render: (p) => (
                <span className={`badge ${p.stock > 0 ? 'badge-success' : 'badge-danger'}`}>
                  {p.stock > 0 ? p.stock : 'Agotado'}
                </span>
              ),
            },
            {
              key: 'category',
              header: 'Categoría',
              render: (p) => {
                if (!p.category) return <span style={{ color: 'var(--text-muted)' }}>—</span>
                const CatIcon = getCategoryIcon(p.category.icon)
                return (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CatIcon size={16} strokeWidth={1.5} />
                    {p.category.name}
                  </span>
                )
              },
            },
            {
              key: 'actions',
              header: 'Acciones',
              render: (p) => (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-outline btn-small" title="Editar" onClick={() => { setSelectedProduct(p); setShowFormModal(true) }}>
                    <Edit size={14} />
                  </button>
                  <button className="btn btn-outline btn-small" title="Mover categoría" onClick={() => { setSelectedProduct(p); setShowMoveModal(true) }}>
                    <ArrowRight size={14} />
                  </button>
                  <button className="btn btn-danger btn-small" title="Eliminar" onClick={() => handleDelete(p.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ),
            },
          ]}
        />
      ) : products.length === 0 ? (
        <div className="empty-state">No hay productos disponibles</div>
      ) : (
        /* Usuario: vista de cards */
        <div className="grid">
          {products.map((product) => (
            <div key={product.id} className="card">
              <div className="card-image">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="card-image-img" />
                ) : (
                  <div className="card-image-icon">
                    <CategoryIcon iconName={product.category?.icon} size={80} />
                  </div>
                )}
              </div>
              <div className="card-body">
                <p className="card-category">
                  {product.category && (
                    <>
                      {(() => { const I = getCategoryIcon(product.category.icon); return <I size={14} style={{ display: 'inline', marginRight: '0.3rem', verticalAlign: 'middle' }} /> })()}
                      {product.category.name}
                    </>
                  )}
                </p>
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
                      onClick={() => addItem(product.id, 1)}
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
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && products.length > 0 && (
        <div className="pagination">
          <button className="btn btn-outline" onClick={() => setPage(page > 1 ? page - 1 : 1)} disabled={page === 1}>
            ← Anterior
          </button>
          <span className="pagination-info">Página {page}</span>
          <button className="btn btn-outline" onClick={() => setPage(page + 1)} disabled={!hasMore}>
            Siguiente →
          </button>
        </div>
      )}

      {showFormModal && (
        <ProductFormModal
          product={selectedProduct}
          categories={categories}
          onSuccess={handleProductSuccess}
          onClose={() => { setShowFormModal(false); setSelectedProduct(null) }}
        />
      )}

      {showMoveModal && (
        <MoveProductModal
          product={selectedProduct}
          categories={categories}
          onSuccess={handleMoveSuccess}
          onClose={() => { setShowMoveModal(false); setSelectedProduct(null) }}
        />
      )}
    </div>
  )
}
