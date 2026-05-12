# Ecommerce Platform

Aplicación de ecommerce fullstack con React (Vite) en frontend, FastAPI en backend, y PostgreSQL como base de datos.

## Requisitos

- Docker
- Docker Compose

## Instalación y Ejecución

### 1. Configurar variables de entorno

Copia el archivo `.env.example` a `.env`:

```bash
cp .env.example .env
```

Edita `.env` con tus valores si es necesario (los valores por defecto funcionan para desarrollo local).

### 2. Construir y levantar contenedores

```bash
docker compose up --build
```

Este comando:
- Construye las imágenes del backend y frontend
- Levanta PostgreSQL, FastAPI y React/Vite
- Inicia los servicios en modo desarrollo

**Espera a que todos los servicios estén listos** (pueden tardar 2-3 minutos en la primera ejecución).

### 3. Acceder a la aplicación

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Database**: localhost:5432

## Comandos útiles

### Levantar servicios (sin reconstruir)
```bash
docker compose up
```

### Detener servicios
```bash
docker compose down
```

### Detener y limpiar volúmenes (elimina la base de datos)
```bash
docker compose down -v
```

### Ver logs de un servicio específico
```bash
docker compose logs backend      # Logs del backend
docker compose logs frontend     # Logs del frontend
docker compose logs postgres     # Logs de la base de datos
```

### Ver logs en tiempo real
```bash
docker compose logs -f
```

### Ejecutar comando en un contenedor
```bash
docker compose exec backend bash     # Shell en backend
docker compose exec frontend sh      # Shell en frontend
docker compose exec postgres psql -U ecommerce_user -d ecommerce  # CLI de PostgreSQL
```

## Estructura del Proyecto

```
integradora-isoft/
├── backend/              # FastAPI (Python)
│   ├── main.py          # Punto de entrada
│   ├── requirements.txt  # Dependencias Python
│   └── Dockerfile       # Imagen del backend
├── ecommerce-front/      # React + Vite (JavaScript)
│   ├── src/
│   ├── package.json
│   └── Dockerfile       # Imagen del frontend
├── docker-compose.yml   # Configuración de servicios
├── .env.example         # Variables de entorno (ejemplo)
└── README.md           # Este archivo
```

## Servicios

### PostgreSQL (Base de Datos)
- **Puerto**: 5432
- **Usuario**: ecommerce_user
- **Contraseña**: ecommerce_pass
- **Base de datos**: ecommerce
- **Volumen**: postgres_data (persiste datos)

### Backend (FastAPI)
- **Puerto**: 8000
- **URL**: http://localhost:8000
- **Docs API**: http://localhost:8000/docs
- **Auto-reload**: Habilitado en desarrollo

### Frontend (React + Vite)
- **Puerto**: 5173
- **URL**: http://localhost:5173
- **Hot Module Replacement**: Habilitado

## Solución de problemas

### Error: "Port is already in use"
Si el puerto ya está en uso, puedes cambiar el puerto en `.env`:
```
BACKEND_PORT=8001
```

### Base de datos no se conecta
Verifica que PostgreSQL esté listo:
```bash
docker compose logs postgres
```

Espera a que veas `database system is ready to accept connections`.

### Node version mismatch en construcción
Si hay error de versión de Node, asegúrate de que el Dockerfile del frontend usa `node:22-alpine` o superior.

### Problemas de permisos en Linux
```bash
sudo chmod 666 /var/run/docker.sock
```

## Desarrollo

Para modificar el código:
- **Backend**: Los cambios en `./backend` se recargan automáticamente (uvicorn reload)
- **Frontend**: Los cambios en `./ecommerce-front/src` se actualizan en vivo (HMR)

No necesitas reconstruir las imágenes durante desarrollo, solo después de cambiar dependencias (`package.json`, `requirements.txt`).

## Variables de Entorno

Véase `.env.example` para la lista completa. Las principales son:

| Variable          | Descripción                      | Defecto                                                            |
| ----------------- | -------------------------------- | ------------------------------------------------------------------ |
| `DATABASE_URL`    | URL de conexión a PostgreSQL     | postgresql://ecommerce_user:ecommerce_pass@postgres:5432/ecommerce |
| `DEBUG`           | Modo debug en FastAPI            | True                                                               |
| `BACKEND_PORT`    | Puerto del API                   | 8000                                                               |
| `VITE_API_URL`    | URL del backend para el frontend | http://localhost:8000                                              |
| `ALLOWED_ORIGINS` | CORS origins permitidos          | http://localhost:5173,http://localhost:3000                        |

## Producción

Para desplegar a producción:
1. Cambia `DEBUG=False` en `.env`
2. Genera una `SECRET_KEY` segura
3. Configura `ALLOWED_ORIGINS` con tus dominios reales
4. Usa un servidor production-ready en lugar de Vite dev server
5. Configura HTTPS/SSL