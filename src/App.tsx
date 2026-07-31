import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Theme & Config
import { theme } from './config/theme';
import './styles/globals.css';

// Layouts
import { MainLayout } from './components/Layout/MainLayout';
import { AuthLayout } from './components/Layout/AuthLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import SearchTutors from './pages/student/SearchTutors';
import TutorProfile from './pages/student/TutorProfile';
import BookSession from './pages/student/BookSession';
import StudentSessions from './pages/student/Sessions';
import SessionDetail from './pages/student/SessionDetail';
import Wallet from './pages/student/Wallet';
import Progress from './pages/student/Progress';
import Profile from './pages/student/Profile';

// Tutor Pages
import TutorDashboard from './pages/tutor/Dashboard';
import TutorSessions from './pages/tutor/Sessions';
import TutorSessionDetail from './pages/tutor/SessionDetail';
import Schedule from './pages/tutor/Schedule';
import Students from './pages/tutor/Students';
import TutorProfilePage from './pages/tutor/Profile';
import TutorWallet from './pages/tutor/Wallet';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import TutorApprovals from './pages/admin/TutorApprovals';
import CreditRequests from './pages/admin/CreditRequests';
import Complaints from './pages/admin/Complaints';
import Users from './pages/admin/Users';

// Common Pages
import HomePage from './pages/HomePage';

// Protected Route
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={theme}>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            
            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
            </Route>

            {/* Student Routes */}
            <Route element={<ProtectedRoute allowedRoles={['Student']} />}>
              <Route element={<MainLayout />}>
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/student/search-tutors" element={<SearchTutors />} />
                <Route path="/student/tutor/:id" element={<TutorProfile />} />
                <Route path="/student/book/:tutorId" element={<BookSession />} />
                <Route path="/student/sessions" element={<StudentSessions />} />
                <Route path="/student/session/:id" element={<SessionDetail />} />
                <Route path="/student/wallet" element={<Wallet />} />
                <Route path="/student/progress" element={<Progress />} />
                <Route path="/student/profile" element={<Profile />} />
              </Route>
            </Route>

            {/* Tutor Routes */}
            <Route element={<ProtectedRoute allowedRoles={['Tutor']} />}>
              <Route element={<MainLayout />}>
                <Route path="/tutor/dashboard" element={<TutorDashboard />} />
                <Route path="/tutor/sessions" element={<TutorSessions />} />
                <Route path="/tutor/session/:id" element={<TutorSessionDetail />} />
                <Route path="/tutor/schedule" element={<Schedule />} />
                <Route path="/tutor/students" element={<Students />} />
                <Route path="/tutor/profile" element={<TutorProfilePage />} />
                <Route path="/tutor/wallet" element={<TutorWallet />} />
              </Route>
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['Administrator']} />}>
              <Route element={<MainLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/tutors/pending" element={<TutorApprovals />} />
                <Route path="/admin/credits/pending" element={<CreditRequests />} />
                <Route path="/admin/complaints" element={<Complaints />} />
                <Route path="/admin/users" element={<Users />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ConfigProvider>
    </QueryClientProvider>
  );
};

export default App;
