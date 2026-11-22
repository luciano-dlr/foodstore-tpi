from app.core.unit_of_work import UnitOfWork
from app.modules.pedidos.repository import PedidoRepository
from app.modules.productos.repository import ProductoRepository


# ---------------------------------------------------------
# UNIT OF WORK DE PEDIDOS
# Repositorios de pedidos y de productos sobre la MISMA sesión: crear el
# pedido, descontar el stock y crear las líneas es una sola transacción
# ---------------------------------------------------------
class PedidoUnitOfWork(UnitOfWork):
    def _crear_repositorios(self) -> None:
        self.pedidos = PedidoRepository(self.session)
        self.productos = ProductoRepository(self.session)
