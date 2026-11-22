from datetime import datetime
from typing import Dict, List, Optional, Tuple

from sqlalchemy import func
from sqlalchemy.orm import selectinload
from sqlmodel import select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import Pedido


# ---------------------------------------------------------
# REPOSITORIO DE PEDIDOS: consultas propias del módulo (sin reglas)
# ---------------------------------------------------------
class PedidoRepository(BaseRepository[Pedido]):
    model = Pedido

    def _listar(self, filtros: list, skip: int, limit: int) -> Tuple[int, List[Pedido]]:
        total = self.session.exec(select(func.count()).select_from(Pedido).where(*filtros)).one()
        consulta = (
            select(Pedido)
            .where(*filtros)
            .options(selectinload(Pedido.items))
            .order_by(Pedido.created_at.desc(), Pedido.id.desc())
            .offset(skip)
            .limit(limit)
        )
        return total, list(self.session.exec(consulta).all())

    def list_by_usuario(
        self, usuario_id: int, skip: int, limit: int, estado: Optional[str] = None
    ) -> Tuple[int, List[Pedido]]:
        filtros = [Pedido.usuario_id == usuario_id]
        if estado:
            filtros.append(Pedido.estado == estado)
        return self._listar(filtros, skip, limit)

    def list_all(self, skip: int, limit: int, estado: Optional[str] = None) -> Tuple[int, List[Pedido]]:
        filtros = [Pedido.estado == estado] if estado else []
        return self._listar(filtros, skip, limit)

    def count_by_estado(self) -> Dict[str, int]:
        # SELECT estado, COUNT(id) FROM pedido GROUP BY estado
        filas = self.session.exec(select(Pedido.estado, func.count(Pedido.id)).group_by(Pedido.estado))
        return {estado: cantidad for estado, cantidad in filas.all()}

    def count_desde(self, desde: datetime) -> int:
        consulta = select(func.count(Pedido.id)).where(Pedido.created_at >= desde)
        return self.session.exec(consulta).one()

    def sum_total_by_estado(self, estado: str) -> float:
        consulta = select(func.coalesce(func.sum(Pedido.total), 0)).where(Pedido.estado == estado)
        return float(self.session.exec(consulta).one())
