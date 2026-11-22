from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

# ---------------------------------------------------------
# ENGINE (instancia única para toda la aplicación)
# SQLite necesita check_same_thread=False porque FastAPI usa varios hilos
# ---------------------------------------------------------
_connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(settings.DATABASE_URL, echo=settings.SQL_ECHO, connect_args=_connect_args)


def create_all_tables() -> None:
    # Importamos los modelos para que queden registrados en SQLModel.metadata
    from app.modules.usuarios import models as usuarios_models  # noqa: F401
    from app.modules.categorias import models as categorias_models  # noqa: F401
    from app.modules.productos import models as productos_models  # noqa: F401
    from app.modules.pedidos import models as pedidos_models  # noqa: F401

    SQLModel.metadata.create_all(engine)


# ---------------------------------------------------------
# FÁBRICA DE SESIONES
# Cada vez que un Service abre "with self.uow as uow:", el Unit of Work
# llama a esta función y obtiene una sesión nueva
# ---------------------------------------------------------
def session_factory() -> Session:
    return Session(engine)
