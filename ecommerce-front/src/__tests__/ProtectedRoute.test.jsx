import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect, beforeEach, vi } from 'vitest'

import { AuthProvider } from '../context/AuthContext'
import ProtectedRoute from '../components/ProtectedRoute'

beforeEach(() => {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_user')
})

describe('<ProtectedRoute />', () => {
  it('redirige a /login cuando no está autenticado', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/private"]}>
          <Routes>
            <Route path="/login" element={<div>Login</div>} />
            <Route
              path="/private"
              element={
                <ProtectedRoute>
                  <div>Private</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    )

    expect(screen.getByText('Login')).toBeInTheDocument()
  })

  it('renderiza children cuando está autenticado', () => {
    // Simulamos sesión colocando token y usuario en localStorage
    localStorage.setItem('auth_token', 'fake-token')
    localStorage.setItem('auth_user', JSON.stringify({ role: 'user' }))

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/private"]}>
          <Routes>
            <Route
              path="/private"
              element={
                <ProtectedRoute>
                  <div>Private</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    )

    expect(screen.getByText('Private')).toBeInTheDocument()
  })

  it('redirige cuando user no es admin y se requiere adminOnly', () => {
    localStorage.setItem('auth_token', 'fake-token')
    localStorage.setItem('auth_user', JSON.stringify({ role: 'user' }))

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/admin"]}>
          <Routes>
            <Route path="/" element={<div>Home</div>} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <div>Admin</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    )

    expect(screen.getByText('Home')).toBeInTheDocument()
  })
})
