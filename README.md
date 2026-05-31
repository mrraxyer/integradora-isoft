# 🛒 Ecommerce Platform

Aplicación fullstack de ecommerce con **Express.js** (Backend), **React + Vite** (Frontend), y **PostgreSQL** (Base de Datos).

## ✅ Componentes Implementados

- ✅ Backend Express.js con rutas CRUD funcionales
- ✅ Modelos Sequelize (Producto, Categoría, Orden, Usuario, CartItem)
- ✅ Validación con express-validator y Zod
- ✅ Swagger/OpenAPI documentation automática
- ✅ Frontend React con React Router
- ✅ Servicios de API integrados
- ✅ Seed data con 6 productos de ejemplo
- ✅ Docker Compose configurado
- ✅ CORS configurado correctamente
- ✅ Tests con Jest y Vitest
- ✅ **Autenticación JWT completa**
  - Registro y login con bcrypt
  - Rutas protegidas POST/PUT/DELETE
  - Tokens con expiración (7 días default)
- ✅ **Carrito de compras persistente en BD**
  - Tabla CartItem con userId/productId/quantity
  - Validación de stock
  - GET/POST/PUT/DELETE de items

### Por Implementar
- 🔄 Procesamiento de pagos
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
- **Backend API**: http://localhost:3000
- **API Docs (Swagger)**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health

---

## 📁 Estructura del Proyecto

```
integradora-isoft/
├── backend/                          # Express.js Backend
│   ├── src/
│   │   ├── models/
│   │   │   ├── Product.js            # Modelo de Producto
│   │   │   ├── Category.js           # Modelo de Categoría
│   │   │   ├── Order.js              # Modelo de Orden
│   │   │   ├── User.js               # Modelo de Usuario
│   │   │   └── CartItem.js           # Modelo de Item del Carrito
│   │   ├── routes/
│   │   │   ├── products.js           # Rutas CRUD de productos (protegidas)
│   │   │   ├── categories.js         # Rutas CRUD de categorías (protegidas)
│   │   │   ├── orders.js             # Rutas CRUD de órdenes (protegidas)
│   │   │   ├── auth.js               # Rutas de autenticación
│   │   │   └── cart.js               # Rutas del carrito (protegidas)
│   │   ├── middleware/
│   │   │   ├── auth.js               # Middleware de JWT
│   │   │   └── validate.js           # Middleware de validación
│   │   ├── config/
│   │   │   ├── db.js                 # Configuración de BD
│   │   │   └── swagger.js            # Configuración Swagger
│   │   ├── utils/
│   │   │   └── formatters.js         # Formateadores de datos
│   │   ├── app.js                    # Configuración Express
│   │   ├── server.js                 # Entrada principal
│   │   ├── seed.js                   # Seed data
│   │   └── tests/
│   ├── package.json
│   ├── .env.example
│   ├── Dockerfile
│   └── .gitignore
│
├── ecommerce-front/                  # React + Vite Frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── ProductList.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   ├── CategoryList.jsx
│   │   │   ├── OrderList.jsx
│   │   │   └── Cart.jsx
│   │   ├── context/
│   │   │   └── CartContext.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── __tests__/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── Dockerfile
│   └── .gitignore
│
├── docker-compose.yml
├── .env.example
├── .env
├── .gitignore
└── README.md
```

---

## 🔗 API Endpoints

### Productos
- `GET /api/products` - Listar todos los productos con paginación
- `GET /api/products/{id}` - Obtener un producto específico
- `POST /api/products` - Crear nuevo producto
- `PUT /api/products/{id}` - Actualizar producto
- `DELETE /api/products/{id}` - Eliminar producto

**Parámetros de GET /api/products:**
- `page`: Número de página (default: 1)
- `limit`: Cantidad a devolver (default: 20, max: 100)
- `category`: Filtrar por nombre de categoría
- `available`: Filtrar por disponibilidad (true/false)

### Categorías
- `GET /api/categories` - Listar todas las categorías
- `GET /api/categories/{id}` - Obtener una categoría
- `POST /api/categories` - Crear categoría
- `PUT /api/categories/{id}` - Actualizar categoría
- `DELETE /api/categories/{id}` - Eliminar categoría

### Órdenes
- `GET /api/orders` - Listar órdenes con paginación
- `GET /api/orders/{id}` - Obtener una orden con detalles
- `POST /api/orders` - Crear orden
- `PUT /api/orders/{id}` - Actualizar estado de orden
- `DELETE /api/orders/{id}` - Cancelar orden

### Autenticación
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener datos del usuario actual (requiere JWT)

### Carrito de Compras
- `GET /api/cart` - Listar items del carrito (requiere JWT)
- `POST /api/cart` - Agregar producto al carrito (requiere JWT)
- `PUT /api/cart/{id}` - Actualizar cantidad de item (requiere JWT)
- `DELETE /api/cart/{id}` - Eliminar item del carrito (requiere JWT)
- `DELETE /api/cart/clear/all` - Vaciar carrito completo (requiere JWT)

