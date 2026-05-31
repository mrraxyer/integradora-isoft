import { useState, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { LogIn, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'

  const emailRef = useRef(null)
  const passwordRef = useRef(null)
  const submitRef = useRef(null)

  const [form, setForm] = useState({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [serverError, setServerError] = useState(null)

  const validate = () => {
    const errors = {}
    if (!form.email) errors.email = 'El correo es obligatorio'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Correo inválido'
    if (!form.password) errors.password = 'La contraseña es obligatoria'
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

    if (e.target === emailRef.current && !fieldErrors.email) {
      passwordRef.current?.focus()
    } else if (e.target === passwordRef.current) {
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
    const result = await login(form.email, form.password)
    if (result.ok) {
      navigate(from, { replace: true })
    } else {
      setServerError(result.error)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Iniciar sesión</h1>

        {serverError && (
          <div className="auth-error" role="alert" aria-live="assertive">
            <AlertCircle size={18} style={{ display: 'inline', marginRight: '0.5rem' }} aria-hidden="true" />
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
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
              autoComplete="current-password"
              className={`form-input ${fieldErrors.password ? 'input-error' : ''}`}
              value={form.password}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="••••••••"
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

          <button
            ref={submitRef}
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={loading}
            aria-label={loading ? 'Ingresando cuenta' : 'Ingresar con datos proporcionados'}
          >
            <LogIn size={18} aria-hidden="true" />
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="auth-footer">
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="auth-link">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  )
}
