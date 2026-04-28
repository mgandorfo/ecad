import { createClient } from "@supabase/supabase-js";

// Cliente com service role — apenas para Server Actions que precisam de auth.admin.*
// NUNCA expor no cliente browser.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
