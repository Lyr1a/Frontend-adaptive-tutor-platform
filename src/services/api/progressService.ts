import api from './axios';
import { API_ENDPOINTS } from '../../config/constants';
import type { 
  LearningMilestone, 
  CreateGoalRequest, 
  RecordResultRequest,
  ProgressChartData,
} from '../../types';

export const progressService = {
  createGoal: async (data: CreateGoalRequest): Promise<LearningMilestone> => {
    const response = await api.post<LearningMilestone>(API_ENDPOINTS.createGoal, data);
    return response.data;
  },

  recordResult: async (data: RecordResultRequest): Promise<void> => {
    await api.post(API_ENDPOINTS.recordResult, data);
  },

  getGoals: async (subjectId = 1): Promise<LearningMilestone[]> => {
    const response = await api.get<LearningMilestone[] | null>(API_ENDPOINTS.goals, {
      params: { subjectId },
    });
    return response.data ?? [];
  },

  getChart: async (subjectId = 1): Promise<ProgressChartData> => {
    const response = await api.get<ProgressChartData>(API_ENDPOINTS.progressChart, {
      params: { subjectId, timeRange: '30days' },
    });
    return response.data;
  },
};
