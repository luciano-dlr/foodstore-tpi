from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

# ---------------------------------------------------------
# HASH DE CONTRASEÑAS (Passlib + bcrypt)
# bcrypt genera un salt distinto en cada hash; nunca se guarda texto plano
# ---------------------------------------------------------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return pwd_context.verify(plain, hashed)
    except ValueError:
        return False  # hash con formato inválido


# ---------------------------------------------------------
# JWT (python-jose, HS256)
# Claims: sub (username), exp. El token viaja solo en la cookie HttpOnly
# ---------------------------------------------------------
def create_access_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    expira = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    payload = {"sub": subject, "exp": expira}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    # jwt.decode valida la firma y la expiración; cualquier problema → None (401)
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None
