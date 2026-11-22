import { RefreshCw, TriangleAlert } from 'lucide-react';
import Button from '@/shared/ui/Button';

interface EstadoErrorProps {
  titulo: string;
  mensaje: string;
  onRetry?: () => void;
}

export default function EstadoError({ titulo, mensaje, onRetry }: EstadoErrorProps) {
  return (
    <div role="alert" className="rounded-xl border border-error/30 bg-red-50 dark:bg-red-950/60 p-6 text-error">
      <p className="flex items-center gap-2 font-semibold">
        <TriangleAlert size={18} />
        {titulo}
      </p>
      <p className="mt-1 text-sm">{mensaje}</p>
      {onRetry && (
        <Button variant="danger" size="sm" className="mt-4" onClick={onRetry}>
          <RefreshCw size={14} />
          Reintentar
        </Button>
      )}
    </div>
  );
}
