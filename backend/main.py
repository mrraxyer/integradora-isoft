import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import logging

from models.base import Base
from models.product import Product
from models.category import Category
from models.order import Order, OrderItem
from routes import products, categories, orders
from database import init_db

# Logging configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://ecommerce_user:ecommerce_pass@postgres:5432/ecommerce")
engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
Base.metadata.create_all(bind=engine)

# FastAPI app
app = FastAPI(
    title="Ecommerce API",
    version="1.0.0",
    description="API REST para gestión de ecommerce - Productos, Categorías y Órdenes"
)

# CORS configuration
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Dependency for database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides = {}

# Health check
@app.get("/")
def read_root():
    return {
        "status": "API is running",
        "version": "1.0.0",
        "endpoints": {
            "products": "/api/products",
            "categories": "/api/categories",
            "orders": "/api/orders",
            "docs": "/docs"
        }
    }

@app.get("/health")
def health_check():
    return {"status": "ok"}

# Initialize database with seed data
@app.on_event("startup")
async def startup_event():
    logger.info("Initializing database...")
    init_db(SessionLocal)
    logger.info("Database initialized successfully")

# Include routers
app.include_router(products.router, prefix="/api/products", tags=["products"])
app.include_router(categories.router, prefix="/api/categories", tags=["categories"])
app.include_router(orders.router, prefix="/api/orders", tags=["orders"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
