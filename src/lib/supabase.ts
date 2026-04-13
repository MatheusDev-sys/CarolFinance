import { createClient } from '@supabase/supabase-js';

const DEFAULT_URL = 'https://mstbobevexibrrlsyihx.supabase.co';

const getEnv = (key: string): string | null => {
  // Check import.meta.env (Vite) and process.env (Node/Define)
  const value = (import.meta as any).env?.[key] || (typeof process !== 'undefined' ? process.env[key] : null);
  
  if (!value || value === 'undefined' || value === 'null' || value.trim() === '') {
    return null;
  }
  return value.trim();
};

const rawUrl = getEnv('VITE_SUPABASE_URL');
const key = getEnv('VITE_SUPABASE_ANON_KEY') || 'placeholder';

// Ensure the URL is a valid HTTP/HTTPS URL
const url = (rawUrl && rawUrl.startsWith('http')) ? rawUrl : DEFAULT_URL;

if (!getEnv('VITE_SUPABASE_URL') || !getEnv('VITE_SUPABASE_ANON_KEY')) {
  console.warn('Supabase credentials missing or invalid. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the Secrets panel.');
}

export const supabase = createClient(url, key);
