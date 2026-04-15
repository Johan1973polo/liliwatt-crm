import { NextResponse } from 'next/server';

export const revalidate = 300;

const FALLBACK = { value: 72.4, change: -0.8, changePercent: -1.1, history: [74, 73, 72, 73, 71, 72, 72], delayed: true };

export async function GET() {
  try {
    const apiKey = process.env.ALPHA_VANTAGE_KEY || 'RXH876RE520G9Y1X';
    const res = await fetch(
      `https://www.alphavantage.co/query?function=BRENT&interval=daily&apikey=${apiKey}`,
      { next: { revalidate: 300 } }
    );

    if (!res.ok) return NextResponse.json(FALLBACK);
    const data = await res.json();

    const series = data.data;
    if (!series || series.length < 2) return NextResponse.json(FALLBACK);

    // Les 8 derniers points
    const recent = series.slice(0, 8).reverse();
    const prices = recent.map((d: any) => parseFloat(d.value)).filter((v: number) => !isNaN(v));

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
