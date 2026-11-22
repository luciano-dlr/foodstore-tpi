from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import field_validator
from sqlmodel import Field, SQLModel


class EstadoPedido(str, Enum):
    PENDIENTE = "PENDIENTE"
    EN_PREPARACION = "EN_PREPARACION"
    ENTREGADO = "ENTREGADO"
    CANCELADO = "CANCELADO"


class FormaPago(str, Enum):
    EFECTIVO = "EFECTIVO"
    TRANSFERENCIA = "TRANSFERENCIA"


# ---------------------------------------------------------
# SCHEMAS DE ENTRADA
# ---------------------------------------------------------
class ItemPedidoCreate(SQLModel):
    producto_id: int = Field(gt=0)
    cantidad: int = Field(ge=1)


class PedidoCreate(SQLModel):
    # RN-06: forma_pago dentro del Enum y direccion_entrega de 5 a 200 caracteres
    items: List[ItemPedidoCreate] = Field(min_length=1)
    forma_pago: FormaPago
    direccion_entrega: str = Field(min_length=5, max_length=200)
    notas: Optional[str] = Field(default=None, max_length=500)

    @field_validator("direccion_entrega")
    @classmethod
    def direccion_sin_espacios(cls, valor: str) -> str:
        valor = valor.strip()
        if len(valor) < 5:
            raise ValueError("La dirección de entrega debe tener al menos 5 caracteres")
        return valor


class CambioEstado(SQLModel):
    estado: EstadoPedido


# ---------------------------------------------------------
# SCHEMAS DE SALIDA
# ---------------------------------------------------------
class DetallePedidoRead(SQLModel):
    producto_id: int
    nombre_producto: str
    precio_unitario: float
    cantidad: int
    subtotal: float


class PedidoRead(SQLModel):
    id: int
    usuario_id: int
    estado: EstadoPedido
    forma_pago: FormaPago
    direccion_entrega: str
    notas: Optional[str] = None
    total: float
    created_at: datetime
    updated_at: datetime
    items: List[DetallePedidoRead]


class PedidosPaginados(SQLModel):
    total: int
    items: List[PedidoRead]


class ResumenPedidos(SQLModel):
    pendientes: int
    en_preparacion: int
    entregados: int
    cancelados: int
    pedidos_hoy: int
    ingresos_entregados: float
