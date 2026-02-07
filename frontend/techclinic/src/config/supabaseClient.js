import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_PROJECT_URL;
const supabaseKey = import.meta.env.VITE_API_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // Use sessionStorage so the session expires when the browser/tab is closed
    storage: sessionStorage,
    // Still persist within the tab session
    persistSession: true,
    // Automatically refresh tokens
    autoRefreshToken: true,
    // Detect session from URL (for OAuth redirects)
    detectSessionInUrl: true,
  }
});

export default supabase;