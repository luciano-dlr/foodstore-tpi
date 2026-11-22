from typing import List, Optional, Tuple

from sqlalchemy import func
from sqlalchemy.orm import selectinload
from sqlmodel import select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


# ---------------------------------------------------------
# REPOSITORIO DE PRODUCTOS: consultas propias del módulo
# ---------------------------------------------------------
class ProductoRepository(BaseRepository[Producto]):
    model = Producto

    def get_for_update(self, id: int) -> Optional[Producto]:
        # SELECT ... FOR UPDATE: bloquea la fila hasta el commit del Unit of Work,
        # así dos pedidos simultáneos no descuentan el mismo stock
        consulta = select(Producto).where(Producto.id == id).with_for_update()
        return self.session.exec(consulta).first()

    def search(
        self,
        skip: int,
        limit: int,
        search: Optional[str] = None,
        categoria_id: Optional[int] = None,
        disponible: Optional[bool] = None,
    ) -> Tuple[int, List[Producto]]:
        # Solo productos activos; search sobre nombre sin distinguir mayúsculas
        filtros = [Producto.activo == True]  # noqa: E712
        if search:
            filtros.append(Producto.nombre.ilike(f"%{search.strip()}%"))
        if categoria_id is not None:
            filtros.append(Producto.categoria_id == categoria_id)
        if disponible is not None:
            filtros.append(Producto.disponible == disponible)

        total = self.session.exec(select(func.count()).select_from(Producto).where(*filtros)).one()
        consulta = (
            select(Producto)
            .where(*filtros)
            .options(selectinload(Producto.categoria))
            .order_by(Producto.nombre, Producto.id)
            .offset(skip)
            .limit(limit)
        )
        return total, list(self.session.exec(consulta).all())
