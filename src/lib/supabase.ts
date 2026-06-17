import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Supabase Environment Variables belum ter-set!");
  console.error("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "OK" : "MISSING");
  console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseAnonKey ? "OK" : "MISSING");
  
  // Untuk development & production sementara
  throw new Error("Missing Supabase environment variables. Please check Vercel settings.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);