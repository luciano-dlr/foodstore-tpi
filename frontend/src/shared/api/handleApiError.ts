import axios from 'axios';
import type { ErrorApi } from '@/shared/types/api';

export function handleApiError(error: unknown): string {
  if (!axios.isAxiosError<ErrorApi>(error)) return 'Error inesperado.';
  if (error.code === 'ECONNABORTED') return 'El servidor tardó demasiado en responder.';
  if (!error.response) return 'No se pudo conectar con el servidor. Verificá que el backend esté corriendo.';

  const { status, data } = error.response;
  const detail = data?.detail;

  if (status === 403) return 'No tenés permisos para realizar esta acción.';
  if (status === 422 && Array.isArray(detail)) {
    const mensajes = detail.map((e) => e.msg.replace(/^Value error, /, ''));
    return `Los datos enviados no son válidos: ${mensajes.join('. ')}`;
  }
  if (typeof detail === 'string') return detail;
  if (status === 401) return 'La sesión venció. Iniciá sesión de nuevo.';
  if (status < 500) return 'No se pudo completar la operación.';
  return 'Error del servidor. Intentá nuevamente más tarde.';
}

export const esAccesoDenegado = (error: unknown): boolean =>
  axios.isAxiosError(error) && error.response?.status === 403;

export const esSesionVencida = (error: unknown): boolean =>
  axios.isAxiosError(error) && error.response?.status === 401;
