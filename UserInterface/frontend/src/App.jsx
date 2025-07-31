// File: App.jsx
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

import Login from './pages/Login';
import ResetPassword from './components/ResetPassword';

import AdminDashboard from './pages/Dashboard/AdminDashboard';
import HrDashboard from './pages/Dashboard/HrDashboard';
import StaffDashboard from './pages/Dashboard/StaffDashboard';

import LeaveForm from './pages/LeaveForm';
import ProductOrder from './pages/ProductOrder';
import ProfileUpdate from './pages/ProfileUpdate';

import CreateEmployee from './pages/CreateEmployee';
import LeaveStatus from './pages/LeaveStatus';
import CalendarManager from './pages/CalendarManager';

import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar'; // ✅ Import TopBar

function AppWrapper() {
  const location = useLocation();

  // Hide sidebar and topbar on login and reset-password pages
  const hideSidebar = ['/login', '/reset-password'].includes(location.pathname);

  return (
    <div className="d-flex">
      {/* Sidebar */}
      {!hideSidebar && <Sidebar />}

      {/* Main content container */}
      <div
        className="flex-grow-1"
        style={{
          marginLeft: hideSidebar ? 0 : '250px',
          width: '100%',
        }}
      >
        {/* ✅ TopBar */}
        {!hideSidebar && <TopBar />}

        {/* Page content */}
        <div className="p-3">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/unauthorized" element={<h2>Unauthorized</h2>} />

            {/* Role-based Dashboards */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr"
              element={
                <ProtectedRoute allowedRoles={['hr']}>
                  <HrDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff"
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <StaffDashboard />
                </ProtectedRoute>
              }
            />

            {/* Shared Pages */}
            <Route path="/leave-form" element={<LeaveForm />} />
            <Route path="/profile-update" element={<ProfileUpdate />} />
            <Route path="/product-order" element={<ProductOrder />} />
            <Route path="/CreateEmployee" element={<CreateEmployee />} />
            <Route path="/LeaveStatus" element={<LeaveStatus />} />
            <Route path="/CalendarManager" element={<CalendarManager />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppWrapper />
      </BrowserRouter>
    </AuthProvider>
  );
}
