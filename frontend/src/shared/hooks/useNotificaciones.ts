import { useNotificationStore } from '@/store/notificationStore';
import { esAccesoDenegado, esSesionVencida, handleApiError } from '@/shared/api/handleApiError';

export function useNotificaciones() {
  const showNotification = useNotificationStore((state) => state.showNotification);

  const exito = (mensaje: string) => showNotification(mensaje, 'success');

  const error = (causa: unknown) => {
    if (esAccesoDenegado(causa)) return;
    if (esSesionVencida(causa)) {
      showNotification('La sesión venció. Iniciá sesión de nuevo.', 'error');
      return;
    }
    showNotification(handleApiError(causa), 'error');
  };

  return { exito, error };
}
