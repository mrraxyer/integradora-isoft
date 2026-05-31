import { useState, useEffect } from 'react'
import { Trash2, Edit, Plus, AlertCircle } from 'lucide-react'
import { categoryService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import CategoryFormModal, { getCategoryIcon } from '../components/modals/CategoryFormModal'
import DataTable from '../components/DataTable'

export default function CategoryList() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showFormModal, setShowFormModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)

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
    if (!window.confirm('¿Eliminar esta categoría?')) return
    try {
      await categoryService.delete(id)
      loadCategories()
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message))
    }
  }

  const columns = [
    {
      key: 'id',
      header: 'ID',
      width: '60px',
      render: (cat) => <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{cat.id}</span>,
    },
    {
      key: 'icon',
      header: 'Icono',
      width: '80px',
      render: (cat) => {
        const Icon = getCategoryIcon(cat.icon)
        return (
          <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--primary)' }}>
            <Icon size={32} strokeWidth={1.5} />
          </div>
        )
      },
    },
    {
      key: 'name',
      header: 'Nombre',
      render: (cat) => <strong>{cat.name}</strong>,
    },
    {
      key: 'description',
      header: 'Descripción',
      render: (cat) => cat.description || <span style={{ color: 'var(--text-muted)' }}>—</span>,
    },
    ...(isAdmin
      ? [
          {
            key: 'actions',
            header: 'Acciones',
            width: '110px',
            render: (cat) => (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn btn-outline btn-small"
                  title="Editar"
                  onClick={() => { setSelectedCategory(cat); setShowFormModal(true) }}
                >
                  <Edit size={14} />
                </button>
                <button
                  className="btn btn-danger btn-small"
                  title="Eliminar"
                  onClick={() => handleDelete(cat.id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ),
          },
        ]
      : []),
  ]

  if (loading) return <div className="loading">Cargando categorías...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', paddingBottom: '0.75rem', borderBottom: '2px solid var(--border)' }}>
        <h1 style={{ margin: 0, border: 'none', padding: 0 }}>Categorías</h1>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => { setSelectedCategory(null); setShowFormModal(true) }}>
            <Plus size={18} />
            Agregar Categoría
          </button>
        )}
      </div>

      {error && <div className="error"><AlertCircle size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />{error}</div>}

      <DataTable columns={columns} data={categories} empty="No hay categorías" />

      {showFormModal && (
        <CategoryFormModal
          category={selectedCategory}
          onSuccess={() => { setShowFormModal(false); setSelectedCategory(null); loadCategories() }}
          onClose={() => { setShowFormModal(false); setSelectedCategory(null) }}
        />
      )}
    </div>
  )
}
