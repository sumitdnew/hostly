import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Use in-memory storage since localStorage is blocked in sandboxed iframes
    storage: {
      getItem: (key: string) => {
        return (window as any).__SUPABASE_STORAGE__?.[key] ?? null;
      },
      setItem: (key: string, value: string) => {
        if (!(window as any).__SUPABASE_STORAGE__) {
          (window as any).__SUPABASE_STORAGE__ = {};
        }
        (window as any).__SUPABASE_STORAGE__[key] = value;
      },
      removeItem: (key: string) => {
        if ((window as any).__SUPABASE_STORAGE__) {
          delete (window as any).__SUPABASE_STORAGE__[key];
        }
      },
    },
    autoRefreshToken: true,
    persistSession: true,
  },
});
