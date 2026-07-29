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
    const response = await api.get<User>(API_ENDPOINTS.myProfile);
    return response.data;
  },

  updateMe: async (data: UpdateProfileData): Promise<User> => {
    const response = await api.put<User>(API_ENDPOINTS.updateProfile, data);
    return response.data;
  },

  updateStudentProfile: async (data: UpdateStudentData): Promise<StudentProfile> => {
    const response = await api.put<StudentProfile>(API_ENDPOINTS.updateStudentProfile, data);
    return response.data;
  },

  updateTutorProfile: async (data: UpdateTutorData): Promise<TutorProfile> => {
    const response = await api.put<TutorProfile>(API_ENDPOINTS.updateTutorProfile, data);
    return response.data;
  },

  setTutorSubjects: async (subjects: TutorSubjectData[]): Promise<void> => {
    await api.post(
      API_ENDPOINTS.tutorSubjects,
      subjects.map(subject => ({
        subjectId: subject.subjectId,
        rate: subject.hourlyRate,
      }))
    );
  },
};
