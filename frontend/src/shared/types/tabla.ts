import type { RowData } from '@tanstack/react-table';

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    onEditar?: (fila: TData) => void;
    onEliminar?: (fila: TData) => void;
    onStock?: (fila: TData) => void;
    onVer?: (fila: TData) => void;
    usuarioActualId?: number;
    procesandoId?: number;
    onCambiarEstado?: (fila: TData, valor: boolean) => void;
  }
}

export {};
