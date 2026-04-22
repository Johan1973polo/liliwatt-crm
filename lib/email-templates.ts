const header = `<div style="background:linear-gradient(135deg,#7c3aed,#d946ef);border-radius:16px 16px 0 0;padding:32px;text-align:center;">
  <h1 style="color:white;margin:0;font-size:28px;font-weight:700;letter-spacing:2px;">⚡ LILIWATT</h1>
  <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:13px;">Cabinet de courtage en énergie B2B</p>
</div>`;

const footer = `<div style="text-align:center;padding:20px 0;margin-top:24px;">
  <p style="color:#9ca3af;font-size:11px;margin:0;">LILIWATT — LILISTRAT STRATÉGIE SAS — 59 rue de Ponthieu, Bureau 326 — 75008 Paris</p>
</div>`;

const wrap = (content: string) => `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f5f3ff;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:32px 16px;">${header}
<div style="background:white;border-radius:0 0 16px 16px;padding:28px;border:1px solid #e9d5ff;border-top:none;">
${content}
</div>${footer}</div></body></html>`;

const block = (title: string, rows: string) => `<div style="background:#f5f3ff;border-radius:10px;padding:16px;margin-bottom:16px;">
  <h3 style="color:#7c3aed;margin:0 0 10px;font-size:15px;">${title}</h3>
  <table style="width:100%;font-size:14px;border-collapse:collapse;">${rows}</table>
</div>`;

const row = (label: string, value: string) => value ? `<tr><td style="padding:4px 0;color:#6b7280;font-weight:600;width:140px;">${label}</td><td style="color:#1e1b4b;">${value}</td></tr>` : '';

export function renderEmailParrainage({ auteur, auteur_email, auteur_role, candidat, motivation }: any) {
  return wrap(`
    <h2 style="color:#1e1b4b;margin:0 0 20px;font-size:20px;">🤝 Nouvelle recommandation</h2>
    ${block('L\'auteur', row('Nom', auteur) + row('Email', auteur_email) + row('Rôle', auteur_role))}
    ${block('Le candidat', row('Prénom', candidat.prenom) + row('Nom', candidat.nom) + row('Téléphone', `<a href="tel:${candidat.telephone}" style="color:#7c3aed;">${candidat.telephone}</a>`) + row('Email', `<a href="mailto:${candidat.email}" style="color:#7c3aed;">${candidat.email}</a>`))}
    ${block('Motivation', `<p style="color:#374151;margin:0;line-height:1.6;">${motivation || 'Non renseignée'}</p>`)}
    <a href="mailto:${candidat.email}" style="display:block;text-align:center;background:#16a34a;color:white;padding:14px;border-radius:10px;text-decoration:none;font-weight:700;margin-top:20px;">📧 Contacter ${candidat.prenom} ${candidat.nom}</a>
  `);
}

export function renderEmailCarteVisite({ demandeur, poste, telephone_carte, adresse }: any) {
  return wrap(`
    <h2 style="color:#1e1b4b;margin:0 0 20px;font-size:20px;">💳 Demande de carte de visite</h2>
    ${block('Demandeur', row('Nom', demandeur.nom) + row('Email', demandeur.email) + row('Rôle', demandeur.role) + row('Téléphone', demandeur.telephone))}
    ${block('Informations carte', row('Poste', poste) + row('Tél. carte', telephone_carte) + row('Email carte', demandeur.email))}
    ${block('Adresse de livraison', row('Rue', adresse.rue) + row('Code postal', adresse.cp) + row('Ville', adresse.ville) + row('Complément', adresse.complement || '—'))}
  `);
}

export function renderEmailFinCollaboration({ referent, vendeur, date_fin, motif, commentaire }: any) {
  return wrap(`
    <h2 style="color:#1e1b4b;margin:0 0 20px;font-size:20px;">👋 Fin de collaboration</h2>
    ${block('Référent', row('Nom', referent.nom) + row('Email', referent.email))}
    ${block('Collaborateur concerné', row('Email', vendeur.email) + row('Nom', vendeur.nom || '—'))}
    ${block('Détails', row('Date de fin', date_fin) + row('Motif', motif) + `<tr><td colspan="2" style="padding:8px 0;color:#374151;line-height:1.6;">${commentaire || 'Aucun commentaire'}</td></tr>`)}
  `);
}

export function renderEmailAnnonceReferent({ vendeur_prenom, referent_prenom, referent_nom, referent_lien_visio, title, message, date }: any) {
  const meetBtn = referent_lien_visio ? `<div style="text-align:center;margin:24px 0;"><a href="${referent_lien_visio}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#d946ef);color:white;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px;">🎥 Rejoindre le salon de ${referent_prenom}</a></div>` : '';
  return wrap(`
    <p style="color:#1e1b4b;font-size:16px;font-weight:600;margin:0 0 16px;">Bonjour ${vendeur_prenom},</p>
    <p style="color:#4b5563;font-size:14px;line-height:1.7;margin:0 0 22px;">Votre référent <strong>${referent_prenom} ${referent_nom}</strong> vous adresse l'annonce suivante :</p>
    <div style="background:#f5f3ff;border-left:4px solid #7c3aed;border-radius:12px;padding:22px 24px;margin:0 0 24px;">
      <div style="color:#7c3aed;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">📢 ${date}</div>
      <div style="color:#1e1b4b;font-size:20px;font-weight:700;letter-spacing:-0.3px;margin-bottom:14px;line-height:1.3;">${title}</div>
      <div style="color:#374151;font-size:14px;line-height:1.7;white-space:pre-wrap;">${message}</div>
    </div>
    ${meetBtn}
  `);
}

