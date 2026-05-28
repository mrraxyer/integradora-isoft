from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List

from models.order import Order, OrderItem, OrderStatus
from models.product import Product
from schemas import OrderResponse, OrderListResponse, OrderCreate, OrderUpdate
from database import get_db

router = APIRouter()

def calculate_order_total(db: Session, order_id: int) -> float:
    """Calculate total amount for an order."""
    items = db.query(OrderItem).filter(OrderItem.order_id == order_id).all()
    return sum(item.subtotal for item in items)

@router.get("", response_model=List[OrderListResponse])
def list_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    status: str = Query(None),
    db: Session = Depends(get_db)
):
    """
    List all orders with pagination and filtering.
    
    - **skip**: Number of records to skip (default: 0)
    - **limit**: Number of records to return (default: 10, max: 100)
    - **status**: Filter by order status (pending, processing, shipped, delivered, cancelled)
    """
    query = db.query(Order)
    
    if status:
        try:
            order_status = OrderStatus(status)
            query = query.filter(Order.status == order_status)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {[s.value for s in OrderStatus]}")
    
    orders = query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()
    return orders

@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    """Get a specific order by ID."""
    order = db.query(Order).filter(Order.id == order_id).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return order

@router.post("", response_model=OrderResponse, status_code=201)
def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    """
    Create a new order with items.
    
    - **customer_name**: Customer full name
    - **customer_email**: Customer email
    - **items**: List of products to order
    - **notes**: Optional order notes
    """
    
    # Verify products and calculate total
    total_amount = 0.0
    order_items_data = []
    
    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        
        if not product.is_active:
            raise HTTPException(status_code=400, detail=f"Product {product.name} is not available")
        
        if product.stock < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Product {product.name} has insufficient stock. Available: {product.stock}"
            )
        
        subtotal = product.price * item.quantity
        total_amount += subtotal
        
        order_items_data.append({
            "product": product,
            "quantity": item.quantity,
            "unit_price": product.price,
            "subtotal": subtotal
        })
    
    # Create order
    db_order = Order(
        customer_name=order.customer_name,
        customer_email=order.customer_email,
        notes=order.notes,
        total_amount=total_amount,
        status=OrderStatus.PENDING
    )
    db.add(db_order)
    db.flush()  # Get the order ID without committing
    
    # Create order items and reduce product stock
    for item_data in order_items_data:
        db_order_item = OrderItem(
            order_id=db_order.id,
            product_id=item_data["product"].id,
            quantity=item_data["quantity"],
            unit_price=item_data["unit_price"],
            subtotal=item_data["subtotal"]
        )
        db.add(db_order_item)
        
        # Reduce stock
        item_data["product"].stock -= item_data["quantity"]
        db.add(item_data["product"])
    
    db.commit()
    db.refresh(db_order)
    
    return db_order

@router.put("/{order_id}", response_model=OrderResponse)
def update_order(
    order_id: int,
    order_update: OrderUpdate,
    db: Session = Depends(get_db)
):
    """Update order status or notes."""
    db_order = db.query(Order).filter(Order.id == order_id).first()
    
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Validate status if provided
    if order_update.status:
        try:
            new_status = OrderStatus(order_update.status)
            db_order.status = new_status
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status. Must be one of: {[s.value for s in OrderStatus]}"
            )
    
    if order_update.notes:
        db_order.notes = order_update.notes
    
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    
    return db_order

@router.delete("/{order_id}", status_code=204)
def cancel_order(order_id: int, db: Session = Depends(get_db)):
    """Cancel an order (only if pending)."""
    db_order = db.query(Order).filter(Order.id == order_id).first()
    
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if db_order.status != OrderStatus.PENDING:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot cancel order with status: {db_order.status.value}"
        )
    
    # Restore product stock
    for item in db_order.items:
        item.product.stock += item.quantity
        db.add(item.product)
    
    db_order.status = OrderStatus.CANCELLED
    db.add(db_order)
    db.commit()
    
    return None
