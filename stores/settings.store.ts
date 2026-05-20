import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SidebarVariant = 'modern' | 'floating' | 'classic';

interface SettingsState {
  sidebarVariant: SidebarVariant;
  setSidebarVariant: (variant: SidebarVariant) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      sidebarVariant: 'floating',
      setSidebarVariant: (variant) => set({ sidebarVariant: variant }),
    }),
    {
      name: 'settings-storage',
    }
  )
); 