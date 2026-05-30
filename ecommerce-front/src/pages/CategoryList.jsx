import { useState, useEffect } from 'react'
import { Trash2, AlertCircle, Smartphone, Shirt, UtensilsCrossed, Home, Trophy, Package } from 'lucide-react'
import { categoryService } from '../services/api'

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

export default function CategoryList() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await categoryService.list()
      setCategories(response.data.data)
    } catch (err) {
      setError('Error al cargar categorías: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
      try {
        await categoryService.delete(id)
        loadCategories()
      } catch (err) {
        alert('Error: ' + (err.response?.data?.detail || err.message))
      }
    }
  }

  if (loading) return <div className="loading">Cargando categorías...</div>

  return (
    <div>
      <h1>Categorías</h1>

      {error && <div className="error"><AlertCircle size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />{error}</div>}

      {categories.length === 0 ? (
        <div className="empty-state">No hay categorías</div>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => {
                const Icon = getCategoryIcon(cat.name)
                return (
                  <tr key={cat.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Icon size={18} />
                        <strong>{cat.name}</strong>
                      </div>
                    </td>
                    <td>{cat.description}</td>
                    <td>
                      <button
                        className="btn btn-danger btn-small"
                        onClick={() => handleDelete(cat.id)}
                      >
                        <Trash2 size={16} />
                        Eliminar
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
