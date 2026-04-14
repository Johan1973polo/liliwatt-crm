const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const module5Content = `<div class="module-hero bg-gradient-success text-white p-4 rounded-3 mb-4">
  <div class="d-flex align-items-center mb-3">
    <i class="bi bi-headset" style="font-size: 3rem;"></i>
    <div class="ms-3">
      <h1 class="mb-0">Argumentaire téléphonique (R1)</h1>
      <p class="mb-0 opacity-75">Maîtrisez les 6 étapes d'un appel commercial réussi</p>
    </div>
  </div>
</div>

<div class="alert alert-warning border-0 shadow-sm">
  <h5 class="alert-heading"><i class="bi bi-exclamation-triangle me-2"></i>Document confidentiel</h5>
  <p class="mb-0">Ce document est à usage interne uniquement. LILIWATT en est le propriétaire. Il ne peut être transmis à des tiers.</p>
</div>

<hr class="my-5">

<!-- LES 6 ÉTAPES -->
<div class="section-block">
  <h2 class="section-title">
    <span class="badge bg-primary me-2">Introduction</span>
    <i class="bi bi-list-ol me-2"></i>Les 6 étapes d'un appel LILIWATT
  </h2>

  <div class="card border-0 shadow-lg mb-4">
    <div class="card-body p-4">
      <p class="lead">Un appel LILIWATT suit <strong>6 étapes structurées</strong> pour maximiser vos chances de succès :</p>

      <div class="row g-3">
        <div class="col-md-6">
          <div class="card bg-primary bg-opacity-10 border-primary h-100">
            <div class="card-body d-flex align-items-center">
              <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 50px; height: 50px; flex-shrink: 0;">
                <strong style="font-size: 1.5rem;">1</strong>
              </div>
              <div>
                <h6 class="mb-0">Accroche maîtrisée</h6>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card bg-info bg-opacity-10 border-info h-100">
            <div class="card-body d-flex align-items-center">
              <div class="bg-info text-white rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 50px; height: 50px; flex-shrink: 0;">
                <strong style="font-size: 1.5rem;">2</strong>
              </div>
              <div>
                <h6 class="mb-0">Qualification stratégique</h6>
                <small class="text-muted">Identification décisionnaire, informations...</small>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card bg-warning bg-opacity-25 border-warning h-100">
            <div class="card-body d-flex align-items-center">
              <div class="bg-warning text-dark rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 50px; height: 50px; flex-shrink: 0;">
                <strong style="font-size: 1.5rem;">3</strong>
              </div>
              <div>
                <h6 class="mb-0">Éveil du besoin</h6>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card bg-success bg-opacity-10 border-success h-100">
            <div class="card-body d-flex align-items-center">
              <div class="bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 50px; height: 50px; flex-shrink: 0;">
                <strong style="font-size: 1.5rem;">4</strong>
              </div>
              <div>
                <h6 class="mb-0">Récupération de factures</h6>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card bg-danger bg-opacity-10 border-danger h-100">
            <div class="card-body d-flex align-items-center">
              <div class="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 50px; height: 50px; flex-shrink: 0;">
                <strong style="font-size: 1.5rem;">5</strong>
              </div>
              <div>
                <h6 class="mb-0">Préparation closing</h6>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card bg-dark bg-opacity-10 border-dark h-100">
            <div class="card-body d-flex align-items-center">
              <div class="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 50px; height: 50px; flex-shrink: 0;">
                <strong style="font-size: 1.5rem;">6</strong>
              </div>
              <div>
                <h6 class="mb-0">Prise de rendez-vous ferme</h6>
                <small class="text-muted">Simulation obligatoire</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="alert alert-danger border-0 shadow-sm mt-4 mb-0">
        <h6><i class="bi bi-star-fill me-2"></i>Point critique</h6>
        <p class="mb-0">Les <strong>premières secondes</strong> conditionnent en grande partie le résultat de la vente. C'est une étape clé, car <strong>vous n'aurez pas deux fois l'occasion de faire une bonne première impression</strong>. Veillez à bien travailler votre accroche.</p>
      </div>
    </div>
  </div>
</div>

<style>
  .module-hero {
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  }
  .section-title {
    color: #2c3e50;
    font-weight: 700;
    margin-bottom: 1.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 3px solid #43e97b;
  }
  .bg-gradient-success {
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  }
</style>`;

async function updateModule5() {
  try {
    console.log('🔍 Recherche du Module 5...');
    
    const module5 = await prisma.trainingModule.findFirst({
      where: { order: 5 }
    });

    if (!module5) {
      console.error('❌ Module 5 non trouvé');
      return;
    }

    console.log('📝 Mise à jour du Module 5:', module5.title);
    
    await prisma.trainingModule.update({
      where: { id: module5.id },
      data: { content: module5Content }
    });

    console.log('✅ Module 5 mis à jour avec succès !');
    console.log('👉 Le nouveau contenu sera visible sur https://crm-televendeur.vercel.app');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateModule5();
