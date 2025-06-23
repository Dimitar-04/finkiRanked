import { createClient } from "https://esm.sh/@supabase/supabase-js";
import "https://deno.land/std/dotenv/load.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables"
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
