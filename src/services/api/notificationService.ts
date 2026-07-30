import api from './axios';
import { API_ENDPOINTS } from '../../config/constants';
import type { Notification } from '../../types';

export const notificationService = {
  getAll: async (): Promise<Notification[]> => {
    const response = await api.get<Notification[] | Notification | null>(API_ENDPOINTS.notifications);
    if (Array.isArray(response.data)) return response.data;
    return response.data ? [response.data] : [];
  },

  markAsRead: async (id: number): Promise<void> => {
    await api.patch(`${API_ENDPOINTS.notifications}/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.patch(`${API_ENDPOINTS.notifications}/read-all`);
  },
};
