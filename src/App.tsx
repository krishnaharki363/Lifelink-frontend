import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { DonorDashboard } from './pages/DonorDashboard';
import { DonorRegistration } from './pages/DonorRegistration';
import { AdminDashboard } from './pages/AdminDashboard';
import { HospitalDashboard } from './pages/HospitalDashboard';

// A simple protected route wrapper
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <div className="flex-center" style={{ minHeight: '100vh' }}>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<DonorRegistration />} />
        <Route path="/donor/registration" element={<DonorRegistration />} />

        <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/hospital" element={<ProtectedRoute allowedRoles={['HOSPITAL']}><HospitalDashboard /></ProtectedRoute>} />
        <Route path="/donor" element={<ProtectedRoute allowedRoles={['DONOR']}><DonorDashboard /></ProtectedRoute>} />

        {/* Default route redirects to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
