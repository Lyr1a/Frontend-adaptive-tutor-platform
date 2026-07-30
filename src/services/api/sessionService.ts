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
    const [sessionsResponse, subjectsResponse] = await Promise.all([
      api.get<Array<Partial<Session>> | null>(API_ENDPOINTS.mySessions),
      api.get<Array<{ id: number; name: string }> | null>(API_ENDPOINTS.subjects),
    ]);
    const subjectNames = new Map(
      (subjectsResponse.data ?? []).map((subject) => [subject.id, subject.name])
    );

    return (sessionsResponse.data ?? []).map((session) => ({
      id: session.id ?? 0,
      tutorId: session.tutorId ?? 0,
      tutorName: session.tutorName || `Tutor #${session.tutorId ?? 0}`,
      studentId: session.studentId ?? 0,
      studentName: session.studentName || `Student #${session.studentId ?? 0}`,
      subjectId: session.subjectId ?? 0,
      subjectName:
        session.subjectName ||
        subjectNames.get(session.subjectId ?? 0) ||
        `Subject #${session.subjectId ?? 0}`,
      startTime: session.startTime ?? '',
      endTime: session.endTime ?? '',
      meetingLink: session.meetingLink,
      canJoin: session.canJoin ?? false,
      status: session.status ?? 'Pending',
      score: session.score,
      tutorComment: session.tutorComment,
      goalCompletionPercentage: session.goalCompletionPercentage,
    }));
  },

  getById: async (id: number): Promise<Session> => {
    const [sessionResponse, subjectsResponse] = await Promise.all([
      api.get<Partial<Session>>(API_ENDPOINTS.sessionDetails(id)),
      api.get<Array<{ id: number; name: string }> | null>(API_ENDPOINTS.subjects),
    ]);
    const session = sessionResponse.data;
    const subjectName = (subjectsResponse.data ?? []).find(
      (subject) => subject.id === session.subjectId
    )?.name;
    return {
      id: session.id ?? id,
      tutorId: session.tutorId ?? 0,
      tutorName: session.tutorName || `Tutor #${session.tutorId ?? 0}`,
      studentId: session.studentId ?? 0,
      studentName: session.studentName || `Student #${session.studentId ?? 0}`,
      subjectId: session.subjectId ?? 0,
      subjectName: session.subjectName || subjectName || `Subject #${session.subjectId ?? 0}`,
      startTime: session.startTime ?? '',
      endTime: session.endTime ?? '',
      meetingLink: session.meetingLink,
      canJoin: session.canJoin ?? false,
      status: session.status ?? 'Pending',
      score: session.score,
      tutorComment: session.tutorComment,
      goalCompletionPercentage: session.goalCompletionPercentage,
    };
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
