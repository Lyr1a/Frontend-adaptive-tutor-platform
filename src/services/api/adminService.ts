import api from './axios';
import { API_ENDPOINTS } from '../../config/constants';
import type { 
  DashboardStats, 
  TutorProfile, 
  CreditRequest, 
  Complaint,
  AdminUser,
  ComplaintAction,
} from '../../types';

export const adminService = {
  getDashboard: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>(API_ENDPOINTS.adminDashboard);
    return response.data;
  },

  getTutors: async (): Promise<TutorProfile[]> => {
    const response = await api.get<TutorProfile[]>(API_ENDPOINTS.adminTutors);
    return response.data;
  },

  getPendingTutorProfiles: async (): Promise<TutorProfile[]> => {
    const [profilesResponse, subjectsResponse] = await Promise.all([
      api.get<Array<Omit<TutorProfile, 'subjects'> & { subjectsJson?: string }>>(
        API_ENDPOINTS.pendingTutorProfiles
      ),
      api.get<Array<{ id: number; name: string }>>(API_ENDPOINTS.subjects),
    ]);
    const subjectNames = new Map(subjectsResponse.data.map(subject => [subject.id, subject.name]));

    return profilesResponse.data.map(profile => {
      let entries: Array<{ subjectId: number; rate?: number; hourlyRate?: number }> = [];
      try {
        entries = JSON.parse(profile.subjectsJson || '[]');
      } catch {
        entries = [];
      }

      return {
        ...profile,
        reputationScore: profile.reputationScore ?? 0,
        subjects: entries.map(entry => ({
          subjectId: entry.subjectId,
          subjectName: subjectNames.get(entry.subjectId) ?? `Môn #${entry.subjectId}`,
          hourlyRate: entry.hourlyRate ?? entry.rate ?? 0,
        })),
      };
    });
  },

  approveTutor: async (id: number): Promise<void> => {
    await api.post(API_ENDPOINTS.approveTutor(id));
  },

  rejectTutor: async (id: number, reason: string): Promise<void> => {
    await api.post(API_ENDPOINTS.rejectTutor(id), { reason });
  },

  getPendingCredits: async (): Promise<CreditRequest[]> => {
    const response = await api.get<CreditRequest[]>(API_ENDPOINTS.pendingCredits);
    return response.data;
  },

  approveCredit: async (id: number): Promise<void> => {
    await api.post(API_ENDPOINTS.approveCredit(id));
  },

  rejectCredit: async (id: number, reason?: string): Promise<void> => {
    await api.post(API_ENDPOINTS.rejectCredit(id), { reason });
  },

  getPendingComplaints: async (): Promise<Complaint[]> => {
    const response = await api.get<Complaint[]>(API_ENDPOINTS.adminComplaints);
    return response.data;
  },

  resolveComplaint: async (id: number, action: ComplaintAction, reason?: string, suspendDays?: number): Promise<void> => {
    await api.post(API_ENDPOINTS.adminResolveComplaint(id), {
      action,
      reason,
      suspendDays,
    });
  },

  getUsers: async (): Promise<AdminUser[]> => {
    const response = await api.get<AdminUser[]>('/api/admin/users');
    return response.data;
  },

  suspendUser: async (id: number, reason?: string): Promise<void> => {
    await api.post(`/api/admin/users/${id}/suspend`, { reason });
  },

  kickUser: async (id: number, reason?: string): Promise<void> => {
    await api.post(`/api/admin/users/${id}/kick`, { reason });
  },
};
