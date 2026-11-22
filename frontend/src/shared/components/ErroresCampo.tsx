interface ErroresCampoProps {
  errores: ReadonlyArray<string | undefined>;
}

export default function ErroresCampo({ errores }: ErroresCampoProps) {
  const mensajes = [...new Set(errores.filter((e): e is string => Boolean(e)))];
  if (mensajes.length === 0) return null;
  return (
    <>
      {mensajes.map((mensaje) => (
        <p key={mensaje} className="text-xs text-error">
          {mensaje}
        </p>
      ))}
    </>
  );
}
