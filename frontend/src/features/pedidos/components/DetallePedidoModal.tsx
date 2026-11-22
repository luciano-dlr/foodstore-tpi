import EstadoError from '@/shared/components/EstadoError';
import { SkeletonTabla } from '@/shared/components/Skeleton';
import Button from '@/shared/ui/Button';
import Modal from '@/shared/ui/Modal';
import { usePedido } from '../hooks/usePedidos';
import DetallePedido from './DetallePedido';

interface DetallePedidoModalProps {
  pedidoId: number | null;
  cliente?: string;
  onClose: () => void;
}

export default function DetallePedidoModal({ pedidoId, cliente, onClose }: DetallePedidoModalProps) {
  const { pedido, isPending, error } = usePedido(pedidoId);

  return (
    <Modal abierto={pedidoId !== null} titulo={`Pedido #${pedidoId ?? ''}`} onClose={onClose}>
      {isPending ? (
        <SkeletonTabla filas={3} />
      ) : error ? (
        <EstadoError titulo="No se pudo cargar el pedido." mensaje={error} />
      ) : (
        pedido && <DetallePedido pedido={pedido} cliente={cliente} />
      )}
      <div className="mt-4 flex justify-end">
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
      </div>
    </Modal>
  );
}
