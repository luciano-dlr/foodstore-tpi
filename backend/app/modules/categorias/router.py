from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, Path, Response, status

from app.core.deps import AdminUser
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.service import (
    CategoriaNoEncontrada,
    CategoriaService,
    NombreDuplicado,
    get_categoria_service,
)

router = APIRouter(prefix="/categorias", tags=["Categorías"])

# El Router obtiene el Service con Depends y nunca abre el Unit of Work
ServiceDep = Annotated[CategoriaService, Depends(get_categoria_service)]
IdPath = Annotated[int, Path(gt=0)]


# ---------------------------------------------------------
# LISTAR CATEGORÍAS ACTIVAS (público)
# Método: GET | Endpoint: /api/v1/categorias | Estado: 200 OK
# ---------------------------------------------------------
@router.get("", response_model=List[CategoriaRead])
def listar_categorias(service: ServiceDep):
    return service.listar()


# ---------------------------------------------------------
# DETALLE DE CATEGORÍA (público)
# Método: GET | Endpoint: /api/v1/categorias/{id} | Estado: 200 OK
# ---------------------------------------------------------
@router.get("/{id}", response_model=CategoriaRead, responses={404: {"description": "No encontrada"}})
def obtener_categoria(id: IdPath, service: ServiceDep):
    try:
        return service.obtener(id)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


# ---------------------------------------------------------
# CREAR CATEGORÍA (admin)
# Método: POST | Endpoint: /api/v1/categorias | Estado: 201 Created
# ---------------------------------------------------------
@router.post(
    "",
    response_model=CategoriaRead,
    status_code=status.HTTP_201_CREATED,
    responses={409: {"description": "Nombre duplicado"}},
)
def crear_categoria(datos: CategoriaCreate, _admin: AdminUser, service: ServiceDep):
    try:
        return service.crear(datos)
    except NombreDuplicado as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


# ---------------------------------------------------------
# ACTUALIZAR CATEGORÍA (admin, parcial)
# Método: PUT | Endpoint: /api/v1/categorias/{id} | Estado: 200 OK
# ---------------------------------------------------------
@router.put(
    "/{id}",
    response_model=CategoriaRead,
    responses={404: {"description": "No encontrada"}, 409: {"description": "Nombre duplicado"}},
)
def actualizar_categoria(id: IdPath, datos: CategoriaUpdate, _admin: AdminUser, service: ServiceDep):
    try:
        return service.actualizar(id, datos)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except NombreDuplicado as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


# ---------------------------------------------------------
# BAJA LÓGICA DE CATEGORÍA (admin)
# Método: DELETE | Endpoint: /api/v1/categorias/{id} | Estado: 204 No Content
# ---------------------------------------------------------
@router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={404: {"description": "No encontrada"}},
)
def eliminar_categoria(id: IdPath, _admin: AdminUser, service: ServiceDep):
    try:
        service.eliminar(id)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    return Response(status_code=status.HTTP_204_NO_CONTENT)
