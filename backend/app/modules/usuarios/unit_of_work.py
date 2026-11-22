from app.core.unit_of_work import UnitOfWork
from app.modules.usuarios.repository import UsuarioRepository


# ---------------------------------------------------------
# UNIT OF WORK DE USUARIOS (lo usan los módulos usuarios y auth)
# ---------------------------------------------------------
class UsuarioUnitOfWork(UnitOfWork):
    def _crear_repositorios(self) -> None:
        self.usuarios = UsuarioRepository(self.session)
