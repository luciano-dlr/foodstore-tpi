import type { Usuario } from '@/features/auth';
import { api } from '@/shared/api/axiosInstance';

export const getUsuarios = async (): Promise<Usuario[]> => {
  const { data } = await api.get<Usuario[]>('/admin/usuarios');
  return data;
};

export const activarUsuario = async (id: number): Promise<Usuario> => {
  const { data } = await api.post<Usuario>(`/admin/usuarios/${id}/activar`);
  return data;
};

export const desactivarUsuario = async (id: number): Promise<Usuario> => {
  const { data } = await api.post<Usuario>(`/admin/usuarios/${id}/desactivar`);
  return data;
};
