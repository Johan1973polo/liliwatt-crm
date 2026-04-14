const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateModule6WithAudio() {
  try {
    const newContent = `<div class="alert alert-warning border-0 shadow-sm mb-4">
  <h5 class="alert-heading"><i class="bi bi-exclamation-triangle me-2"></i>Document confidentiel</h5>
  <p class="mb-0">Ce document est à usage interne uniquement. LILIWATT en est le propriétaire. Il ne peut être transmis à des tiers.</p>
</div>

# Gestion des objections avancée

<div class="card shadow-sm border-0 mb-4 mt-4" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
  <div class="card-body p-4">
    <div class="d-flex align-items-center mb-3">
      <div class="bg-white rounded-circle p-3 me-3" style="width: 60px; height: 60px; display: flex; align-items: center; justify-content: center;">
        <i class="bi bi-calendar-check" style="font-size: 1.8rem; color: #667eea;"></i>
      </div>
      <div class="text-white">
        <h4 class="mb-1" style="color: white !important;">Formation : Prise de RDV</h4>
        <p class="mb-0 opacity-75" style="color: rgba(255,255,255,0.9) !important;">Écoutez cette formation audio essentielle</p>
      </div>
    </div>

    <div class="bg-white rounded-3 p-4 shadow-sm">
      <div class="d-flex align-items-center mb-3">
        <div class="flex-grow-1">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="badge bg-success px-3 py-2">
              <i class="bi bi-play-circle me-1"></i>
              Audio disponible
            </span>
            <span class="text-muted small">
              <i class="bi bi-clock me-1"></i>
              Durée : ~10 minutes
            </span>
          </div>
        </div>
      </div>

      <div class="audio-player-wrapper">
        <audio id="audio-prise-rdv" controls controlsList="nodownload" class="w-100 mb-3" style="height: 54px; border-radius: 10px; outline: none;">
          <source src="/audio/AUDIO-2026-02-26-20-01-01.m4a" type="audio/mp4">
          Votre navigateur ne supporte pas la lecture audio.
        </audio>
      </div>

      <div class="d-flex gap-2 flex-wrap">
        <button class="btn btn-primary flex-grow-1" onclick="document.getElementById('audio-prise-rdv').play();">
          <i class="bi bi-play-fill me-2"></i>
          Prise de RDV - Écouter
        </button>
        <button class="btn btn-outline-secondary" onclick="document.getElementById('audio-prise-rdv').pause();">
          <i class="bi bi-pause-fill"></i>
        </button>
        <button class="btn btn-outline-secondary" onclick="document.getElementById('audio-prise-rdv').currentTime = 0;">
          <i class="bi bi-arrow-counterclockwise"></i>
        </button>
      </div>

      <div class="mt-3 p-3 bg-light rounded-3">
        <small class="text-muted d-block">
          <i class="bi bi-info-circle me-1"></i>
          <strong>Conseil :</strong> Écoutez cette formation dans un environnement calme pour une meilleure concentration.
        </small>
      </div>
    </div>
  </div>
</div>

<style>
  .audio-player-wrapper audio {
    filter: sepia(20%) saturate(70%) grayscale(1) contrast(99%) invert(12%);
  }

  .audio-player-wrapper audio::-webkit-media-controls-panel {
    background-color: #f8f9fa;
  }

  .audio-player-wrapper audio::-webkit-media-controls-play-button {
    background-color: #667eea;
    border-radius: 50%;
  }
</style>

## Introduction

La gestion des objections est l'une des compétences les plus importantes dans la vente. Une objection n'est pas un refus, c'est une demande d'information supplémentaire ou de réassurance.

## Les 3 types d'objections principales

### 1. L'objection sur le prix
- "C'est trop cher"
- "Je n'ai pas le budget"
- Technique : Valoriser le ROI et les économies à long terme

### 2. L'objection sur le timing
- "Ce n'est pas le bon moment"
- "Je dois réfléchir"
- Technique : Créer l'urgence de manière subtile

### 3. L'objection sur la confiance
- "Je ne vous connais pas"
- "J'ai besoin de vérifier"
- Technique : Apporter des preuves sociales et témoignages

## La méthode CRAC

**C**larifier : Poser des questions pour comprendre la vraie objection
**R**eformuler : Montrer que vous avez compris
**A**rgumenter : Apporter une réponse adaptée
**C**onclure : Proposer l'étape suivante

## Exercices pratiques

1. Listez vos 5 objections les plus fréquentes
2. Préparez une réponse CRAC pour chacune
3. Entraînez-vous avec un collègue ou votre référent

## Points clés à retenir

✅ Une objection = une opportunité de vente
✅ Écoutez activement avant de répondre
✅ Ne prenez jamais une objection personnellement
✅ Préparez vos réponses à l'avance
✅ Pratiquez régulièrement`;

    const result = await prisma.trainingModule.update({
      where: {
        id: 'cmlxugkk80005qdiczuq1dw85'
      },
      data: {
        content: newContent,
        updatedAt: new Date()
      }
    });

    console.log('✅ Module 6 mis à jour avec succès !');
    console.log('Titre :', result.title);
    console.log('Ordre :', result.order);
    console.log('Lecteur audio ajouté : AUDIO-2026-02-26-20-01-01.m4a');
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour :', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateModule6WithAudio();
