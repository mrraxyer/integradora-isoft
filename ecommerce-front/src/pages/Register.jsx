import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register, loading } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [serverError, setServerError] = useState(null)

  const validate = () => {
    const errors = {}
    if (!form.name || form.name.trim().length < 2)
      errors.name = 'El nombre debe tener al menos 2 caracteres'
    if (!form.email) errors.email = 'El correo es obligatorio'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Correo inválido'
    if (!form.password || form.password.length < 6)
      errors.password = 'La contraseña debe tener al menos 6 caracteres'
    if (form.password !== form.confirm) errors.confirm = 'Las contraseñas no coinciden'
    return errors
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
    setServerError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errors = validate()
    if (Object.keys(errors).length) {
      setFieldErrors(errors)
      return
    }
    const result = await register(form.name.trim(), form.email, form.password)
    if (result.ok) {
      navigate('/', { replace: true })
    } else {
      setServerError(result.error)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Crear cuenta</h2>

        {serverError && <div className="auth-error"><AlertCircle size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />{serverError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Nombre completo
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              className={`form-input ${fieldErrors.name ? 'input-error' : ''}`}
              value={form.name}
              onChange={handleChange}
              placeholder="Juan Pérez"
            />
            {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className={`form-input ${fieldErrors.email ? 'input-error' : ''}`}
              value={form.email}
              onChange={handleChange}
              placeholder="tu@correo.com"
            />
            {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              className={`form-input ${fieldErrors.password ? 'input-error' : ''}`}
              value={form.password}
              onChange={handleChange}
              placeholder="Mínimo 6 caracteres"
            />
            {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirm" className="form-label">
              Confirmar contraseña
            </label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              className={`form-input ${fieldErrors.confirm ? 'input-error' : ''}`}
              value={form.confirm}
              onChange={handleChange}
              placeholder="Repite tu contraseña"
            />
            {fieldErrors.confirm && <span className="field-error">{fieldErrors.confirm}</span>}
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            <UserPlus size={18} />
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>

        <p className="auth-footer">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="auth-link">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  )
}
