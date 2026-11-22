from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status

from app.core.deps import AdminUser, CurrentUser
from app.modules.pedidos.schemas import (
    CambioEstado,
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    PedidoAjeno,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoEncontrado,
    ReglaDeNegocio,
    get_pedido_service,
)

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])

# El Router obtiene el Service con Depends y nunca abre el Unit of Work
ServiceDep = Annotated[PedidoService, Depends(get_pedido_service)]
IdPath = Annotated[int, Path(gt=0)]


# ---------------------------------------------------------
# TRADUCCIÓN DE EXCEPCIONES DE DOMINIO A HTTP
# ---------------------------------------------------------
def _a_http(error: Exception) -> HTTPException:
    if isinstance(error, (PedidoNoEncontrado, ProductoNoEncontrado)):
        return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error))
    if isinstance(error, PedidoAjeno):
        return HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(error))
    return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(error))


ERRORES_DOMINIO = (PedidoNoEncontrado, ProductoNoEncontrado, PedidoAjeno, ReglaDeNegocio)


# ---------------------------------------------------------
# CREAR PEDIDO DESDE EL CARRITO (RN-01) — sesión
# Método: POST | Endpoint: /api/v1/pedidos | Estado: 201 Created
# ---------------------------------------------------------
@router.post(
    "",
    response_model=PedidoRead,
    status_code=status.HTTP_201_CREATED,
    responses={
        404: {"description": "Producto inexistente o inactivo"},
        400: {"description": "Stock insuficiente, producto no disponible o repetido"},
    },
)
def crear_pedido(datos: PedidoCreate, usuario: CurrentUser, service: ServiceDep):
    try:
        return service.crear(usuario, datos)
    except ERRORES_DOMINIO as e:
        raise _a_http(e)


# ---------------------------------------------------------
# LISTAR PEDIDOS: propios (user) o todos (admin) — sesión
# Método: GET | Endpoint: /api/v1/pedidos | Estado: 200 OK
# ---------------------------------------------------------
@router.get("", response_model=PedidosPaginados)
def listar_pedidos(
    usuario: CurrentUser,
    service: ServiceDep,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    estado: Optional[EstadoPedido] = Query(None),
):
    return service.listar(usuario, skip, limit, estado)


# ---------------------------------------------------------
# RESUMEN PARA EL PANEL — admin
# Método: GET | Endpoint: /api/v1/pedidos/resumen | Estado: 200 OK
# Se declara antes de /{id} para que "resumen" no se tome como id
# ---------------------------------------------------------
@router.get("/resumen", response_model=ResumenPedidos)
def resumen_pedidos(_admin: AdminUser, service: ServiceDep):
    return service.resumen()


# ---------------------------------------------------------
# DETALLE CON SUS LÍNEAS — dueño o admin (RN-04)
# Método: GET | Endpoint: /api/v1/pedidos/{id} | Estado: 200 OK
# ---------------------------------------------------------
@router.get(
    "/{id}",
    response_model=PedidoRead,
    responses={404: {"description": "No encontrado"}, 403: {"description": "Pedido de otro usuario"}},
)
def obtener_pedido(id: IdPath, usuario: CurrentUser, service: ServiceDep):
    try:
        return service.obtener(usuario, id)
    except ERRORES_DOMINIO as e:
        raise _a_http(e)


# ---------------------------------------------------------
# AVANZAR O CANCELAR SEGÚN LA MÁQUINA DE ESTADOS (RN-02, RN-03) — admin
# Método: PATCH | Endpoint: /api/v1/pedidos/{id}/estado | Estado: 200 OK
# ---------------------------------------------------------
@router.patch(
    "/{id}/estado",
    response_model=PedidoRead,
    responses={404: {"description": "No encontrado"}, 400: {"description": "Transición inválida"}},
)
def cambiar_estado(id: IdPath, datos: CambioEstado, _admin: AdminUser, service: ServiceDep):
    try:
        return service.cambiar_estado(id, datos.estado)
    except ERRORES_DOMINIO as e:
        raise _a_http(e)


# ---------------------------------------------------------
# CANCELAR UN PEDIDO PROPIO EN PENDIENTE (RN-03, RN-04) — dueño
# Método: PATCH | Endpoint: /api/v1/pedidos/{id}/cancelar | Estado: 200 OK
# ---------------------------------------------------------
@router.patch(
    "/{id}/cancelar",
    response_model=PedidoRead,
    responses={
        404: {"description": "No encontrado"},
        403: {"description": "Pedido ajeno"},
        400: {"description": "El pedido no está en PENDIENTE"},
    },
)
def cancelar_pedido(id: IdPath, usuario: CurrentUser, service: ServiceDep):
    try:
        return service.cancelar(usuario, id)
    except ERRORES_DOMINIO as e:
        raise _a_http(e)
