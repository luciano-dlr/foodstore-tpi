from typing import Optional

from sqlmodel import select

from app.core.base_repository import BaseRepository
from app.modules.usuarios.models import Usuario


# ---------------------------------------------------------
# REPOSITORIO DE USUARIOS: consultas propias del módulo
# ---------------------------------------------------------
class UsuarioRepository(BaseRepository[Usuario]):
    model = Usuario

    def get_by_username(self, username: str) -> Optional[Usuario]:
        return self.session.exec(select(Usuario).where(Usuario.username == username)).first()

    def get_by_email(self, email: str) -> Optional[Usuario]:
        return self.session.exec(select(Usuario).where(Usuario.email == email)).first()
