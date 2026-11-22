import { useEffect, useState } from 'react';

export function useDebounce<T>(valor: T, demora = 400): T {
  const [demorado, setDemorado] = useState<T>(valor);

  useEffect(() => {
    const timer = setTimeout(() => setDemorado(valor), demora);
    return () => clearTimeout(timer);
  }, [valor, demora]);

  return demorado;
}
