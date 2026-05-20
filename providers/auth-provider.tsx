'use client';

import { createContext, useContext, useEffect, useLayoutEffect } from 'react';
import { authService, User } from '@/services/auth.service';
import { useRouter } from 'next/navigation';
import { showToast } from '@/lib/toast';
import { useLanguage } from './language-provider';
import { useUser } from '@/stores/user.store';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  logout: async () => {},
});

// Use this to avoid hydration mismatch
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, setUser, isLoading, setIsLoading } = useUser();
  const router = useRouter();
  const { t } = useLanguage();

  // Handle store hydration
  useIsomorphicLayoutEffect(() => {
    useUser.persist.rehydrate();
  }, []);

  // Handle auth initialization
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        // Check if token cookie exists
        const hasToken = document.cookie.includes('token=');
        
        if (hasToken) {
          const meResponse = await authService.me();
          if (mounted) {
            setUser(meResponse.data);
          }
        } else {
          if (mounted) {
            setUser(null);
          }
        }
      } catch (error) {
        // If token is invalid or expired, clear it
        if (mounted) {
          document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
          localStorage.removeItem('user');
          setUser(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [setUser, setIsLoading]);

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      localStorage.removeItem('user');
      showToast.success(t('auth.toasts.logoutSuccess'));
      router.push('/login');
    } catch (error) {
      showToast.error(t('auth.errors.serverError'));
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 