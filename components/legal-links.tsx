import Link from 'next/link';
import { legalLinks } from '@/lib/legal';

export function LegalLinks() {
  return (
    <nav className="legal-links" aria-label="Informations légales">
      {legalLinks.map(link => (
        <Link key={link.href} href={link.href}>
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
