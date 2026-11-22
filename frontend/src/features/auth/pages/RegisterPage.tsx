import { useForm } from '@tanstack/react-form';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import MensajeError from '@/shared/components/MensajeError';
import Button from '@/shared/ui/Button';
import Card from '@/shared/ui/Card';
import Input from '@/shared/ui/Input';
import { emailValido, passwordValida, textoObligatorio, usernameValido } from '@/shared/utils/validaciones';
import { useAuthStore } from '@/store/authStore';
import { useRegistro } from '../hooks/useRegistro';
import type { RegisterInput } from '../types/auth';

interface DefinicionCampo {
  nombre: keyof RegisterInput;
  etiqueta: string;
  tipo: 'text' | 'email' | 'password';
  autoComplete: string;
  placeholder?: string;
  validar: (props: { value: string }) => string | undefined;
}

const valoresIniciales: RegisterInput = { username: '', full_name: '', email: '', password: '' };

const campos: DefinicionCampo[] = [
  { nombre: 'username', etiqueta: 'Usuario', tipo: 'text', autoComplete: 'username', placeholder: 'ej: ana.garcia', validar: usernameValido },
  { nombre: 'full_name', etiqueta: 'Nombre completo', tipo: 'text', autoComplete: 'name', validar: textoObligatorio('El nombre', 2, 100) },
  { nombre: 'email', etiqueta: 'Email', tipo: 'email', autoComplete: 'email', placeholder: 'nombre@ejemplo.com', validar: emailValido },
  { nombre: 'password', etiqueta: 'Contraseña', tipo: 'password', autoComplete: 'new-password', placeholder: 'Mínimo 8 caracteres', validar: passwordValida },
];

export default function RegisterPage() {
  const usuario = useAuthStore((state) => state.usuario);
  const { registrar, error } = useRegistro();
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: valoresIniciales,
    onSubmit: async ({ value }) => {
      try {
        const creado = await registrar({
          username: value.username.trim(),
          full_name: value.full_name.trim(),
          email: value.email.trim(),
          password: value.password,
        });
        navigate('/login', { replace: true, state: { registrado: creado.username } });
      } catch {
        return;
      }
    },
  });

  if (usuario) return <Navigate to="/" replace />;

  return (
    <main className="mx-auto flex max-w-md flex-col px-4 py-12">
      <Card className="p-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Crear cuenta</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Registrate para hacer tus pedidos.</p>

        <form
          noValidate
          className="mt-6 flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit();
          }}
        >
          {campos.map((campo) => (
            <form.Field key={campo.nombre} name={campo.nombre} validators={{ onBlur: campo.validar, onSubmit: campo.validar }}>
              {(field) => (
                <Input
                  id={field.name}
                  etiqueta={campo.etiqueta}
                  type={campo.tipo}
                  autoComplete={campo.autoComplete}
                  placeholder={campo.placeholder}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  errores={field.state.meta.errors}
                />
              )}
            </form.Field>
          ))}

          <MensajeError mensaje={error} />

          <form.Subscribe selector={(s) => s.isSubmitting}>
            {(isSubmitting) => (
              <Button type="submit" disabled={isSubmitting} className="mt-2">
                {isSubmitting ? 'Creando cuenta...' : 'Registrarme'}
              </Button>
            )}
          </form.Subscribe>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="font-semibold text-brand hover:underline">
            Iniciá sesión
          </Link>
        </p>
      </Card>
    </main>
  );
}
