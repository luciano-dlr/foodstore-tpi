from typing import Annotated, Callable, List

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer

from app.core.security import decode_access_token
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import UsuarioService, get_usuario_service

COOKIE_NAME = "access_token"
MENSAJE_CUENTA_DESACTIVADA = "Cuenta de usuario desactivada"


# ---------------------------------------------------------
# ESQUEMA OAuth2 QUE LEE EL TOKEN DE LA COOKIE HttpOnly
# Extiende OAuth2PasswordBearer (Swagger muestra el formulario de
# /auth/token), pero toma el token SOLO de la cookie access_token: el
# frontend nunca lee ni guarda el token.
# ---------------------------------------------------------
class OAuth2PasswordBearerWithCookie(OAuth2PasswordBearer):
    async def __call__(self, request: Request) -> str | None:
        token = request.cookies.get(COOKIE_NAME)
        if not token:
            if self.auto_error:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="No autenticado",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            return None
        return token


oauth2_scheme = OAuth2PasswordBearerWithCookie(tokenUrl="/api/v1/auth/token")


# ---------------------------------------------------------
# DEPENDENCIAS DE SESIÓN Y ROL
#   cookie access_token
#       ↓ oauth2_scheme            → 401 si no hay cookie
#   get_current_user               → 401 si el JWT es inválido o venció
#       ↓
#   get_current_active_user        → 400 si la cuenta está desactivada
#       ↓
#   require_role([...])            → 403 si el rol no está permitido
# ---------------------------------------------------------
def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    service: Annotated[UsuarioService, Depends(get_usuario_service)],
) -> UserPublic:
    credenciales_invalidas = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales inválidas o sesión vencida",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)  # valida firma y expiración
    if payload is None or not payload.get("sub"):
        raise credenciales_invalidas

    usuario = service.obtener_por_username(payload["sub"])  # sub = username
    if usuario is None:
        raise credenciales_invalidas
    return usuario


def get_current_active_user(
    current_user: Annotated[UserPublic, Depends(get_current_user)],
) -> UserPublic:
    if current_user.disabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=MENSAJE_CUENTA_DESACTIVADA
        )
    return current_user


def require_role(allowed_roles: List[str]) -> Callable:
    # Fábrica de dependencias: require_role(["admin"])
    def role_checker(
        current_user: Annotated[UserPublic, Depends(get_current_active_user)],
    ) -> UserPublic:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permisos insuficientes: se requiere el rol {' o '.join(allowed_roles)}",
            )
        return current_user

    return role_checker


# Atajos para los routers
CurrentUser = Annotated[UserPublic, Depends(get_current_active_user)]
AdminUser = Annotated[UserPublic, Depends(require_role(["admin"]))]
