import { create } from "zustand";
import { getSocket } from "../Services/chat.service.js";
import axiosInstance from "../Services/url.service.js";

const useStatusStore = create((set, get) => ({
    //State
    statuses: [],
    loading: false,
    error: null,

    //Active
    setStatuses: (statuses) => set({ statuses }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),

    //Initilize the socket listerners
    initializeSocket: () => {
        const socket = getSocket();
        if (!socket) return;


        //Real-Time status events 
        socket.on("new_status", (newStatus) => {
            set((state) => ({
                statuses: state.statuses.some((s) => s._id === newStatus._id)
                    ? state.statuses : [newStatus, ...state.statuses]
            }))
        });

        // status delete
        socket.on("status_deleted", (statusId) => {
            set((state) => ({
                statuses: state.statuses.filter((s) => s._id !== statusId)
            }))
        });

        //status Viewed
        socket.on("status_viewed", (statusId, viewers) => {
            set((state) => ({
                statuses: state.statuses.map((status) => status._id === statusId
                    ? { ...status, viewers } : status)
            }))
        })
    },

    cleanupSocket: () => {
        const socket = getSocket();
        if (socket) {
            socket.off("new_status");
            socket.off("status_deleted");
            socket.off("status_viewed");
        }
    },

    // FetchStatus
    fetchStatuses: async () => {
        set({ loading: true, error: null })
        try {
            const { data } = await axiosInstance.get("/status/get")
            set({ statuses: data.data || [], loading: false })
        } catch (error) {
            console.error("Error Fetching Status", error);
            set({ error: error.message, loading: false })
        }
    },

    //Create Status
    createStatuses: async (statusData) => {
        set({ loading: true, error: null })
        try {
            const formData = new FormData();
            if (statusData.file) {
                formData.append("media", statusData.file);
            }
            if (statusData.content?.trim()) {
                formData.append("content", statusData.content);
            }
            const { data } = await axiosInstance.post("/status", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            })

            //add to status in local store
            if (data.data) {
                set((state) => ({
                    statuses: state.statuses.some((s) => s._id === data.data._id)
                        ? state.statuses : [data.data, ...state.statuses]
                }))
            }
            set({ loading: false })
            return data.data;
        } catch (error) {
            console.error("Error creating Status", error);
            set({ error: error.message, loading: false })
            throw error;
        }
    },

    // viewed Status
    viewStatus: async (statusId) => {
        try {
            set({ loading: true, error: null })
            await axiosInstance.put(`/status/${statusId}/view`);
            set((state) => ({
                statuses: state.statuses.map((status) => status._id === statusId
                    ? { ...status } : status)
            }));
            set({ loading: false })
        } catch (error) {
            set({ error: error.message, loading: false })
        }
    },

    //delete Status
    deleteStatus: async (statusId) => {
        try {
            set({ loading: true, error: null })
            await axiosInstance.delete(`/status/${statusId}`);
            set((state) => ({
                statuses: state.statuses.filter((s) => s._id !== statusId)
            }));
            set({ loading: false })
        } catch (error) {
            console.error("Error deleting Status", error);
            set({ error: error.message, loading: false })
            throw error;
        }
    },

    getStatusViewers: async (statusId) => {
        try {
            set({ loading: true, error: null })
            const { data } = await axiosInstance.get(`/status/${statusId}/viewers`);
            set({ loading: false })
            return data.data;

        } catch (error) {
            console.error("Error getting Status viewers", error);
            set({ error: error.message, loading: false })
            throw error;
        }
    },

    //helper function for grouped status 
    getGroupedStatus: () => {
        const { statuses } = get();
        return statuses.reduce((acc, status) => {
            const statusUserId = status.user?._id;
            if (!acc[statusUserId]) {
                acc[statusUserId] = {
                    id: statusUserId,
                    name: status?.user?.username,
                    avatar: status?.user?.profilePicture,
                    statuses: []
                }
            }

            acc[statusUserId].statuses.push({
                id: status._id,
                media: status.content,
                contentType: status.contentType,
                timestamp: status.createdAt,
                viewers: status.viewers
            });
            return acc;
        }, {})
    },

    getUserStatuses: (userId) => {
        const groupedStatus = get().getGroupedStatus();
        return userId ? groupedStatus[userId] : null;
    },

    getOtherStatuses: (userId) => {
        const groupedStatus = get().getGroupedStatus();
        return Object.values(groupedStatus).filter(
            (contact) => contact.id !== userId
        );
    },

    //Clear Error
    clearError: () => set({ error: null }),

    reset: () => set({
        statuses: [],
        loading: false,
        error: null,
    })

}))

export default useStatusStore;