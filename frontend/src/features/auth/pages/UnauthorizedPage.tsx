import { Link } from 'react-router-dom';

export default function UnauthorizedPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16 text-center">
      <p className="text-5xl font-bold text-error">403</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-800 dark:text-slate-100">Sin permiso</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">Tu usuario no tiene el rol necesario para ver esta página.</p>
      <Link to="/" className="mt-6 inline-block rounded-lg bg-brand px-4 py-2 font-semibold text-white hover:bg-brand-hover">
        Volver al inicio
      </Link>
    </main>
  );
}
