import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { requestLogin, requestLogout, requestMe } from '@/features/auth/api/auth';
import type { LoginCredentials, Rol, Usuario, UsuarioSesion } from '@/features/auth/types/auth';
import { queryClient } from '@/shared/api/queryClient';

interface AuthState {
  usuario: UsuarioSesion | null;
  cargando: boolean;
  login: (credenciales: LoginCredentials) => Promise<UsuarioSesion>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  limpiarSesion: () => void;
  tieneRol: (...roles: Rol[]) => boolean;
}

const aSesion = ({ id, username, full_name, email, role }: Usuario): UsuarioSesion => ({
  id,
  username,
  full_name,
  email,
  role,
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      usuario: null,
      cargando: true,

      login: async (credenciales) => {
        await requestLogin(credenciales);
        const usuario = aSesion(await requestMe());
        queryClient.clear();
        set({ usuario, cargando: false });
        return usuario;
      },

      logout: async () => {
        try {
          await requestLogout();
        } finally {
          get().limpiarSesion();
        }
      },

      checkSession: async () => {
        set({ cargando: true });
        try {
          set({ usuario: aSesion(await requestMe()), cargando: false });
        } catch {
          set({ usuario: null, cargando: false });
        }
      },

      limpiarSesion: () => {
        queryClient.clear();
        set({ usuario: null, cargando: false });
      },

      tieneRol: (...roles) => {
        const usuario = get().usuario;
        return usuario !== null && roles.includes(usuario.role);
      },
    }),
    {
      name: 'foodstore-auth',
      partialize: (state) => ({ usuario: state.usuario }),
    },
  ),
);
