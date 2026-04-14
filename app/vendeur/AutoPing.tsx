'use client';

import { useEffect } from 'react';

export default function AutoPing() {
  useEffect(() => {
    const ping = () => fetch('/api/ping', { method: 'POST' }).catch(() => {});
    ping();
    const interval = setInterval(ping, 30000);
    return () => clearInterval(interval);
  }, []);

  return null;
}
