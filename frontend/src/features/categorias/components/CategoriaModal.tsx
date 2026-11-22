import { useStore } from '@tanstack/react-form';
import BotonesFormulario from '@/shared/components/BotonesFormulario';
import ErroresCampo from '@/shared/components/ErroresCampo';
import MensajeError from '@/shared/components/MensajeError';
import type { FormularioDe } from '@/shared/types/formulario';
import Input from '@/shared/ui/Input';
import Modal from '@/shared/ui/Modal';
import { textoObligatorio, textoOpcional } from '@/shared/utils/validaciones';
import type { CategoriaInput } from '../types/categoria';

interface CategoriaModalProps {
  abierto: boolean;
  esEdicion: boolean;
  form: FormularioDe<CategoriaInput>;
  error: string | null;
  onClose: () => void;
}

const validarNombre = textoObligatorio('El nombre', 2, 100);
const validarDescripcion = textoOpcional(500);

export default function CategoriaModal({ abierto, esEdicion, form, error, onClose }: CategoriaModalProps) {
  const guardando = useStore(form.store, (estado) => estado.isSubmitting);

  return (
    <Modal abierto={abierto} titulo={esEdicion ? 'Editar categoría' : 'Nueva categoría'} bloqueado={guardando} onClose={onClose}>
      <form
        noValidate
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          void form.handleSubmit();
        }}
      >
        <form.Field name="nombre" validators={{ onChange: validarNombre, onBlur: validarNombre, onSubmit: validarNombre }}>
          {(field) => (
            <Input
              id={field.name}
              etiqueta="Nombre"
              placeholder="Ej: Pizzas"
              autoFocus
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              errores={field.state.meta.errors}
            />
          )}
        </form.Field>

        <form.Field name="descripcion" validators={{ onChange: validarDescripcion }}>
          {(field) => (
            <div className="flex flex-col gap-1">
              <label htmlFor={field.name} className="campo-label">
                Descripción <span className="font-normal text-slate-400 dark:text-slate-500">(opcional)</span>
              </label>
              <textarea
                id={field.name}
                rows={3}
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
            <BotonesFormulario puedeGuardar={canSubmit} guardando={isSubmitting} onCancelar={onClose} />
          )}
        </form.Subscribe>
      </form>
    </Modal>
  );
}
