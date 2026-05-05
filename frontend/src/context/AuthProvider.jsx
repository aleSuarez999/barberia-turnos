import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('jwt_token') || '');
  const [userType, setUserType] = useState(localStorage.getItem('user_type') || '');
  const [role, setRole] = useState(localStorage.getItem('user_role') || '');

  useEffect(() => {
    if (token) localStorage.setItem('jwt_token', token);
    else localStorage.removeItem('jwt_token');
  }, [token]);

  useEffect(() => {
    if (userType) localStorage.setItem('user_type', userType);
    else localStorage.removeItem('user_type');
  }, [userType]);

  useEffect(() => {
    if (role) localStorage.setItem('user_role', role);
    else localStorage.removeItem('user_role');
  }, [role]);

  const logout = () => {
    setToken('');
    setUserType('');
    setRole('');
  };

  return (
    <AuthContext.Provider value={{ token, setToken, userType, setUserType, role, setRole, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
