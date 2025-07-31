// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const lsUser = localStorage.getItem('user');
    const lsToken = localStorage.getItem('token');
    if (lsUser && lsToken) {
      setUser(JSON.parse(lsUser));
      setToken(lsToken);
    }
  }, []);

  const login = (userObj, jwt) => {
    localStorage.setItem('user', JSON.stringify(userObj));
    localStorage.setItem('token', jwt);
    setUser(userObj);
    setToken(jwt);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
