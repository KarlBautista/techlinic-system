import { create } from "zustand";
import api from "../lib/api";

const useAuditTrail = create((set) => ({
    logs: null,
    isLoading: false,
    getAuditTrail: async (filters = {}) => {
        try {
            set({ isLoading: true });
            const params = new URLSearchParams();
            if (filters.entity_type) params.append("entity_type", filters.entity_type);
            if (filters.actor_role) params.append("actor_role", filters.actor_role);
            if (filters.limit) params.append("limit", filters.limit);

            const url = `/audit-trail${params.toString() ? `?${params}` : ""}`;
            const response = await api.get(url);

            if (response.status === 200) {
                set({ logs: response.data.data, isLoading: false });
                return { success: true };
            } else {
                console.error("Error fetching audit trail:", response.data.error);
                set({ isLoading: false });
                return { success: false };
            }
        } catch (err) {
            console.error("Something went wrong fetching audit trail:", err.message);
            set({ isLoading: false });
            return { success: false };
        }
    },
}));

export default useAuditTrail;
