import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Supabase Environment Variables belum ter-set di Vercel!");
  console.error("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✅ OK" : "❌ MISSING");
  console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseAnonKey ? "✅ OK" : "❌ MISSING");
  
  // JANGAN CRASH aplikasi, hanya tampilkan warning
  console.warn("⚠️ Supabase client tidak bisa dibuat. Beberapa fitur mungkin tidak berfungsi.");
}

export const supabase = createClient(
  supabaseUrl || "", 
  supabaseAnonKey || ""
);