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
    }
}));

export default useAuth;