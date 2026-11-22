from typing import Optional

from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork


# ---------------------------------------------------------
# EXCEPCIONES DE DOMINIO (el Router las traduce a HTTP)
# ---------------------------------------------------------
class ProductoNoEncontrado(Exception):
    pass  # → 404


class CategoriaNoEncontrada(Exception):
    pass  # → 404 (categoria_id inexistente o dada de baja)


# ---------------------------------------------------------
# SERVICE DE PRODUCTOS
# Abre "with self.uow as uow:" y devuelve el schema dentro del bloque
# ---------------------------------------------------------
class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork):
        self.uow = uow

    @staticmethod
    def _obtener_activo(uow: ProductoUnitOfWork, id: int) -> Producto:
        # Un producto dado de baja se trata como inexistente
        producto = uow.productos.get_by_id(id)
        if producto is None or not producto.activo:
            raise ProductoNoEncontrado(f"No existe un producto con id {id}")
        return producto

    @staticmethod
    def _validar_categoria(uow: ProductoUnitOfWork, categoria_id: int) -> None:
        categoria = uow.categorias.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada(f"No existe una categoría con id {categoria_id}")

    def listar(
        self,
        skip: int,
        limit: int,
        search: Optional[str],
        categoria_id: Optional[int],
        disponible: Optional[bool],
    ) -> ProductosPaginados:
        with self.uow as uow:
            total, productos = uow.productos.search(skip, limit, search, categoria_id, disponible)
            return ProductosPaginados(
                total=total, items=[ProductoRead.model_validate(p) for p in productos]
            )

    def obtener(self, id: int) -> ProductoRead:
        with self.uow as uow:
            return ProductoRead.model_validate(self._obtener_activo(uow, id))

    def crear(self, datos: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            self._validar_categoria(uow, datos.categoria_id)
            producto = Producto.model_validate(datos)
            producto.nombre = producto.nombre.strip()
            uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def actualizar(self, id: int, datos: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = self._obtener_activo(uow, id)
            # Los campos obligatorios en la tabla ignoran un null explícito
            obligatorios = {"nombre", "precio_base", "stock", "disponible", "categoria_id"}
            cambios = {
                campo: valor
                for campo, valor in datos.model_dump(exclude_unset=True).items()
                if valor is not None or campo not in obligatorios
            }
            if "categoria_id" in cambios:
                self._validar_categoria(uow, cambios["categoria_id"])
            for campo, valor in cambios.items():
                setattr(producto, campo, valor)
            uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def cambiar_stock(self, id: int, datos: ProductoStockUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = self._obtener_activo(uow, id)
            if datos.stock is not None:
                producto.stock = datos.stock
            if datos.disponible is not None:
                producto.disponible = datos.disponible
            uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def eliminar(self, id: int) -> None:
        # Baja lógica: activo = false. Las líneas de pedido conservan la referencia
        with self.uow as uow:
            producto = self._obtener_activo(uow, id)
            producto.activo = False
            uow.productos.add(producto)


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork())
