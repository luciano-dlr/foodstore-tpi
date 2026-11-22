import { useEffect } from 'react';
import { useForm } from '@tanstack/react-form';
import BotonesFormulario from '@/shared/components/BotonesFormulario';
import MensajeError from '@/shared/components/MensajeError';
import Input from '@/shared/ui/Input';
import Modal from '@/shared/ui/Modal';
import { stockValido } from '@/shared/utils/validaciones';
import type { Producto, ProductoStockUpdate } from '../types/producto';

interface StockModalProps {
  producto: Producto | null;
  error: string | null;
  onGuardar: (datos: ProductoStockUpdate) => Promise<void>;
  onClose: () => void;
}

export default function StockModal({ producto, error, onGuardar, onClose }: StockModalProps) {
  const form = useForm({
    defaultValues: { stock: 0, disponible: true } as ProductoStockUpdate,
    onSubmit: async ({ value }) => {
      try {
        await onGuardar(value);
      } catch {
        return;
      }
    },
  });

  useEffect(() => {
    if (producto) form.reset({ stock: producto.stock, disponible: producto.disponible }, { keepDefaultValues: true });
  }, [producto, form]);

  return (
    <Modal abierto={producto !== null} titulo={`Stock · ${producto?.nombre ?? ''}`} onClose={onClose}>
      <form
        noValidate
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          void form.handleSubmit();
        }}
      >
        <form.Field name="stock" validators={{ onChange: stockValido }}>
          {(field) => (
            <Input
              id="stock-modal"
              etiqueta="Unidades en stock"
              type="number"
              min={0}
              step={1}
              autoFocus
              value={Number.isNaN(field.state.value) ? '' : field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.valueAsNumber)}
              errores={field.state.meta.errors}
            />
          )}
        </form.Field>

        <form.Field name="disponible">
          {(field) => (
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
              <input
                type="checkbox"
                checked={field.state.value}
                onChange={(e) => field.handleChange(e.target.checked)}
                className="h-4 w-4 accent-brand"
              />
              Disponible para la venta
            </label>
          )}
        </form.Field>

        <MensajeError mensaje={error} />

        <form.Subscribe selector={(estado) => [estado.canSubmit, estado.isSubmitting] as const}>
          {([canSubmit, isSubmitting]) => (
            <BotonesFormulario puedeGuardar={canSubmit} guardando={isSubmitting} onCancelar={onClose} />
          )}
        </form.Subscribe>
      </form>
    </Modal>
  );
}
