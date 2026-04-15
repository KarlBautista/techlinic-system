import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_PROJECT_URL;
const supabaseKey = import.meta.env.VITE_API_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // Use localStorage so the session persists across tab/browser closes
    storage: localStorage,
    // Persist session
    persistSession: true,
    // Automatically refresh tokens
    autoRefreshToken: true,
    // Detect session from URL (for OAuth redirects)
    detectSessionInUrl: true,
  }
});

export default supabase;