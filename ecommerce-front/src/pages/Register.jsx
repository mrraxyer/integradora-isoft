import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register, loading } = useAuth()
  const navigate = useNavigate()

  const nameRef = useRef(null)
  const emailRef = useRef(null)
  const passwordRef = useRef(null)
  const confirmRef = useRef(null)
  const submitRef = useRef(null)

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

  const handleKeyDown = (e) => {
    if (e.key !== 'Enter') return
    e.preventDefault()

    if (e.target === nameRef.current && !fieldErrors.name) {
      emailRef.current?.focus()
    } else if (e.target === emailRef.current && !fieldErrors.email) {
      passwordRef.current?.focus()
    } else if (e.target === passwordRef.current && !fieldErrors.password) {
      confirmRef.current?.focus()
    } else if (e.target === confirmRef.current) {
      submitRef.current?.click()
    }
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
        <h1 className="auth-title">Crear cuenta</h1>

        {serverError && (
          <div className="auth-error" role="alert" aria-live="assertive">
            <AlertCircle size={18} style={{ display: 'inline', marginRight: '0.5rem' }} aria-hidden="true" />
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Nombre completo<span aria-label="requerido">*</span>
            </label>
            <input
              ref={nameRef}
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              className={`form-input ${fieldErrors.name ? 'input-error' : ''}`}
              value={form.name}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Juan Pérez"
              aria-required="true"
              aria-invalid={!!fieldErrors.name}
              aria-describedby={fieldErrors.name ? 'name-error' : undefined}
            />
            {fieldErrors.name && (
              <span id="name-error" className="field-error" role="alert">
                {fieldErrors.name}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Correo electrónico<span aria-label="requerido">*</span>
            </label>
            <input
              ref={emailRef}
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className={`form-input ${fieldErrors.email ? 'input-error' : ''}`}
              value={form.email}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="tu@correo.com"
              aria-required="true"
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
            />
            {fieldErrors.email && (
              <span id="email-error" className="field-error" role="alert">
                {fieldErrors.email}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Contraseña<span aria-label="requerida">*</span>
            </label>
            <input
              ref={passwordRef}
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              className={`form-input ${fieldErrors.password ? 'input-error' : ''}`}
              value={form.password}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Mínimo 6 caracteres"
              aria-required="true"
              aria-invalid={!!fieldErrors.password}
              aria-describedby={fieldErrors.password ? 'password-error' : undefined}
            />
            {fieldErrors.password && (
              <span id="password-error" className="field-error" role="alert">
                {fieldErrors.password}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirm" className="form-label">
              Confirmar contraseña<span aria-label="requerida">*</span>
            </label>
            <input
              ref={confirmRef}
              id="confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              className={`form-input ${fieldErrors.confirm ? 'input-error' : ''}`}
              value={form.confirm}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Repite tu contraseña"
              aria-required="true"
              aria-invalid={!!fieldErrors.confirm}
              aria-describedby={fieldErrors.confirm ? 'confirm-error' : undefined}
            />
            {fieldErrors.confirm && (
              <span id="confirm-error" className="field-error" role="alert">
                {fieldErrors.confirm}
              </span>
            )}
          </div>

          <button
            ref={submitRef}
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={loading}
            aria-label={loading ? 'Creando nueva cuenta' : 'Registrarse con datos proporcionados'}
          >
            <UserPlus size={18} aria-hidden="true" />
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
