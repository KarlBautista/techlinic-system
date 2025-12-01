const { createClient } = require("@supabase/supabase-js"); 
const dotenv = require("dotenv");
dotenv.config();
const supabaseUrl = process.env.NODE_PROJECT_URL;
const supabaseKey = process.env.NODE_SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

module.exports = supabaseAdmin;