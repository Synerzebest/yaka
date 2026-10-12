import Link from 'next/link';
export default function NotFound() {
  return (
    <section>
      <h1>Cette leçon est introuvable.</h1>
      <Link className="primary-button" href="/cours">
        Retrouver mes cours
      </Link>
    </section>
  );
}
