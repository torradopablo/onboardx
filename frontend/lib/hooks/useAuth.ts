'use client';

import { useState, useEffect, useCallback } from 'react';
import { User, AuthResponse } from '@/types';
import { apiClient } from '@/lib/api/client';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('auth_token');
        if (token) {
          apiClient.setToken(token);
          const currentUser = await apiClient.getCurrentUser();
          setUser(currentUser);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Auth error');
        apiClient.clearToken();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const register = useCallback(
    async (email: string, password: string, fullName: string, companyName?: string) => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.register(email, password, fullName, companyName);
        apiClient.setToken(response.token);
        setUser(response.user);
        return response;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Registration failed';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.login(email, password);
      apiClient.setToken(response.token);
      setUser(response.user);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await apiClient.logout();
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated: !!user,
  };
}
