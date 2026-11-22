import BadgeEstado from '@/shared/ui/BadgeEstado';
import { formatearFecha, formatearPrecio } from '@/shared/utils/formato';
import { nombresFormaPago } from '../types/maquinaEstados';
import type { Pedido } from '../types/pedido';

interface DetallePedidoProps {
  pedido: Pedido;
  cliente?: string;
}

export default function DetallePedido({ pedido, cliente }: DetallePedidoProps) {
  return (
    <div className="flex flex-col gap-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <BadgeEstado estado={pedido.estado} />
        <span className="text-slate-500 dark:text-slate-400">{formatearFecha(pedido.created_at)}</span>
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-slate-600 dark:text-slate-300">
        {cliente && (
          <>
            <dt className="font-medium">Cliente</dt>
            <dd>{cliente}</dd>
          </>
        )}
        <dt className="font-medium">Entrega</dt>
        <dd>{pedido.direccion_entrega}</dd>
        <dt className="font-medium">Pago</dt>
        <dd>{nombresFormaPago[pedido.forma_pago]}</dd>
        {pedido.notas && (
          <>
            <dt className="font-medium">Notas</dt>
            <dd>{pedido.notas}</dd>
          </>
        )}
      </dl>

      <table className="w-full text-left">
        <thead className="border-b border-slate-200 text-xs text-slate-500 uppercase dark:border-slate-700 dark:text-slate-400">
          <tr>
            <th className="py-2">Producto</th>
            <th className="py-2 text-right">Precio</th>
            <th className="py-2 text-right">Cant.</th>
            <th className="py-2 text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
          {pedido.items.map((item) => (
            <tr key={item.producto_id}>
              <td className="py-2">{item.nombre_producto}</td>
              <td className="py-2 text-right">{formatearPrecio(item.precio_unitario)}</td>
              <td className="py-2 text-right">{item.cantidad}</td>
              <td className="py-2 text-right">{formatearPrecio(item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-slate-200 font-bold text-slate-800 dark:border-slate-700 dark:text-slate-100">
            <td className="py-2" colSpan={3}>
              Total
            </td>
            <td className="py-2 text-right">{formatearPrecio(pedido.total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
