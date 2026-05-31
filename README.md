# Ecommerce Platform

Aplicación fullstack de ecommerce con Express.js (Backend), React + Vite (Frontend), y PostgreSQL (Base de Datos).

## Componentes Implementados

- Backend Express.js con rutas CRUD funcionales
- Modelos Sequelize (Producto, Categoría, Orden, Usuario, CartItem)
- Validación con express-validator y Zod
- Swagger/OpenAPI documentation automática
- Frontend React con React Router
- Servicios de API integrados
- Seed data con productos de ejemplo
- Docker Compose configurado
- CORS configurado correctamente
- Tests con Jest y Vitest
- Autenticación JWT completa
  - Registro y login con bcrypt
  - Rutas protegidas POST/PUT/DELETE
  - Tokens con expiración (7 días default)
- Carrito de compras persistente en BD
  - Tabla CartItem con userId/productId/quantity
  - Validación de stock
  - GET/POST/PUT/DELETE de items
- RBAC (Role-Based Access Control)
  - Roles: admin, user
  - Admin seed desde variables de entorno
  - Protección de rutas y endpoints
  - Filtros específicos por rol
- Búsqueda y filtros de productos
  - Búsqueda por nombre/descripción
  - Filtros por categoría, disponibilidad
  - Paginación completa

---

## Inicio Rápido

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

## Estructura del Proyecto

```
integradora-isoft/
├── backend/                          # Express.js Backend
│   ├── src/
│   │   ├── models/
│   │   │   ├── Product.js
│   │   │   ├── Category.js
│   │   │   ├── Order.js
│   │   │   ├── User.js               # Modelo con roles (admin/user)
│   │   │   └── CartItem.js
│   │   ├── routes/
│   │   │   ├── products.js           # Protegidas: POST/PUT/DELETE requieren admin
│   │   │   ├── categories.js         # Protegidas: POST/PUT/DELETE requieren admin
│   │   │   ├── orders.js             # Filtros por rol, usuarios ven sus órdenes
│   │   │   ├── auth.js               # Registro/login, devuelve rol en token
│   │   │   └── cart.js               # Solo usuario propietario del carrito
│   │   ├── middleware/
│   │   │   ├── auth.js               # verifyToken, requireAdmin
│   │   │   └── validate.js
│   │   ├── config/
│   │   │   ├── db.js                 # Asociaciones Order-User
│   │   │   └── swagger.js
│   │   ├── utils/
│   │   │   └── formatters.js
│   │   ├── app.js                    # Lee .env desde ../../.env (raíz)
│   │   ├── server.js
│   │   └── seed.js                   # Admin seed desde env
│   ├── package.json
│   ├── Dockerfile
│   └── .gitignore
│
├── ecommerce-front/                  # React + Vite Frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── ProductList.jsx       # Búsqueda, filtros, botones solo admin
│   │   │   ├── ProductDetail.jsx
│   │   │   ├── CategoryList.jsx      # Solo admin ve esta página
│   │   │   ├── OrderList.jsx         # Filtros solo admin
│   │   │   └── Cart.jsx              # Datos usuario precargados
│   │   ├── context/
│   │   │   ├── AuthContext.jsx       # user.role disponible
│   │   │   └── CartContext.jsx
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx    # adminOnly prop para rutas admin
│   │   ├── services/
│   │   │   └── api.js                # URLs desde VITE_API_URL
│   │   ├── App.jsx                   # Rutas protegidas por rol
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── Dockerfile
│   └── .gitignore
│
├── docker-compose.yml
├── .env                              # Variables centralizadas (root)
├── .env.example
├── .gitignore
└── README.md
```

Variables de entorno centralizadas en raíz (.env):
- JWT_SECRET, JWT_EXPIRES_IN
- DATABASE_URL, NODE_ENV, PORT
- CLIENT_ORIGIN (CORS)
- ADMIN_EMAIL, ADMIN_NAME, ADMIN_PASSWORD
- VITE_API_URL, VITE_APP_NAME

---

## API Endpoints

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

## Ejemplos de Requests

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

## Comandos útiles

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

## Seed Data

La base de datos se inicializa automáticamente con:
- Categorías de ejemplo
- Productos listos para usar
- Admin seed desde variables de entorno

---

## Autenticación JWT

Variables de entorno:
```
JWT_SECRET=tu-secret-key (default: dev_secret)
JWT_EXPIRES_IN=7d
```

Admin Seed:
```
ADMIN_EMAIL=admin@ecommerce.local
ADMIN_NAME=Administrator
ADMIN_PASSWORD=admin123456
```

Se crea automáticamente en startup si las variables están configuradas.

Rutas protegidas:
- Todas las mutaciones (POST, PUT, DELETE) en productos, categorías, órdenes
- Todas las operaciones en carrito
- GET /api/auth/me

Rutas públicas:
- GET /api/products
- GET /api/products/:id
- GET /api/categories
- POST /api/auth/register
- POST /api/auth/login

---

## CORS Configuration

El CORS está configurado para:
- Orígenes permitidos: http://localhost:5173 (frontend)
- Métodos: GET, POST, PUT, DELETE

Para agregar más orígenes, modifica `.env`:
```
CLIENT_ORIGIN=http://localhost:5173,http://localhost:3000,https://mi-dominio.com
```

---

## Desarrollo

Backend:
1. Edita archivos en `./backend/src`
2. Los cambios se recargan automáticamente (nodemon)
3. Verifica en http://localhost:3000/api-docs

Frontend:
1. Edita archivos en `./ecommerce-front/src`
2. Vite HMR recarga automáticamente
3. Verifica en http://localhost:5173
