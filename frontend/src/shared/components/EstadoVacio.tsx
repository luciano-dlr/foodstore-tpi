import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface EstadoVacioProps {
  titulo: string;
  mensaje: string;
  accion?: ReactNode;
}

export default function EstadoVacio({ titulo, mensaje, accion }: EstadoVacioProps) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 p-10 text-center">
      <Inbox size={40} strokeWidth={1.5} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
      <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">{titulo}</p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{mensaje}</p>
      {accion && <div className="mt-4 flex justify-center">{accion}</div>}
    </div>
  );
}
