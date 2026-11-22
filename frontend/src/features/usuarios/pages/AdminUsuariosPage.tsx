import { UserCheck, UserX } from 'lucide-react';
import { useState } from 'react';
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
import type { Usuario } from '@/features/auth';
import DataTable from '@/shared/components/DataTable';
import EstadoError from '@/shared/components/EstadoError';
import { SkeletonTabla } from '@/shared/components/Skeleton';
import Button from '@/shared/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { useUsuarios } from '../hooks/useUsuarios';

const columnHelper = createColumnHelper<Usuario>();

const columnas = [
  columnHelper.accessor('username', {
    header: 'Usuario',
    cell: (info) => <span className="font-medium text-slate-800 dark:text-slate-100">@{info.getValue()}</span>,
  }),
  columnHelper.accessor('full_name', { header: 'Nombre' }),
  columnHelper.accessor('email', { header: 'Email' }),
  columnHelper.accessor('role', {
    header: 'Rol',
    cell: (info) =>
      info.getValue() === 'admin' ? (
        <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">Admin</span>
      ) : (
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200">Cliente</span>
      ),
  }),
  columnHelper.accessor((u) => (u.disabled ? 'Desactivado' : 'Activo'), {
    id: 'estado',
    header: 'Estado',
    cell: ({ row }) =>
      row.original.disabled ? (
        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-950 dark:text-red-300">Desactivado</span>
      ) : (
        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-950 dark:text-green-300">Activo</span>
      ),
  }),
  columnHelper.display({
    id: 'acciones',
    header: 'Acciones',
    cell: ({ row, table }) => {
      const usuario = row.original;
      const meta = table.options.meta;
      const procesando = meta?.procesandoId === usuario.id;
      if (meta?.usuarioActualId === usuario.id) {
        return <p className="text-right text-xs text-slate-400">Tu cuenta</p>;
      }
      return (
        <div className="flex justify-end">
          {usuario.disabled ? (
            <Button variant="outline" size="sm" disabled={procesando} onClick={() => meta?.onCambiarEstado?.(usuario, true)}>
              <UserCheck size={14} />
              Activar
            </Button>
          ) : (
            <Button variant="danger" size="sm" disabled={procesando} onClick={() => meta?.onCambiarEstado?.(usuario, false)}>
              <UserX size={14} />
              Desactivar
            </Button>
          )}
        </div>
      );
    },
  }),
];

export default function AdminUsuariosPage() {
  const usuarioActual = useAuthStore((state) => state.usuario);
  const { usuarios, isPending, isFetching, error, refetch, cambiarEstado, procesandoId } = useUsuarios();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [globalFilter, setGlobalFilter] = useState<string>('');

  const table = useReactTable({
    data: usuarios,
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
    meta: {
      usuarioActualId: usuarioActual?.id,
      procesandoId,
      onCambiarEstado: (usuario: Usuario, activar: boolean) => cambiarEstado(usuario.id, activar),
    },
  });

  const activos = usuarios.filter((u) => !u.disabled).length;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Usuarios</h1>
          {isFetching && !isPending && <span className="text-sm text-slate-400">Actualizando...</span>}
        </div>
        {!isPending && !error && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {activos} activos · {usuarios.length - activos} desactivados
          </p>
        )}
      </div>

      {isPending ? (
        <SkeletonTabla />
      ) : error ? (
        <EstadoError titulo="No se pudieron cargar los usuarios." mensaje={error} onRetry={refetch} />
      ) : (
        <DataTable table={table} placeholderBusqueda="Buscar usuario..." />
      )}
    </main>
  );
}
