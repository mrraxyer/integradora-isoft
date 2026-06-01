import { useState, useEffect } from 'react'
import { X, Smartphone, Shirt, UtensilsCrossed, Home, Trophy, Package, Car, Dumbbell, Book, Gem, Music, Baby, Wrench, Gamepad2, Coffee, Leaf, Camera, Tv, PawPrint, Palette } from 'lucide-react'
import { categoryService } from '../../services/api'
import { categorySchema, flattenZodErrors } from '../../lib/schemas'

export const CATEGORY_ICONS = [
  { name: 'Package',          label: 'General',        Icon: Package },
  { name: 'Smartphone',       label: 'Electrónica',    Icon: Smartphone },
  { name: 'Shirt',            label: 'Ropa',           Icon: Shirt },
  { name: 'UtensilsCrossed',  label: 'Alimentos',      Icon: UtensilsCrossed },
  { name: 'Home',             label: 'Hogar',          Icon: Home },
  { name: 'Trophy',           label: 'Deportes',       Icon: Trophy },
  { name: 'Car',              label: 'Automotriz',     Icon: Car },
  { name: 'Dumbbell',         label: 'Fitness',        Icon: Dumbbell },
  { name: 'Book',             label: 'Libros',         Icon: Book },
  { name: 'Gem',              label: 'Joyería',        Icon: Gem },
  { name: 'Music',            label: 'Música',         Icon: Music },
  { name: 'Baby',             label: 'Bebés',          Icon: Baby },
  { name: 'Wrench',           label: 'Herramientas',   Icon: Wrench },
  { name: 'Gamepad2',         label: 'Videojuegos',    Icon: Gamepad2 },
  { name: 'Coffee',           label: 'Café/Bebidas',   Icon: Coffee },
  { name: 'Leaf',             label: 'Natural',        Icon: Leaf },
  { name: 'Camera',           label: 'Fotografía',     Icon: Camera },
  { name: 'Tv',               label: 'TV/Audio',       Icon: Tv },
  { name: 'PawPrint',         label: 'Mascotas',       Icon: PawPrint },
  { name: 'Palette',          label: 'Arte',           Icon: Palette },
]

export function getCategoryIcon(iconName) {
  return CATEGORY_ICONS.find((i) => i.name === iconName)?.Icon || Package
}

export default function CategoryFormModal({ category, onSuccess, onClose }) {
  const [formData, setFormData] = useState({ name: '', description: '', icon: 'Package' })
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || '',
        icon: category.icon || 'Package',
      })
      setFieldErrors({})
    }
  }, [category])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validation = categorySchema.safeParse(formData)
    if (!validation.success) {
      setFieldErrors(flattenZodErrors(validation.error))
      return
    }
    setError(null)
    setLoading(true)
    try {
      if (category) {
        await categoryService.update(category.id, validation.data)
      } else {
        await categoryService.create(validation.data)
      }
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.error || 'Error guardando categoría')
    } finally {
      setLoading(false)
    }
  }

  const SelectedIcon = getCategoryIcon(formData.icon)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{category ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="error" style={{ margin: '0 1.5rem 1rem' }}>{error}</div>}

          <div className="modal-body">
            {/* Icon picker: 33/66 grid */}
            <div className="form-group">
              <label className="form-label">Icono</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', alignItems: 'center' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  height: '72px', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                  background: 'var(--bg)', color: 'var(--primary)',
                }}>
                  <SelectedIcon size={36} strokeWidth={1.5} />
                </div>
                <select name="icon" value={formData.icon} onChange={handleChange} className="form-select">
                  {CATEGORY_ICONS.map(({ name, label, Icon }) => (
                    <option key={name} value={name}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Nombre *</label>
              <input name="name" type="text" value={formData.name} onChange={handleChange} className={`form-input ${fieldErrors.name ? 'input-error' : ''}`} placeholder="Ej: Electrónica" />
              {fieldErrors.name && <span className="field-error" role="alert">{fieldErrors.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Descripción</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className="form-textarea" rows="3" placeholder="Descripción de la categoría" />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-outline">Cancelar</button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
