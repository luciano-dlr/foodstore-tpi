export const ESTADOS_PEDIDO = ['PENDIENTE', 'EN_PREPARACION', 'ENTREGADO', 'CANCELADO'] as const;

export type EstadoPedido = (typeof ESTADOS_PEDIDO)[number];

export const nombresEstado: Record<EstadoPedido, string> = {
  PENDIENTE: 'Pendiente',
  EN_PREPARACION: 'En preparación',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
};
