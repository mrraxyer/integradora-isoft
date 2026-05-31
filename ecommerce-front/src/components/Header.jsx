import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, LogOut, LogIn, UserPlus, Package, Grid3x3, Home } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const { totalItems } = useCart()
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <Package size={24} />
          iSoft Store
        </Link>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-link">
              <Home size={18} />
              Productos
            </Link>
          </li>
          {isAuthenticated && user?.role === 'admin' && (
            <li className="nav-item">
              <Link to="/categorias" className="nav-link">
                <Grid3x3 size={18} />
                Categorías
              </Link>
            </li>
          )}
          {isAuthenticated && (
            <>
              <li className="nav-item">
                <Link to="/ordenes" className="nav-link">
                  <Package size={18} />
                  Órdenes
                </Link>
              </li>
              {user?.role !== 'admin' && (
                <li className="nav-item">
                  <Link to="/carrito" className="nav-link">
                    <ShoppingCart size={18} />
                    Carrito{totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
                  </Link>
                </li>
              )}
            </>
          )}
        </ul>
        <div className="nav-auth">
          {isAuthenticated ? (
            <>
              <span className="nav-user">{user?.name}</span>
              <button className="btn btn-danger btn-small" onClick={handleLogout}>
                <LogOut size={16} />
                Cerrar
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline-light btn-small">
                <LogIn size={16} />
                Ingresar
              </Link>
              <Link to="/registro" className="btn btn-primary btn-small">
                <UserPlus size={16} />
                Registro
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
