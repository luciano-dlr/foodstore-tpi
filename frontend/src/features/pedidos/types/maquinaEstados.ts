import type { EstadoPedido } from './pedido';

export const SIGUIENTE_ESTADO: Partial<Record<EstadoPedido, EstadoPedido>> = {
  PENDIENTE: 'EN_PREPARACION',
  EN_PREPARACION: 'ENTREGADO',
};

export const TEXTO_AVANZAR: Partial<Record<EstadoPedido, string>> = {
  PENDIENTE: 'Preparar',
  EN_PREPARACION: 'Entregar',
};

export const esCancelablePorAdmin = (estado: EstadoPedido): boolean =>
  estado === 'PENDIENTE' || estado === 'EN_PREPARACION';

export const nombresFormaPago = { EFECTIVO: 'Efectivo', TRANSFERENCIA: 'Transferencia' } as const;
