#!/usr/bin/env node
/* =========================================================================
   Fri-Consult — Intake : normalisation & tri local des demandes
   -------------------------------------------------------------------------
   RÔLE. Chaque demande du site (offre + contact) passe par ici avant d'être
   déposée dans la file que **Cronos Code** (l'agent) lit et traite. Ce module
   ne « répond » pas et n'appelle AUCUNE IA : il PRÉPARE le travail de Cronos.

   Il attache à chaque lead un objet `triage` déterministe :
     • category / categoryLabel  — domaine d'assurance détecté ;
     • priority (1-4) + label + sla — file d'attente et délai de rappel ;
     • urgent / complaint         — drapeaux d'escalade ;
     • tags                       — mots-clés exploitables (CRM / app iOS) ;
     • summary                    — résumé d'une ligne pour l'agent/conseiller ;
     • suggestedReply             — brouillon de courtoisie (accusé de réception)
                                    dans la langue du client. Cronos Code le
                                    remplace par la vraie réponse conseil.

   100 % déterministe → le site reste fonctionnel sans backend IA, sans réseau
   et sans budget. L'intelligence métier (comparaison d'offres, conseil,
   rédaction finale) est apportée par Cronos Code qui lit cette file.

   Sans dépendance : Node >= 18, modules natifs uniquement.
   ========================================================================= */
"use strict";

var INTAKE_VERSION = "intake@1";

/* ---- Table métier : mots-clés → domaine + priorité de base ------------- */
var DOMAINS = [
  { key: "maladie", label: "Assurance maladie (LAMal/LCA)", pr: 3, kw: ["lamal", "maladie", "cmu", "franchise", "caisse", "complémentaire", "complementaire", "hospitalisation", "dentaire"] },
  { key: "vie-prevoyance", label: "Vie & prévoyance (3e pilier)", pr: 2, kw: ["3e pilier", "3eme pilier", "troisième pilier", "troisieme pilier", "prévoyance", "prevoyance", "retraite", "assurance vie", "3a", "3b", "lpp"] },
  { key: "auto", label: "Assurance véhicule", pr: 2, kw: ["auto", "voiture", "véhicule", "vehicule", "moto", "rc auto", "casco", "scooter"] },
  { key: "menage-rc", label: "Ménage & RC", pr: 2, kw: ["ménage", "menage", "rc privée", "rc privee", "responsabilité civile", "responsabilite civile", "inventaire", "vol", "dégât", "degat"] },
  { key: "habitation", label: "Habitation / bâtiment", pr: 2, kw: ["bâtiment", "batiment", "immeuble", "habitation", "propriétaire", "proprietaire", "ppe", "incendie"] },
  { key: "entreprise", label: "Assurances entreprise", pr: 3, kw: ["entreprise", "pme", "société", "societe", "professionnel", "indépendant", "independant", "commerce", "employés", "employes", "perte de gain"] },
  { key: "protection-juridique", label: "Protection juridique", pr: 1, kw: ["protection juridique", "juridique", "litige", "avocat"] },
  { key: "voyage", label: "Assurance voyage", pr: 1, kw: ["voyage", "annulation", "assistance", "étranger", "etranger", "rapatriement"] },
];

var URGENT_KW = ["urgent", "urgence", "aujourd'hui", "aujourdhui", "immédiat", "immediat", "au plus vite", "délai", "delai", "résiliation", "resiliation", "échéance", "echeance", "sinistre", "accident", "dès que possible", "des que possible"];
var COMPLAINT_KW = ["problème", "probleme", "mécontent", "mecontent", "plainte", "réclamation", "reclamation", "litige", "insatisfait", "déçu", "decu"];

var PRLABEL = { 1: "faible", 2: "normale", 3: "élevée", 4: "critique" };
var SLA = { 1: "72 h", 2: "48 h", 3: "24 h", 4: "4 h ouvrées" };

/* ---- Utilitaires ------------------------------------------------------- */
function norm(s) { return String(s == null ? "" : s).toLowerCase(); }
function fullName(c) { c = c || {}; return [c.firstName, c.lastName].filter(Boolean).join(" ").trim(); }
function leadText(lead) {
  lead = lead || {};
  return norm([
    (lead.insurances || []).join(" "),
    lead.subject, lead.message,
    lead.profile && lead.profile.status,
    lead.profile && lead.profile.callback,
  ].filter(Boolean).join("  "));
}
function langOf(lead) {
  var l = norm(lead && lead.locale);
  if (l.indexOf("de") === 0) return "de";
  if (l.indexOf("en") === 0) return "en";
  return "fr";
}
function slug(s) { return norm(s).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); }

