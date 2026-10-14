'use client';
import { LegalLinks } from '@/components/legal-links';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { Icon } from '@/components/icons';
import { studentNavigation, lessonHref } from '@/lib/navigation';
import { todayInBrussels } from '@/lib/age';
import { currentStreak } from '@/lib/streak';
import { useStudent } from './provider';

export function StudentShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { profile, message, refresh, recommended, progress } = useStudent();
  const streak = currentStreak(progress.days, todayInBrussels());
  const [mobile, setMobile] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const current = studentNavigation.find(item => pathname === item.href || pathname.startsWith(item.href + '/'));
  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobile ? 'mobile-open' : ''}`}>
        <Link href="/dashboard" className="logo" aria-label="Yaka, mon tableau de bord">
          <span className="logo-symbol">
            y<span>✳</span>
          </span>
          yaka<span className="logo-dot">.</span>
        </Link>
        <div className="space-label">Ton espace</div>
        <nav aria-label="Navigation principale">
          {studentNavigation.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${current?.href === item.href ? 'active' : ''}`}
              aria-current={current?.href === item.href ? 'page' : undefined}
              onClick={() => setMobile(false)}
            >
              <Icon name={item.icon} />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="premium-card">
            <Icon name="sparkles" />
            <h3>Un exercice par jour</h3>
            <p>C’est tout ce qu’il faut pour garder ta flamme 🔥 allumée.</p>
            <Link className="text-button" href="/exercices" onClick={() => setMobile(false)}>
              Je m’entraîne <Icon name="arrow" size={16} />
            </Link>
          </div>
          <Link className="nav-item secondary" href="/#la-methode">
            <Icon name="help" />
            La méthode Yaka
          </Link>
          <Link className="profile" href="/compte">
            <span className="avatar">{profile.display_name[0]?.toUpperCase()}</span>
            <span>
              <strong>{profile.display_name}</strong>
              <small>Mon compte élève</small>
            </span>
            <Icon name="settings" size={18} />
          </Link>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="mobile-menu icon-button"
              aria-label="Ouvrir le menu"
              aria-expanded={mobile}
              onClick={() => setMobile(!mobile)}
            >
              <Icon name="menu" />
            </button>
            <Link href="/dashboard">Mon espace</Link>
            <Icon name="chevron" size={13} />
            <strong>{current?.name || 'Mon espace'}</strong>
          </div>
          <div className="topbar-actions">
            <Link href="/compte" className="text-button">
              Mon compte
            </Link>
            <span
              className={`streak ${streak ? '' : 'cold'}`}
              title={
                streak
                  ? `${streak} jour${streak > 1 ? 's' : ''} de maths d’affilée`
                  : 'Réussis un exercice pour allumer ta série'
              }
            >
              <span aria-hidden="true">🔥</span>
              {streak}
              <span className="sr-only">{streak > 1 ? ' jours d’affilée' : ' jour d’affilée'}</span>
            </span>
            <div className="notification-wrap">
              <button
                className="icon-button"
                aria-label="Notifications"
                onClick={() => setNotifications(!notifications)}
              >
                <Icon name="bell" />
              </button>
              {notifications && (
                <div className="notification-popover">
                  <strong>Ton prochain déclic 🌱</strong>
                  <p>{recommended.title}</p>
                  <Link href={lessonHref(recommended.slug, 'exercices')} onClick={() => setNotifications(false)}>
                    C’est parti <Icon name="arrow" size={14} />
                  </Link>
                </div>
              )}
            </div>
            <Link href="/compte" className="avatar small" aria-label="Mon profil">
              {profile.display_name[0]?.toUpperCase()}
            </Link>
          </div>
        </header>
        <main>
          {message && (
            <div className="progress-sync" role="status">
              <span>{message}</span>
              <button className="text-button" onClick={() => void refresh()}>
                Actualiser
              </button>
            </div>
          )}
          {children}
          <footer className="page-footer">
            <span>
              <span className="mini-logo">yaka.</span> Les maths, à ta façon.
            </span>
            <span>
              Fait avec soin, pour tes déclics.{' '}
              <span className="footer-flower" aria-hidden="true">
                ✳
              </span>
            </span>
            <LegalLinks />
          </footer>
        </main>
      </div>
    </div>
  );
}
