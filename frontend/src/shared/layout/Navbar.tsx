import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ClipboardList, LayoutDashboard, LogIn, LogOut, ShoppingCart, Store, UserPlus, UtensilsCrossed } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import ThemeToggle from '@/shared/components/ThemeToggle';

const claseEnlace = ({ isActive }: { isActive: boolean }): string =>
  `inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition ${
    isActive ? 'bg-white text-brand dark:bg-slate-900 dark:text-indigo-300' : 'text-indigo-100 hover:bg-brand-hover hover:text-white'
  }`;

const nombresRol: Record<string, string> = { admin: 'Administrador', user: 'Cliente' };

export default function Navbar() {
  const usuario = useAuthStore((state) => state.usuario);
  const logout = useAuthStore((state) => state.logout);
  const cantidad = useCartStore((state) => state.cantidadTotal());
  const navigate = useNavigate();

  const cerrarSesion = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="bg-brand text-white shadow-md dark:bg-indigo-950">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <Link to="/" className="inline-flex items-center gap-2 text-xl font-bold tracking-tight">
          <UtensilsCrossed size={22} />
          Food Store
        </Link>

        <div className="flex flex-wrap gap-1">
          <NavLink to="/" end className={claseEnlace}>
            <Store size={16} />
            Catálogo
          </NavLink>
          <NavLink to="/carrito" className={claseEnlace}>
            <ShoppingCart size={16} />
            Carrito
            {cantidad > 0 && <span className="rounded-full bg-white px-1.5 py-0.5 text-xs leading-none text-brand">{cantidad}</span>}
          </NavLink>
          {usuario && (
            <NavLink to="/mis-pedidos" className={claseEnlace}>
              <ClipboardList size={16} />
              Mis pedidos
            </NavLink>
          )}
          {usuario?.role === 'admin' && (
            <NavLink to="/admin" className={claseEnlace}>
              <LayoutDashboard size={16} />
              Panel admin
            </NavLink>
          )}
        </div>

        {usuario ? (
          <div className="flex items-center gap-3">
            <div className="text-right leading-tight">
              <p className="text-sm font-semibold">{usuario.full_name}</p>
              <p className="text-xs text-indigo-200">
                @{usuario.username} · {nombresRol[usuario.role] ?? usuario.role}
              </p>
            </div>
            <ThemeToggle />
            <button
              type="button"
              onClick={() => void cerrarSesion()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-300 px-3 py-1.5 text-sm font-semibold transition hover:bg-white hover:text-brand"
            >
              <LogOut size={16} />
              Cerrar sesión
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <NavLink to="/login" className={claseEnlace}>
              <LogIn size={16} />
              Iniciar sesión
            </NavLink>
            <NavLink to="/register" className={claseEnlace}>
              <UserPlus size={16} />
              Registrarse
            </NavLink>
            <ThemeToggle />
          </div>
        )}
      </nav>
    </header>
  );
}
