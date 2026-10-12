import { createBrowserClient } from '@supabase/ssr';
import { supabaseConfig } from './config';

export function createClient() {
  const config = supabaseConfig();
  if (!config) throw new Error('La connexion à Supabase n’est pas configurée.');
  return createBrowserClient(config.url, config.key);
}