---

## 🔑 Ejemplos de Requests

### Crear un producto

```bash
curl -X POST "http://localhost:3000/api/products" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop Gaming",
    "description": "Laptop para gaming de alta gama",
    "price": 1499.99,
    "stock": 5,
    "sku": "GAMING-001"
  }'
```

### Listar productos con paginación

```bash
curl "http://localhost:3000/api/products?page=1&limit=10&category=Electrónica"
```

### Crear una orden

```bash
curl -X POST "http://localhost:3000/api/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "total_amount": 100.00,
    "items": [
      {"product_id": 1, "quantity": 2}
    ]
  }'
```

### Registrar usuario

```bash
curl -X POST "http://localhost:3000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "password": "password123"
  }'
```

Respuesta incluye `token` — guardarlo para autenticar requests.

### Iniciar sesión

```bash
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@ejemplo.com",
    "password": "password123"
  }'
```

### Agregar producto al carrito

```bash
curl -X POST "http://localhost:3000/api/cart" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "productId": 1,
    "quantity": 2
  }'
```

### Ver carrito

```bash
curl -X GET "http://localhost:3000/api/cart" \
  -H "Authorization: Bearer <TOKEN>"
```

### Actualizar cantidad en carrito

```bash
curl -X PUT "http://localhost:3000/api/cart/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "quantity": 5
  }'
```

### Eliminar producto del carrito

```bash
curl -X DELETE "http://localhost:3000/api/cart/1" \
  -H "Authorization: Bearer <TOKEN>"
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

## 🔐 Autenticación JWT

### Cómo funciona:
1. Usuario se registra/login → obtiene token JWT
2. Token contiene: id, email, name, role, expiración (7 días)
3. Frontend almacena token en localStorage
4. Para requests autenticadas: `Authorization: Bearer <token>`
5. Middleware verifyToken valida token antes de procesar

### Rutas protegidas:
- Todas las mutaciones (POST, PUT, DELETE) en productos, categorías, órdenes
- Todas las operaciones en carrito
- GET /api/auth/me

### Rutas públicas:
- GET /api/products (listado)
- GET /api/products/:id (detalle)
- GET /api/categories
- POST /api/auth/register
- POST /api/auth/login

### Variables de entorno:
```
JWT_SECRET=tu-secret-key (default: dev_secret)
JWT_EXPIRES_IN=7d
```

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
- **Backend**: Express.js + Sequelize (Node.js)
  - ✅ Framework web más popular
  - ✅ ORM con Sequelize para PostgreSQL
  - ✅ Swagger automático con swagger-jsdoc
  - ✅ Validación con express-validator + Zod

- **Frontend**: React + Vite + React Router
  - ✅ Desarrollo rápido con HMR
  - ✅ Testing con Vitest + Supertest
  - ✅ Gestión de estado con Context API

- **Base de datos**: PostgreSQL 16 en Docker
  - ✅ Datos persistentes en volúmenes
  - ✅ Auto-sincronización con Sequelize
  - ✅ Seed data automático al iniciar

### Autenticación
Rutas de registro y login implementadas en `/api/auth/`. JWT tokens en headers.

---

## 🔄 Próximos pasos (Implementación)

### Para el backend
1. Edita archivos en `./backend/src`
2. Los cambios se recargan automáticamente (nodemon)
3. Verifica en http://localhost:3000/api-docs

### Para el frontend
1. Edita archivos en `./ecommerce-front/src`
2. Vite HMR recarga automáticamente
3. Verifica en http://localhost:5173

---

## 🐛 Solución de problemas

### "Port is already in use"
Si el puerto 5173, 3000 o 5432 ya está en uso:

```bash
# Cambiar puertos en .env
BACKEND_PORT=3001
POSTGRES_PORT=5433
# O detener servicios conflictivos
lsof -i :3000
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
VITE_API_URL=http://localhost:3000/api
```

### Error: "DATABASE_URL undefined"
Backend no encuentra variable de entorno. Asegúrate que `.env` exista en raíz del proyecto:
```bash
cp .env.example .env
# Edita .env si es necesario
```

### Node/npm issues
```bash
# Limpiar y reinstalar
docker compose down
docker volume prune
docker compose up --build
```

---

## 📈 Próximos pasos

1. **Testing**: Cobertura completa con Jest + Supertest (backend y frontend)
2. **Pagos**: Integración con Stripe/Mercado Pago
3. **Admin panel**: Dashboard para gestión de productos y órdenes
4. **Notificaciones**: Email de confirmación de órdenes
5. **Búsqueda avanzada**: Filtros full-text y búsqueda por categoría
6. **Órdenes desde carrito**: Checkout que transfiere items a Order
7. **Reviews/Ratings**: Sistema de reseñas de productos

---

## 👥 Autor

Proyecto integrador para ISO/Celaya.

---

## 📄 Licencia

MIT - Libre para uso educativo.
