import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productService } from '../services/api';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ category: '', available: '', page: 1 });
  const navigate = useNavigate();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page: filters.page, limit: 20 };
      if (filters.category) params.category = filters.category;
      if (filters.available !== '') params.available = filters.available;
      const res = await productService.getAll(params);
      setProducts(res.data.data);
      setMeta(res.data.meta);
    } catch {
      setError('Error al cargar los productos. Verifique que el servidor este en linea.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Eliminar el producto "${name}"?`)) return;
    try {
      await productService.remove(id);
      fetchProducts();
    } catch {
      setError('Error al eliminar el producto.');
    }
  };

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value, page: 1 }));
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Productos</h1>
        <Link to="/products/new" className="btn btn-primary">
          Agregar Producto
        </Link>
      </div>

      <div className="filter-bar">
        <input
          type="text"
          name="category"
          placeholder="Filtrar por categoria"
          value={filters.category}
          onChange={handleFilterChange}
          className="filter-input"
        />
        <select
          name="available"
          value={filters.available}
          onChange={handleFilterChange}
          className="filter-select"
        >
          <option value="">Todos</option>
          <option value="true">Con stock</option>
          <option value="false">Sin stock</option>
        </select>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Cargando productos...</div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          No hay productos registrados.
          <Link to="/products/new" className="empty-state-link">
            Agregar el primero
          </Link>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Nombre</th>
                  <th>Categoria</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td className="mono">{p.sku}</td>
                    <td>{p.name}</td>
                    <td className="text-secondary">{p.category || '—'}</td>
                    <td className="text-right">${parseFloat(p.price).toFixed(2)}</td>
                    <td className="text-center">{p.stock}</td>
                    <td>
                      <span className={`badge ${p.stock > 0 ? 'badge-success' : 'badge-danger'}`}>
                        {p.stock > 0 ? 'Disponible' : 'Sin stock'}
                      </span>
                    </td>
                    <td>
                      <div className="action-group">
                        <button
                          onClick={() => navigate(`/products/${p.id}`)}
                          className="btn btn-sm btn-outline"
                        >
                          Ver
                        </button>
                        <button
                          onClick={() => navigate(`/products/${p.id}/edit`)}
                          className="btn btn-sm btn-secondary"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="btn btn-sm btn-danger"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <span className="pagination-info">
              {meta.total} producto{meta.total !== 1 ? 's' : ''} en total
            </span>
            <div className="pagination-controls">
              <button
                className="btn btn-sm btn-outline"
                disabled={filters.page <= 1}
                onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
              >
                Anterior
              </button>
              <span className="pagination-page">
                {filters.page} / {meta.pages}
              </span>
              <button
                className="btn btn-sm btn-outline"
                disabled={filters.page >= meta.pages}
                onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
