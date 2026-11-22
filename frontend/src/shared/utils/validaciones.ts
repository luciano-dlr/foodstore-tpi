interface ValidacionTexto {
  value: string;
}

interface ValidacionNumero {
  value: number;
}

type Validador<T> = (props: { value: T }) => string | undefined;

export const textoObligatorio =
  (etiqueta: string, minimo: number, maximo: number): Validador<string> =>
  ({ value }: ValidacionTexto) => {
    const limpio = value.trim();
    if (!limpio) return `${etiqueta} es obligatorio`;
    if (limpio.length < minimo) return `${etiqueta} debe tener al menos ${minimo} caracteres`;
    if (limpio.length > maximo) return `${etiqueta} admite hasta ${maximo} caracteres`;
    return undefined;
  };

export const textoOpcional =
  (maximo: number): Validador<string> =>
  ({ value }: ValidacionTexto) =>
    value.trim().length > maximo ? `Admite hasta ${maximo} caracteres` : undefined;

export const usernameValido = ({ value }: ValidacionTexto): string | undefined => {
  const limpio = value.trim();
  if (!limpio) return 'El usuario es obligatorio';
  if (limpio.length < 3 || limpio.length > 50) return 'El usuario debe tener entre 3 y 50 caracteres';
  if (!/^[A-Za-z0-9_.-]+$/.test(limpio)) return 'Solo letras, números, punto, guion y guion bajo';
  return undefined;
};

export const emailValido = ({ value }: ValidacionTexto): string | undefined => {
  const limpio = value.trim();
  if (!limpio) return 'El email es obligatorio';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpio)) return 'El email no tiene un formato válido';
  return undefined;
};

export const passwordValida = ({ value }: ValidacionTexto): string | undefined => {
  if (!value) return 'La contraseña es obligatoria';
  if (value.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
  if (new TextEncoder().encode(value).length > 72) return 'La contraseña es demasiado larga';
  return undefined;
};

export const obligatorio =
  (mensaje: string): Validador<string> =>
  ({ value }: ValidacionTexto) =>
    value ? undefined : mensaje;

export const precioValido = ({ value }: ValidacionNumero): string | undefined => {
  if (Number.isNaN(value)) return 'El precio es obligatorio';
  if (value < 0) return 'El precio no puede ser negativo';
  if (value >= 100_000_000) return 'El precio es demasiado alto';
  return undefined;
};

export const stockValido = ({ value }: ValidacionNumero): string | undefined => {
  if (Number.isNaN(value)) return 'El stock es obligatorio';
  if (!Number.isInteger(value)) return 'El stock debe ser un número entero';
  if (value < 0) return 'El stock no puede ser negativo';
  return undefined;
};

export const urlOpcional = ({ value }: ValidacionTexto): string | undefined => {
  const limpio = value.trim();
  if (!limpio) return undefined;
  if (limpio.length > 500) return 'La URL admite hasta 500 caracteres';
  if (!/^https?:\/\/\S+$/.test(limpio)) return 'Ingresá una URL que empiece con http:// o https://';
  return undefined;
};

export const seleccionObligatoria =
  (mensaje: string) =>
  ({ value }: ValidacionNumero): string | undefined =>
    value > 0 ? undefined : mensaje;
