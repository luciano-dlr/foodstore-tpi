from app.core.unit_of_work import UnitOfWork
from app.modules.categorias.repository import CategoriaRepository
from app.modules.productos.repository import ProductoRepository


# ---------------------------------------------------------
# UNIT OF WORK DE PRODUCTOS
# Expone también categorías para validar categoria_id en la misma sesión
# ---------------------------------------------------------
class ProductoUnitOfWork(UnitOfWork):
    def _crear_repositorios(self) -> None:
        self.productos = ProductoRepository(self.session)
        self.categorias = CategoriaRepository(self.session)
