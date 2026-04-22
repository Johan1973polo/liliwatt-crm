export async function sendEmail({ to, subject, html, from = 'contact@liliwatt.fr' }: {
  to: string; subject: string; html: string; from?: string;
}) {
  const refreshToken = process.env.ZOHO_REFRESH_TOKEN;
  const clientId = process.env.ZOHO_CLIENT_ID;
  const clientSecret = process.env.ZOHO_CLIENT_SECRET;
  const accountId = process.env.ZOHO_ACCOUNT_ID || '8439060000000002002';

  if (!refreshToken || !clientId || !clientSecret) {
    console.error('❌ Zoho credentials manquantes');
    return null;
  }

  // Get access token
  const tokenRes = await fetch('https://accounts.zoho.eu/oauth/v2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ refresh_token: refreshToken, client_id: clientId, client_secret: clientSecret, grant_type: 'refresh_token' }),
  });
  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;
  if (!accessToken) { console.error('❌ Zoho token failed'); return null; }

  const res = await fetch(`https://mail.zoho.eu/api/accounts/${accountId}/messages`, {
    method: 'POST',
    headers: { 'Authorization': `Zoho-oauthtoken ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fromAddress: from, toAddress: to, subject, content: html, mailFormat: 'html' }),
  });

  if (!res.ok) { console.error('❌ Zoho mail error:', await res.text()); return null; }
  console.log(`✅ Email envoyé à ${to}: ${subject}`);
  return res.json();
}
