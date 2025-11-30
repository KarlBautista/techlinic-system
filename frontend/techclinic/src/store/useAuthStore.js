import { create } from "zustand"
import supabase from "../config/supabaseClient"

const useAuth = create((set) => ({
    authenticatedUser: null,
    userProfile: null, 
    
    signIn: async (emailInput, passwordInput) => {
      
        
        try {
          
            
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email: emailInput,
                password: passwordInput
            });

            console.log(" Got response from Supabase!");
            
            if (signInError) {
                console.error(` Sign-in error: ${signInError.message}`);
                return { data: null, error: signInError };
            }

            const user = signInData?.user ?? signInData?.session?.user ?? null;
            
            if (user) {
                console.log("User authenticated:", user.email);
                set({ authenticatedUser: user });
            }

            return { data: signInData, error: null };
            
        } catch (err) {
         
            return { data: null, error: err };
        }
    },
    
    signUp: async (registerData) => {
        const { firstName, lastName, email, password } = registerData;
        try{
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email, 
                password
            });
            if(signUpError) {
                console.error(`Error signing up: ${signUpError.message}`);
                return { success: false, error: signUpError.message };
            }
            return { success: true, data: signUpData };
        } catch(err){
            console.error(`Error signing up: ${err.message}`)
            return { success: false, error: err.message}
        }
    },
    
    signInWithGoogle: async () => {
        try{
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/dashboard`,
                }
            });
            if(error){
                console.error(`Google Auth Error: ${error.message}`);
                return { data: null, error: error.message};
            }
            return { data, error: null };
        } catch(err){
            console.error(`Error signing in with google:`, err);
            return { data: null, error: err.message };
        }
    },
    
    authListener: () => {
        try{
            const { data: { subscription } } = supabase.auth.onAuthStateChange( async (_event, session ) => {
              
                const user = session?.user;
                
                if(user){
          
                    set({ authenticatedUser: user });
                    
                
                    try {
                        const { data: userProfile, error: profileError } = await supabase
                            .from("users")
                            .select("*")
                            .eq("id", user.id)
                            .single();
                        
                        if (profileError) {
                            console.error("Error fetching user profile:", profileError);
                        } else if (userProfile) {
                            console.log("✅ User profile loaded:", userProfile);
                            set({ userProfile });
                        }
                    } catch (err) {
                        console.error("Error fetching user profile:", err);
                    }
                    
           
                    setTimeout(async () => {
                        try {
                            const { data: existingUser, error: existingError } = await supabase
                                .from("users")
                                .select()
                                .eq("id", user.id)
                                .single();
                        
                            if(!existingUser && !existingError){
                                const { email, user_metadata } = user;
                                const { error: insertError } = await supabase.from("users").insert({
                                    id: user.id,
                                    email,
                                    first_name: user_metadata?.full_name?.split(" ")[0] || null,
                                    last_name: user_metadata?.full_name?.split(" ")[1] || null,
                                });
                                if(insertError){
                                    console.error(`Error inserting user to DB: ${insertError.message}`);
                                } else {
                        
                                    const { data: newProfile } = await supabase
                                        .from("users")
                                        .select("*")
                                        .eq("id", user.id)
                                        .single();
                                    if (newProfile) set({ userProfile: newProfile });
                                }    
                            }
                        } catch (err) {
                            console.error("Error in background user DB operation:", err);
                        }
                    }, 0);
                } else {
                    set({ authenticatedUser: null, userProfile: null });
                }
            });
            return () => subscription.unsubscribe();
        } catch(err){
            console.error("Error setting up auth listener:", err);
        }
    },
    
    getUser: async () => {
        try{
            const { data, error } = await supabase.auth.getUser();
            console.log("getUser() result:", data?.user?.email || "No user");
            if(data?.user){
                set({ authenticatedUser: data.user });
                
             
                try {
                    const { data: userProfile, error: profileError } = await supabase
                        .from("users")
                        .select("*")
                        .eq("id", data.user.id)
                        .single();
                    
                    if (profileError) {
                        console.error("Error fetching user profile:", profileError);
                    } else if (userProfile) {
                   
                        set({ userProfile });
                    }
                } catch (err) {
                    console.error("Error fetching user profile:", err);
                }
            } else {
                set({ authenticatedUser: null, userProfile: null });
            }
        } catch(err){
            console.error(`Error getting user: ${err.message}`)
        }
    },
    
    signOut: async () => {
        try{
            console.log("🚪 Signing out...");
            const { error } = await supabase.auth.signOut();
            
            if(error){
             
                return { success: false, error: error.message }
            }
            
     
            set({ authenticatedUser: null, userProfile: null });
            return { success: true };
        } catch (err){
         
            return { success: false, error: err.message };
        }
    }
}));

export default useAuth;