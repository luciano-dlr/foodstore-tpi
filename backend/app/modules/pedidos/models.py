from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import DateTime
from sqlmodel import Field, Relationship, SQLModel

from app.modules.usuarios.models import ahora

if TYPE_CHECKING:
    from app.modules.productos.models import Producto
    from app.modules.usuarios.models import Usuario


# ---------------------------------------------------------
# MODELO DE TABLA: pedido (UML · Pedidos)
# - estado: PENDIENTE al crear; cambia solo según la máquina de estados
# - forma_pago: EFECTIVO o TRANSFERENCIA (RN-06, validado en el schema)
# - total: suma de los subtotales, fijo desde la creación (RN-05)
# No se borra: se cancela. No hay endpoint de edición ni de borrado.
# Relaciones: Pedido.usuario / Usuario.pedidos y Pedido.items / DetallePedido.pedido
# ---------------------------------------------------------
class Pedido(SQLModel, table=True):
    __tablename__ = "pedido"

    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id", index=True)
    estado: str = Field(default="PENDIENTE", max_length=20, index=True)
    forma_pago: str = Field(max_length=20)
    direccion_entrega: str = Field(max_length=200)
    notas: Optional[str] = Field(default=None)
    total: float = Field(default=0)
    created_at: datetime = Field(default_factory=ahora, sa_type=DateTime(timezone=True))
    updated_at: datetime = Field(default_factory=ahora, sa_type=DateTime(timezone=True))

    usuario: Optional["Usuario"] = Relationship(back_populates="pedidos")
    # Composición: las líneas pertenecen al pedido (se ordenan por id)
    items: List["DetallePedido"] = Relationship(
        back_populates="pedido", sa_relationship_kwargs={"order_by": "DetallePedido.id"}
    )


# ---------------------------------------------------------
# MODELO DE TABLA: detalle_pedido (línea inmutable, RN-05)
# - nombre_producto y precio_unitario: COPIA del producto al crear el pedido,
#   así el pedido no cambia aunque después se edite el producto
# - subtotal = precio_unitario × cantidad
# Relaciones: DetallePedido.pedido y DetallePedido.producto / Producto.detalles
# ---------------------------------------------------------
class DetallePedido(SQLModel, table=True):
    __tablename__ = "detalle_pedido"

    id: Optional[int] = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedido.id", index=True)
    producto_id: int = Field(foreign_key="producto.id", index=True)
    cantidad: int
    nombre_producto: str = Field(max_length=150)
    precio_unitario: float
    subtotal: float

    pedido: Optional[Pedido] = Relationship(back_populates="items")
    producto: Optional["Producto"] = Relationship(back_populates="detalles")
