import api from './axios';
import { API_ENDPOINTS } from '../../config/constants';
import type { CreateComplaintRequest, Complaint, ComplaintAction } from '../../types';

export const complaintService = {
  create: async (data: CreateComplaintRequest): Promise<Complaint> => {
    const response = await api.post<Complaint>(API_ENDPOINTS.createComplaint, data);
    return response.data;
  },

  getPending: async (): Promise<Complaint[]> => {
    const response = await api.get<Complaint[]>(API_ENDPOINTS.adminComplaints);
    return response.data;
  },

  resolve: async (id: number, action: ComplaintAction, reason?: string): Promise<void> => {
    await api.post(API_ENDPOINTS.adminResolveComplaint(id), {
      action,
      reason,
    });
  },
};
