import api from './axios';
import { API_ENDPOINTS } from '../../config/constants';
import type { RateSessionRequest, Feedback } from '../../types';

export const feedbackService = {
  rateSession: async (data: RateSessionRequest): Promise<Feedback> => {
    const response = await api.post<Feedback>(API_ENDPOINTS.rateSession, data);
    return response.data;
  },
};
