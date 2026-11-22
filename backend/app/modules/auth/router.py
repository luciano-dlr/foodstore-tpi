from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.deps import COOKIE_NAME, CurrentUser
from app.modules.auth.schemas import Mensaje
from app.modules.auth.service import AuthService, get_auth_service
from app.modules.usuarios.schemas import UserCreate, UserPublic

router = APIRouter(prefix="/auth", tags=["Auth"])

ServiceDep = Annotated[AuthService, Depends(get_auth_service)]

# Atributos de la cookie: el borrado (logout) tiene que repetirlos.
# secure=False porque en desarrollo se usa http; en producción con HTTPS va True
COOKIE_ATTRS = {"httponly": True, "samesite": "lax", "secure": False, "path": "/"}


# ---------------------------------------------------------
# REGISTRO (público, crea rol user)
# Método: POST | Endpoint: /api/v1/auth/register | Estado: 201 Created
# ---------------------------------------------------------
@router.post(
    "/register",
    response_model=UserPublic,
    status_code=status.HTTP_201_CREATED,
    responses={409: {"description": "El username o el email ya existen"}},
)
def register(user_in: UserCreate, service: ServiceDep):
    return service.registrar(user_in)


# ---------------------------------------------------------
# LOGIN (formulario OAuth2: username y password)
# Método: POST | Endpoint: /api/v1/auth/token | Estado: 200 OK
# El JWT NO viaja en el cuerpo: se guarda en la cookie HttpOnly access_token
# ---------------------------------------------------------
@router.post(
    "/token",
    response_model=Mensaje,
    responses={
        400: {"description": "Cuenta de usuario desactivada"},
        401: {"description": "Credenciales incorrectas"},
    },
)
def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    response: Response,
    service: ServiceDep,
):
    token = service.autenticar(form_data.username, form_data.password)
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # igual que el exp del JWT
        **COOKIE_ATTRS,
    )
    return Mensaje(message="Login exitoso")


# ---------------------------------------------------------
# LOGOUT (público)
# Método: POST | Endpoint: /api/v1/auth/logout | Estado: 200 OK
# Responde con un Set-Cookie que borra la cookie
# ---------------------------------------------------------
@router.post("/logout", response_model=Mensaje)
def logout(response: Response):
    response.delete_cookie(key=COOKIE_NAME, **COOKIE_ATTRS)
    return Mensaje(message="Sesión cerrada")


# ---------------------------------------------------------
# PERFIL DEL USUARIO AUTENTICADO
# Método: GET | Endpoint: /api/v1/auth/me | Estado: 200 OK
# ---------------------------------------------------------
@router.get("/me", response_model=UserPublic)
def read_me(current_user: CurrentUser):
    return current_user
