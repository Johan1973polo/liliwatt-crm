'use client';

import { useEffect } from 'react';

export default function BootstrapClient() {
  useEffect(() => {
    // Charger Bootstrap JS seulement côté client
    require('bootstrap/dist/js/bootstrap.bundle.min.js');
  }, []);

  return null;
}
