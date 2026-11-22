from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import create_all_tables
from app.modules.auth.router import router as auth_router
from app.modules.categorias.router import router as categorias_router
from app.modules.pedidos.router import router as pedidos_router
from app.modules.productos.router import router as productos_router
from app.modules.usuarios.router import router as usuarios_router

API_PREFIX = "/api/v1"


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Al iniciar: crea las tablas si no existen (datos iniciales: python -m app.db.seed)
    create_all_tables()
    yield


app = FastAPI(
    title="Food Store API",
    description="TPI Programación 4 · Sistema de pedidos de comida. FastAPI + SQLModel + "
    "PostgreSQL, arquitectura en capas con Unit of Work, JWT en cookie HttpOnly y roles "
    "user / admin. Para probar en Swagger: ejecutar POST /api/v1/auth/token (Try it out) "
    "con admin / Admin1234!; el navegador guarda la cookie y la envía en las demás peticiones.",
    version="1.0.0",
    lifespan=lifespan,
)

# ---------------------------------------------------------
# CORS CON CREDENCIALES
# allow_credentials=True permite que el navegador envíe y reciba la cookie
# HttpOnly desde el frontend (otro origen). El origen tiene que ser explícito.
# ---------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origenes_cors,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# ROUTERS (todos bajo /api/v1)
# ---------------------------------------------------------
app.include_router(auth_router, prefix=API_PREFIX)
app.include_router(usuarios_router, prefix=API_PREFIX)
app.include_router(categorias_router, prefix=API_PREFIX)
app.include_router(productos_router, prefix=API_PREFIX)
app.include_router(pedidos_router, prefix=API_PREFIX)


# ---------------------------------------------------------
# HEALTH CHECK (público)
# Método: GET | Endpoint: /health | Estado: 200 OK
# ---------------------------------------------------------
@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}
