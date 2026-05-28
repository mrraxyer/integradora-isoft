from sqlalchemy.orm import Session
from models.category import Category
from models.product import Product
import logging

logger = logging.getLogger(__name__)

def get_db():
    """Dependency to get database session."""
    # This will be overridden in main.py
    pass

def init_db(SessionLocal):
    """Initialize database with seed data."""
    db = SessionLocal()
    
    try:
        # Check if data already exists
        if db.query(Category).first() is not None:
            logger.info("Database already initialized with data")
            return
        
        # Create categories
        categories_data = [
            {"name": "Electrónica", "description": "Productos electrónicos"},
            {"name": "Ropa", "description": "Prendas de vestir"},
            {"name": "Alimentos", "description": "Productos alimenticios"},
            {"name": "Hogar", "description": "Artículos para el hogar"},
            {"name": "Deportes", "description": "Artículos deportivos"},
        ]
        
        categories = []
        for cat_data in categories_data:
            category = Category(**cat_data)
            db.add(category)
            categories.append(category)
        
        db.commit()
        
        # Create products
        products_data = [
            # Electrónica
            {
                "name": "Laptop HP 15",
                "description": "Laptop HP 15 pulgadas, 8GB RAM, 256GB SSD",
                "price": 599.99,
                "stock": 5,
                "sku": "LAPTOP-HP-15",
                "category_id": categories[0].id,
                "is_active": True
            },
            {
                "name": "Mouse Logitech",
                "description": "Mouse inalámbrico Logitech",
                "price": 29.99,
                "stock": 50,
                "sku": "MOUSE-LOG-001",
                "category_id": categories[0].id,
                "is_active": True
            },
            {
                "name": "Teclado Mecánico",
                "description": "Teclado mecánico RGB 104 teclas",
                "price": 89.99,
                "stock": 15,
                "sku": "KEYBOARD-RGB-104",
                "category_id": categories[0].id,
                "is_active": True
            },
            # Ropa
            {
                "name": "Camiseta Básica",
                "description": "Camiseta de algodón 100%",
                "price": 19.99,
                "stock": 100,
                "sku": "SHIRT-BASIC-001",
                "category_id": categories[1].id,
                "is_active": True
            },
            {
                "name": "Jeans Azul",
                "description": "Jeans azul oscuro talla estándar",
                "price": 49.99,
                "stock": 45,
                "sku": "JEANS-BLUE-001",
                "category_id": categories[1].id,
                "is_active": True
            },
            # Alimentos
            {
                "name": "Café Premium",
                "description": "Café gourmet molido 500g",
                "price": 12.99,
                "stock": 75,
                "sku": "COFFEE-PREM-500",
                "category_id": categories[2].id,
                "is_active": True
            },
            {
                "name": "Chocolate Belga",
                "description": "Chocolate belga 70% cacao 200g",
                "price": 8.99,
                "stock": 120,
                "sku": "CHOCO-BELG-200",
                "category_id": categories[2].id,
                "is_active": True
            },
            # Hogar
            {
                "name": "Lámpara LED",
                "description": "Lámpara LED regulable 10W",
                "price": 24.99,
                "stock": 30,
                "sku": "LAMP-LED-10W",
                "category_id": categories[3].id,
                "is_active": True
            },
            {
                "name": "Almohada Confort",
                "description": "Almohada de espuma viscoelástica",
                "price": 34.99,
                "stock": 40,
                "sku": "PILLOW-VISC-STD",
                "category_id": categories[3].id,
                "is_active": True
            },
            # Deportes
            {
                "name": "Botella Deportiva",
                "description": "Botella de agua reutilizable 1L",
                "price": 14.99,
                "stock": 60,
                "sku": "BOTTLE-RUS-1L",
                "category_id": categories[4].id,
                "is_active": True
            },
            {
                "name": "Cuerda para Saltar",
                "description": "Cuerda de saltar ajustable",
                "price": 9.99,
                "stock": 85,
                "sku": "ROPE-JUMP-ADJ",
                "category_id": categories[4].id,
                "is_active": True
            },
        ]
        
        for prod_data in products_data:
            product = Product(**prod_data)
            db.add(product)
        
        db.commit()
        logger.info(f"Successfully created {len(categories)} categories and {len(products_data)} products")
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error initializing database: {e}")
        raise
    finally:
        db.close()
