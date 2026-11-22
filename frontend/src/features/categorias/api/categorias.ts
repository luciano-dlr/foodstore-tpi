import { api } from '@/shared/api/axiosInstance';
import type { Categoria, CategoriaInput } from '../types/categoria';

const aPayload = ({ nombre, descripcion }: CategoriaInput) => ({
  nombre: nombre.trim(),
  descripcion: descripcion.trim() || null,
});

export const getCategorias = async (): Promise<Categoria[]> => {
  const { data } = await api.get<Categoria[]>('/categorias');
  return data;
};

export const createCategoria = async (datos: CategoriaInput): Promise<Categoria> => {
  const { data } = await api.post<Categoria>('/categorias', aPayload(datos));
  return data;
};

export const updateCategoria = async (id: number, datos: CategoriaInput): Promise<Categoria> => {
  const { data } = await api.put<Categoria>(`/categorias/${id}`, aPayload(datos));
  return data;
};

export const deleteCategoria = async (id: number): Promise<void> => {
  await api.delete(`/categorias/${id}`);
};
