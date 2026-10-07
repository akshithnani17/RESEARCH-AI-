import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { apiClient } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signUp: (fullName: string, email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('researchgap_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('researchgap_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('researchgap_token');
      if (storedToken) {
        try {
          const currentUser = await apiClient.getMe();
          setUser(currentUser);
          localStorage.setItem('researchgap_user', JSON.stringify(currentUser));
        } catch (err) {
          localStorage.removeItem('researchgap_token');
          localStorage.removeItem('researchgap_user');
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiClient.login({ email, password });
    localStorage.setItem('researchgap_token', response.access_token);
    localStorage.setItem('researchgap_user', JSON.stringify(response.user));
    setToken(response.access_token);
    setUser(response.user);
  };

  const signUp = async (fullName: string, email: string, password: string, confirmPassword: string) => {
    const response = await apiClient.signUp({
      full_name: fullName,
      email,
      password,
      confirm_password: confirmPassword,
    });
    localStorage.setItem('researchgap_token', response.access_token);
    localStorage.setItem('researchgap_user', JSON.stringify(response.user));
    setToken(response.access_token);
    setUser(response.user);
  };

  const logout = () => {
    try {
      apiClient.logout();
    } catch (e) {
      // Ignore network errors on logout
    }
    localStorage.removeItem('researchgap_token');
    localStorage.removeItem('researchgap_user');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        signUp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
