import api from './axios';
import { API_ENDPOINTS } from '../../config/constants';
import type { DepositRequest, CreditTransaction, CreditRequest } from '../../types';

export const creditService = {
  deposit: async (data: DepositRequest): Promise<CreditRequest> => {
    const response = await api.post<CreditRequest>(API_ENDPOINTS.deposit, data);
    return response.data;
  },

  getBalance: async (): Promise<number> => {
    const response = await api.get<number | { balance?: number; Balance?: number }>(
      API_ENDPOINTS.balance
    );

    if (typeof response.data === 'number') {
      return response.data;
    }

    return Number(response.data.balance ?? response.data.Balance ?? 0);
  },

  getTransactions: async (): Promise<CreditTransaction[]> => {
    const response = await api.get<CreditTransaction[] | null>(API_ENDPOINTS.transactions);
    return response.data ?? [];
  },
};
