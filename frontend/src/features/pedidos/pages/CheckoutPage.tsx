import { Link, Navigate, useNavigate } from 'react-router-dom';
import { handleApiError } from '@/shared/api/handleApiError';
import { useNotificaciones } from '@/shared/hooks/useNotificaciones';
import Card from '@/shared/ui/Card';
import { formatearPrecio } from '@/shared/utils/formato';
import { useCartStore } from '@/store/cartStore';
import CheckoutForm from '../components/CheckoutForm';
import { useCrearPedido } from '../hooks/usePedidos';
import type { CheckoutInput } from '../types/pedido';

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.total());
  const vaciar = useCartStore((state) => state.vaciar);
  const crearPedido = useCrearPedido();
  const notificar = useNotificaciones();
  const navigate = useNavigate();

  if (items.length === 0 && !crearPedido.isSuccess) return <Navigate to="/carrito" replace />;

  const confirmar = async ({ direccion_entrega, forma_pago, notas }: CheckoutInput) => {
    const pedido = await crearPedido.mutateAsync({
      items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
      forma_pago,
      direccion_entrega: direccion_entrega.trim(),
      notas: notas.trim() || null,
    });
    vaciar();
    notificar.exito(`¡Pedido #${pedido.id} confirmado! Total ${formatearPrecio(pedido.total)}.`);
    navigate('/mis-pedidos', { replace: true });
  };

  return (
    <main className="mx-auto grid max-w-5xl gap-6 px-4 py-8 md:grid-cols-[1fr_22rem]">
      <section>
        <h1 className="mb-6 text-3xl font-bold text-slate-800 dark:text-slate-100">Confirmar pedido</h1>
        <Card className="p-6">
          <CheckoutForm error={crearPedido.isError ? handleApiError(crearPedido.error) : null} onConfirmar={confirmar} />
        </Card>
      </section>

      <aside className="md:pt-14">
        <Card className="p-5">
          <h2 className="mb-3 font-semibold text-slate-800 dark:text-slate-100">Tu pedido</h2>
          <ul className="divide-y divide-slate-100 text-sm dark:divide-slate-700">
            {items.map((item) => (
              <li key={item.producto_id} className="flex justify-between gap-2 py-2">
                <span>
                  {item.cantidad} × {item.nombre}
                </span>
                <span className="font-medium">{formatearPrecio(item.precio_unitario * item.cantidad)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 text-lg font-bold dark:border-slate-700">
            <span>Total</span>
            <span>{formatearPrecio(total)}</span>
          </div>
          <Link to="/carrito" className="mt-3 inline-block text-sm font-semibold text-brand hover:underline">
            Modificar carrito
          </Link>
        </Card>
      </aside>
    </main>
  );
}
