import axios, { type AxiosError } from 'axios';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import type { ErrorApi } from '@/shared/types/api';
import { api } from './axiosInstance';

const RUTAS_DE_AUTH = ['/auth/token', '/auth/me'];
export const CUENTA_DESACTIVADA = 'Cuenta de usuario desactivada';

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorApi>) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error);
    const url = error.config?.url ?? '';
    const esDeAuth = RUTAS_DE_AUTH.some((ruta) => url.includes(ruta));
    const status = error.response?.status;
    const detail = error.response?.data?.detail;
    const sesion = useAuthStore.getState();

    if (status === 401 && !esDeAuth && sesion.usuario) {
      sesion.limpiarSesion();
      useNotificationStore.getState().showNotification('La sesión venció. Iniciá sesión de nuevo.', 'error');
    }

    if (status === 400 && detail === CUENTA_DESACTIVADA && sesion.usuario) {
      sesion.limpiarSesion();
      useNotificationStore.getState().showNotification('Tu cuenta fue desactivada.', 'error');
    }

    if (status === 403) {
      useNotificationStore.getState().showNotification('No tenés permisos para realizar esta acción.', 'error');
    }

    return Promise.reject(error);
  },
);
