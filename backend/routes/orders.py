from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas import OrderResponse, OrderCreate, OrderUpdate, OrderStatusEnum
from services import OrderService
from routes.auth import require_merchant, require_customer, get_current_user
from typing import List

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    order: OrderCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    
    role = current_user.get("role")
    if role == "customer":
        customer_auth_id = current_user.get("user_id")
        return OrderService.create_order(db, order, customer_auth_id)
    elif role == "merchant":
        return OrderService.create_order(db, order, None)
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Role not authorized to create orders"
        )


@router.get("/", response_model=List[OrderResponse])
def list_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_merchant)
):
    
    return OrderService.get_orders(db, skip, limit)


@router.get("/my", response_model=List[OrderResponse])
def list_my_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_customer)
):
    
    customer_auth_id = current_user.get("user_id")
    return OrderService.get_orders_for_customer(db, customer_auth_id, skip, limit)


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_merchant)
):
    
    return OrderService.get_order(db, order_id)


@router.put("/{order_id}", response_model=OrderResponse)
def update_order_status(
    order_id: int,
    status_update: OrderUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_merchant)
):
    
    if status_update.status:
        return OrderService.update_order_status(db, order_id, status_update.status)
    return OrderService.get_order(db, order_id)


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_merchant)
):
    
    OrderService.delete_order(db, order_id)

