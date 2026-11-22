import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16 text-center">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Página no encontrada</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">La ruta que buscás no existe.</p>
      <Link to="/" className="mt-6 inline-block rounded-lg bg-brand px-4 py-2 font-semibold text-white hover:bg-brand-hover">
        Ir al catálogo
      </Link>
    </main>
  );
}
