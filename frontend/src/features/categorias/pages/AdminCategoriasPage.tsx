import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
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
import { handleApiError } from '@/shared/api/handleApiError';
import ConfirmarAccion from '@/shared/components/ConfirmarAccion';
import DataTable from '@/shared/components/DataTable';
import EstadoError from '@/shared/components/EstadoError';
import EstadoVacio from '@/shared/components/EstadoVacio';
import { SkeletonTabla } from '@/shared/components/Skeleton';
import type { FormularioDe } from '@/shared/types/formulario';
import Button from '@/shared/ui/Button';
import CategoriaModal from '../components/CategoriaModal';
import { useCategorias, useMutacionesCategoria } from '../hooks/useCategorias';
import type { Categoria, CategoriaInput } from '../types/categoria';

const valoresIniciales: CategoriaInput = { nombre: '', descripcion: '' };

const columnHelper = createColumnHelper<Categoria>();

const columnas = [
  columnHelper.accessor('id', { header: '#' }),
  columnHelper.accessor('nombre', {
    header: 'Nombre',
    cell: (info) => <span className="font-medium text-slate-800 dark:text-slate-100">{info.getValue()}</span>,
  }),
  columnHelper.accessor('descripcion', {
    header: 'Descripción',
    cell: (info) => info.getValue() || <span className="text-slate-400 dark:text-slate-500">Sin descripción</span>,
  }),
  columnHelper.display({
    id: 'acciones',
    header: 'Acciones',
    cell: ({ row, table }) => (
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => table.options.meta?.onEditar?.(row.original)}>
          <Pencil size={14} />
          Editar
        </Button>
        <Button variant="danger" size="sm" onClick={() => table.options.meta?.onEliminar?.(row.original)}>
          <Trash2 size={14} />
          Eliminar
        </Button>
      </div>
    ),
  }),
];

export default function AdminCategoriasPage() {
  const { categorias, isPending, isFetching, error, refetch } = useCategorias();
  const { crear, editar, eliminar } = useMutacionesCategoria();
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [seleccionada, setSeleccionada] = useState<Categoria | null>(null);
  const [aEliminar, setAEliminar] = useState<Categoria | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [globalFilter, setGlobalFilter] = useState<string>('');

  const cerrarModal = () => {
    setModalAbierto(false);
    setSeleccionada(null);
  };

  const form: FormularioDe<CategoriaInput> = useForm({
    defaultValues: valoresIniciales,
    onSubmit: async ({ value }) => {
      try {
        if (seleccionada) {
          await editar.mutateAsync({ id: seleccionada.id, datos: value });
        } else {
          await crear.mutateAsync(value);
        }
        cerrarModal();
      } catch {
        return;
      }
    },
  });

  const abrirAlta = () => {
    crear.reset();
    setSeleccionada(null);
    form.reset(valoresIniciales);
    setModalAbierto(true);
  };

  const abrirEdicion = (categoria: Categoria) => {
    editar.reset();
    setSeleccionada(categoria);
    form.reset({ nombre: categoria.nombre, descripcion: categoria.descripcion ?? '' }, { keepDefaultValues: true });
    setModalAbierto(true);
  };

  const table = useReactTable({
    data: categorias,
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
      onEditar: abrirEdicion,
      onEliminar: (categoria: Categoria) => {
        eliminar.reset();
        setAEliminar(categoria);
      },
    },
  });

  const mutacionModal = seleccionada ? editar : crear;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Categorías</h1>
          {isFetching && !isPending && <span className="text-sm text-slate-400">Actualizando...</span>}
        </div>
        <Button onClick={abrirAlta}>
          <Plus size={16} />
          Nueva categoría
        </Button>
      </div>

      {isPending ? (
        <SkeletonTabla />
      ) : error ? (
        <EstadoError titulo="No se pudieron cargar las categorías." mensaje={error} onRetry={refetch} />
      ) : categorias.length === 0 ? (
        <EstadoVacio titulo="Todavía no hay categorías" mensaje="Creá la primera para organizar el catálogo." />
      ) : (
        <DataTable table={table} placeholderBusqueda="Buscar categoría..." />
      )}

      <CategoriaModal
        abierto={modalAbierto}
        esEdicion={seleccionada !== null}
        form={form}
        error={mutacionModal.isError ? handleApiError(mutacionModal.error) : null}
        onClose={cerrarModal}
      />

      <ConfirmarAccion
        abierto={aEliminar !== null}
        titulo="Dar de baja la categoría"
        textoConfirmar="Dar de baja"
        procesando={eliminar.isPending}
        error={eliminar.isError ? handleApiError(eliminar.error) : null}
        onConfirmar={() => aEliminar && eliminar.mutate(aEliminar.id, { onSuccess: () => setAEliminar(null) })}
        onClose={() => setAEliminar(null)}
      >
        ¿Dar de baja <strong className="text-slate-800 dark:text-slate-100">«{aEliminar?.nombre}»</strong>? Deja de aparecer en
        el listado, pero sus productos siguen en el catálogo: para retirarlos, dalos de baja también.
      </ConfirmarAccion>
    </main>
  );
}
