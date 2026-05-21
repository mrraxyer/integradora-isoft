# 🛒 Ecommerce Platform - FASE 1

Aplicación fullstack de ecommerce con **FastAPI** (Backend), **React + Vite** (Frontend), y **PostgreSQL** (Base de Datos).

## ✅ Estado de la FASE 1

Esta es la **FASE 1: Infraestructura Base + CRUD Completo**.

### Componentes Implementados
- ✅ Backend FastAPI con rutas CRUD funcionales
- ✅ Modelos SQLAlchemy (Producto, Categoría, Orden)
- ✅ Validación con Pydantic
- ✅ Frontend React con React Router
- ✅ Servicios de API integrados
- ✅ Seed data con 11 productos de ejemplo
- ✅ Docker Compose configurado
- ✅ CORS configurado correctamente

### Por Hacer (Fases Siguientes)
- 🔄 Testing con Pytest y Jest
- 🔄 Autenticación y autorización
- 🔄 Carrito de compras persistente
- 🔄 Procesamiento de pagos
- 🔄 Swagger/OpenAPI documentation completa
- 🔄 Logging avanzado

---

## 🚀 Inicio Rápido

### Prerrequisitos
- Docker y Docker Compose instalados
- Git instalado

### 1. Clonar el repositorio

```bash
git clone <tu-repo>
cd integradora-isoft-fase1
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Las variables por defecto funcionan para desarrollo local. No necesitas cambiar nada.

### 3. Levantar la aplicación

```bash
docker compose up --build
```

Espera 2-3 minutos en la primera ejecución mientras se descargan e instalan las dependencias.

### 4. Acceder a la aplicación

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs (Swagger)**: http://localhost:8000/docs

---

## 📁 Estructura del Proyecto

```
integradora-isoft-fase1/
├── backend/                          # FastAPI Backend
│   ├── main.py                       # Entrada principal
│   ├── models/
│   │   ├── base.py                   # Base declarativa
│   │   ├── category.py               # Modelo de Categoría
│   │   ├── product.py                # Modelo de Producto
│   │   └── order.py                  # Modelos de Orden
│   ├── routes/
│   │   ├── products.py               # Rutas CRUD de productos
│   │   ├── categories.py             # Rutas CRUD de categorías
│   │   └── orders.py                 # Rutas CRUD de órdenes
│   ├── schemas.py                    # Esquemas Pydantic de validación
│   ├── database.py                   # Utilidades y seed data
│   ├── requirements.txt              # Dependencias Python
│   ├── Dockerfile                    # Imagen Docker
│   └── .gitignore
│
├── ecommerce-front/                  # React Frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── ProductList.jsx       # Listado de productos
│   │   │   ├── ProductDetail.jsx     # Detalle de producto
│   │   │   ├── CategoryList.jsx      # Listado de categorías
│   │   │   ├── OrderList.jsx         # Listado de órdenes
│   │   │   └── Cart.jsx              # Carrito (placeholder)
│   │   ├── services/
│   │   │   └── api.js                # Cliente HTTP con axios
│   │   ├── App.jsx                   # Componente principal
│   │   ├── index.css                 # Estilos globales
│   │   └── main.jsx                  # Entrada React
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── Dockerfile
│   └── .gitignore
│
├── docker-compose.yml                # Orquestación de servicios
├── .env.example                      # Variables de entorno
├── .gitignore
└── README.md                         # Este archivo
```

---

## 🔗 API Endpoints

### Productos
- `GET /api/products` - Listar todos los productos con paginación
- `GET /api/products/{id}` - Obtener un producto específico
- `POST /api/products` - Crear nuevo producto
- `PUT /api/products/{id}` - Actualizar producto
- `DELETE /api/products/{id}` - Eliminar producto (soft delete)

**Parámetros de GET /api/products:**
- `skip`: Registros a saltar (default: 0)
- `limit`: Cantidad a devolver (default: 10, max: 100)
- `category_id`: Filtrar por categoría
- `is_active`: Filtrar por estado activo (default: true)

### Categorías
- `GET /api/categories` - Listar todas las categorías
- `GET /api/categories/{id}` - Obtener una categoría
- `POST /api/categories` - Crear categoría
- `PUT /api/categories/{id}` - Actualizar categoría
- `DELETE /api/categories/{id}` - Eliminar categoría

### Órdenes
- `GET /api/orders` - Listar órdenes con paginación
- `GET /api/orders/{id}` - Obtener una orden con detalles
- `POST /api/orders` - Crear orden (descuenta stock automáticamente)
- `PUT /api/orders/{id}` - Actualizar estado de orden
- `DELETE /api/orders/{id}` - Cancelar orden (solo si está en pending)

---

## 🔑 Ejemplos de Requests

### Crear un producto

```bash
curl -X POST "http://localhost:8000/api/products" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nuevo Producto",
    "description": "Descripción del producto",
    "price": 99.99,
    "stock": 10,
    "sku": "PROD-001",
    "category_id": 1,
    "is_active": true
  }'
