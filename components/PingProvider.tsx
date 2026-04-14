'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function PingProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session) return;
    const ping = () => fetch('/api/ping', { method: 'POST' }).catch(() => {});
    ping();
    const interval = setInterval(ping, 10000);
    return () => clearInterval(interval);
  }, [session]);

  return <>{children}</>;
}
