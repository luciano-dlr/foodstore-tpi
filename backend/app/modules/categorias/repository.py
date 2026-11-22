from typing import List, Optional

from sqlalchemy import func
from sqlmodel import select

from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria


# ---------------------------------------------------------
# REPOSITORIO DE CATEGORÍAS: consultas propias del módulo
# ---------------------------------------------------------
class CategoriaRepository(BaseRepository[Categoria]):
    model = Categoria

    def get_by_nombre(self, nombre: str) -> Optional[Categoria]:
        # Sin distinguir mayúsculas e incluye las dadas de baja (la baja no
        # libera el nombre único)
        consulta = select(Categoria).where(func.lower(Categoria.nombre) == nombre.lower())
        return self.session.exec(consulta).first()

    def list_activas(self) -> List[Categoria]:
        consulta = select(Categoria).where(Categoria.activo == True).order_by(Categoria.nombre)  # noqa: E712
        return list(self.session.exec(consulta).all())
