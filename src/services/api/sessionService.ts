import api from './axios';
import { API_ENDPOINTS } from '../../config/constants';
import type {
  Session,
  BookSessionRequest,
  SessionChangeRequest,
  ProposeChangeRequest,
  RespondChangeRequest,
} from '../../types';

export const sessionService = {
  getMySessions: async (): Promise<Session[]> => {
    const response = await api.get<Session[]>(API_ENDPOINTS.mySessions);
    return response.data;
  },

  getById: async (id: number): Promise<Session> => {
    const response = await api.get<Session>(API_ENDPOINTS.sessionDetails(id));
    return response.data;
  },

  book: async (data: BookSessionRequest): Promise<Session> => {
    const response = await api.post<Session>(API_ENDPOINTS.bookSession, data);
    return response.data;
  },

  proposeChange: async (sessionId: number, data: ProposeChangeRequest): Promise<SessionChangeRequest> => {
    const response = await api.post<SessionChangeRequest>(
      API_ENDPOINTS.proposeChange(sessionId),
      data
    );
    return response.data;
  },

  respondChange: async (requestId: number, data: RespondChangeRequest): Promise<void> => {
    await api.post(API_ENDPOINTS.respondChange(requestId), data);
  },

  updateMeetingLink: async (sessionId: number, meetingLink: string): Promise<void> => {
    await api.patch(API_ENDPOINTS.updateMeetingLink(sessionId), { meetingLink });
  },
};
