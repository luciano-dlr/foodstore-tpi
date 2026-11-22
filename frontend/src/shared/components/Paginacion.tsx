import Button from '@/shared/ui/Button';

interface PaginacionProps {
  pagina: number;
  totalItems: number;
  porPagina: number;
  deshabilitado?: boolean;
  onCambiar: (pagina: number) => void;
}

export default function Paginacion({ pagina, totalItems, porPagina, deshabilitado = false, onCambiar }: PaginacionProps) {
  const totalPaginas = Math.max(Math.ceil(totalItems / porPagina), 1);
  const desde = totalItems === 0 ? 0 : pagina * porPagina + 1;
  const hasta = Math.min((pagina + 1) * porPagina, totalItems);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600 dark:text-slate-300">
      <span>
        {desde}–{hasta} de {totalItems}
      </span>
      <div className="flex items-center gap-3">
        <Button variant="secondary" size="sm" onClick={() => onCambiar(pagina - 1)} disabled={deshabilitado || pagina === 0}>
          Anterior
        </Button>
        <span>
          Página {pagina + 1} de {totalPaginas}
        </span>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onCambiar(pagina + 1)}
          disabled={deshabilitado || pagina + 1 >= totalPaginas}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}
