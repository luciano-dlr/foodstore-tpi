import { useStore } from '@tanstack/react-form';
import type { Categoria } from '@/features/categorias';
import BotonesFormulario from '@/shared/components/BotonesFormulario';
import ErroresCampo from '@/shared/components/ErroresCampo';
import MensajeError from '@/shared/components/MensajeError';
import type { FormularioDe } from '@/shared/types/formulario';
import Input from '@/shared/ui/Input';
import Modal from '@/shared/ui/Modal';
import {
  precioValido,
  seleccionObligatoria,
  stockValido,
  textoObligatorio,
  textoOpcional,
  urlOpcional,
} from '@/shared/utils/validaciones';
import type { ProductoInput } from '../types/producto';

interface ProductoModalProps {
  abierto: boolean;
  esEdicion: boolean;
  form: FormularioDe<ProductoInput>;
  categorias: Categoria[];
  error: string | null;
  onClose: () => void;
}

const validarNombre = textoObligatorio('El nombre', 2, 150);
const validarDescripcion = textoOpcional(1000);
const validarCategoria = seleccionObligatoria('Elegí una categoría');

export default function ProductoModal({ abierto, esEdicion, form, categorias, error, onClose }: ProductoModalProps) {
  const guardando = useStore(form.store, (estado) => estado.isSubmitting);

  return (
    <Modal abierto={abierto} titulo={esEdicion ? 'Editar producto' : 'Nuevo producto'} bloqueado={guardando} onClose={onClose}>
      <form
        noValidate
        className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1"
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
              autoFocus
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              errores={field.state.meta.errors}
            />
          )}
        </form.Field>

        <form.Field name="categoria_id" validators={{ onChange: validarCategoria, onSubmit: validarCategoria }}>
          {(field) => (
            <div className="flex flex-col gap-1">
              <label htmlFor={field.name} className="campo-label">
                Categoría
              </label>
              <select
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(Number(e.target.value))}
                className={`campo-input ${field.state.meta.errors.length > 0 ? 'campo-input-error' : ''}`}
              >
                <option value={0}>Seleccioná una categoría</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
              <ErroresCampo errores={field.state.meta.errors} />
            </div>
          )}
        </form.Field>

        <div className="grid grid-cols-2 gap-4">
          <form.Field name="precio_base" validators={{ onChange: precioValido, onSubmit: precioValido }}>
            {(field) => (
              <Input
                id={field.name}
                etiqueta="Precio ($)"
                type="number"
                min={0}
                step="0.01"
                value={Number.isNaN(field.state.value) ? '' : field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.valueAsNumber)}
                errores={field.state.meta.errors}
              />
            )}
          </form.Field>

          {!esEdicion && (
            <form.Field name="stock" validators={{ onChange: stockValido, onSubmit: stockValido }}>
              {(field) => (
                <Input
                  id={field.name}
                  etiqueta="Stock inicial"
                  type="number"
                  min={0}
                  step={1}
                  value={Number.isNaN(field.state.value) ? '' : field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.valueAsNumber)}
                  errores={field.state.meta.errors}
                />
              )}
            </form.Field>
          )}
        </div>

        <form.Field name="imagen_url" validators={{ onChange: urlOpcional }}>
          {(field) => (
            <Input
              id={field.name}
              etiqueta="URL de la imagen"
              opcional
              type="url"
              placeholder="https://..."
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
                rows={2}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className={`campo-input ${field.state.meta.errors.length > 0 ? 'campo-input-error' : ''}`}
              />
              <ErroresCampo errores={field.state.meta.errors} />
            </div>
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

        {esEdicion && (
          <p className="text-xs text-slate-500 dark:text-slate-400">El stock se modifica con el botón «Stock» de la tabla.</p>
        )}

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
