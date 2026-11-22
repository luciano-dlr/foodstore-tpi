import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from '@tanstack/react-form';
import axios from 'axios';
import { handleApiError } from '@/shared/api/handleApiError';
import MensajeError from '@/shared/components/MensajeError';
import Button from '@/shared/ui/Button';
import Card from '@/shared/ui/Card';
import Input from '@/shared/ui/Input';
import { obligatorio } from '@/shared/utils/validaciones';
import { useAuthStore } from '@/store/authStore';
import type { LoginCredentials } from '../types/auth';

interface EstadoNavegacion {
  from?: { pathname: string };
  registrado?: string;
}

const validarUsuario = obligatorio('El usuario es obligatorio');
const validarPassword = obligatorio('La contraseña es obligatoria');

const mensajeLogin = (error: unknown): string => {
  if (axios.isAxiosError(error) && error.response?.status === 401) return 'Usuario o contraseña incorrectos.';
  return handleApiError(error);
};

export default function LoginPage() {
  const usuario = useAuthStore((state) => state.usuario);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const estado = (location.state ?? {}) as EstadoNavegacion;
  const desde = estado.from?.pathname;
  const destino = desde && desde !== '/login' ? desde : '/';

  const form = useForm({
    defaultValues: { username: estado.registrado ?? '', password: '' } as LoginCredentials,
    onSubmit: async ({ value }) => {
      setError(null);
      try {
        await login({ username: value.username.trim(), password: value.password });
        navigate(destino, { replace: true });
      } catch (e) {
        setError(mensajeLogin(e));
      }
    },
  });

  if (usuario) return <Navigate to={destino} replace />;

  return (
    <main className="mx-auto flex max-w-md flex-col px-4 py-12">
      <Card className="p-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Iniciar sesión</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Ingresá con tu usuario y contraseña.</p>

        {estado.registrado && (
          <p role="status" className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-success dark:bg-green-950/60">
            Cuenta creada. Ya podés iniciar sesión.
          </p>
        )}

        <form
          noValidate
          className="mt-6 flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit();
          }}
        >
          <form.Field name="username" validators={{ onBlur: validarUsuario, onSubmit: validarUsuario }}>
            {(field) => (
              <Input
                id={field.name}
                etiqueta="Usuario"
                autoComplete="username"
                autoFocus={!estado.registrado}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                errores={field.state.meta.errors}
              />
            )}
          </form.Field>

          <form.Field name="password" validators={{ onBlur: validarPassword, onSubmit: validarPassword }}>
            {(field) => (
              <Input
                id={field.name}
                etiqueta="Contraseña"
                type="password"
                autoComplete="current-password"
                autoFocus={Boolean(estado.registrado)}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                errores={field.state.meta.errors}
              />
            )}
          </form.Field>

          <MensajeError mensaje={error} />

          <form.Subscribe selector={(s) => s.isSubmitting}>
            {(isSubmitting) => (
              <Button type="submit" disabled={isSubmitting} className="mt-2">
                {isSubmitting ? 'Ingresando...' : 'Ingresar'}
              </Button>
            )}
          </form.Subscribe>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
          ¿No tenés cuenta?{' '}
          <Link to="/register" className="font-semibold text-brand hover:underline">
            Registrate
          </Link>
        </p>
      </Card>
    </main>
  );
}
