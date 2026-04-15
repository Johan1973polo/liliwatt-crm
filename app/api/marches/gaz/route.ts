import { NextResponse } from 'next/server';

export const revalidate = 300;

const FALLBACK = { value: 34.2, change: -0.5, changePercent: -1.4, history: [36, 35, 34, 35, 33, 34, 34], delayed: true };

export async function GET() {
  try {
    const res = await fetch(
      'https://query1.finance.yahoo.com/v8/finance/chart/TTF=F?interval=1d&range=10d',
      { next: { revalidate: 300 }, headers: { 'User-Agent': 'Mozilla/5.0' } }
    );

    if (!res.ok) return NextResponse.json(FALLBACK);
    const data = await res.json();

    const result = data?.chart?.result?.[0];
    const closes = result?.indicators?.quote?.[0]?.close;

    if (!closes || closes.length < 2) return NextResponse.json(FALLBACK);

    const prices = closes.filter((p: number | null) => p !== null).slice(-8);
    if (prices.length < 2) return NextResponse.json(FALLBACK);

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
  } catch {
    return NextResponse.json(FALLBACK);
  }
}
