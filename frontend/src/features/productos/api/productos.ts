import { api } from '@/shared/api/axiosInstance';
import type {
  FiltrosProductos,
  Producto,
  ProductoInput,
  ProductosPaginados,
  ProductoStockUpdate,
} from '../types/producto';

const aPayload = (datos: ProductoInput) => ({
  nombre: datos.nombre.trim(),
  descripcion: datos.descripcion.trim() || null,
  precio_base: datos.precio_base,
  imagen_url: datos.imagen_url.trim() || null,
  stock: datos.stock,
  disponible: datos.disponible,
  categoria_id: datos.categoria_id,
});

export const getProductos = async (filtros: FiltrosProductos): Promise<ProductosPaginados> => {
  const { data } = await api.get<ProductosPaginados>('/productos', { params: filtros });
  return data;
};

export const createProducto = async (datos: ProductoInput): Promise<Producto> => {
  const { data } = await api.post<Producto>('/productos', aPayload(datos));
  return data;
};

export const updateProducto = async (id: number, datos: ProductoInput): Promise<Producto> => {
  const { nombre, descripcion, precio_base, imagen_url, disponible, categoria_id } = aPayload(datos);
  const { data } = await api.put<Producto>(`/productos/${id}`, {
    nombre,
    descripcion,
    precio_base,
    imagen_url,
    disponible,
    categoria_id,
  });
  return data;
};

export const updateStock = async (id: number, datos: ProductoStockUpdate): Promise<Producto> => {
  const { data } = await api.patch<Producto>(`/productos/${id}/stock`, datos);
  return data;
};

export const deleteProducto = async (id: number): Promise<void> => {
  await api.delete(`/productos/${id}`);
};
