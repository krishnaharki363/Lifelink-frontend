import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { DonorRegistration } from './pages/DonorRegistration';
import { AdminDashboard } from './pages/AdminDashboard';
import { HospitalDashboard } from './pages/HospitalDashboard';
import { DonorDashboard } from './pages/DonorDashboard';

const ProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--red-200)', borderTopColor: 'var(--red-600)', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: 'var(--gray-400)', fontSize: '0.9rem' }}>Loading…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to correct dashboard instead of login
    const roleRoutes: Record<string, string> = { ADMIN: '/admin', HOSPITAL: '/hospital', DONOR: '/donor' };
    return <Navigate to={roleRoutes[user.role] ?? '/login'} replace />;
  }

  return <>{children}</>;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/"         element={<Landing />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<DonorRegistration />} />

        {/* Protected — role-gated */}
        <Route path="/admin"    element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/hospital" element={<ProtectedRoute allowedRoles={['HOSPITAL']}><HospitalDashboard /></ProtectedRoute>} />
        <Route path="/donor"    element={<ProtectedRoute allowedRoles={['DONOR']}><DonorDashboard /></ProtectedRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
