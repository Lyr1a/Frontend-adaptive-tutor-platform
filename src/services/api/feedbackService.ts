import api from './axios';
import { API_ENDPOINTS } from '../../config/constants';
import type { RateSessionRequest, Feedback } from '../../types';

export const feedbackService = {
  rateSession: async (data: RateSessionRequest): Promise<Feedback> => {
    await api.post(API_ENDPOINTS.rateSession, data);
    return {
      id: 0,
      sessionId: data.sessionId,
      senderId: 0,
      senderName: 'You',
      receiverId: 0,
      rating: data.rating,
      comment: data.comment,
      createdAt: new Date().toISOString(),
    };
  },
};
