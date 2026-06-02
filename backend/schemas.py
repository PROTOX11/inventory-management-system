from pydantic import BaseModel, Field, EmailStr, validator
from datetime import datetime
from typing import Optional, List
from enum import Enum

class ProductStatusEnum(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    DISCONTINUED = "discontinued"

class OrderStatusEnum(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class UserRoleEnum(str, Enum):
    MERCHANT = "merchant"
    CUSTOMER = "customer"


class MerchantRegister(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=6)

class CustomerRegister(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=6)
    phone: Optional[str] = Field(None, max_length=20)
    address: Optional[str] = Field(None, max_length=500)
    city: Optional[str] = Field(None, max_length=100)
    postal_code: Optional[str] = Field(None, max_length=20)
    country: Optional[str] = Field(None, max_length=100)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: UserRoleEnum
    user_id: int
    name: str
    email: str

class MerchantResponse(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True

class CustomerAuthResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str]
    address: Optional[str]
    city: Optional[str]
    postal_code: Optional[str]
    country: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class ProductCreate(BaseModel):
    sku: str = Field(..., min_length=1, max_length=100)
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    price: int = Field(..., gt=0)
    quantity: int = Field(default=0, ge=0)
    initial_quantity: int = Field(default=0, ge=0)
    reorder_level: int = Field(default=10, ge=0)
    status: ProductStatusEnum = ProductStatusEnum.ACTIVE

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    price: Optional[int] = Field(None, gt=0)
    quantity: Optional[int] = Field(None, ge=0)
    initial_quantity: Optional[int] = Field(None, ge=0)
    reorder_level: Optional[int] = Field(None, ge=0)
    status: Optional[ProductStatusEnum] = None

class ProductResponse(BaseModel):
    id: int
    sku: str
    name: str
    description: Optional[str]
    price: int
    quantity: int
    initial_quantity: int
    reorder_level: int
    status: ProductStatusEnum
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CustomerCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=20)
    address: Optional[str] = Field(None, max_length=500)
    city: Optional[str] = Field(None, max_length=100)
    postal_code: Optional[str] = Field(None, max_length=20)
    country: Optional[str] = Field(None, max_length=100)

class CustomerUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)
    address: Optional[str] = Field(None, max_length=500)
    city: Optional[str] = Field(None, max_length=100)
    postal_code: Optional[str] = Field(None, max_length=20)
    country: Optional[str] = Field(None, max_length=100)

class CustomerResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str]
    address: Optional[str]
    city: Optional[str]
    postal_code: Optional[str]
    country: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class OrderItemCreate(BaseModel):
    product_id: int = Field(..., gt=0)
    quantity: int = Field(..., gt=0)

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: int
    total_price: int
    created_at: datetime

    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    customer_id: Optional[int] = None
    items: List[OrderItemCreate] = Field(..., min_items=1)
    notes: Optional[str] = Field(None, max_length=1000)

class OrderUpdate(BaseModel):
    status: Optional[OrderStatusEnum] = None
    notes: Optional[str] = Field(None, max_length=1000)

class OrderResponse(BaseModel):
    id: int
    customer_id: int
    customer_name: str
    status: OrderStatusEnum
    total_amount: int
    notes: Optional[str]
    items: List[OrderItemResponse]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DashboardStatsResponse(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    total_revenue: int
    low_stock_products: int
    pending_orders: int


class PaginationParams(BaseModel):
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=50, ge=1, le=1000)


class ErrorResponse(BaseModel):
    detail: str
    error_code: Optional[str] = None