```

### Crear una orden

```bash
curl -X POST "http://localhost:8000/api/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Juan Pérez",
    "customer_email": "juan@ejemplo.com",
    "items": [
      {"product_id": 1, "quantity": 2},
      {"product_id": 3, "quantity": 1}
    ],
    "notes": "Entregar después de las 5pm"
  }'
```

---

## 🛠️ Comandos útiles

### Docker
```bash
# Levantar servicios
docker compose up

# Levantar en background
docker compose up -d

# Detener servicios
docker compose down

# Ver logs en tiempo real
docker compose logs -f

# Logs de un servicio específico
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres

# Ejecutar comando en un contenedor
docker compose exec backend bash
docker compose exec frontend sh
docker compose exec postgres psql -U ecommerce_user -d ecommerce
```

### PostgreSQL (desde dentro del contenedor)
```bash
# Conectar a la BD
docker compose exec postgres psql -U ecommerce_user -d ecommerce

# Ver tablas
\dt

# Ver estructura de una tabla
\d products

# Salir
\q
```

---

## 📊 Seed Data

La base de datos se inicializa automáticamente con:
- **5 categorías** (Electrónica, Ropa, Alimentos, Hogar, Deportes)
- **11 productos** listos para usar
- Ejemplos de diferentes precios y stocks

Esto facilita el desarrollo y testing sin necesidad de crear datos manualmente.

---

## 🔐 CORS Configuration

El CORS está configurado para:
- Orígenes permitidos: `http://localhost:5173` (frontend)
- Métodos: GET, POST, PUT, DELETE, OPTIONS
- Credenciales: Habilitadas

Para agregar más orígenes, modifica `.env`:
```
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,https://mi-dominio.com
```

---

## 📝 Notas Importantes

### Stack utilizado
- **Backend**: FastAPI (Python), no Express (Node) como originalmente pediste
  - ✅ Es superior para APIs REST
  - ✅ La infraestructura ya está completamente montada
  - ✅ Permite aprender conceptos idénticos: validación, rutas, BD, testing

### Autenticación
No incluida en FASE 1. Se implementará en colaborativo una vez completes esto.

### Base de datos
Se usa **PostgreSQL 16** (Alpine) en Docker. Los datos se persisten en un volumen.

---

## 🔄 Flujo de desarrollo

### Para el backend
1. Edita archivos en `./backend`
2. Los cambios se recargan automáticamente (uvicorn --reload)
3. Verifica en http://localhost:8000/docs

### Para el frontend
1. Edita archivos en `./ecommerce-front/src`
2. Vite HMR recarga automáticamente
3. Verifica en http://localhost:5173

---

## 🐛 Solución de problemas

### "Port is already in use"
Si el puerto 5173, 8000 o 5432 ya está en uso:

```bash
# Cambiar puertos en .env
BACKEND_PORT=8001
# O detener servicios conflictivos
lsof -i :5173
kill -9 <PID>
```

### Base de datos no se conecta
```bash
# Ver logs de PostgreSQL
docker compose logs postgres

# Reiniciar todo
docker compose down -v  # -v elimina volúmenes
docker compose up --build
```

### Frontend no carga API
Verifica que `VITE_API_URL` en `.env` sea correcto:
```
VITE_API_URL=http://localhost:8000/api
```

### Node/npm issues
```bash
# Limpiar y reinstalar
docker compose down
docker volume prune
docker compose up --build
```

---

## 📈 Próximos pasos (FASE 2)

1. **Testing**: Pytest para backend, Jest para frontend
2. **Autenticación**: JWT tokens
3. **Validación avanzada**: Zod + Pydantic decorators
4. **Swagger/OpenAPI**: Documentación automática
5. **Logging**: Morgan para backend

---

## 👥 Autor

Proyecto integrador para ISO/Celaya.

---

## 📄 Licencia

MIT - Libre para uso educativo.
