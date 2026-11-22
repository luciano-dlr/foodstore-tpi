from typing import TYPE_CHECKING, List, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.productos.models import Producto


# ---------------------------------------------------------
# MODELO DE TABLA: categoria (UML · Catálogo)
# - nombre: único, 2 a 100 caracteres (largo validado en el schema)
# - activo: baja lógica. No libera el nombre único ni oculta sus productos
# Relación 1:N → Categoria.productos / Producto.categoria
# ---------------------------------------------------------
class Categoria(SQLModel, table=True):
    __tablename__ = "categoria"

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=100, unique=True, index=True)
    descripcion: Optional[str] = Field(default=None)
    activo: bool = Field(default=True)

    productos: List["Producto"] = Relationship(back_populates="categoria")