export function renderEmailBriefing({ vendeur_prenom, referent_prenom, referent_nom, referent_visio, date, time, message }: any) {
  const meetBtn = referent_visio ? `<div style="text-align:center;margin:28px 0;">
    <a href="${referent_visio}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed 0%,#d946ef 100%);color:white;padding:16px 36px;border-radius:12px;text-decoration:none;font-weight:700;font-size:15px;box-shadow:0 8px 24px rgba(124,58,237,0.4);">
      🎥 Rejoindre le salon de ${referent_prenom}
    </a>
  </div>` : '';

  const customMsg = message ? `<div style="background:#faf5ff;border-left:3px solid #d946ef;border-radius:8px;padding:16px 20px;margin:20px 0;font-size:14px;color:#374151;line-height:1.6;white-space:pre-wrap;">${message}</div>` : '';

  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f3ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:600px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);">

  <div style="background:linear-gradient(135deg,#7c3aed 0%,#d946ef 100%);padding:36px 28px;text-align:center;">
    <div style="color:white;font-size:28px;font-weight:800;letter-spacing:-0.5px;margin-bottom:6px;">⚡ LILIWATT</div>
    <div style="color:rgba(255,255,255,0.85);font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;">Invitation au briefing</div>
  </div>

  <div style="padding:36px 32px;">
    <p style="color:#1e1b4b;font-size:17px;font-weight:600;margin:0 0 18px;">Bonjour ${vendeur_prenom},</p>
    <p style="color:#4b5563;font-size:15px;line-height:1.7;margin:0 0 26px;">
      Votre referent <strong style="color:#1e1b4b;">${referent_prenom} ${referent_nom}</strong> vous convie a un briefing.
    </p>

    <div style="background:linear-gradient(135deg,#f5f3ff 0%,#fae8ff 100%);border-left:4px solid #7c3aed;border-radius:14px;padding:26px 28px;margin:0 0 24px;position:relative;">
      <div style="position:absolute;top:20px;right:20px;font-size:32px;">📅</div>
      <div style="color:#7c3aed;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;">Rendez-vous</div>
      <div style="color:#1e1b4b;font-size:24px;font-weight:800;letter-spacing:-0.5px;margin-bottom:18px;line-height:1.2;text-transform:capitalize;">${date}</div>
      <div style="display:inline-block;background:white;border:2px solid #7c3aed;border-radius:10px;padding:10px 18px;color:#7c3aed;font-size:20px;font-weight:800;letter-spacing:1px;">⏰ ${time}</div>
    </div>

    ${customMsg}
    ${meetBtn}

    <div style="background:#faf5ff;border:1px dashed #d946ef;border-radius:10px;padding:16px 20px;font-size:13px;color:#6b7280;line-height:1.6;margin-top:28px;text-align:center;">
      💬 Cette invitation est egalement visible dans votre messagerie CRM LILIWATT.
    </div>
  </div>

  <div style="background:#1e1b4b;padding:24px 28px;text-align:center;">
    <div style="color:rgba(255,255,255,0.8);font-size:13px;font-weight:600;margin-bottom:4px;">⚡ LILIWATT</div>
    <div style="color:rgba(255,255,255,0.55);font-size:11px;letter-spacing:1px;">Courtage Energie B2B</div>
  </div>

</div>
</body></html>`;
}

export function renderEmailAdministrative({ auteur_prenom, auteur_nom, auteur_email, auteur_role, sujet, message, date }: any) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#ecfdf5;font-family:-apple-system,sans-serif;">
<div style="max-width:600px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
  <div style="background:linear-gradient(135deg,#059669,#7c3aed);padding:32px 28px;text-align:center;">
    <div style="color:white;font-size:26px;font-weight:800;letter-spacing:-0.5px;">⚡ LILIWATT</div>
    <div style="color:rgba(255,255,255,0.9);font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;margin-top:6px;">Demande administrative</div>
  </div>
  <div style="padding:32px 28px;">
    <div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#059669;margin-bottom:10px;">📮 ${date}</div>
    <h2 style="color:#1e1b4b;font-size:22px;font-weight:800;letter-spacing:-0.3px;margin:0 0 8px;line-height:1.2;">${sujet}</h2>
    <p style="color:#6b7280;font-size:14px;margin:0 0 24px;">
      Demande du ${auteur_role === 'VENDEUR' ? 'vendeur' : 'referent'} <strong style="color:#1e1b4b;">${auteur_prenom} ${auteur_nom}</strong>.
    </p>
    <div style="background:linear-gradient(135deg,#ecfdf5,#f5f3ff);border-left:4px solid #059669;border-radius:12px;padding:20px 24px;margin-bottom:20px;">
      <div style="font-size:11px;color:#059669;text-transform:uppercase;letter-spacing:2px;font-weight:700;margin-bottom:10px;">Message</div>
      <div style="color:#374151;font-size:14px;line-height:1.7;white-space:pre-wrap;">${message}</div>
    </div>
    <div style="background:#f5f3ff;border-radius:10px;padding:14px 18px;font-size:13px;color:#6b7280;">
      Pour repondre : <a href="mailto:${auteur_email}" style="color:#7c3aed;text-decoration:none;font-weight:600;">${auteur_email}</a>
    </div>
  </div>
  <div style="background:#1e1b4b;padding:20px 28px;text-align:center;">
    <div style="color:rgba(255,255,255,0.75);font-size:11px;letter-spacing:1px;">LILIWATT · <a href="mailto:bo@liliwatt.fr" style="color:#d946ef;text-decoration:none;">bo@liliwatt.fr</a></div>
  </div>
</div>
</body></html>`;
}
