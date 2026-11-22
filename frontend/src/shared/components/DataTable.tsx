import { useEffect } from 'react';
import { flexRender, type Table } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from 'lucide-react';
import Button from '@/shared/ui/Button';

interface DataTableProps<T> {
  table: Table<T>;
  placeholderBusqueda: string;
}


export default function DataTable<T>({ table, placeholderBusqueda }: DataTableProps<T>) {
  const { pageIndex } = table.getState().pagination;
  const filasFiltradas = table.getFilteredRowModel().rows.length;
  const totalPaginas = Math.max(table.getPageCount(), 1);

  useEffect(() => {
    if (pageIndex > totalPaginas - 1) table.setPageIndex(totalPaginas - 1);
  }, [pageIndex, totalPaginas, table]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative max-w-sm">
        <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
        <input
        type="search"
        value={String(table.getState().globalFilter ?? '')}
        onChange={(e) => {
          table.setGlobalFilter(e.target.value);
          table.setPageIndex(0);
        }}
        placeholder={placeholderBusqueda}
        aria-label={placeholderBusqueda}
        className="campo-input bg-white pl-9 dark:bg-slate-800"
      />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3 font-semibold">
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className="inline-flex items-center gap-1 uppercase tracking-wide hover:text-brand"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === 'asc' ? (
                          <ArrowUp size={13} />
                        ) : header.column.getIsSorted() === 'desc' ? (
                          <ArrowDown size={13} />
                        ) : (
                          <ArrowUpDown size={13} className="opacity-40" />
                        )}
                      </button>
                    ) : (
                      <span className="block text-right">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 text-slate-700 dark:text-slate-200">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {filasFiltradas === 0 && (
              <tr>
                <td colSpan={table.getVisibleLeafColumns().length} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                  Ningún resultado coincide con la búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600 dark:text-slate-300">
        <span>
          {filasFiltradas} {filasFiltradas === 1 ? 'registro' : 'registros'}
        </span>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <span>
            Página {pageIndex + 1} de {totalPaginas}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
