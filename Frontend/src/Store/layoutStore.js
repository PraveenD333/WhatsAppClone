import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'

const useLayoutStore = create(
    persist(
        (set) => ({
            activeTab: 'chats',
            selectedContact: null,
            setSelectedContact: (contact) => set({ selectedContact: contact }),
            setActiveTab: (tab) => ({ activeTab: tab }),
        }),
        {
            name: "layout-store",
            storage: createJSONStorage(() => localStorage),
        }
    ))

export default useLayoutStore;