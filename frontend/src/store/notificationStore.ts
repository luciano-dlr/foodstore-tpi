import { create } from 'zustand';

export type TipoNotificacion = 'success' | 'error';

interface NotificationStore {
  message: string;
  show: boolean;
  tipo: TipoNotificacion;
  id: number;
  showNotification: (message: string, tipo?: TipoNotificacion) => void;
  hideNotification: () => void;
}

export const useNotificationStore = create<NotificationStore>()((set) => ({
  message: '',
  show: false,
  tipo: 'success',
  id: 0,
  showNotification: (message, tipo = 'success') =>
    set((state) => ({ message, tipo, show: true, id: state.id + 1 })),
  hideNotification: () => set({ message: '', show: false }),
}));
