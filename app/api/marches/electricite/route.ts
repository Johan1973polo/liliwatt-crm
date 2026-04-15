import { NextResponse } from 'next/server';

export const revalidate = 300; // 5 min cache

const FALLBACK = { value: 58.2, change: -1.3, changePercent: -2.2, history: [62, 60, 58, 61, 59, 57, 58], delayed: true };

export async function GET() {
  try {
    // ENTSO-E Transparency Platform — prix day-ahead France
    const today = new Date();
    const urls = [
      `https://api.energy-charts.info/price?bzn=FR&resolution=daily&start=${formatDate(daysAgo(8))}&end=${formatDate(today)}`,
    ];

    for (const url of urls) {
      try {
        const res = await fetch(url, { next: { revalidate: 300 } });
        if (!res.ok) continue;
        const data = await res.json();

        if (data.price && data.price.length >= 2) {
          const prices = data.price.slice(-8).filter((p: number) => p !== null && p !== undefined);
          if (prices.length < 2) continue;

          const current = prices[prices.length - 1];
          const previous = prices[prices.length - 2];
          const change = current - previous;
          const changePercent = (change / previous) * 100;

          return NextResponse.json({
            value: Math.round(current * 100) / 100,
            change: Math.round(change * 100) / 100,
            changePercent: Math.round(changePercent * 10) / 10,
            history: prices.slice(-7).map((p: number) => Math.round(p * 10) / 10),
            delayed: false,
          });
        }
      } catch {
        continue;
      }
    }

    return NextResponse.json(FALLBACK);
  } catch {
    return NextResponse.json(FALLBACK);
  }
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function formatDate(d: Date) {
  return d.toISOString().split('T')[0];
}
