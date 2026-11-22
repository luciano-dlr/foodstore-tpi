import { api } from '@/shared/api/axiosInstance';
import type { LoginCredentials, RegisterInput, Usuario } from '../types/auth';

export const requestLogin = async ({ username, password }: LoginCredentials): Promise<void> => {
  const form = new URLSearchParams({ username, password });
  await api.post('/auth/token', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
};

export const requestLogout = async (): Promise<void> => {
  await api.post('/auth/logout');
};

export const requestMe = async (): Promise<Usuario> => {
  const { data } = await api.get<Usuario>('/auth/me');
  return data;
};

export const requestRegister = async (datos: RegisterInput): Promise<Usuario> => {
  const { data } = await api.post<Usuario>('/auth/register', datos);
  return data;
};
