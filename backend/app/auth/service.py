from datetime import datetime, timedelta
from uuid import UUID

import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.domain import Tenant, User
from app.schemas.domain_schemas import RegisterRequest


SUPER_ADMIN = "super_admin"
TENANT_ADMIN = "tenant_admin"
LEGACY_TENANT_ROLES = {"owner", "admin", "tenant_owner"}

legacy_pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")
optional_oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login",
    auto_error=False,
)


def normalize_role(role: str | None) -> str:
    if role == SUPER_ADMIN:
        return SUPER_ADMIN
    if role == TENANT_ADMIN or role in LEGACY_TENANT_ROLES:
        return TENANT_ADMIN
    return TENANT_ADMIN


def is_super_admin(user: User | None) -> bool:
    return bool(user and normalize_role(user.role) == SUPER_ADMIN)


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8")[:72], bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    if not password_hash:
        return False
    if password_hash.startswith(("$2a$", "$2b$", "$2y$")):
        return bcrypt.checkpw(password.encode("utf-8")[:72], password_hash.encode("utf-8"))
    return legacy_pwd_context.verify(password, password_hash)


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    user = db.query(User).filter(User.email == email, User.is_active.is_(True)).first()
    if not user or not verify_password(password, user.password_hash):
        return None
    normalized_role = normalize_role(user.role)
    if user.role != normalized_role:
        user.role = normalized_role
        db.commit()
        db.refresh(user)
    return user


def create_access_token(user: User, expires_delta: timedelta | None = None) -> str:
    expires_at = datetime.utcnow() + (expires_delta or timedelta(hours=8))
    payload = {
        "sub": str(user.id),
        "tenant_id": str(user.tenant_id) if user.tenant_id else None,
        "role": normalize_role(user.role),
        "exp": expires_at,
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise credentials_error
    except JWTError as exc:
        raise credentials_error from exc

    user = db.query(User).filter(User.id == UUID(user_id), User.is_active.is_(True)).first()
    if not user:
        raise credentials_error
    user.role = normalize_role(user.role)
    return user


def get_optional_current_user(
    token: str | None = Depends(optional_oauth2_scheme),
    db: Session = Depends(get_db),
) -> User | None:
    if not token:
        return None
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            return None
    except JWTError:
        return None
    user = db.query(User).filter(User.id == UUID(user_id), User.is_active.is_(True)).first()
    if user:
        user.role = normalize_role(user.role)
    return user


def require_super_admin(current_user: User = Depends(get_current_user)) -> User:
    if not is_super_admin(current_user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Super admin access required")
    return current_user


def register_owner(db: Session, request: RegisterRequest) -> User:
    existing_tenant = db.query(Tenant).filter(Tenant.slug == request.tenant_slug).first()
    if existing_tenant:
        raise HTTPException(status_code=409, detail="Tenant slug already exists")

    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(status_code=409, detail="Email already registered")

    tenant = Tenant(
        name=request.tenant_name,
        slug=request.tenant_slug,
        email=request.email,
        status="active",
    )
    db.add(tenant)
    db.flush()

    user = User(
        tenant_id=tenant.id,
        email=request.email,
        password_hash=hash_password(request.password),
        first_name=request.first_name,
        last_name=request.last_name,
        role=TENANT_ADMIN,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
