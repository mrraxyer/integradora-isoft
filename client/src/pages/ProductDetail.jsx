import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productService } from '../services/api';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await productService.getById(id);
        setProduct(res.data.data);
      } catch (err) {
        setError(
          err.response?.status === 404
            ? 'Producto no encontrado.'
            : 'Error al cargar el producto.'
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await productService.remove(id);
      navigate('/products');
    } catch {
      setError('Error al eliminar el producto.');
      setDeleteConfirm(false);
      setDeleting(false);
    }
  };

  if (loading) return <div className="loading">Cargando producto...</div>;

  if (error) {
    return (
      <div className="page">
        <div className="alert alert-error">{error}</div>
        <Link to="/products" className="btn btn-outline">
          Volver al listado
        </Link>
      </div>
    );
  }

  const isAvailable = product.stock > 0;
  const createdDate = new Date(product.createdAt).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="page page-narrow">
      <div className="page-header">
        <div>
          <p className="breadcrumb">
            <Link to="/products">Productos</Link> / {product.name}
          </p>
          <h1 className="page-title">{product.name}</h1>
        </div>
        <div className="header-actions">
          <Link to={`/products/${id}/edit`} className="btn btn-secondary">
            Editar
          </Link>
          {!deleteConfirm ? (
            <button onClick={() => setDeleteConfirm(true)} className="btn btn-danger">
              Eliminar
            </button>
          ) : (
            <div className="confirm-inline">
              <span className="confirm-label">Confirmar eliminacion:</span>
              <button onClick={handleDelete} disabled={deleting} className="btn btn-danger">
                {deleting ? 'Eliminando...' : 'Confirmar'}
              </button>
              <button
                onClick={() => setDeleteConfirm(false)}
                className="btn btn-outline"
                disabled={deleting}
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="detail-card">
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">SKU</span>
            <span className="detail-value mono">{product.sku}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Categoria</span>
            <span className="detail-value">{product.category || '—'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Precio</span>
            <span className="detail-value price">${parseFloat(product.price).toFixed(2)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Stock</span>
            <span className="detail-value">{product.stock} unidades</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Disponibilidad</span>
            <span className={`badge ${isAvailable ? 'badge-success' : 'badge-danger'}`}>
              {isAvailable ? 'Disponible' : 'Sin stock'}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Registrado</span>
            <span className="detail-value">{createdDate}</span>
          </div>
        </div>

        {product.description && (
          <div className="detail-description">
            <span className="detail-label">Descripcion</span>
            <p className="detail-text">{product.description}</p>
          </div>
        )}
      </div>

      <div className="page-footer">
        <Link to="/products" className="btn btn-outline">
          Volver al listado
        </Link>
      </div>
    </div>
  );
}
