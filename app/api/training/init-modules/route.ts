import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  try {
    // Vérifier si les modules existent déjà
    const existingModules = await prisma.trainingModule.count();
    if (existingModules > 0) {
      return NextResponse.json({
        message: `${existingModules} modules déjà initialisés`,
        count: existingModules
      });
    }

    // Créer les 9 modules de formation
    const modules = [
      {
        order: 1,
        title: 'Architecture du marché de l\'énergie',
        description: 'Maîtrisez les fondamentaux du marché de l\'énergie pour conseiller efficacement vos clients professionnels',
        icon: 'bi-lightning-charge',
        durationEstimated: 45,
        content: `<div class="module-hero bg-gradient-primary text-white p-4 rounded-3 mb-4">
  <div class="d-flex align-items-center mb-3">
    <i class="bi bi-lightning-charge-fill" style="font-size: 3rem;"></i>
    <div class="ms-3">
      <h1 class="mb-0">Architecture du marché de l'énergie</h1>
      <p class="mb-0 opacity-75">Les fondamentaux pour briller en commercial B2B</p>
    </div>
  </div>
</div>

<div class="alert alert-primary border-0 shadow-sm">
  <h4 class="alert-heading"><i class="bi bi-bullseye me-2"></i>🎯 Objectifs du module</h4>
  <p class="mb-2">À l'issue de ce module, vous serez capable de :</p>
  <ul class="mb-0">
    <li><i class="bi bi-check-circle-fill text-success me-2"></i>Expliquer clairement le fonctionnement du marché de l'énergie à un client</li>
    <li><i class="bi bi-check-circle-fill text-success me-2"></i>Identifier les acteurs clés et leur rôle dans la chaîne de valeur</li>
    <li><i class="bi bi-check-circle-fill text-success me-2"></i>Comprendre la différence entre fourniture et acheminement</li>
    <li><i class="bi bi-check-circle-fill text-success me-2"></i>Utiliser ce savoir pour renforcer votre crédibilité commerciale</li>
  </ul>
</div>

<hr class="my-5">

<div class="section-block">
  <h2 class="section-title">
    <span class="badge bg-primary me-2">1</span>
    <i class="bi bi-globe me-2"></i>Vue d'ensemble : Comment fonctionne le marché de l'énergie ?
  </h2>

  <div class="card border-0 shadow-sm mb-4">
    <div class="card-body">
      <p class="lead">Le marché de l'énergie en France est <strong class="text-primary">libéralisé</strong> depuis 2007. Cela signifie que les entreprises peuvent choisir librement leur fournisseur d'électricité et de gaz.</p>
    </div>
  </div>

  <div class="alert alert-info border-0 shadow-sm">
    <h5><i class="bi bi-info-circle-fill me-2"></i>🟦 À savoir</h5>
    <p class="mb-0">Contrairement à ce que pensent beaucoup de clients, <strong>EDF et Engie ne sont pas les seuls acteurs</strong>. Il existe plus de 40 fournisseurs alternatifs en France (TotalEnergies, Vattenfall, Ekwateur, etc.).</p>
  </div>

  <div class="row g-3 my-4">
    <div class="col-md-6">
      <div class="card h-100 border-success border-2">
        <div class="card-body text-center">
          <i class="bi bi-lightning-charge text-success" style="font-size: 2.5rem;"></i>
          <h5 class="mt-3">La fourniture</h5>
          <p class="text-muted mb-0">Achat et vente de l'énergie<br>(rôle du fournisseur)</p>
        </div>
      </div>
    </div>
    <div class="col-md-6">
      <div class="card h-100 border-primary border-2">
        <div class="card-body text-center">
          <i class="bi bi-diagram-3 text-primary" style="font-size: 2.5rem;"></i>
          <h5 class="mt-3">L'acheminement</h5>
          <p class="text-muted mb-0">Transport et distribution de l'énergie<br>(rôle des gestionnaires de réseau)</p>
        </div>
      </div>
    </div>
  </div>

  <div class="card bg-light border-0 shadow-sm">
    <div class="card-body">
      <h5 class="mb-3"><i class="bi bi-diagram-2 me-2"></i>Schéma mental à retenir</h5>
      <div class="d-flex flex-wrap align-items-center justify-content-center gap-2">
        <span class="badge bg-secondary p-3">Production</span>
        <i class="bi bi-arrow-right fs-4"></i>
        <span class="badge bg-info p-3">Transport (RTE/GRTgaz)</span>
        <i class="bi bi-arrow-right fs-4"></i>
        <span class="badge bg-primary p-3">Distribution (Enedis/GRDF)</span>
        <i class="bi bi-arrow-right fs-4"></i>
        <span class="badge bg-success p-3">Fourniture</span>
        <i class="bi bi-arrow-right fs-4"></i>
        <span class="badge bg-warning text-dark p-3">Client final</span>
      </div>
    </div>
  </div>
</div>

<hr class="my-5">

<div class="section-block">
  <h2 class="section-title">
    <span class="badge bg-primary me-2">2</span>
    <i class="bi bi-people me-2"></i>Les acteurs clés du marché
  </h2>

  <div class="accordion" id="acteursAccordion">
    <div class="accordion-item">
      <h2 class="accordion-header">
        <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#producteurs">
          <i class="bi bi-lightning-fill text-warning me-3" style="font-size: 1.5rem;"></i>
          <strong>A. Les producteurs d'énergie</strong>
        </button>
      </h2>
      <div id="producteurs" class="accordion-collapse collapse show" data-bs-parent="#acteursAccordion">
        <div class="accordion-body">
          <ul class="list-unstyled">
            <li class="mb-2"><i class="bi bi-circle-fill text-primary me-2" style="font-size: 0.5rem;"></i><strong>Rôle :</strong> Produire l'électricité (centrales nucléaires, éoliennes, solaire, hydraulique)</li>
            <li class="mb-2"><i class="bi bi-circle-fill text-primary me-2" style="font-size: 0.5rem;"></i><strong>Exemples :</strong> EDF Production, Engie Green, producteurs indépendants</li>
            <li class="mb-2"><i class="bi bi-circle-fill text-primary me-2" style="font-size: 0.5rem;"></i><strong>Impact pour vous :</strong> Les clients ne traitent jamais directement avec eux</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="accordion-item">
      <h2 class="accordion-header">
        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#gestionnaires">
          <i class="bi bi-diagram-3-fill text-info me-3" style="font-size: 1.5rem;"></i>
          <strong>B. Les gestionnaires de réseau</strong>
        </button>
      </h2>
      <div id="gestionnaires" class="accordion-collapse collapse" data-bs-parent="#acteursAccordion">
        <div class="accordion-body">
          <div class="row g-3">
            <div class="col-md-6">
              <div class="card border-primary">
                <div class="card-header bg-primary text-white">
                  <i class="bi bi-lightning me-2"></i>Pour l'électricité
                </div>
                <div class="card-body">
                  <p class="mb-2"><strong>RTE :</strong> Réseau de Transport d'Électricité (haute tension)</p>
                  <p class="mb-0"><strong>Enedis :</strong> Gestionnaire du réseau de distribution (moyenne et basse tension)</p>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="card border-success">
                <div class="card-header bg-success text-white">
                  <i class="bi bi-fuel-pump me-2"></i>Pour le gaz
                </div>
                <div class="card-body">
                  <p class="mb-2"><strong>GRTgaz :</strong> Gestionnaire du réseau de transport</p>
                  <p class="mb-0"><strong>GRDF :</strong> Gestionnaire du réseau de distribution</p>
                </div>
              </div>
            </div>
          </div>

          <div class="alert alert-success border-0 shadow-sm mt-3">
            <h6><i class="bi bi-lightbulb-fill me-2"></i>🟩 Méthode LILIWATT</h6>
            <p class="mb-2"><strong>Astuce de vente :</strong></p>
            <p class="mb-0">Expliquez à vos clients que <strong>les gestionnaires de réseau sont les mêmes pour tous</strong>. Peu importe le fournisseur choisi, c'est toujours Enedis qui intervient en cas de panne électrique. <strong>Cela rassure les clients inquiets de changer de fournisseur.</strong></p>
          </div>
        </div>
      </div>
    </div>

    <div class="accordion-item">
      <h2 class="accordion-header">
        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#fournisseurs">
          <i class="bi bi-shop text-success me-3" style="font-size: 1.5rem;"></i>
          <strong>C. Les fournisseurs d'énergie</strong>
        </button>
      </h2>
      <div id="fournisseurs" class="accordion-collapse collapse" data-bs-parent="#acteursAccordion">
        <div class="accordion-body">
          <ul class="list-unstyled">
            <li class="mb-2"><i class="bi bi-circle-fill text-success me-2" style="font-size: 0.5rem;"></i><strong>Rôle :</strong> Acheter l'énergie sur le marché de gros et la revendre aux clients finaux</li>
            <li class="mb-2"><i class="bi bi-circle-fill text-success me-2" style="font-size: 0.5rem;"></i><strong>Exemples :</strong> EDF, Engie, TotalEnergies, Vattenfall, Ekwateur, Eni, etc.</li>
            <li class="mb-2"><i class="bi bi-circle-fill text-success me-2" style="font-size: 0.5rem;"></i><strong>Impact pour vous :</strong> C'est votre terrain de jeu commercial</li>
          </ul>

          <div class="alert alert-warning border-0 shadow-sm">
            <h6><i class="bi bi-exclamation-triangle-fill me-2"></i>⚠️ Erreur fréquente</h6>
            <p class="mb-0">Beaucoup de vendeurs confondent <strong>Enedis</strong> (gestionnaire de réseau) et <strong>Engie</strong> (fournisseur). <strong>Ne faites jamais cette erreur devant un client, cela tue votre crédibilité.</strong></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<hr class="my-5">

<div class="section-block">
  <h2 class="section-title">
    <span class="badge bg-primary me-2">3</span>
    <i class="bi bi-currency-euro me-2"></i>Fourniture vs Acheminement : la distinction essentielle
  </h2>

  <div class="row g-4">
    <div class="col-lg-6">
      <div class="card border-success border-3 h-100">
        <div class="card-header bg-success text-white">
          <h5 class="mb-0"><i class="bi bi-check-circle me-2"></i>Fourniture (partie variable)</h5>
        </div>
        <div class="card-body">
          <table class="table table-borderless mb-0">
            <tr>
              <td width="80"><i class="bi bi-person-fill text-success fs-4"></i></td>
              <td><strong>Qui ?</strong><br>Le fournisseur choisi par le client</td>
            </tr>
            <tr>
              <td><i class="bi bi-cash-stack text-success fs-4"></i></td>
              <td><strong>Quoi ?</strong><br>Le prix de l'énergie consommée (€/kWh ou €/MWh)</td>
            </tr>
            <tr>
              <td><i class="bi bi-graph-up-arrow text-success fs-4"></i></td>
              <td><strong>Négociable ?</strong><br><span class="badge bg-success">OUI</span> → C'est là que vous intervenez !</td>
            </tr>
          </table>
        </div>
      </div>
    </div>

    <div class="col-lg-6">
      <div class="card border-danger border-3 h-100">
        <div class="card-header bg-danger text-white">
          <h5 class="mb-0"><i class="bi bi-lock-fill me-2"></i>Acheminement (partie régulée)</h5>
        </div>
        <div class="card-body">
          <table class="table table-borderless mb-0">
            <tr>
              <td width="80"><i class="bi bi-diagram-3 text-danger fs-4"></i></td>
              <td><strong>Qui ?</strong><br>Enedis/GRDF (imposé, pas de choix)</td>
            </tr>
            <tr>
              <td><i class="bi bi-signpost-2 text-danger fs-4"></i></td>
              <td><strong>Quoi ?</strong><br>Le coût d'utilisation du réseau (TURPE)</td>
            </tr>
            <tr>
              <td><i class="bi bi-x-circle text-danger fs-4"></i></td>
              <td><strong>Négociable ?</strong><br><span class="badge bg-danger">NON</span> → Tarif fixé par la CRE</td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  </div>

  <div class="card bg-light border-0 shadow-sm mt-4">
    <div class="card-body">
      <h5><i class="bi bi-brain me-2"></i>🧠 Exercice pratique</h5>
      <p>Imaginez que vous êtes au téléphone avec un dirigeant qui vous dit :</p>
      <blockquote class="blockquote border-start border-5 border-primary ps-3 py-2 bg-white">
        <p class="mb-0"><em>"Je suis chez EDF depuis 20 ans, si je change, qui va venir réparer en cas de panne ?"</em></p>
      </blockquote>
      <p class="fw-bold mt-3">Quelle est votre réponse ?</p>
      <div class="collapse" id="reponseExercice">
        <div class="alert alert-success">
          <h6>✅ Réponse modèle :</h6>
          <p class="mb-0">"Excellente question ! En fait, que vous soyez chez EDF, TotalEnergies ou tout autre fournisseur, <strong>c'est toujours Enedis qui gère le réseau et les interventions techniques</strong>. Le fournisseur, c'est uniquement pour la partie commerciale et facturation. Donc aucun risque de ce côté-là, vous gardez exactement le même service technique !"</p>
        </div>
      </div>
      <button class="btn btn-primary btn-sm" type="button" data-bs-toggle="collapse" data-bs-target="#reponseExercice">
        <i class="bi bi-eye me-1"></i> Voir la réponse modèle
      </button>
    </div>
  </div>
</div>

<hr class="my-5">

<div class="card border-0 shadow-lg bg-gradient-success text-white">
  <div class="card-body p-4">
    <h3 class="mb-4"><i class="bi bi-bookmark-star-fill me-2"></i>📌 Résumé express (à retenir absolument)</h3>
    <div class="row g-3">
      <div class="col-md-6">
        <div class="d-flex align-items-start">
          <i class="bi bi-check-circle-fill fs-3 me-3"></i>
          <div>Le marché est <strong>libéralisé</strong> : les clients peuvent choisir leur fournisseur</div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="d-flex align-items-start">
          <i class="bi bi-check-circle-fill fs-3 me-3"></i>
          <div><strong>Fourniture</strong> (négociable) ≠ <strong>Acheminement</strong> (régulé)</div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="d-flex align-items-start">
          <i class="bi bi-check-circle-fill fs-3 me-3"></i>
          <div>Enedis/GRDF gèrent le réseau <strong>pour tous les fournisseurs</strong></div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="d-flex align-items-start">
          <i class="bi bi-check-circle-fill fs-3 me-3"></i>
          <div>La CRE régule le marché et garantit la concurrence</div>
        </div>
      </div>
      <div class="col-12">
        <div class="d-flex align-items-start">
          <i class="bi bi-check-circle-fill fs-3 me-3"></i>
          <div>Maîtriser ces bases = <strong>crédibilité + confiance = conversion</strong></div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .module-hero {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
  .section-title {
    color: #2c3e50;
    font-weight: 700;
    margin-bottom: 1.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 3px solid #3498db;
  }
  .bg-gradient-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
  .bg-gradient-success {
    background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  }
</style>`
      },
      {
        order: 2,
        title: 'Lecture experte d\'une facture',
        description: 'Décryptez une facture d\'énergie en 60 secondes et détectez instantanément les leviers d\'économies',
        icon: 'bi-file-earmark-text',
        durationEstimated: 40,
        content: `<div class="module-hero bg-gradient-info text-white p-4 rounded-3 mb-4">
  <div class="d-flex align-items-center mb-3">
    <i class="bi bi-file-earmark-text-fill" style="font-size: 3rem;"></i>
    <div class="ms-3">
      <h1 class="mb-0">Lecture experte d'une facture</h1>
      <p class="mb-0 opacity-75">Décryptez une facture en 60 secondes et détectez les leviers d'économies</p>
    </div>
  </div>
</div>

<div class="alert alert-primary border-0 shadow-sm">
  <h4 class="alert-heading"><i class="bi bi-bullseye me-2"></i>🎯 Objectifs du module</h4>
  <p class="mb-2">À l'issue de ce module, vous serez capable de :</p>
  <ul class="mb-0">
    <li><i class="bi bi-check-circle-fill text-success me-2"></i>Analyser une facture d'électricité ou de gaz en moins de 60 secondes</li>
    <li><i class="bi bi-check-circle-fill text-success me-2"></i>Identifier les **3 zones critiques** qui déterminent le potentiel d'économies</li>
    <li><i class="bi bi-check-circle-fill text-success me-2"></i>Détecter les anomalies et incohérences (surfacturation, mauvais tarif, etc.)</li>
    <li><i class="bi bi-check-circle-fill text-success me-2"></i>Pitcher une opportunité commerciale en vous appuyant sur les chiffres de la facture</li>
  </ul>
</div>

<hr class="my-5">

<div class="section-block">
  <h2 class="section-title">
    <span class="badge bg-primary me-2">1</span>
    <i class="bi bi-file-text me-2"></i>Anatomie d'une facture : les 3 zones essentielles
  </h2>

  <p class="lead">Une facture d'énergie se divise toujours en <strong class="text-primary">3 grandes zones</strong> :</p>

  <div class="row g-4 mt-3">
    <div class="col-md-4">
      <div class="card border-primary border-2 h-100">
        <div class="card-header bg-primary text-white text-center">
          <i class="bi bi-1-circle-fill fs-3"></i>
          <h5 class="mt-2 mb-0">Informations contractuelles</h5>
        </div>
        <div class="card-body">
          <p class="small text-muted mb-2">📍 <strong>Où ?</strong> En haut de la facture</p>
          <p class="small mb-2"><strong>Ce qu'on y trouve :</strong></p>
          <ul class="small">
            <li>Nom du fournisseur actuel</li>
            <li>Numéro de contrat</li>
            <li>Numéro PCE (gaz) ou PDL (électricité)</li>
            <li>Date de début/fin du contrat</li>
            <li>Type d'offre</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="col-md-4">
      <div class="card border-success border-2 h-100">
        <div class="card-header bg-success text-white text-center">
          <i class="bi bi-2-circle-fill fs-3"></i>
          <h5 class="mt-2 mb-0">Consommation et puissance</h5>
        </div>
        <div class="card-body">
          <p class="small text-muted mb-2">📍 <strong>Où ?</strong> Au milieu de la facture</p>
          <p class="small mb-2"><strong>Ce qu'on y trouve :</strong></p>
          <ul class="small">
            <li>Consommation annuelle (kWh/MWh)</li>
            <li>Puissance souscrite (kVA)</li>
            <li>Relève réelle ou estimée</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="col-md-4">
      <div class="card border-danger border-2 h-100">
        <div class="card-header bg-danger text-white text-center">
          <i class="bi bi-3-circle-fill fs-3"></i>
          <h5 class="mt-2 mb-0">Décomposition tarifaire</h5>
        </div>
        <div class="card-body">
          <p class="small text-muted mb-2">📍 <strong>La plus importante !</strong></p>
          <p class="small mb-2"><strong>Les 4 lignes principales :</strong></p>
          <ul class="small">
            <li>Abonnement (€/an)</li>
            <li>Consommation (€/kWh) ✅</li>
            <li>Acheminement (TURPE)</li>
            <li>Taxes et contributions</li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <div class="alert alert-info border-0 shadow-sm mt-4">
    <h5><i class="bi bi-info-circle-fill me-2"></i>🟦 À savoir</h5>
    <p class="mb-2">Le <strong>numéro PDL (Point de Livraison)</strong> pour l'électricité et le <strong>PCE (Point de Comptage et d'Estimation)</strong> pour le gaz sont <strong>indispensables</strong> pour établir un devis.</p>
    <p class="mb-0">Les <strong>taxes représentent environ 35 à 40% de la facture finale</strong>. Elles sont les mêmes chez tous les fournisseurs.</p>
  </div>
</div>

<hr class="my-5">

<div class="section-block">
  <h2 class="section-title">
    <span class="badge bg-primary me-2">2</span>
    <i class="bi bi-stopwatch me-2"></i>Comment lire une facture en 60 secondes chrono
  </h2>

  <div class="card bg-light border-0 shadow-sm">
    <div class="card-body">
      <h5 class="mb-4"><i class="bi bi-trophy me-2 text-warning"></i>Méthode LILIWATT en 4 étapes</h5>

      <div class="row g-3">
        <div class="col-md-6">
          <div class="d-flex align-items-start">
            <span class="badge bg-primary rounded-circle p-3 me-3" style="width: 50px; height: 50px; display: flex; align-items: center; justify-content: center;">1</span>
            <div>
              <h6>Identifier le fournisseur et le type d'offre</h6>
              <p class="small text-muted mb-0">⏱️ 10 secondes</p>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="d-flex align-items-start">
            <span class="badge bg-success rounded-circle p-3 me-3" style="width: 50px; height: 50px; display: flex; align-items: center; justify-content: center;">2</span>
            <div>
              <h6>Repérer la consommation annuelle</h6>
              <p class="small mb-1">⏱️ 15 secondes</p>
              <ul class="small mb-0">
                <li>< 10 MWh/an → Petit consommateur</li>
                <li>10-100 MWh/an → Cible privilégiée</li>
                <li>> 100 MWh/an → Opportunité premium</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="d-flex align-items-start">
            <span class="badge bg-warning text-dark rounded-circle p-3 me-3" style="width: 50px; height: 50px; display: flex; align-items: center; justify-content: center;">3</span>
            <div>
              <h6>Vérifier le prix du kWh</h6>
              <p class="small text-muted mb-0">⏱️ 20 secondes</p>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="d-flex align-items-start">
            <span class="badge bg-info rounded-circle p-3 me-3" style="width: 50px; height: 50px; display: flex; align-items: center; justify-content: center;">4</span>
            <div>
              <h6>Calculer le potentiel d'économies</h6>
              <p class="small text-muted mb-1">⏱️ 15 secondes</p>
              <code class="small">Économie = (Prix actuel - Votre prix) × Conso</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<hr class="my-5">

<div class="section-block">
  <h2 class="section-title">
    <span class="badge bg-primary me-2">3</span>
    <i class="bi bi-exclamation-triangle me-2"></i>Les 5 anomalies à détecter (opportunités commerciales)
  </h2>

  <div class="row g-3">
    <div class="col-md-6">
      <div class="card border-0 shadow-sm h-100">
        <div class="card-header bg-danger text-white">
          <i class="bi bi-1-circle-fill me-2"></i>Client encore au tarif réglementé
        </div>
        <div class="card-body">
          <p class="mb-2"><strong>Action :</strong> Faire basculer vers une offre de marché immédiatement</p>
        </div>
      </div>
    </div>

    <div class="col-md-6">
      <div class="card border-0 shadow-sm h-100">
        <div class="card-header bg-warning text-dark">
          <i class="bi bi-2-circle-fill me-2"></i>Puissance souscrite inadaptée
        </div>
        <div class="card-body">
          <p class="mb-2"><strong>Action :</strong> Proposer un audit énergétique</p>
        </div>
      </div>
    </div>

    <div class="col-md-6">
      <div class="card border-0 shadow-sm h-100">
        <div class="card-header bg-info text-white">
          <i class="bi bi-3-circle-fill me-2"></i>Consommations estimées depuis plusieurs mois
        </div>
        <div class="card-body">
          <p class="mb-2"><strong>Action :</strong> Alerter sur un risque de régularisation importante</p>
        </div>
      </div>
    </div>

    <div class="col-md-6">
      <div class="card border-0 shadow-sm h-100">
        <div class="card-header bg-success text-white">
          <i class="bi bi-4-circle-fill me-2"></i>Prix au-dessus du marché
        </div>
        <div class="card-body">
          <p class="mb-2"><strong>Action :</strong> Démontrer immédiatement le potentiel d'économies</p>
        </div>
      </div>
    </div>

    <div class="col-12">
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-primary text-white">
          <i class="bi bi-5-circle-fill me-2"></i>Fin de contrat proche
        </div>
        <div class="card-body">
          <p class="mb-2"><strong>Action :</strong> <span class="badge bg-danger">URGENCE COMMERCIALE</span> → Le client va être sollicité par tous les fournisseurs</p>
        </div>
      </div>
    </div>
  </div>
</div>

<hr class="my-5">

<div class="section-block">
  <h2 class="section-title">
    <span class="badge bg-success me-2">4</span>
    <i class="bi bi-file-pdf me-2"></i>Exemples de factures réelles par catégorie
  </h2>

  <div class="alert alert-success border-0 shadow-sm mb-4">
    <h5><i class="bi bi-lightbulb-fill me-2"></i>🟩 Formation pratique</h5>
    <p class="mb-0">Cliquez sur les onglets ci-dessous pour visualiser des <strong>exemples de factures réelles</strong> selon les différentes catégories tarifaires. Utilisez ces exemples pour vous entraîner à détecter les zones clés et les anomalies !</p>
  </div>

  <ul class="nav nav-pills nav-fill mb-4" id="facturesTabs" role="tablist">
    <li class="nav-item" role="presentation">
      <button class="nav-link active" id="base-tab" data-bs-toggle="pill" data-bs-target="#base" type="button" role="tab">
        <i class="bi bi-file-text me-2"></i>BASE / C5
      </button>
    </li>
    <li class="nav-item" role="presentation">
      <button class="nav-link" id="c4-tab" data-bs-toggle="pill" data-bs-target="#c4" type="button" role="tab">
        <i class="bi bi-file-earmark-text me-2"></i>C4
      </button>
    </li>
    <li class="nav-item" role="presentation">
      <button class="nav-link" id="c3-tab" data-bs-toggle="pill" data-bs-target="#c3" type="button" role="tab">
        <i class="bi bi-file-earmark-check me-2"></i>C3
      </button>
    </li>
    <li class="nav-item" role="presentation">
      <button class="nav-link" id="c2-tab" data-bs-toggle="pill" data-bs-target="#c2" type="button" role="tab">
        <i class="bi bi-file-earmark-bar-graph me-2"></i>C2
      </button>
    </li>
  </ul>

  <div class="tab-content" id="facturesTabContent">
    <!-- BASE / C5 -->
    <div class="tab-pane fade show active" id="base" role="tabpanel">
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-primary text-white">
          <h5 class="mb-0"><i class="bi bi-info-circle me-2"></i>Factures BASE et C5 (HP/HC)</h5>
        </div>
        <div class="card-body">
          <ul class="nav nav-tabs mb-3" id="baseTabs" role="tablist">
            <li class="nav-item" role="presentation">
              <button class="nav-link active" id="base1-tab" data-bs-toggle="tab" data-bs-target="#base1" type="button" role="tab">
                BASE (Exemple 1)
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button class="nav-link" id="base2-tab" data-bs-toggle="tab" data-bs-target="#base2" type="button" role="tab">
                BASE (Exemple 2)
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button class="nav-link" id="hphc-tab" data-bs-toggle="tab" data-bs-target="#hphc" type="button" role="tab">
                C5 HP/HC
              </button>
            </li>
          </ul>

          <div class="tab-content" id="baseTabContent">
            <div class="tab-pane fade show active" id="base1" role="tabpanel">
              <div class="text-center">
                <embed src="/factures/BASE BASE(1)pdf.pdf" type="application/pdf" width="100%" height="800px" />
                <a href="/factures/BASE BASE(1)pdf.pdf" download class="btn btn-primary mt-3">
                  <i class="bi bi-download me-2"></i>Télécharger cette facture
                </a>
              </div>
            </div>

            <div class="tab-pane fade" id="base2" role="tabpanel">
              <div class="text-center">
                <embed src="/factures/BASE (2).pdf" type="application/pdf" width="100%" height="800px" />
                <a href="/factures/BASE (2).pdf" download class="btn btn-primary mt-3">
                  <i class="bi bi-download me-2"></i>Télécharger cette facture
                </a>
              </div>
            </div>

            <div class="tab-pane fade" id="hphc" role="tabpanel">
              <div class="text-center">
                <embed src="/factures/C5 HP HC.pdf" type="application/pdf" width="100%" height="800px" />
                <a href="/factures/C5 HP HC.pdf" download class="btn btn-primary mt-3">
                  <i class="bi bi-download me-2"></i>Télécharger cette facture
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- C4 -->
    <div class="tab-pane fade" id="c4" role="tabpanel">
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-success text-white">
          <h5 class="mb-0"><i class="bi bi-info-circle me-2"></i>Factures C4</h5>
        </div>
        <div class="card-body">
          <ul class="nav nav-tabs mb-3" id="c4Tabs" role="tablist">
            <li class="nav-item" role="presentation">
              <button class="nav-link active" id="c4-1-tab" data-bs-toggle="tab" data-bs-target="#c4-1" type="button" role="tab">
                C4 (Exemple 1)
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button class="nav-link" id="c4-2-tab" data-bs-toggle="tab" data-bs-target="#c4-2" type="button" role="tab">
                C4 (Exemple 2)
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button class="nav-link" id="c4-3-tab" data-bs-toggle="tab" data-bs-target="#c4-3" type="button" role="tab">
                C4 (Exemple 3)
              </button>
            </li>
          </ul>

          <div class="tab-content" id="c4TabContent">
            <div class="tab-pane fade show active" id="c4-1" role="tabpanel">
              <div class="text-center">
                <embed src="/factures/C4.pdf" type="application/pdf" width="100%" height="800px" />
                <a href="/factures/C4.pdf" download class="btn btn-success mt-3">
                  <i class="bi bi-download me-2"></i>Télécharger cette facture
                </a>
              </div>
            </div>

            <div class="tab-pane fade" id="c4-2" role="tabpanel">
              <div class="text-center">
                <embed src="/factures/C4(2).pdf" type="application/pdf" width="100%" height="800px" />
                <a href="/factures/C4(2).pdf" download class="btn btn-success mt-3">
                  <i class="bi bi-download me-2"></i>Télécharger cette facture
                </a>
              </div>
            </div>

            <div class="tab-pane fade" id="c4-3" role="tabpanel">
              <div class="text-center">
                <embed src="/factures/C4(3).pdf" type="application/pdf" width="100%" height="800px" />
                <a href="/factures/C4(3).pdf" download class="btn btn-success mt-3">
                  <i class="bi bi-download me-2"></i>Télécharger cette facture
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- C3 -->
    <div class="tab-pane fade" id="c3" role="tabpanel">
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-warning text-dark">
          <h5 class="mb-0"><i class="bi bi-info-circle me-2"></i>Facture C3</h5>
        </div>
        <div class="card-body">
          <div class="text-center">
            <embed src="/factures/C3.pdf" type="application/pdf" width="100%" height="800px" />
            <a href="/factures/C3.pdf" download class="btn btn-warning mt-3">
              <i class="bi bi-download me-2"></i>Télécharger cette facture
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- C2 -->
    <div class="tab-pane fade" id="c2" role="tabpanel">
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-danger text-white">
          <h5 class="mb-0"><i class="bi bi-info-circle me-2"></i>Facture C2</h5>
        </div>
        <div class="card-body">
          <div class="text-center">
            <embed src="/factures/C2.pdf" type="application/pdf" width="100%" height="800px" />
            <a href="/factures/C2.pdf" download class="btn btn-danger mt-3">
              <i class="bi bi-download me-2"></i>Télécharger cette facture
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<hr class="my-5">

<div class="card border-0 shadow-lg bg-gradient-info text-white">
  <div class="card-body p-4">
    <h3 class="mb-4"><i class="bi bi-bookmark-star-fill me-2"></i>📌 Résumé express (à retenir absolument)</h3>
    <div class="row g-3">
      <div class="col-md-6">
        <div class="d-flex align-items-start">
          <i class="bi bi-check-circle-fill fs-3 me-3"></i>
          <div>Une facture = <strong>3 zones</strong> : Infos contractuelles, Consommation, Décomposition tarifaire</div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="d-flex align-items-start">
          <i class="bi bi-check-circle-fill fs-3 me-3"></i>
          <div><strong>PDL/PCE</strong> = identifiants uniques du compteur (indispensables pour devis)</div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="d-flex align-items-start">
          <i class="bi bi-check-circle-fill fs-3 me-3"></i>
          <div>Seules <strong>2 lignes sont négociables</strong> : Abonnement + Consommation</div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="d-flex align-items-start">
          <i class="bi bi-check-circle-fill fs-3 me-3"></i>
          <div><strong>5 anomalies clés</strong> = 5 opportunités commerciales immédiates</div>
        </div>
      </div>
      <div class="col-12">
        <div class="d-flex align-items-start">
          <i class="bi bi-check-circle-fill fs-3 me-3"></i>
          <div>Maîtriser la lecture de facture = <strong>crédibilité instantanée + closing facilité</strong></div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .module-hero {
    background: linear-gradient(135deg, #00c6ff 0%, #0072ff 100%);
  }
  .section-title {
    color: #2c3e50;
    font-weight: 700;
    margin-bottom: 1.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 3px solid #3498db;
  }
  .bg-gradient-info {
    background: linear-gradient(135deg, #00c6ff 0%, #0072ff 100%);
  }
  .nav-pills .nav-link {
    font-weight: 600;
  }
  .nav-pills .nav-link.active {
    background-color: #0072ff;
  }
</style>`
      },
      {
        order: 3,
        title: 'Comprendre la dynamique des prix',
        description: 'Anticipez les évolutions du marché et argumentez vos offres avec des données factuelles',
        icon: 'bi-graph-up-arrow',
        durationEstimated: 90,
        content: `<div class="module-hero bg-gradient-warning text-white p-4 rounded-3 mb-4">
  <div class="d-flex align-items-center mb-3">
    <i class="bi bi-graph-up-arrow" style="font-size: 3rem;"></i>
    <div class="ms-3">
      <h1 class="mb-0">Comprendre la dynamique des prix</h1>
      <p class="mb-0 opacity-75">Maîtrisez les marchés de gros et argumentez avec des données factuelles</p>
    </div>
  </div>
</div>

<div class="alert alert-primary border-0 shadow-sm">
  <h4 class="alert-heading"><i class="bi bi-bullseye me-2"></i>🎯 Objectifs du module</h4>
  <p class="mb-2">Le collaborateur doit comprendre :</p>
  <div class="row g-2 mt-2">
    <div class="col-md-6">
      <div class="d-flex align-items-center gap-2">
        <i class="bi bi-check-circle-fill text-success"></i>
        <span><strong>Volatilité du marché</strong></span>
      </div>
    </div>
    <div class="col-md-6">
      <div class="d-flex align-items-center gap-2">
        <i class="bi bi-check-circle-fill text-success"></i>
        <span><strong>Influence du gaz</strong></span>
      </div>
    </div>
    <div class="col-md-6">
      <div class="d-flex align-items-center gap-2">
        <i class="bi bi-check-circle-fill text-success"></i>
        <span><strong>Impact géopolitique</strong></span>
      </div>
    </div>
    <div class="col-md-6">
      <div class="d-flex align-items-center gap-2">
        <i class="bi bi-check-circle-fill text-success"></i>
        <span><strong>Investissements nucléaires</strong></span>
      </div>
    </div>
    <div class="col-md-6">
      <div class="d-flex align-items-center gap-2">
        <i class="bi bi-check-circle-fill text-success"></i>
        <span><strong>Développement renouvelable</strong></span>
      </div>
    </div>
  </div>
  <div class="alert alert-success border-0 mt-3 mb-0">
    <p class="mb-0"><i class="bi bi-trophy text-warning me-2"></i><strong>Objectif :</strong> Être capable de justifier les hausses de prix sans discours approximatif.</p>
  </div>
</div>

<hr class="my-5">

<!-- SECTION 1 : L'ÉLECTRICITÉ SUR LES MARCHÉS DE GROS -->
<div class="section-block">
  <h2 class="section-title">
    <span class="badge bg-warning text-dark me-2">1</span>
    <i class="bi bi-cash-coin me-2"></i>L'électricité sur les marchés de gros
  </h2>

  <!-- Prix dans les pays d'Europe -->
  <div class="card border-0 shadow-sm mb-4">
    <div class="card-header bg-primary text-white">
      <h4 class="mb-0"><i class="bi bi-globe-europe-africa me-2"></i>Prix dans les pays d'Europe</h4>
    </div>
    <div class="card-body">
      <div class="row align-items-center">
        <div class="col-md-6">
          <div class="card bg-success bg-opacity-10 border-success h-100">
            <div class="card-body text-center">
              <i class="bi bi-arrow-down-circle text-success" style="font-size: 3rem;"></i>
              <h5 class="mt-3 text-success">Prix les moins chers</h5>
              <p class="mb-0"><strong>Zone Suède</strong></p>
              <small class="text-muted">Grâce aux énergies renouvelables (hydraulique, éolien)</small>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card bg-danger bg-opacity-10 border-danger h-100">
            <div class="card-body text-center">
              <i class="bi bi-arrow-up-circle text-danger" style="font-size: 3rem;"></i>
              <h5 class="mt-3 text-danger">Prix les plus élevés</h5>
              <p class="mb-0"><strong>Zone Pologne</strong></p>
              <p class="fs-4 fw-bold text-danger mb-0">118 €/MWh</p>
              <small class="text-muted">Forte dépendance au charbon</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Prix des contrats futures en France -->
  <div class="card border-0 shadow-sm mb-4">
    <div class="card-header bg-info text-white">
      <h4 class="mb-0"><i class="bi bi-calendar-range me-2"></i>Prix des contrats futures en France</h4>
    </div>
    <div class="card-body">
      <p class="mb-3">Pour les prochaines années, le prix de l'électricité cote en moyenne à :</p>
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead class="table-dark">
            <tr>
              <th>Année</th>
              <th class="text-center">Base (€/MWh)</th>
              <th class="text-center">Peak (€/MWh)</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><strong>2026</strong></td><td class="text-center">60,16 €</td><td class="text-center">69,25 €</td></tr>
            <tr><td><strong>2027</strong></td><td class="text-center">59,82 €</td><td class="text-center">70,73 €</td></tr>
            <tr><td><strong>2028</strong></td><td class="text-center">63,38 €</td><td class="text-center">75,5 €</td></tr>
            <tr><td><strong>2029</strong></td><td class="text-center">69,52 €</td><td class="text-center">80,55 €</td></tr>
            <tr><td><strong>2030</strong></td><td class="text-center">70,1 €</td><td class="text-center">-</td></tr>
            <tr><td><strong>2031</strong></td><td class="text-center">69,38 €</td><td class="text-center">-</td></tr>
            <tr><td><strong>2032</strong></td><td class="text-center">69,12 €</td><td class="text-center">-</td></tr>
            <tr><td><strong>2033</strong></td><td class="text-center">69,84 €</td><td class="text-center">-</td></tr>
            <tr><td><strong>2034</strong></td><td class="text-center">70,46 €</td><td class="text-center">-</td></tr>
            <tr><td><strong>2035</strong></td><td class="text-center">71,08 €</td><td class="text-center">-</td></tr>
          </tbody>
        </table>
      </div>
      <div class="alert alert-info border-0 mt-3">
        <p class="mb-0"><i class="bi bi-info-circle-fill me-2"></i>D'un trimestre à l'autre, de fortes variations sont observées. Il est courant de voir des <strong>prix élevés en hiver</strong> et des <strong>prix plus bas au printemps</strong>.</p>
      </div>
    </div>
  </div>

  <!-- Historique complet des prix -->
  <div class="card border-0 shadow-lg mb-4">
    <div class="card-header bg-dark text-white">
      <h4 class="mb-0"><i class="bi bi-clock-history me-2"></i>Historique des prix de l'électricité sur les marchés</h4>
    </div>
    <div class="card-body">
      <div class="alert alert-warning border-0 mb-4">
        <p class="mb-0"><strong>Rappel historique :</strong> Le prix SPOT de l'électricité est resté proche du prix de l'ARENH entre 2012 et 2020 avant de subir une très forte augmentation à partir de 2021.</p>
      </div>

      <div class="alert alert-danger border-0 mb-4">
        <h5 class="alert-heading"><i class="bi bi-exclamation-triangle-fill me-2"></i>Record historique</h5>
        <p class="mb-0">Le record de prix mensuel observé dans l'histoire des échanges SPOT de la bourse EPEX a été atteint en <strong>août 2022</strong>, au cœur de la crise de l'énergie, où le prix moyen de l'électricité avait atteint <span class="fs-3 fw-bold text-danger">492 €/MWh</span></p>
      </div>

      <h5 class="mb-3"><i class="bi bi-table me-2"></i>Évolution du prix SPOT moyen annuel de l'électricité en France</h5>
      <div class="table-responsive">
        <table class="table table-striped table-bordered">
          <thead class="table-dark">
            <tr>
              <th>Année</th>
              <th class="text-end">Prix Day-ahead moyen</th>
              <th class="text-end">Évolution</th>
              <th>Contexte</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><strong>2012</strong></td><td class="text-end">46,9 €/MWh</td><td class="text-end">--</td><td><span class="badge bg-secondary">Référence</span></td></tr>
            <tr><td><strong>2013</strong></td><td class="text-end">43,3 €/MWh</td><td class="text-end text-success">-7,7%</td><td></td></tr>
            <tr><td><strong>2014</strong></td><td class="text-end">34,6 €/MWh</td><td class="text-end text-success">-20,1%</td><td></td></tr>
            <tr><td><strong>2015</strong></td><td class="text-end">38,6 €/MWh</td><td class="text-end text-danger">+11,6%</td><td></td></tr>
            <tr><td><strong>2016</strong></td><td class="text-end">36,7 €/MWh</td><td class="text-end text-success">-4,9%</td><td></td></tr>
            <tr><td><strong>2017</strong></td><td class="text-end">44,9 €/MWh</td><td class="text-end text-danger">+22,3%</td><td></td></tr>
            <tr><td><strong>2018</strong></td><td class="text-end">50,2 €/MWh</td><td class="text-end text-danger">+11,8%</td><td></td></tr>
            <tr><td><strong>2019</strong></td><td class="text-end">39,5 €/MWh</td><td class="text-end text-success">-21,3%</td><td></td></tr>
            <tr class="table-info"><td><strong>2020</strong></td><td class="text-end">32,2 €/MWh</td><td class="text-end text-success">-18,5%</td><td><span class="badge bg-info">COVID-19</span></td></tr>
            <tr class="table-warning"><td><strong>2021</strong></td><td class="text-end fw-bold">109,2 €/MWh</td><td class="text-end text-danger fw-bold">+239,1%</td><td><span class="badge bg-warning text-dark">Début crise</span></td></tr>
            <tr class="table-danger"><td><strong>2022</strong></td><td class="text-end fw-bold">275,9 €/MWh</td><td class="text-end text-danger fw-bold">+152,8%</td><td><span class="badge bg-danger">Guerre Ukraine</span></td></tr>
            <tr class="table-success"><td><strong>2023</strong></td><td class="text-end">97 €/MWh</td><td class="text-end text-success">-64,8%</td><td><span class="badge bg-success">Retour à la normale</span></td></tr>
            <tr class="table-success"><td><strong>2024</strong></td><td class="text-end">58 €/MWh</td><td class="text-end text-success">-40,2%</td><td><span class="badge bg-success">Stabilisation</span></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Analyse 2025 -->
  <div class="card border-0 shadow-sm mb-4">
    <div class="card-header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
      <h4 class="mb-0"><i class="bi bi-graph-up me-2"></i>Analyse 2025 : La forme en W</h4>
    </div>
    <div class="card-body">
      <p class="lead">Si on trace l'évolution mensuelle des prix en 2025, <strong class="text-primary">la forme en W est évidente</strong> parce que l'année a alterné entre pics et creux sans vraie stabilisation.</p>

      <div class="row g-3 mb-3">
        <div class="col-md-3">
          <div class="card bg-danger bg-opacity-10 border-danger">
            <div class="card-body text-center p-3">
              <small class="text-muted">Janvier-Février</small>
              <h3 class="text-danger mb-0">122 €</h3>
              <small>Pic annuel</small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-success bg-opacity-10 border-success">
            <div class="card-body text-center p-3">
              <small class="text-muted">Mai</small>
              <h3 class="text-success mb-0">19 €</h3>
              <small>Point bas</small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-warning bg-opacity-25 border-warning">
            <div class="card-body text-center p-3">
              <small class="text-muted">Été</small>
              <p class="mb-0">Remontée puis rechute sept.</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-danger bg-opacity-10 border-danger">
            <div class="card-body text-center p-3">
              <small class="text-muted">Décembre</small>
              <h3 class="text-danger mb-0">69 €</h3>
              <small>Nouveau sommet</small>
            </div>
          </div>
        </div>
      </div>

      <div class="alert alert-primary border-0">
        <p class="mb-0"><i class="bi bi-lightbulb-fill me-2"></i>Cette succession <strong>hausse → chute → reprise → rechute → reprise</strong> s'explique par des chocs d'offre et de demande, mais aussi la saisonnalité.</p>
      </div>
    </div>
  </div>

  <!-- Analyses 2024, 2023, 2022, 2021, 2020 -->
  <div class="accordion" id="historicalAnalysis">
    <!-- 2024 -->
    <div class="accordion-item border-0 shadow-sm mb-2">
      <h2 class="accordion-header">
        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#year2024">
          <i class="bi bi-calendar3 text-success me-3 fs-4"></i>
          <strong>2024 : Poursuite de la baisse (-40%)</strong>
        </button>
      </h2>
      <div id="year2024" class="accordion-collapse collapse" data-bs-parent="#historicalAnalysis">
        <div class="accordion-body">
          <p>En 2024, les prix de l'électricité sur les marchés de gros ont continué de baisser, poursuivant la tendance amorcée depuis fin 2022.</p>
          <ul>
            <li>Le <strong>prix spot moyen français</strong> a chuté de <strong class="text-success">40 % par rapport à 2023</strong>, passant de <strong>97 €/MWh à 58 €/MWh</strong></li>
            <li>Retour à un niveau similaire à celui d'<strong>avant les crises sanitaires et énergétiques</strong></li>
          </ul>
          <div class="alert alert-success border-0">
            <h6><i class="bi bi-check-circle-fill me-2"></i>Facteurs de cette baisse :</h6>
            <ul class="mb-0">
              <li>Amélioration de la production bas-carbone à coût réduit</li>
              <li>Reprise de la production nucléaire</li>
              <li>Année favorable pour l'hydroélectricité</li>
              <li>Développement des énergies renouvelables</li>
            </ul>
          </div>
          <p class="mb-0"><i class="bi bi-info-circle me-2"></i>Les prix à terme ont également diminué, mais restent supérieurs à ceux observés avant la crise.</p>
        </div>
      </div>
    </div>

    <!-- 2023 -->
    <div class="accordion-item border-0 shadow-sm mb-2">
      <h2 class="accordion-header">
        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#year2023">
          <i class="bi bi-calendar3 text-info me-3 fs-4"></i>
          <strong>2023 : Retour progressif à la normale (-65%)</strong>
        </button>
      </h2>
      <div id="year2023" class="accordion-collapse collapse" data-bs-parent="#historicalAnalysis">
        <div class="accordion-body">
          <p>L'année 2023 a marqué un retour progressif à la normale des prix de l'électricité sur les marchés, après les records de 2021 et 2022.</p>
          <ul>
            <li>Le prix spot moyen a diminué de manière significative : <strong class="text-success">-65 % par rapport à 2022</strong>, à <strong>97 €/MWh</strong></li>
            <li>Malgré cette réduction, la <strong>volatilité</strong> des prix est restée élevée</li>
            <li>Pics de prix lors des périodes de forte demande hivernale : <strong>204,9 €/MWh en janvier 2023</strong></li>
          </ul>
          <div class="alert alert-warning border-0">
            <p class="mb-2"><strong>Contexte :</strong></p>
            <ul class="mb-0">
              <li>Les pays européens ont amélioré la sécurité d'approvisionnement</li>
              <li>Incertitude liée aux coûts variables (gaz, quotas carbone)</li>
              <li>Augmentation de la part des énergies renouvelables</li>
              <li>Reprise de la production nucléaire (malgré problèmes de corrosion)</li>
            </ul>
          </div>
          <p class="mb-0"><i class="bi bi-graph-down me-2"></i>Depuis la fin de l'été 2023, diminution significative de la <strong>prime de risque</strong> sur les prix à terme, marquant un apaisement des tensions.</p>
        </div>
      </div>
    </div>

    <!-- 2022 -->
    <div class="accordion-item border-0 shadow-sm mb-2">
      <h2 class="accordion-header">
        <button class="accordion-button collapsed bg-danger bg-opacity-10" type="button" data-bs-toggle="collapse" data-bs-target="#year2022">
          <i class="bi bi-exclamation-triangle-fill text-danger me-3 fs-4"></i>
          <strong>2022 : L'année record (+153%)</strong>
        </button>
      </h2>
      <div id="year2022" class="accordion-collapse collapse" data-bs-parent="#historicalAnalysis">
        <div class="accordion-body">
          <p class="lead text-danger">L'année 2022 restera gravée dans l'histoire du marché de l'électricité comme celle où les prix spot ont atteint des sommets jamais observés.</p>

          <div class="alert alert-danger border-0">
            <h6><i class="bi bi-exclamation-octagon-fill me-2"></i>Événements exceptionnels :</h6>
            <ul class="mb-0">
              <li><strong>Problèmes de corrosion des centrales nucléaires françaises</strong> → arrêt de près de la moitié du parc nucléaire d'EDF</li>
              <li><strong>France forcée de s'approvisionner sur les marchés</strong> → impact amplifié de la hausse des prix du gaz</li>
              <li><strong>Sécheresse exceptionnelle de l'été 2022</strong> → baisse de production d'hydroélectricité</li>
              <li><strong>Guerre en Ukraine</strong> → crise gazière en Europe</li>
            </ul>
          </div>

          <div class="card bg-light border-0 mt-3">
            <div class="card-body">
              <h6><i class="bi bi-gear me-2"></i>Contexte de long terme :</h6>
              <ul class="mb-2">
                <li><strong>Transition énergétique :</strong> Abandon des combustibles fossiles au profit des renouvelables</li>
                <li><strong>Objectif 2030 :</strong> 50% nucléaire + 50% production renouvelable</li>
                <li><strong>Rénovation des réacteurs nucléaires :</strong>
                  <ul>
                    <li>55 milliards d'euros estimés par EDF</li>
                    <li>100 milliards d'euros selon la Cour des Comptes</li>
                    <li>Prolonger la durée de vie de 40 à 60 ans</li>
                    <li>Éviter les risques type Fukushima</li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>

          <div class="alert alert-info border-0 mt-3">
            <p class="mb-0"><i class="bi bi-info-circle-fill me-2"></i>La crise gazière a eu un impact majeur sur les coûts de production d'électricité, particulièrement en raison de l'augmentation des prix du gaz et des quotas de CO2.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 2021 -->
    <div class="accordion-item border-0 shadow-sm mb-2">
      <h2 class="accordion-header">
        <button class="accordion-button collapsed bg-warning bg-opacity-25" type="button" data-bs-toggle="collapse" data-bs-target="#year2021">
          <i class="bi bi-calendar3 text-warning me-3 fs-4"></i>
          <strong>2021 : Le début de la crise (+239%)</strong>
        </button>
      </h2>
      <div id="year2021" class="accordion-collapse collapse" data-bs-parent="#historicalAnalysis">
        <div class="accordion-body">
          <p>L'année 2021 s'est soldée par une hausse record de <strong class="text-danger">+329%</strong> du prix de l'électricité sur les marchés.</p>

          <div class="alert alert-warning border-0">
            <h6><i class="bi bi-lightning-fill me-2"></i>Contexte :</h6>
            <ul class="mb-0">
              <li>L'été 2021 a été marqué par une pression accrue sur le marché</li>
              <li>Records de prix journaliers dans de nombreux pays européens</li>
              <li>La France a pu profiter de son parc nucléaire disponible pour maintenir des prix compétitifs</li>
              <li>Augmentation des exportations françaises</li>
            </ul>
          </div>

          <div class="row g-2 mt-3">
            <div class="col-md-6">
              <div class="card border-danger">
                <div class="card-body text-center">
                  <small class="text-muted">Novembre 2021</small>
                  <h4 class="text-danger mb-0">217 €/MWh</h4>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="card border-danger">
                <div class="card-body text-center">
                  <small class="text-muted">Décembre 2021</small>
                  <h4 class="text-danger mb-0">274,6 €/MWh</h4>
                </div>
              </div>
            </div>
          </div>

          <p class="mt-3 mb-0">La fin d'année a été particulièrement difficile avec une demande croissante face à une baisse de la production nucléaire et de l'énergie éolienne.</p>
        </div>
      </div>
    </div>

    <!-- 2020 -->
    <div class="accordion-item border-0 shadow-sm mb-2">
      <h2 class="accordion-header">
        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#year2020">
          <i class="bi bi-calendar3 text-primary me-3 fs-4"></i>
          <strong>2020 : L'année COVID (-18,5%)</strong>
        </button>
      </h2>
      <div id="year2020" class="accordion-collapse collapse" data-bs-parent="#historicalAnalysis">
        <div class="accordion-body">
          <p>L'année 2020 a été marquée par une <strong>baisse considérable</strong> des prix sur les marchés de l'électricité.</p>

          <div class="alert alert-info border-0">
            <h6><i class="bi bi-virus me-2"></i>Impact COVID-19 :</h6>
            <ul class="mb-0">
              <li>Au plus fort du premier confinement : prix extrêmement bas</li>
              <li>Moyenne en France : <strong>15,3 €/MWh</strong></li>
              <li>Consommation particulièrement faible</li>
              <li>Productions en énergie renouvelable élevées</li>
            </ul>
          </div>

          <div class="card bg-success bg-opacity-10 border-success mt-3">
            <div class="card-body">
              <h6><i class="bi bi-exclamation-diamond me-2"></i>Record historique</h6>
              <p class="mb-2">Le <strong>13 avril 2020</strong> (lundi de Pâques), un prix négatif historique a été observé :</p>
              <h3 class="text-success text-center mb-0">-75,8 €/MWh</h3>
              <p class="text-center small mb-0 mt-2">Consommation très faible + production renouvelable très élevée</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<hr class="my-5">

<!-- SECTION 2 : COMMENT EST FIXÉ LE PRIX DU MWh -->
<div class="section-block">
  <h2 class="section-title">
    <span class="badge bg-warning text-dark me-2">2</span>
    <i class="bi bi-calculator me-2"></i>Comment est fixé le prix du MWh d'électricité sur le marché de gros ?
  </h2>

  <!-- Merit Order -->
  <div class="card border-0 shadow-lg mb-4">
    <div class="card-header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
      <h4 class="mb-0"><i class="bi bi-bar-chart-steps me-2"></i>Les coûts marginaux de production et la logique du « merit order »</h4>
    </div>
    <div class="card-body">
      <div class="alert alert-primary border-0">
        <h6><i class="bi bi-info-circle-fill me-2"></i>Principe du Merit Order</h6>
        <p class="mb-0">Sur le marché SPOT, chaque moyen de production propose un <strong>coût marginal</strong> (le coût d'une unité supplémentaire d'électricité), et est classé par ordre croissant. <strong>C'est la dernière unité de production appelée qui fixe le prix de l'électricité pour l'ensemble.</strong></p>
      </div>

      <h5 class="mt-4 mb-3"><i class="bi bi-sort-numeric-down me-2"></i>Énergies classées par ordre croissant selon les coûts marginaux :</h5>
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead class="table-dark">
            <tr>
              <th width="50">#</th>
              <th>Type d'énergie</th>
              <th class="text-end">Coût marginal</th>
              <th width="100" class="text-center">Priorité</th>
            </tr>
          </thead>
          <tbody>
            <tr class="table-success">
              <td>1</td><td><i class="bi bi-wind me-2"></i>Éolien terrestre</td><td class="text-end"><strong>0 €/MWh</strong></td>
              <td class="text-center"><span class="badge bg-success">Max</span></td>
            </tr>
            <tr class="table-success">
              <td>2</td><td><i class="bi bi-water me-2"></i>Éolien en mer posé</td><td class="text-end"><strong>0 €/MWh</strong></td>
              <td class="text-center"><span class="badge bg-success">Max</span></td>
            </tr>
            <tr class="table-success">
              <td>3</td><td><i class="bi bi-water me-2"></i>Éolien en mer flottant</td><td class="text-end"><strong>0 €/MWh</strong></td>
              <td class="text-center"><span class="badge bg-success">Max</span></td>
            </tr>
            <tr class="table-success">
              <td>4</td><td><i class="bi bi-sun me-2"></i>Solaire au sol</td><td class="text-end"><strong>0 €/MWh</strong></td>
              <td class="text-center"><span class="badge bg-success">Max</span></td>
            </tr>
            <tr class="table-success">
              <td>5</td><td><i class="bi bi-droplet me-2"></i>Hydrolien</td><td class="text-end"><strong>0 €/MWh</strong></td>
              <td class="text-center"><span class="badge bg-success">Max</span></td>
            </tr>
            <tr class="table-success">
              <td>6</td><td><i class="bi bi-moisture me-2"></i>Petite hydroélectricité</td><td class="text-end"><strong>0 €/MWh</strong></td>
              <td class="text-center"><span class="badge bg-success">Max</span></td>
            </tr>
            <tr class="table-success">
              <td>7</td><td><i class="bi bi-fire me-2"></i>Géothermie</td><td class="text-end"><strong>0 €/MWh</strong></td>
              <td class="text-center"><span class="badge bg-success">Max</span></td>
            </tr>
            <tr class="table-primary">
              <td>8</td><td><i class="bi bi-radioactive me-2"></i>Nucléaire EPR</td><td class="text-end"><strong>27,7 €/MWh</strong></td>
              <td class="text-center"><span class="badge bg-primary">Élevée</span></td>
            </tr>
            <tr class="table-primary">
              <td>9</td><td><i class="bi bi-radioactive me-2"></i>Nucléaire</td><td class="text-end"><strong>30 €/MWh</strong></td>
              <td class="text-center"><span class="badge bg-primary">Élevée</span></td>
            </tr>
            <tr class="table-warning">
              <td>10</td><td><i class="bi bi-fire me-2"></i>Gaz naturel</td><td class="text-end"><strong>70 €/MWh</strong></td>
              <td class="text-center"><span class="badge bg-warning text-dark">Moyenne</span></td>
            </tr>
            <tr class="table-danger">
              <td>11</td><td><i class="bi bi-minecart-loaded me-2"></i>Charbon</td><td class="text-end"><strong>86 €/MWh</strong></td>
              <td class="text-center"><span class="badge bg-danger">Faible</span></td>
            </tr>
            <tr class="table-danger">
              <td>12</td><td><i class="bi bi-fuel-pump me-2"></i>Fioul</td><td class="text-end"><strong>162 €/MWh</strong></td>
              <td class="text-center"><span class="badge bg-danger">Très faible</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="alert alert-success border-0 mt-4">
        <h6><i class="bi bi-lightbulb-fill me-2"></i>Comprendre l'amplitude des variations</h6>
        <ul class="mb-0">
          <li>Avec des <strong>coûts marginaux nuls</strong>, les énergies renouvelables sont toujours les premières sollicitées</li>
          <li>Quand le vent souffle ou que le soleil brille et que les EnR suffisent → prix proche de <strong>0€/MWh</strong>, voire négatif</li>
          <li>Un simple basculement vers une centrale à gaz en période de pointe peut faire bondir le tarif de <strong>plusieurs dizaines d'euros par MWh</strong></li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Conditions climatiques -->
  <div class="card border-0 shadow-sm mb-4">
    <div class="card-header bg-info text-white">
      <h4 class="mb-0"><i class="bi bi-cloud-sun me-2"></i>Les conditions climatiques</h4>
    </div>
    <div class="card-body">
      <p class="lead">Les températures extrêmes agissent à <strong>double effet</strong> sur les prix de marché dès lors que l'offre peine à suivre le rythme.</p>

      <div class="row g-3 mb-3">
        <div class="col-md-6">
          <div class="card border-danger border-2">
            <div class="card-header bg-danger text-white text-center">
              <i class="bi bi-snow2 fs-3"></i>
              <h5 class="mb-0 mt-2">Hiver - Froid intense</h5>
            </div>
            <div class="card-body">
              <ul class="mb-0">
                <li>Demande alourdie pour le <strong>chauffage</strong></li>
                <li>Consommation peut dépasser la capacité des centrales de base</li>
                <li>Activation des moyens de production de pointe</li>
                <li>→ <strong class="text-danger">Prix records possibles</strong></li>
              </ul>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card border-warning border-2">
            <div class="card-header bg-warning text-dark text-center">
              <i class="bi bi-thermometer-sun fs-3"></i>
              <h5 class="mb-0 mt-2">Été - Vagues de chaleur</h5>
            </div>
            <div class="card-body">
              <ul class="mb-0">
                <li>Usage massif de la <strong>climatisation</strong></li>
                <li>Demande électrique peut exploser</li>
                <li>Sécheresses affectent la production hydraulique</li>
                <li>Réduction des prélèvements d'eau pour refroidissement nucléaire</li>
                <li>→ <strong class="text-warning">Limitation de l'offre + hausse des prix</strong></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="alert alert-primary border-0">
        <p class="mb-0"><i class="bi bi-info-circle-fill me-2"></i>Les épisodes caniculaires ou de grand froid peuvent ainsi déclencher des <strong>prix records</strong> en limitant simultanément l'offre et en augmentant la demande.</p>
      </div>
    </div>
  </div>

  <!-- Facteurs macroéconomiques et géopolitiques -->
  <div class="card border-0 shadow-sm mb-4">
    <div class="card-header bg-warning text-dark">
      <h4 class="mb-0"><i class="bi bi-globe me-2"></i>Les facteurs macroéconomiques et géopolitiques</h4>
    </div>
    <div class="card-body">
      <div class="row g-3">
        <div class="col-md-6">
          <div class="card bg-light">
            <div class="card-body">
              <h6><i class="bi bi-graph-up me-2"></i>Indicateurs macroéconomiques</h6>
              <ul class="mb-0">
                <li><strong>Taux d'inflation</strong></li>
                <li><strong>Décisions de politique monétaire</strong> (taux d'intérêt directeurs)</li>
                <li><strong>Fluctuations du taux de change euro/dollar</strong></li>
              </ul>
              <p class="mt-2 mb-0 small">→ Un euro affaibli face au dollar renchérit l'importation de charbon ou de gaz libellés en dollars</p>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card bg-light">
            <div class="card-body">
              <h6><i class="bi bi-exclamation-triangle me-2"></i>Crises géopolitiques</h6>
              <ul class="mb-0">
                <li><strong>Conflits armés</strong></li>
                <li><strong>Sanctions internationales</strong></li>
                <li><strong>Perturbation des approvisionnements</strong> en combustibles fossiles</li>
              </ul>
              <p class="mt-2 mb-0 small">→ Hausse des cours du pétrole, du gaz et du charbon</p>
            </div>
          </div>
        </div>
      </div>

      <div class="alert alert-danger border-0 mt-3">
        <h6><i class="bi bi-geo-alt-fill me-2"></i>Cas concret : La Russie et l'approvisionnement européen</h6>
        <p class="mb-2">La Russie détient près de <strong>15% des réserves naturelles de gaz</strong> et assure l'approvisionnement de l'Europe. <strong>Gazprom</strong>, le géant russe, détient le monopole des exportations vers l'Europe par gazoduc.</p>
        <p class="mb-2"><strong>Contexte Nord Stream 2 :</strong></p>
        <ul class="mb-2">
          <li>Le chantier du gazoduc Nord Stream 2 a été longuement retardé par le contexte géopolitique</li>
          <li>Gazprom est soupçonné par l'UE d'avoir réduit ses approvisionnements via l'Ukraine</li>
          <li>Objectif présumé : pousser l'Allemagne à approuver plus rapidement le gazoduc (ce que Gazprom dément)</li>
        </ul>
        <p class="mb-0"><i class="bi bi-exclamation-triangle-fill me-2"></i><strong>Impact :</strong> Tous les marchés n'aiment pas les incertitudes et les tensions → hausse des prix</p>
      </div>
    </div>
  </div>

  <!-- Prix des combustibles -->
  <div class="card border-0 shadow-sm mb-4">
    <div class="card-header bg-success text-white">
      <h4 class="mb-0"><i class="bi bi-fuel-pump me-2"></i>Les prix des combustibles</h4>
    </div>
    <div class="card-body">
      <p class="lead">Le coût de l'énergie primaire est un facteur important dans la formation des prix.</p>

      <div class="row g-3 mb-3">
        <div class="col-md-3">
          <div class="card border-success">
            <div class="card-body text-center">
              <i class="bi bi-sun fs-3 text-warning"></i>
              <h6 class="mt-2">Solaire</h6>
              <p class="text-success fw-bold mb-0">Coût : 0€</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-success">
            <div class="card-body text-center">
              <i class="bi bi-wind fs-3 text-primary"></i>
              <h6 class="mt-2">Éolien</h6>
              <p class="text-success fw-bold mb-0">Coût : 0€</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-warning">
            <div class="card-body text-center">
              <i class="bi bi-fire fs-3 text-danger"></i>
              <h6 class="mt-2">Gaz</h6>
              <p class="text-warning fw-bold mb-0">Variable</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-warning">
            <div class="card-body text-center">
              <i class="bi bi-minecart-loaded fs-3"></i>
              <h6 class="mt-2">Charbon</h6>
              <p class="text-warning fw-bold mb-0">Variable</p>
            </div>
          </div>
        </div>
      </div>

      <div class="alert alert-primary border-0">
        <h6><i class="bi bi-info-circle-fill me-2"></i>Impact sur le marché européen</h6>
        <p class="mb-0">En Europe, le gaz naturel représente toujours une partie importante de la production électrique. Les fluctuations des cours internationaux du <strong>gaz (TTF en Europe)</strong> et du <strong>charbon (API2)</strong> se diffusent rapidement sur le marché de gros de l'électricité.</p>
      </div>
    </div>
  </div>

  <!-- Quotas carbone -->
  <div class="card border-0 shadow-sm mb-4">
    <div class="card-header bg-secondary text-white">
      <h4 class="mb-0"><i class="bi bi-cloud me-2"></i>Les quotas carbone (CO₂)</h4>
    </div>
    <div class="card-body">
      <p class="lead">Dans le cadre du <strong>système européen d'échange de quotas d'émission</strong>, chaque tonne de CO₂ émise est valorisée sur un marché spécialisé.</p>

      <div class="row align-items-center">
        <div class="col-md-8">
          <div class="alert alert-secondary border-0">
            <h6><i class="bi bi-arrow-repeat me-2"></i>Mécanisme</h6>
            <p class="mb-0">Lorsque le prix du quota monte, les exploitants de centrales fossiles <strong>répercutent ce surcoût sur le prix du MWh</strong>.</p>
          </div>
          <ul>
            <li>Incite à réduire les émissions de CO₂</li>
            <li>Rend les énergies fossiles plus coûteuses</li>
            <li>Favorise les investissements dans le bas-carbone</li>
          </ul>
        </div>
        <div class="col-md-4">
          <div class="card bg-secondary bg-opacity-10 border-secondary">
            <div class="card-body text-center">
              <i class="bi bi-cloud-fog2 fs-1 text-secondary"></i>
              <p class="mt-3 mb-2 small">Prix quota CO₂</p>
              <h6 class="text-secondary mb-0">↑ Prix quota<br>↓<br>↑ Prix électricité</h6>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<hr class="my-5">

<!-- SECTION 3 : PRIX DU kWh SUR LE MARCHÉ DE DÉTAIL -->
<div class="section-block">
  <h2 class="section-title">
    <span class="badge bg-warning text-dark me-2">3</span>
    <i class="bi bi-receipt me-2"></i>Comment est fixé le prix du kWh d'électricité sur le marché de détail ?
  </h2>

  <div class="card border-0 shadow-lg">
    <div class="card-body p-4">
      <p class="lead mb-4">Le prix final pour les particuliers et professionnels est la <strong>somme de plusieurs postes de coûts</strong> :</p>

      <div class="row g-3">
        <div class="col-md-4">
          <div class="card border-primary border-2 h-100">
            <div class="card-body text-center">
              <i class="bi bi-lightning-charge fs-2 text-primary"></i>
              <h6 class="mt-3">Coûts d'approvisionnement</h6>
              <ul class="text-start small mt-3">
                <li>Production propre</li>
                <li>ARENH</li>
                <li>Marchés de gros</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card border-success border-2 h-100">
            <div class="card-body text-center">
              <i class="bi bi-diagram-3 fs-2 text-success"></i>
              <h6 class="mt-3">Coûts d'acheminement</h6>
              <p class="text-start small mt-3 mb-0">Transport jusqu'aux compteurs (<strong>TURPE</strong>)</p>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card border-warning border-2 h-100">
            <div class="card-body text-center">
              <i class="bi bi-receipt fs-2 text-warning"></i>
              <h6 class="mt-3">Fiscalité</h6>
              <ul class="text-start small mt-3">
                <li>Accise sur l'électricité</li>
                <li>CTA</li>
                <li>TVA</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card border-info border-2 h-100">
            <div class="card-body text-center">
              <i class="bi bi-shop fs-2 text-info"></i>
              <h6 class="mt-3">Coûts de commercialisation</h6>
              <p class="text-start small mt-3 mb-0">Fonctionnement de l'entreprise, marge comprise</p>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card border-success border-2 h-100">
            <div class="card-body text-center">
              <i class="bi bi-leaf fs-2 text-success"></i>
              <h6 class="mt-3">Garanties d'origine</h6>
              <p class="text-start small mt-3 mb-0">Pour l'électricité verte</p>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card border-secondary border-2 h-100">
            <div class="card-body text-center">
              <i class="bi bi-patch-check fs-2 text-secondary"></i>
              <h6 class="mt-3">Coût des CEE</h6>
              <p class="text-start small mt-3 mb-0">Certificats d'Économies d'Énergie</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<hr class="my-5">

<!-- SECTION 4 : PRIX NÉGATIFS -->
<div class="section-block">
  <h2 class="section-title">
    <span class="badge bg-warning text-dark me-2">4</span>
    <i class="bi bi-question-diamond me-2"></i>Comment expliquer les prix négatifs ?
  </h2>

  <div class="card border-0 shadow-lg mb-4">
    <div class="card-header bg-success text-white">
      <h4 class="mb-0"><i class="bi bi-info-circle me-2"></i>Qu'est-ce qu'un prix négatif ?</h4>
    </div>
    <div class="card-body">
      <p class="lead">Un <strong>tarif négatif</strong> signifie que l'offre disponible excède tellement la demande que certains producteurs doivent, pour éviter l'effondrement de la fréquence, <strong>réduire ou arrêter leur production et même payer pour écouler leur énergie</strong>.</p>

      <div class="alert alert-warning border-0">
        <h6><i class="bi bi-exclamation-triangle-fill me-2"></i>Contrainte technique du réseau</h6>
        <p class="mb-0">En temps réel, le réseau électrique exige que le flux injecté par les centrales soit <strong>exactement égal</strong> à la somme des consommations, plus les pertes Joule (chaleur dissipée). Sans cet équilibre instantané, la fréquence du réseau diverge et risque de provoquer des <strong>coupures générales</strong>.</p>
      </div>

      <div class="row g-3 mt-3">
        <div class="col-md-6">
          <div class="card bg-light border-0">
            <div class="card-body">
              <h6><i class="bi bi-calendar2-week me-2"></i>Quand apparaissent les prix négatifs ?</h6>
              <ul class="mb-0">
                <li>Production éolienne et solaire très élevée</li>
                <li>Demande faible (weekend, jours fériés)</li>
                <li>Printemps et automne (températures douces)</li>
                <li>Milieu de journée (pic solaire)</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card bg-light border-0">
            <div class="card-body">
              <h6><i class="bi bi-graph-down me-2"></i>Évolution attendue</h6>
              <p class="mb-2">Avec l'extension des installations photovoltaïques :</p>
              <ul class="mb-0">
                <li>Prix négatifs dès <strong>mars et novembre</strong></li>
                <li>Ajustements horaires réguliers</li>
                <li>Orientation vers l'ouest pour les panneaux</li>
                <li>Répartition de la production tout au long de la journée</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="row g-3">
    <div class="col-md-4">
      <div class="card border-danger">
        <div class="card-header bg-danger text-white">
          <h6 class="mb-0"><i class="bi bi-factory me-2"></i>Côté producteur</h6>
        </div>
        <div class="card-body">
          <ul class="mb-2 small">
            <li>Génère une <strong>perte sèche</strong></li>
            <li>Moins d'intérêt à vendre sur le marché SPOT</li>
            <li>Frein aux investissements</li>
          </ul>
          <p class="mb-0 small"><strong>Exception :</strong> Les installations avec Obligation d'Achat (OA) restent gagnantes car rémunérées indépendamment des cours.</p>
        </div>
      </div>
    </div>

    <div class="col-md-4">
      <div class="card border-success">
        <div class="card-header bg-success text-white">
          <h6 class="mb-0"><i class="bi bi-lightning-fill me-2"></i>Flexibilité</h6>
        </div>
        <div class="card-body">
          <p class="small mb-2">Les parcs renouvelables offrent une grande souplesse d'arrêt :</p>
          <ul class="mb-0 small">
            <li>Champ solaire : <strong>< 1 minute</strong></li>
            <li>Éolienne : <strong>2-3 minutes</strong></li>
          </ul>
        </div>
      </div>
    </div>

    <div class="col-md-4">
      <div class="card border-primary">
        <div class="card-header bg-primary text-white">
          <h6 class="mb-0"><i class="bi bi-people me-2"></i>Côté consommateur</h6>
        </div>
        <div class="card-body">
          <p class="small mb-2">Pour encourager le déplacement de la consommation :</p>
          <ul class="mb-0 small">
            <li>Heures creuses (nuit/après-midi)</li>
            <li>Options à effacement (EJP, Tempo)</li>
            <li>Options horosaisonnières</li>
          </ul>
          <p class="small mb-0 mt-2"><i class="bi bi-exclamation-circle me-1"></i>Ces dispositifs nécessitent une révision pour s'adapter au nouveau profil de production.</p>
        </div>
      </div>
    </div>
  </div>
</div>

<hr class="my-5">

<!-- SECTION 5 : FONCTIONNEMENT DU MARCHÉ DE GROS -->
<div class="section-block">
  <h2 class="section-title">
    <span class="badge bg-warning text-dark me-2">5</span>
    <i class="bi bi-building me-2"></i>Fonctionnement et organisation du marché de gros de l'électricité
  </h2>

  <div class="card border-0 shadow-lg mb-4">
    <div class="card-body p-4">
      <p class="lead">Le marché de gros de l'électricité constitue le <strong>lieu central</strong> où s'ajustent en continu l'offre et la demande de mégawattheures avant livraison aux utilisateurs finaux.</p>

      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card bg-primary bg-opacity-10 border-primary text-center h-100">
            <div class="card-body">
              <i class="bi bi-lightning fs-2 text-primary"></i>
              <h6 class="mt-2">Producteurs</h6>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-success bg-opacity-10 border-success text-center h-100">
            <div class="card-body">
              <i class="bi bi-shop fs-2 text-success"></i>
              <h6 class="mt-2">Fournisseurs</h6>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-warning bg-opacity-25 border-warning text-center h-100">
            <div class="card-body">
              <i class="bi bi-briefcase fs-2 text-warning"></i>
              <h6 class="mt-2">Négociants</h6>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-info bg-opacity-10 border-info text-center h-100">
            <div class="card-body">
              <i class="bi bi-sliders fs-2 text-info"></i>
              <h6 class="mt-2">Opérateurs d'équilibrage</h6>
            </div>
          </div>
        </div>
      </div>

      <div class="alert alert-primary border-0">
        <h6><i class="bi bi-check-circle-fill me-2"></i>Objectifs du marché de gros :</h6>
        <ul class="mb-0">
          <li>Garantir la <strong>sécurisation des approvisionnements</strong> pour les fournisseurs</li>
          <li>Optimiser l'utilisation des <strong>capacités de production</strong></li>
          <li>Offrir une <strong>formation de prix transparente</strong></li>
          <li>Refléter la raréfaction ou l'abondance de l'énergie</li>
          <li>Intégrer les aléas techniques, économiques et réglementaires</li>
        </ul>
      </div>

      <div class="row g-3 mt-3">
        <div class="col-md-6">
          <div class="card border-success">
            <div class="card-header bg-success text-white">
              <h6 class="mb-0"><i class="bi bi-truck me-2"></i>Transactions physiques</h6>
            </div>
            <div class="card-body">
              <p class="mb-0">L'électricité est <strong>effectivement injectée</strong> sur le réseau aux points d'échange.</p>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card border-warning">
            <div class="card-header bg-warning text-dark">
              <h6 class="mb-0"><i class="bi bi-cash-coin me-2"></i>Transactions financières</h6>
            </div>
            <div class="card-body">
              <p class="mb-0">Seuls des <strong>contrats de règlement monétaire</strong> sont échangés (pas de livraison physique).</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- EPEX SPOT -->
  <div class="card border-0 shadow-lg mb-4">
    <div class="card-header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
      <h4 class="mb-0"><i class="bi bi-building me-2"></i>Zoom sur EPEX SPOT : La principale bourse européenne</h4>
    </div>
    <div class="card-body">
      <div class="row align-items-center mb-3">
        <div class="col-md-8">
          <p class="lead mb-3"><strong>EPEX SPOT</strong> est une bourse d'électricité qui joue un rôle majeur dans le commerce de l'électricité en Europe.</p>
          <ul class="mb-0">
            <li>Fruit de la fusion des activités de marché au comptant de l'<strong>EEX allemand</strong> et de <strong>Powernext français</strong></li>
            <li>Couvre <strong>13 pays européens</strong></li>
            <li><strong>1/3 de la consommation annuelle d'électricité</strong> du continent y est échangée</li>
            <li>Près de <strong>350 entreprises</strong> participantes</li>
          </ul>
        </div>
        <div class="col-md-4">
          <div class="card bg-primary bg-opacity-10 border-primary">
            <div class="card-body text-center">
              <i class="bi bi-graph-up-arrow fs-1 text-primary"></i>
              <p class="mt-3 mb-0 fw-bold">EPEX SPOT crée les signaux de prix qui déclenchent des décisions à tous les niveaux du système électrique</p>
            </div>
          </div>
        </div>
      </div>

      <div class="alert alert-info border-0">
        <h6><i class="bi bi-people-fill me-2"></i>Participants :</h6>
        <div class="row">
          <div class="col-md-6">
            <ul class="mb-0">
              <li>Producteurs d'électricité</li>
              <li>Fournisseurs d'électricité</li>
            </ul>
          </div>
          <div class="col-md-6">
            <ul class="mb-0">
              <li>Opérateurs de réseau</li>
              <li>Consommateurs industriels</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Marché à terme -->
  <div class="card border-0 shadow-lg mb-4">
    <div class="card-header bg-dark text-white">
      <h4 class="mb-0"><i class="bi bi-calendar-range me-2"></i>Le marché à terme : sécurisation des positions</h4>
    </div>
    <div class="card-body">
      <p class="lead">Le marché à terme est une plateforme d'échange où les transactions d'achat ou de vente d'électricité sont <strong>planifiées pour une date ultérieure</strong>.</p>

      <div class="alert alert-success border-0">
        <h6><i class="bi bi-shield-check me-2"></i>Avantages :</h6>
        <ul class="mb-0">
          <li>Acheter ou vendre de l'électricité à une <strong>date future</strong> à un <strong>prix défini à l'avance</strong></li>
          <li>Horizons : mensuels, trimestriels ou annuels</li>
          <li>Très utile pour les fournisseurs pour <strong>gérer les risques</strong> liés aux variations des prix</li>
        </ul>
      </div>

      <h5 class="mt-4 mb-3"><i class="bi bi-lightning me-2"></i>Deux types de produits :</h5>

      <div class="row g-3">
        <div class="col-md-6">
          <div class="card border-primary border-2 h-100">
            <div class="card-header bg-primary text-white">
              <h5 class="mb-0"><i class="bi bi-arrow-repeat me-2"></i>Baseload (Base)</h5>
            </div>
            <div class="card-body">
              <p class="mb-2"><strong>Définition :</strong> Reflète la fourniture continue de puissance minimale nécessaire <strong>24 h/24, 7 j/7</strong>.</p>
              <ul class="mb-2">
                <li>Garantit un flux <strong>ininterrompu</strong> d'électricité</li>
                <li>Adapté aux centrales à fort facteur de charge</li>
              </ul>
              <div class="card bg-light border-0">
                <div class="card-body">
                  <h6 class="small mb-2">Exemples de centrales :</h6>
                  <div class="d-flex gap-2 flex-wrap">
                    <span class="badge bg-primary">Nucléaire</span>
                    <span class="badge bg-primary">Hydraulique de barrage</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card border-warning border-2 h-100">
            <div class="card-header bg-warning text-dark">
              <h5 class="mb-0"><i class="bi bi-graph-up me-2"></i>Peakload (Peak)</h5>
            </div>
            <div class="card-body">
              <p class="mb-2"><strong>Définition :</strong> Couvre les <strong>heures de pointe</strong> de consommation (heures ouvrables de la semaine, de 8h à 20h).</p>
              <ul class="mb-2">
                <li>Valorisé <strong>plus haut</strong> que le baseload</li>
                <li>Mobilisation de centrales flexibles</li>
              </ul>
              <div class="card bg-light border-0">
                <div class="card-body">
                  <h6 class="small mb-2">Exemples de centrales :</h6>
                  <div class="d-flex gap-2 flex-wrap">
                    <span class="badge bg-warning text-dark">Gaz</span>
                    <span class="badge bg-warning text-dark">Turbines à combustion</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="alert alert-primary border-0 mt-3">
        <p class="mb-0"><i class="bi bi-info-circle-fill me-2"></i>La différence de valorisation entre <strong>peak et base</strong> constitue un indicateur clé de la tension sur le système et oriente les investissements dans les moyens de flexibilité.</p>
      </div>
    </div>
  </div>
</div>

<hr class="my-5">

<div class="card border-0 shadow-lg bg-gradient-warning text-white">
  <div class="card-body p-4">
    <h3 class="mb-4"><i class="bi bi-bookmark-star-fill me-2"></i>📌 Résumé express (à retenir absolument)</h3>
    <div class="row g-3">
      <div class="col-md-6">
        <div class="d-flex align-items-start">
          <i class="bi bi-check-circle-fill fs-3 me-3"></i>
          <div>Le prix de l'électricité a connu une <strong>volatilité extrême</strong> : de 32€/MWh (2020) à 276€/MWh (2022), retour à 58€/MWh (2024)</div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="d-flex align-items-start">
          <i class="bi bi-check-circle-fill fs-3 me-3"></i>
          <div>Le <strong>merit order</strong> classe les moyens de production par coût marginal croissant (EnR à 0€ → fioul à 162€)</div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="d-flex align-items-start">
          <i class="bi bi-check-circle-fill fs-3 me-3"></i>
          <div><strong>5 facteurs clés</strong> : climat, prix du gaz, disponibilité nucléaire, géopolitique, quotas CO₂</div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="d-flex align-items-start">
          <i class="bi bi-check-circle-fill fs-3 me-3"></i>
          <div>Prix négatifs = <strong>surproduction</strong> renouvelable + faible demande → producteurs paient pour écouler l'énergie</div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="d-flex align-items-start">
          <i class="bi bi-check-circle-fill fs-3 me-3"></i>
          <div><strong>EPEX SPOT</strong> : principale bourse européenne, couvre 13 pays et 1/3 de la consommation du continent</div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="d-flex align-items-start">
          <i class="bi bi-check-circle-fill fs-3 me-3"></i>
          <div>Marché à terme : <strong>Baseload</strong> (24/7) vs <strong>Peakload</strong> (8h-20h jours ouvrés)</div>
        </div>
      </div>
      <div class="col-12">
        <div class="d-flex align-items-start">
          <i class="bi bi-check-circle-fill fs-3 me-3"></i>
          <div>Maîtriser ces mécanismes = <strong>crédibilité maximale + arguments factuels irréfutables = closing facilité</strong></div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .module-hero {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  }
  .section-title {
    color: #2c3e50;
    font-weight: 700;
    margin-bottom: 1.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 3px solid #f5576c;
  }
  .bg-gradient-warning {
    background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  }
  .accordion-button:not(.collapsed) {
    background-color: #f8f9fa;
    color: #000;
  }
</style>`
      },
      {
        order: 4,
        title: 'Psychologie du dirigeant B2B',
        description: 'Comprenez les motivations profondes de vos interlocuteurs pour adapter votre discours',
        icon: 'bi-person-badge',
        durationEstimated: 60,
        content: `<div class="module-hero bg-gradient-primary text-white p-4 rounded-3 mb-4">
  <div class="d-flex align-items-center mb-3">
    <i class="bi bi-person-badge" style="font-size: 3rem;"></i>
    <div class="ms-3">
      <h1 class="mb-0">Psychologie du dirigeant B2B</h1>
      <p class="mb-0 opacity-75">Comprenez les motivations profondes pour adapter votre discours</p>
    </div>
  </div>
</div>

<div class="alert alert-primary border-0 shadow-sm">
  <h4 class="alert-heading"><i class="bi bi-bullseye me-2"></i>🎯 Comprendre</h4>
  <div class="row g-2 mt-2">
    <div class="col-md-4">
      <div class="d-flex align-items-center gap-2">
        <i class="bi bi-telephone-x-fill text-danger"></i>
        <span><strong>La saturation téléphonique</strong></span>
      </div>
    </div>
    <div class="col-md-4">
      <div class="d-flex align-items-center gap-2">
        <i class="bi bi-shield-exclamation text-warning"></i>
        <span><strong>La peur du démarchage</strong></span>
      </div>
    </div>
    <div class="col-md-4">
      <div class="d-flex align-items-center gap-2">
        <i class="bi bi-eye-slash text-info"></i>
        <span><strong>La méfiance naturelle</strong></span>
      </div>
    </div>
  </div>
  <div class="alert alert-success border-0 mt-3 mb-0">
    <p class="mb-0"><i class="bi bi-lightbulb-fill text-warning me-2"></i><strong>Principe fondamental :</strong> Le téléprospecteur ne lutte pas contre les objections. Il les anticipe. En vente et notamment en B2B, <strong>il ne s'agit pas de convaincre, mais de comprendre.</strong></p>
  </div>
</div>

<hr class="my-5">

<!-- INTRODUCTION -->
<div class="section-block">
  <h2 class="section-title">
    <span class="badge bg-primary me-2">Introduction</span>
    <i class="bi bi-brain me-2"></i>La psychologie de la vente
  </h2>

  <div class="card border-0 shadow-lg mb-4">
    <div class="card-body p-4">
      <p class="lead">La psychologie de la vente dévoile les <strong class="text-primary">leviers émotionnels et cognitifs</strong> qui influencent les décideurs. Maîtrisez-les pour créer la confiance, accélérer vos cycles et conclure plus.</p>

      <div class="alert alert-info border-0 shadow-sm">
        <p class="mb-2">La psychologie de la vente n'a rien d'un concept abstrait réservé aux spécialistes du comportement. C'est avant tout <strong>l'art de comprendre ce qui se joue dans la tête de votre interlocuteur</strong> au moment où il s'apprête à dire « NON ».</p>
        <p class="mb-0">Chaque décision d'achat, même en contexte B2B, est le résultat d'un mix entre <strong>logique</strong> et <strong>émotion</strong>. Derrière les chiffres et les tableaux Excel, il y a toujours un être humain avec ses doutes, ses biais et ses intuitions.</p>
      </div>

      <div class="row align-items-center mt-4">
        <div class="col-md-8">
          <div class="card bg-light border-0">
            <div class="card-body">
              <h5 class="mb-3"><i class="bi bi-graph-up me-2"></i>Les études le confirment</h5>
              <p class="mb-0">Près de <strong class="text-danger fs-4">75% des décisions d'achat sont émotionnelles</strong>. C'est dire à quel point les émotions guident nos choix.</p>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="text-center">
            <div class="progress" style="height: 40px;">
              <div class="progress-bar bg-danger" role="progressbar" style="width: 75%;" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100">
                <strong class="fs-5">75%</strong>
              </div>
              <div class="progress-bar bg-primary" role="progressbar" style="width: 25%;" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">
                <strong>25%</strong>
              </div>
            </div>
            <div class="d-flex justify-content-between mt-2">
              <small><i class="bi bi-heart-fill text-danger me-1"></i>Émotionnel</small>
              <small><i class="bi bi-calculator text-primary me-1"></i>Logique</small>
            </div>
          </div>
        </div>
      </div>

      <div class="alert alert-success border-0 shadow-sm mt-4">
        <h6><i class="bi bi-star-fill me-2"></i>L'arme redoutable</h6>
        <p class="mb-0">Comprendre ces mécanismes, c'est vous offrir <strong>la capacité de créer une connexion authentique</strong> avec les prospects et d'adapter son discours à la façon dont ceux-ci perçoivent la valeur, le risque ou la confiance.</p>
      </div>
    </div>
  </div>
</div>

<hr class="my-5">

<!-- SECTION 1 : LA SATURATION TÉLÉPHONIQUE -->
<div class="section-block">
  <h2 class="section-title">
    <span class="badge bg-danger me-2">1</span>
    <i class="bi bi-telephone-x me-2"></i>La saturation téléphonique
  </h2>

  <div class="card border-0 shadow-lg mb-4">
    <div class="card-header bg-danger text-white">
      <h4 class="mb-0"><i class="bi bi-graph-up-arrow me-2"></i>La réalité du dirigeant</h4>
    </div>
    <div class="card-body">
      <p class="lead">Un dirigeant reçoit en moyenne :</p>

      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card bg-danger bg-opacity-10 border-danger text-center h-100">
            <div class="card-body">
              <i class="bi bi-telephone-fill text-danger fs-1"></i>
              <h3 class="text-danger mt-2 mb-1">5-20</h3>
              <small>appels commerciaux<br><strong>/semaine</strong></small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-warning bg-opacity-25 border-warning text-center h-100">
            <div class="card-body">
              <i class="bi bi-envelope-fill text-warning fs-1"></i>
              <h3 class="text-warning mt-2 mb-1">Dizaines</h3>
              <small>d'e-mails<br><strong>/semaine</strong></small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-info bg-opacity-10 border-info text-center h-100">
            <div class="card-body">
              <i class="bi bi-linkedin text-info fs-1"></i>
              <h3 class="text-info mt-2 mb-1">∞</h3>
              <small>sollicitations<br><strong>LinkedIn</strong></small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-secondary bg-opacity-10 border-secondary text-center h-100">
            <div class="card-body">
              <i class="bi bi-arrow-repeat text-secondary fs-1"></i>
              <h3 class="text-secondary mt-2 mb-1">∞</h3>
              <small>relances<br><strong>fournisseurs</strong></small>
            </div>
          </div>
        </div>
      </div>

      <div class="alert alert-danger border-0 shadow-sm">
        <h6><i class="bi bi-shield-x me-2"></i>Son cerveau a développé un filtre automatique :</h6>
        <div class="text-center py-3">
          <span class="badge bg-dark p-3 fs-6">Inconnu</span>
          <i class="bi bi-arrow-right fs-4 mx-2"></i>
          <span class="badge bg-danger p-3 fs-6">Commercial</span>
          <i class="bi bi-arrow-right fs-4 mx-2"></i>
          <span class="badge bg-danger p-3 fs-6">Perte de temps</span>
          <i class="bi bi-arrow-right fs-4 mx-2"></i>
          <span class="badge bg-danger p-3 fs-6">Refus rapide</span>
        </div>
        <p class="mb-0 mt-3 text-center"><strong>Le rejet n'est pas personnel, c'est un mécanisme de défense.</strong></p>
      </div>
    </div>
  </div>

  <!-- Ce qui se passe dans sa tête -->
  <div class="card border-0 shadow-sm mb-4">
    <div class="card-header bg-warning text-dark">
      <h5 class="mb-0"><i class="bi bi-clock me-2"></i>Ce qui se passe dans sa tête dès les 5 premières secondes</h5>
    </div>
    <div class="card-body">
      <div class="row g-3">
        <div class="col-md-6">
          <div class="card bg-light border-0 h-100">
            <div class="card-body">
              <i class="bi bi-question-circle text-primary fs-3"></i>
              <p class="mb-0 mt-2"><em>"Qu'est-ce qu'il me vend ?"</em></p>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card bg-light border-0 h-100">
            <div class="card-body">
              <i class="bi bi-stopwatch text-warning fs-3"></i>
              <p class="mb-0 mt-2"><em>"Combien de temps ça va durer ?"</em></p>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card bg-light border-0 h-100">
            <div class="card-body">
              <i class="bi bi-chat-left-quote text-info fs-3"></i>
              <p class="mb-0 mt-2"><em>"Est-ce que je vais devoir me justifier ?"</em></p>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card bg-light border-0 h-100">
            <div class="card-body">
              <i class="bi bi-hourglass-split text-danger fs-3"></i>
              <p class="mb-0 mt-2"><em>"Je n'ai pas le temps."</em></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Erreurs vs Approche -->
  <div class="row g-4">
    <div class="col-lg-6">
      <div class="card border-danger border-2 h-100">
        <div class="card-header bg-danger text-white">
          <h5 class="mb-0"><i class="bi bi-x-circle me-2"></i>Erreur classique du téléprospecteur</h5>
        </div>
        <div class="card-body">
          <ul class="list-unstyled mb-0">
            <li class="mb-2"><i class="bi bi-x text-danger me-2"></i>Parler trop vite</li>
            <li class="mb-2"><i class="bi bi-x text-danger me-2"></i>Justifier son appel immédiatement</li>
            <li class="mb-2"><i class="bi bi-x text-danger me-2"></i>Trop argumenter</li>
            <li class="mb-2"><i class="bi bi-x text-danger me-2"></i>Se précipiter</li>
          </ul>
          <div class="alert alert-danger border-0 mt-3 mb-0">
            <p class="mb-0"><strong>⚠️ Résultat :</strong> Cela active encore plus son filtre de rejet.</p>
          </div>
        </div>
      </div>
    </div>

    <div class="col-lg-6">
      <div class="card border-success border-2 h-100">
        <div class="card-header bg-success text-white">
          <h5 class="mb-0"><i class="bi bi-check-circle me-2"></i>Approche recommandée</h5>
        </div>
        <div class="card-body">
          <div class="alert alert-success border-0">
            <h6><i class="bi bi-target me-2"></i>Objectif des 20 premières secondes :</h6>
            <ul class="mb-0">
              <li>Désamorcer</li>
              <li>Rassurer</li>
              <li>Montrer que vous comprenez sa situation</li>
            </ul>
          </div>
          <h6 class="mt-3 mb-2">Exemple de posture :</h6>
          <ul class="list-unstyled mb-0">
            <li class="mb-2"><i class="bi bi-check text-success me-2"></i>Ton posé</li>
            <li class="mb-2"><i class="bi bi-check text-success me-2"></i>Débit maîtrisé</li>
            <li class="mb-2"><i class="bi bi-check text-success me-2"></i>Écoute active</li>
            <li class="mb-2"><i class="bi bi-check text-success me-2"></i>Reconnaissance de sa sollicitation</li>
          </ul>
          <div class="alert alert-success border-0 mt-3 mb-0">
            <p class="mb-0"><strong>✅ Le dirigeant doit sentir que vous comprenez son quotidien.</strong></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<hr class="my-5">

<!-- SECTION 2 : LA PEUR DU DÉMARCHAGE -->
<div class="section-block">
  <h2 class="section-title">
    <span class="badge bg-warning text-dark me-2">2</span>
    <i class="bi bi-shield-exclamation me-2"></i>La peur du démarchage
  </h2>

  <div class="card border-0 shadow-lg mb-4">
    <div class="card-header bg-warning text-dark">
      <h4 class="mb-0"><i class="bi bi-exclamation-triangle me-2"></i>Pourquoi cette peur ?</h4>
    </div>
    <div class="card-body">
      <p class="lead mb-4">Le marché a été saturé par :</p>
      <div class="row g-3 mb-4">
        <div class="col-md-4">
          <div class="card bg-danger bg-opacity-10 border-danger text-center h-100">
            <div class="card-body">
              <i class="bi bi-megaphone-fill text-danger fs-2"></i>
              <h6 class="mt-2 mb-0">Des pratiques agressives</h6>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card bg-danger bg-opacity-10 border-danger text-center h-100">
            <div class="card-body">
              <i class="bi bi-chat-square-text-fill text-danger fs-2"></i>
              <h6 class="mt-2 mb-0">Des discours trompeurs</h6>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card bg-danger bg-opacity-10 border-danger text-center h-100">
            <div class="card-body">
              <i class="bi bi-arrow-down-circle-fill text-danger fs-2"></i>
              <h6 class="mt-2 mb-0">Des changements forcés</h6>
            </div>
          </div>
        </div>
      </div>

      <div class="alert alert-danger border-0 shadow-sm">
        <h6><i class="bi bi-arrow-right-circle me-2"></i>Résultat : le dirigeant peut légitimement associer "appel énergie" à :</h6>
        <div class="row g-2 mt-3">
          <div class="col-6"><span class="badge bg-danger w-100 p-2">Piège</span></div>
          <div class="col-6"><span class="badge bg-danger w-100 p-2">Arnaque</span></div>
          <div class="col-6"><span class="badge bg-danger w-100 p-2">Engagement caché</span></div>
          <div class="col-6"><span class="badge bg-danger w-100 p-2">Complexité administrative</span></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Les craintes inconscientes -->
  <div class="card border-0 shadow-sm mb-4">
    <div class="card-header bg-dark text-white">
      <h5 class="mb-0"><i class="bi bi-brain me-2"></i>Les craintes inconscientes du prospect</h5>
    </div>
    <div class="card-body">
      <div class="row g-3">
        <div class="col-md-6">
          <div class="card bg-light border-start border-5 border-danger">
            <div class="card-body">
              <p class="mb-0"><i class="bi bi-chat-quote text-danger me-2"></i><em>"On va me vendre quelque chose."</em></p>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card bg-light border-start border-5 border-danger">
            <div class="card-body">
              <p class="mb-0"><i class="bi bi-emoji-frown text-danger me-2"></i><em>"Je vais regretter."</em></p>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card bg-light border-start border-5 border-danger">
            <div class="card-body">
              <p class="mb-0"><i class="bi bi-tools text-danger me-2"></i><em>"Je vais avoir un problème technique."</em></p>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card bg-light border-start border-5 border-danger">
            <div class="card-body">
              <p class="mb-0"><i class="bi bi-file-text text-danger me-2"></i><em>"On va modifier mon contrat sans mon accord."</em></p>
            </div>
          </div>
        </div>
      </div>

      <div class="alert alert-warning border-0 mt-4 mb-0">
        <p class="mb-0"><strong>⚠️ Important :</strong> Même si votre service est propre, vous devez <strong>neutraliser ses peurs</strong>.</p>
      </div>
    </div>
  </div>

  <!-- Ce qu'il ne faut surtout pas faire -->
  <div class="card border-0 shadow-sm mb-4">
    <div class="card-header bg-danger text-white">
      <h5 class="mb-0"><i class="bi bi-x-octagon me-2"></i>Ce qu'il ne faut surtout pas faire</h5>
    </div>
    <div class="card-body">
      <div class="list-group">
        <div class="list-group-item d-flex align-items-start gap-3">
          <i class="bi bi-x-circle-fill text-danger fs-4"></i>
          <div>
            <h6 class="mb-1">Minimiser sa méfiance</h6>
            <small class="text-muted">Cela invalide son ressenti</small>
          </div>
        </div>
        <div class="list-group-item d-flex align-items-start gap-3">
          <i class="bi bi-x-circle-fill text-danger fs-4"></i>
          <div>
            <h6 class="mb-1">Dire "il n'y a aucun risque" trop tôt</h6>
            <small class="text-muted">Ça sonne comme une promesse creuse</small>
          </div>
        </div>
        <div class="list-group-item d-flex align-items-start gap-3">
          <i class="bi bi-x-circle-fill text-danger fs-4"></i>
          <div>
            <h6 class="mb-1">Forcer la prise de décision</h6>
            <small class="text-muted">Renforce la résistance</small>
          </div>
        </div>
        <div class="list-group-item d-flex align-items-start gap-3">
          <i class="bi bi-x-circle-fill text-danger fs-4"></i>
          <div>
            <h6 class="mb-1">Contredire frontalement</h6>
            <small class="text-muted">Crée un conflit</small>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Méthode LILIWATT -->
  <div class="card border-0 shadow-lg">
    <div class="card-header bg-success text-white">
      <h4 class="mb-0"><i class="bi bi-trophy me-2"></i>Méthode LILIWATT</h4>
    </div>
    <div class="card-body">
      <div class="row g-4">
        <div class="col-md-4">
          <div class="card border-success border-2 h-100">
            <div class="card-body text-center">
              <div class="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center" style="width: 80px; height: 80px;">
                <i class="bi bi-check2-circle text-success" style="font-size: 2.5rem;"></i>
              </div>
              <h5 class="mt-3 mb-3">1. Valider la méfiance</h5>
              <div class="card bg-light border-0">
                <div class="card-body">
                  <p class="mb-0 small"><i class="bi bi-chat-quote me-2"></i><em>"Je comprends tout à fait, vous avez été très sollicité."</em></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card border-info border-2 h-100">
            <div class="card-body text-center">
              <div class="bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center" style="width: 80px; height: 80px;">
                <i class="bi bi-shield-check text-info" style="font-size: 2.5rem;"></i>
              </div>
              <h5 class="mt-3 mb-3">2. Rassurer techniquement</h5>
              <ul class="text-start small">
                <li>Expliquer le rôle d'ENEDIS / GRDF</li>
                <li>Expliquer le contexte énergétique actuel</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card border-primary border-2 h-100">
            <div class="card-body text-center">
              <div class="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center" style="width: 80px; height: 80px;">
                <i class="bi bi-arrow-return-right text-primary" style="font-size: 2.5rem;"></i>
              </div>
              <h5 class="mt-3 mb-3">3. Recentrer sur l'étude</h5>
              <div class="card bg-light border-0">
                <div class="card-body">
                  <p class="mb-0 small"><i class="bi bi-chat-quote me-2"></i><em>"Il s'agit simplement d'un comparatif (gratuit et sans engagement)."</em></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<hr class="my-5">

<!-- SECTION 3 : OBJECTIF PSYCHOLOGIQUE -->
<div class="section-block">
  <h2 class="section-title">
    <span class="badge bg-primary me-2">3</span>
    <i class="bi bi-bullseye me-2"></i>Objectif psychologique
  </h2>

  <div class="card border-0 shadow-lg mb-4">
    <div class="card-body p-4">
      <div class="alert alert-warning border-0 shadow-sm mb-4">
        <h4 class="text-center mb-0"><i class="bi bi-exclamation-triangle me-2"></i>Vous ne devez pas convaincre.</h4>
      </div>

      <h5 class="text-center mb-4">Vous devez :</h5>

      <div class="row g-4 mb-4">
        <div class="col-md-4">
          <div class="card bg-primary bg-opacity-10 border-primary text-center h-100">
            <div class="card-body">
              <i class="bi bi-ear text-primary" style="font-size: 3rem;"></i>
              <h5 class="mt-3 mb-0">Obtenir l'écoute</h5>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card bg-success bg-opacity-10 border-success text-center h-100">
            <div class="card-body">
              <i class="bi bi-shield-check text-success" style="font-size: 3rem;"></i>
              <h5 class="mt-3 mb-0">Créer une zone de sécurité</h5>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card bg-info bg-opacity-10 border-info text-center h-100">
            <div class="card-body">
              <i class="bi bi-handshake text-info" style="font-size: 3rem;"></i>
              <h5 class="mt-3 mb-0">Installer une relation professionnelle</h5>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<hr class="my-5">

<!-- SECTION 4 : POSTURE ATTENDUE -->
<div class="section-block">
  <h2 class="section-title">
    <span class="badge bg-success me-2">4</span>
    <i class="bi bi-person-check me-2"></i>Posture attendue d'un opérateur LILIWATT
  </h2>

  <div class="card border-0 shadow-lg mb-4">
    <div class="card-body p-4">
      <div class="row g-4 mb-4">
        <div class="col-md-6">
          <div class="card border-danger border-2 h-100">
            <div class="card-header bg-danger text-white">
              <h5 class="mb-0"><i class="bi bi-x-circle me-2"></i>Ce qu'on ne fait PAS</h5>
            </div>
            <div class="card-body">
              <ul class="mb-0">
                <li class="mb-2"><i class="bi bi-x text-danger me-2"></i>On ne s'excuse pas d'appeler</li>
                <li class="mb-2"><i class="bi bi-x text-danger me-2"></i>On ne s'impose pas</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card border-success border-2 h-100">
            <div class="card-header bg-success text-white">
              <h5 class="mb-0"><i class="bi bi-check-circle me-2"></i>Ce qu'on fait</h5>
            </div>
            <div class="card-body">
              <p class="mb-2">On cadre calmement.</p>
              <p class="mb-0">On parle comme :</p>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-3 mb-4">
        <div class="col-md-4">
          <div class="card bg-primary bg-opacity-10 border-primary text-center">
            <div class="card-body">
              <i class="bi bi-graph-up text-primary fs-2"></i>
              <h6 class="mt-2 mb-0">Un analyste</h6>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card bg-info bg-opacity-10 border-info text-center">
            <div class="card-body">
              <i class="bi bi-briefcase text-info fs-2"></i>
              <h6 class="mt-2 mb-0">Un consultant</h6>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card bg-success bg-opacity-10 border-success text-center">
            <div class="card-body">
              <i class="bi bi-trophy text-success fs-2"></i>
              <h6 class="mt-2 mb-0">Un expert marché</h6>
            </div>
          </div>
        </div>
      </div>

      <div class="alert alert-danger border-0 shadow-sm">
        <h5 class="text-center mb-0"><i class="bi bi-x-octagon me-2"></i>Pas comme un vendeur</h5>
      </div>
    </div>
  </div>
</div>

<hr class="my-5">

<!-- SECTION 5 : RÈGLE D'OR -->
<div class="section-block">
  <h2 class="section-title">
    <span class="badge bg-warning text-dark me-2">5</span>
    <i class="bi bi-star-fill me-2"></i>Règle d'or
  </h2>

  <div class="card border-0 shadow-lg mb-4">
    <div class="card-header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
      <h4 class="mb-0"><i class="bi bi-calendar-check me-2"></i>Un dirigeant accepte un rendez-vous si...</h4>
    </div>
    <div class="card-body p-4">
      <p class="lead text-center mb-4">Il estime que :</p>

      <div class="row g-4 mb-4">
        <div class="col-md-4">
          <div class="card border-success border-3 h-100">
            <div class="card-body text-center">
              <div class="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 100px; height: 100px;">
                <i class="bi bi-shield-check text-success" style="font-size: 3rem;"></i>
              </div>
              <h5 class="text-success">Le risque est faible</h5>
              <p class="small text-muted mb-0">Pas de piège, pas d'engagement forcé</p>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card border-primary border-3 h-100">
            <div class="card-body text-center">
              <div class="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 100px; height: 100px;">
                <i class="bi bi-clock text-primary" style="font-size: 3rem;"></i>
              </div>
              <h5 class="text-primary">Le temps investi est limité</h5>
              <p class="small text-muted mb-0">Efficacité et respect de son agenda</p>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card border-warning border-3 h-100">
            <div class="card-body text-center">
              <div class="bg-warning bg-opacity-25 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 100px; height: 100px;">
                <i class="bi bi-graph-up-arrow text-warning" style="font-size: 3rem;"></i>
              </div>
              <h5 class="text-warning">Le bénéfice potentiel est crédible</h5>
              <p class="small text-muted mb-0">Économies réelles et mesurables</p>
            </div>
          </div>
        </div>
      </div>

      <div class="alert alert-success border-0 shadow-sm">
        <h5 class="text-center mb-0"><i class="bi bi-bullseye me-2"></i>Votre rôle est d'équilibrer ces 3 variables</h5>
      </div>
    </div>
  </div>
</div>

<hr class="my-5">

<!-- SECTION 6 : EXERCICE APRÈS UN REFUS -->
<div class="section-block">
  <h2 class="section-title">
    <span class="badge bg-info me-2">6</span>
    <i class="bi bi-pencil-square me-2"></i>Exercice après un refus
  </h2>

  <div class="card border-0 shadow-lg">
    <div class="card-header bg-info text-white">
      <h4 class="mb-0"><i class="bi bi-lightbulb me-2"></i>Demandez-vous</h4>
    </div>
    <div class="card-body p-4">
      <div class="row g-3">
        <div class="col-md-4">
          <div class="card bg-light border-start border-5 border-info h-100">
            <div class="card-body">
              <h6 class="text-info"><i class="bi bi-1-circle-fill me-2"></i>Pourquoi</h6>
              <p class="mb-0">Pourquoi un dirigeant refuse</p>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card bg-light border-start border-5 border-info h-100">
            <div class="card-body">
              <h6 class="text-info"><i class="bi bi-2-circle-fill me-2"></i>Reformuler</h6>
              <p class="mb-0">Reformuler ses objections en y répondant</p>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card bg-light border-start border-5 border-info h-100">
            <div class="card-body">
              <h6 class="text-info"><i class="bi bi-3-circle-fill me-2"></i>Noter</h6>
              <p class="mb-0">Noter toutes les informations recueillies</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<hr class="my-5">

<!-- À RETENIR -->
<div class="card border-0 shadow-lg" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
  <div class="card-body p-4">
    <h3 class="mb-4"><i class="bi bi-bookmark-star-fill me-2"></i>📌 À retenir</h3>

    <div class="alert alert-light border-0 mb-4">
      <h5 class="text-dark mb-3"><i class="bi bi-exclamation-circle me-2"></i>La plupart des refus ne sont pas contre vous.</h5>
      <p class="text-dark mb-2">Ils sont contre :</p>
      <div class="row g-2">
        <div class="col-md-4">
          <div class="bg-danger bg-opacity-10 border border-danger rounded p-2 text-center">
            <i class="bi bi-clock text-danger me-1"></i>
            <span class="text-dark">La perte de temps</span>
          </div>
        </div>
        <div class="col-md-4">
          <div class="bg-danger bg-opacity-10 border border-danger rounded p-2 text-center">
            <i class="bi bi-question-circle text-danger me-1"></i>
            <span class="text-dark">L'incertitude</span>
          </div>
        </div>
        <div class="col-md-4">
          <div class="bg-danger bg-opacity-10 border border-danger rounded p-2 text-center">
            <i class="bi bi-x-circle text-danger me-1"></i>
            <span class="text-dark">Le manque de contrôle</span>
          </div>
        </div>
      </div>
    </div>

    <div class="text-center p-4" style="background: rgba(255,255,255,0.1); border-radius: 10px;">
      <h4 class="mb-3"><i class="bi bi-trophy-fill me-2"></i>Règle d'or</h4>
      <h3 class="mb-0">Si vous restaurez le contrôle,<br>vous gagnez l'écoute</h3>
    </div>
  </div>
</div>

<style>
  .module-hero {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
  .section-title {
    color: #2c3e50;
    font-weight: 700;
    margin-bottom: 1.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 3px solid #667eea;
  }
  .bg-gradient-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
</style>`
      },
      {
        order: 5,
        title: 'Argumentaire téléphonique (R1)',
        description: 'Maîtrisez l\'art du premier contact et transformez vos prospects en rendez-vous qualifiés',
        icon: 'bi-telephone',
        durationEstimated: 60,
        content: `
<div class="module-hero bg-gradient-success text-white p-4 rounded-3 mb-4">
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

<hr class="my-5">

<!-- ÉTAPE 1 : ACCROCHE -->
<div class="section-block">
  <h2 class="section-title">
    <span class="badge bg-primary me-2">Étape 1</span>
    <i class="bi bi-telephone-outbound me-2"></i>Accroche maîtrisée
  </h2>

  <div class="card border-0 shadow-lg mb-4">
    <div class="card-header bg-primary text-white">
      <h4 class="mb-0"><i class="bi bi-chat-quote me-2"></i>Script de l'accroche</h4>
    </div>
    <div class="card-body p-4">
      <div class="alert alert-light border border-primary p-4">
        <p class="mb-3"><em>"Bonjour, ici ……… d'<strong>E-C-O-G-I-E-S</strong>, je vous contacte dans le cadre du suivi des contrats d'énergie pour votre entreprise.</em></p>
        <p class="mb-0"><em>C'est bien vous qui vous en occupez ?"</em></p>
      </div>

      <div class="alert alert-info border-0 mt-3">
        <h6><i class="bi bi-bullseye me-2"></i>Objectif principal</h6>
        <p class="mb-0"><strong>Identifier l'interlocuteur dédié.</strong></p>
      </div>
    </div>
  </div>

  <div class="card border-0 shadow-sm mb-4">
    <div class="card-header bg-light">
      <h5 class="mb-0"><i class="bi bi-shield-check me-2"></i>Transparence et empathie</h5>
    </div>
    <div class="card-body">
      <div class="alert alert-light border border-success p-3">
        <p class="mb-2"><em>"J'imagine que vous devez être très sollicité par téléphone et je ne vais pas vous dire que c'est votre appel préféré de la journée… pour vous comme pour moi d'ailleurs.</em></p>
        <p class="mb-2"><em>C'est la partie ingrate de mon métier, mais c'est bien un appel de prospection.</em></p>
        <p class="mb-0"><em>Mon but n'est pas de vous faire perdre du temps."</em></p>
      </div>
    </div>
  </div>

  <div class="card border-0 shadow-sm">
    <div class="card-header bg-warning text-dark">
      <h5 class="mb-0"><i class="bi bi-graph-up-arrow me-2"></i>Enjeu financier</h5>
    </div>
    <div class="card-body">
      <div class="alert alert-light border border-warning p-3">
        <p class="mb-2"><em>"Dans votre activité, l'énergie est un poste de dépense important, et quand le prix de l'énergie augmente, ce n'est pas votre chiffre d'affaires qui augmente, mais bien <strong>votre marge qui baisse</strong>."</em></p>
        <p class="mb-0"><em>"De nos jours, la plupart des professionnels veulent s'assurer qu'ils ne paient pas leur énergie plus cher que nécessaire."</em></p>
      </div>
    </div>
  </div>
</div>

<hr class="my-5">

<!-- ÉTAPE 2 : QUALIFICATION -->
<div class="section-block">
  <h2 class="section-title">
    <span class="badge bg-info me-2">Étape 2</span>
    <i class="bi bi-clipboard-check me-2"></i>Qualification stratégique
  </h2>

  <div class="card border-0 shadow-lg mb-4">
    <div class="card-body p-4">
      <div class="row g-3 mb-4">
        <div class="col-md-6">
          <div class="card bg-info bg-opacity-10 border-info h-100">
            <div class="card-body">
              <h6 class="text-info"><i class="bi bi-mic me-2"></i>Briser la glace</h6>
              <p class="mb-0 small">Sujets bateau (temps, travail, actualité). Créer du relationnel, sortir du cadre « client-commercial ».</p>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card bg-primary bg-opacity-10 border-primary h-100">
            <div class="card-body">
              <h6 class="text-primary"><i class="bi bi-ear me-2"></i>Écoute active</h6>
              <p class="mb-0 small">Savoir écouter le client, le laisser s'exprimer pour rebondir plus tard grâce aux informations glanées.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="alert alert-success border-0 shadow-sm mb-4">
        <h6><i class="bi bi-target me-2"></i>Objectifs de cette étape</h6>
        <ul class="mb-0">
          <li>Connaître les <strong>déclencheurs</strong></li>
          <li>Identifier le <strong>décisionnaire</strong></li>
          <li>Comprendre la <strong>motivation</strong> d'un potentiel changement</li>
          <li>Se faire accepter en tant qu'<strong>expert</strong>, et non en tant que vendeur</li>
        </ul>
      </div>

      <h5 class="mb-3"><i class="bi bi-question-circle me-2"></i>Questions clés à poser</h5>
      <div class="list-group">
        <div class="list-group-item">
          <i class="bi bi-calendar3 text-primary me-2"></i>
          <strong>Depuis combien de temps êtes-vous installé ici ? Création ou reprise ?</strong>
        </div>
        <div class="list-group-item">
          <i class="bi bi-fire text-warning me-2"></i>
          <strong>Êtes-vous approvisionné en gaz de ville en plus de l'électricité ?</strong>
        </div>
        <div class="list-group-item">
          <i class="bi bi-building text-info me-2"></i>
          <strong>Quel est votre fournisseur actuel ? Pourquoi l'avez-vous choisi ?</strong>
        </div>
        <div class="list-group-item">
          <i class="bi bi-people text-success me-2"></i>
          <strong>Vous êtes le seul à gérer les contrats d'énergie ?</strong>
        </div>
        <div class="list-group-item">
          <i class="bi bi-speedometer text-danger me-2"></i>
          <strong>Avez-vous plusieurs compteurs électriques ou gaz ? Plusieurs établissements ?</strong>
        </div>
        <div class="list-group-item">
          <i class="bi bi-graph-up text-warning me-2"></i>
          <strong>Avez-vous constaté des augmentations sur vos factures ?</strong>
        </div>
      </div>
    </div>
  </div>

  <!-- Explication ENEDIS -->
  <div class="card border-0 shadow-sm">
    <div class="card-header bg-dark text-white">
      <h5 class="mb-0"><i class="bi bi-gear me-2"></i>Distinction fournisseur / gestionnaire réseau</h5>
    </div>
    <div class="card-body">
      <p class="lead mb-3">Si le fournisseur actuel est EDF (ou autre) :</p>
      <div class="alert alert-primary border-0">
        <p class="mb-2"><em>"EDF est l'entreprise qui vous <strong>facture l'énergie</strong>, mais n'intervient pas sur le réseau."</em></p>
        <p class="mb-2"><em>"Le gestionnaire du réseau et le seul habilité à intervenir sur le réseau électrique, c'est <strong>ENEDIS</strong>, un organisme de service public."</em></p>
        <p class="mb-0"><em>"Peu importe votre fournisseur actuel, la relève des compteurs, les dépannages, l'acheminement de l'énergie… toutes les interventions techniques sont toujours assurées par le <strong>service public</strong>."</em></p>
      </div>

      <div class="alert alert-warning border-0 mt-3 mb-0">
        <h6><i class="bi bi-lightbulb me-2"></i>Rôle d'expert</h6>
        <p class="mb-0">En tant qu'opérateur du marché des énergies, vous êtes le <strong>professionnel expert</strong>. Vous devez être pédagogue. Cette étape permet de vous approprier l'étiquette « d'expert en énergies » en apportant des réponses simples et précises.</p>
      </div>
    </div>
  </div>
</div>

<hr class="my-5">

<!-- ÉTAPE 3 : ÉVEIL DU BESOIN -->
<div class="section-block">
  <h2 class="section-title">
    <span class="badge bg-warning text-dark me-2">Étape 3</span>
    <i class="bi bi-lightning me-2"></i>Éveil du besoin
  </h2>

  <div class="card border-0 shadow-lg mb-4">
    <div class="card-body p-4">
      <div class="alert alert-light border border-warning p-3">
        <p class="mb-2"><em>"Nous allons analyser votre facture qui nous renseignera sur les données techniques de votre compteur comme la puissance, le profil de consommation ainsi que votre offre actuelle."</em></p>
        <p class="mb-0"><em>"J'imagine que vous avez constaté des augmentations régulières sur vos factures d'énergie ?"</em></p>
      </div>

      <p class="lead mt-4">Ces hausses sont dues à un marché en constante évolution.</p>
    </div>
  </div>

  <!-- Conjoncture d'investissement -->
  <div class="card border-0 shadow-lg mb-4">
    <div class="card-header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
      <h4 class="mb-0"><i class="bi bi-diagram-3 me-2"></i>1. La conjoncture d'investissement</h4>
    </div>
    <div class="card-body p-4">
      <p class="lead">En France, nous sommes dans une phase de transition énergétique majeure :</p>

      <div class="row g-3 mb-4">
        <div class="col-md-4">
          <div class="card bg-success bg-opacity-10 border-success text-center h-100">
            <div class="card-body">
              <i class="bi bi-wind text-success" style="font-size: 2.5rem;"></i>
              <h6 class="mt-2">Énergies renouvelables</h6>
              <small>Éolien, hydraulique, photovoltaïque</small>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card bg-warning bg-opacity-25 border-warning text-center h-100">
            <div class="card-body">
              <i class="bi bi-fuel-pump-fill text-warning" style="font-size: 2.5rem;"></i>
              <h6 class="mt-2">Abandon fossiles</h6>
              <small>Objectif 50% nucléaire / 50% renouvelable d'ici 2030</small>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card bg-danger bg-opacity-10 border-danger text-center h-100">
            <div class="card-body">
              <i class="bi bi-radioactive text-danger" style="font-size: 2.5rem;"></i>
              <h6 class="mt-2">Rénovation nucléaire</h6>
              <small>100 milliards € (Cour des Comptes)</small>
            </div>
          </div>
        </div>
      </div>

      <div class="alert alert-info border-0">
        <h6><i class="bi bi-info-circle me-2"></i>Durée de vie des réacteurs</h6>
        <p class="mb-0">100 milliards selon la Cour des Comptes pour prolonger la durée de vie des réacteurs de 40 à 60 ans et éviter des risques sanitaires type Fukushima et garantir la sécurisation des installations.</p>
      </div>

      <div class="alert alert-danger border-0 shadow-sm mb-0">
        <h5 class="text-center mb-0"><i class="bi bi-arrow-up-circle me-2"></i>Ces investissements lourds ont un impact direct sur le coût de l'électricité</h5>
      </div>
    </div>
  </div>

  <!-- Contexte géopolitique -->
  <div class="card border-0 shadow-lg">
    <div class="card-header bg-danger text-white">
      <h4 class="mb-0"><i class="bi bi-globe-europe-africa me-2"></i>2. Le contexte géopolitique</h4>
    </div>
    <div class="card-body p-4">
      <div class="row g-3">
        <div class="col-md-6">
          <div class="card bg-light border-start border-5 border-danger">
            <div class="card-body">
              <h6 class="text-danger"><i class="bi bi-exclamation-triangle me-2"></i>Dépendance au gaz russe</h6>
              <p class="mb-0 small">L'Europe dépend fortement du gaz russe</p>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card bg-light border-start border-5 border-warning">
            <div class="card-body">
              <h6 class="text-warning"><i class="bi bi-flag me-2"></i>Tensions internationales</h6>
              <p class="mb-0 small">Politiques économiques, relations commerciales...</p>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card bg-light border-start border-5 border-dark">
            <div class="card-body">
              <h6 class="text-dark"><i class="bi bi-shield-x me-2"></i>Conflit Russo-Ukrainien</h6>
              <p class="mb-0 small">Impact majeur sur les prix de l'énergie</p>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card bg-light border-start border-5 border-info">
            <div class="card-body">
              <h6 class="text-info"><i class="bi bi-graph-up me-2"></i>Hausse matières premières</h6>
              <p class="mb-0 small">Gaz, pétrole et autres énergies</p>
            </div>
          </div>
        </div>
      </div>

      <div class="alert alert-warning border-0 shadow-sm mt-4 mb-0">
        <h5 class="text-center mb-0"><i class="bi bi-graph-up-arrow me-2"></i>Tous ces éléments participent à la volatilité des prix</h5>
      </div>
    </div>
  </div>
</div>

<hr class="my-5">

<!-- ÉTAPE 4 : RÉCUPÉRATION FACTURES -->
<div class="section-block">
  <h2 class="section-title">
    <span class="badge bg-success me-2">Étape 4</span>
    <i class="bi bi-file-earmark-text me-2"></i>Récupération de factures
  </h2>

  <div class="card border-0 shadow-lg mb-4">
    <div class="card-header bg-success text-white">
      <h4 class="mb-0"><i class="bi bi-check2-circle me-2"></i>Transition vers la solution</h4>
    </div>
    <div class="card-body p-4">
      <div class="alert alert-success border-0 mb-4">
        <h6><i class="bi bi-info-circle me-2"></i>À cette étape</h6>
        <ul class="mb-0">
          <li>Vous avez <strong>détecté les besoins</strong> du client</li>
          <li>Il est maintenant <strong>conscient qu'il doit agir</strong> pour sécuriser ses prix</li>
          <li>Il peut être hésitant, mais votre service répond au besoin détecté</li>
        </ul>
      </div>

      <div class="alert alert-light border border-success p-4">
        <p class="mb-2"><em>"Payer l'électricité et le gaz c'est obligatoire, mais <strong>pas à n'importe quel prix</strong>."</em></p>
        <p class="mb-0"><em>"Chez LILIWATT, nous réalisons des études personnalisées <strong>gratuite et sans engagement</strong> adaptées à votre consommation, dans le but d'optimiser vos budgets énergies et de réduire vos coûts."</em></p>
      </div>
    </div>
  </div>

  <div class="card border-0 shadow-sm mb-4">
    <div class="card-header bg-light">
      <h5 class="mb-0"><i class="bi bi-envelope me-2"></i>Demande de facture</h5>
    </div>
    <div class="card-body">
      <div class="alert alert-light border border-primary p-3">
        <p class="mb-2"><em>"Pour cela, j'aurai uniquement besoin de votre dernière facture électricité et/ou gaz."</em></p>
        <p class="mb-2"><em>"Rassurez-vous, <strong>je ne vais pas la payer à votre place</strong> 😊"</em></p>
        <p class="mb-2"><em>"Elle me permettra simplement d'avoir toutes les données techniques nécessaires pour effectuer le comparatif."</em></p>
        <p class="mb-0"><em>"Pourriez-vous me la transmettre ?"</em></p>
      </div>

      <div class="alert alert-info border-0 mt-3">
        <p class="mb-0"><em>"Le plus simple est que je vous envoie un mail afin que vous puissiez me répondre par retour de mail avec la facture en pièce jointe."</em></p>
      </div>
    </div>
  </div>
</div>

<hr class="my-5">

<!-- ÉTAPE 5 : PRÉPARATION CLOSING -->
<div class="section-block">
  <h2 class="section-title">
    <span class="badge bg-danger me-2">Étape 5</span>
    <i class="bi bi-calendar-check me-2"></i>Préparation closing
  </h2>

  <div class="card border-0 shadow-lg mb-4">
    <div class="card-header bg-danger text-white">
      <h4 class="mb-0"><i class="bi bi-star-fill me-2"></i>Le closing commence à cette étape</h4>
    </div>
    <div class="card-body p-4">
      <div class="alert alert-light border border-danger p-4 mb-4">
        <p class="mb-2"><em>"Une fois le comparatif effectué, je pourrai vous indiquer si une optimisation tarifaire est possible."</em></p>
        <p class="mb-2"><em>"Il est possible qu'il n'y ait rien à faire."</em></p>
        <p class="mb-0"><em>"<strong>Mais SI une opportunité intéressante se présente</strong>, prenons quelques minutes ensemble pour que je puisse vous la présenter."</em></p>
      </div>

      <h5 class="mb-3"><i class="bi bi-clock me-2"></i>Proposer un créneau précis</h5>
      <div class="alert alert-light border border-success p-4">
        <p class="mb-2"><em>"Nous sommes mardi. Il me faut environ 48 heures pour sonder l'ensemble du marché."</em></p>
        <p class="mb-2"><em>"À quelle heure êtes-vous disponible <strong>jeudi prochain</strong> ?"</em></p>
        <p class="mb-2"><em>"<strong>10h00 pourrait vous convenir ?</strong>"</em></p>
        <p class="mb-2"><em>"Je vous présenterai les résultats de la mise en concurrence par mail."</em></p>
        <p class="mb-0"><em>"Vous pourrez être devant votre écran ?"</em></p>
      </div>

      <div class="alert alert-warning border-0 shadow-sm">
        <h6><i class="bi bi-exclamation-triangle me-2"></i>Points clés</h6>
        <ul class="mb-0">
          <li><strong>Ne pas avoir peur.</strong> Être directif.</li>
          <li><strong>Proposer un créneau précis.</strong> Ne pas laisser le prospect décider seul.</li>
          <li><strong>Enchaîner de façon fluide</strong>, rapide et sans s'encombrer de détails</li>
          <li>Le déroulé de l'appel doit être <strong>naturel</strong></li>
        </ul>
      </div>
    </div>
  </div>

  <div class="card border-0 shadow-sm">
    <div class="card-body p-4">
      <div class="row g-3">
        <div class="col-md-4">
          <div class="card bg-primary bg-opacity-10 border-primary text-center h-100">
            <div class="card-body">
              <i class="bi bi-person-check text-primary" style="font-size: 2.5rem;"></i>
              <h6 class="mt-2">Le prospect n'aime pas décider</h6>
              <p class="mb-0 small">Il attend que vous le guidiez</p>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card bg-success bg-opacity-10 border-success text-center h-100">
            <div class="card-body">
              <i class="bi bi-piggy-bank text-success" style="font-size: 2.5rem;"></i>
              <h6 class="mt-2">Faire des économies</h6>
              <p class="mb-0 small">Il n'a rien à perdre, bien au contraire</p>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card bg-warning bg-opacity-25 border-warning text-center h-100">
            <div class="card-body">
              <i class="bi bi-x-circle text-warning" style="font-size: 2.5rem;"></i>
              <h6 class="mt-2">Vous ne vendez rien</h6>
              <p class="mb-0 small">Il paie déjà. Vous l'aidez à moins dépenser</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<hr class="my-5">

<!-- ÉTAPE 6 : PRISE DE RDV -->
<div class="section-block">
  <h2 class="section-title">
    <span class="badge bg-dark me-2">Étape 6</span>
    <i class="bi bi-calendar2-check me-2"></i>Prise de rendez-vous ferme
  </h2>

  <div class="card border-0 shadow-lg">
    <div class="card-header bg-dark text-white">
      <h4 class="mb-0"><i class="bi bi-award me-2"></i>Simulation obligatoire</h4>
    </div>
    <div class="card-body p-4">
      <div class="alert alert-success border-0 shadow-sm">
        <h5><i class="bi bi-check2-all me-2"></i>À cette étape, vous devez avoir :</h5>
        <ul class="mb-0">
          <li>✅ <strong>Un créneau précis</strong> confirmé (jour + heure)</li>
          <li>✅ <strong>L'email du prospect</strong> pour l'envoi des résultats</li>
          <li>✅ <strong>La facture</strong> ou confirmation d'envoi</li>
          <li>✅ <strong>L'engagement</strong> du prospect à consulter le mail</li>
        </ul>
      </div>
    </div>
  </div>
</div>

<hr class="my-5">

<!-- TRAITER LES OBJECTIONS -->
<div class="section-block">
  <h2 class="section-title">
    <span class="badge bg-warning text-dark me-2">Important</span>
    <i class="bi bi-shield-check me-2"></i>Traiter les objections
  </h2>

  <div class="card border-0 shadow-lg mb-4">
    <div class="card-header" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white;">
      <h4 class="mb-0"><i class="bi bi-lightbulb me-2"></i>Rassurer et convaincre</h4>
    </div>
    <div class="card-body p-4">
      <div class="alert alert-info border-0 mb-4">
        <h6><i class="bi bi-star me-2"></i>Principe fondamental</h6>
        <p class="mb-2"><strong>Une objection est un signe d'intérêt du client.</strong></p>
        <p class="mb-0">Le client a donc été attentif à l'argumentaire et nécessite des informations complémentaires pour valider sa prise de décision.</p>
      </div>

      <div class="alert alert-warning border-0">
        <h6><i class="bi bi-pencil me-2"></i>Méthodologie</h6>
        <ul class="mb-0">
          <li><strong>Reformuler</strong> les objections</li>
          <li><strong>Prendre le temps</strong> de comprendre les points bloquants</li>
          <li><strong>Noter</strong> les interrogations pour ne pas les oublier</li>
          <li>À chaque question, il y a une <strong>réponse adaptée</strong></li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Objections détaillées -->
  <div class="accordion mb-4" id="objectionsAccordion">
    <!-- Objection 1 -->
    <div class="accordion-item">
      <h2 class="accordion-header">
        <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#objection1">
          <i class="bi bi-x-circle text-danger me-2"></i>
          <strong>"Ça ne m'intéresse pas"</strong>
        </button>
      </h2>
      <div id="objection1" class="accordion-collapse collapse show" data-bs-parent="#objectionsAccordion">
        <div class="accordion-body">
          <div class="alert alert-success border-0">
            <p class="mb-0"><em>"Je comprends que cela puisse sembler secondaire, mais vu les hausses de prix actuelles, cela pourrait valoir le coup d'y jeter un œil, surtout que <strong>cela ne vous engage à rien</strong>. Vous pourriez être agréablement surpris des économies que vous pourriez réaliser."</em></p>
          </div>
        </div>
      </div>
    </div>

    <!-- Objection 2 -->
    <div class="accordion-item">
      <h2 class="accordion-header">
        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#objection2">
          <i class="bi bi-clock text-warning me-2"></i>
          <strong>"Je n'ai pas le temps"</strong>
        </button>
      </h2>
      <div id="objection2" class="accordion-collapse collapse" data-bs-parent="#objectionsAccordion">
        <div class="accordion-body">
          <div class="alert alert-success border-0">
            <p class="mb-2"><em>"Je ne vais pas vous déranger plus longtemps."</em></p>
            <p class="mb-0"><em>"Dites-moi quelles sont vos disponibilités afin que je puisse vous rappeler à un moment plus opportun ? <strong>Plutôt le matin ou l'après-midi ?</strong>"</em></p>
          </div>
        </div>
      </div>
    </div>

    <!-- Objection 3 -->
    <div class="accordion-item">
      <h2 class="accordion-header">
        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#objection3">
          <i class="bi bi-building text-primary me-2"></i>
          <strong>"Je crains de regretter, je suis bien chez EDF"</strong>
        </button>
      </h2>
      <div id="objection3" class="accordion-collapse collapse" data-bs-parent="#objectionsAccordion">
        <div class="accordion-body">
          <div class="alert alert-success border-0">
            <p class="mb-2"><em>"La plupart des gens sont attachés au logo EDF sur la facture, car auparavant c'était le seul fournisseur. Mais depuis l'ouverture des marchés à la concurrence, tout a changé."</em></p>
            <p class="mb-2"><em>"Aujourd'hui, <strong>EDF n'est qu'un fournisseur parmi d'autres</strong>. Celui qui gère le réseau, c'est ENEDIS, quel que soit votre fournisseur. Il n'y aura aucune intervention technique."</em></p>
            <p class="mb-2"><em>"Tout se met en place automatiquement."</em></p>
            <p class="mb-0"><em>"La seule différence que vous pourrez constater entre EDF Entreprises et la concurrence, c'est <strong>le montant à régler et le logo en haut à droite de votre facture</strong>."</em></p>
          </div>
        </div>
      </div>
    </div>

    <!-- Objection 4 -->
    <div class="accordion-item">
      <h2 class="accordion-header">
        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#objection4">
          <i class="bi bi-envelope text-info me-2"></i>
          <strong>"Mon responsable ne communique que par mails. Il n'a pas le temps."</strong>
        </button>
      </h2>
      <div id="objection4" class="accordion-collapse collapse" data-bs-parent="#objectionsAccordion">
        <div class="accordion-body">
          <div class="alert alert-success border-0">
            <p class="mb-2"><em>"Je comprends, cela doit être une personne très occupée, tout comme vous je pense."</em></p>
            <p class="mb-0"><em>"Préférez-vous que nous avancions ensemble dans un premier temps ? Je pense que <strong>ce serait plus simple et plus efficace</strong>."</em></p>
          </div>
        </div>
      </div>
    </div>

    <!-- Objection 5 -->
    <div class="accordion-item">
      <h2 class="accordion-header">
        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#objection5">
          <i class="bi bi-pen text-success me-2"></i>
          <strong>"Je viens de resigner"</strong>
        </button>
      </h2>
      <div id="objection5" class="accordion-collapse collapse" data-bs-parent="#objectionsAccordion">
        <div class="accordion-body">
          <div class="alert alert-success border-0">
            <p class="mb-2"><em>"Très bien, vous avez déjà pensé à sécuriser vos tarifs."</em></p>
            <p class="mb-2"><em>"Puis-je savoir quelle est la puissance de votre installation en kVA ?"</em></p>
            <p class="mb-0"><em>"Si elle est <strong>inférieure à 36 kVA</strong>, sachez que vous pouvez renégocier à tout moment. Si elle est supérieure, nous pouvons déjà commencer à sonder le marché afin de sécuriser vos prix dès maintenant et éviter toute mauvaise surprise."</em></p>
          </div>
        </div>
      </div>
    </div>

    <!-- Objection 6 -->
    <div class="accordion-item">
      <h2 class="accordion-header">
        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#objection6">
          <i class="bi bi-briefcase text-dark me-2"></i>
          <strong>"J'ai déjà un courtier"</strong>
        </button>
      </h2>
      <div id="objection6" class="accordion-collapse collapse" data-bs-parent="#objectionsAccordion">
        <div class="accordion-body">
          <div class="alert alert-success border-0">
            <p class="mb-2"><em>"C'est une excellente chose. Cela montre que vous prenez ce sujet au sérieux."</em></p>
            <p class="mb-0"><em>"Cependant, notre force réside dans les <strong>volumes que nous négocions</strong>. Parfois, même avec un courtier, il est intéressant d'avoir un second regard, surtout si <strong>c'est gratuit et sans engagement</strong>."</em></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<hr class="my-5">

<!-- ORGANISATION DE LA PROSPECTION -->
<div class="section-block">
  <h2 class="section-title">
    <span class="badge bg-info me-2">Bonus</span>
    <i class="bi bi-gear me-2"></i>Organisation de la prospection
  </h2>

  <div class="card border-0 shadow-lg">
    <div class="card-header bg-info text-white">
      <h4 class="mb-0"><i class="bi bi-list-check me-2"></i>Points indispensables</h4>
    </div>
    <div class="card-body p-4">
      <div class="row g-3">
        <div class="col-md-4">
          <div class="card bg-success bg-opacity-10 border-success h-100">
            <div class="card-body text-center">
              <i class="bi bi-emoji-smile text-success" style="font-size: 2.5rem;"></i>
              <h6 class="mt-2">Être dynamique</h6>
              <p class="mb-0 small">Le sourire s'entend au téléphone</p>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card bg-primary bg-opacity-10 border-primary h-100">
            <div class="card-body text-center">
              <i class="bi bi-calendar-check text-primary" style="font-size: 2.5rem;"></i>
              <h6 class="mt-2">Préparer en amont</h6>
              <p class="mb-0 small">Organisation rigoureuse de ses journées</p>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card bg-warning bg-opacity-25 border-warning h-100">
            <div class="card-body text-center">
              <i class="bi bi-star text-warning" style="font-size: 2.5rem;"></i>
              <h6 class="mt-2">Vérifier la notation</h6>
              <p class="mb-0 small">Consulter son référent avant d'appeler</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<hr class="my-5">

<!-- À RETENIR -->
<div class="card border-0 shadow-lg" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white;">
  <div class="card-body p-4">
    <h3 class="mb-4"><i class="bi bi-bookmark-star-fill me-2"></i>📌 À retenir</h3>

    <div class="row g-3">
      <div class="col-md-4">
        <div class="card bg-white text-dark h-100">
          <div class="card-body">
            <h5 class="text-success"><i class="bi bi-1-circle-fill me-2"></i>Suivre les 6 étapes</h5>
            <p class="mb-0 small">Chaque étape a son importance. Ne brûlez pas les étapes.</p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card bg-white text-dark h-100">
          <div class="card-body">
            <h5 class="text-primary"><i class="bi bi-2-circle-fill me-2"></i>Être directif</h5>
            <p class="mb-0 small">Proposer des créneaux précis. Guider le prospect.</p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card bg-white text-dark h-100">
          <div class="card-body">
            <h5 class="text-warning"><i class="bi bi-3-circle-fill me-2"></i>Les objections = opportunités</h5>
            <p class="mb-0 small">Une objection montre que le client est intéressé.</p>
          </div>
        </div>
      </div>
    </div>

    <div class="text-center p-4 mt-4" style="background: rgba(255,255,255,0.2); border-radius: 10px;">
      <h4 class="mb-3"><i class="bi bi-trophy-fill me-2"></i>Règle d'or</h4>
      <h3 class="mb-0">Vous ne vendez rien.<br>Vous aidez à économiser.</h3>
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
</style>
`
      },
      {
        order: 6,
        title: 'Gestion des objections avancée',
        description: 'Transformez chaque objection en opportunité de vente avec des techniques éprouvées',
        icon: 'bi-shield-check',
        durationEstimated: 45,
        content: `# Gestion des objections avancée

(Contenu à venir - Module en cours de création)`
      },
      {
        order: 7,
        title: 'Fidélisation et upselling',
        description: 'Maximisez la valeur client en développant des relations commerciales durables',
        icon: 'bi-heart',
        durationEstimated: 40,
        content: `# Fidélisation et upselling

(Contenu à venir - Module en cours de création)`
      },
      {
        order: 8,
        title: 'Organisation en télétravail',
        description: 'Optimisez votre productivité et maintenez vos performances en travaillant à distance',
        icon: 'bi-house-door',
        durationEstimated: 30,
        content: `# Organisation en télétravail

(Contenu à venir - Module en cours de création)`
      },
      {
        order: 9,
        title: 'Manuel interne destiné aux référents',
        description: 'Guide complet pour accompagner, former et développer votre équipe de vendeurs',
        icon: 'bi-book-half',
        durationEstimated: 90,
        content: `# Manuel interne référents

(Contenu à venir - Module en cours de création)`
      },
    ];

    await prisma.trainingModule.createMany({
      data: modules,
    });

    return NextResponse.json({
      message: 'Modules de formation initialisés avec succès',
      count: modules.length
    });
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des modules:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
