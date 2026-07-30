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
    const [
      dashboardResponse,
      usersResponse,
      pendingCreditsResponse,
      pendingComplaintsResponse,
    ] = await Promise.all([
      api.get<{
        totalCompletedSessions?: number;
        totalCancelledSessions?: number;
        totalPendingSessions?: number;
        popularSubjects?: Array<{ subjectName: string; sessionCount: number }>;
        pendingTutorApprovals?: number;
        openComplaints?: number;
      }>(API_ENDPOINTS.adminDashboard),
      api.get<AdminUser[] | null>('/api/admin/users'),
      api.get<CreditRequest[] | null>(API_ENDPOINTS.pendingCredits),
      api.get<Complaint[] | null>(API_ENDPOINTS.adminComplaints),
    ]);
    const dashboard = dashboardResponse.data;
    const users = usersResponse.data ?? [];
    const tutors = users.filter((user) => user.role === 'Tutor').length;
    const students = users.filter((user) => user.role === 'Student').length;
    const completed = dashboard.totalCompletedSessions ?? 0;
    const pending = dashboard.totalPendingSessions ?? 0;
    const cancelled = dashboard.totalCancelledSessions ?? 0;

    return {
      totalUsers: users.length,
      totalTutors: tutors,
      totalStudents: students,
      totalSessions: completed + pending + cancelled,
      completedSessions: completed,
      pendingSessions: pending,
      cancelledSessions: cancelled,
      pendingTutorApprovals: dashboard.pendingTutorApprovals ?? 0,
      pendingCreditRequests: pendingCreditsResponse.data?.length ?? 0,
      pendingComplaints:
        pendingComplaintsResponse.data?.length ??
        dashboard.openComplaints ??
        0,
      topSubjects: (dashboard.popularSubjects ?? []).map((subject) => ({
        name: subject.subjectName,
        count: subject.sessionCount,
      })),
      recentSessions: [],
    };
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

    return (profilesResponse.data ?? []).map(profile => {
      let entries: Array<{
        subjectId?: number;
        SubjectId?: number;
        rate?: number;
        Rate?: number;
        hourlyRate?: number;
      }> = [];
      try {
        entries = JSON.parse(profile.subjectsJson || '[]');
      } catch {
        entries = [];
      }

      return {
        ...profile,
        reputationScore: profile.reputationScore ?? 0,
        subjects: entries.map(entry => {
          const subjectId = entry.subjectId ?? entry.SubjectId ?? 0;
          return {
            subjectId,
            subjectName: subjectNames.get(subjectId) ?? `Subject #${subjectId}`,
            hourlyRate: entry.hourlyRate ?? entry.rate ?? entry.Rate ?? 0,
          };
        }),
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
    const response = await api.get<Array<{
      id: number;
      userId: number;
      fullName: string;
      email: string;
      amount: number;
      createdAt: string;
    }> | null>(API_ENDPOINTS.pendingCredits);
    return (response.data ?? []).map((request) => ({
      id: request.id,
      userId: request.userId,
      userName: request.fullName,
      userEmail: request.email,
      amount: request.amount,
      status: 'Pending',
      createdAt: request.createdAt,
    }));
  },

  approveCredit: async (id: number): Promise<void> => {
    await api.post(API_ENDPOINTS.approveCredit(id));
  },

  rejectCredit: async (id: number, reason?: string): Promise<void> => {
    await api.post(API_ENDPOINTS.rejectCredit(id), { reason });
  },

  getPendingComplaints: async (): Promise<Complaint[]> => {
    const response = await api.get<Complaint[] | null>(API_ENDPOINTS.adminComplaints);
    return response.data ?? [];
  },

  resolveComplaint: async (id: number, action: ComplaintAction, reason?: string, suspendDays?: number): Promise<void> => {
    await api.post(API_ENDPOINTS.adminResolveComplaint(id), {
      action,
      reason,
      suspendDays,
    });
  },

  getUsers: async (): Promise<AdminUser[]> => {
    const response = await api.get<AdminUser[] | null>('/api/admin/users');
    return response.data ?? [];
  },

  suspendUser: async (id: number, reason?: string): Promise<void> => {
    await api.post(`/api/admin/users/${id}/suspend`, { reason });
  },

  kickUser: async (id: number, reason?: string): Promise<void> => {
    await api.post(`/api/admin/users/${id}/kick`, { reason });
  },
};
