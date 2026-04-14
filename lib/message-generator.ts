import { prisma } from '@/lib/prisma';

// CONTEXTE DE L'ENTREPRISE
const COMPANY_CONTEXT = `
Tu es un courtier en énergie qui travaille pour une société de télévente.

ÉQUIPE ET HIÉRARCHIE :
- Président : Sabir Bahloul (M. Bahloul)
- Référent : Kevin Moreau (certains l'appellent Kevin, d'autres Monsieur Moreau)
- Administrateur : Johan MALLET (super sympa, très bon vendeur, fait un super boulot)
- Back-Office : Hakim et Juliette (font un excellent travail, certains les remercient)

ENVIRONNEMENT DE TRAVAIL :
- C'est une SUPER boîte, très bien rémunérée
- L'ambiance est excellente, tout le monde est motivé pour gagner de l'argent
- Les contrats signés entre le 1er et le 30 du mois sont payés entre le 20 et le 25 du mois suivant
- Certains ont eu des expériences dans d'autres boîtes (voir previousCompanies) mais ici c'est mieux

OUTILS DE FORMATION :
- Base de travail avec outils de formation
- Quiz débutant avec 300 questions
- Certains courtiers mentionnent avoir terminé tout le quiz
- Certains courtiers réels galèrent parfois, les autres les encouragent ("t'inquiète pas, tu vas y arriver")

STYLE DE COMMUNICATION :
- Certains tutoient, d'autres vouvoient (selon useTutoiement)
- Certains font des fautes d'orthographe (selon hasTypos et typoRate)
- Certains utilisent des émojis (selon emojiUsage)
- On se charre gentiment entre nous
- On parle de râteaux, de belles journées, de ventes
- On ne parle PAS toute la journée (rester réaliste)
- On ne sort JAMAIS du contexte de la télévente/courtage en énergie
`;

// Injection de fautes d'orthographe réalistes
function injectTypos(text: string, typoRate: number): string {
  if (typoRate === 0) return text;

  const words = text.split(' ');
  const numTypos = Math.floor(words.length * typoRate);

  // Fautes courantes
  const commonTypos: Record<string, string> = {
    'c\'est': 'cest',
    'qu\'est-ce': 'quest-ce',
    'aujourd\'hui': 'aujourdhui',
    'beaucoup': 'bcp',
    'parce que': 'pcq',
    'quelque': 'quelque',
    'vraiment': 'vrament',
    'plusieurs': 'plusieur',
    'maintenant': 'mtn',
    'comment': 'commen',
    'demain': 'dmain',
    'aussi': 'ossi',
  };

  for (let i = 0; i < numTypos; i++) {
    const randomIndex = Math.floor(Math.random() * words.length);
    const word = words[randomIndex].toLowerCase();

    // Vérifier si le mot a une faute commune
    for (const [correct, typo] of Object.entries(commonTypos)) {
      if (word.includes(correct)) {
        words[randomIndex] = words[randomIndex].replace(correct, typo);
        break;
      }
    }
  }

  return words.join(' ');
}

