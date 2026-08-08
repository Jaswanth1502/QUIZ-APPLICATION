import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, setAccessToken, setCurrentUser } from '../api/client';
import type { User } from '../types';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (value:{usernameOrEmail:string;password:string}) => Promise<void>;
  register: (value:Record<string,string>) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const Context = createContext<AuthContextValue | null>(null);

export function AuthProvider({children}:{children:ReactNode}) {
  const [user, setUser] = useState<User|null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const {data} = await api.get('/auth/me');
    setUser(data);
    setCurrentUser(data);
  };

  useEffect(() => {
    void (async () => {
      const storedToken = localStorage.getItem('quizforge_access_token');
      const storedUser = localStorage.getItem('quizforge_current_user');
      if (!storedToken && !storedUser) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        await refreshUser();
      } catch {
        try {
          const {data} = await api.post('/auth/refresh');
          setAccessToken(data.accessToken);
          setUser(data.user);
          setCurrentUser(data.user);
        } catch {
          setAccessToken(null);
          setCurrentUser(null);
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const authenticate = async (path:string, payload:unknown) => {
    const {data} = await api.post(path, payload);
    setAccessToken(data.accessToken);
    setUser(data.user);
    setCurrentUser(data.user);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    }
    setAccessToken(null);
    setCurrentUser(null);
    setUser(null);
  };

  return <Context.Provider value={{
    user, loading,
    login: payload => authenticate('/auth/login', payload),
    register: payload => authenticate('/auth/register', payload),
    logout, refreshUser
  }}>{children}</Context.Provider>;
}

export const useAuth = () => {
  const value = useContext(Context);
  if (!value) throw new Error('AuthProvider is missing');
  return value;
};

