import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Usuario } from '@/features/auth';
import { handleApiError } from '@/shared/api/handleApiError';
import { useNotificaciones } from '@/shared/hooks/useNotificaciones';
import { activarUsuario, desactivarUsuario, getUsuarios } from '../api/usuarios';

interface CambioEstado {
  id: number;
  activar: boolean;
}

export const CLAVE_USUARIOS = ['usuarios'] as const;
const sinUsuarios: Usuario[] = [];

export function useUsuarios(habilitado = true) {
  const queryClient = useQueryClient();
  const notificar = useNotificaciones();

  const query = useQuery({ queryKey: CLAVE_USUARIOS, queryFn: getUsuarios, enabled: habilitado });

  const cambiarEstado = useMutation({
    mutationFn: ({ id, activar }: CambioEstado) => (activar ? activarUsuario(id) : desactivarUsuario(id)),
    onSuccess: (usuario) => {
      void queryClient.invalidateQueries({ queryKey: CLAVE_USUARIOS });
      notificar.exito(`Usuario @${usuario.username} ${usuario.disabled ? 'desactivado' : 'activado'}.`);
    },
    onError: notificar.error,
  });

  return {
    usuarios: query.data ?? sinUsuarios,
    isPending: query.isPending,
    isFetching: query.isFetching,
    error: query.error ? handleApiError(query.error) : null,
    refetch: () => void query.refetch(),
    cambiarEstado: (id: number, activar: boolean) => cambiarEstado.mutate({ id, activar }),
    procesandoId: cambiarEstado.isPending ? cambiarEstado.variables.id : undefined,
  };
}
