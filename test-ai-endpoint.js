const https = require('https');

const CRON_SECRET = process.env.CRON_SECRET || 'votre-secret-ici';
const url = `https://crm-televendeur.vercel.app/api/ai/process-events?secret=${CRON_SECRET}`;

console.log('🧪 Test de l\'endpoint AI...\n');
console.log('URL:', url.replace(CRON_SECRET, 'HIDDEN'));

const req = https.request(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('\n📊 Status:', res.statusCode);
    console.log('📝 Réponse:');
    try {
      console.log(JSON.stringify(JSON.parse(data), null, 2));
    } catch {
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Erreur:', error.message);
});

req.end();
