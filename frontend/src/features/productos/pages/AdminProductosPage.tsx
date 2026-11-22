import { Package, Pencil, Plus, Trash2 } from 'lucide-react';
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
import { useCategorias } from '@/features/categorias';
import { handleApiError } from '@/shared/api/handleApiError';
import ConfirmarAccion from '@/shared/components/ConfirmarAccion';
import DataTable from '@/shared/components/DataTable';
import EstadoError from '@/shared/components/EstadoError';
import EstadoVacio from '@/shared/components/EstadoVacio';
import { SkeletonTabla } from '@/shared/components/Skeleton';
import type { FormularioDe } from '@/shared/types/formulario';
import Button from '@/shared/ui/Button';
import { formatearPrecio } from '@/shared/utils/formato';
import ImagenProducto from '../components/ImagenProducto';
import ProductoModal from '../components/ProductoModal';
import StockModal from '../components/StockModal';
import { useMutacionesProducto, useProductos } from '../hooks/useProductos';
import type { Producto, ProductoInput } from '../types/producto';

const LIMITE_PANEL = 100;

const valoresIniciales: ProductoInput = {
  nombre: '',
  descripcion: '',
  precio_base: Number.NaN,
  imagen_url: '',
  stock: 0,
  disponible: true,
  categoria_id: 0,
};

const columnHelper = createColumnHelper<Producto>();

const columnas = [
  columnHelper.accessor('nombre', {
    header: 'Producto',
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <ImagenProducto url={row.original.imagen_url} nombre={row.original.nombre} className="h-10 w-10 rounded-lg text-base" />
        <span className="font-medium text-slate-800 dark:text-slate-100">{row.original.nombre}</span>
      </div>
    ),
  }),
  columnHelper.accessor((p) => p.categoria.nombre, { id: 'categoria', header: 'Categoría' }),
  columnHelper.accessor('precio_base', { header: 'Precio', cell: (info) => formatearPrecio(info.getValue()) }),
  columnHelper.accessor('stock', {
    header: 'Stock',
    cell: (info) => (
      <span className={info.getValue() === 0 ? 'font-semibold text-error' : info.getValue() <= 5 ? 'font-semibold text-amber-600' : ''}>
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor('disponible', {
    header: 'Venta',
    cell: (info) =>
      info.getValue() ? (
        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-950 dark:text-green-300">Disponible</span>
      ) : (
        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">Pausado</span>
      ),
  }),
  columnHelper.display({
    id: 'acciones',
    header: 'Acciones',
    cell: ({ row, table }) => (
      <div className="flex justify-end gap-2">
        <Button variant="secondary" size="sm" onClick={() => table.options.meta?.onStock?.(row.original)}>
          <Package size={14} />
          Stock
        </Button>
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

export default function AdminProductosPage() {
  const [categoriaFiltro, setCategoriaFiltro] = useState<number>(0);
  const { productos, isPending, isFetching, error, refetch } = useProductos({
    skip: 0,
    limit: LIMITE_PANEL,
    ...(categoriaFiltro > 0 && { categoria_id: categoriaFiltro }),
  });
  const { categorias } = useCategorias();
  const { crear, editar, cambiarStock, eliminar } = useMutacionesProducto();
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [seleccionado, setSeleccionado] = useState<Producto | null>(null);
  const [enStock, setEnStock] = useState<Producto | null>(null);
  const [aEliminar, setAEliminar] = useState<Producto | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [globalFilter, setGlobalFilter] = useState<string>('');

  const cerrarModal = () => {
    setModalAbierto(false);
    setSeleccionado(null);
  };

  const form: FormularioDe<ProductoInput> = useForm({
    defaultValues: valoresIniciales,
    onSubmit: async ({ value }) => {
      try {
        if (seleccionado) {
          await editar.mutateAsync({ id: seleccionado.id, datos: value });
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
    setSeleccionado(null);
    form.reset(valoresIniciales);
    setModalAbierto(true);
  };

  const abrirEdicion = (producto: Producto) => {
    editar.reset();
    setSeleccionado(producto);
    form.reset(
      {
        nombre: producto.nombre,
        descripcion: producto.descripcion ?? '',
        precio_base: producto.precio_base,
        imagen_url: producto.imagen_url ?? '',
        stock: producto.stock,
        disponible: producto.disponible,
        categoria_id: producto.categoria_id,
      },
      { keepDefaultValues: true },
    );
    setModalAbierto(true);
  };

  const table = useReactTable({
    data: productos,
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
      onStock: (producto: Producto) => {
        cambiarStock.reset();
        setEnStock(producto);
      },
      onEliminar: (producto: Producto) => {
        eliminar.reset();
        setAEliminar(producto);
      },
    },
  });

  const mutacionModal = seleccionado ? editar : crear;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Productos</h1>
          {isFetching && !isPending && <span className="text-sm text-slate-400">Actualizando...</span>}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={categoriaFiltro}
            onChange={(e) => {
              setCategoriaFiltro(Number(e.target.value));
              setPagination((p) => ({ ...p, pageIndex: 0 }));
            }}
            aria-label="Filtrar por categoría"
            className="campo-input w-auto"
          >
            <option value={0}>Todas las categorías</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
          <Button onClick={abrirAlta}>
            <Plus size={16} />
            Nuevo producto
          </Button>
        </div>
      </div>

      {isPending ? (
        <SkeletonTabla />
      ) : error ? (
        <EstadoError titulo="No se pudieron cargar los productos." mensaje={error} onRetry={refetch} />
      ) : productos.length === 0 ? (
        <EstadoVacio titulo="No hay productos" mensaje="Creá un producto o cambiá el filtro de categoría." />
      ) : (
        <DataTable table={table} placeholderBusqueda="Buscar producto..." />
      )}

      <ProductoModal
        abierto={modalAbierto}
        esEdicion={seleccionado !== null}
        form={form}
        categorias={categorias}
        error={mutacionModal.isError ? handleApiError(mutacionModal.error) : null}
        onClose={cerrarModal}
      />

      <StockModal
        producto={enStock}
        error={cambiarStock.isError ? handleApiError(cambiarStock.error) : null}
        onGuardar={async (datos) => {
          if (!enStock) return;
          await cambiarStock.mutateAsync({ id: enStock.id, datos });
          setEnStock(null);
        }}
        onClose={() => setEnStock(null)}
      />

      <ConfirmarAccion
        abierto={aEliminar !== null}
        titulo="Dar de baja el producto"
        textoConfirmar="Dar de baja"
        procesando={eliminar.isPending}
        error={eliminar.isError ? handleApiError(eliminar.error) : null}
        onConfirmar={() => aEliminar && eliminar.mutate(aEliminar.id, { onSuccess: () => setAEliminar(null) })}
        onClose={() => setAEliminar(null)}
      >
        ¿Dar de baja <strong className="text-slate-800 dark:text-slate-100">«{aEliminar?.nombre}»</strong>? Deja de verse en el
        catálogo; los pedidos ya hechos conservan su copia del nombre y del precio.
      </ConfirmarAccion>
    </main>
  );
}
