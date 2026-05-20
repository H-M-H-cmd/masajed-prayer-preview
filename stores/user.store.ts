import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/services/auth.service';

interface UserState {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

export const useUser = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      isLoading: true,
      setIsLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'user',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
); 