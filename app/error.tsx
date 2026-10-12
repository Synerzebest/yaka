'use client';
import Link from 'next/link';
export default function StudentError({ reset }: { reset: () => void }) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Ton espace est momentanément indisponible.</h1>
        <p className="auth-intro">Tes données sont conservées. Tu peux réessayer ou te reconnecter.</p>
        <button className="primary-button" onClick={reset}>
          Réessayer
        </button>
        <Link href="/connexion" className="auth-back">
          Me reconnecter
        </Link>
      </div>
    </div>
  );
}
