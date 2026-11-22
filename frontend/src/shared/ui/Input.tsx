import type { InputHTMLAttributes } from 'react';
import ErroresCampo from '@/shared/components/ErroresCampo';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  etiqueta: string;
  errores?: ReadonlyArray<string | undefined>;
  opcional?: boolean;
}

export default function Input({ etiqueta, errores = [], opcional = false, id, className = '', ...props }: InputProps) {
  const conError = errores.some(Boolean);
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="campo-label">
        {etiqueta}{' '}
        {opcional && <span className="font-normal text-slate-400 dark:text-slate-500">(opcional)</span>}
      </label>
      <input
        id={id}
        aria-invalid={conError}
        className={`campo-input ${conError ? 'campo-input-error' : ''} ${className}`}
        {...props}
      />
      <ErroresCampo errores={errores} />
    </div>
  );
}
