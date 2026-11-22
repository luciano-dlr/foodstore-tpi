const formatoPesos = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });
const formatoFecha = new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' });

export const formatearPrecio = (valor: number): string => formatoPesos.format(valor);

export const formatearFecha = (iso: string): string => formatoFecha.format(new Date(iso));