/* ---- Tri déterministe -------------------------------------------------- */
function triage(lead) {
  lead = lead || {};
  var text = leadText(lead);
  var matched = DOMAINS.filter(function (d) {
    return d.kw.some(function (k) { return text.indexOf(k) !== -1; });
  });
  var primary = matched.slice().sort(function (a, b) { return b.pr - a.pr; })[0] || null;

  var urgent = URGENT_KW.some(function (k) { return text.indexOf(k) !== -1; });
  var complaint = COMPLAINT_KW.some(function (k) { return text.indexOf(k) !== -1; });

  var priority = primary ? primary.pr : 2;
  if (lead.type === "quote") priority += 1;
  if ((lead.insurances || []).length >= 3) priority += 1;
  if (urgent) priority += 1;
  if (complaint) priority = Math.max(priority, 4);
  priority = Math.max(1, Math.min(4, priority));

  var tags = [];
  if (primary) tags.push(primary.key);
  matched.forEach(function (m) { if (tags.indexOf(m.key) === -1) tags.push(m.key); });
  tags.push(lead.type === "quote" ? "demande-offre" : "contact");
  if (urgent) tags.push("urgent");
  if (complaint) tags.push("réclamation");
  if (lead.profile && lead.profile.status) tags.push(slug(lead.profile.status));
  if (lead.profile && lead.profile.canton) tags.push(slug(lead.profile.canton));
  tags = tags.filter(Boolean);

  var domainLabel = primary ? primary.label : ((lead.insurances || []).join(", ") || "votre demande");

  var summaryBits = [];
  summaryBits.push(lead.type === "quote" ? "Demande d'offre" : "Message de contact");
  if (primary) summaryBits.push("· " + primary.label);
  else if ((lead.insurances || []).length) summaryBits.push("· " + lead.insurances.join(", "));
  if (lead.profile && lead.profile.status) summaryBits.push("· " + lead.profile.status);
  if (lead.profile && lead.profile.canton) summaryBits.push("(" + lead.profile.canton + ")");
  if (urgent) summaryBits.push("· ⚠ urgent");
  if (complaint) summaryBits.push("· ⚠ réclamation");

  return {
    version: INTAKE_VERSION,
    category: primary ? primary.key : "general",
    categoryLabel: domainLabel,
    priority: priority,
    priorityLabel: PRLABEL[priority],
    sla: SLA[priority],
    urgent: urgent,
    complaint: complaint,
    lang: langOf(lead),
    tags: tags,
    summary: summaryBits.join(" "),
    suggestedReply: acknowledgement(langOf(lead), fullName(lead.contact) || "", domainLabel, lead, SLA[priority]),
    nextAction: priority >= 3
      ? "À traiter en priorité par Cronos : rappeler sous " + SLA[priority] + " et préparer une offre comparative."
      : "À traiter par Cronos : valider/adapter la réponse, puis planifier un rappel sous " + SLA[priority] + ".",
    triagedAt: new Date().toISOString(),
  };
}

/* ---- Accusé de réception (brouillon, remplacé par Cronos) -------------- */
function acknowledgement(lang, name, domainLabel, lead, sla) {
  var isQuote = lead.type === "quote";
  var cb = lead.profile && lead.profile.callback;
  if (lang === "de") {
    return "Guten Tag " + (name || "") + ",\n\n" +
      "vielen Dank für Ihre " + (isQuote ? "Offertanfrage" : "Nachricht") + " zum Thema " + domainLabel + ". " +
      "Wir haben Ihre Anfrage erhalten und ein Berater von Fri-Consult meldet sich innerhalb von " + sla + " bei Ihnen" +
      (cb ? " (gewünschter Rückruf: " + cb + ")" : "") + ".\n\nFreundliche Grüsse\nIhr Team von Fri-Consult";
  }
  if (lang === "en") {
    return "Dear " + (name || "Sir or Madam") + ",\n\n" +
      "thank you for your " + (isQuote ? "quote request" : "message") + " regarding " + domainLabel + ". " +
      "We have received your request and a Fri-Consult advisor will contact you within " + sla +
      (cb ? " (preferred callback: " + cb + ")" : "") + ".\n\nKind regards,\nThe Fri-Consult team";
  }
  return "Bonjour " + (name || "") + ",\n\n" +
    "merci pour votre " + (isQuote ? "demande d'offre" : "message") + " concernant " + domainLabel + ". " +
    "Nous avons bien reçu votre demande et un conseiller Fri-Consult vous recontacte sous " + sla +
    (cb ? " (rappel souhaité : " + cb + ")" : "") + ". " +
    "Nous comparons pour vous les meilleures offres du marché suisse.\n\nCordialement,\nVotre équipe Fri-Consult";
}

module.exports = { triage: triage, version: INTAKE_VERSION };
