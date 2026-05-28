import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { productService } from '../services/api';

function validate(data) {
  const errors = {};
  if (!data.name || data.name.trim().length < 2)
    errors.name = 'El nombre debe tener al menos 2 caracteres.';
  if (data.price === '' || isNaN(parseFloat(data.price)) || parseFloat(data.price) < 0)
    errors.price = 'El precio debe ser un numero mayor o igual a 0.';
  if (data.stock === '' || isNaN(parseInt(data.stock, 10)) || parseInt(data.stock, 10) < 0)
    errors.stock = 'El stock debe ser un entero mayor o igual a 0.';
  if (!data.sku || data.sku.trim().length === 0)
    errors.sku = 'El SKU es obligatorio.';
  return errors;
}

const emptyForm = { name: '', description: '', price: '', stock: '', sku: '', category: '' };

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const res = await productService.getById(id);
        const p = res.data.data;
        setForm({
          name: p.name,
          description: p.description || '',
          price: p.price,
          stock: p.stock,
          sku: p.sku,
          category: p.category || '',
        });
      } catch {
        setServerError('No se pudo cargar el producto.');
      } finally {
        setFetching(false);
      }
    })();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    setServerError('');

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: parseFloat(form.price),
      stock: parseInt(form.stock, 10),
      sku: form.sku.trim(),
      category: form.category.trim() || null,
    };

    try {
      if (isEdit) {
        await productService.update(id, payload);
        navigate(`/products/${id}`);
      } else {
        const res = await productService.create(payload);
        navigate(`/products/${res.data.data.id}`);
      }
    } catch (err) {
      const data = err.response?.data;
      if (data?.error) {
        setServerError(data.error);
      } else if (Array.isArray(data?.errors)) {
        const mapped = {};
        data.errors.forEach((e) => {
          const key = e.field || e.path?.[0] || e.param;
          if (key) mapped[key] = e.message || e.msg;
        });
        if (Object.keys(mapped).length > 0) {
          setFieldErrors(mapped);
        } else {
          setServerError('Error de validacion en el servidor.');
        }
      } else {
        setServerError('Error al guardar el producto.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="loading">Cargando producto...</div>;

  return (
    <div className="page page-narrow">
      <div className="page-header">
        <h1 className="page-title">{isEdit ? 'Editar Producto' : 'Nuevo Producto'}</h1>
        <Link to={isEdit ? `/products/${id}` : '/products'} className="btn btn-outline">
          Cancelar
        </Link>
      </div>

      {serverError && <div className="alert alert-error">{serverError}</div>}

      <form onSubmit={handleSubmit} className="form" noValidate>
        <div className="form-grid">
          <div className={`form-group${fieldErrors.name ? ' has-error' : ''}`}>
            <label className="form-label" htmlFor="name">
              Nombre *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="form-control"
              maxLength={150}
              autoFocus
            />
            {fieldErrors.name && <span className="form-error">{fieldErrors.name}</span>}
          </div>

          <div className={`form-group${fieldErrors.sku ? ' has-error' : ''}`}>
            <label className="form-label" htmlFor="sku">
              SKU *
            </label>
            <input
              type="text"
              id="sku"
              name="sku"
              value={form.sku}
              onChange={handleChange}
              className="form-control"
              maxLength={50}
              placeholder="Ej: PROD-001"
            />
            {fieldErrors.sku && <span className="form-error">{fieldErrors.sku}</span>}
          </div>

          <div className={`form-group${fieldErrors.price ? ' has-error' : ''}`}>
            <label className="form-label" htmlFor="price">
              Precio *
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={form.price}
              onChange={handleChange}
              className="form-control"
              min="0"
              step="0.01"
              placeholder="0.00"
            />
            {fieldErrors.price && <span className="form-error">{fieldErrors.price}</span>}
          </div>

          <div className={`form-group${fieldErrors.stock ? ' has-error' : ''}`}>
            <label className="form-label" htmlFor="stock">
              Stock *
            </label>
            <input
              type="number"
              id="stock"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              className="form-control"
              min="0"
              step="1"
              placeholder="0"
            />
            {fieldErrors.stock && <span className="form-error">{fieldErrors.stock}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="category">
              Categoria
            </label>
            <input
              type="text"
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              className="form-control"
              maxLength={100}
              placeholder="Ej: Electronica"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="description">
            Descripcion
          </label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            className="form-control"
            rows={4}
            placeholder="Descripcion del producto (opcional)"
          />
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Guardando...' : isEdit ? 'Actualizar Producto' : 'Crear Producto'}
          </button>
          <Link to={isEdit ? `/products/${id}` : '/products'} className="btn btn-outline">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
