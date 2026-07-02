import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { DonorDashboard } from './pages/DonorDashboard';
import { DonorRegistration } from './pages/DonorRegistration';

// A simple protected route wrapper
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <div className="flex-center" style={{ minHeight: '100vh' }}>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

// Placeholder dashboards
const AdminDashboard = () => <div className="container" style={{ padding: '2rem' }}><h1>Admin Dashboard</h1><p className="glass-panel" style={{marginTop: '2rem'}}>Welcome to the command center.</p></div>;
const HospitalDashboard = () => <div className="container" style={{ padding: '2rem' }}><h1>Hospital Dashboard</h1></div>;

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/hospital" element={<ProtectedRoute allowedRoles={['HOSPITAL']}><HospitalDashboard /></ProtectedRoute>} />
        <Route path="/donor" element={<ProtectedRoute allowedRoles={['DONOR']}><DonorDashboard /></ProtectedRoute>} />
        <Route path="/donor/registration" element={<ProtectedRoute allowedRoles={['DONOR']}><DonorRegistration /></ProtectedRoute>} />
        
        {/* Default route redirects to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
