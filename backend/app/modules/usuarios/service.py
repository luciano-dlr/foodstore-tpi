from typing import List, Optional

from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


# ---------------------------------------------------------
# EXCEPCIONES DE DOMINIO (el Router las traduce a HTTP)
# ---------------------------------------------------------
class UsuarioNoEncontrado(Exception):
    pass  # → 404


class AutoDesactivacion(Exception):
    pass  # → 400


# ---------------------------------------------------------
# SERVICE DE USUARIOS: consulta por username (sesión) y gestión del admin
# ---------------------------------------------------------
class UsuarioService:
    def __init__(self, uow: UsuarioUnitOfWork):
        self.uow = uow

    def obtener_por_username(self, username: str) -> Optional[UserPublic]:
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(username)
            return UserPublic.model_validate(usuario) if usuario else None

    def listar(self) -> List[UserPublic]:
        with self.uow as uow:
            return [UserPublic.model_validate(u) for u in uow.usuarios.get_all()]

    def cambiar_estado(self, id: int, activo: bool, admin_id: int) -> UserPublic:
        # Idempotente: responde 200 aunque el estado no cambie
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(id)
            if usuario is None:
                raise UsuarioNoEncontrado(f"No existe un usuario con id {id}")
            if not activo and usuario.id == admin_id:
                raise AutoDesactivacion("Un administrador no puede desactivarse a sí mismo")
            usuario.disabled = not activo
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())
