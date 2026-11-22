import { Ban, ChefHat, Eye, PackageCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type PaginationState,
  type SortingState,
} from '@tanstack/react-table';
import { useUsuarios } from '@/features/usuarios';
import { handleApiError } from '@/shared/api/handleApiError';
import ConfirmarAccion from '@/shared/components/ConfirmarAccion';
import DataTable from '@/shared/components/DataTable';
import EstadoError from '@/shared/components/EstadoError';
import EstadoVacio from '@/shared/components/EstadoVacio';
import { SkeletonTabla } from '@/shared/components/Skeleton';
import { ESTADOS_PEDIDO, nombresEstado } from '@/shared/types/estados';
import BadgeEstado from '@/shared/ui/BadgeEstado';
import Button from '@/shared/ui/Button';
import { formatearFecha, formatearPrecio } from '@/shared/utils/formato';
import DetallePedidoModal from '../components/DetallePedidoModal';
import { useCambiarEstadoPedido, usePedidos } from '../hooks/usePedidos';
import { SIGUIENTE_ESTADO, TEXTO_AVANZAR, esCancelablePorAdmin, nombresFormaPago } from '../types/maquinaEstados';
import type { EstadoPedido, Pedido } from '../types/pedido';

const LIMITE_PANEL = 100;

interface FilaPedido extends Pedido {
  cliente: string;
}

interface AccionPendiente {
  pedido: FilaPedido;
  estado: EstadoPedido;
}

const columnHelper = createColumnHelper<FilaPedido>();

export default function AdminPedidosPage() {
  const [estado, setEstado] = useState<EstadoPedido | ''>('');
  const [detalle, setDetalle] = useState<FilaPedido | null>(null);
  const [accion, setAccion] = useState<AccionPendiente | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const { pedidos, isPending, isFetching, error, refetch } = usePedidos({
    skip: 0,
    limit: LIMITE_PANEL,
    ...(estado && { estado }),
  });
  const { usuarios } = useUsuarios();
  const cambiarEstado = useCambiarEstadoPedido();

  const filas = useMemo<FilaPedido[]>(() => {
    const nombres = new Map(usuarios.map((u) => [u.id, `@${u.username}`]));
    return pedidos.map((p) => ({ ...p, cliente: nombres.get(p.usuario_id) ?? `Usuario #${p.usuario_id}` }));
  }, [pedidos, usuarios]);

  const pedirCambio = (pedido: FilaPedido, nuevo: EstadoPedido) => {
    cambiarEstado.reset();
    setAccion({ pedido, estado: nuevo });
  };

  const columnas = [
    columnHelper.accessor('id', { header: '#', cell: (info) => <span className="font-semibold">#{info.getValue()}</span> }),
    columnHelper.accessor('cliente', { header: 'Cliente' }),
    columnHelper.accessor('created_at', { header: 'Fecha', cell: (info) => formatearFecha(info.getValue()) }),
    columnHelper.accessor((p) => nombresFormaPago[p.forma_pago], { id: 'pago', header: 'Pago' }),
    columnHelper.accessor('total', { header: 'Total', cell: (info) => formatearPrecio(info.getValue()) }),
    columnHelper.accessor('estado', { header: 'Estado', cell: (info) => <BadgeEstado estado={info.getValue()} /> }),
    columnHelper.display({
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => {
        const pedido = row.original;
        const siguiente = SIGUIENTE_ESTADO[pedido.estado];
        return (
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setDetalle(pedido)}>
              <Eye size={14} />
              Ver
            </Button>
            {siguiente && (
              <Button size="sm" onClick={() => pedirCambio(pedido, siguiente)}>
                {siguiente === 'EN_PREPARACION' ? <ChefHat size={14} /> : <PackageCheck size={14} />}
                {TEXTO_AVANZAR[pedido.estado]}
              </Button>
            )}
            {esCancelablePorAdmin(pedido.estado) && (
              <Button variant="danger" size="sm" onClick={() => pedirCambio(pedido, 'CANCELADO')}>
                <Ban size={14} />
                Cancelar
              </Button>
            )}
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: filas,
    columns: columnas,
    state: { sorting, pagination, globalFilter },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    autoResetPageIndex: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const cancelando = accion?.estado === 'CANCELADO';

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Pedidos</h1>
          {isFetching && !isPending && <span className="text-sm text-slate-400">Actualizando...</span>}
        </div>
        <select
          value={estado}
          onChange={(e) => {
            setEstado(e.target.value as EstadoPedido | '');
            setPagination((p) => ({ ...p, pageIndex: 0 }));
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
        <SkeletonTabla />
      ) : error ? (
        <EstadoError titulo="No se pudieron cargar los pedidos." mensaje={error} onRetry={refetch} />
      ) : filas.length === 0 ? (
        <EstadoVacio titulo="No hay pedidos" mensaje={estado ? 'Ningún pedido tiene ese estado.' : 'Todavía no se hicieron pedidos.'} />
      ) : (
        <DataTable table={table} placeholderBusqueda="Buscar por cliente, número o estado..." />
      )}

      <DetallePedidoModal pedidoId={detalle?.id ?? null} cliente={detalle?.cliente} onClose={() => setDetalle(null)} />

      <ConfirmarAccion
        abierto={accion !== null}
        titulo={cancelando ? `Cancelar pedido #${accion?.pedido.id ?? ''}` : `Pedido #${accion?.pedido.id ?? ''}`}
        textoConfirmar={cancelando ? 'Cancelar pedido' : 'Confirmar'}
        peligro={cancelando}
        procesando={cambiarEstado.isPending}
        error={cambiarEstado.isError ? handleApiError(cambiarEstado.error) : null}
        onConfirmar={() =>
          accion &&
          cambiarEstado.mutate({ id: accion.pedido.id, estado: accion.estado }, { onSuccess: () => setAccion(null) })
        }
        onClose={() => setAccion(null)}
      >
        {accion &&
          (cancelando ? (
            <>
              Se cancela el pedido de <strong>{accion.pedido.cliente}</strong> y se restituye el stock de sus{' '}
              {accion.pedido.items.length} productos.
            </>
          ) : (
            <>
              Pasar de <BadgeEstado estado={accion.pedido.estado} /> a <BadgeEstado estado={accion.estado} />.
            </>
          ))}
      </ConfirmarAccion>
    </main>
  );
}
