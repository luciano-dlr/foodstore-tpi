import { useMutation } from '@tanstack/react-query';
import { handleApiError } from '@/shared/api/handleApiError';
import { requestRegister } from '../api/auth';
import type { RegisterInput } from '../types/auth';

export function useRegistro() {
  const mutation = useMutation({
    mutationFn: (datos: RegisterInput) => requestRegister(datos),
  });

  return {
    registrar: mutation.mutateAsync,
    error: mutation.isError ? handleApiError(mutation.error) : null,
  };
}
