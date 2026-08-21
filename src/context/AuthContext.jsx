import { createContext, useCallback, useContext, useState } from 'react';

const AuthContext = createContext(null);
const STORAGE_KEY = 'nebeng_auth';

function readStoredSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    // Data tersimpan korup/format lama — abaikan dan anggap belum login.
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readStoredSession);

  const login = useCallback((role, extra = {}) => {
    const nextSession = { role, loggedInAt: Date.now(), ...extra };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
  }, []);

  const value = {
    session,
    isAuthenticated: !!session,
    role: session?.role ?? null,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- pola context umum (Provider + hook satu file), konsisten dengan ToastContext
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth harus dipakai di dalam <AuthProvider>');
  }
  return ctx;
}
