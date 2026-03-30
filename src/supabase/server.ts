import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

let _supabaseAdmin: SupabaseClient<Database> | null = null

export const getSupabaseAdmin = (): SupabaseClient<Database> => {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    )
  }
  return _supabaseAdmin
}

// For backward compatibility - lazy getter that preserves full type information
export const supabaseAdmin: SupabaseClient<Database> = new Proxy(
  {} as SupabaseClient<Database>,
  {
    get(_target, prop: string | symbol) {
      return (
        getSupabaseAdmin() as unknown as Record<string | symbol, unknown>
      )[prop]
    },
  },
)
