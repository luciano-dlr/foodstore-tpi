interface PantallaCargaProps {
  mensaje?: string;
}

export default function PantallaCarga({ mensaje = 'Verificando sesión...' }: PantallaCargaProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3" aria-busy="true">
      <span className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 dark:border-slate-700 border-t-brand" />
      <p className="text-sm text-slate-500 dark:text-slate-400">{mensaje}</p>
    </div>
  );
}
