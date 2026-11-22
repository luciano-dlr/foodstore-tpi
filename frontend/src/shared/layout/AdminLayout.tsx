import { NavLink, Outlet } from 'react-router-dom';

const secciones = [
  { ruta: '/admin/resumen', nombre: 'Resumen' },
  { ruta: '/admin/pedidos', nombre: 'Pedidos' },
  { ruta: '/admin/productos', nombre: 'Productos' },
  { ruta: '/admin/categorias', nombre: 'Categorías' },
  { ruta: '/admin/usuarios', nombre: 'Usuarios' },
];

const claseTab = ({ isActive }: { isActive: boolean }): string =>
  `whitespace-nowrap border-b-2 px-3 py-2 text-sm font-semibold transition ${
    isActive
      ? 'border-brand text-brand'
      : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100'
  }`;

export default function AdminLayout() {
  return (
    <>
      <div className="border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4">
          <span className="mr-3 self-center text-xs font-bold tracking-wide text-slate-400 uppercase">Panel</span>
          {secciones.map((s) => (
            <NavLink key={s.ruta} to={s.ruta} className={claseTab}>
              {s.nombre}
            </NavLink>
          ))}
        </div>
      </div>
      <Outlet />
    </>
  );
}
