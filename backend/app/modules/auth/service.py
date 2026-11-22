from fastapi import HTTPException, status

from app.core.deps import MENSAJE_CUENTA_DESACTIVADA
from app.core.security import create_access_token, hash_password, verify_password
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


# ---------------------------------------------------------
# SERVICE DE AUTH: registro y login
# En auth se admite lanzar HTTPException desde el Service (estilo del
# proyecto de seguridad de la materia)
# ---------------------------------------------------------
class AuthService:
    def __init__(self, uow: UsuarioUnitOfWork):
        self.uow = uow

    def registrar(self, datos: UserCreate) -> UserPublic:
        with self.uow as uow:
            if uow.usuarios.get_by_username(datos.username):
                raise HTTPException(status.HTTP_409_CONFLICT, "El username ya está registrado")
            email = datos.email.lower()
            if uow.usuarios.get_by_email(email):
                raise HTTPException(status.HTTP_409_CONFLICT, "El email ya está registrado")
            usuario = Usuario(
                username=datos.username,
                full_name=datos.full_name.strip(),
                email=email,
                hashed_password=hash_password(datos.password),
                role="user",  # el registro público siempre crea rol user
            )
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)

    def autenticar(self, username: str, password: str) -> str:
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(username)
            if usuario is None or not verify_password(password, usuario.hashed_password):
                raise HTTPException(
                    status.HTTP_401_UNAUTHORIZED,
                    "Usuario o contraseña incorrectos",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            if usuario.disabled:
                raise HTTPException(status.HTTP_400_BAD_REQUEST, MENSAJE_CUENTA_DESACTIVADA)
            return create_access_token(usuario.username)


def get_auth_service() -> AuthService:
    return AuthService(UsuarioUnitOfWork())
