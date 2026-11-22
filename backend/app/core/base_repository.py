from typing import Generic, List, Optional, Type, TypeVar

from sqlmodel import Session, SQLModel, select

ModelT = TypeVar("ModelT", bound=SQLModel)


# ---------------------------------------------------------
# REPOSITORIO BASE: BaseRepository[T]
# Encapsula el acceso a los datos de una entidad. Cada módulo lo hereda,
# indica su modelo y agrega sus consultas propias. Sin reglas de negocio.
# Nunca llama a commit(): flush() envía el INSERT/UPDATE dentro de la
# transacción del Unit of Work (y la base asigna el id autoincremental).
# ---------------------------------------------------------
class BaseRepository(Generic[ModelT]):
    model: Type[ModelT]

    def __init__(self, session: Session):
        self.session = session

    def get_by_id(self, id: int) -> Optional[ModelT]:
        return self.session.get(self.model, id)

    def get_all(self) -> List[ModelT]:
        # ORDER BY id: PostgreSQL no garantiza el orden sin él
        return list(self.session.exec(select(self.model).order_by(self.model.id)).all())

    def add(self, entity: ModelT) -> ModelT:
        self.session.add(entity)
        self.session.flush()
        self.session.refresh(entity)
        return entity

    def delete(self, entity: ModelT) -> None:
        # Borrado físico genérico. Food Store no lo usa: el catálogo tiene baja
        # lógica (activo = false) y los pedidos no se borran
        self.session.delete(entity)
        self.session.flush()
