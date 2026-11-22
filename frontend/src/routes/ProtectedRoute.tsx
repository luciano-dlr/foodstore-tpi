import { Navigate, Outlet, useLocation } from 'react-router-dom';
import type { Rol } from '@/features/auth';
import PantallaCarga from '@/shared/components/PantallaCarga';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  allowedRoles?: Rol[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const usuario = useAuthStore((state) => state.usuario);
  const cargando = useAuthStore((state) => state.cargando);
  const location = useLocation();

  if (cargando) return <PantallaCarga />;

  if (!usuario) return <Navigate to="/login" replace state={{ from: location }} />;

  if (allowedRoles && !allowedRoles.includes(usuario.role)) return <Navigate to="/unauthorized" replace />;

  return <Outlet />;
}
