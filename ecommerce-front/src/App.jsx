import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import './index.css'
import ProductList from './pages/ProductList'
import ProtectedRoute from './components/ProtectedRoute'
import Header from './components/Header'
import Footer from './components/Footer'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'

const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const CategoryList = lazy(() => import('./pages/CategoryList'))
const OrderList = lazy(() => import('./pages/OrderList'))
const Cart = lazy(() => import('./pages/Cart'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))

function AppContent() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Suspense fallback={<div className="loading">Cargando...</div>}>
          <Routes>
            <Route path="/" element={<ProductList />} />
            <Route path="/producto/:id" element={<ProductDetail />} />
            <Route
              path="/categorias"
              element={
                <ProtectedRoute adminOnly>
                  <CategoryList />
                </ProtectedRoute>
              }
            />
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
                <ProtectedRoute nonAdmin>
                  <Cart />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </main>
      <Footer />
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
