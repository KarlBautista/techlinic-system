import { create } from "zustand"
import { persist } from "zustand/middleware"
import supabase from "../config/supabaseClient"
import useData from "./useDataStore";

const useAuth = create(
    persist(
        (set, get) => ({
    authenticatedUser: null,
    userProfile: null,
    isLoading: true, 
    
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
                set({ authenticatedUser: user });
                
           
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
    
   
    

    fetchUserProfile: async (userId) => {
        try {
            console.log("📋 Fetching profile for user:", userId);
            const { data: userProfile, error: profileError } = await supabase
                .from("users")
                .select("*")
                .eq("id", userId)
                .single();
            
            if (profileError) {
          
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
              
                const user = session?.user;
                if (user) {
                    set({ authenticatedUser: user, isLoading: true });
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
                    set({ isLoading: false });
                } else {
                   
                  
                    set({ 
                        authenticatedUser: null, 
                        userProfile: null,
                        isLoading: false 
                    });
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
            const { data, error } = await supabase.auth.getUser();
            console.log("getUser() result:", data?.user?.email || "No user");
            
            if (data?.user) {
                set({ authenticatedUser: data.user });
                let retries = 3;
                let profile = null;
                
                while (retries > 0 && !profile) {
                    profile = await get().fetchUserProfile(data.user.id);
                    
                    if (!profile) {
                        console.log(`⏳ Profile fetch retry, attempts left: ${retries - 1}`);
                        retries--;
                        
                        if (retries === 0) {
                            console.log("🆕 Creating user profile in getUser...");
                            profile = await get().createUserInDB(data.user);
                        } else {
                            await new Promise(resolve => setTimeout(resolve, 500));
                        }
                    }
                }
                
                
            } else {
                set({ authenticatedUser: null, userProfile: null });
            }
            
            set({ isLoading: false });
        } catch (err) {
            console.error(`Error getting user: ${err.message}`);
            set({ isLoading: false });
        }
    },
    
    signOut: async () => {
        try {
            console.log("🚪 Signing out...");
            
          
            const { error } = await supabase.auth.signOut();
            
            if (error) {
                console.error("Sign out error:", error);
                return { success: false, error: error.message };
            }
            
        
            set({ 
                authenticatedUser: null, 
                userProfile: null,
                isLoading: false 
            });
            
            return { success: true };
        } catch (err) {
            console.error("Sign out error:", err);
            return { success: false, error: err.message };
        }
    }
}),
        {
            name: 'auth-storage', 
            partialize: (state) => ({ 
                userProfile: state.userProfile, 
                authenticatedUser: state.authenticatedUser 
            }),
        }
    )
);

export default useAuth;