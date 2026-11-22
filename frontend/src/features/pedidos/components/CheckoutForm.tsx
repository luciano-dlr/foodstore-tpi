import { Banknote, Landmark } from 'lucide-react';
import { useForm } from '@tanstack/react-form';
import ErroresCampo from '@/shared/components/ErroresCampo';
import MensajeError from '@/shared/components/MensajeError';
import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';
import { textoObligatorio, textoOpcional } from '@/shared/utils/validaciones';
import { nombresFormaPago } from '../types/maquinaEstados';
import type { CheckoutInput, FormaPago } from '../types/pedido';

interface CheckoutFormProps {
  error: string | null;
  onConfirmar: (datos: CheckoutInput) => Promise<void>;
}

const formasPago: FormaPago[] = ['EFECTIVO', 'TRANSFERENCIA'];
const validarDireccion = textoObligatorio('La dirección de entrega', 5, 200);
const validarNotas = textoOpcional(500);
const valoresIniciales: CheckoutInput = { direccion_entrega: '', forma_pago: 'EFECTIVO', notas: '' };

export default function CheckoutForm({ error, onConfirmar }: CheckoutFormProps) {
  const form = useForm({
    defaultValues: valoresIniciales,
    onSubmit: async ({ value }) => {
      try {
        await onConfirmar(value);
      } catch {
        return;
      }
    },
  });

  return (
    <form
      noValidate
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
    >
      <form.Field name="direccion_entrega" validators={{ onBlur: validarDireccion, onChange: validarDireccion, onSubmit: validarDireccion }}>
        {(field) => (
          <Input
            id={field.name}
            etiqueta="Dirección de entrega"
            placeholder="Calle, número, departamento, ciudad"
            autoComplete="street-address"
            autoFocus
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            errores={field.state.meta.isTouched ? field.state.meta.errors : []}
          />
        )}
      </form.Field>

      <form.Field name="forma_pago">
        {(field) => (
          <fieldset className="flex flex-col gap-2">
            <legend className="campo-label mb-1">Forma de pago</legend>
            <div className="grid grid-cols-2 gap-3">
              {formasPago.map((forma) => (
                <label
                  key={forma}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition ${
                    field.state.value === forma
                      ? 'border-brand bg-brand/10 text-brand'
                      : 'border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name={field.name}
                    value={forma}
                    checked={field.state.value === forma}
                    onChange={() => field.handleChange(forma)}
                    className="accent-brand"
                  />
                  {forma === 'EFECTIVO' ? <Banknote size={18} /> : <Landmark size={18} />}
                  {nombresFormaPago[forma]}
                </label>
              ))}
            </div>
            {field.state.value === 'TRANSFERENCIA' && (
              <p className="text-xs text-slate-500 dark:text-slate-400">El pago es manual: te enviamos los datos de la cuenta al confirmar.</p>
            )}
          </fieldset>
        )}
      </form.Field>

      <form.Field name="notas" validators={{ onChange: validarNotas }}>
        {(field) => (
          <div className="flex flex-col gap-1">
            <label htmlFor={field.name} className="campo-label">
              Notas <span className="font-normal text-slate-400 dark:text-slate-500">(opcional)</span>
            </label>
            <textarea
              id={field.name}
              rows={3}
              placeholder="Ej: tocar timbre, sin cebolla..."
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className={`campo-input ${field.state.meta.errors.length > 0 ? 'campo-input-error' : ''}`}
            />
            <ErroresCampo errores={field.state.meta.errors} />
          </div>
        )}
      </form.Field>

      <MensajeError mensaje={error} />

      <form.Subscribe selector={(estado) => [estado.canSubmit, estado.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <Button type="submit" disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? 'Confirmando...' : 'Confirmar pedido'}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
