interface MensajeErrorProps {
  mensaje: string | null;
}

export default function MensajeError({ mensaje }: MensajeErrorProps) {
  if (!mensaje) return null;
  return (
    <p role="alert" className="rounded-lg bg-red-50 dark:bg-red-950/60 px-3 py-2 text-sm text-error">
      {mensaje}
    </p>
  );
}
