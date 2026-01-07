"""
Authentication router for KidLearn API
"""

from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt

from ..models import (
    User,
    UserCreate,
    LoginRequest,
    AuthResponse,
    ErrorResponse,
    UserRole,
)
from ..database import (
    get_user_by_email,
    get_user_by_id,
    create_user,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()

# JWT Configuration
SECRET_KEY = "your-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        return user_id
    except JWTError:
        return None


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> User:
    token = credentials.credentials
    user_id = decode_token(token)
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    
    user_in_db = get_user_by_id(user_id)
    if not user_in_db:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    
    return User(
        id=user_in_db.id,
        email=user_in_db.email,
        name=user_in_db.name,
        role=user_in_db.role,
        avatar=user_in_db.avatar,
        created_at=user_in_db.created_at,
    )


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(
        HTTPBearer(auto_error=False)
    ),
) -> Optional[User]:
    if not credentials:
        return None
    
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None


@router.post("/register", response_model=AuthResponse, status_code=201)
async def register(user_data: UserCreate):
    """Register a new user account"""
    existing_user = get_user_by_email(user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    user = create_user(
        email=user_data.email,
        password=user_data.password,
        name=user_data.name,
        role=user_data.role,
    )
    
    access_token = create_access_token(
        data={"sub": user.id},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    
    return AuthResponse(
        user=user,
        access_token=access_token,
    )


@router.post("/login", response_model=AuthResponse)
async def login(login_data: LoginRequest):
    """Login with email and password"""
    user_in_db = get_user_by_email(login_data.email)
    
    if not user_in_db or not verify_password(login_data.password, user_in_db.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    
    user = User(
        id=user_in_db.id,
        email=user_in_db.email,
        name=user_in_db.name,
        role=user_in_db.role,
        avatar=user_in_db.avatar,
        created_at=user_in_db.created_at,
    )
    
    access_token = create_access_token(
        data={"sub": user.id},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    
    return AuthResponse(
        user=user,
        access_token=access_token,
    )


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """Logout the current user"""
    # In a real app, we'd invalidate the token here
    return {"success": True}
