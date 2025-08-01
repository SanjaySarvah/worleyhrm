import React from 'react';
import './NotificationPanel.css'; // Custom styles

const NotificationPanel = ({ show, notifications, onClose }) => {
  return (
    <div className={`notification-panel ${show ? 'open' : ''}`}>
      <div className="header">
        <h5 className="m-0">Announcements</h5>
        <button className="btn btn-sm btn-outline-secondary" onClick={onClose}>X</button>
      </div>
      <div className="content">
        {notifications.length === 0 ? (
          <div className="text-muted text-center mt-3">No new announcements</div>
        ) : (
          notifications.map((a, index) => (
            <div key={index} className="announcement-item">
              <strong>{a.title}</strong>
              <p className="mb-1">{a.message}</p>
              <small className="text-muted">{new Date(a.createdAt).toLocaleString()}</small>
              <hr />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
