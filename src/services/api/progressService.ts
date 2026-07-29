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

  getGoals: async (): Promise<LearningMilestone[]> => {
    const response = await api.get<LearningMilestone[]>(API_ENDPOINTS.goals);
    return response.data;
  },

  getChart: async (): Promise<ProgressChartData> => {
    const response = await api.get<ProgressChartData>(API_ENDPOINTS.progressChart);
    return response.data;
  },
};
