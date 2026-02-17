import { create } from "zustand"
import { persist } from "zustand/middleware"
import supabase from "../config/supabaseClient"
import api from "../lib/api";

const useAuth = create(
    persist(
        (set, get) => ({
    authenticatedUser: null,
    userProfile: null,
    isLoading: true,
    isSessionVerified: false,
    allUsers: null,
    isLoadingUsers: false,

    getAllUsers: async () => {
        try {
            set({ isLoadingUsers: true });
            const response = await api.get("/get-all-users");
            if(response.status === 200) {
                set({ allUsers: response.data.data, isLoadingUsers: false });
            } else {
                console.error(`Error getting all users: ${response}`);
                set({ isLoadingUsers: false });
                return;
            }
        } catch (err) {
            console.error(`Something went wrong getting all users: ${err.message}`);
            set({ isLoadingUsers: false });
            return;
        }
    },
    signIn: async (emailInput, passwordInput) => {
        try {
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email: emailInput,
                password: passwordInput
            });

            console.log("Got response from Supabase!");
            
            if (signInError) {
                console.error(`Sign-in error: ${signInError.message}`);
                return { data: null, error: signInError };
            }

            const user = signInData?.user ?? signInData?.session?.user ?? null;
            
            if (user) {
                console.log("User authenticated:", user.email);
                set({ authenticatedUser: user, isSessionVerified: true, isLoading: false });
                await get().fetchUserProfile(user.id);
            }

            return { data: signInData, error: null };
            
        } catch (err) {
            console.error("Sign-in error:", err);
            return { data: null, error: err };
        }
    },
    
    signUp: async (registerData) => {
        const { firstName, lastName, email, password } = registerData;
        try {
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email, 
                password
            });
            
            if (signUpError) {
                console.error(`Error signing up: ${signUpError.message}`);
                return { success: false, error: signUpError.message };
            }
            
            return { success: true, data: signUpData };
        } catch (err) {
            console.error(`Error signing up: ${err.message}`)
            return { success: false, error: err.message}
        }
    },
    
    // Helper function to fetch user profile
    fetchUserProfile: async (userId) => {
        try {
            console.log("📋 Fetching profile for user:", userId);
            const { data: userProfile, error: profileError } = await supabase
                .from("users")
                .select("*")
                .eq("id", userId)
                .single();
            
            if (profileError) {
                // If user doesn't exist in DB, return null so we can create them
                if (profileError.code === 'PGRST116') {
                    console.log("⚠️ User profile not found in database");
                    return null;
                }
                console.error("Error fetching user profile:", profileError);
                return null;
            }
            
            if (userProfile) {
                console.log("✅ User profile loaded:", userProfile.email);
                set({ userProfile });
                return userProfile;
            }
            
            return null;
        } catch (err) {
            console.error("Error fetching user profile:", err);
            return null;
        }
    },
    
    // Helper function to create user in database
    createUserInDB: async (user) => {
        try {
            const { email, user_metadata } = user;
            const fullName = user_metadata?.full_name || user_metadata?.name || '';
            const nameParts = fullName.split(' ');
            
            const { data: newUser, error: insertError } = await supabase
                .from("users")
                .insert({
                    id: user.id,
                    email,
                    first_name: nameParts[0] || null,
                    last_name: nameParts.slice(1).join(' ') || null,
                })
                .select()
                .single();
            
            if (insertError) {
                console.error(`Error inserting user to DB: ${insertError.message}`);
                return null;
            }
            
            console.log("✅ User created in DB:", newUser);
            set({ userProfile: newUser });
            return newUser;
            
        } catch (err) {
            console.error("Error creating user in DB:", err);
            return null;
        }
    },
    
    authListener: () => {
        try {
            const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
                console.log("🔔 Auth state changed:", event, "Session:", !!session);
                
                const user = session?.user;
                
                if (user) {
                    console.log("👤 Auth state change - user detected:", user.email);
                    
                    // If already verified (e.g. from signIn), skip re-fetching
                    const currentState = get();
                    if (currentState.isSessionVerified && currentState.authenticatedUser?.id === user.id) {
                        return;
                    }
                    
                    set({ authenticatedUser: user, isSessionVerified: true });
                    
                    // Fetch profile if not already loaded
                    if (!currentState.userProfile) {
                        let retries = 3;
                        let profile = null;
                        
                        while (retries > 0 && !profile) {
                            profile = await get().fetchUserProfile(user.id);
                            
                            if (!profile) {
                                retries--;
                                if (retries === 0) {
                                    profile = await get().createUserInDB(user);
                                } else {
                                    await new Promise(resolve => setTimeout(resolve, 500));
                                }
                            }
                        }
                    }
                    
                    set({ isLoading: false });
                } else {
                    // User logged out
                    console.log("👋 User logged out");
                    set({ 
                        authenticatedUser: null, 
                        userProfile: null,
                        isLoading: false,
                        isSessionVerified: true
                    });
                    sessionStorage.removeItem("auth-storage");
                }
            });
            
            return () => subscription.unsubscribe();
        } catch (err) {
            console.error("Error setting up auth listener:", err);
            set({ isLoading: false });
        }
    },
    
    getUser: async () => {
        try {
            set({ isLoading: true });
            
            // First check if there's a valid session
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            
            if (sessionError || !session) {
                console.log("No valid session found, clearing auth state");
                set({ 
                    authenticatedUser: null, 
                    userProfile: null, 
                    isLoading: false,
                    isSessionVerified: true
                });
                localStorage.removeItem('auth-storage');
                return;
            }
            
            // Verify the user with the server (not just local token)
            const { data, error } = await supabase.auth.getUser();
            console.log("getUser() result:", data?.user?.email || "No user");
            
            if (error || !data?.user) {
                console.log("Session invalid or expired, clearing state");
                set({ 
                    authenticatedUser: null, 
                    userProfile: null, 
                    isLoading: false,
                    isSessionVerified: true
                });
                localStorage.removeItem('auth-storage');
                return;
            }
                set({ authenticatedUser: data.user });
                
                // Fetch profile with retry logic
                let retries = 3;
                let profile = null;
                
                while (retries > 0 && !profile) {
                    profile = await get().fetchUserProfile(data.user.id);
                    
                    if (!profile) {
                        console.log(`⏳ Profile fetch retry, attempts left: ${retries - 1}`);
                        retries--;
                        
                        if (retries === 0) {
                            // Last attempt - try to create profile
                            console.log("🆕 Creating user profile in getUser...");
                            profile = await get().createUserInDB(data.user);
                        } else {
                            await new Promise(resolve => setTimeout(resolve, 500));
                        }
                    }
                }
                
                if (!profile) {
                    console.error("❌ Failed to fetch or create user profile after all retries");
                }
            
            set({ isLoading: false, isSessionVerified: true });
        } catch (err) {
            console.error(`Error getting user: ${err.message}`);
            set({ isLoading: false, isSessionVerified: true, authenticatedUser: null, userProfile: null });
        }
    },
    
    // Update user profile in database
    updateProfile: async (updates) => {
        try {
            const userId = get().authenticatedUser?.id;
            if (!userId) {
                console.error("No authenticated user to update profile for");
                return { success: false, error: "Not authenticated" };
            }

            const { data, error } = await supabase
                .from("users")
                .update(updates)
                .eq("id", userId)
                .select()
                .single();

            if (error) {
                console.error("Error updating profile:", error.message);
                return { success: false, error: error.message };
            }

            console.log("✅ Profile updated:", data);
            set({ userProfile: data });
            return { success: true, data };
        } catch (err) {
            console.error("Error updating profile:", err);
            return { success: false, error: err.message };
        }
    },

    // Upload signature to Supabase Storage and save URL to profile
    uploadSignature: async (dataUrl) => {
        try {
            const userId = get().authenticatedUser?.id;
            if (!userId) {
                return { success: false, error: "Not authenticated" };
            }

            // Convert base64 data URL to blob
            const response = await fetch(dataUrl);
            const blob = await response.blob();

            const fileName = `${userId}.png`;

            // Upload to Supabase Storage (upsert to overwrite existing)
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from("signatures")
                .upload(fileName, blob, {
                    contentType: "image/png",
                    upsert: true,
                });

            if (uploadError) {
                console.error("Error uploading signature:", uploadError.message);
                return { success: false, error: uploadError.message };
            }

            // Get the public URL
            const { data: { publicUrl } } = supabase.storage
                .from("signatures")
                .getPublicUrl(fileName);

            // Add cache-busting timestamp to URL
            const signatureUrl = `${publicUrl}?t=${Date.now()}`;

            // Save URL to user profile
            const result = await get().updateProfile({ signature_url: signatureUrl });

            if (!result.success) {
                return result;
            }

            console.log("✅ Signature uploaded and saved:", signatureUrl);
            return { success: true, url: signatureUrl };
        } catch (err) {
            console.error("Error uploading signature:", err);
            return { success: false, error: err.message };
        }
    },

    // Fetch a specific user's signature URL by their user ID
    fetchUserSignature: async (userId) => {
        try {
            if (!userId) return null;

            const { data, error } = await supabase
                .from("users")
                .select("signature_url, first_name, last_name, role")
                .eq("id", userId)
                .single();

            if (error) {
                console.error("Error fetching user signature:", error.message);
                return null;
            }

            return data;
        } catch (err) {
            console.error("Error fetching user signature:", err);
            return null;
        }
    },

    signOut: async () => {
        try {
            console.log("🚪 Signing out...");
            
            // Sign out from Supabase
            const { error } = await supabase.auth.signOut();
            
            if (error) {
                console.error("Sign out error:", error);
                return { success: false, error: error.message };
            }
            
            // Clear auth state
            set({ 
                authenticatedUser: null, 
                userProfile: null,
                isLoading: false,
                isSessionVerified: false
            });
            
            // Clear sessionStorage for auth
            sessionStorage.removeItem('auth-storage');
            sessionStorage.removeItem('data-storage');
            sessionStorage.removeItem('medicine-storage');
            
            // Also clear localStorage in case old data lingers
            localStorage.removeItem('auth-storage');
            localStorage.removeItem('data-storage');
            localStorage.removeItem('medicine-storage');
            
            console.log("✅ Sign out successful, all data cleared");
            
            return { success: true };
        } catch (err) {
            console.error("Sign out error:", err);
            return { success: false, error: err.message };
        }
    }
}),
        {
            name: 'auth-storage',
            storage: {
                getItem: (name) => {
                    const str = sessionStorage.getItem(name);
                    return str ? JSON.parse(str) : null;
                },
                setItem: (name, value) => {
                    sessionStorage.setItem(name, JSON.stringify(value));
                },
                removeItem: (name) => {
                    sessionStorage.removeItem(name);
                },
            },
            partialize: (state) => ({ 
                userProfile: state.userProfile
                // authenticatedUser is NOT persisted — session must be verified on each load
            }),
        }
    )
);

export default useAuth;