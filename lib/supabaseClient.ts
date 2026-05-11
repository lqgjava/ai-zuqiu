import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 验证URL是否为有效的HTTP/HTTPS URL
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey && isValidUrl(supabaseUrl)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;
