import { create } from 'zustand';
import { persist, createJSONStorage} from 'zustand/middleware'

const useThemeStore = create(
    persist(
        (set) => ({
            theme : 'light',
            setTheme: (theme) => set({ theme }),
        }),
        {
            name: "theme-store",
            storage: createJSONStorage(() => localStorage),
        }
    ))

export default useThemeStore;