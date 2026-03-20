import { useEffect, useState } from 'react';
import { AuthContext, STORAGE } from './authContext';

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(STORAGE.user);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (err) {
      console.error('Failed to parse saved user from localStorage:', err);
      return null;
    }
  });

  const [loading] = useState(false);

  // If other tabs update auth, keep this tab in sync.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== STORAGE.user) return;
      if (!e.newValue) {
        setUser(null);
        return;
      }
      try {
        setUser(JSON.parse(e.newValue));
      } catch (err) {
        console.error('Failed to parse updated user from localStorage:', err);
        setUser(null);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const login = (data) => {
    const u = {
      username: data.username,
      email: data.email,
      roles: data.roles || [],
      profileId: data.profileId,
    };
    localStorage.setItem(STORAGE.token, data.token);
    localStorage.setItem(STORAGE.user, JSON.stringify(u));
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE.token);
    localStorage.removeItem(STORAGE.user);
    setUser(null);
  };

  const isCandidate = () => user?.roles?.includes('ROLE_CANDIDATE');
  const isCompany = () => user?.roles?.includes('ROLE_COMPANY');
  const isAdmin = () => user?.roles?.includes('ROLE_ADMIN');
  const isLoggedIn = () => !!user && !!localStorage.getItem(STORAGE.token);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isCandidate,
        isCompany,
        isAdmin,
        isLoggedIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

