import type { ReactNode } from 'react';
import Button from '@/shared/ui/Button';
import Modal from '@/shared/ui/Modal';
import MensajeError from './MensajeError';

interface ConfirmarAccionProps {
  abierto: boolean;
  titulo: string;
  children: ReactNode;
  textoConfirmar: string;
  procesando: boolean;
  error?: string | null;
  peligro?: boolean;
  onConfirmar: () => void;
  onClose: () => void;
}

export default function ConfirmarAccion({
  abierto,
  titulo,
  children,
  textoConfirmar,
  procesando,
  error = null,
  peligro = true,
  onConfirmar,
  onClose,
}: ConfirmarAccionProps) {
  return (
    <Modal abierto={abierto} titulo={titulo} bloqueado={procesando} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="text-slate-600 dark:text-slate-300">{children}</div>
        <MensajeError mensaje={error} />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={procesando}>
            Volver
          </Button>
          <Button variant={peligro ? 'danger' : 'primary'} onClick={onConfirmar} disabled={procesando}>
            {procesando ? 'Procesando...' : textoConfirmar}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
