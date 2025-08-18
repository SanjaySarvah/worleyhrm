import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Sidebar = ({ collapsed, setCollapsed }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userRole = user?.role?.toLowerCase() || 'guest';

  const isActive = (path) => location.pathname === path;

  const handleLogoutConfirm = () => {
    logout?.();
    navigate('/login', { replace: true });
  };

  const getRoleColor = () => {
    switch (userRole) {
      case 'admin': return 'from-blue-600 to-indigo-700';
      case 'hr': return 'from-purple-600 to-violet-700';
      case 'staff': return 'from-emerald-600 to-teal-700';
      default: return 'from-slate-600 to-gray-700';
    }
  };

  const getTextColor = () => {
    switch (userRole) {
      case 'admin': return 'text-blue-600';
      case 'hr': return 'text-purple-600';
      case 'staff': return 'text-emerald-600';
      default: return 'text-slate-600';
    }
  };

  const link = (to, label, icon) => (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 no-underline
        ${isActive(to)
          ? `bg-gradient-to-r ${getRoleColor()} text-white shadow-md`
          : `text-gray-600 hover:bg-gray-50 ${getTextColor()}-hover`}`}
    >
      <i className={`bi ${icon} text-lg ${isActive(to) ? 'text-white' : getTextColor()}`}></i>
      {!collapsed && <span className="whitespace-nowrap font-medium">{label}</span>}
    </Link>
  );

  const renderLinks = () => {
    switch (userRole) {
      case 'admin':
        return (
          <>
            {link('/admin', 'Admin Dashboard', 'bi-speedometer2')}
            {link('/admin/create-employee', 'Employee Creation', 'bi-person-plus-fill')}
            {link('/admin/leave-status', 'Leave Status', 'bi-calendar-check')}
            {link('/admin/ProfileUpdate', 'Profile Update', 'bi-person-lines-fill')}
            {link('/admin/CalendarManager', 'Calendar Manager', 'bi-calendar3')}
            {link('/admin/ANnoncementManager', 'Announcement', 'bi-megaphone-fill')}
            {link('/admin/SalarySheetManager', 'Salary Updation', 'bi-cash-coin')}
            {link('/admin/ProductOrder', 'ProductSample', 'bi-box-seam')}
          </>
        );
      case 'hr':
        return (
          <>
            {link('/hr', 'HR Dashboard', 'bi-briefcase')}
            {link('/hr/leave-status', 'Leave Status', 'bi-calendar-check')}
          </>
        );
      case 'staff':
        return (
          <>
            {link('/staff', 'MyProfile', 'bi-person-workspace')}
            {link('/staff/leave-status', 'Leave Status', 'bi-calendar-check')}
            {link('/staff/LeaveForm', 'Leave Form', 'bi-pencil-square')}
          </>
        );
      default:
        return link('/login', 'Login', 'bi-box-arrow-in-right');
    }
  };

  return (
    <>
      {/* Sidebar Container */}
      <div
        className={`flex flex-col justify-between bg-white border-r border-gray-100 fixed top-0 left-0 h-screen
        transition-all duration-300 z-50 overflow-hidden
        ${collapsed ? 'w-16' : 'w-64'}`}
      >
        {/* Top Section */}
     <div className="flex-1 flex flex-col overflow-hidden">
  {/* Logo & Toggle */}
<div className={`flex items-center p-4 ${getRoleColor()} text-white shadow-sm`}>
  {!collapsed && (
    <div className="flex items-center w-full">
      <img 
        src="/src/assets/logo.webp" 
        alt="Company Logo" 
        className="h-12 max-w-full object-contain" 
      />
    </div>
  )}
</div>


  {/* Navigation Links */}
  <div className="flex-1 overflow-y-auto py-2">
    <nav className="flex flex-col gap-1 px-2">
      {renderLinks()}
    </nav>
  </div>
</div>


        {/* Bottom Section */}
        {userRole !== 'guest' && (
          <div className="p-2 border-t border-gray-100 bg-white">
            {/* User Info Row */}
            <div
              className="rounded-lg bg-gray-50 flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-100 transition-colors"
              onClick={() => setShowUserMenu(prev => !prev)}
            >
              <div className={`w-8 h-8 rounded-full ${getRoleColor()} flex items-center justify-center text-white font-semibold`}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              {!collapsed && (
                <div className="flex-1 overflow-hidden">
                  <p className="font-medium text-gray-800 truncate">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500 capitalize">{userRole}</p>
                </div>
              )}
              {!collapsed && (
                <i className={`bi bi-chevron-${showUserMenu ? 'up' : 'down'} text-gray-500`}></i>
              )}
            </div>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <button
                onClick={() => setShowLogoutModal(true)}
                className="mt-2 w-full flex items-center justify-center gap-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 shadow-sm py-2 no-underline transition-colors"
              >
                <i className="bi bi-box-arrow-right text-lg"></i>
                {!collapsed && <span>Logout</span>}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-80 overflow-hidden">
            <div className={`${getRoleColor()} p-4 text-white`}>
              <h3 className="text-lg font-semibold">Confirm Logout</h3>
            </div>
            <div className="p-5">
              <p className="mb-6 text-gray-600">Are you sure you want to logout?</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogoutConfirm}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-sm transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;