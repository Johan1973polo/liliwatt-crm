import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Navbar from '@/components/Navbar';

export default async function VendeurProcessPage() {
  const session = await getServerSession(authOptions);

  if (!session || !['VENDEUR', 'REFERENT'].includes(session.user.role)) {
    redirect('/auth/signin');
  }

  return (
    <>
      <Navbar
        userEmail={session.user.email}
        userRole={session.user.role}
        userAvatar={session.user.avatar}
      />

      <div className="container-fluid py-4">
        <div className="mb-4">
          <h1 className="h2 mb-1">
            <i className="bi bi-graph-up-arrow me-2"></i>
            Guide Opérateur de Marché
          </h1>
          <p className="text-muted mb-0">Expert indépendant en courtage énergétique professionnel</p>
        </div>

        {/* Bienvenue et positionnement */}
        <div className="card mb-4 border-primary">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">
              <i className="bi bi-award me-2"></i>
              Bienvenue, Opérateur de Marché
            </h5>
          </div>
          <div className="card-body">
            <p className="lead mb-3">
              En tant qu&apos;<strong>Opérateur de Marché indépendant</strong>, vous êtes un véritable expert
              du secteur de l&apos;énergie professionnelle, libre d&apos;organiser votre activité comme vous le souhaitez.
            </p>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <div className="card border-success h-100">
                  <div className="card-body">
                    <h6 className="text-success">
                      <i className="bi bi-briefcase me-2"></i>
                      Votre statut d&apos;indépendant
                    </h6>
                    <p className="mb-0 small">
                      Vous exercez votre activité en toute autonomie. Vous êtes libre de votre organisation, de vos méthodes
                      de prospection et de votre temps de travail. Nous vous accompagnons sans aucun lien de subordination.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card border-info h-100">
                  <div className="card-body">
                    <h6 className="text-info">
                      <i className="bi bi-people me-2"></i>
                      Un accompagnement à votre disposition
                    </h6>
                    <p className="mb-0 small">
                      Vous n&apos;êtes jamais seul. Nous mettons à votre disposition un <strong>référent</strong> qui peut vous accompagner,
                      vous former et vous soutenir si vous le souhaitez. L&apos;énergie est un milieu vaste et complexe, profitez de cet accompagnement
                      pour monter en compétence.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="alert alert-primary mb-0">
              <strong><i className="bi bi-trophy me-2"></i>Votre objectif :</strong> Développer votre expertise du marché de l&apos;énergie professionnelle,
              conquérir de nouveaux clients et optimiser votre activité commerciale.
            </div>
          </div>
        </div>

        {/* Déclaration de disponibilité */}
        <div className="card mb-4 border-info">
          <div className="card-header bg-info text-white">
            <h5 className="mb-0">
              <i className="bi bi-calendar-check me-2"></i>
              Déclaration de disponibilité - Outil collaboratif
            </h5>
          </div>
          <div className="card-body">
            <div className="alert alert-info mb-3">
              <strong><i className="bi bi-lightbulb me-2"></i>Pour optimiser votre activité :</strong> En tant qu&apos;indépendant,
              vous restez libre de votre organisation. Nous vous recommandons néanmoins d&apos;utiliser l&apos;outil de déclaration de disponibilité
              pour faciliter la collaboration avec votre référent et optimiser les opportunités commerciales qui pourraient vous être proposées.
            </div>

            <p className="lead mb-3">
              La mise à jour de votre statut dans l&apos;application permet à votre référent de mieux identifier les moments
              où vous êtes actif et réceptif à de nouvelles opportunités. C&apos;est un outil de coordination, pas une obligation.
            </p>

            <div className="row g-3">
              <div className="col-md-6">
                <div className="card border-success h-100">
                  <div className="card-header bg-success text-white">
                    <strong>
                      <i className="bi bi-check-circle me-2"></i>
                      Disponible
                    </strong>
                  </div>
                  <div className="card-body">
                    <p className="small mb-2"><strong>À utiliser quand :</strong></p>
                    <ul className="small mb-0">
                      <li>Vous êtes actif sur votre activité commerciale</li>
                      <li>Vous souhaitez recevoir des opportunités</li>
                      <li>Vous êtes ouvert aux échanges avec votre référent</li>
                      <li>Vous prospectez et cherchez de nouveaux clients</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card border-secondary h-100">
                  <div className="card-header bg-secondary text-white">
                    <strong>
                      <i className="bi bi-x-circle me-2"></i>
                      Pas Disponible
                    </strong>
                  </div>
                  <div className="card-body">
                    <p className="small mb-2"><strong>À utiliser quand :</strong></p>
                    <ul className="small mb-0">
                      <li>Vous êtes en congés ou absent</li>
                      <li>Vous ne souhaitez pas recevoir de nouvelles opportunités</li>
                      <li>Vous êtes en formation ou occupé sur d&apos;autres projets</li>
                      <li>Période d&apos;indisponibilité temporaire</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="alert alert-success mt-3 mb-0">
              <strong><i className="bi bi-graph-up me-2"></i>Avantage pour vous :</strong> En signalant votre disponibilité,
              vous maximisez vos chances de recevoir des opportunités commerciales adaptées à votre situation. C&apos;est un outil
              à votre service pour optimiser votre activité.
            </div>
          </div>
        </div>

        {/* Liberté de prospection */}
        <div className="card mb-4 border-success">
          <div className="card-header bg-success text-white">
            <h5 className="mb-0">
              <i className="bi bi-compass me-2"></i>
              Votre Liberté Totale de Prospection
            </h5>
          </div>
          <div className="card-body">
            <p className="lead mb-3">
              Vous êtes <strong>totalement libre</strong> dans votre façon de prospecter et de conquérir de nouveaux clients.
              Aucune méthode ne vous est imposée.
            </p>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <div className="card border-primary h-100">
                  <div className="card-header bg-light">
                    <strong>
                      <i className="bi bi-telephone me-2"></i>
                      Téléprospection
                    </strong>
                  </div>
                  <div className="card-body">
                    <p className="small mb-2">Une méthode que nous recommandons, mais vous restez libre :</p>
                    <ul className="small mb-0">
                      <li>Utilisation de bases de données que nous mettons à disposition</li>
                      <li>Prospection téléphonique depuis le lieu de votre choix</li>
                      <li>Flexibilité totale d&apos;horaires</li>
                      <li>Outils CRM disponibles si vous le souhaitez</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card border-primary h-100">
                  <div className="card-header bg-light">
                    <strong>
                      <i className="bi bi-geo-alt me-2"></i>
                      Prospection Terrain
                    </strong>
                  </div>
                  <div className="card-body">
                    <p className="small mb-2">Vous pouvez aussi choisir de prospecter sur le terrain :</p>
                    <ul className="small mb-0">
                      <li>Rencontres physiques avec les prospects</li>
                      <li>Prospection en zone d&apos;activité</li>
                      <li>Networking et événements professionnels</li>
                      <li>Approche commerciale personnalisée</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="alert alert-info mb-0">
              <strong><i className="bi bi-unlock me-2"></i>Votre indépendance :</strong> Téléphone, terrain, mixte, autres méthodes...
              Vous choisissez votre approche commerciale. Pour optimiser la collaboration, nous vous suggérons simplement de partager
              vos succès via les outils mis à disposition.
            </div>
          </div>
        </div>

        {/* Outils à disposition */}
        <div className="card mb-4 border-warning">
          <div className="card-header bg-warning text-dark">
            <h5 className="mb-0">
              <i className="bi bi-tools me-2"></i>
              Outils Mis à Votre Disposition
            </h5>
          </div>
          <div className="card-body">
            <p className="lead mb-3">
              Nous mettons à votre disposition une suite complète d&apos;outils pour faciliter votre activité.
              Leur utilisation est recommandée mais reste à votre appréciation.
            </p>

            <div className="row g-3">
              <div className="col-md-4">
                <div className="card border-warning h-100">
                  <div className="card-body text-center">
                    <i className="bi bi-calculator display-4 text-warning mb-3"></i>
                    <h6>Demande de Notation Financière</h6>
                    <p className="small text-muted mb-0">
                      Service disponible pour vérifier le score financier de vos prospects
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card border-warning h-100">
                  <div className="card-body text-center">
                    <i className="bi bi-database display-4 text-warning mb-3"></i>
                    <h6>Bases de Données</h6>
                    <p className="small text-muted mb-0">
                      Accès à des bases de données qualifiées si vous souhaitez les utiliser
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card border-warning h-100">
                  <div className="card-body text-center">
                    <i className="bi bi-link-45deg display-4 text-warning mb-3"></i>
                    <h6>Liens Utiles</h6>
                    <p className="small text-muted mb-0">
                      Tunnels de souscription et outils fournisseurs à votre disposition
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card border-warning h-100">
                  <div className="card-body text-center">
                    <i className="bi bi-calendar-week display-4 text-warning mb-3"></i>
                    <h6>Agenda</h6>
                    <p className="small text-muted mb-0">
                      Outil de planification disponible pour organiser votre activité
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card border-warning h-100">
                  <div className="card-body text-center">
                    <i className="bi bi-mortarboard display-4 text-warning mb-3"></i>
                    <h6>Formations</h6>
                    <p className="small text-muted mb-0">
                      Formations disponibles si vous souhaitez monter en compétence
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card border-warning h-100">
                  <div className="card-body text-center">
                    <i className="bi bi-receipt display-4 text-warning mb-3"></i>
                    <h6>Déclaration de Ventes</h6>
                    <p className="small text-muted mb-0">
                      Outil pour déclarer vos ventes et suivre votre activité
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card border-warning h-100">
                  <div className="card-body text-center">
                    <i className="bi bi-chat-dots display-4 text-warning mb-3"></i>
                    <h6>Messagerie</h6>
                    <p className="small text-muted mb-0">
                      Communication disponible avec votre référent et le support
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card border-warning h-100">
                  <div className="card-body text-center">
                    <i className="bi bi-clipboard-check display-4 text-warning mb-3"></i>
                    <h6>Support Technique</h6>
                    <p className="small text-muted mb-0">
                      Service de support pour vos besoins techniques ou administratifs
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card border-warning h-100">
                  <div className="card-body text-center">
                    <i className="bi bi-toggle-on display-4 text-warning mb-3"></i>
                    <h6>Statut de Disponibilité</h6>
                    <p className="small text-muted mb-0">
                      Outil collaboratif pour faciliter la coordination si vous le souhaitez
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="alert alert-success mt-3 mb-0">
              <strong><i className="bi bi-check-circle me-2"></i>À votre service :</strong> Ces outils sont là pour vous faciliter
              la vie et optimiser votre efficacité commerciale. Vous choisissez ceux que vous souhaitez utiliser.
            </div>
          </div>
        </div>

        {/* Référent : accompagnement disponible */}
        <div className="card mb-4 border-info">
          <div className="card-header bg-info text-white">
            <h5 className="mb-0">
              <i className="bi bi-person-badge me-2"></i>
              Votre Référent : Un Accompagnement Disponible
            </h5>
          </div>
          <div className="card-body">
            <p className="lead mb-3">
              Un <strong>référent</strong> est mis à votre disposition pour vous accompagner si vous le souhaitez.
              Vous restez libre de solliciter son aide quand vous en ressentez le besoin.
            </p>

            <h6><i className="bi bi-chat-left-dots me-2"></i>Quand vous pouvez le solliciter :</h6>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <div className="card border-info h-100">
                  <div className="card-body">
                    <h6 className="text-info">Questions commerciales</h6>
                    <ul className="small mb-0">
                      <li>Aide sur la notation financière d&apos;un client</li>
                      <li>Conseil sur le choix de fournisseur selon le score</li>
                      <li>Demande de comparatif tarifaire</li>
                      <li>Conseils sur une négociation</li>
                      <li>Échanges avant un rendez-vous important</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card border-info h-100">
                  <div className="card-body">
                    <h6 className="text-info">Accompagnement et formation</h6>
                    <ul className="small mb-0">
                      <li>Accès aux formations disponibles</li>
                      <li>Retour d&apos;expérience après une vente</li>
                      <li>Soutien technique ou conseil métier</li>
                      <li>Questions sur les process fournisseurs</li>
                      <li>Demande d&apos;aide ou de support</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="alert alert-info mb-0">
              <strong><i className="bi bi-person-check me-2"></i>À votre écoute :</strong> Votre référent est là pour vous accompagner
              si vous en exprimez le besoin. Son rôle est de vous apporter un soutien, des conseils et de l&apos;expertise,
              dans le respect de votre indépendance.
            </div>
          </div>
        </div>

        {/* Support technique */}
        <div className="card mb-4 border-secondary">
          <div className="card-header bg-secondary text-white">
            <h5 className="mb-0">
              <i className="bi bi-building me-2"></i>
              Support Technique Disponible
            </h5>
          </div>
          <div className="card-body">
            <p className="lead mb-3">
              Un service de support technique est également disponible pour vos besoins spécifiques.
            </p>

            <h6><i className="bi bi-list-check me-2"></i>Services disponibles :</h6>
            <ul>
              <li><strong>Support technique :</strong> Aide sur les outils, tunnels de souscription, bugs éventuels</li>
              <li><strong>Questions administratives :</strong> Informations sur vos commissions, contrats</li>
              <li><strong>Accès fournisseurs :</strong> Demandes d&apos;accès aux tunnels C4 ou autres fournisseurs</li>
              <li><strong>Autres besoins :</strong> Tout besoin opérationnel pour faciliter votre activité</li>
            </ul>

            <div className="alert alert-secondary mb-0">
              <strong><i className="bi bi-info-circle me-2"></i>À noter :</strong> Votre référent reste votre contact privilégié
              pour les questions commerciales. Le support technique intervient pour les aspects techniques et administratifs.
            </div>
          </div>
        </div>

        {/* Suggestions d'organisation */}
        <div className="card mb-4">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">
              <i className="bi bi-list-ol me-2"></i>
              Suggestions pour Optimiser Votre Activité
            </h5>
          </div>
          <div className="card-body">
            <h6 className="mb-3">Quelques bonnes pratiques qui peuvent vous aider :</h6>

            <div className="accordion" id="accordionSuggestions">
              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#etape1">
                    <strong>1. Signaler votre disponibilité (si vous le souhaitez)</strong>
                  </button>
                </h2>
                <div id="etape1" className="accordion-collapse collapse show" data-bs-parent="#accordionSuggestions">
                  <div className="accordion-body">
                    <p className="mb-2"><strong>Pour optimiser les opportunités :</strong></p>
                    <ul className="mb-0">
                      <li>Connectez-vous à l&apos;application LILIWATT</li>
                      <li>Mettez à jour votre statut si vous souhaitez recevoir des opportunités</li>
                      <li>Cela aide votre référent à identifier les moments propices pour vous contacter</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#etape2">
                    <strong>2. Utiliser les outils disponibles</strong>
                  </button>
                </h2>
                <div id="etape2" className="accordion-collapse collapse" data-bs-parent="#accordionSuggestions">
                  <div className="accordion-body">
                    <ul className="mb-0">
                      <li>Consultez les bases de données mises à disposition</li>
                      <li>Utilisez l&apos;agenda pour planifier votre activité</li>
                      <li>Vérifiez vos messages pour les opportunités partagées</li>
                      <li>Préparez votre approche commerciale</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#etape3">
                    <strong>3. Prospecter selon votre méthode</strong>
                  </button>
                </h2>
                <div id="etape3" className="accordion-collapse collapse" data-bs-parent="#accordionSuggestions">
                  <div className="accordion-body">
                    <ul className="mb-0">
                      <li>Contactez vos prospects par téléphone ou en personne, selon votre préférence</li>
                      <li>Présentez les solutions énergétiques professionnelles</li>
                      <li>Identifiez les besoins et proposez l&apos;offre adaptée</li>
                      <li>En cas de besoin, sollicitez votre référent pour un conseil</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#etape4">
                    <strong>4. Demander une notation financière (si besoin)</strong>
                  </button>
                </h2>
                <div id="etape4" className="accordion-collapse collapse" data-bs-parent="#accordionSuggestions">
                  <div className="accordion-body">
                    <ul className="mb-0">
                      <li>Si un prospect est intéressé, vous pouvez demander sa notation financière</li>
                      <li>Le score vous sera communiqué rapidement</li>
                      <li>Selon le score, orientez le client vers le fournisseur adapté</li>
                      <li>Votre référent peut vous aider pour les comparatifs tarifaires</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#etape5">
                    <strong>5. Conclure la vente via les tunnels</strong>
                  </button>
                </h2>
                <div id="etape5" className="accordion-collapse collapse" data-bs-parent="#accordionSuggestions">
                  <div className="accordion-body">
                    <ul className="mb-0">
                      <li>Utilisez les tunnels de souscription mis à disposition</li>
                      <li>Remplissez les informations du client</li>
                      <li>Récupérez les documents nécessaires (KBIS, facture d&apos;énergie, etc.)</li>
                      <li>Finalisez la souscription</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#etape6">
                    <strong>6. Déclarer votre vente (recommandé)</strong>
                  </button>
                </h2>
                <div id="etape6" className="accordion-collapse collapse" data-bs-parent="#accordionSuggestions">
                  <div className="accordion-body">
                    <ul className="mb-0">
                      <li>Il est recommandé de déclarer vos ventes dans l&apos;application</li>
                      <li>Cela facilite le suivi de votre activité</li>
                      <li>Vous gardez une trace de vos performances</li>
                      <li>Votre rémunération est ainsi mieux suivie</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#etape7">
                    <strong>7. Suivre vos commissions</strong>
                  </button>
                </h2>
                <div id="etape7" className="accordion-collapse collapse" data-bs-parent="#accordionSuggestions">
                  <div className="accordion-body">
                    <ul className="mb-0">
                      <li>Vous pouvez utiliser l&apos;outil de suivi de vos commissions</li>
                      <li>Gardez une trace de votre activité commerciale</li>
                      <li>Suivez l&apos;évolution de vos revenus</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#etape8">
                    <strong>8. Profiter de l&apos;accompagnement disponible</strong>
                  </button>
                </h2>
                <div id="etape8" className="accordion-collapse collapse" data-bs-parent="#accordionSuggestions">
                  <div className="accordion-body">
                    <ul className="mb-0">
                      <li>N&apos;hésitez pas à échanger avec votre référent si vous le souhaitez</li>
                      <li>Partagez vos succès ou vos difficultés si vous en ressentez le besoin</li>
                      <li>Profitez de l&apos;expertise mise à disposition</li>
                      <li>Demandez des formations si vous souhaitez monter en compétence</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Montée en compétence */}
        <div className="card mb-4 border-warning">
          <div className="card-header bg-warning text-dark">
            <h5 className="mb-0">
              <i className="bi bi-graph-up me-2"></i>
              Opportunités de Formation
            </h5>
          </div>
          <div className="card-body">
            <p className="lead mb-3">
              Le marché de l&apos;énergie est vaste et complexe. Des formations et un accompagnement sont disponibles
              si vous souhaitez développer votre expertise.
            </p>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <div className="card border-success h-100">
                  <div className="card-header bg-light">
                    <strong><i className="bi bi-book me-2"></i>Formations disponibles</strong>
                  </div>
                  <div className="card-body">
                    <ul className="small mb-0">
                      <li>Demandez des formations sur les sujets que vous souhaitez approfondir</li>
                      <li>Participez aux sessions proposées si elles vous intéressent</li>
                      <li>Profitez des retours d&apos;expérience partagés</li>
                      <li>Échangez avec d&apos;autres opérateurs de marché</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card border-success h-100">
                  <div className="card-header bg-light">
                    <strong><i className="bi bi-people me-2"></i>Accompagnement personnalisé</strong>
                  </div>
                  <div className="card-body">
                    <ul className="small mb-0">
                      <li>Votre référent peut identifier vos besoins de formation</li>
                      <li>Il adapte son accompagnement selon vos demandes</li>
                      <li>Il partage ses bonnes pratiques si vous le souhaitez</li>
                      <li>Il reconnaît vos succès et vous encourage</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="alert alert-success mb-0">
              <strong><i className="bi bi-trophy me-2"></i>À votre rythme :</strong> Développez votre expertise du marché de l&apos;énergie
              professionnelle à votre rythme, selon vos besoins et vos objectifs personnels.
            </div>
          </div>
        </div>

        {/* Bonnes pratiques */}
        <div className="card border-primary">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">
              <i className="bi bi-star me-2"></i>
              Recommandations pour Optimiser Votre Activité
            </h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <h6 className="text-primary">
                  <i className="bi bi-check2-circle me-2"></i>
                  Suggestions utiles
                </h6>
                <ul>
                  <li><strong>Utiliser l&apos;outil de disponibilité</strong> pour optimiser les opportunités</li>
                  <li>Profiter des outils mis à disposition</li>
                  <li>Solliciter le référent en cas de besoin ou question</li>
                  <li>Déclarer vos ventes pour suivre votre activité</li>
                  <li>Communiquer si vous souhaitez des échanges</li>
                  <li>Demander des formations selon vos besoins</li>
                  <li>Partager vos retours d&apos;expérience si vous le souhaitez</li>
                  <li>Profiter de l&apos;accompagnement disponible</li>
                  <li>Maintenir une approche professionnelle avec vos clients</li>
                  <li>Respecter les process fournisseurs pour vos souscriptions</li>
                </ul>
              </div>
              <div className="col-md-6">
                <h6 className="text-info">
                  <i className="bi bi-lightbulb me-2"></i>
                  Points d&apos;attention
                </h6>
                <ul>
                  <li>Pensez à signaler votre disponibilité pour ne pas manquer d&apos;opportunités</li>
                  <li>N&apos;hésitez pas à communiquer pour faciliter la collaboration</li>
                  <li>Déclarez vos ventes pour garder une trace de votre activité</li>
                  <li>Consultez régulièrement vos messages pour les opportunités</li>
                  <li>N&apos;hésitez pas à demander de l&apos;aide en cas de blocage</li>
                  <li>Profitez des outils pour optimiser votre efficacité</li>
                  <li>Vérifiez les scores clients avant de proposer un fournisseur</li>
                  <li>Profitez des formations pour développer vos compétences</li>
                  <li>Soignez votre professionnalisme avec les clients</li>
                  <li>Restez informé sur les évolutions du marché</li>
                </ul>
              </div>
            </div>

            <div className="alert alert-primary mt-3 mb-0">
              <strong><i className="bi bi-briefcase me-2"></i>Votre indépendance avant tout :</strong> Vous êtes un professionnel indépendant.
              Ces outils et cet accompagnement sont mis à votre disposition pour faciliter votre activité, sans aucune obligation.
              Vous restez libre de votre organisation, de vos méthodes et de votre temps de travail.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