// Génération avec DeepSeek API
async function generateWithDeepSeek(prompt: string): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    console.error('[MessageGenerator] DEEPSEEK_API_KEY not configured, using template');
    throw new Error('DEEPSEEK_API_KEY not configured');
  }

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: COMPANY_CONTEXT,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.9,
      max_tokens: 150,
    }),
  });

  if (!response.ok) {
    console.error('[MessageGenerator] DeepSeek API error:', response.statusText);
    throw new Error(`DeepSeek API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

// Déterminer si on doit utiliser DeepSeek (30%) ou un template (70%)
function shouldUseDeepSeek(): boolean {
  return Math.random() < 0.3;
}

// Templates de messages selon le contexte
function getTemplateMessage(context: string): string {
  const templates = {
    'challenge': [
      "Oh la la les 150€ c'est pour moi aujourd'hui 🔥",
      "Challenge à 150 balles ? Je fonce !",
      "Ça sent bon ce challenge, on va dégommer ça",
      "Les 150€ je les vois déjà dans ma poche 💰",
      "Challenge accepté ! On va tout donner",
    ],
    'birthday': [
      "Merci les gars ! 🎂",
      "Merci à tous, vous êtes au top ! 🎉",
      "Super merci ! Belle journée qui commence 🥳",
    ],
    'sale': [
      "Bien joué ! 💪",
      "GG mec !",
      "Belle vente ! Continue comme ça",
      "Nickel ! T'es en feu 🔥",
      "Bravo l'ami !",
    ],
    'encouragement': [
      "T'inquiète pas tu vas y arriver !",
      "Force à toi, ça va le faire",
      "Continue, tu progresses bien",
      "Lâche rien, ça va venir",
    ],
    'payday': [
      "Vivement le 20 pour la paye !",
      "J'attends le 25 avec impatience",
      "La paye arrive bientôt, ça fait du bien",
    ],
    'casual': [
      "Salut l'équipe !",
      "Bon courage à tous",
      "Belle journée à tous",
      "On va tout déchirer aujourd'hui",
      "Allez on y va !",
      "Coucou !",
      "Bonjour tout le monde !",
      "Salut les gars !",
    ],
  };

  const contextTemplates = templates[context as keyof typeof templates] || templates.casual;
  return contextTemplates[Math.floor(Math.random() * contextTemplates.length)];
}

export async function generateMessage(params: {
  courtierNumber: number;
  context: string;
  referenceMessage?: string;
  additionalContext?: string;
}): Promise<string> {
  const { courtierNumber, context, referenceMessage, additionalContext } = params;

  console.log(`[MessageGenerator] Génération pour courtier N°${courtierNumber}, context: ${context}`);

  // Récupérer le profil du courtier fictif
  const courtier = await prisma.fictionalCourtier.findUnique({
    where: { courtierNumber },
  });

  if (!courtier) {
    throw new Error(`Courtier fictif N°${courtierNumber} introuvable`);
  }

  let message: string;

  // Vérifier si c'est l'anniversaire du courtier
  const today = new Date();
  const birthDate = new Date(courtier.birthDate);
  const isMyBirthday =
    birthDate.getDate() === today.getDate() &&
    birthDate.getMonth() === today.getMonth();

  if (isMyBirthday && context !== 'birthday') {
    // Si c'est son anniversaire et qu'on ne parle pas déjà d'anniversaire
    message = "Hé les gars, c'est mon anniversaire aujourd'hui ! 🎂";
  } else if (shouldUseDeepSeek()) {
    // 30% des messages : essayer d'utiliser DeepSeek
    try {
      const prompt = `
Tu es ${courtier.firstName}, courtier n°${courtier.courtierNumber}.

TON PROFIL :
- Âge: ${courtier.age} ans
- Personnalité: ${courtier.personality}
- Style de communication: ${courtier.communicationStyle}
- ${courtier.useTutoiement ? 'Tu tutoies' : 'Tu vouvoies'}
- Gains mensuels moyens: ${courtier.monthlyEarnings}€
- ${courtier.lifeContext}
- Expériences passées: ${courtier.previousCompanies}

CONTEXTE ACTUEL : ${context}
${referenceMessage ? `MESSAGE DE RÉFÉRENCE : "${referenceMessage}"` : ''}
${additionalContext ? `CONTEXTE ADDITIONNEL : ${additionalContext}` : ''}

Génère UN SEUL message court (max 20 mots) authentique et naturel dans le style du personnage.
Ne mets PAS de guillemets autour du message.
Reste dans le contexte de la télévente/courtage.
`;

      message = await generateWithDeepSeek(prompt);
      console.log(`[MessageGenerator] DeepSeek utilisé: "${message}"`);
    } catch (error) {
      console.log(`[MessageGenerator] DeepSeek failed, falling back to template`);
      message = getTemplateMessage(context);
    }
  } else {
    // 70% des messages : utiliser des templates
    message = getTemplateMessage(context);
    console.log(`[MessageGenerator] Template utilisé: "${message}"`);
  }

  // Injecter des fautes d'orthographe si nécessaire
  if (courtier.hasTypos) {
    message = injectTypos(message, courtier.typoRate);
  }

  // Ajouter des émojis selon le profil
  if (courtier.emojiUsage === 'high' && !message.includes('🔥') && !message.includes('💪')) {
    const emojis = ['😊', '👍', '🔥', '💪', '🎯', '✨'];
    if (Math.random() < 0.5) {
      message += ' ' + emojis[Math.floor(Math.random() * emojis.length)];
    }
  }

  return message;
}
