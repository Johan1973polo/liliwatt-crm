'use client';

import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json()).catch(() => ({ count: 0 }));

function NotifBadge({ count }: { count: number }) {
  if (!count || count === 0) return null;
  return (
    <span style={{
      background: 'linear-gradient(135deg, #7c3aed 0%, #d946ef 100%)',
      color: 'white',
      borderRadius: '10px',
      padding: '2px 9px',
      fontSize: '11px',
      fontWeight: 700,
      marginLeft: '8px',
      minWidth: '22px',
      textAlign: 'center',
      display: 'inline-block',
      lineHeight: 1.5,
      boxShadow: '0 2px 8px rgba(124, 58, 237, 0.45)',
      letterSpacing: '-0.2px',
      animation: 'badgePop 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    }}>
      {count > 9 ? '9+' : count}
    </span>
  );
}

interface NavbarProps {
  userEmail: string;
  userRole: string;
  userAvatar?: string | null;
  notificationCount?: number;
  directionMessageCount?: number;
  referentMessageCount?: number;
  performancesActivityCount?: number;
}

export default function Navbar({
  userEmail,
  userRole,
  userAvatar,
  notificationCount = 0,
  directionMessageCount = 0,
  referentMessageCount = 0,
  performancesActivityCount = 0
}: NavbarProps) {
  const pathname = usePathname();

  // Badges temps réel via SWR (refresh 5s)
  const swrOpts = { refreshInterval: 5000, revalidateOnFocus: true, revalidateOnReconnect: true, dedupingInterval: 2000 };
  const { data: msgData } = useSWR('/api/messages/count-unread', fetcher, swrOpts);
  const { data: perfData } = useSWR('/api/activities/count-new', fetcher, swrOpts);
  const { data: annData } = useSWR('/api/referent/announcements/count-unread', fetcher, swrOpts);

  const liveMsg = msgData?.count || notificationCount;
  const livePerf = perfData?.count || performancesActivityCount;
  const liveAnn = annData?.count || 0;

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrateur';
      case 'REFERENT':
        return 'Référent';
      case 'VENDEUR':
        return 'Vendeur';
      default:
        return role;
    }
  };

  const getAdminNavStructure = () => {
    return {
      links: [
        { href: '/calendar', label: 'Agenda', icon: 'bi-calendar-week' },
        { href: '/performances', label: 'Performances', icon: 'bi-graph-up-arrow', count: livePerf, badgeColor: 'success' },
        { href: '/admin/users', label: 'Utilisateurs', icon: 'bi-people' },
      ],
      dropdowns: [
        {
          label: 'Formation',
          icon: 'bi-mortarboard',
          items: [
            { href: '/formation', label: 'Ma Formation', icon: 'bi-book' },
            { href: '/formation/gestion', label: 'Gestion Formation', icon: 'bi-gear' },
            { href: '/admin/audio', label: 'Débriefing Audio', icon: 'bi-mic' },
          ],
        },
        {
          label: 'Gestion',
          icon: 'bi-gear',
          items: [
            { href: '/admin/messages', label: 'Messagerie', icon: 'bi-chat-dots', count: liveMsg, badgeColor: 'primary' },
            { href: '/admin/echanges', label: 'Échanges', icon: 'bi-eye' },
            { href: '/admin/links', label: 'Liens Globaux', icon: 'bi-link-45deg' },
            { href: '/admin/challenge', label: 'Challenge', icon: 'bi-trophy' },
            { href: '/admin/announce', label: 'Annoncer', icon: 'bi-megaphone' },
            { href: '/admin/activities', label: 'Activités', icon: 'bi-activity' },
          ],
        },
      ],
    };
  };

  const getNavLinks = () => {
    if (userRole === 'REFERENT') {
      return [
        { href: '/referent', label: 'Accueil', icon: 'bi-house' },
        { href: '/referent/vendors', label: 'Mes Vendeurs', icon: 'bi-people' },
        { href: '/referent/demandes', label: 'Demandes', icon: 'bi-clipboard-check' },
        { href: '/referent/messages', label: 'Messagerie', icon: 'bi-chat-dots', count: liveMsg, badgeColor: 'primary' },
        { href: '/referent/process', label: 'Process', icon: 'bi-diagram-3' },
        { href: '/formation', label: 'Formation', icon: 'bi-mortarboard' },
        { href: '/formation/gestion', label: 'Gestion Formation', icon: 'bi-gear' },
        { href: '/calendar', label: 'Agenda', icon: 'bi-calendar-week' },
        { href: '/performances', label: 'Performances', icon: 'bi-graph-up-arrow', count: livePerf, badgeColor: 'success' },
        { href: '/referent/announce', label: 'Annoncer', icon: 'bi-megaphone' },
      ];
    } else {
      return [
        { href: '/vendeur', label: 'Mon Espace', icon: 'bi-house' },
        { href: '/vendeur/process', label: 'Process', icon: 'bi-diagram-3' },
        { href: '/formation', label: 'Formation', icon: 'bi-mortarboard' },
        { href: '/calendar', label: 'Agenda', icon: 'bi-calendar-week' },
        { href: '/performances', label: 'Performances', icon: 'bi-graph-up-arrow', count: livePerf, badgeColor: 'success' },
        { href: '/vendeur/messages/direction', label: 'Direction', icon: 'bi-chat-left-text', count: directionMessageCount, badgeColor: 'danger' },
        { href: '/vendeur/messages/referent', label: 'Référent', icon: 'bi-chat-right-text', count: referentMessageCount, badgeColor: 'primary' },
        { href: '/vendeur/annonces', label: 'Annonces', icon: 'bi-megaphone', count: liveAnn, badgeColor: 'warning' },
      ];
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark border-bottom shadow-sm mb-4">
      <div className="container-fluid">
        <Link href="/" className="navbar-brand d-flex align-items-center">
          <span style={{ color: 'white', fontWeight: 700, fontSize: '18px' }}>Espace LILIWATT</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {userRole === 'ADMIN' ? (
              <>
                {/* Liens simples pour admin */}
                {getAdminNavStructure().links.map((link: any) => (
                  <li className="nav-item" key={link.href}>
                    <Link
                      href={link.href}
                      className={`nav-link ${pathname === link.href ? 'active fw-semibold' : ''}`}
                    >
                      <i className={`${link.icon} me-1`}></i>
                      {link.label}
                      <NotifBadge count={link.count || 0} />
                    </Link>
                  </li>
                ))}

                {/* Dropdowns pour admin */}
                {getAdminNavStructure().dropdowns.map((dropdown: any, idx: number) => (
                  <li className="nav-item dropdown" key={idx}>
                    <a
                      className="nav-link dropdown-toggle"
                      href="#"
                      role="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <i className={`${dropdown.icon} me-1`}></i>
                      {dropdown.label}
                    </a>
                    <ul className="dropdown-menu">
                      {dropdown.items.map((item: any) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={`dropdown-item ${pathname === item.href ? 'active' : ''}`}
                          >
                            <i className={`${item.icon} me-2`}></i>
                            {item.label}
                            <NotifBadge count={item.count || 0} />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </>
            ) : (
              /* Liens simples pour les autres rôles */
              getNavLinks().map((link: any) => (
                <li className="nav-item" key={link.href}>
                  <Link
                    href={link.href}
                    className={`nav-link ${pathname === link.href ? 'active fw-semibold' : ''}`}
                  >
                    <i className={`${link.icon} me-1`}></i>
                    {link.label}
                    <NotifBadge count={link.count || 0} />
                  </Link>
                </li>
              ))
            )}
          </ul>

          <div className="d-flex align-items-center">
            <span className="text-muted me-3 d-flex align-items-center">
              {userAvatar ? (
                <Image
                  src={userAvatar}
                  alt="Avatar"
                  width={32}
                  height={32}
                  className="rounded-circle me-2"
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <i className="bi bi-person-circle me-2" style={{ fontSize: '2rem' }}></i>
              )}
              <span>
                {userEmail} <span className="badge bg-secondary ms-1">{getRoleLabel(userRole)}</span>
              </span>
            </span>
            <button
              onClick={() => signOut({ callbackUrl: '/auth/signin' })}
              style={{ background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.background = '#b91c1c'; }}
              onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.background = '#dc2626'; }}
            >
              <i className="bi bi-box-arrow-right me-1"></i>
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
