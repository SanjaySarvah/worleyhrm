// src/components/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const userRole = user?.role?.toLowerCase?.() || 'guest';

  const handleLogoutConfirm = () => {
    logout?.();
    navigate('/login', { replace: true });
  };

  const isActive = (path) => location.pathname === path;

  const link = (to, label, icon) => (
    <Link
      to={to}
      style={{
        ...styles.link,
        ...(isActive(to) ? styles.activeLink : {}),
      }}
      className="d-flex align-items-center"
    >
      <i className={`bi ${icon}`} style={styles.icon}></i>
      {label}
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
          {link('/admin/ANnoncementManager', 'Annoncement', 'bi-megaphone-fill')}
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
          {/* {link('/staff/ProfileUpdate', 'Profile Update', 'bi-person-lines-fill')} */}
         
          </>
        );
      default:
        return link('/login', 'Login', 'bi-box-arrow-in-right');
    }
  };

  return (
    <>
      <div style={styles.sidebar}>
        <div>
          <div style={styles.logoContainer}>
            <img
              src="https://worleyventure.com/assets/img/logo/logo-black02.svg"
              alt="Company Logo"
              style={styles.logo}
            />
          </div>
          <div style={styles.navContainer}>{renderLinks()}</div>
        </div>

        {userRole !== 'guest' && (
          <button
            style={styles.logoutButton}
            onClick={() => setShowLogoutModal(true)}
          >
            <i className="bi bi-box-arrow-right" style={styles.icon}></i>
            Logout
          </button>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="modal fade show" style={styles.modalOverlay}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Logout</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowLogoutModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                Are you sure you want to logout?
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowLogoutModal(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={handleLogoutConfirm}>
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

const styles = {
  sidebar: {
    width: '260px',
    backgroundColor: '#ffffff',
    color: '#000000',
    minHeight: '100vh',
    padding: '1.5rem 1rem',
    position: 'fixed',
    top: 0,
    left: 0,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    borderRight: '1px solid #ddd',
    boxShadow: '4px 0 10px rgba(0, 0, 0, 0.05)',
    zIndex: 1040,
  },
  logoContainer: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  logo: {
    width: '200px',
    maxWidth: '100%',
  },
  navContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  link: {
    color: '#333',
    textDecoration: 'none',
    padding: '0.65rem 1rem',
    borderRadius: '8px',
    fontWeight: '500',
    transition: '0.3s',
    display: 'flex',
    alignItems: 'center',
  },
  activeLink: {
    backgroundColor: '#005792',
    color: '#fff',
  },
  icon: {
    marginRight: '10px',
    fontSize: '1.2rem',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '0.65rem 1rem',
    cursor: 'pointer',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '1rem',
  },
  modalOverlay: {
    display: 'block',
    background: 'rgba(0, 0, 0, 0.5)',
    position: 'fixed',
    inset: 0,
    zIndex: 2000,
  },
};

export default Sidebar;
