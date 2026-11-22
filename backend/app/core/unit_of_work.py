from typing import Callable, Self

from sqlmodel import Session

from app.core.database import session_factory as default_session_factory


# ---------------------------------------------------------
# UNIT OF WORK BASE
# Fija en un solo lugar dónde empieza y dónde termina la transacción:
# - __enter__: abre la sesión y crea los repositorios que la comparten
# - __exit__: commit si no hubo errores, rollback si hubo una excepción,
#   y close siempre (try/finally)
# Ningún Service ni Router llama a session.commit(): solo este __exit__.
# Cada módulo lo hereda y redefine _crear_repositorios().
# ---------------------------------------------------------
class UnitOfWork:
    def __init__(self, session_factory: Callable[[], Session] = default_session_factory):
        self.session_factory = session_factory

    def _crear_repositorios(self) -> None:
        pass  # Cada Unit of Work de módulo expone sus repositorios

    def __enter__(self) -> Self:
        self.session = self.session_factory()
        self._crear_repositorios()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        try:
            if exc_type:
                self.session.rollback()
            else:
                self.session.commit()
        finally:
            self.session.close()
        # No devuelve True: la excepción original sigue hacia el Router
