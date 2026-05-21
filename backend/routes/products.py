from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List

from models.product import Product
from models.category import Category
from schemas import ProductResponse, ProductCreate, ProductUpdate
from database import get_db

router = APIRouter()

@router.get("", response_model=List[ProductResponse])
def list_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    category_id: int = Query(None),
    is_active: bool = Query(True),
    db: Session = Depends(get_db)
):
    """
    List all products with pagination and filtering.
    
    - **skip**: Number of records to skip (default: 0)
    - **limit**: Number of records to return (default: 10, max: 100)
    - **category_id**: Filter by category ID
    - **is_active**: Filter by active status (default: true)
    """
    query = db.query(Product)
    
    if category_id:
        query = query.filter(Product.category_id == category_id)
    
    query = query.filter(Product.is_active == is_active)
    
    products = query.offset(skip).limit(limit).all()
    return products

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get a specific product by ID."""
    product = db.query(Product).filter(Product.id == product_id).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return product

@router.post("", response_model=ProductResponse, status_code=201)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    """
    Create a new product.
    
    - **name**: Product name (3-255 chars)
    - **price**: Product price (must be > 0)
    - **stock**: Available quantity (default: 0)
    - **sku**: Unique SKU code
    - **category_id**: Category ID
    """
    # Verify category exists
    category = db.query(Category).filter(Category.id == product.category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Check for duplicate SKU
    existing = db.query(Product).filter(Product.sku == product.sku).first()
    if existing:
        raise HTTPException(status_code=400, detail="SKU already exists")
    
    db_product = Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    
    return db_product

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product_update: ProductUpdate,
    db: Session = Depends(get_db)
):
    """Update a product."""
    db_product = db.query(Product).filter(Product.id == product_id).first()
    
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Verify category if being updated
    if product_update.category_id:
        category = db.query(Category).filter(Category.id == product_update.category_id).first()
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
    
    # Check for duplicate SKU if being updated
    if product_update.sku and product_update.sku != db_product.sku:
        existing = db.query(Product).filter(Product.sku == product_update.sku).first()
        if existing:
            raise HTTPException(status_code=400, detail="SKU already exists")
    
    update_data = product_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_product, field, value)
    
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    
    return db_product

@router.delete("/{product_id}", status_code=204)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    """Delete a product (soft delete via is_active=false)."""
    db_product = db.query(Product).filter(Product.id == product_id).first()
    
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Soft delete
    db_product.is_active = False
    db.add(db_product)
    db.commit()
    
    return None
