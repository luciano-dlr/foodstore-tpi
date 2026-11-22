interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700 ${className}`} />;
}

interface SkeletonTablaProps {
  filas?: number;
}

export function SkeletonTabla({ filas = 5 }: SkeletonTablaProps) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Cargando">
      <Skeleton className="h-10 w-64" />
      {Array.from({ length: filas }, (_, i) => (
        <Skeleton key={i} className="h-12" />
      ))}
    </div>
  );
}

interface SkeletonTarjetasProps {
  cantidad?: number;
}

export function SkeletonTarjetas({ cantidad = 9 }: SkeletonTarjetasProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Cargando">
      {Array.from({ length: cantidad }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
          <Skeleton className="aspect-[4/3] rounded-none" />
          <div className="space-y-3 p-5">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
