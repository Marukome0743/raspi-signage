import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

let _supabase: SupabaseClient<Database> | null = null

export const getSupabase = (): SupabaseClient<Database> => {
  if (!_supabase) {
    _supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    )
  }
  return _supabase
}

// For backward compatibility - lazy getter that preserves full type information
export const supabase: SupabaseClient<Database> = new Proxy(
  {} as SupabaseClient<Database>,
  {
    get(_target, prop: string | symbol) {
      return (getSupabase() as unknown as Record<string | symbol, unknown>)[
        prop
      ]
    },
  },
)
