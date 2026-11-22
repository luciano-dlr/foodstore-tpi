from typing import List

from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


# ---------------------------------------------------------
# EXCEPCIONES DE DOMINIO (el Router las traduce a HTTP)
# ---------------------------------------------------------
class CategoriaNoEncontrada(Exception):
    pass  # → 404


class NombreDuplicado(Exception):
    pass  # → 409


# ---------------------------------------------------------
# SERVICE DE CATEGORÍAS
# Abre "with self.uow as uow:", aplica las reglas y devuelve el schema de
# salida dentro del bloque. El commit lo hace el __exit__ del Unit of Work.
# ---------------------------------------------------------
class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork):
        self.uow = uow

    @staticmethod
    def _obtener_activa(uow: CategoriaUnitOfWork, id: int) -> Categoria:
        # Una categoría dada de baja se trata como inexistente
        categoria = uow.categorias.get_by_id(id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada(f"No existe una categoría con id {id}")
        return categoria

    def listar(self) -> List[CategoriaRead]:
        with self.uow as uow:
            return [CategoriaRead.model_validate(c) for c in uow.categorias.list_activas()]

    def obtener(self, id: int) -> CategoriaRead:
        with self.uow as uow:
            return CategoriaRead.model_validate(self._obtener_activa(uow, id))

    def crear(self, datos: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            nombre = datos.nombre.strip()
            if uow.categorias.get_by_nombre(nombre):
                raise NombreDuplicado(f"Ya existe una categoría llamada '{nombre}'")
            categoria = Categoria(nombre=nombre, descripcion=datos.descripcion)
            uow.categorias.add(categoria)
            return CategoriaRead.model_validate(categoria)

    def actualizar(self, id: int, datos: CategoriaUpdate) -> CategoriaRead:
        with self.uow as uow:
            categoria = self._obtener_activa(uow, id)
            cambios = datos.model_dump(exclude_unset=True)
            if cambios.get("nombre") is not None:
                nombre = cambios["nombre"].strip()
                otra = uow.categorias.get_by_nombre(nombre)
                if otra and otra.id != categoria.id:
                    raise NombreDuplicado(f"Ya existe una categoría llamada '{nombre}'")
                cambios["nombre"] = nombre
            elif "nombre" in cambios:
                cambios.pop("nombre")  # nombre es obligatorio en la tabla: null se ignora
            for campo, valor in cambios.items():
                setattr(categoria, campo, valor)
            uow.categorias.add(categoria)
            return CategoriaRead.model_validate(categoria)

    def eliminar(self, id: int) -> None:
        # Baja lógica: activo = false (no oculta los productos de la categoría)
        with self.uow as uow:
            categoria = self._obtener_activa(uow, id)
            categoria.activo = False
            uow.categorias.add(categoria)


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork())
