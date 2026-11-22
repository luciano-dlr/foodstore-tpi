import Button from '@/shared/ui/Button';

interface BotonesFormularioProps {
  puedeGuardar: boolean;
  guardando: boolean;
  onCancelar: () => void;
}

export default function BotonesFormulario({ puedeGuardar, guardando, onCancelar }: BotonesFormularioProps) {
  return (
    <div className="mt-2 flex justify-end gap-2">
      <Button variant="secondary" onClick={onCancelar} disabled={guardando}>
        Cancelar
      </Button>
      <Button type="submit" disabled={!puedeGuardar || guardando}>
        {guardando ? 'Guardando...' : 'Guardar'}
      </Button>
    </div>
  );
}
