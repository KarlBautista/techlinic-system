const { createClient } = require("@supabase/supabase-js"); 
const dotenv = require("dotenv");
dotenv.config();
const supabaseUrl = process.env.NODE_PROJECT_URL;
const supabaseKey = process.env.NODE_API_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;