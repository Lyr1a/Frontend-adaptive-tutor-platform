import api from './axios';
import { API_ENDPOINTS } from '../../config/constants';
import type { User, StudentProfile, TutorProfile } from '../../types';

interface UpdateProfileData {
  fullName?: string;
  avatarUrl?: string;
}

interface UpdateStudentData {
  studyGoals?: string;
  targetSubjectsJson?: string;
}

interface UpdateTutorData {
  bio?: string;
  qualifications?: string;
}

interface TutorSubjectData {
  subjectId: number;
  hourlyRate: number;
}

export const profileService = {
  getMe: async (): Promise<User> => {
    const response = await api.get<User & { userId?: number }>(API_ENDPOINTS.myProfile);
    const profile = response.data;
    const normalizedProfile = {
      ...profile,
      id: profile.id ?? profile.userId ?? 0,
      creditBalance: profile.creditBalance ?? 0,
      isSuspended: profile.isSuspended ?? false,
      status:
        (profile as User & { tutorStatus?: string }).tutorStatus ??
        (profile as User & { status?: string }).status,
      reputationScore: (profile as User & { reputationScore?: number }).reputationScore ?? 0,
    };
    return normalizedProfile;
  },

  updateMe: async (data: UpdateProfileData): Promise<User> => {
    const formData = new FormData();
    formData.append('fullName', data.fullName ?? '');
    await api.put(API_ENDPOINTS.updateProfile, formData);
    return profileService.getMe();
  },

  updateStudentProfile: async (data: UpdateStudentData): Promise<StudentProfile> => {
    const response = await api.put<StudentProfile>(API_ENDPOINTS.updateStudentProfile, data);
    return response.data;
  },

  updateTutorProfile: async (data: UpdateTutorData): Promise<TutorProfile> => {
    const formData = new FormData();
    if (data.bio !== undefined) formData.append('bio', data.bio);
    if (data.qualifications !== undefined) {
      formData.append('qualificationsText', data.qualifications);
    }
    await api.put(API_ENDPOINTS.updateTutorProfile, formData);
    return {} as TutorProfile;
  },

  setTutorSubjects: async (subjects: TutorSubjectData[]): Promise<void> => {
    await api.post(API_ENDPOINTS.tutorSubjects, {
      subjects: subjects.map(subject => ({
        subjectId: subject.subjectId,
        rate: subject.hourlyRate,
      })),
    });
  },
};
