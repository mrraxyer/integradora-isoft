import { useState, useEffect } from 'react'
import { categoryService } from '../services/api'

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
      setCategories(response.data)
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
        alert('Error: ' + err.response?.data?.detail || err.message)
      }
    }
  }

  if (loading) {
    return <div className="loading">Cargando categorías...</div>
  }

  return (
    <div>
      <h1>📁 Categorías</h1>

      {error && <div className="error">{error}</div>}

      {categories.length === 0 ? (
        <div className="loading">No hay categorías</div>
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
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td>
                    <strong>{cat.name}</strong>
                  </td>
                  <td>{cat.description}</td>
                  <td>
                    <button
                      className="btn btn-danger btn-small"
                      onClick={() => handleDelete(cat.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
