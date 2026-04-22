import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendEmail } from '@/lib/zoho-mail';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin only' }, { status: 401 });
  }

  try {
    const result = await sendEmail({
      to: 'bo@liliwatt.fr',
      subject: 'Test email LILIWATT CRM',
      html: '<h1>Test reussi</h1><p>Si tu lis ca, sendEmail fonctionne.</p>',
    });

    return NextResponse.json({
      success: result !== null,
      result: result ? 'Email envoye' : 'sendEmail a retourne null (voir logs Vercel)',
    });
  } catch (e: any) {
    return NextResponse.json({
      success: false,
      error: e.message,
      stack: e.stack?.substring(0, 500),
    }, { status: 500 });
  }
}
