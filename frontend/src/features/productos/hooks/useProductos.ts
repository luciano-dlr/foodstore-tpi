import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { handleApiError } from '@/shared/api/handleApiError';
import { useNotificaciones } from '@/shared/hooks/useNotificaciones';
import { createProducto, deleteProducto, getProductos, updateProducto, updateStock } from '../api/productos';
import type { FiltrosProductos, Producto, ProductoInput, ProductoStockUpdate } from '../types/producto';

const sinProductos: Producto[] = [];

export function useProductos(filtros: FiltrosProductos) {
  const query = useQuery({
    queryKey: ['productos', filtros],
    queryFn: () => getProductos(filtros),
  });

  return {
    productos: query.data?.items ?? sinProductos,
    total: query.data?.total ?? 0,
    isPending: query.isPending,
    isFetching: query.isFetching,
    error: query.error ? handleApiError(query.error) : null,
    refetch: () => void query.refetch(),
  };
}

interface EdicionProducto {
  id: number;
  datos: ProductoInput;
}

interface CambioStock {
  id: number;
  datos: ProductoStockUpdate;
}

export function useMutacionesProducto() {
  const queryClient = useQueryClient();
  const notificar = useNotificaciones();
  const invalidar = () => void queryClient.invalidateQueries({ queryKey: ['productos'] });

  const crear = useMutation({
    mutationFn: (datos: ProductoInput) => createProducto(datos),
    onSuccess: (producto) => {
      invalidar();
      notificar.exito(`Producto «${producto.nombre}» creado.`);
    },
  });

  const editar = useMutation({
    mutationFn: ({ id, datos }: EdicionProducto) => updateProducto(id, datos),
    onSuccess: (producto) => {
      invalidar();
      notificar.exito(`Producto «${producto.nombre}» actualizado.`);
    },
  });

  const cambiarStock = useMutation({
    mutationFn: ({ id, datos }: CambioStock) => updateStock(id, datos),
    onSuccess: (producto) => {
      invalidar();
      notificar.exito(`Stock de «${producto.nombre}»: ${producto.stock} u. (${producto.disponible ? 'disponible' : 'pausado'}).`);
    },
  });

  const eliminar = useMutation({
    mutationFn: (id: number) => deleteProducto(id),
    onSuccess: () => {
      invalidar();
      notificar.exito('Producto dado de baja.');
    },
  });

  return { crear, editar, cambiarStock, eliminar };
}
