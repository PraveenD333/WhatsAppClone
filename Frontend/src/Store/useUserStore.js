import { create } from 'zustand';
import { persist, createJSONStorage} from 'zustand/middleware'

const useUserStore = create(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            setUser: (userdata) => set({ user: userdata, isAuthenticated: true}),
            clearUser: () => set({ user: null,isAuthenticated: false }),
        }),
        {
            name: "user-store",
            storage: createJSONStorage(() => localStorage),
        }
    ))

export default useUserStore;