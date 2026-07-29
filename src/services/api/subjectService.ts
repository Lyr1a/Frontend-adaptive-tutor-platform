import api from './axios';
import { API_ENDPOINTS } from '../../config/constants';
import type { Subject } from '../../types';

export const subjectService = {
  getAll: async (): Promise<Subject[]> => {
    const response = await api.get<Subject[]>(API_ENDPOINTS.subjects);
    return response.data;
  },

  create: async (data: { name: string; description?: string }): Promise<Subject> => {
    const response = await api.post<Subject>(API_ENDPOINTS.createSubject, data);
    return response.data;
  },

  update: async (id: number, data: { name: string; description?: string }): Promise<Subject> => {
    const response = await api.put<Subject>(API_ENDPOINTS.updateSubject(id), data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.deleteSubject(id));
  },
};
