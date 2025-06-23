const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Node.js: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file"
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { supabase };
