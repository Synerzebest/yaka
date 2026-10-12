import type { ReactNode } from 'react';
import { contactHref, legal, legalValue } from '@/lib/legal';

export function LegalDocument({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return (
    <article className="legal-document">
      <header>
        <p className="eyebrow">YAKA · INFORMATIONS ET DROITS</p>
        <h1>{title}</h1>
        <p>{intro}</p>
        <p className="legal-version">Version du {legal.version.split('-').reverse().join('/')} · Français</p>
      </header>
      {children}
    </article>
  );
}
export function LegalContact({ privacy = false, subject = '' }: { privacy?: boolean; subject?: string }) {
  const href = contactHref(privacy, subject);
  return href ? (
    <a href={href}>{privacy ? legal.privacyEmail || legal.contactEmail : legal.contactEmail}</a>
  ) : (
    <span className="legal-missing">Adresse de contact à renseigner avant l’ouverture publique.</span>
  );
}
export function LegalField({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd className={value ? '' : 'legal-missing'}>{legalValue(value)}</dd>
    </div>
  );
}
