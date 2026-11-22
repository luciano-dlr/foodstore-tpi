import { nombresEstado, type EstadoPedido } from '@/shared/types/estados';

const estilos: Record<EstadoPedido, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200',
  EN_PREPARACION: 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200',
  ENTREGADO: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200',
  CANCELADO: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
};

interface BadgeEstadoProps {
  estado: EstadoPedido;
}

export default function BadgeEstado({ estado }: BadgeEstadoProps) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${estilos[estado]}`}>
      {nombresEstado[estado]}
    </span>
  );
}
