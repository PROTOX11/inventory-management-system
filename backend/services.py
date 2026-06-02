from sqlalchemy.orm import Session
from sqlalchemy import func
from models import Product, Customer, CustomerAuth, Merchant, Order, OrderItem, OrderStatus
from schemas import (
    ProductCreate, ProductUpdate, CustomerCreate, CustomerUpdate,
    OrderCreate, OrderStatusEnum, MerchantRegister, CustomerRegister, LoginRequest
)
from fastapi import HTTPException, status
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )



class AuthService:
    @staticmethod
    def register_merchant(db: Session, data: MerchantRegister) -> Merchant:
        
        existing = db.query(Merchant).filter(Merchant.email == data.email).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Merchant with email '{data.email}' already exists"
            )
        merchant = Merchant(
            name=data.name,
            email=data.email,
            hashed_password=get_password_hash(data.password),
        )
        db.add(merchant)
        db.commit()
        db.refresh(merchant)
        return merchant

    @staticmethod
    def login_merchant(db: Session, data: LoginRequest) -> dict:
        
        merchant = db.query(Merchant).filter(Merchant.email == data.email).first()
        if not merchant or not verify_password(data.password, merchant.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
        token = create_access_token({
            "sub": merchant.email,
            "role": "merchant",
            "user_id": merchant.id,
        })
        return {
            "access_token": token,
            "token_type": "bearer",
            "role": "merchant",
            "user_id": merchant.id,
            "name": merchant.name,
            "email": merchant.email,
        }

    @staticmethod
    def register_customer(db: Session, data: CustomerRegister) -> CustomerAuth:
        
        existing = db.query(CustomerAuth).filter(CustomerAuth.email == data.email).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Customer with email '{data.email}' already exists"
            )
        customer_auth = CustomerAuth(
            name=data.name,
            email=data.email,
            hashed_password=get_password_hash(data.password),
            phone=data.phone,
            address=data.address,
            city=data.city,
            postal_code=data.postal_code,
            country=data.country,
        )
        db.add(customer_auth)
        db.flush()

        customer_record = Customer(
            name=data.name,
            email=data.email,
            phone=data.phone,
            address=data.address,
            city=data.city,
            postal_code=data.postal_code,
            country=data.country,
            auth_id=customer_auth.id,
        )
        db.add(customer_record)
        db.commit()
        db.refresh(customer_auth)
        return customer_auth

    @staticmethod
    def login_customer(db: Session, data: LoginRequest) -> dict:
        
        customer_auth = db.query(CustomerAuth).filter(CustomerAuth.email == data.email).first()
        if not customer_auth or not verify_password(data.password, customer_auth.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
        token = create_access_token({
            "sub": customer_auth.email,
            "role": "customer",
            "user_id": customer_auth.id,
        })
        return {
            "access_token": token,
            "token_type": "bearer",
            "role": "customer",
            "user_id": customer_auth.id,
            "name": customer_auth.name,
            "email": customer_auth.email,
        }



class ProductService:
    @staticmethod
    def create_product(db: Session, product: ProductCreate) -> Product:
        
        existing = db.query(Product).filter(Product.sku == product.sku).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product with SKU '{product.sku}' already exists"
            )
        
        db_product = Product(
            sku=product.sku,
            name=product.name,
            description=product.description,
            price=product.price,
            quantity=product.quantity,
            initial_quantity=product.initial_quantity,
            reorder_level=product.reorder_level,
            status=product.status
        )
        db.add(db_product)
        db.commit()
        db.refresh(db_product)
        return db_product
    
    @staticmethod
    def get_product(db: Session, product_id: int) -> Product:
        
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        return product
    
    @staticmethod
    def get_products(db: Session, skip: int = 0, limit: int = 50) -> list:
        
        return db.query(Product).offset(skip).limit(limit).all()
    
    @staticmethod
    def update_product(db: Session, product_id: int, product: ProductUpdate) -> Product:
        
        db_product = ProductService.get_product(db, product_id)
        
        update_data = product.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_product, field, value)
        
        db.add(db_product)
        db.commit()
        db.refresh(db_product)
        return db_product
    
    @staticmethod
    def delete_product(db: Session, product_id: int) -> None:
        
        db_product = ProductService.get_product(db, product_id)
        db.delete(db_product)
        db.commit()



