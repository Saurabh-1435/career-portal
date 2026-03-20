import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import './index.css';
import AuthProvider from './context/AuthProvider';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
// import Chatbot from './components/Chatbot';
import Footer from './components/Footer';

import Home from './pages/Home';
import RoleChoice from './pages/RoleChoice';
import RegisterCandidate from './pages/RegisterCandidate';
import RegisterCompany from './pages/RegisterCompany';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Jobs from './pages/Jobs';
import ApplyJob from './pages/ApplyJob';
import Profile from './pages/Profile';
import CandidateDashboard from './pages/CandidateDashboard';
import CompanyProfile from './pages/CompanyProfile';
import CompanyDashboard from './pages/CompanyDashboard';
import PostJob from './pages/PostJob';
import Applications from './pages/Applications';
import ReportCandidate from './pages/ReportCandidate';
import ReportCompany from './pages/ReportCompany';
import AccessDenied from './pages/AccessDenied';
import AdminDashboard from './pages/AdminDashboard';
import Companies from './pages/Companies';
import JobDetail from './pages/JobDetail';
import CandidateView from './pages/CandidateView';
import CompanyView from './pages/CompanyView';
import NotificationTest from './components/NotificationTest';

import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";

function App() {
  return (
    <AuthProvider>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        enableMultiContainer={false}
        containerId="main-toast"
        limit={3}
        toastClassName="custom-toast"
        bodyClassName="custom-toast-body"
        progressClassName="custom-toast-progress"
      />
      <BrowserRouter>
        <div className="app-layout">
          <Navbar />
          <main className="app-page">
            <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/role" element={<RoleChoice />} />
            <Route path="/register/candidate" element={<RegisterCandidate />} />
            <Route path="/register/company" element={<RegisterCompany />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/access-denied" element={<AccessDenied />} />

            <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
            <Route path="/job/:jobId" element={<ProtectedRoute><JobDetail /></ProtectedRoute>} />
            <Route path="/candidate/:id" element={<ProtectedRoute roles={['ROLE_ADMIN']}><CandidateView /></ProtectedRoute>} />
            <Route path="/company/:id" element={<ProtectedRoute roles={['ROLE_ADMIN']}><CompanyView /></ProtectedRoute>} />
            <Route path="/apply/:jobId" element={<ProtectedRoute roles={['ROLE_CANDIDATE']}><ApplyJob /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/candidate/dashboard" element={<ProtectedRoute roles={['ROLE_CANDIDATE']}><CandidateDashboard /></ProtectedRoute>} />
            <Route path="/companies" element={<ProtectedRoute><Companies /></ProtectedRoute>} />
            <Route path="/company/profile" element={<ProtectedRoute><CompanyProfile /></ProtectedRoute>} />
            <Route path="/company/dashboard" element={<ProtectedRoute><CompanyDashboard /></ProtectedRoute>} />
            <Route path="/post-job" element={<ProtectedRoute roles={['ROLE_COMPANY']}><PostJob /></ProtectedRoute>} />
            <Route path="/applications/:jobId" element={<ProtectedRoute><Applications /></ProtectedRoute>} />
            <Route path="/report/candidate" element={<ProtectedRoute><ReportCandidate /></ProtectedRoute>} />
            <Route path="/report/company" element={<ProtectedRoute roles={['ROLE_ADMIN']}><ReportCompany /></ProtectedRoute>} />
            <Route path="/admin/dashboard" element={<ProtectedRoute roles={['ROLE_ADMIN']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/test-notifications" element={<NotificationTest />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </main>
          {/* <Chatbot /> */}
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
