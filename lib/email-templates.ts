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
