import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const [userRole, setUserRole] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const role = user?.role?.toLowerCase?.() || 'guest';
    setUserRole(role);
  }, []);

  const handleLogoutConfirm = () => {
    // Clear auth state + LS
    logout?.();
    // (If you also set axios default headers somewhere, clear it here)
    // delete axios.defaults.headers.common.Authorization;
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
            {link('/CreateEmployee', 'Employee Creation', 'bi-person-plus-fill')}
            {link('/profile-update', 'Profile Update', 'bi-pencil-square')}
            {link('/LeaveStatus', 'Leave Status', 'bi-bag-check')}
            {link('/product-order', 'Product Order', 'bi-bag-check')}
            {link('/PayslipGenerator', 'Payslip Generator', 'bi-receipt')}
            {link('/CalendarManager', 'Calendar Manager', 'bi-calendar-event')}
           {link('/LeaveForm', 'Leave Form', 'bi-calendar-event')}
            {link('/LeaveStatus', 'Leave Status', 'bi-calendar-event')}
               
          </>
        );
      case 'hr':
        return (
          <>
          {link('/hr', 'HR Dashboard', 'bi-house-door-fill')}
          {link('/profile-update', 'Profile Update', 'bi-pencil-square')}
          {link('/PayslipGenerator', 'Payslip Generator', 'bi-receipt')}
          {link('/leave-form', 'Leave Form', 'bi-calendar-check')}
          {link('/product-order', 'Product Order', 'bi-bag-check')}
          {link('/LeaveStatus', 'Leave Status', 'bi-bag-check')}
          {link('/CalendarManager', 'Calendar Manager', 'bi-calendar-event')}
          </>
        );
      case 'staff':
      case 'user':
        return (
          <>
            {link('/staff', 'Staff Dashboard', 'bi-house-door-fill')}
            {link('/leave-form', 'Leave Form', 'bi-calendar-check')}
            {link('/profile-update', 'Profile Update', 'bi-pencil-square')}
            {link('/product-order', 'Product Order', 'bi-bag-check')}
            {link('/PayslipGenerator', 'Payslip Generator', 'bi-receipt')}
          </>
        );
      case 'guest':
        return <>{link('/login', 'Login', 'bi-box-arrow-in-right')}</>;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Sidebar */}
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
