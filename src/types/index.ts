// ============== User & Auth Types ==============
export type UserRole = 'Student' | 'Tutor' | 'Administrator';

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  isSuspended: boolean;
  creditBalance: number;
  lockoutEnd?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'Student' | 'Tutor';
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  resetToken?: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export type ComplaintAction = 'None' | 'Warning' | 'TemporarySuspension' | 'Close';

// ============== Tutor Types ==============
export type ProfileStatus = 'Pending' | 'Approved' | 'Rejected';

export interface TutorSubject {
  subjectId: number;
  subjectName: string;
  hourlyRate: number;
}

export interface TutorProfile {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  qualifications?: string;
  status: ProfileStatus;
  reputationScore: number;
  subjects: TutorSubject[];
  freeSchedulesJson?: string;
  timezoneOffset?: number;
}

export interface TutorSearchParams {
  subjectId: number;
  minRate?: number;
  maxRate?: number;
  studentScheduleJson?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface TutorSearchResponse {
  items: TutorProfile[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

// ============== Student Types ==============
export interface StudentProfile {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  avatarUrl?: string;
  studyGoals?: string;
  targetSubjectsJson?: string;
}

// ============== Subject Types ==============
export interface Subject {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
}

// ============== Session Types ==============
export type SessionStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'PendingChangeConfirmation';

export interface Session {
  id: number;
  tutorId: number;
  tutorName: string;
  tutorAvatar?: string;
  studentId: number;
  studentName: string;
  studentAvatar?: string;
  subjectId: number;
  subjectName: string;
  startTime: string;
  endTime: string;
  meetingLink?: string;
  status: SessionStatus;
  score?: number;
  tutorComment?: string;
  goalCompletionPercentage?: number;
}

export interface BookSessionRequest {
  tutorId: number;
  subjectId: number;
  startTime: string;
  endTime: string;
}

export type SessionChangeType = 'Reschedule' | 'Cancel';
export type ChangeRequestStatus = 'Pending' | 'Accepted' | 'Rejected';

export interface SessionChangeRequest {
  id: number;
  sessionId: number;
  requesterId: number;
  requesterName: string;
  changeType: SessionChangeType;
  status: ChangeRequestStatus;
  proposedStartTime?: string;
  proposedEndTime?: string;
  reason?: string;
  createdAt: string;
}

export interface ProposeChangeRequest {
  changeType: SessionChangeType;
  newStartTime?: string;
  newEndTime?: string;
  reason?: string;
}

export interface RespondChangeRequest {
  accept: boolean;
}

// ============== Feedback Types ==============
export interface Feedback {
  id: number;
  sessionId: number;
  senderId: number;
  senderName: string;
  senderAvatar?: string;
  receiverId: number;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface RateSessionRequest {
  sessionId: number;
  rating: number;
  comment?: string;
}

// ============== Credit Types ==============
export type CreditTransactionType = 'Deposit' | 'SessionFee' | 'LateCancellationFee' | 'Refund';
export type CreditRequestStatus = 'Pending' | 'Approved' | 'Rejected';

export interface CreditTransaction {
  id: number;
  userId: number;
  amount: number;
  type: CreditTransactionType;
  referenceId?: number;
  description?: string;
  createdAt: string;
}

export interface CreditRequest {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  amount: number;
  status: CreditRequestStatus;
  note?: string;
  createdAt: string;
  processedAt?: string;
  processedBy?: number;
  rejectionReason?: string;
}

export interface DepositRequest {
  amount: number;
  note?: string;
}

// ============== Progress/Milestone Types ==============
export type MilestoneStatus = 'NotStarted' | 'InProgress' | 'Completed';

export interface LearningMilestone {
  id: number;
  studentId: number;
  studentName: string;
  subjectId: number;
  subjectName: string;
  milestoneName: string;
  targetDate: string;
  status: MilestoneStatus;
  completionPercentage: number;
}

export interface CreateGoalRequest {
  studentId: number;
  subjectId: number;
  milestoneName: string;
  targetDate: string;
}

export interface RecordResultRequest {
  sessionId: number;
  score: number;
  tutorComment?: string;
  goalCompletionPercentage?: number;
}

export interface ProgressChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color: string;
  }[];
}

// ============== Complaint Types ==============
export type ComplaintType = 'LateCancellation' | 'InappropriateBehavior' | 'SessionResultDispute' | 'Other';
export type ComplaintStatus = 'Pending' | 'Resolved' | 'Dismissed';

export interface Complaint {
  id: number;
  reporterId: number;
  reporterName: string;
  reportedUserId: number;
  reportedUserName: string;
  sessionId?: number;
  type: ComplaintType;
  description: string;
  status: ComplaintStatus;
  resolutionAction?: string;
  resolutionReason?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface CreateComplaintRequest {
  reportedUserId: number;
  sessionId?: number;
  type: ComplaintType;
  description: string;
}

// ============== Notification Types ==============
export interface Notification {
  id: number;
  receiverId: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// ============== Admin Types ==============
export interface DashboardStats {
  totalUsers: number;
  totalTutors: number;
  totalStudents: number;
  totalSessions: number;
  completedSessions: number;
  pendingSessions: number;
  cancelledSessions: number;
  pendingTutorApprovals: number;
  pendingCreditRequests: number;
  pendingComplaints: number;
  topSubjects: TopSubject[];
  recentSessions: Session[];
}

export interface TopSubject {
  name: string;
  count: number;
}

export interface AdminUser {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  isSuspended: boolean;
  creditBalance: number;
  createdAt: string;
  tutorProfile?: {
    status: ProfileStatus;
    reputationScore: number;
  };
}

// ============== API Response Types ==============
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
