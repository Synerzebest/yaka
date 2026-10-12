import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalLinks } from '@/components/legal-links';
import { legalDraft } from '@/lib/legal';

export const metadata: Metadata = {
  robots: legalDraft ? { index: false, follow: true } : { index: true, follow: true },
};
export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="legal-shell">
      <a className="legal-skip" href="#legal-content">
        Aller au contenu
      </a>
      <header className="legal-header">
        <Link className="auth-logo" href="/">
          yaka.
        </Link>
        <Link href="/">Revenir à l’accueil</Link>
      </header>
      <main id="legal-content">
        {legalDraft && (
          <aside className="legal-draft" role="note">
            <strong>Version préparatoire</strong>
            <p>
              Les informations de l’éditeur et certaines modalités du service restent à compléter. Ces textes ne
              constituent pas une version finalisée pour l’ouverture au public.
            </p>
          </aside>
        )}
        {children}
      </main>
      <footer className="legal-footer">
        <LegalLinks />
        <p>Les maths, à ta façon.</p>
      </footer>
    </div>
  );
}
