from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, Path, status

from app.core.deps import AdminUser
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import (
    AutoDesactivacion,
    UsuarioNoEncontrado,
    UsuarioService,
    get_usuario_service,
)

router = APIRouter(prefix="/admin/usuarios", tags=["Usuarios (admin)"])

ServiceDep = Annotated[UsuarioService, Depends(get_usuario_service)]


# ---------------------------------------------------------
# LISTAR USUARIOS (incluye desactivados) — solo admin
# Método: GET | Endpoint: /api/v1/admin/usuarios | Estado: 200 OK
# ---------------------------------------------------------
@router.get("", response_model=List[UserPublic])
def listar_usuarios(_admin: AdminUser, service: ServiceDep):
    return service.listar()


# ---------------------------------------------------------
# ACTIVAR (disabled = false) — solo admin
# Método: POST | Endpoint: /api/v1/admin/usuarios/{id}/activar | Estado: 200 OK
# ---------------------------------------------------------
@router.post(
    "/{id}/activar",
    response_model=UserPublic,
    responses={404: {"description": "Usuario no encontrado"}},
)
def activar_usuario(admin: AdminUser, service: ServiceDep, id: int = Path(..., gt=0)):
    try:
        return service.cambiar_estado(id, activo=True, admin_id=admin.id)
    except UsuarioNoEncontrado as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


# ---------------------------------------------------------
# DESACTIVAR (disabled = true) — solo admin
# Método: POST | Endpoint: /api/v1/admin/usuarios/{id}/desactivar | Estado: 200 OK
# ---------------------------------------------------------
@router.post(
    "/{id}/desactivar",
    response_model=UserPublic,
    responses={
        404: {"description": "Usuario no encontrado"},
        400: {"description": "El administrador intenta desactivarse a sí mismo"},
    },
)
def desactivar_usuario(admin: AdminUser, service: ServiceDep, id: int = Path(..., gt=0)):
    try:
        return service.cambiar_estado(id, activo=False, admin_id=admin.id)
    except UsuarioNoEncontrado as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except AutoDesactivacion as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
