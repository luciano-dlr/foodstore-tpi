from typing import TYPE_CHECKING, List, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.categorias.models import Categoria
    from app.modules.pedidos.models import DetallePedido


# ---------------------------------------------------------
# MODELO DE TABLA: producto (UML · Catálogo)
# - categoria_id: FK a categoria {NN} (una categoría por producto)
# - precio_base >= 0 y stock >= 0 (validados en schema y Service)
# - disponible: pausa manual de la venta; activo: baja lógica
# Se vende solo si está activo, disponible y con stock suficiente (RN-01)
# Relaciones: Producto.categoria / Categoria.productos y
#             Producto.detalles / DetallePedido.producto
# ---------------------------------------------------------
class Producto(SQLModel, table=True):
    __tablename__ = "producto"

    id: Optional[int] = Field(default=None, primary_key=True)
    categoria_id: int = Field(foreign_key="categoria.id", index=True)
    nombre: str = Field(max_length=150, index=True)
    descripcion: Optional[str] = Field(default=None)
    precio_base: float
    imagen_url: Optional[str] = Field(default=None, max_length=500)
    stock: int = Field(default=0)
    disponible: bool = Field(default=True)
    activo: bool = Field(default=True)

    categoria: Optional["Categoria"] = Relationship(back_populates="productos")
    detalles: List["DetallePedido"] = Relationship(back_populates="producto")
