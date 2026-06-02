from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import get_db
from schemas import MerchantRegister, CustomerRegister, LoginRequest, TokenResponse, MerchantResponse, CustomerAuthResponse
from services import AuthService, decode_token
from models import Merchant, CustomerAuth

router = APIRouter(prefix="/auth", tags=["auth"])
bearer_scheme = HTTPBearer()



def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme), db: Session = Depends(get_db)):
    
    token = credentials.credentials
    payload = decode_token(token)
    return payload


def require_merchant(current_user: dict = Depends(get_current_user)):
    
    if current_user.get("role") != "merchant":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only merchants can perform this action"
        )
    return current_user


def require_customer(current_user: dict = Depends(get_current_user)):
    
    if current_user.get("role") != "customer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only customers can perform this action"
        )
    return current_user



@router.post("/merchant/register", response_model=MerchantResponse, status_code=status.HTTP_201_CREATED)
def merchant_register(data: MerchantRegister, db: Session = Depends(get_db)):
    
    return AuthService.register_merchant(db, data)


@router.post("/merchant/login", response_model=TokenResponse)
def merchant_login(data: LoginRequest, db: Session = Depends(get_db)):
    
    return AuthService.login_merchant(db, data)



@router.post("/customer/register", response_model=CustomerAuthResponse, status_code=status.HTTP_201_CREATED)
def customer_register(data: CustomerRegister, db: Session = Depends(get_db)):
    
    return AuthService.register_customer(db, data)


@router.post("/customer/login", response_model=TokenResponse)
def customer_login(data: LoginRequest, db: Session = Depends(get_db)):
    
    return AuthService.login_customer(db, data)



@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    
    role = current_user.get("role")
    user_id = current_user.get("user_id")

    if role == "merchant":
        user = db.query(Merchant).filter(Merchant.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="Merchant not found")
        return {"role": "merchant", "id": user.id, "name": user.name, "email": user.email}

    elif role == "customer":
        user = db.query(CustomerAuth).filter(CustomerAuth.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="Customer not found")
        return {"role": "customer", "id": user.id, "name": user.name, "email": user.email}

    raise HTTPException(status_code=400, detail="Invalid token role")
