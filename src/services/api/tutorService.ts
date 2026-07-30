import api from './axios';
import { API_ENDPOINTS } from '../../config/constants';
import type {
  TutorProfile,
  TutorSubject,
  TutorSearchParams,
  TutorSearchResponse,
  Feedback,
} from '../../types';

interface TutorSearchApiItem {
  tutorProfileId: number;
  userId: number;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
  subjectsJson?: string;
  reputationScore: number;
}

interface TutorSearchApiResponse {
  tutors?: TutorSearchApiItem[];
  items?: TutorSearchApiItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

interface TutorDetailsApiResponse {
  userId: number;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
  qualifications?: string;
  subjectsJson?: string;
  freeSchedulesJson?: string;
  averageRating?: number;
}

interface TutorFeedbackApiItem {
  feedbackId: number;
  sessionId: number;
  authorName: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

interface TutorFeedbackApiResponse {
  feedbacks?: TutorFeedbackApiItem[];
}

interface TutorSubjectApiItem {
  subjectId?: number;
  SubjectId?: number;
  rate?: number;
  Rate?: number;
  hourlyRate?: number;
  subjectName?: string;
  SubjectName?: string;
}

const parseTutorSubjects = (subjectsJson?: string): TutorSubject[] => {
  if (!subjectsJson) return [];

  try {
    const subjects = JSON.parse(subjectsJson) as TutorSubjectApiItem[];
    if (!Array.isArray(subjects)) return [];

    return subjects
      .map((subject) => {
        const subjectId = subject.subjectId ?? subject.SubjectId;
        const hourlyRate = subject.hourlyRate ?? subject.rate ?? subject.Rate;
        if (subjectId === undefined || hourlyRate === undefined) return null;

        return {
          subjectId,
          subjectName: subject.subjectName ?? subject.SubjectName ?? `Subject #${subjectId}`,
          hourlyRate,
        };
      })
      .filter((subject): subject is TutorSubject => subject !== null);
  } catch {
    return [];
  }
};

export const tutorService = {
  search: async (params: TutorSearchParams): Promise<TutorSearchResponse> => {
    const response = await api.get<TutorSearchApiResponse>(API_ENDPOINTS.searchTutors, {
      params: {
        subjectId: params.subjectId,
        minRate: params.minRate,
        maxRate: params.maxRate,
        studentScheduleJson: params.studentScheduleJson,
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 10,
      },
    });

    const apiItems = response.data.tutors ?? response.data.items ?? [];
    const items: TutorProfile[] = apiItems.map((tutor) => ({
      id: tutor.tutorProfileId,
      userId: tutor.userId,
      fullName: tutor.fullName,
      email: '',
      avatarUrl: tutor.avatarUrl,
      bio: tutor.bio,
      status: 'Approved',
      reputationScore: tutor.reputationScore ?? 0,
      subjects: parseTutorSubjects(tutor.subjectsJson),
    }));

    return {
      items,
      totalCount: response.data.totalCount ?? items.length,
      pageNumber: response.data.pageNumber ?? params.pageNumber ?? 1,
      pageSize: response.data.pageSize ?? params.pageSize ?? 10,
      totalPages: Math.ceil(
        (response.data.totalCount ?? items.length) /
        (response.data.pageSize ?? params.pageSize ?? 10)
      ),
    };
  },

  getDetails: async (id: number): Promise<TutorProfile> => {
    const [profileResponse, subjectsResponse] = await Promise.all([
      api.get<TutorDetailsApiResponse>(API_ENDPOINTS.tutorDetails(id)),
      api.get<Array<{ id: number; name: string }>>(API_ENDPOINTS.subjects),
    ]);

    const profile = profileResponse.data;
    const subjectNames = new Map(
      (subjectsResponse.data || []).map((subject) => [subject.id, subject.name])
    );
    const subjects = parseTutorSubjects(profile.subjectsJson).map((subject) => ({
      ...subject,
      subjectName: subjectNames.get(subject.subjectId) ?? subject.subjectName,
    }));

    return {
      id: profile.userId,
      userId: profile.userId,
      fullName: profile.fullName,
      email: '',
      avatarUrl: profile.avatarUrl,
      bio: profile.bio,
      qualifications: profile.qualifications,
      status: 'Approved',
      reputationScore: profile.averageRating ?? 0,
      subjects,
      freeSchedulesJson: profile.freeSchedulesJson,
    };
  },

  getFeedbacks: async (id: number): Promise<Feedback[]> => {
    const response = await api.get<TutorFeedbackApiResponse | Feedback[]>(
      API_ENDPOINTS.tutorFeedbacks(id)
    );

    if (Array.isArray(response.data)) {
      return response.data;
    }

    return (response.data.feedbacks ?? []).map((feedback) => ({
      id: feedback.feedbackId,
      sessionId: feedback.sessionId,
      senderId: 0,
      senderName: feedback.authorName,
      receiverId: id,
      rating: feedback.rating,
      comment: feedback.comment,
      createdAt: feedback.createdAt,
    }));
  },

  updateAvailability: async (freeSchedulesJson: string): Promise<void> => {
    const offsetMinutes = -new Date().getTimezoneOffset();
    const sign = offsetMinutes >= 0 ? '+' : '-';
    const absoluteMinutes = Math.abs(offsetMinutes);
    const timezoneOffset = `${sign}${String(Math.floor(absoluteMinutes / 60)).padStart(2, '0')}:${String(absoluteMinutes % 60).padStart(2, '0')}`;

    await api.put(API_ENDPOINTS.updateAvailability, {
      freeSchedulesJson,
      timezoneOffset,
    });
  },
};
