import { Link, NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/products" className="navbar-brand">
          Gestion de Inventario
        </Link>
        <nav className="navbar-nav">
          <NavLink
            to="/products"
            end
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Productos
          </NavLink>
          <NavLink
            to="/products/new"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Agregar Producto
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
