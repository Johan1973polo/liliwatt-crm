'use client';

import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

interface NavbarProps {
  userEmail: string;
  userRole: string;
  userAvatar?: string | null;
  notificationCount?: number;
  directionMessageCount?: number;
  referentMessageCount?: number;
  backofficeMessageCount?: number;
  performancesActivityCount?: number;
}

export default function Navbar({
  userEmail,
  userRole,
  userAvatar,
  notificationCount = 0,
  directionMessageCount = 0,
  referentMessageCount = 0,
  backofficeMessageCount = 0,
  performancesActivityCount = 0
}: NavbarProps) {
  const pathname = usePathname();

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
        { href: '/performances', label: 'Performances', icon: 'bi-graph-up-arrow', count: performancesActivityCount, badgeColor: 'success' },
      ],
      dropdowns: [
        {
          label: 'Utilisateurs',
          icon: 'bi-people',
          items: [
            { href: '/admin', label: 'Vendeurs', icon: 'bi-people' },
            { href: '/admin/referents', label: 'Référents', icon: 'bi-person-badge' },
            { href: '/admin/users', label: 'Admins', icon: 'bi-person-gear' },
            { href: '/admin/backoffice', label: 'Back-Office', icon: 'bi-briefcase' },
          ],
        },
        {
          label: 'Formation',
          icon: 'bi-mortarboard',
          items: [
            { href: '/formation', label: 'Ma Formation', icon: 'bi-book' },
            { href: '/formation/gestion', label: 'Gestion Formation', icon: 'bi-gear' },
          ],
        },
        {
          label: 'Gestion',
          icon: 'bi-gear',
          items: [
            { href: '/admin/demandes', label: 'Demandes', icon: 'bi-clipboard2-check' },
            { href: '/admin/messages', label: 'Messagerie', icon: 'bi-chat-dots', count: notificationCount, badgeColor: 'primary' },
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
        { href: '/referent', label: 'Mes Vendeurs', icon: 'bi-people' },
        { href: '/referent/demandes', label: 'Demandes', icon: 'bi-clipboard-check' },
        { href: '/referent/messages', label: 'Messagerie', icon: 'bi-chat-dots', count: notificationCount, badgeColor: 'primary' },
        { href: '/referent/process', label: 'Process', icon: 'bi-diagram-3' },
        { href: '/formation', label: 'Formation', icon: 'bi-mortarboard' },
        { href: '/formation/gestion', label: 'Gestion Formation', icon: 'bi-gear' },
        { href: '/calendar', label: 'Agenda', icon: 'bi-calendar-week' },
        { href: '/performances', label: 'Performances', icon: 'bi-graph-up-arrow', count: performancesActivityCount, badgeColor: 'success' },
      ];
    } else {
      return [
        { href: '/vendeur', label: 'Mon Espace', icon: 'bi-house' },
        { href: '/vendeur/process', label: 'Process', icon: 'bi-diagram-3' },
        { href: '/formation', label: 'Formation', icon: 'bi-mortarboard' },
        { href: '/calendar', label: 'Agenda', icon: 'bi-calendar-week' },
        { href: '/performances', label: 'Performances', icon: 'bi-graph-up-arrow', count: performancesActivityCount, badgeColor: 'success' },
        { href: '/vendeur/messages/direction', label: 'Direction', icon: 'bi-chat-left-text', count: directionMessageCount, badgeColor: 'danger' },
        { href: '/vendeur/messages/referent', label: 'Référent', icon: 'bi-chat-right-text', count: referentMessageCount, badgeColor: 'primary' },
        { href: '/vendeur/messages/backoffice', label: 'Back-Office', icon: 'bi-chat-square-text', count: backofficeMessageCount, badgeColor: 'warning' },
      ];
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark border-bottom shadow-sm mb-4">
      <div className="container-fluid">
        <Link href="/" className="navbar-brand d-flex align-items-center">
          <Image
            src="/logo-liliwatt.jpg"
            alt="Logo LILIWATT"
            width={120}
            height={45}
            priority
            style={{ objectFit: 'contain' }}
            className="me-2"
          />
          <span className="fw-bold text-primary">CRM Télévendeur</span>
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
                      {link.count !== undefined && link.count > 0 && (
                        <span className={`badge bg-${link.badgeColor || 'danger'} ms-2`}>{link.count}</span>
                      )}
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
                            {item.count !== undefined && item.count > 0 && (
                              <span className={`badge bg-${item.badgeColor || 'danger'} ms-2`}>{item.count}</span>
                            )}
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
                    {link.count !== undefined && link.count > 0 && (
                      <span className={`badge bg-${link.badgeColor || 'danger'} ms-2`}>{link.count}</span>
                    )}
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
            <button onClick={() => signOut({ callbackUrl: '/auth/signin' })} className="btn btn-outline-danger btn-sm">
              <i className="bi bi-box-arrow-right me-1"></i>
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
