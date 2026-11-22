import type { LucideIcon } from 'lucide-react';
import Card from '@/shared/ui/Card';

interface TarjetaResumenProps {
  titulo: string;
  valor: string;
  icono: LucideIcon;
  acento: string;
}

export default function TarjetaResumen({ titulo, valor, icono: Icono, acento }: TarjetaResumenProps) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${acento}`}>
        <Icono size={24} />
      </span>
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400">{titulo}</p>
        <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{valor}</p>
      </div>
    </Card>
  );
}
