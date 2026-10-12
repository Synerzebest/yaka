import configuration from '../content/legal-config.json' with { type: 'json' };

export const legalLinks = [
  { href: '/mentions-legales', label: 'Mentions légales' },
  { href: '/conditions-utilisation', label: 'Conditions d’utilisation' },
  { href: '/confidentialite', label: 'Confidentialité' },
  { href: '/cookies', label: 'Cookies' },
  { href: '/accessibilite', label: 'Accessibilité' },
  { href: '/contact', label: 'Contact' },
];
type Configuration = { version: string; reviewedForPublication: boolean } & Record<
  Exclude<keyof typeof configuration, 'version' | 'reviewedForPublication'>,
  string | null
>;
export const legal = configuration as Configuration;
export const legalDraft =
  !legal.reviewedForPublication ||
  Object.entries(legal).some(([key, value]) => key !== 'reviewedForPublication' && (value === null || value === ''));
export function legalValue(value: string | null) {
  return value?.trim() || 'À compléter par l’éditeur avant l’ouverture publique.';
}
export function contactHref(privacy = false, subject = '') {
  const email = privacy ? legal.privacyEmail || legal.contactEmail : legal.contactEmail;
  if (!email || !/^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(email)) return null;
  return `mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;
}