class CustomerService:
    @staticmethod
    def create_customer(db: Session, customer: CustomerCreate) -> Customer:
        
        existing = db.query(Customer).filter(Customer.email == customer.email).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Customer with email '{customer.email}' already exists"
            )
        
        db_customer = Customer(**customer.dict())
        db.add(db_customer)
        db.commit()
        db.refresh(db_customer)
        return db_customer
    
    @staticmethod
    def get_customer(db: Session, customer_id: int) -> Customer:
        
        customer = db.query(Customer).filter(Customer.id == customer_id).first()
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Customer not found"
            )
        return customer
    
    @staticmethod
    def get_customers(db: Session, skip: int = 0, limit: int = 50) -> list:
        
        return db.query(Customer).offset(skip).limit(limit).all()
    
    @staticmethod
    def update_customer(db: Session, customer_id: int, customer: CustomerUpdate) -> Customer:
        
        db_customer = CustomerService.get_customer(db, customer_id)
        
        update_data = customer.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_customer, field, value)
        
        db.add(db_customer)
        db.commit()
        db.refresh(db_customer)
        return db_customer
    
    @staticmethod
    def delete_customer(db: Session, customer_id: int) -> None:
        
        db_customer = CustomerService.get_customer(db, customer_id)
        
        for order in db_customer.orders:
            if order.status not in (OrderStatus.SHIPPED, OrderStatus.DELIVERED):
                for item in order.items:
                    product = db.query(Product).filter(Product.id == item.product_id).first()
                    if product:
                        product.quantity += item.quantity
                        db.add(product)
                        
        db.delete(db_customer)
        db.commit()



class OrderService:
    @staticmethod
    def create_order(db: Session, order: OrderCreate, customer_auth_id: Optional[int] = None) -> Order:
        
        if customer_auth_id is not None:
            customer = db.query(Customer).filter(Customer.auth_id == customer_auth_id).first()
        else:
            if not order.customer_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Customer ID is required"
                )
            customer = db.query(Customer).filter(Customer.id == order.customer_id).first()
            
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Customer record not found."
            )
        
        total_amount = 0
        items_data = []
        
        for item in order.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if not product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Product with ID {item.product_id} not found"
                )
            
            if product.quantity < item.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient stock for product '{product.sku}'. Available: {product.quantity}, Requested: {item.quantity}"
                )
            
            item_total = product.price * item.quantity
            total_amount += item_total
            items_data.append({
                "product": product,
                "quantity": item.quantity,
                "unit_price": product.price,
                "total_price": item_total
            })
        
        db_order = Order(
            customer_id=customer.id,
            total_amount=total_amount,
            notes=order.notes
        )
        db.add(db_order)
        db.flush()
        
        for item_data in items_data:
            order_item = OrderItem(
                order_id=db_order.id,
                product_id=item_data["product"].id,
                quantity=item_data["quantity"],
                unit_price=item_data["unit_price"],
                total_price=item_data["total_price"]
            )
            db.add(order_item)
            
            item_data["product"].quantity -= item_data["quantity"]
            db.add(item_data["product"])
        
        db.commit()
        db.refresh(db_order)
        return db_order
    
    @staticmethod
    def get_order(db: Session, order_id: int) -> Order:
        
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        return order
    
    @staticmethod
    def get_orders(db: Session, skip: int = 0, limit: int = 50) -> list:
        
        return db.query(Order).offset(skip).limit(limit).all()

    @staticmethod
    def get_orders_for_customer(db: Session, customer_auth_id: int, skip: int = 0, limit: int = 50) -> list:
        
        customer = db.query(Customer).filter(Customer.auth_id == customer_auth_id).first()
        if not customer:
            return []
        return db.query(Order).filter(Order.customer_id == customer.id).offset(skip).limit(limit).all()
    
    @staticmethod
    def update_order_status(db: Session, order_id: int, order_status: OrderStatusEnum) -> Order:
        
        db_order = OrderService.get_order(db, order_id)
        db_order.status = order_status
        db.add(db_order)
        db.commit()
        db.refresh(db_order)
        return db_order

    @staticmethod
    def delete_order(db: Session, order_id: int) -> None:
        
        db_order = OrderService.get_order(db, order_id)
        for item in db_order.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if product:
                product.quantity += item.quantity
                db.add(product)
        db.delete(db_order)
        db.commit()



class StatsService:
    @staticmethod
    def get_dashboard_stats(db: Session) -> dict:
        
        total_products = db.query(func.count(Product.id)).scalar() or 0
        total_customers = db.query(func.count(Customer.id)).scalar() or 0
        total_orders = db.query(func.count(Order.id)).scalar() or 0
        
        total_revenue = db.query(func.sum(Order.total_amount)).scalar() or 0
        
        low_stock_products = db.query(func.count(Product.id)).filter(
            Product.quantity <= Product.reorder_level
        ).scalar() or 0
        
        pending_orders = db.query(func.count(Order.id)).filter(
            Order.status == OrderStatus.PENDING
        ).scalar() or 0
        
        return {
            "total_products": total_products,
            "total_customers": total_customers,
            "total_orders": total_orders,
            "total_revenue": total_revenue,
            "low_stock_products": low_stock_products,
            "pending_orders": pending_orders
        }
