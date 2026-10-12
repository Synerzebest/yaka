'use server';

import { consentError, hashConsentToken, validConsentToken } from '@/lib/parental-consent';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Called from the page opened by the parent, without a Yaka account: possession of the link
 * sent to the parent's address is the proof. Opening the link (GET) never changes anything,
 * because some mail clients open links automatically; only this POST action does.
 */
export async function decideParentalConsent(
  token: string,
  decision: 'grant' | 'refuse',
  formData: FormData,
): Promise<{ decision: 'granted' | 'deleted' } | { error: string }> {
  if (!validConsentToken(token)) return { error: consentError(new Error('consent_unavailable')) };
  if (decision !== 'grant' && decision !== 'refuse') return { error: consentError(null) };
  if (decision === 'grant' && formData.get('guardian') !== 'on')
    return { error: 'Confirmez que vous êtes le parent ou le représentant légal de cet élève.' };
  if (decision === 'refuse' && formData.get('confirm_deletion') !== 'on')
    return { error: 'Confirmez la suppression du compte.' };
  try {
    const { data, error } = await createAdminClient().rpc('server_decide_parental_consent', {
      p_token_hash: hashConsentToken(token),
      p_decision: decision,
    });
    if (error) return { error: consentError(error) };
    return { decision: data.decision };
  } catch (error) {
    return { error: consentError(error) };
  }
}
