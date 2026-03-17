import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OtpVerification from "./pages/OtpVerification";
import ForgotPassword from "./pages/ForgotPassword";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Layouts
import StudentLayout from "./components/layouts/StudentLayout";
import AdminLayout from "./components/layouts/AdminLayout";

// Student pages
import StudentDashboard from "./pages/student/Dashboard";
import ProfilePage from "./pages/student/Profile";
import AvailableDrives from "./pages/student/Drives";
import DriveDetails from "./pages/student/DriveDetails";
import MyApplications from "./pages/student/Applications";
import ApplicationDetail from "./pages/student/ApplicationDetail";
import ExamPage from "./pages/student/Exams";
import InterviewsPage from "./pages/student/Interviews";
import StudentAnalytics from "./pages/student/Analytics";
import SettingsPage from "./pages/student/Settings";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import CompaniesPage from "./pages/admin/Companies";
import JobDescriptionsPage from "./pages/admin/JobDescriptions";
import RoundConfigPage from "./pages/admin/RoundConfig";
import RecruitmentDrives from "./pages/admin/Drives";
import AdminApplications from "./pages/admin/Applications";
import QuestionBankPage from "./pages/admin/QuestionBank";
import ReportsPage from "./pages/admin/Reports";

const queryClient = new QueryClient();

/** Gates student/admin routes behind registration completion */
const RegistrationGate = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("authToken");
  const isLoggedIn = token || localStorage.getItem("artiset_logged_in") === "true";
  const isRegistered = token || localStorage.getItem("artiset_registration_complete") === "true";
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (!isRegistered) return <Navigate to="/registration" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-otp" element={<OtpVerification />} />
            <Route 
              path="/registration" 
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } 
            />

            {/* Student routes – require authentication */}
            <Route 
              path="/student" 
              element={
                <ProtectedRoute requiredRoles={['student']}>
                  <RegistrationGate>
                    <StudentLayout />
                  </RegistrationGate>
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="drives" element={<AvailableDrives />} />
              <Route path="drives/:id" element={<DriveDetails />} />
              <Route path="applications" element={<MyApplications />} />
              <Route path="applications/:id" element={<ApplicationDetail />} />
              <Route path="exams" element={<ExamPage />} />
              <Route path="interviews" element={<InterviewsPage />} />
              <Route path="analytics" element={<StudentAnalytics />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Admin routes – require authentication */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requiredRoles={['admin', 'tpo']}>
                  <RegistrationGate>
                    <AdminLayout />
                  </RegistrationGate>
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="companies" element={<CompaniesPage />} />
              <Route path="jds" element={<JobDescriptionsPage />} />
              <Route path="rounds" element={<RoundConfigPage />} />
              <Route path="drives" element={<RecruitmentDrives />} />
              <Route path="applications" element={<AdminApplications />} />
              <Route path="questions" element={<QuestionBankPage />} />
              <Route path="reports" element={<ReportsPage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
