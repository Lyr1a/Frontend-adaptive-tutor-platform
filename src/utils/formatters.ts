import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export const formatDate = (date: string | Date): string => {
  return dayjs(date).format('MMM D, YYYY');
};

export const formatDateTime = (date: string | Date): string => {
  return dayjs(date).format('MMM D, YYYY, HH:mm');
};

export const formatTime = (date: string | Date): string => {
  return dayjs(date).format('HH:mm');
};

export const formatRelativeTime = (date: string | Date): string => {
  return dayjs(date).fromNow();
};

export const LEARNING_CREDIT_RATE = 1000;
export const LEARNING_CREDIT_NAME = 'Learning Credits';
export const LEARNING_CREDIT_SYMBOL = 'Learning Credits';

export const toLearningCredits = (amount: number): number => amount / LEARNING_CREDIT_RATE;

export const fromLearningCredits = (credits: number): number => credits * LEARNING_CREDIT_RATE;

export const formatLearningCredits = (amount: number): string => {
  const credits = toLearningCredits(amount);
  return `${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: Number.isInteger(credits) ? 0 : 1,
    maximumFractionDigits: 1,
  }).format(credits)} ${LEARNING_CREDIT_SYMBOL}`;
};

// Keep the existing name so current screens share the Learning Credit format
// without changing data sent to or received from the API.
export const formatCurrency = formatLearningCredits;

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

export const getDateRange = (startDate: string, endDate: string): string => {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  
  if (start.isSame(end, 'day')) {
    return `${start.format('MMM D, YYYY')} · ${start.format('HH:mm')}–${end.format('HH:mm')}`;
  }
  return `${start.format('MMM D, YYYY, HH:mm')} – ${end.format('MMM D, YYYY, HH:mm')}`;
};

export const getSessionDuration = (startDate: string, endDate: string): number => {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  return end.diff(start, 'hour', true);
};

export const calculateSessionFee = (hourlyRate: number, startDate: string, endDate: string): number => {
  const hours = getSessionDuration(startDate, endDate);
  return Math.round(hourlyRate * hours);
};
