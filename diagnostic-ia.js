// Script de diagnostic du système IA
const https = require('https');

const BASE_URL = 'https://crm-televendeur.vercel.app';

async function fetchAPI(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const req = https.request(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data),
          });
        } catch {
          resolve({
            status: res.statusCode,
            data: data,
          });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

async function diagnostic() {
  console.log('🔍 DIAGNOSTIC DU SYSTÈME IA\n');

  // 1. Vérifier que l'API est accessible
  console.log('1️⃣ Vérification de l\'accès API...');
  try {
    const health = await fetchAPI('/api/team-activities');
    console.log(`   ✅ API accessible (status: ${health.status})\n`);
  } catch (error) {
    console.log(`   ❌ API inaccessible: ${error.message}\n`);
    return;
  }

  // 2. Tester l'endpoint de traitement IA (sans auth = devrait échouer proprement)
  console.log('2️⃣ Test de l\'endpoint AI process-events...');
  try {
    const result = await fetchAPI('/api/ai/process-events', {
      method: 'POST',
    });
    console.log(`   Status: ${result.status}`);
    console.log(`   Réponse: ${JSON.stringify(result.data, null, 2)}\n`);
  } catch (error) {
    console.log(`   ❌ Erreur: ${error.message}\n`);
  }

  // 3. Vérifier l'endpoint de génération de réponse
  console.log('3️⃣ Test de l\'endpoint generate-response...');
  try {
    const result = await fetchAPI('/api/ai/generate-response', {
      method: 'POST',
      body: {
        courtierNumber: 1,
        context: 'casual',
        referenceMessage: 'Bonjour',
      },
    });
    console.log(`   Status: ${result.status}`);
    console.log(`   Réponse: ${JSON.stringify(result.data, null, 2)}\n`);
  } catch (error) {
    console.log(`   ❌ Erreur: ${error.message}\n`);
  }

  console.log('✅ Diagnostic terminé');
}

diagnostic().catch(console.error);
