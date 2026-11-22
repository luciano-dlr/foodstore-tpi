import { useState } from 'react';
import { Search } from 'lucide-react';
import { useCategorias } from '@/features/categorias';
import EstadoError from '@/shared/components/EstadoError';
import EstadoVacio from '@/shared/components/EstadoVacio';
import Paginacion from '@/shared/components/Paginacion';
import { SkeletonTarjetas } from '@/shared/components/Skeleton';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useNotificaciones } from '@/shared/hooks/useNotificaciones';
import Button from '@/shared/ui/Button';
import { useCartStore } from '@/store/cartStore';
import ProductoCard from '../components/ProductoCard';
import { useProductos } from '../hooks/useProductos';
import type { FiltrosProductos, Producto } from '../types/producto';

const POR_PAGINA = 9;

const claseChip = (activo: boolean): string =>
  `rounded-full border px-3 py-1 text-sm font-medium transition ${
    activo
      ? 'border-brand bg-brand text-white'
      : 'border-slate-300 bg-white text-slate-600 hover:border-brand hover:text-brand dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300'
  }`;

export default function CatalogoPage() {
  const [pagina, setPagina] = useState<number>(0);
  const [busqueda, setBusqueda] = useState<string>('');
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined);
  const [soloDisponibles, setSoloDisponibles] = useState<boolean>(false);
  const search = useDebounce(busqueda.trim());
  const { categorias } = useCategorias();
  const items = useCartStore((state) => state.items);
  const agregar = useCartStore((state) => state.agregar);
  const notificar = useNotificaciones();

  const filtros: FiltrosProductos = {
    skip: pagina * POR_PAGINA,
    limit: POR_PAGINA,
    ...(search && { search }),
    ...(categoriaId && { categoria_id: categoriaId }),
    ...(soloDisponibles && { disponible: true }),
  };
  const { productos, total, isPending, isFetching, error, refetch } = useProductos(filtros);

  const cambiarFiltro = (accion: () => void) => {
    accion();
    setPagina(0);
  };

  const agregarAlCarrito = (producto: Producto) => {
    agregar({
      producto_id: producto.id,
      nombre: producto.nombre,
      precio_unitario: producto.precio_base,
      imagen_url: producto.imagen_url,
      stock: producto.stock,
    });
    notificar.exito(`«${producto.nombre}» agregado al carrito.`);
  };

  const hayFiltros = Boolean(search || categoriaId || soloDisponibles);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Catálogo</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Elegí tus productos y armá el pedido.</p>
        </div>
        {isFetching && !isPending && <span className="text-sm text-slate-400">Actualizando...</span>}
      </div>

      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative w-full max-w-sm">
            <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={busqueda}
              onChange={(e) => cambiarFiltro(() => setBusqueda(e.target.value))}
              placeholder="Buscar por nombre..."
              aria-label="Buscar productos por nombre"
              className="campo-input pl-9"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={soloDisponibles}
              onChange={(e) => cambiarFiltro(() => setSoloDisponibles(e.target.checked))}
              className="h-4 w-4 accent-brand"
            />
            Solo disponibles
          </label>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoría">
          <button type="button" className={claseChip(categoriaId === undefined)} onClick={() => cambiarFiltro(() => setCategoriaId(undefined))}>
            Todas
          </button>
          {categorias.map((c) => (
            <button key={c.id} type="button" className={claseChip(categoriaId === c.id)} onClick={() => cambiarFiltro(() => setCategoriaId(c.id))}>
              {c.nombre}
            </button>
          ))}
        </div>
      </div>

      {isPending ? (
        <SkeletonTarjetas cantidad={POR_PAGINA} />
      ) : error ? (
        <EstadoError titulo="No se pudo cargar el catálogo." mensaje={error} onRetry={refetch} />
      ) : productos.length === 0 ? (
        <EstadoVacio
          titulo="No encontramos productos"
          mensaje={hayFiltros ? 'Probá con otra búsqueda o categoría.' : 'Todavía no hay productos cargados.'}
          accion={
            hayFiltros && (
              <Button
                variant="outline"
                onClick={() =>
                  cambiarFiltro(() => {
                    setBusqueda('');
                    setCategoriaId(undefined);
                    setSoloDisponibles(false);
                  })
                }
              >
                Limpiar filtros
              </Button>
            )
          }
        />
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {productos.map((producto) => (
              <ProductoCard
                key={producto.id}
                producto={producto}
                enCarrito={items.find((i) => i.producto_id === producto.id)?.cantidad ?? 0}
                onAgregar={agregarAlCarrito}
              />
            ))}
          </div>
          <Paginacion pagina={pagina} totalItems={total} porPagina={POR_PAGINA} deshabilitado={isFetching} onCambiar={setPagina} />
        </div>
      )}
    </main>
  );
}
