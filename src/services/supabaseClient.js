import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// v0.3.38 Fase 3 — ausência das variáveis não pode quebrar quem não usa
// sincronização (build local sem .env.local, Vitest, CI). isSupabaseConfigured
// é o sinal que a UI usa para desativar a seção de sync em vez de falhar.
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;
