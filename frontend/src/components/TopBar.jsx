import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import NotificationPanel from './NotificationPanel';
import { FaBell, FaCalendarAlt } from 'react-icons/fa';
import { Dropdown, Modal } from 'react-bootstrap';
import axios from 'axios';
import CalendarView from './CalendarView';

const socket = io('http://localhost:5000');

const TopBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);

  const formId = user?.formId || localStorage.getItem('formId');
  const [imageVersion, setImageVersion] = useState(0);

  // Socket announcements
  useEffect(() => {
    socket.on('announcement:new', (data) => {
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((count) => count + 1);
    });

    return () => {
      socket.off('announcement:new');
    };
  }, []);

  // Fetch profile image (with version tracking)
  useEffect(() => {
    const fetchProfileImage = async () => {
      if (formId) {
        try {
          const res = await axios.get(`http://localhost:5000/api/forms/profile-image/${formId}`, {
            responseType: 'blob',
          });
          const imageUrl = URL.createObjectURL(res.data);
          setProfileImageUrl(imageUrl);
        } catch (err) {
          console.error('Failed to fetch profile image', err);
        }
      }
    };

    fetchProfileImage();
  }, [formId, imageVersion]);

  const handleBellClick = () => {
    setShowPanel(!showPanel);
    setUnreadCount(0);
  };

  const goToProfile = () => {
    const role = user?.role || localStorage.getItem('role');
    navigate(`/${role}/ViewProfile`);
  };

  return (
    <>
      <style>
        {`
          .welcome-text {
            font-size: 18px;
            font-weight: 600;
            color: #ffffff;
          }

          .bell-button, .calendar-button {
            position: relative;
            background: none;
            border: none;
            font-size: 18px;
            color: #fff;
            cursor: pointer;
          }

          .bell-button:hover, .calendar-button:hover {
            color: red;
          }

          .badge {
            position: absolute;
            top: -6px;
            right: -6px;
            background-color: red;
            color: white;
            padding: 2px 6px;
            font-size: 12px;
            border-radius: 50%;
          }

          .avatar-img {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid #eee;
            transition: transform 0.2s ease;
          }

          .avatar-img:hover {
            transform: scale(1.05);
          }

          .dropdown-toggle {
            padding: 0;
            background: none !important;
            border: none;
          }

          .topbar {
            background-color: rgb(0 87 146);
            padding: 12px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #ddd;
            position: sticky;
            top: 0;
            z-index: 1000;
          }

          .left-section {
            flex: 1;
          }

          .actions {
            display: flex;
            align-items: center;
            gap: 20px;
          }
        `}
      </style>

      <div className="topbar">
        <div className="left-section">
          <div className="welcome-text">
            Welcome! {user?.name ?? user?.email ?? ''}
          </div>
        </div>

        <div className="actions">
          <button className="calendar-button" onClick={() => setShowCalendar(true)}>
            <FaCalendarAlt />
          </button>

          <button className="bell-button" onClick={handleBellClick}>
            <FaBell />
            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
          </button>

          <Dropdown align="end">
            <Dropdown.Toggle className="dropdown-toggle">
              <img
                src={profileImageUrl || '/default-avatar.png'}
                alt="Profile"
                className="avatar-img"
              />
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item onClick={goToProfile}>My Profile</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={logout}>Logout</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>

      {/* Notification Side Panel */}
      <NotificationPanel
        show={showPanel}
        notifications={notifications}
        onClose={() => setShowPanel(false)}
      />

      {/* Calendar Modal */}
      <Modal show={showCalendar} onHide={() => setShowCalendar(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Calendar View</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CalendarView />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default TopBar;
