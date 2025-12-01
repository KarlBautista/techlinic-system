require('dotenv').config();

const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NODE_PROJECT_URL;
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NODE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing Supabase configuration. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function createUserWithProfile() {
  try {
    // === USER AUTH DATA ===
    const email = "doctor@gmail.com";
    const password = "doctor123";

   
    const firstName = "Jake";
    const lastName = "Santos";
    const address = "Manila, Philippines";
    const dateOfBirth = "1997-03-25";
    const role = "DOCTOR"; 

   
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      console.error("Error creating auth user:", authError);
      process.exit(1);
    }

    const userId = authData.user.id;
    console.log("Auth user created with ID:", userId);

    // 2️⃣ INSERT INTO YOUR USERS TABLE
    const { data: userInsertData, error: userInsertError } = await supabase
      .from("users")               // must match your table name
      .insert({
        id: userId,               // foreign key → auth.users.id
        created_at: new Date().toISOString(),
        first_name: firstName,
        last_name: lastName,
        email: email,
        address: address,
        date_of_birth: dateOfBirth,
        role: role,
      })
      .select();

    if (userInsertError) {
      console.error("Error inserting profile row:", userInsertError);
      process.exit(1);
    }

    console.log("Profile inserted:", userInsertData);

  } catch (err) {
    console.error("Unexpected error:", err);
    process.exit(1);
  }
}

createUserWithProfile();
