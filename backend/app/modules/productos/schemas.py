from typing import List, Optional

from sqlmodel import Field, SQLModel

from app.modules.categorias.schemas import CategoriaRead


# ---------------------------------------------------------
# SCHEMAS DE PRODUCTO (SQLModel sin table=True)
# ---------------------------------------------------------
class ProductoCreate(SQLModel):
    nombre: str = Field(min_length=2, max_length=150)
    descripcion: Optional[str] = Field(default=None, max_length=1000)
    precio_base: float = Field(ge=0)
    imagen_url: Optional[str] = Field(default=None, max_length=500)
    stock: int = Field(default=0, ge=0)
    disponible: bool = True
    categoria_id: int = Field(gt=0)


class ProductoUpdate(SQLModel):
    # PUT con actualización parcial: solo cambian los campos enviados
    nombre: Optional[str] = Field(default=None, min_length=2, max_length=150)
    descripcion: Optional[str] = Field(default=None, max_length=1000)
    precio_base: Optional[float] = Field(default=None, ge=0)
    imagen_url: Optional[str] = Field(default=None, max_length=500)
    stock: Optional[int] = Field(default=None, ge=0)
    disponible: Optional[bool] = None
    categoria_id: Optional[int] = Field(default=None, gt=0)


class ProductoStockUpdate(SQLModel):
    # PATCH /productos/{id}/stock: se puede enviar uno o los dos campos
    stock: Optional[int] = Field(default=None, ge=0)
    disponible: Optional[bool] = None


class ProductoRead(SQLModel):
    id: int
    nombre: str
    descripcion: Optional[str] = None
    precio_base: float
    imagen_url: Optional[str] = None
    stock: int
    disponible: bool
    activo: bool
    categoria_id: int
    categoria: CategoriaRead


class ProductosPaginados(SQLModel):
    total: int
    items: List[ProductoRead]
