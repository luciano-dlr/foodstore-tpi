from datetime import datetime
from typing import Dict, Optional, Set

from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import (
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.models import ahora
from app.modules.usuarios.schemas import UserPublic


# ---------------------------------------------------------
# EXCEPCIONES DE DOMINIO (el Router las traduce a HTTP)
# ---------------------------------------------------------
class PedidoNoEncontrado(Exception):
    pass  # → 404


class ProductoNoEncontrado(Exception):
    pass  # → 404 (no existe o está dado de baja)


class PedidoAjeno(Exception):
    pass  # → 403


class ReglaDeNegocio(Exception):
    pass  # → 400: base de las reglas de negocio


class StockInsuficiente(ReglaDeNegocio):
    pass


class ProductoNoDisponible(ReglaDeNegocio):
    pass


class ProductoRepetido(ReglaDeNegocio):
    pass


class TransicionInvalida(ReglaDeNegocio):
    pass


class PedidoNoCancelable(ReglaDeNegocio):
    pass


# ---------------------------------------------------------
# MÁQUINA DE ESTADOS (RN-02)
# Mapa de transiciones válidas. ENTREGADO y CANCELADO son terminales.
# ---------------------------------------------------------
TRANSICIONES: Dict[EstadoPedido, Set[EstadoPedido]] = {
    EstadoPedido.PENDIENTE: {EstadoPedido.EN_PREPARACION, EstadoPedido.CANCELADO},
    EstadoPedido.EN_PREPARACION: {EstadoPedido.ENTREGADO, EstadoPedido.CANCELADO},
    EstadoPedido.ENTREGADO: set(),
    EstadoPedido.CANCELADO: set(),
}


def _es_admin(usuario: UserPublic) -> bool:
    return usuario.role == "admin"


# ---------------------------------------------------------
# SERVICE DE PEDIDOS (RN-01 a RN-06)
# Todo ocurre dentro de "with self.uow as uow:". Si se lanza una excepción,
# el __exit__ del Unit of Work hace rollback: no se persiste nada, tampoco
# el descuento de stock. Ningún método llama a commit().
# ---------------------------------------------------------
class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork):
        self.uow = uow

    # ----- RN-01: crear pedido desde el carrito -----
    def crear(self, usuario: UserPublic, datos: PedidoCreate) -> PedidoRead:
        with self.uow as uow:
            # Ningún producto repetido entre los ítems
            ids = [item.producto_id for item in datos.items]
            repetidos = sorted({i for i in ids if ids.count(i) > 1})
            if repetidos:
                raise ProductoRepetido(f"Productos repetidos en el pedido: {repetidos}")

            # El pedido nace en PENDIENTE con total = 0 (INSERT, sin commit)
            pedido = Pedido(
                usuario_id=usuario.id,
                estado=EstadoPedido.PENDIENTE.value,
                forma_pago=datos.forma_pago.value,
                direccion_entrega=datos.direccion_entrega,
                notas=datos.notas.strip() if datos.notas and datos.notas.strip() else None,
                total=0,
            )
            uow.pedidos.add(pedido)

            total = 0.0
            for item in datos.items:
                # Lectura con bloqueo de fila (SELECT ... FOR UPDATE)
                producto = uow.productos.get_for_update(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(f"No existe un producto con id {item.producto_id}")
                if not producto.disponible:
                    raise ProductoNoDisponible(f"El producto '{producto.nombre}' no está disponible")
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        f"Stock insuficiente para '{producto.nombre}': "
                        f"disponible {producto.stock}, pedido {item.cantidad}"
                    )

                # En la misma iteración: descuenta el stock y crea la línea con la copia
                producto.stock -= item.cantidad
                precio = round(producto.precio_base, 2)
                subtotal = round(precio * item.cantidad, 2)
                pedido.items.append(
                    DetallePedido(
                        producto_id=producto.id,
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,
                        precio_unitario=precio,
                        subtotal=subtotal,
                    )
                )
                total += subtotal

            # total = suma de los subtotales; fijo desde acá (RN-05)
            pedido.total = round(total, 2)
            uow.pedidos.add(pedido)
            return PedidoRead.model_validate(pedido)

    # ----- Listado: propios (user) o todos (admin) -----
    def listar(
        self, usuario: UserPublic, skip: int, limit: int, estado: Optional[EstadoPedido]
    ) -> PedidosPaginados:
        with self.uow as uow:
            filtro = estado.value if estado else None
            if _es_admin(usuario):
                total, pedidos = uow.pedidos.list_all(skip, limit, filtro)
            else:
                total, pedidos = uow.pedidos.list_by_usuario(usuario.id, skip, limit, filtro)
            return PedidosPaginados(total=total, items=[PedidoRead.model_validate(p) for p in pedidos])

    # ----- Detalle: dueño o admin (RN-04) -----
    def obtener(self, usuario: UserPublic, id: int) -> PedidoRead:
        with self.uow as uow:
            pedido = self._obtener(uow, id)
            if not _es_admin(usuario) and pedido.usuario_id != usuario.id:
                raise PedidoAjeno("El pedido pertenece a otro usuario")
            return PedidoRead.model_validate(pedido)

    # ----- RN-02 y RN-03: el admin avanza o cancela -----
    def cambiar_estado(self, id: int, nuevo: EstadoPedido) -> PedidoRead:
        with self.uow as uow:
            pedido = self._obtener(uow, id)
            self._transicionar(uow, pedido, nuevo)
            return PedidoRead.model_validate(pedido)

    # ----- RN-03 y RN-04: el dueño cancela solo desde PENDIENTE -----
    def cancelar(self, usuario: UserPublic, id: int) -> PedidoRead:
        with self.uow as uow:
            pedido = self._obtener(uow, id)
            if pedido.usuario_id != usuario.id:
                raise PedidoAjeno("Solo podés cancelar tus propios pedidos")
            if pedido.estado != EstadoPedido.PENDIENTE.value:
                raise PedidoNoCancelable(
                    f"Solo se puede cancelar un pedido PENDIENTE (estado actual: {pedido.estado})"
                )
            self._transicionar(uow, pedido, EstadoPedido.CANCELADO)
            return PedidoRead.model_validate(pedido)

    # ----- Resumen del panel de administración -----
    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            conteos = uow.pedidos.count_by_estado()
            # "Hoy" = desde la medianoche en la zona horaria del servidor
            inicio_hoy = datetime.now().astimezone().replace(hour=0, minute=0, second=0, microsecond=0)
            return ResumenPedidos(
                pendientes=conteos.get(EstadoPedido.PENDIENTE.value, 0),
                en_preparacion=conteos.get(EstadoPedido.EN_PREPARACION.value, 0),
                entregados=conteos.get(EstadoPedido.ENTREGADO.value, 0),
                cancelados=conteos.get(EstadoPedido.CANCELADO.value, 0),
                pedidos_hoy=uow.pedidos.count_desde(inicio_hoy),
                ingresos_entregados=round(
                    uow.pedidos.sum_total_by_estado(EstadoPedido.ENTREGADO.value), 2
                ),
            )

    # ----- Auxiliares -----
    @staticmethod
    def _obtener(uow: PedidoUnitOfWork, id: int) -> Pedido:
        pedido = uow.pedidos.get_by_id(id)
        if pedido is None:
            raise PedidoNoEncontrado(f"No existe un pedido con id {id}")
        return pedido

    @staticmethod
    def _transicionar(uow: PedidoUnitOfWork, pedido: Pedido, nuevo: EstadoPedido) -> None:
        # Toda transición se valida contra el mapa ANTES de modificar el pedido
        actual = EstadoPedido(pedido.estado)
        if nuevo not in TRANSICIONES[actual]:
            raise TransicionInvalida(f"Transición inválida: {actual.value} → {nuevo.value}")

        # RN-03: al cancelar se restituye el stock de cada línea, en la misma
        # transacción que cambia el estado
        if nuevo == EstadoPedido.CANCELADO:
            for linea in pedido.items:
                producto = uow.productos.get_for_update(linea.producto_id)
                if producto is not None:
                    producto.stock += linea.cantidad

        pedido.estado = nuevo.value
        pedido.updated_at = ahora()
        uow.pedidos.add(pedido)


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())
