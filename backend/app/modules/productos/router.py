from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Path, Query, Response, status

from app.core.deps import AdminUser
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.service import (
    CategoriaNoEncontrada,
    ProductoNoEncontrado,
    ProductoService,
    get_producto_service,
)

router = APIRouter(prefix="/productos", tags=["Productos"])

# El Router obtiene el Service con Depends y nunca abre el Unit of Work
ServiceDep = Annotated[ProductoService, Depends(get_producto_service)]
IdPath = Annotated[int, Path(gt=0)]


def _no_encontrado(error: Exception) -> HTTPException:
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error))


# ---------------------------------------------------------
# LISTAR PRODUCTOS ACTIVOS, PAGINADO CON BÚSQUEDA Y FILTROS (público)
# Método: GET | Endpoint: /api/v1/productos | Estado: 200 OK
# Respuesta: {"total": N, "items": [...]}
# ---------------------------------------------------------
@router.get("", response_model=ProductosPaginados)
def listar_productos(
    service: ServiceDep,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None, max_length=100, description="Busca en el nombre"),
    categoria_id: Optional[int] = Query(None, gt=0),
    disponible: Optional[bool] = Query(None),
):
    return service.listar(skip, limit, search, categoria_id, disponible)


# ---------------------------------------------------------
# DETALLE DE PRODUCTO CON SU CATEGORÍA (público)
# Método: GET | Endpoint: /api/v1/productos/{id} | Estado: 200 OK
# ---------------------------------------------------------
@router.get("/{id}", response_model=ProductoRead, responses={404: {"description": "No encontrado"}})
def obtener_producto(id: IdPath, service: ServiceDep):
    try:
        return service.obtener(id)
    except ProductoNoEncontrado as e:
        raise _no_encontrado(e)


# ---------------------------------------------------------
# CREAR PRODUCTO (admin)
# Método: POST | Endpoint: /api/v1/productos | Estado: 201 Created
# ---------------------------------------------------------
@router.post(
    "",
    response_model=ProductoRead,
    status_code=status.HTTP_201_CREATED,
    responses={404: {"description": "La categoría no existe o está dada de baja"}},
)
def crear_producto(datos: ProductoCreate, _admin: AdminUser, service: ServiceDep):
    try:
        return service.crear(datos)
    except CategoriaNoEncontrada as e:
        raise _no_encontrado(e)


# ---------------------------------------------------------
# ACTUALIZAR PRODUCTO (admin, parcial)
# Método: PUT | Endpoint: /api/v1/productos/{id} | Estado: 200 OK
# ---------------------------------------------------------
@router.put(
    "/{id}",
    response_model=ProductoRead,
    responses={404: {"description": "Producto o categoría inexistente"}},
)
def actualizar_producto(id: IdPath, datos: ProductoUpdate, _admin: AdminUser, service: ServiceDep):
    try:
        return service.actualizar(id, datos)
    except (ProductoNoEncontrado, CategoriaNoEncontrada) as e:
        raise _no_encontrado(e)


# ---------------------------------------------------------
# CAMBIAR STOCK Y DISPONIBILIDAD (admin)
# Método: PATCH | Endpoint: /api/v1/productos/{id}/stock | Estado: 200 OK
# ---------------------------------------------------------
@router.patch(
    "/{id}/stock",
    response_model=ProductoRead,
    responses={404: {"description": "No encontrado"}},
)
def cambiar_stock(id: IdPath, datos: ProductoStockUpdate, _admin: AdminUser, service: ServiceDep):
    try:
        return service.cambiar_stock(id, datos)
    except ProductoNoEncontrado as e:
        raise _no_encontrado(e)


# ---------------------------------------------------------
# BAJA LÓGICA DE PRODUCTO (admin)
# Método: DELETE | Endpoint: /api/v1/productos/{id} | Estado: 204 No Content
# ---------------------------------------------------------
@router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={404: {"description": "No encontrado"}},
)
def eliminar_producto(id: IdPath, _admin: AdminUser, service: ServiceDep):
    try:
        service.eliminar(id)
    except ProductoNoEncontrado as e:
        raise _no_encontrado(e)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
