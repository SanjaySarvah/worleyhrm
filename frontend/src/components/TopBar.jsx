import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import NotificationPanel from './NotificationPanel';
import { FaBell, FaCalendarAlt, FaUserCircle } from 'react-icons/fa';
import { Dropdown } from 'react-bootstrap';
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
  const [imageVersion, setImageVersion] = useState(0);

  const formId = user?.formId || localStorage.getItem('formId');

  useEffect(() => {
    socket.on('announcement:new', (data) => {
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((count) => count + 1);
    });

    return () => {
      socket.off('announcement:new');
    };
  }, []);

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
    <div className="bg-gradient-to-r from-blue-800 to-blue-600 px-6 py-3 flex items-center justify-between shadow-md sticky top-0 z-50">
      {/* Left Section */}
      <div className="flex items-center">
        <h2 className="text-white font-semibold text-xl">
          Welcome, <span className="font-bold">{user?.name ?? user?.email ?? 'User'}</span>
        </h2>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-6">
        
        
        {/* Calendar Button */}


        <button 
          onClick={() => setShowCalendar(true)}
          className="relative p-2 text-white hover:text-blue-100 transition-colors"
          aria-label="Calendar"
        >
          <FaCalendarAlt className="w-5 h-5" />
        </button>

        {/* Notification Bell */}
        <button 
          onClick={handleBellClick}
          className="relative p-2 text-white hover:text-blue-100 transition-colors"
          aria-label="Notifications"
        >
          <FaBell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Profile Dropdown */}
        <Dropdown align="end">
          <Dropdown.Toggle className="bg-transparent border-0 p-0 focus:outline-none">
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border-2 border-white hover:border-blue-200 transition-all"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center text-white">
                <FaUserCircle className="w-6 h-6" />
              </div>
            )}
          </Dropdown.Toggle>

          <Dropdown.Menu className="mt-2 border-0 shadow-lg rounded-lg overflow-hidden">
            <Dropdown.Item 
              onClick={goToProfile}
              className="px-4 py-2 hover:bg-blue-50 text-gray-800 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              My Profile
            </Dropdown.Item>
            <Dropdown.Divider className="my-1" />
            <Dropdown.Item 
              onClick={logout}
              className="px-4 py-2 hover:bg-red-50 text-red-600 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      {/* Notification Side Panel */}
      <NotificationPanel
        show={showPanel}
        notifications={notifications}
        onClose={() => setShowPanel(false)}
      />

      {/* Calendar Modal */}
      {showCalendar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl">
            <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
              <h3 className="text-xl font-semibold text-gray-800">Calendar View</h3>
              <button 
                onClick={() => setShowCalendar(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <CalendarView />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopBar;