const { createClient } = require("@supabase/supabase-js");
const path = require("path");
const { supabase } = require("../supabaseClient");

async function toggleModeratorStatus(userId) {
  try {
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("isModerator, username")
      .eq("id", userId)
      .single();

    if (fetchError) throw fetchError;
    if (!user) {
      console.error(`User with ID ${userId} not found`);
      return;
    }

    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({ isModerator: !user.isModerator })
      .eq("id", userId)
      .select("username")
      .single();

    if (updateError) throw updateError;

    console.log(
      `User ${user.username} moderator status changed to: ${!user.isModerator}`
    );
  } catch (error) {
    console.error("Error:", error);
  }
}

const userId = process.argv[2];
if (!userId) {
  console.error("Please provide a user ID");
  process.exit(1);
}

toggleModeratorStatus(userId);
