import { Routes, Route, Link } from 'react-router-dom'
import './index.css'
import ProductList from './pages/ProductList'
import ProductDetail from './pages/ProductDetail'
import CategoryList from './pages/CategoryList'
import OrderList from './pages/OrderList'
import Cart from './pages/Cart'

function App() {
  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            🛒 Ecommerce
          </Link>
          <ul className="nav-menu">
            <li className="nav-item">
              <Link to="/" className="nav-link">
                Productos
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/categorias" className="nav-link">
                Categorías
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/ordenes" className="nav-link">
                Órdenes
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/carrito" className="nav-link">
                🛍️ Carrito
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/producto/:id" element={<ProductDetail />} />
          <Route path="/categorias" element={<CategoryList />} />
          <Route path="/ordenes" element={<OrderList />} />
          <Route path="/carrito" element={<Cart />} />
        </Routes>
      </main>

      <footer className="footer">
        <p>&copy; 2024 Ecommerce Platform. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}

export default App
