# Food Store · Trabajo Práctico Integrador

**Programación 4** · Tecnicatura Universitaria en Programación a Distancia (UTN)
**Alumno:** Luciano de la Rubia

| | |
|---|---|
| Repositorio | https://github.com/luciano-dlr/foodstore-tpi |
| Video de demostración | _(link pendiente)_ |

Aplicación web para un negocio de comidas. Los clientes se registran, recorren el catálogo, arman un carrito y confirman un pedido con dirección de entrega y forma de pago (efectivo o transferencia). El administrador gestiona categorías, productos, stock, pedidos y usuarios, y ve un resumen del negocio.

- **Backend** (`backend/`): FastAPI + SQLModel + PostgreSQL. Arquitectura en capas Router → Service → Unit of Work → Repository → Model, JWT en cookie HttpOnly y roles `user` / `admin`. API bajo `/api/v1`, documentada en `/docs` y `/redoc`.
- **Frontend** (`frontend/`): React 19 + TypeScript (strict) + Vite + Tailwind CSS 4. Axios, TanStack Query, TanStack Form, TanStack Table, React Router y Zustand. Organizado por features.

---

## Índice

1. [Requisitos](#1-requisitos)
2. [Backend: instalación y ejecución](#2-backend-instalación-y-ejecución)
3. [Frontend: instalación y ejecución](#3-frontend-instalación-y-ejecución)
4. [Variables de entorno](#4-variables-de-entorno)
5. [Usuarios del seed](#5-usuarios-del-seed)
6. [Pruebas de la API (.http)](#6-pruebas-de-la-api-http)
7. [Estructura del proyecto](#7-estructura-del-proyecto)
8. [Endpoints](#8-endpoints)
9. [Reglas de negocio → archivos](#9-reglas-de-negocio--archivos)
10. [Criterios de evaluación → archivos](#10-criterios-de-evaluación--archivos)
11. [Formato de entrega (CE-01 a CE-07)](#11-formato-de-entrega-ce-01-a-ce-07)
12. [Decisiones de diseño](#12-decisiones-de-diseño)

---

## 1. Requisitos

| Herramienta | Versión |
|---|---|
| Python | 3.11 a 3.13 (SQLModel no funciona con 3.14) |
| PostgreSQL | 15 o superior |
| Node.js | 20.19 o superior |
| pnpm | 9 o superior (`npm install -g pnpm`) |

> Para una prueba rápida sin PostgreSQL se puede usar SQLite: `DATABASE_URL=sqlite:///./foodstore.db` en `backend/.env`.

---

## 2. Backend: instalación y ejecución

Todos los comandos se ejecutan dentro de `backend/`.

```bash
cd backend
```

**1. Entorno virtual e instalación de dependencias**

```bash
python3 -m venv .venv
```

```bash
source .venv/bin/activate
```

En Windows: `.venv\Scripts\activate`

```bash
pip install -r requirements.txt
```

**2. Variables de entorno**: copiar el ejemplo y ajustar usuario y contraseña de PostgreSQL si hace falta.

```bash
cp .env.example .env
```

**3. Base de datos**: crear la base vacía (las tablas las crea la aplicación).

```bash
createdb -U postgres foodstore_tpi_db
```

**4. Datos iniciales** (idempotente: se puede correr varias veces sin duplicar nada)

```bash
python -m app.db.seed
```

Salida esperada: `Seed OK · creados: 2 usuarios, 5 categorías, 14 productos`.

**5. Servidor**

```bash
uvicorn app.main:app --reload
```

- API: http://localhost:8000/api/v1
- Swagger: http://localhost:8000/docs · ReDoc: http://localhost:8000/redoc

> **Probar en Swagger:** el token viaja solo en la cookie HttpOnly, así que no se usa el botón *Authorize*. Ejecutar `POST /api/v1/auth/token` con *Try it out* (`admin` / `Admin1234!`): el navegador guarda la cookie y la envía en las demás peticiones.

---

## 3. Frontend: instalación y ejecución

Con el backend corriendo, en otra terminal y dentro de `frontend/`:

```bash
cd frontend
```

```bash
pnpm install
```

```bash
cp .env.example .env
```

```bash
pnpm build
```

```bash
pnpm dev
```

- Aplicación: http://localhost:5173
- `pnpm build` verifica los tipos (`tsc -b`) y genera `dist/`. `pnpm lint` corre ESLint.

---

## 4. Variables de entorno

### `backend/.env` (ver `backend/.env.example`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a la base (driver psycopg2) | `postgresql+psycopg2://postgres:postgres@localhost:5432/foodstore_tpi_db` |
| `SECRET_KEY` | Firma del JWT, mínimo 32 caracteres | `cambiar-esta-clave-de-al-menos-32-caracteres` |
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Expiración del token y de la cookie | `30` |
| `FRONTEND_ORIGIN` | Origen permitido por CORS (con credenciales); varios separados por coma | `http://localhost:5173` |

> La URL usa `postgresql+psycopg2://` porque SQLAlchemy 2.1 usa psycopg 3 por defecto. Para generar una clave: `python -c "import secrets; print(secrets.token_urlsafe(48))"`.

### `frontend/.env` (ver `frontend/.env.example`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base de la API | `http://localhost:8000/api/v1` |

---

## 5. Usuarios del seed

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `Admin1234!` | admin |
| `cliente` | `Cliente1234!` | user (de prueba, para quien corrija) |

El seed también carga 5 categorías (Hamburguesas, Pizzas, Acompañamientos, Bebidas, Postres) y 14 productos con imagen y stock, incluidos casos borde: un producto con 3 unidades y otro sin stock. Archivo: `backend/app/db/seed.py`.

---

## 6. Pruebas de la API (.http)

En `backend/http/` hay 119 casos con el status esperado entre paréntesis en cada título. Se ejecutan con la extensión **REST Client** de VS Code, que guarda la cookie del login como el navegador, sobre una base recién cargada con el seed y en este orden:

| Archivo | Qué cubre |
|---|---|
| `auth.http` | Registro (201, 409, 422), login (200, 401, 400 cuenta desactivada), `/me`, logout, cookie adulterada, gestión de usuarios (403, 404, 400 autodesactivación, idempotencia) |
| `catalogo.http` | CRUD de categorías y productos, PUT parcial, baja lógica (204, luego 404), nombre único que la baja no libera, paginación, búsqueda, filtros, PATCH de stock, permisos (401, 403) |
| `pedidos.http` | RN-01 a RN-06: rollback completo cuando falla un ítem, stock descontado y restituido, máquina de estados (transiciones válidas e inválidas), pedidos ajenos (403), resumen |

`backend/http/evidencia_pruebas.txt` tiene la salida de una corrida completa sobre una base nueva: **119/119 OK**.

---

## 7. Estructura del proyecto

```
backend/
├── app/
│   ├── main.py                 FastAPI, CORS con credenciales y routers bajo /api/v1
│   ├── core/
│   │   ├── config.py           Settings (pydantic-settings) leídas de .env
│   │   ├── database.py         engine, create_all_tables y session_factory
│   │   ├── security.py         Hash bcrypt (passlib), create/decode_access_token (python-jose)
│   │   ├── deps.py             get_current_user, get_current_active_user y require_role
│   │   ├── unit_of_work.py     UnitOfWork base: commit / rollback / close en __exit__
│   │   └── base_repository.py  BaseRepository[T]: get_by_id, get_all, add y delete
│   ├── modules/
│   │   ├── auth/               router, service y schemas (usa el modelo Usuario)
│   │   ├── usuarios/           models, schemas, repository, unit_of_work, service y router
│   │   ├── categorias/         misma cadena de archivos
│   │   ├── productos/          misma cadena de archivos
│   │   └── pedidos/            misma cadena + máquina de estados y RN-01 a RN-06
│   └── db/seed.py              Carga idempotente de admin, categorías y productos
├── http/                       Casos .http y evidencia de pruebas
├── requirements.txt            Dependencias con versiones fijadas
└── .env.example

frontend/
├── src/
│   ├── shared/
│   │   ├── api/                axiosInstance, setupInterceptors, handleApiError y queryClient
│   │   ├── ui/                 Button, Card, Input, Modal y BadgeEstado
│   │   ├── components/         Paginacion, Skeleton, EstadoVacio, EstadoError, DataTable, Toast…
│   │   ├── layout/             Navbar, MainLayout y AdminLayout
│   │   ├── hooks/ types/ utils/
│   ├── features/               Un dominio por carpeta: pages, components, hooks, api y types
│   │   ├── auth/               LoginPage, RegisterPage y UnauthorizedPage
│   │   ├── categorias/         AdminCategoriasPage y useCategorias
│   │   ├── productos/          CatalogoPage, AdminProductosPage, ProductoCard y useProductos
│   │   ├── usuarios/           AdminUsuariosPage y useUsuarios
│   │   └── pedidos/            Carrito, Checkout, MisPedidos, AdminPedidos y AdminResumen
│   ├── store/                  authStore, cartStore, notificationStore y themeStore (Zustand)
│   ├── routes/                 AppRouter y ProtectedRoute
│   ├── App.tsx                 checkSession al montar + AppRouter
│   └── main.tsx                QueryClientProvider
├── package.json                Dependencias con versiones fijadas
└── .env.example
```

---

## 8. Endpoints

Prefijo `/api/v1`. Los listados paginados reciben `skip` y `limit` (por defecto 0 y 20, máximo 100) y devuelven `{ "total": N, "items": [...] }`. Errores comunes: 401 sin sesión válida, 400 «Cuenta de usuario desactivada», 403 rol no permitido, 422 validación.

| Método | Endpoint | Acceso | Respuesta | Errores propios |
|---|---|---|---|---|
| POST | `/auth/register` | Público | 201 UserPublic | 409 |
| POST | `/auth/token` | Público | 200 `{"message":"Login exitoso"}` + cookie | 401, 400 |
| POST | `/auth/logout` | Público | 200, borra la cookie | — |
| GET | `/auth/me` | Sesión | 200 UserPublic | — |
| GET | `/admin/usuarios` | admin | 200 list[UserPublic] | — |
| POST | `/admin/usuarios/{id}/activar` | admin | 200 UserPublic | 404 |
| POST | `/admin/usuarios/{id}/desactivar` | admin | 200 UserPublic | 404, 400 |
| GET | `/categorias` | Público | 200 list[CategoriaRead] | — |
| GET | `/categorias/{id}` | Público | 200 CategoriaRead | 404 |
| POST | `/categorias` | admin | 201 CategoriaRead | 409 |
| PUT | `/categorias/{id}` | admin | 200 CategoriaRead | 404, 409 |
| DELETE | `/categorias/{id}` | admin | 204 (baja lógica) | 404 |
| GET | `/productos?skip&limit&search&categoria_id&disponible` | Público | 200 ProductosPaginados | — |
| GET | `/productos/{id}` | Público | 200 ProductoRead | 404 |
| POST | `/productos` | admin | 201 ProductoRead | 404 categoría |
| PUT | `/productos/{id}` | admin | 200 ProductoRead | 404 |
| PATCH | `/productos/{id}/stock` | admin | 200 ProductoRead | 404 |
| DELETE | `/productos/{id}` | admin | 204 (baja lógica) | 404 |
| POST | `/pedidos` | Sesión | 201 PedidoRead | 404, 400 |
| GET | `/pedidos?skip&limit&estado` | Sesión | 200 PedidosPaginados (propios o todos) | — |
| GET | `/pedidos/resumen` | admin | 200 ResumenPedidos | — |
| GET | `/pedidos/{id}` | Dueño o admin | 200 PedidoRead | 404, 403 |
| PATCH | `/pedidos/{id}/estado` | admin | 200 PedidoRead | 404, 400 |
| PATCH | `/pedidos/{id}/cancelar` | Dueño | 200 PedidoRead | 404, 403, 400 |

---

## 9. Reglas de negocio → archivos

| Regla | Dónde se cumple | Prueba |
|---|---|---|
| **RN-01** Crear pedido: al menos un ítem, sin productos repetidos; cada producto activo, disponible y con stock; por ítem se verifica, se descuenta el stock y se crea la línea con copia de nombre y precio; todo en una transacción | `pedidos/service.py` → `PedidoService.crear` (con `SELECT … FOR UPDATE` en `productos/repository.py` → `get_for_update`); mínimo un ítem en `pedidos/schemas.py` → `PedidoCreate` | `pedidos.http` 8 a 19 (el 11 y el 12 prueban el rollback) |
| **RN-02** Transiciones solo según la tabla; los estados terminales no cambian; transición inválida → 400 | `pedidos/service.py` → diccionario `TRANSICIONES` y `_transicionar` | `pedidos.http` 39 a 48 |
| **RN-03** Cancelar restituye el stock en la misma transacción | `pedidos/service.py` → `_transicionar` (rama `CANCELADO`) | `pedidos.http` 26 a 29, 46 y 47 |
| **RN-04** El cliente ve y cancela solo lo suyo y solo en PENDIENTE; el admin ve todo y avanza o cancela | `pedidos/service.py` → `listar`, `obtener`, `cancelar`; roles en `pedidos/router.py` (`CurrentUser` / `AdminUser`) | `pedidos.http` 20 a 25, 30, 38, 52 y 53 |
| **RN-05** Líneas y total inmutables; sin endpoints de edición ni borrado de pedidos | `pedidos/models.py` (copia en `DetallePedido`), `pedidos/router.py` (sin PUT ni DELETE) | `/docs` |
| **RN-06** `forma_pago` EFECTIVO o TRANSFERENCIA, dirección de 5 a 200 caracteres | `pedidos/schemas.py` → `FormaPago` y `PedidoCreate` | `pedidos.http` 16 a 18 |
| Baja lógica: un registro dado de baja responde 404; la baja de categoría no libera el nombre | `categorias/service.py` y `productos/service.py` → `_obtener_activa` / `_obtener_activo`; `categorias/repository.py` → `get_by_nombre` | `catalogo.http` 10 a 14 y 32 a 36 |
| El admin no puede desactivarse a sí mismo; activar y desactivar son idempotentes | `usuarios/service.py` → `cambiar_estado` | `auth.http` 14 a 21 |

Las rutas son relativas a `backend/app/modules/`.

---

## 10. Criterios de evaluación → archivos

| # | Criterio | Implementación |
|---|---|---|
| 1 | Backend: estructura y configuración | `app/core/*`, `app/modules/*` (capas por dominio), `.env.example`, `requirements.txt` con versiones fijadas (incluye `passlib[bcrypt]==1.7.4` y `bcrypt==4.0.1`), CORS con credenciales en `app/main.py`, seed idempotente en `app/db/seed.py` |
| 2 | Modelo de datos | `usuarios/models.py`, `categorias/models.py`, `productos/models.py`, `pedidos/models.py`: las 5 entidades del UML, relaciones con `Relationship` y `back_populates` con los nombres exactos (`Categoria.productos`/`Producto.categoria`, `Usuario.pedidos`/`Pedido.usuario`, `Pedido.items`/`DetallePedido.pedido`, `Producto.detalles`/`DetallePedido.producto`), baja lógica con `activo`/`disabled`, copia de `nombre_producto` y `precio_unitario` |
| 3 | Unit of Work y Repository | `core/unit_of_work.py` (`__enter__`/`__exit__` con commit, rollback y close), `core/base_repository.py` (`BaseRepository[T]`), UoW por módulo (`*/unit_of_work.py`; `PedidoUnitOfWork` expone pedidos y productos). Los services abren `with self.uow as uow:` y devuelven el schema dentro del bloque; los routers obtienen el service con `Depends(get_<modulo>_service)`. Ningún Service ni Router llama a `commit()` |
| 4 | Autenticación y usuarios | `auth/router.py` (cookie HttpOnly `access_token`, 30 min; el cuerpo no lleva el token), `auth/service.py`, `core/deps.py`, `core/security.py`, `usuarios/router.py` (listado, activar, desactivar) |
| 5 | API de catálogo | `categorias/router.py`, `productos/router.py` y sus services: listado paginado con `search` sin distinguir mayúsculas, `categoria_id` y `disponible`; PATCH de stock; DELETE 204 con baja lógica |
| 6 | API de pedidos y reglas | `pedidos/service.py` (RN-01 a RN-06 y excepciones de dominio), `pedidos/router.py` (traducción a 400/403/404; `/resumen` declarado antes de `/{id}`), `pedidos/repository.py` (`list_by_usuario`, `count_by_estado` con `func.count`) |
| 7 | Frontend: cliente | `auth/pages/LoginPage.tsx` y `RegisterPage.tsx` (TanStack Form); `productos/pages/CatalogoPage.tsx` (paginado en el servidor con `skip = página × limit`, búsqueda, filtro por categoría, skeleton y estado vacío); `pedidos/pages/CarritoPage.tsx`, `CheckoutPage.tsx` + `components/CheckoutForm.tsx` (TanStack Form) y `MisPedidosPage.tsx` (detalle y cancelar en PENDIENTE) |
| 8 | Frontend: panel de administración | `pedidos/pages/AdminResumenPage.tsx` (tarjetas), `categorias/pages/AdminCategoriasPage.tsx` y `productos/pages/AdminProductosPage.tsx` (TanStack Table + TanStack Form, `StockModal.tsx`), `pedidos/pages/AdminPedidosPage.tsx` (filtro por estado, avanzar o cancelar), `usuarios/pages/AdminUsuariosPage.tsx` (activar y desactivar; sin «Desactivar» en la fila propia) |
| 9 | Frontend: estado, datos y sesión | TanStack Query en `features/*/hooks` con `invalidateQueries`; `store/authStore.ts` (`persist` + `partialize` que guarda solo `usuario`, nunca el token) y `store/cartStore.ts` (`persist`); `shared/api/axiosInstance.ts` (`withCredentials`) y `setupInterceptors.ts` (401 y cuenta desactivada → limpia la sesión); `routes/ProtectedRoute.tsx` (sin sesión → `/login`, sin rol → `/unauthorized`). El único `useEffect` con llamada a la API es `checkSession` en `App.tsx` |
| 10 | Calidad y entrega | `tsconfig.app.json` con `"strict": true`, sin `any` (regla `no-explicit-any` de typescript-eslint, `pnpm lint` sin errores); imports por barrel de cada feature (`eslint.config.js`); este README |

Rutas del frontend relativas a `frontend/src/features/` salvo que se indique otra carpeta.

---

## 11. Formato de entrega (CE-01 a CE-07)

| Ítem | Cumplimiento |
|---|---|
| CE-01 | Zip sin `node_modules`, `.venv` ni `.env` + repositorio público (URL arriba) |
| CE-02 | Este README: requisitos, instalación, ejecución, variables y usuario admin |
| CE-03 | `backend/.env.example` y `frontend/.env.example` |
| CE-04 | `python -m app.db.seed` carga admin, 5 categorías y 14 productos |
| CE-05 | `pip install -r requirements.txt` + `uvicorn app.main:app`; `/docs` muestra los 24 endpoints |
| CE-06 | `pnpm install`, `pnpm build` y `pnpm dev` sin errores |
| CE-07 | Video de demostración (link arriba) |

---

## 12. Decisiones de diseño

- **Baja lógica con booleanos** (`activo` en Categoria y Producto, `disabled` en Usuario), tal como define el UML de la consigna. Los pedidos no se borran: se cancelan.
- **Concurrencia de stock:** al crear o cancelar un pedido, el producto se lee con `SELECT … FOR UPDATE`, así dos pedidos simultáneos no pueden vender la misma unidad.
- **Montos** como `float` según el UML, redondeados a 2 decimales en el Service.
- **Nombre único de categoría** comparado sin distinguir mayúsculas.
- **`pedidos_hoy`** cuenta los pedidos creados desde la medianoche, en la zona horaria del servidor.
- **Frontend:** además del stack pedido se usa `lucide-react` para los íconos. El carrito limita la cantidad al stock conocido, pero la validación real (stock y precio vigentes) la hace el backend al crear el pedido. Si una imagen no carga, se muestra un placeholder.
- **Seguridad:** el frontend nunca lee ni guarda el token; ocultar botones según el rol es solo UX, la protección real está en `require_role` del backend.
