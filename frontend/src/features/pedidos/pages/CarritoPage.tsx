import { Link, useNavigate } from 'react-router-dom';
import EstadoVacio from '@/shared/components/EstadoVacio';
import Button from '@/shared/ui/Button';
import Card from '@/shared/ui/Card';
import { formatearPrecio } from '@/shared/utils/formato';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import ItemCarritoFila from '../components/ItemCarritoFila';

export default function CarritoPage() {
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.total());
  const cambiarCantidad = useCartStore((state) => state.cambiarCantidad);
  const quitar = useCartStore((state) => state.quitar);
  const vaciar = useCartStore((state) => state.vaciar);
  const usuario = useAuthStore((state) => state.usuario);
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold text-slate-800 dark:text-slate-100">Carrito</h1>
        <EstadoVacio
          titulo="Tu carrito está vacío"
          mensaje="Agregá productos desde el catálogo."
          accion={
            <Link to="/" className="rounded-lg bg-brand px-4 py-2 font-semibold text-white hover:bg-brand-hover">
              Ir al catálogo
            </Link>
          }
        />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Carrito</h1>
        <Button variant="secondary" size="sm" onClick={vaciar}>
          Vaciar carrito
        </Button>
      </div>

      <Card className="px-5">
        <ul className="divide-y divide-slate-100 dark:divide-slate-700">
          {items.map((item) => (
            <ItemCarritoFila
              key={item.producto_id}
              item={item}
              onCambiarCantidad={(cantidad) => cambiarCantidad(item.producto_id, cantidad)}
              onQuitar={() => quitar(item.producto_id)}
            />
          ))}
        </ul>
      </Card>

      <Card className="mt-6 flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Total ({items.length} productos)</p>
          <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{formatearPrecio(total)}</p>
          <p className="text-xs text-slate-400">El precio y el stock se confirman al crear el pedido.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/" className="rounded-lg border border-brand px-4 py-2 font-semibold text-brand hover:bg-brand/10">
            Seguir comprando
          </Link>
          <Button onClick={() => navigate('/checkout')}>{usuario ? 'Confirmar pedido' : 'Ingresar para confirmar'}</Button>
        </div>
      </Card>
    </main>
  );
}
