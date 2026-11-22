import { useEffect, type ReactNode } from 'react';

interface ModalProps {
  abierto: boolean;
  titulo: string;
  bloqueado?: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ abierto, titulo, bloqueado = false, onClose, children }: ModalProps) {
  useEffect(() => {
    if (!abierto) return;
    const cerrarConEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !bloqueado) onClose();
    };
    window.addEventListener('keydown', cerrarConEscape);
    return () => window.removeEventListener('keydown', cerrarConEscape);
  }, [abierto, bloqueado, onClose]);

  if (!abierto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4"
      onClick={bloqueado ? undefined : onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal"
        className="w-full max-w-md rounded-xl bg-white dark:bg-slate-800 p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="titulo-modal" className="mb-4 text-xl font-bold text-slate-800 dark:text-slate-100">
          {titulo}
        </h2>
        {children}
      </div>
    </div>
  );
}
