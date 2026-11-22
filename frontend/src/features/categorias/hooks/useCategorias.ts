import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { handleApiError } from '@/shared/api/handleApiError';
import { useNotificaciones } from '@/shared/hooks/useNotificaciones';
import { createCategoria, deleteCategoria, getCategorias, updateCategoria } from '../api/categorias';
import type { Categoria, CategoriaInput } from '../types/categoria';

interface EdicionCategoria {
  id: number;
  datos: CategoriaInput;
}

export const CLAVE_CATEGORIAS = ['categorias'] as const;
const sinCategorias: Categoria[] = [];

export function useCategorias() {
  const query = useQuery({ queryKey: CLAVE_CATEGORIAS, queryFn: getCategorias });

  return {
    categorias: query.data ?? sinCategorias,
    isPending: query.isPending,
    isFetching: query.isFetching,
    error: query.error ? handleApiError(query.error) : null,
    refetch: () => void query.refetch(),
  };
}

export function useMutacionesCategoria() {
  const queryClient = useQueryClient();
  const notificar = useNotificaciones();

  const invalidar = () => {
    void queryClient.invalidateQueries({ queryKey: CLAVE_CATEGORIAS });
    void queryClient.invalidateQueries({ queryKey: ['productos'] });
  };

  const crear = useMutation({
    mutationFn: (datos: CategoriaInput) => createCategoria(datos),
    onSuccess: (categoria) => {
      invalidar();
      notificar.exito(`Categoría «${categoria.nombre}» creada.`);
    },
  });

  const editar = useMutation({
    mutationFn: ({ id, datos }: EdicionCategoria) => updateCategoria(id, datos),
    onSuccess: (categoria) => {
      invalidar();
      notificar.exito(`Categoría «${categoria.nombre}» actualizada.`);
    },
  });

  const eliminar = useMutation({
    mutationFn: (id: number) => deleteCategoria(id),
    onSuccess: () => {
      invalidar();
      notificar.exito('Categoría dada de baja.');
    },
  });

  return { crear, editar, eliminar };
}
