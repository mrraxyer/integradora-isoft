import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import './index.css'
import ProductList from './pages/ProductList'
import ProductDetail from './pages/ProductDetail'
import CategoryList from './pages/CategoryList'
import OrderList from './pages/OrderList'
import Cart from './pages/Cart'
import Login from './pages/Login'
import Register from './pages/Register'
import ProtectedRoute from './components/ProtectedRoute'
import { CartProvider, useCart } from './context/CartContext'
import { AuthProvider, useAuth } from './context/AuthContext'

function NavBar() {
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
          iSoft Store
        </Link>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-link">Productos</Link>
          </li>
          <li className="nav-item">
            <Link to="/categorias" className="nav-link">Categorías</Link>
          </li>
          {isAuthenticated && (
            <>
              <li className="nav-item">
                <Link to="/ordenes" className="nav-link">Órdenes</Link>
              </li>
              <li className="nav-item">
                <Link to="/carrito" className="nav-link">
                  Carrito{totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
                </Link>
              </li>
            </>
          )}
        </ul>
        <div className="nav-auth">
          {isAuthenticated ? (
            <>
              <span className="nav-user">{user?.name}</span>
              <button className="btn btn-danger btn-small" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline-light btn-small">Ingresar</Link>
              <Link to="/registro" className="btn btn-primary btn-small">Registro</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

function AppContent() {
  return (
    <div className="app">
      <NavBar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/producto/:id" element={<ProductDetail />} />
          <Route path="/categorias" element={<CategoryList />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route
            path="/ordenes"
            element={
              <ProtectedRoute>
                <OrderList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/carrito"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <footer className="footer">
        <p>&copy; 2024 iSoft Store. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  )
}

export default App
