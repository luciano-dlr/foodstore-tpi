import { useState } from 'react';
import { UtensilsCrossed } from 'lucide-react';

interface ImagenProductoProps {
  url: string | null;
  nombre: string;
  className?: string;
}

export default function ImagenProducto({ url, nombre, className = '' }: ImagenProductoProps) {
  const [fallo, setFallo] = useState<boolean>(false);

  if (!url || fallo) {
    return (
      <div
        role="img"
        aria-label={nombre}
        className={`flex items-center justify-center bg-gradient-to-br from-indigo-100 to-slate-200 text-indigo-400 dark:from-indigo-950 dark:to-slate-800 dark:text-indigo-300 ${className}`}
      >
        <UtensilsCrossed className="h-1/3 max-h-12 w-1/3 max-w-12" strokeWidth={1.5} />
      </div>
    );
  }

  return <img src={url} alt={nombre} loading="lazy" onError={() => setFallo(true)} className={`object-cover ${className}`} />;
}
