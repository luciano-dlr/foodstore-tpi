import { Ban, Eye } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { handleApiError } from '@/shared/api/handleApiError';
import ConfirmarAccion from '@/shared/components/ConfirmarAccion';
import EstadoError from '@/shared/components/EstadoError';
import EstadoVacio from '@/shared/components/EstadoVacio';
import Paginacion from '@/shared/components/Paginacion';
import { SkeletonTabla } from '@/shared/components/Skeleton';
import { ESTADOS_PEDIDO, nombresEstado } from '@/shared/types/estados';
import BadgeEstado from '@/shared/ui/BadgeEstado';
import Button from '@/shared/ui/Button';
import Card from '@/shared/ui/Card';
import { formatearFecha, formatearPrecio } from '@/shared/utils/formato';
import DetallePedidoModal from '../components/DetallePedidoModal';
import { useCancelarPedido, usePedidos } from '../hooks/usePedidos';
import { nombresFormaPago } from '../types/maquinaEstados';
import type { EstadoPedido, Pedido } from '../types/pedido';

const POR_PAGINA = 5;

export default function MisPedidosPage() {
  const [pagina, setPagina] = useState<number>(0);
  const [estado, setEstado] = useState<EstadoPedido | ''>('');
  const [detalleId, setDetalleId] = useState<number | null>(null);
  const [aCancelar, setACancelar] = useState<Pedido | null>(null);
  const cancelar = useCancelarPedido();
  const { pedidos, total, isPending, isFetching, error, refetch } = usePedidos({
    skip: pagina * POR_PAGINA,
    limit: POR_PAGINA,
    ...(estado && { estado }),
  });

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Mis pedidos</h1>
          {isFetching && !isPending && <span className="text-sm text-slate-400">Actualizando...</span>}
        </div>
        <select
          value={estado}
          onChange={(e) => {
            setEstado(e.target.value as EstadoPedido | '');
            setPagina(0);
          }}
          aria-label="Filtrar por estado"
          className="campo-input w-auto"
        >
          <option value="">Todos los estados</option>
          {ESTADOS_PEDIDO.map((e) => (
            <option key={e} value={e}>
              {nombresEstado[e]}
            </option>
          ))}
        </select>
      </div>

      {isPending ? (
        <SkeletonTabla filas={4} />
      ) : error ? (
        <EstadoError titulo="No se pudieron cargar tus pedidos." mensaje={error} onRetry={refetch} />
      ) : pedidos.length === 0 ? (
        <EstadoVacio
          titulo={estado ? 'No hay pedidos con ese estado' : 'Todavía no hiciste pedidos'}
          mensaje="Cuando confirmes un pedido lo vas a ver acá."
          accion={
            <Link to="/" className="rounded-lg bg-brand px-4 py-2 font-semibold text-white hover:bg-brand-hover">
              Ir al catálogo
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          {pedidos.map((pedido) => (
            <Card key={pedido.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-slate-800 dark:text-slate-100">Pedido #{pedido.id}</span>
                  <BadgeEstado estado={pedido.estado} />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {formatearFecha(pedido.created_at)} · {pedido.items.length} productos · {nombresFormaPago[pedido.forma_pago]}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{pedido.direccion_entrega}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold text-slate-800 dark:text-slate-100">{formatearPrecio(pedido.total)}</span>
                <Button variant="outline" size="sm" onClick={() => setDetalleId(pedido.id)}>
                  <Eye size={14} />
                  Ver detalle
                </Button>
                {pedido.estado === 'PENDIENTE' && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      cancelar.reset();
                      setACancelar(pedido);
                    }}
                  >
                    <Ban size={14} />
                    Cancelar
                  </Button>
                )}
              </div>
            </Card>
          ))}
          <Paginacion pagina={pagina} totalItems={total} porPagina={POR_PAGINA} deshabilitado={isFetching} onCambiar={setPagina} />
        </div>
      )}

      <DetallePedidoModal pedidoId={detalleId} onClose={() => setDetalleId(null)} />

      <ConfirmarAccion
        abierto={aCancelar !== null}
        titulo={`Cancelar pedido #${aCancelar?.id ?? ''}`}
        textoConfirmar="Cancelar pedido"
        procesando={cancelar.isPending}
        error={cancelar.isError ? handleApiError(cancelar.error) : null}
        onConfirmar={() => aCancelar && cancelar.mutate(aCancelar.id, { onSuccess: () => setACancelar(null) })}
        onClose={() => setACancelar(null)}
      >
        ¿Seguro que querés cancelar el pedido por <strong>{formatearPrecio(aCancelar?.total ?? 0)}</strong>? Esta acción no se
        puede deshacer.
      </ConfirmarAccion>
    </main>
  );
}
