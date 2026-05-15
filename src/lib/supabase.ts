import { createClient } from "@supabase/supabase-js"

// Read env vars — fall back to a harmless placeholder so the module loads
// even when the keys aren't configured yet. The clients will throw at
// request time with the real Supabase error, which is much easier to
// diagnose than a module-evaluation crash on every page load.
const PLACEHOLDER_URL = "https://placeholder.supabase.co"
const PLACEHOLDER_KEY = "placeholder-anon-key"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY?.trim()

if (!url || !anonKey) {
  console.warn(
    "[supabase] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing. " +
      "Auth and DB calls will fail until you set them in .env.local.",
  )
}

export const supabase = createClient(url || PLACEHOLDER_URL, anonKey || PLACEHOLDER_KEY)

export const supabaseAdmin = createClient(
  url || PLACEHOLDER_URL,
  serviceKey || PLACEHOLDER_KEY,
)

/** True only when real credentials are present. UI can use this to gate features. */
export const supabaseConfigured = Boolean(url && anonKey)
