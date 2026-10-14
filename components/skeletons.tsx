import type { CSSProperties, ReactNode } from 'react';
import { BrandStar } from './brand-star';

// Loading placeholders shaped like the real pages, so nothing jumps when the content arrives.
// Purely visual: each skeleton announces a single "Chargement…" to screen readers.

function Bone({
  w = '100%',
  h = 16,
  r,
  className = '',
  style,
}: {
  w?: number | string;
  h?: number | string;
  r?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return <span className={`skeleton ${className}`} style={{ width: w, height: h, borderRadius: r, ...style }} />;
}

function Loading({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={`skeleton-page ${className}`} role="status" aria-busy="true" aria-live="polite">
      <span className="sr-only">{label}</span>
      <div aria-hidden="true">{children}</div>
    </div>
  );
}

function HeadingSkeleton() {
  return (
    <div className="skeleton-heading">
      <div>
        <Bone w={150} h={13} />
        <Bone w="min(340px, 80%)" h={36} r={12} />
        <Bone w="min(420px, 90%)" h={16} />
      </div>
      <Bone className="skeleton-select" w={180} h={46} r={14} />
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-row">
        <Bone w={54} h={54} r={16} />
        <Bone w={78} h={24} r={999} />
      </div>
      <Bone w="75%" h={22} r={8} />
      <Bone w="95%" h={14} />
      <Bone w="60%" h={14} />
      <Bone h={10} r={999} style={{ marginTop: 10 }} />
    </div>
  );
}

function CardsSkeleton({ count }: { count: number }) {
  return (
    <div className="skeleton-cards">
      {Array.from({ length: count }, (_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="skeleton-stats">
      {Array.from({ length: 4 }, (_, index) => (
        <div className="skeleton-card" key={index}>
          <Bone w="60%" h={14} />
          <Bone w={70} h={36} r={10} />
          <Bone w="50%" h={13} />
        </div>
      ))}
    </div>
  );
}

/** Generic student page: heading and a grid of lesson cards. */
export function StudentPageSkeleton() {
  return (
    <Loading label="Chargement de la page…">
      <HeadingSkeleton />
      <Bone h={48} r={14} style={{ marginBottom: 22 }} />
      <StatsSkeleton />
      <CardsSkeleton count={6} />
    </Loading>
  );
}

/** Lesson page: title, tabs and the lesson card. */
export function LessonSkeleton() {
  return (
    <Loading label="Chargement de la leçon…" className="skeleton-lesson">
      <Bone w={130} h={16} />
      <Bone w={190} h={13} style={{ marginTop: 22 }} />
      <Bone w="min(520px, 90%)" h={40} r={12} />
      <Bone w={220} h={16} />
      <Bone h={56} r={18} style={{ margin: '22px 0' }} />
      <div className="skeleton-card skeleton-lesson-card">
        <div className="skeleton-row skeleton-row-start">
          <Bone w={100} h={30} r={999} />
          <Bone w={110} h={30} r={999} />
          <Bone w={100} h={30} r={999} />
        </div>
        <Bone w="70%" h={28} r={10} />
        <Bone h={110} r={16} />
        <Bone w="60%" h={18} />
        <Bone h={52} r={14} />
        <Bone w={160} h={50} r={14} />
      </div>
    </Loading>
  );
}

/** Exercise being generated on the server. */
export function ExerciseSkeleton() {
  return (
    <Loading label="Préparation de ton exercice…" className="skeleton-exercise">
      <Bone w="80%" h={24} r={8} />
      <Bone h={96} r={16} className="skeleton-dark" />
      <Bone h={54} r={16} />
      <Bone w={110} h={18} />
      <div className="skeleton-row">
        <Bone h={54} r={14} />
        <Bone w={130} h={54} r={14} style={{ flexShrink: 0 }} />
      </div>
    </Loading>
  );
}

/** Account, welcome and parental consent cards. */
export function CardPageSkeleton({ label = 'Chargement…' }: { label?: string }) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <Loading label={label}>
          <span className="auth-logo skeleton-logo">yaka.</span>
          <Bone w={140} h={13} />
          <Bone w="85%" h={32} r={10} style={{ marginTop: 10 }} />
          <Bone w="70%" h={16} />
          <div className="skeleton-form">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index}>
                <Bone w={150} h={14} />
                <Bone h={50} r={14} />
              </div>
            ))}
            <Bone h={52} r={14} />
          </div>
        </Loading>
      </div>
    </div>
  );
}

/** The whole student area while the profile and progress load. Mirrors StudentShell. */
export function StudentShellSkeleton({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <aside className="sidebar" aria-hidden="true">
        <span className="logo">
          <span className="logo-symbol">
            y
            <span>
              <BrandStar />
            </span>
          </span>
          yaka<span className="logo-dot">.</span>
        </span>
        <div className="space-label">Ton espace</div>
        <div className="skeleton-nav">
          {Array.from({ length: 5 }, (_, index) => (
            <div className="skeleton-row skeleton-row-start" key={index}>
              <Bone w={22} h={22} r={7} />
              <Bone w={`${55 + ((index * 13) % 30)}%`} h={16} />
            </div>
          ))}
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar" aria-hidden="true">
          <div className="breadcrumb">
            <span className="topbar-logo">
              <span className="logo-symbol">
                y
                <span>
                  <BrandStar />
                </span>
              </span>
            </span>
            <Bone w={140} h={18} />
          </div>
          <div className="topbar-actions">
            <Bone w={60} h={36} r={999} />
            <Bone w={40} h={40} r={999} />
          </div>
        </header>
        <main>{children}</main>
      </div>
      <nav className="bottom-nav" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <span className="skeleton-tab" key={index}>
            <Bone w={30} h={24} r={8} />
            <Bone w={44} h={10} />
          </span>
        ))}
      </nav>
    </div>
  );
}
