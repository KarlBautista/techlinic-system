import { create } from "zustand";
import supabase from "../config/supabaseClient";

const usePresenceStore = create((set, get) => ({
    onlineUserIds: new Set(),
    _channel: null,
    _selfId: null,

    /** Call once after login to start tracking this user's presence */
    startTracking: (userId) => {
        const existing = get()._channel;
        if (existing) return; // already tracking

        // Current user is always online
        set({ _selfId: userId, onlineUserIds: new Set([userId]) });

        const channel = supabase.channel("online-users", {
            config: { presence: { key: userId } },
        });

        channel
            .on("presence", { event: "sync" }, () => {
                const state = channel.presenceState();
                const ids = new Set(Object.keys(state));
                // Always include self
                const selfId = get()._selfId;
                if (selfId) ids.add(selfId);
                set({ onlineUserIds: ids });
            })
            .on("presence", { event: "join" }, ({ key }) => {
                set((state) => {
                    const updated = new Set(state.onlineUserIds);
                    updated.add(key);
                    return { onlineUserIds: updated };
                });
            })
            .on("presence", { event: "leave" }, ({ key }) => {
                set((state) => {
                    const updated = new Set(state.onlineUserIds);
                    updated.delete(key);
                    // Always keep self
                    const selfId = get()._selfId;
                    if (selfId) updated.add(selfId);
                    return { onlineUserIds: updated };
                });
            })
            .subscribe(async (status) => {
                if (status === "SUBSCRIBED") {
                    await channel.track({ user_id: userId, online_at: new Date().toISOString() });
                } else {
                    console.error("Presence channel status:", status);
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
        set({ _channel: null, _selfId: null, onlineUserIds: new Set() });
    },

    isOnline: (userId) => get().onlineUserIds.has(userId),
}));

export default usePresenceStore;
