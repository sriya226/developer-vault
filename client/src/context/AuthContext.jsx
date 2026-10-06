import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/authService';
import { TOKEN_KEY } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // Only "loading" if there is a saved token we still need to verify.
  const [loading, setLoading] = useState(() => !!localStorage.getItem(TOKEN_KEY));

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    authService.getMe().then(setUser).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onUnauthorized = () => setUser(null);
    window.addEventListener('vault:unauthorized', onUnauthorized);
    return () => window.removeEventListener('vault:unauthorized', onUnauthorized);
  }, []);

  const persist = ({ user: u, token }) => {
    localStorage.setItem(TOKEN_KEY, token);
    setUser(u);
    return u;
  };
  const login = useCallback((credentials) => authService.login(credentials).then(persist), []);
  const register = useCallback((payload) => authService.register(payload).then(persist), []);
  const logout = useCallback(() => { localStorage.removeItem(TOKEN_KEY); setUser(null); }, []);

  const value = useMemo(
    () => ({ user, loading, isAuthenticated: !!user, login, register, logout, updateUser: setUser }),
    [user, loading, login, register, logout]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
