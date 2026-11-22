import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { handleApiError } from '@/shared/api/handleApiError';
import { useNotificaciones } from '@/shared/hooks/useNotificaciones';
import { nombresEstado } from '@/shared/types/estados';
import {
  cambiarEstadoPedido,
  cancelarPedido,
  createPedido,
  getPedido,
  getPedidos,
  getResumenPedidos,
} from '../api/pedidos';
import type { EstadoPedido, FiltrosPedidos, Pedido, PedidoCreate } from '../types/pedido';

const sinPedidos: Pedido[] = [];

function useInvalidarPedidos() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['pedidos'] });
    void queryClient.invalidateQueries({ queryKey: ['productos'] });
  };
}

export function usePedidos(filtros: FiltrosPedidos) {
  const query = useQuery({ queryKey: ['pedidos', 'lista', filtros], queryFn: () => getPedidos(filtros) });
  return {
    pedidos: query.data?.items ?? sinPedidos,
    total: query.data?.total ?? 0,
    isPending: query.isPending,
    isFetching: query.isFetching,
    error: query.error ? handleApiError(query.error) : null,
    refetch: () => void query.refetch(),
  };
}

export function usePedido(id: number | null) {
  const query = useQuery({
    queryKey: ['pedidos', 'detalle', id],
    queryFn: () => getPedido(id as number),
    enabled: id !== null,
  });
  return {
    pedido: query.data ?? null,
    isPending: query.isPending,
    error: query.error ? handleApiError(query.error) : null,
  };
}

export function useResumenPedidos() {
  const query = useQuery({ queryKey: ['pedidos', 'resumen'], queryFn: getResumenPedidos });
  return {
    resumen: query.data ?? null,
    isPending: query.isPending,
    isFetching: query.isFetching,
    error: query.error ? handleApiError(query.error) : null,
    refetch: () => void query.refetch(),
  };
}

export function useCrearPedido() {
  const invalidar = useInvalidarPedidos();
  return useMutation({
    mutationFn: (datos: PedidoCreate) => createPedido(datos),
    onSuccess: invalidar,
  });
}

export function useCambiarEstadoPedido() {
  const invalidar = useInvalidarPedidos();
  const notificar = useNotificaciones();
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) => cambiarEstadoPedido(id, estado),
    onSuccess: (pedido) => {
      invalidar();
      notificar.exito(
        pedido.estado === 'CANCELADO'
          ? `Pedido #${pedido.id} cancelado: el stock fue restituido.`
          : `Pedido #${pedido.id}: ${nombresEstado[pedido.estado]}.`,
      );
    },
  });
}

export function useCancelarPedido() {
  const invalidar = useInvalidarPedidos();
  const notificar = useNotificaciones();
  return useMutation({
    mutationFn: (id: number) => cancelarPedido(id),
    onSuccess: (pedido) => {
      invalidar();
      notificar.exito(`Pedido #${pedido.id} cancelado.`);
    },
  });
}
