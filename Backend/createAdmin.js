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

async function createAdminUser() {
  try {
    const email = "admin@gmail.com";
    const password = "admin123";
    const firstName = "System";
    const lastName = "Admin";
    const role = "ADMIN";

    // Check if admin already exists in users table
    const { data: existing } = await supabase
      .from("users")
      .select("id, email, role")
      .eq("email", email)
      .single();

    if (existing) {
      console.log("Admin user already exists:", existing);
      // Ensure role is ADMIN
      if (existing.role !== "ADMIN") {
        const { error: updateError } = await supabase
          .from("users")
          .update({ role: "ADMIN" })
          .eq("id", existing.id);
        if (updateError) {
          console.error("Error updating role:", updateError);
        } else {
          console.log("Updated existing user role to ADMIN");
        }
      }
      process.exit(0);
    }

    // Create auth user
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

    // Insert into users table
    const { data: userInsertData, error: userInsertError } = await supabase
      .from("users")
      .insert({
        id: userId,
        created_at: new Date().toISOString(),
        first_name: firstName,
        last_name: lastName,
        email: email,
        role: role,
      })
      .select();

    if (userInsertError) {
      console.error("Error inserting admin profile:", userInsertError);
      process.exit(1);
    }

    console.log("Admin user created successfully:", userInsertData);

  } catch (err) {
    console.error("Unexpected error:", err);
    process.exit(1);
  }
}

createAdminUser();
