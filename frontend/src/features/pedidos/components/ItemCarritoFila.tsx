import { Minus, Plus, Trash2 } from 'lucide-react';
import { ImagenProducto } from '@/features/productos';
import type { ItemCarrito } from '@/store/cartStore';
import Button from '@/shared/ui/Button';
import { formatearPrecio } from '@/shared/utils/formato';

interface ItemCarritoFilaProps {
  item: ItemCarrito;
  onCambiarCantidad: (cantidad: number) => void;
  onQuitar: () => void;
}

export default function ItemCarritoFila({ item, onCambiarCantidad, onQuitar }: ItemCarritoFilaProps) {
  return (
    <li className="flex flex-wrap items-center gap-4 py-4">
      <ImagenProducto url={item.imagen_url} nombre={item.nombre} className="h-16 w-16 rounded-lg" />
      <div className="min-w-40 flex-1">
        <p className="font-semibold text-slate-800 dark:text-slate-100">{item.nombre}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">{formatearPrecio(item.precio_unitario)} c/u</p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          aria-label={`Restar una unidad de ${item.nombre}`}
          disabled={item.cantidad <= 1}
          onClick={() => onCambiarCantidad(item.cantidad - 1)}
        >
          <Minus size={14} />
        </Button>
        <span className="w-8 text-center font-semibold" aria-live="polite">
          {item.cantidad}
        </span>
        <Button
          variant="secondary"
          size="sm"
          aria-label={`Sumar una unidad de ${item.nombre}`}
          disabled={item.cantidad >= item.stock}
          onClick={() => onCambiarCantidad(item.cantidad + 1)}
        >
          <Plus size={14} />
        </Button>
      </div>
      <p className="w-28 text-right font-semibold text-slate-800 dark:text-slate-100">
        {formatearPrecio(item.precio_unitario * item.cantidad)}
      </p>
      <Button variant="outline" size="sm" onClick={onQuitar} aria-label={`Quitar ${item.nombre}`}>
        <Trash2 size={14} />
        Quitar
      </Button>
    </li>
  );
}
