/* =========================================================================
   Fri-Consult — Configuration de secours (fallback)
   -------------------------------------------------------------------------
   ℹ️  DEPUIS LE PASSAGE EN CMS HEADLESS, LA SOURCE DE VÉRITÉ EST
       « content/site.json » (édité par Cronos / l'app iOS / via Git).
       Ce fichier ne sert plus que de repli si le fetch de site.json échoue
       (ex. ouverture en file://). Gardez-le synchronisé par sécurité.

   ▸ contact.email  : adresse qui reçoit les demandes d'offre (FormSubmit).
   ▸ contact.phone  : ⚠️ placeholder à renseigner.
   ▸ forms.leadWebhook : URL optionnelle recevant chaque demande en JSON
       structuré (contrat fri-consult/lead@1) pour l'app iOS / le CRM.
   ========================================================================= */
window.SITE_CONFIG = {
  brand: "Fri-Consult",
  legalName: "Fri-Consult Sàrl",
  tagline: "Votre courtier en assurances en Suisse",

  contact: {
    email: "info@fri-consult.ch",
    // ⚠️ Placeholder — remplacez par le numéro officiel de Fri-Consult Sàrl :
    phone: "+41 26 411 00 00",
    phoneHref: "tel:+41264110000",
    whatsapp: "",                       // ex : "41790000000" (laisser vide si aucun)
    street: "Zone Industrielle Din Riaux 34",
    zip: "1728",
    city: "Rossens",
    canton: "Fribourg",
    country: "Suisse",
    uid: "CHE-193.130.760",
    mapQuery: "Zone Industrielle Din Riaux 34, 1728 Rossens, Suisse",
    hours: [
      { d: "Lundi – Vendredi", h: "08:00 – 18:00" },
      { d: "Samedi", h: "Sur rendez-vous" },
      { d: "Dimanche", h: "Fermé" },
    ],
  },

  social: {
    linkedin: "",
    facebook: "",
    instagram: "",
  },

  // Endpoints de formulaire (repli ; voir content/site.json → "forms").
  forms: {
    formEndpoint: "https://formsubmit.co/ajax/",
    leadWebhook: "",
    leadWebhookHeaders: {},
  },
  // Back-compat : conservé pour les anciens appels.
  formEndpoint: "https://formsubmit.co/ajax/",
};
