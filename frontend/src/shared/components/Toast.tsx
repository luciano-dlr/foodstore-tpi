import { useEffect } from 'react';
import { CircleAlert, CircleCheck, X } from 'lucide-react';
import { useNotificationStore } from '@/store/notificationStore';

const estilos = {
  success: 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200',
  error: 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200',
};

export default function Toast() {
  const message = useNotificationStore((state) => state.message);
  const show = useNotificationStore((state) => state.show);
  const tipo = useNotificationStore((state) => state.tipo);
  const id = useNotificationStore((state) => state.id);
  const hideNotification = useNotificationStore((state) => state.hideNotification);

  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(hideNotification, 3000);
    return () => clearTimeout(timer);
  }, [show, id, hideNotification]);

  if (!show) return null;

  return (
    <div
      role={tipo === 'error' ? 'alert' : 'status'}
      className={`fixed right-4 bottom-4 z-50 flex max-w-sm items-start gap-3 rounded-lg border px-4 py-3 text-sm font-medium shadow-lg ${estilos[tipo]}`}
    >
      {tipo === 'error' ? <CircleAlert size={18} className="shrink-0" /> : <CircleCheck size={18} className="shrink-0" />}
      <span className="flex-1">{message}</span>
      <button
        type="button"
        onClick={hideNotification}
        aria-label="Cerrar notificación"
        className="opacity-60 hover:opacity-100"
      >
        <X size={16} />
      </button>
    </div>
  );
}
