/** Ambient types for Supabase Edge Functions (Deno runtime). */
declare namespace Deno {
  namespace env {
    function get(key: string): string | undefined
  }
}
