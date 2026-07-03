/* =========================================================================
   Fri-Consult — Configuration centrale
   -------------------------------------------------------------------------
   ⚙️  MODIFIEZ CE FICHIER pour mettre à jour les coordonnées partout sur
   le site (en-tête, pied de page, page contact, formulaires).

   ▸ contact.email  : adresse qui reçoit les demandes d'offre.
     Le formulaire utilise FormSubmit.co (aucune inscription requise).
     ⚠️ À la 1re demande envoyée, FormSubmit vous enverra un e-mail
        d'activation à confirmer une seule fois.
   ▸ contact.phone  : ⚠️ numéro à confirmer/renseigner (placeholder actuel).
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

  // Point de collecte du formulaire. Par défaut : FormSubmit (sans compte).
  // Pour un autre service (Formspree, Web3Forms…), remplacez l'URL.
  formEndpoint: "https://formsubmit.co/ajax/",
};
