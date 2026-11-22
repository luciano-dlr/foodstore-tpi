import { Check, ShoppingCart } from 'lucide-react';
import Button from '@/shared/ui/Button';
import Card from '@/shared/ui/Card';
import { formatearPrecio } from '@/shared/utils/formato';
import type { Producto } from '../types/producto';
import ImagenProducto from './ImagenProducto';

interface ProductoCardProps {
  producto: Producto;
  enCarrito: number;
  onAgregar: (producto: Producto) => void;
}

interface EstadoStock {
  texto: string;
  clase: string;
}

const estadoStock = (producto: Producto): EstadoStock => {
  if (!producto.disponible) return { texto: 'No disponible', clase: 'bg-slate-700/90 text-white' };
  if (producto.stock === 0) return { texto: 'Sin stock', clase: 'bg-red-600/90 text-white' };
  if (producto.stock <= 5) return { texto: `Últimas ${producto.stock}`, clase: 'bg-amber-500/95 text-white' };
  return { texto: `${producto.stock} disponibles`, clase: 'bg-white/90 text-slate-700' };
};

export default function ProductoCard({ producto, enCarrito, onAgregar }: ProductoCardProps) {
  const vendible = producto.disponible && producto.stock > 0;
  const tope = enCarrito >= producto.stock;
  const stock = estadoStock(producto);

  return (
    <Card className="group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative overflow-hidden">
        <ImagenProducto
          url={producto.imagen_url}
          nombre={producto.nombre}
          className={`aspect-[4/3] w-full transition duration-300 group-hover:scale-105 ${vendible ? '' : 'grayscale'}`}
        />
        <span className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-brand shadow-sm backdrop-blur">
          {producto.categoria.nombre}
        </span>
        <span className={`absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap shadow-sm backdrop-blur ${stock.clase}`}>
          {stock.texto}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg leading-snug font-semibold text-slate-800 dark:text-slate-100">{producto.nombre}</h3>
        <p className="mt-1 line-clamp-2 min-h-10 text-sm text-slate-500 dark:text-slate-400">
          {producto.descripcion ?? 'Sin descripción'}
        </p>

        <div className="mt-auto pt-4">
          <div className="flex items-end justify-between gap-2">
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{formatearPrecio(producto.precio_base)}</p>
            {enCarrito > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-brand dark:bg-indigo-950 dark:text-indigo-300">
                <Check size={12} />
                {enCarrito} en el carrito
              </span>
            )}
          </div>
          <Button className="mt-3 w-full" disabled={!vendible || tope} onClick={() => onAgregar(producto)}>
            <ShoppingCart size={16} />
            {!vendible ? stock.texto : tope ? 'Máximo en el carrito' : 'Agregar al carrito'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
