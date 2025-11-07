import { create } from "zustand"
import supabase from "../config/supabaseClient"
import axios from "axios"

const useAuth = create((set) => ({
    authenticatedUser: null,
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

        } catch(err){
            console.error(`Error signing up: ${err.message}`)
            return { success: false, error: err.message}
        }
    },
    signIn: async (emailInput, passwordInput) => {
        try{
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                emailInput,
                passwordInput
            });
            if(signInError){
                console.error(`Sign-in error ${signInError.message}`);
                return { success: false, error: signInError.message};
            }
            set({ authenticatedUser: signInData.user });
            return { data: signInData }
        } catch (err){
            console.error(`Error signing in user: ${err.message}`);
            return { success: false, error: err.message };
        }
    },
    signInWithGoogle: async () => {
        try{
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}`,
                }
            });
            if(error){
                console.error(`Google Auth Error: ${error.message}`);
                return { data: null, error: error.message};
            }
            return { data, error: null };
        } catch(err){
            console.error(`Error singing in with google`);
        }
    },
    authListener: () => {
        try{
            const { data: { subscription } } = supabase.auth.onAuthStateChange( async (_event, session ) => {
            const user = session?.user;
            if(user){
                const { data: existingUser, error: existingError } = await supabase.from("users")
                .select().eq("id", user.id).single();
            
            if(!existingUser){
                const { email, user_metadata } = user;
                const { error: insertError } = await supabase.from("users").insert({
                    id: user.id,
                    email,
                    first_name: user_metadata?.full_name?.split(" ")[0] || null,
                    last_name: user_metadata?.full_name?.split(" ")[1] || null,
                });
                if(insertError){
                    throw new Error(`Error Inserting: ${insertError.message}`);
                }    
            }
             set({ authenticatedUser: user });
        } else {
            set({ authenticatedUser: null });
        }
            });
            return () => subscription.unsubscribe();
        } catch(err){
            console.error(err);
        }
    }
}));

export default useAuth;