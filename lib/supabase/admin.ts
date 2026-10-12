import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from './config';

export function createAdminClient() {
  const config = supabaseConfig();
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!config || !secret) throw new Error('learning_not_configured');
  return createClient(config.url, secret, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
