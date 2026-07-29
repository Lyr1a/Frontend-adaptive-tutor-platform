// For development: leave empty to use Vite proxy (see vite.config.ts)
// For production: set VITE_API_URL environment variable to your production API URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const API_ENDPOINTS = {
  // Auth
  login: '/api/auth/login',
  register: '/api/auth/register',
  refreshToken: '/api/auth/refresh-token',
  forgotPassword: '/api/auth/forgot-password',
  resetPassword: '/api/auth/reset-password',

  // Tutor
  searchTutors: '/api/tutor/search',
  tutorDetails: (id: number) => `/api/tutor/${id}`,
  tutorFeedbacks: (id: number) => `/api/tutor/${id}/feedbacks`,
  updateAvailability: '/api/tutor/me/availability',

  // Session
  mySessions: '/api/session/my-sessions',
  sessionDetails: (id: number) => `/api/session/${id}`,
  bookSession: '/api/session/book',
  proposeChange: (id: number) => `/api/session/${id}/propose-change`,
  respondChange: (id: number) => `/api/session/change-requests/${id}/respond`,
  updateMeetingLink: (id: number) => `/api/session/${id}/meeting-link`,

  // Profile
  myProfile: '/api/profiles/me',
  updateProfile: '/api/profiles/me',
  updateStudentProfile: '/api/profiles/student',
  updateTutorProfile: '/api/profiles/tutor',
  tutorSubjects: '/api/profiles/tutor/subjects',

  // Subject
  subjects: '/api/subjects',
  createSubject: '/api/subjects',
  updateSubject: (id: number) => `/api/subjects/${id}`,
  deleteSubject: (id: number) => `/api/subjects/${id}`,

  // Feedback
  rateSession: '/api/feedback/rate',

  // Credits
  deposit: '/api/credits/deposit',
  balance: '/api/credits/balance',
  transactions: '/api/credits/transactions',

  // Progress
  createGoal: '/api/progress/goal',
  recordResult: '/api/progress/record-result',
  goals: '/api/progress/goals',
  progressChart: '/api/progress/chart',

  // Complaints
  createComplaint: '/api/complaints',
  pendingComplaints: '/api/complaints/pending',
  resolveComplaint: (id: number) => `/api/complaints/${id}/resolve`,

  // Notifications
  notifications: '/api/notifications',

  // Admin
  adminDashboard: '/api/admin/dashboard',
  adminTutors: '/api/admin/tutors',
  pendingTutorProfiles: '/api/admin/tutor-profiles/pending',
  approveTutor: (id: number) => `/api/admin/tutor-profiles/${id}/approve`,
  rejectTutor: (id: number) => `/api/admin/tutor-profiles/${id}/reject`,
  pendingCredits: '/api/admin/credits/pending',
  approveCredit: (id: number) => `/api/admin/credits/${id}/approve`,
  rejectCredit: (id: number) => `/api/admin/credits/${id}/reject`,
  adminComplaints: '/api/admin/complaints/pending',
  adminResolveComplaint: (id: number) => `/api/admin/complaints/${id}/resolve`,
};

export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  
  student: {
    dashboard: '/student/dashboard',
    searchTutors: '/student/search-tutors',
    tutorProfile: (id: number) => `/student/tutor/${id}`,
    bookSession: (tutorId: number) => `/student/book/${tutorId}`,
    sessions: '/student/sessions',
    sessionDetail: (id: number) => `/student/session/${id}`,
    wallet: '/student/wallet',
    progress: '/student/progress',
    profile: '/student/profile',
  },
  
  tutor: {
    dashboard: '/tutor/dashboard',
    sessions: '/tutor/sessions',
    sessionDetail: (id: number) => `/tutor/session/${id}`,
    schedule: '/tutor/schedule',
    students: '/tutor/students',
    profile: '/tutor/profile',
    wallet: '/tutor/wallet',
  },
  
  admin: {
    dashboard: '/admin/dashboard',
    tutorApprovals: '/admin/tutors/pending',
    creditRequests: '/admin/credits/pending',
    complaints: '/admin/complaints',
    users: '/admin/users',
  },
};
