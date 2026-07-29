import api from './axios';
import { API_ENDPOINTS } from '../../config/constants';
import type {
  TutorProfile,
  TutorSearchParams,
  TutorSearchResponse,
  Feedback,
} from '../../types';

export const tutorService = {
  search: async (params: TutorSearchParams): Promise<TutorSearchResponse> => {
    const response = await api.get<TutorSearchResponse>(API_ENDPOINTS.searchTutors, {
      params: {
        subjectId: params.subjectId,
        minRate: params.minRate,
        maxRate: params.maxRate,
        studentScheduleJson: params.studentScheduleJson,
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 10,
      },
    });
    return response.data;
  },

  getDetails: async (id: number): Promise<TutorProfile> => {
    const response = await api.get<TutorProfile>(API_ENDPOINTS.tutorDetails(id));
    return response.data;
  },

  getFeedbacks: async (id: number): Promise<Feedback[]> => {
    const response = await api.get<Feedback[]>(API_ENDPOINTS.tutorFeedbacks(id));
    return response.data;
  },

  updateAvailability: async (freeSchedulesJson: string): Promise<void> => {
    await api.put(API_ENDPOINTS.updateAvailability, { freeSchedulesJson });
  },
};
