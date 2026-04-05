import { create } from "zustand";
import supabase from "../config/supabaseClient";

const usePresenceStore = create((set, get) => ({
    onlineUserIds: new Set(),
    _channel: null,

    /** Call once after login to start tracking this user's presence */
    startTracking: (userId) => {
        const existing = get()._channel;
        if (existing) return; // already tracking

        const channel = supabase.channel("online-users", {
            config: { presence: { key: userId } },
        });

        channel
            .on("presence", { event: "sync" }, () => {
                const state = channel.presenceState();
                const ids = new Set(Object.keys(state));
                set({ onlineUserIds: ids });
            })
            .subscribe(async (status) => {
                if (status === "SUBSCRIBED") {
                    await channel.track({ user_id: userId, online_at: new Date().toISOString() });
                }
            });

        set({ _channel: channel });
    },

    /** Call on logout or unmount */
    stopTracking: () => {
        const channel = get()._channel;
        if (channel) {
            channel.untrack();
            supabase.removeChannel(channel);
        }
        set({ _channel: null, onlineUserIds: new Set() });
    },

    isOnline: (userId) => get().onlineUserIds.has(userId),
}));

export default usePresenceStore;
