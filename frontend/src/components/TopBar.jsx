import React from 'react';
import { useAuth } from '../context/AuthContext';

const TopBar = () => {
  const { user, logout } = useAuth();

  return (
    <div className="p-2 border-bottom d-flex justify-content-between align-items-center">
      <div>Welcome {user?.name ?? user?.email ?? ''}</div>
      <button className="btn btn-outline-danger btn-sm" onClick={logout}>
        Logout
      </button>
    </div>
  );
};

export default TopBar;
