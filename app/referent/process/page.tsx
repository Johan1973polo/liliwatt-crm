import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/Navbar';

export default async function ReferentProcessPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'REFERENT') {
    redirect('/auth/signin');
  }

  // Récupérer les notifications non lues (SAUF performances)
  const unreadCount = await prisma.notification.count({
    where: {
      userId: session.user.id,
      isRead: false,
      kind: 'MESSAGE',
    },
  });

  // Compter les notifications de performances non lues
  const performancesActivityCount = await prisma.notification.count({
    where: {
      userId: session.user.id,
      kind: { in: ['SALE_MADE', 'INVOICE_RECEIVED'] },
      isRead: false,
    },
  });

  return (
    <>
      <Navbar
        userEmail={session.user.email}
        userRole={session.user.role}
        userAvatar={session.user.avatar}
        notificationCount={unreadCount}
        performancesActivityCount={performancesActivityCount}
      />

      <div className="container-fluid py-4">
        <div className="mb-4">
          <h1 className="h2 mb-1">
            <i className="bi bi-diagram-3 me-2"></i>
            Process Référent
          </h1>
          <p className="text-muted mb-0">Garant du développement de la politique commerciale</p>
        </div>

        {/* Mission du Référent */}
        <div className="card mb-4 border-primary">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">
              <i className="bi bi-award me-2"></i>
              Rôle et Mission du Référent
            </h5>
          </div>
          <div className="card-body">
            <p className="lead">
              Le Référent est le <strong>véritable garant du développement de la politique commerciale de l&apos;entreprise</strong>.
            </p>
            <div className="alert alert-info mb-0">
              <i className="bi bi-info-circle me-2"></i>
              <strong>Responsabilité principale :</strong> Piloter et développer son équipe de vendeurs pour assurer la croissance et la performance commerciale de l&apos;entreprise.
            </div>
          </div>
        </div>

        {/* Les 5 missions principales */}
        <div className="row g-4 mb-4">
          <div className="col-md-6 col-lg-4">
            <div className="card h-100 border-success">
              <div className="card-header bg-success text-white">
                <h6 className="mb-0">
                  <i className="bi bi-1-circle me-2"></i>
                  Organiser le recrutement
                </h6>
              </div>
              <div className="card-body">
                <p className="mb-0">Planifier et structurer les actions de recrutement pour développer l&apos;équipe commerciale.</p>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-4">
            <div className="card h-100 border-success">
              <div className="card-header bg-success text-white">
                <h6 className="mb-0">
                  <i className="bi bi-2-circle me-2"></i>
                  Exécuter le recrutement
                </h6>
              </div>
              <div className="card-body">
                <p className="mb-0">Mener les entretiens, sélectionner les candidats et finaliser les recrutements.</p>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-4">
            <div className="card h-100 border-success">
              <div className="card-header bg-success text-white">
                <h6 className="mb-0">
                  <i className="bi bi-3-circle me-2"></i>
                  Placer des intégrations
                </h6>
              </div>
              <div className="card-body">
                <p className="mb-0">Assurer l&apos;onboarding et l&apos;intégration des nouveaux vendeurs dans l&apos;équipe.</p>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-4">
            <div className="card h-100 border-success">
              <div className="card-header bg-success text-white">
                <h6 className="mb-0">
                  <i className="bi bi-4-circle me-2"></i>
                  Organiser et suivre les objectifs
                </h6>
              </div>
              <div className="card-body">
                <p className="mb-0">Définir les objectifs de l&apos;équipe, suivre les performances et accompagner les vendeurs.</p>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-4">
            <div className="card h-100 border-success">
              <div className="card-header bg-success text-white">
                <h6 className="mb-0">
                  <i className="bi bi-5-circle me-2"></i>
                  Remonter les informations
                </h6>
              </div>
              <div className="card-body">
                <p className="mb-0">Faire remonter au back-office et à la direction les éventuels besoins et problématiques.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Utilisation de l'Agenda */}
        <div className="card mb-4">
          <div className="card-header bg-info text-white">
            <h5 className="mb-0">
              <i className="bi bi-calendar-week me-2"></i>
              Utilisation de l&apos;Agenda
            </h5>
          </div>
          <div className="card-body">
            <div className="alert alert-info">
              <h6 className="alert-heading">
                <i className="bi bi-lightbulb me-2"></i>
                L&apos;agenda est un outil très utile !
              </h6>
              <p className="mb-0">Utilisez l&apos;agenda pour organiser et positionner efficacement vos sessions de recrutement.</p>
            </div>

            <h6 className="mb-3">
              <i className="bi bi-calendar-check me-2"></i>
              Comment utiliser l&apos;agenda pour le recrutement
            </h6>

            <div className="row g-3">
              <div className="col-md-6">
                <div className="card border-info h-100">
                  <div className="card-header bg-light">
                    <strong>
                      <i className="bi bi-calendar-plus me-2"></i>
                      Planifier vos sessions
                    </strong>
                  </div>
                  <div className="card-body">
                    <ul className="mb-0">
                      <li>Créez des événements pour vos entretiens de recrutement</li>
                      <li>Bloquez des créneaux dédiés au recrutement</li>
                      <li>Planifiez les intégrations des nouveaux vendeurs</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card border-info h-100">
                  <div className="card-header bg-light">
                    <strong>
                      <i className="bi bi-people me-2"></i>
                      Organiser les rendez-vous
                    </strong>
                  </div>
                  <div className="card-body">
                    <ul className="mb-0">
                      <li>Programmez les entretiens avec les candidats</li>
                      <li>Organisez les réunions d&apos;équipe</li>
                      <li>Planifiez les points de suivi individuel</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="alert alert-success mt-3 mb-0">
              <i className="bi bi-check-circle me-2"></i>
              <strong>Avantage :</strong> Une meilleure organisation permet d&apos;optimiser votre temps et d&apos;augmenter l&apos;efficacité du recrutement.
            </div>
          </div>
        </div>

        {/* Système Disponible / Pas Disponible */}
        <div className="card mb-4">
          <div className="card-header bg-warning text-dark">
            <h5 className="mb-0">
              <i className="bi bi-toggle-on me-2"></i>
              Système Disponible / Pas Disponible des Vendeurs
            </h5>
          </div>
          <div className="card-body">
            <div className="alert alert-info mb-3">
              <i className="bi bi-info-circle me-2"></i>
              <strong>Important :</strong> Ce sont les <strong>vendeurs</strong> qui affichent leur disponibilité, pas vous. Vous pouvez ainsi solliciter les vendeurs qui se sont déclarés disponibles.
            </div>

            <p className="lead">
              Le statut de disponibilité permet aux vendeurs de gérer leur présence et leur capacité à prendre en charge de nouvelles missions.
            </p>

            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <div className="card border-success h-100">
                  <div className="card-header bg-success text-white">
                    <strong>
                      <i className="bi bi-check-circle me-2"></i>
                      Vendeur Disponible
                    </strong>
                  </div>
                  <div className="card-body">
                    <h6>Signification :</h6>
                    <ul>
                      <li>Le vendeur est actif et présent</li>
                      <li>Il peut prendre en charge de nouvelles opportunités</li>
                      <li>Vous pouvez le solliciter pour des missions</li>
                    </ul>
                    <div className="alert alert-success mb-0">
                      <small><strong>Action :</strong> Profitez-en pour assigner des prospects ou organiser des briefings</small>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card border-danger h-100">
                  <div className="card-header bg-danger text-white">
                    <strong>
                      <i className="bi bi-x-circle me-2"></i>
                      Vendeur Pas Disponible
                    </strong>
                  </div>
                  <div className="card-body">
                    <h6>Signification :</h6>
                    <ul>
                      <li>Le vendeur est absent ou indisponible</li>
                      <li>Il ne peut pas traiter de nouvelles demandes</li>
                      <li>Congés, formation, ou indisponibilité temporaire</li>
                    </ul>
                    <div className="alert alert-danger mb-0">
                      <small><strong>Action :</strong> Ne pas assigner de nouvelles missions à ce vendeur</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="alert alert-warning mb-3">
              <h6 className="alert-heading">
                <i className="bi bi-exclamation-triangle me-2"></i>
                Bonne pratique : Rappeler régulièrement à votre équipe
              </h6>
              <p className="mb-0">
                <strong>Sensibilisez vos vendeurs à déclarer leur disponibilité !</strong> Rappelez-leur souvent l&apos;importance de mettre à jour leur statut pour une meilleure organisation de l&apos;équipe et une répartition efficace des missions.
              </p>
            </div>

            <div className="card border-primary">
              <div className="card-header bg-light">
                <strong>
                  <i className="bi bi-lightbulb me-2"></i>
                  Utilité pour vous en tant que référent
                </strong>
              </div>
              <div className="card-body">
                <ul className="mb-0">
                  <li>Visualiser rapidement qui est disponible dans votre équipe</li>
                  <li>Optimiser la répartition des prospects et missions</li>
                  <li>Planifier les briefings avec les vendeurs disponibles</li>
                  <li>Éviter de solliciter les vendeurs en congés ou absents</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Process de gestion d'équipe */}
        <div className="card mb-4">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">
              <i className="bi bi-people-fill me-2"></i>
              Gestion et Suivi de l&apos;Équipe
            </h5>
          </div>
          <div className="card-body">
            <h6 className="mb-3">
              <i className="bi bi-list-task me-2"></i>
              Processus quotidien
            </h6>

            <div className="accordion" id="accordionGestionEquipe">
              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#recrutement">
                    <strong>1. Recrutement et Intégration</strong>
                  </button>
                </h2>
                <div id="recrutement" className="accordion-collapse collapse show" data-bs-parent="#accordionGestionEquipe">
                  <div className="accordion-body">
                    <h6>Actions à mener :</h6>
                    <ul>
                      <li>Identifier les besoins en recrutement de l&apos;équipe</li>
                      <li>Publier les offres et sélectionner les candidats</li>
                      <li>Mener les entretiens de recrutement</li>
                      <li>Soumettre les demandes d&apos;intégration au back-office</li>
                      <li>Assurer l&apos;onboarding et l&apos;accompagnement initial</li>
                    </ul>
                    <div className="alert alert-info mb-0">
                      <strong>Astuce :</strong> Utilisez l&apos;agenda pour planifier vos sessions de recrutement à l&apos;avance.
                    </div>
                  </div>
                </div>
              </div>

              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#objectifs">
                    <strong>2. Définition et Suivi des Objectifs</strong>
                  </button>
                </h2>
                <div id="objectifs" className="accordion-collapse collapse" data-bs-parent="#accordionGestionEquipe">
                  <div className="accordion-body">
                    <p className="lead mb-3">
                      En tant que référent, vous êtes responsable de la définition des objectifs commerciaux de votre équipe et de leur suivi régulier.
                      Cette mission est essentielle pour maintenir la motivation et assurer la croissance de la performance collective.
                    </p>

                    <h6><i className="bi bi-target me-2"></i>Comment définir les objectifs :</h6>
                    <div className="card border-primary mb-3">
                      <div className="card-body">
                        <ul className="mb-0">
                          <li><strong>Objectifs SMART :</strong> Spécifiques, Mesurables, Atteignables, Réalistes et Temporels</li>
                          <li><strong>Individualisation :</strong> Adapter les objectifs selon le niveau et l&apos;expérience de chaque vendeur</li>
                          <li><strong>Progression :</strong> Fixer des paliers de progression clairs et motivants</li>
                          <li><strong>Alignement stratégique :</strong> S&apos;assurer que les objectifs individuels servent la stratégie globale de l&apos;entreprise</li>
                        </ul>
                      </div>
                    </div>

                    <h6><i className="bi bi-graph-up-arrow me-2"></i>Comment suivre les objectifs :</h6>
                    <div className="card border-success mb-3">
                      <div className="card-body">
                        <ul className="mb-0">
                          <li><strong>Points de suivi hebdomadaires :</strong> Organiser des points réguliers avec chaque vendeur</li>
                          <li><strong>Analyse des performances :</strong> Utiliser les indicateurs clés (nombre de ventes, CA généré, taux de conversion)</li>
                          <li><strong>Feedback constructif :</strong> Identifier les réussites et les axes d&apos;amélioration</li>
                          <li><strong>Ajustements :</strong> Réviser les objectifs si nécessaire en fonction des résultats et du contexte</li>
                          <li><strong>Reconnaissance :</strong> Célébrer les succès et encourager les efforts</li>
                        </ul>
                      </div>
                    </div>

                    <div className="alert alert-success mb-0">
                      <strong><i className="bi bi-trophy me-2"></i>Objectif final :</strong> Assurer la croissance continue de la performance de votre équipe tout en maintenant un haut niveau de motivation et d&apos;engagement.
                    </div>
                  </div>
                </div>
              </div>

              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#communication">
                    <strong>3. Communication et Remontées</strong>
                  </button>
                </h2>
                <div id="communication" className="accordion-collapse collapse" data-bs-parent="#accordionGestionEquipe">
                  <div className="accordion-body">
                    <p className="lead mb-3">
                      Le référent est un maillon essentiel de la communication au sein de l&apos;entreprise. Vous devez maintenir un contact permanent
                      avec le <strong>back-office</strong> et la <strong>direction commerciale</strong> pour assurer le bon fonctionnement de votre équipe
                      et remonter les informations cruciales.
                    </p>

                    <h6><i className="bi bi-diagram-3 me-2"></i>Vos interlocuteurs privilégiés :</h6>
                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <div className="card border-primary h-100">
                          <div className="card-header bg-primary text-white">
                            <strong>
                              <i className="bi bi-building me-2"></i>
                              Back-Office
                            </strong>
                          </div>
                          <div className="card-body">
                            <p className="small mb-2"><strong>Contact quotidien pour :</strong></p>
                            <ul className="small mb-0">
                              <li>Demandes d&apos;intégration de nouveaux vendeurs</li>
                              <li>Demandes de tunnels C4 et accès fournisseurs</li>
                              <li>Problèmes techniques ou administratifs</li>
                              <li>Besoins en bases de données</li>
                              <li>Support opérationnel quotidien</li>
                              <li>Demandes de formation pour vos vendeurs</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="card border-danger h-100">
                          <div className="card-header bg-danger text-white">
                            <strong>
                              <i className="bi bi-briefcase me-2"></i>
                              Direction Commerciale
                            </strong>
                          </div>
                          <div className="card-body">
                            <p className="small mb-2"><strong>Contact régulier pour :</strong></p>
                            <ul className="small mb-0">
                              <li>Problématiques stratégiques et commerciales</li>
                              <li>Propositions d&apos;amélioration des process</li>
                              <li>Alertes sur les performances de l&apos;équipe</li>
                              <li>Besoins en ressources ou support</li>
                              <li>Feedback sur les nouveaux produits/fournisseurs</li>
                              <li>Participation aux orientations stratégiques</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="alert alert-warning mb-0">
                      <strong><i className="bi bi-exclamation-triangle me-2"></i>Impératif :</strong> Vous devez être en contact permanent avec le back-office et la direction commerciale.
                      Une communication claire, fluide et régulière est la clé du bon fonctionnement de votre équipe et de l&apos;entreprise dans son ensemble.
                      N&apos;hésitez jamais à remonter les informations importantes !
                    </div>
                  </div>
                </div>
              </div>

              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#developpement">
                    <strong>4. Développement de la Politique Commerciale</strong>
                  </button>
                </h2>
                <div id="developpement" className="accordion-collapse collapse" data-bs-parent="#accordionGestionEquipe">
                  <div className="accordion-body">
                    <p className="lead mb-3">
                      En tant que <strong>garant du développement de la politique commerciale</strong>, vous êtes le relais entre la direction commerciale
                      et votre équipe de vendeurs. Vous devez appliquer et déployer la stratégie commerciale de l&apos;entreprise sur le terrain.
                    </p>

                    <h6><i className="bi bi-arrow-down-circle me-2"></i>Réception et déploiement des directives :</h6>
                    <div className="card border-info mb-3">
                      <div className="card-body">
                        <p className="mb-2"><strong>La direction commerciale peut vous solliciter pour :</strong></p>
                        <ul className="mb-0">
                          <li><strong>Intégration de nouveaux fournisseurs :</strong> Vous recevrez les informations sur les nouveaux partenaires énergétiques
                            (conditions, grilles tarifaires, process de souscription) que vous devez transmettre et expliquer à vos vendeurs</li>
                          <li><strong>Mise en place de nouveaux process :</strong> Nouvelles procédures commerciales, outils ou méthodes de vente à déployer
                            auprès de votre équipe</li>
                          <li><strong>Évolution des offres :</strong> Changements tarifaires, nouvelles options ou conditions contractuelles à répliquer</li>
                          <li><strong>Nouvelles orientations stratégiques :</strong> Objectifs commerciaux, segments de marché prioritaires, actions spéciales</li>
                        </ul>
                      </div>
                    </div>

                    <h6><i className="bi bi-arrow-right-circle me-2"></i>Votre rôle de transmission :</h6>
                    <div className="card border-warning mb-3">
                      <div className="card-body">
                        <p className="mb-2"><strong>Vous devez répliquer ces directives auprès de vos vendeurs :</strong></p>
                        <ol className="mb-0">
                          <li><strong>Comprendre :</strong> Assimiler parfaitement les nouvelles directives de la direction</li>
                          <li><strong>Adapter :</strong> Traduire ces directives en actions concrètes et applicables pour vos vendeurs</li>
                          <li><strong>Former :</strong> Organiser des sessions de formation pour expliquer les nouveautés</li>
                          <li><strong>Accompagner :</strong> Soutenir vos vendeurs dans la mise en application des nouvelles pratiques</li>
                          <li><strong>Suivre :</strong> Vérifier que les nouvelles directives sont bien appliquées sur le terrain</li>
                          <li><strong>Remonter :</strong> Faire un retour à la direction sur les difficultés rencontrées ou les succès observés</li>
                        </ol>
                      </div>
                    </div>

                    <h6><i className="bi bi-clipboard-check me-2"></i>Responsabilités additionnelles :</h6>
                    <ul>
                      <li>Veiller à l&apos;application quotidienne de la stratégie commerciale</li>
                      <li>Identifier les opportunités de croissance et les remonter à la direction</li>
                      <li>Former et développer continuellement les compétences de votre équipe</li>
                      <li>Assurer la qualité du service client et l&apos;image de l&apos;entreprise</li>
                      <li>Contribuer activement à l&apos;innovation et à l&apos;amélioration continue</li>
                    </ul>

                    <div className="alert alert-primary mb-0">
                      <strong><i className="bi bi-lightning-charge me-2"></i>Votre impact :</strong> Vous êtes le pont entre la stratégie décidée en haut
                      et l&apos;exécution sur le terrain. La réussite de votre équipe et la bonne application de la politique commerciale dépendent
                      directement de votre capacité à transmettre, former et accompagner vos vendeurs. Vous êtes un pilier essentiel du développement commercial.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Outils à disposition */}
        <div className="card mb-4 border-success">
          <div className="card-header bg-success text-white">
            <h5 className="mb-0">
              <i className="bi bi-tools me-2"></i>
              Outils à Votre Disposition
            </h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-4">
                <div className="card border-success h-100">
                  <div className="card-body text-center">
                    <i className="bi bi-calendar-week display-4 text-success mb-3"></i>
                    <h6>Agenda</h6>
                    <p className="small mb-0">Planification et organisation du recrutement</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card border-success h-100">
                  <div className="card-body text-center">
                    <i className="bi bi-people display-4 text-success mb-3"></i>
                    <h6>Gestion d&apos;Équipe</h6>
                    <p className="small mb-0">Suivi de vos vendeurs et leurs performances</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card border-success h-100">
                  <div className="card-body text-center">
                    <i className="bi bi-chat-dots display-4 text-success mb-3"></i>
                    <h6>Messagerie</h6>
                    <p className="small mb-0">Communication avec la direction et le back-office</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card border-success h-100">
                  <div className="card-body text-center">
                    <i className="bi bi-clipboard-check display-4 text-success mb-3"></i>
                    <h6>Demandes</h6>
                    <p className="small mb-0">Soumission de demandes au back-office</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card border-success h-100">
                  <div className="card-body text-center">
                    <i className="bi bi-graph-up-arrow display-4 text-success mb-3"></i>
                    <h6>Performances</h6>
                    <p className="small mb-0">Suivi des résultats de votre équipe</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card border-success h-100">
                  <div className="card-body text-center">
                    <i className="bi bi-link-45deg display-4 text-success mb-3"></i>
                    <h6>Liens d&apos;Équipe</h6>
                    <p className="small mb-0">Gestion des liens pour votre équipe</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Missions et responsabilités supplémentaires */}
        <div className="card mb-4 border-info">
          <div className="card-header bg-info text-white">
            <h5 className="mb-0">
              <i className="bi bi-clipboard-check me-2"></i>
              Missions et Responsabilités Quotidiennes
            </h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <div className="card border-primary h-100">
                  <div className="card-header bg-light">
                    <strong><i className="bi bi-calculator me-2"></i>Notation financière et comparatifs</strong>
                  </div>
                  <div className="card-body">
                    <ul className="mb-0">
                      <li>Répondre aux demandes de notation financière des entreprises clientes</li>
                      <li>Effectuer les comparatifs tarifaires pour les vendeurs</li>
                      <li>Analyser les scores clients et orienter vers les bons fournisseurs</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card border-primary h-100">
                  <div className="card-header bg-light">
                    <strong><i className="bi bi-database me-2"></i>Gestion des bases de données</strong>
                  </div>
                  <div className="card-body">
                    <ul className="mb-0">
                      <li>Remonter les besoins de rechargement de bases de données</li>
                      <li>Aider les prospecteurs à optimiser leurs fichiers</li>
                      <li>Coordonner avec le back-office pour les approvisionnements</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card border-success h-100">
                  <div className="card-header bg-light">
                    <strong><i className="bi bi-headset me-2"></i>Accompagnement technique</strong>
                  </div>
                  <div className="card-body">
                    <ul className="mb-0">
                      <li>Apporter un soutien technique aux vendeurs</li>
                      <li>Résoudre les problèmes rencontrés sur le terrain</li>
                      <li>Former aux outils et processus de vente</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card border-success h-100">
                  <div className="card-header bg-light">
                    <strong><i className="bi bi-chat-left-quote me-2"></i>Briefing et débriefing</strong>
                  </div>
                  <div className="card-body">
                    <ul className="mb-0">
                      <li>Accompagner les vendeurs dans le briefing avant une vente</li>
                      <li>Organiser des débriefings après les ventes</li>
                      <li>Analyser les succès et les points d&apos;amélioration</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card border-warning h-100">
                  <div className="card-header bg-light">
                    <strong><i className="bi bi-people-fill me-2"></i>Animation d&apos;équipe</strong>
                  </div>
                  <div className="card-body">
                    <ul className="mb-0">
                      <li>Animer votre réseau et votre équipe quotidiennement</li>
                      <li>Apporter du positif et maintenir la motivation</li>
                      <li>Organiser des sessions de formation régulières</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card border-warning h-100">
                  <div className="card-header bg-light">
                    <strong><i className="bi bi-mortarboard me-2"></i>Formation et développement</strong>
                  </div>
                  <div className="card-body">
                    <ul className="mb-0">
                      <li>Déterminer les vendeurs en manque de formation</li>
                      <li>Créer des plans de développement personnalisés</li>
                      <li>Montrer l&apos;exemple et être un modèle pour l&apos;équipe</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="alert alert-primary mt-3 mb-0">
              <strong><i className="bi bi-trophy me-2"></i>Votre rôle de leader :</strong> Vous êtes le pilier de votre équipe. Votre capacité à accompagner, former et motiver vos vendeurs détermine directement leur succès et celui de l&apos;entreprise.
            </div>
          </div>
        </div>

        {/* Guide de scoring client */}
        <div className="card mb-4 border-danger">
          <div className="card-header bg-danger text-white">
            <h5 className="mb-0">
              <i className="bi bi-clipboard-data me-2"></i>
              Guide de Scoring Client et Fournisseurs
            </h5>
          </div>
          <div className="card-body">
            <div className="alert alert-danger">
              <strong><i className="bi bi-exclamation-triangle me-2"></i>Section critique :</strong> Ce guide vous permet d&apos;orienter vos vendeurs vers les bons fournisseurs selon le score client. À connaître par cœur !
            </div>

            {/* Cas 1: Score >= 6/10 */}
            <div className="card mb-3 border-success">
              <div className="card-header bg-success text-white">
                <strong>Cas 1 : Score ≥ 6/10 - OHM Energy (Tunnel Classique)</strong>
              </div>
              <div className="card-body">
                <div className="alert alert-success mb-3">
                  <strong>✓ Fournisseur : OHM Energy (Tunnel Classique)</strong>
                </div>
                <h6>Avantages :</h6>
                <ul>
                  <li>Meilleure marge commerciale : <strong>50 € par MWh</strong></li>
                  <li>Possibilité de fixer l&apos;année 2029</li>
                  <li>Client à faible risque, acceptation garantie</li>
                  <li>Électricité ET Gaz disponibles</li>
                </ul>
                <div className="alert alert-warning mb-0">
                  <strong>⚠️ MARGE MINIMALE OHM ENERGY :</strong> La marge minimale à appliquer est de <strong>5 €/MWh</strong>. Maximum jusqu&apos;à 50 €/MWh.
                </div>
              </div>
            </div>

            {/* Cas 2: Score = 5/10 */}
            <div className="card mb-3 border-warning">
              <div className="card-header bg-warning text-dark">
                <strong>Cas 2 : Score = 5/10 - Solutions multiples</strong>
              </div>
              <div className="card-body">
                <p className="mb-3">Suivez l&apos;ordre de priorité ci-dessous :</p>

                <div className="accordion" id="accordionScore5">
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#optionA">
                        <strong>Option A : Demande de dérogation OHM Energy (À PRIVILÉGIER)</strong>
                      </button>
                    </h2>
                    <div id="optionA" className="accordion-collapse collapse show" data-bs-parent="#accordionScore5">
                      <div className="accordion-body">
                        <p><strong>1. Demander une dérogation</strong></p>
                        <p>Soumettez une demande de dérogation au fournisseur OHM Energy. Ils évalueront le dossier au cas par cas.</p>
                        <div className="alert alert-warning">
                          <strong>Limitations en cas d&apos;acceptation :</strong>
                          <ul className="mb-0">
                            <li>Le contrat ne pourra PAS fixer l&apos;année 2029</li>
                            <li>Durée maximale : jusqu&apos;à fin 2028</li>
                            <li>Acceptation à la discrétion d&apos;OHM Energy</li>
                          </ul>
                        </div>
                        <p><strong>Marge : 50 €/MWh</strong> (si accepté)</p>
                      </div>
                    </div>
                  </div>

                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#optionB">
                        <strong>Option B : Solution de refacturation (Collatéral)</strong>
                      </button>
                    </h2>
                    <div id="optionB" className="accordion-collapse collapse" data-bs-parent="#accordionScore5">
                      <div className="accordion-body">
                        <p><strong>2. Vérifier l&apos;existence d&apos;une société collatérale</strong></p>
                        <p>Si le client possède une autre société avec un meilleur score, utilisez cette solution.</p>
                        <h6>Principe de la refacturation :</h6>
                        <ol>
                          <li>Le contrat est établi au nom de la société collatérale (meilleur score)</li>
                          <li>Cette société refacture ensuite l&apos;énergie à la société principale</li>
                          <li>La société principale reçoit l&apos;énergie via refacturation</li>
                        </ol>
                        <div className="alert alert-info">
                          <strong>Conditions :</strong> Le client doit posséder une autre société juridiquement distincte et accepter le mécanisme de refacturation.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#optionC">
                        <strong>Option C : Positionnement chez SOHO</strong>
                      </button>
                    </h2>
                    <div id="optionC" className="accordion-collapse collapse" data-bs-parent="#accordionScore5">
                      <div className="accordion-body">
                        <div className="alert alert-info">
                          <strong>📧 Pas de tunnel de souscription :</strong> Envoyer la demande par email à <code>bo@liliwatt.fr</code>
                        </div>
                        <h6>Caractéristiques :</h6>
                        <ul>
                          <li>Rémunération sur grille tarifaire (pas de marge au MWh)</li>
                          <li>Électricité ET Gaz disponibles</li>
                          <li>Offres : 1 an, 2 ans, 3 ans</li>
                        </ul>
                        <div className="alert alert-info">
                          <strong>📋 Grilles tarifaires :</strong> Disponibles dans la section &quot;Mes infos&quot; de l&apos;LILIWATT App
                        </div>
                        <h6 className="mt-3">💰 Commission SOHO :</h6>
                        <p><strong>Électricité :</strong> Calculée selon la puissance du compteur</p>
                        <p><strong>Gaz (B0/B1 &gt; 30 MWh) :</strong> 2,59 € par MWh consommé</p>
                      </div>
                    </div>
                  </div>

                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#optionD">
                        <strong>Option D : Positionnement chez MINT</strong>
                      </button>
                    </h2>
                    <div id="optionD" className="accordion-collapse collapse" data-bs-parent="#accordionScore5">
                      <div className="accordion-body">
                        <div className="alert alert-warning">
                          <strong>⚠️ MINT - Électricité uniquement :</strong> MINT n&apos;accepte QUE les contrats électricité. Pas de contrat gaz.
                        </div>
                        <div className="alert alert-info">
                          <strong>📧 Pas de tunnel de souscription :</strong> Envoyer la demande par email à <code>bo@liliwatt.fr</code>
                        </div>
                        <h6>Conditions MINT pour C5 :</h6>
                        <ul>
                          <li>Minimum requis : 5 sites</li>
                          <li>Maximum accepté : 100 sites</li>
                        </ul>
                        <h6>💰 Commission MINT :</h6>
                        <p><strong>Calcul :</strong> Puissance du compteur × 2 €</p>
                        <p className="mb-0"><strong>Exemple :</strong> Compteur 36 kVA → Commission de 72 €</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cas 3: Score = 4/10 */}
            <div className="card mb-3 border-danger">
              <div className="card-header bg-danger text-white">
                <strong>Cas 3 : Score = 4/10 - SOHO ou ILEC</strong>
              </div>
              <div className="card-body">
                <div className="alert alert-info">
                  <strong>💡 SOHO : Solution pour C5 avec score 4/10</strong>
                  <p className="mb-0">Le tunnel OHM SOHO est la solution à privilégier avant ILEC.</p>
                </div>
                <div className="alert alert-danger">
                  <strong>⚠️ Rappel des conditions SOHO :</strong>
                  <ul className="mb-0">
                    <li>Segment C5 uniquement (SOHO n&apos;accepte PAS les C4)</li>
                    <li>Score 4/10 requis</li>
                    <li>SOHO doit être privilégié avant ILEC pour ces clients</li>
                  </ul>
                </div>
                <p><strong>Commission société :</strong> Selon grille tarifaire basée sur la puissance du compteur</p>
              </div>
            </div>

            {/* Cas 4: Score < 4/10 */}
            <div className="card border-dark">
              <div className="card-header bg-dark text-white">
                <strong>Cas 4 : Score &lt; 4/10 - ILEC uniquement</strong>
              </div>
              <div className="card-body">
                <div className="alert alert-dark">
                  <strong>🏢 ILEC - Dernier recours</strong>
                  <p className="mb-0">ILEC accepte les clients avec un score inférieur à 4/10.</p>
                </div>
                <h6>Caractéristiques ILEC :</h6>
                <ul>
                  <li>Accepte les scores très bas (&lt; 4/10)</li>
                  <li>Conditions spécifiques à négocier</li>
                  <li>Commission selon grille tarifaire</li>
                </ul>
                <div className="alert alert-info mb-0">
                  <strong>📧 Contact :</strong> Envoyer la demande à <code>bo@liliwatt.fr</code>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bonnes pratiques */}
        <div className="card border-primary">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">
              <i className="bi bi-star me-2"></i>
              Bonnes Pratiques du Référent
            </h5>
          </div>
          <div className="card-body">
            <div className="alert alert-warning mb-4">
              <h6 className="alert-heading">
                <i className="bi bi-exclamation-diamond me-2"></i>
                Rappels essentiels pour les référents
              </h6>
              <ul className="mb-0">
                <li><strong>Disponibilité des vendeurs :</strong> Rappelez SOUVENT à vos vendeurs de déclarer leur disponibilité. C&apos;est essentiel pour une bonne organisation !</li>
                <li><strong>Connaissance des contrats et scores :</strong> Maîtrisez parfaitement le guide de scoring client ci-dessus. Vous devez pouvoir orienter instantanément vos vendeurs vers le bon fournisseur.</li>
              </ul>
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <h6 className="text-primary">
                  <i className="bi bi-check2-circle me-2"></i>
                  À faire
                </h6>
                <ul>
                  <li><strong>Rappeler régulièrement aux vendeurs de mettre à jour leur disponibilité</strong></li>
                  <li>Connaître par cœur les scores clients et les fournisseurs associés</li>
                  <li>Utiliser l&apos;agenda pour organiser votre recrutement</li>
                  <li>Faire des points réguliers avec votre équipe</li>
                  <li>Répondre rapidement aux demandes de vos vendeurs</li>
                  <li>Effectuer les briefings et débriefings systématiquement</li>
                  <li>Remonter rapidement les besoins au back-office</li>
                  <li>Célébrer les succès de votre équipe</li>
                  <li>Former et accompagner vos vendeurs continuellement</li>
                  <li>Organiser des sessions de formation régulières</li>
                  <li>Montrer l&apos;exemple à votre équipe</li>
                  <li>Apporter du positif et maintenir la motivation</li>
                </ul>
              </div>
              <div className="col-md-6">
                <h6 className="text-danger">
                  <i className="bi bi-x-circle me-2"></i>
                  À éviter
                </h6>
                <ul>
                  <li>Oublier de rappeler aux vendeurs de déclarer leur disponibilité</li>
                  <li>Ignorer les demandes de notation financière de vos vendeurs</li>
                  <li>Négliger les besoins de rechargement de bases de données</li>
                  <li>Reporter indéfiniment les recrutements nécessaires</li>
                  <li>Laisser des problèmes s&apos;accumuler sans les signaler</li>
                  <li>Négliger le suivi des performances de l&apos;équipe</li>
                  <li>Oublier de communiquer avec le back-office et la direction</li>
                  <li>Laisser un vendeur sans accompagnement ou formation</li>
                  <li>Ne pas effectuer les comparatifs demandés par vos vendeurs</li>
                  <li>Ignorer les vendeurs en difficulté ou en manque de formation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
