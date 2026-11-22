from app.core.unit_of_work import UnitOfWork
from app.modules.categorias.repository import CategoriaRepository


# ---------------------------------------------------------
# UNIT OF WORK DE CATEGORÍAS
# ---------------------------------------------------------
class CategoriaUnitOfWork(UnitOfWork):
    def _crear_repositorios(self) -> None:
        self.categorias = CategoriaRepository(self.session)
