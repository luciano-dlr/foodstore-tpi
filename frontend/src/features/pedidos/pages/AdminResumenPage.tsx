import { ArrowRight, CalendarDays, ChefHat, CircleCheck, CircleX, Clock, RefreshCw, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import EstadoError from '@/shared/components/EstadoError';
import Skeleton from '@/shared/components/Skeleton';
import Button from '@/shared/ui/Button';
import { formatearPrecio } from '@/shared/utils/formato';
import TarjetaResumen from '../components/TarjetaResumen';
import { useResumenPedidos } from '../hooks/usePedidos';

export default function AdminResumenPage() {
  const { resumen, isPending, isFetching, error, refetch } = useResumenPedidos();

  const tarjetas = resumen
    ? [
        { titulo: 'Pendientes', valor: String(resumen.pendientes), icono: Clock, acento: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
        { titulo: 'En preparación', valor: String(resumen.en_preparacion), icono: ChefHat, acento: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300' },
        { titulo: 'Entregados', valor: String(resumen.entregados), icono: CircleCheck, acento: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' },
        { titulo: 'Cancelados', valor: String(resumen.cancelados), icono: CircleX, acento: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300' },
        { titulo: 'Pedidos de hoy', valor: String(resumen.pedidos_hoy), icono: CalendarDays, acento: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' },
        {
          titulo: 'Ingresos (entregados)',
          valor: formatearPrecio(resumen.ingresos_entregados),
          icono: Wallet,
          acento: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
        },
      ]
    : [];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Resumen del negocio</h1>
          {isFetching && !isPending && <span className="text-sm text-slate-400">Actualizando...</span>}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={refetch} disabled={isFetching}>
            <RefreshCw size={16} />
            Actualizar
          </Button>
          <Link to="/admin/pedidos" className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 font-semibold text-white hover:bg-brand-hover">
            Gestionar pedidos
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {isPending ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : error ? (
        <EstadoError titulo="No se pudo cargar el resumen." mensaje={error} onRetry={refetch} />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tarjetas.map((t) => (
            <TarjetaResumen key={t.titulo} {...t} />
          ))}
        </div>
      )}
    </main>
  );
}
