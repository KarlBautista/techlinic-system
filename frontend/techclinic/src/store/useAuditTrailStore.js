import { create } from "zustand";
import api from "../lib/api";

const CACHE_TTL = 3 * 60 * 1000; // 3 minutes

const useAuditTrail = create((set, get) => ({
    logs: null,
    isLoading: false,
    _lastFetched: null,
    _lastFilters: null,

    getAuditTrail: async (filters = {}, force = false) => {
        const state = get();
        const filterKey = JSON.stringify(filters);
        const filtersChanged = filterKey !== JSON.stringify(state._lastFilters);

        if (!force && !filtersChanged && state._lastFetched && (Date.now() - state._lastFetched < CACHE_TTL) && state.logs !== null) {
            return { success: true };
        }

        try {
            set({ isLoading: true });
            const params = new URLSearchParams();
            if (filters.entity_type) params.append("entity_type", filters.entity_type);
            if (filters.actor_role) params.append("actor_role", filters.actor_role);
            if (filters.limit) params.append("limit", filters.limit);

            const url = `/audit-trail${params.toString() ? `?${params}` : ""}`;
            const response = await api.get(url);

            if (response.status === 200) {
                set({ logs: response.data.data, isLoading: false, _lastFetched: Date.now(), _lastFilters: filters });
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
