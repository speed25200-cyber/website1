/* =========================================================================
   Fri-Consult — Comportements & composants partagés
   ========================================================================= */
(function () {
  "use strict";
  var CFG = window.SITE_CONFIG || {};
  var C = CFG.contact || {};

  /* ---------- Bibliothèque d'icônes (SVG inline, stroke) ---------- */
  var I = {
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5l-8-3Z"/><path d="m9 12 2 2 4-4"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 6.6a5 5 0 0 0-7.1 0L12 8.3l-1.7-1.7a5 5 0 1 0-7.1 7.1L12 22l8.8-8.3a5 5 0 0 0 0-7.1Z"/></svg>',
    car: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13 6.5 8A2 2 0 0 1 8.4 6.6h7.2A2 2 0 0 1 17.5 8L19 13"/><path d="M4 17v-3.2A2 2 0 0 1 5 12h14a2 2 0 0 1 1 1.8V17a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H7v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z"/><circle cx="7.5" cy="14.5" r=".6"/><circle cx="16.5" cy="14.5" r=".6"/></svg>',
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 9-7 9 7"/><path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9"/></svg>',
    building: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M8 7h2M8 11h2M8 15h2M14 7h2M14 11h2M14 15h2M10 21v-3h4v3"/></svg>',
    scale: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18M7 21h10M5 7h14M5 7 3 13a3 3 0 0 0 6 0L7 7M19 7l-2 6a3 3 0 0 0 6 0l-2-6M8 5l4-1 4 1"/></svg>',
    plane: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5a2.1 2.1 0 0 0-3-3L13 8 4.8 6.2a.6.6 0 0 0-.6 1l4.5 3.4-2.4 3H4.5l-1 1.5 3 1.2 1.2 3 1.5-1v-1.8l3-2.4 3.4 4.5a.6.6 0 0 0 1-.6Z"/></svg>',
    piggy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M19 8a4 4 0 0 0-4-3H10a5 5 0 0 0-5 5c0 1.6.8 3 2 4v3h3v-2h2v2h3v-3l1-1h2v-4l-1-1Z"/><path d="M15.5 8.5h.01M4.5 11H3"/></svg>',
    briefcase: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18"/></svg>',
    key: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="15.5" r="4.5"/><path d="m10.5 12.5 8-8M17 6l2 2M14 9l2 2"/></svg>',
    paw: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="9" r="1.7"/><circle cx="12" cy="6.5" r="1.7"/><circle cx="17" cy="9" r="1.7"/><path d="M12 12c-2.5 0-4.5 2-4.5 4.2 0 1.5 1.2 2.3 2.6 2.3.8 0 1.3-.4 1.9-.4s1.1.4 1.9.4c1.4 0 2.6-.8 2.6-2.3C16.5 14 14.5 12 12 12Z"/></svg>',
    umbrella: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a9 9 0 0 1 9 9H3a9 9 0 0 1 9-9ZM12 11v7a2.5 2.5 0 0 1-5 0"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    checkc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.4 2.4L15.5 9.6"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 3h3l1.5 5-2 1.5a12 12 0 0 0 5 5l1.5-2 5 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.5 5.2 2 2 0 0 1 6.5 3Z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.5 7.2L4 21l1.8-5A8 8 0 1 1 21 12Z"/></svg>',
    handshake: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="m11 17 2 2 4-4M3 10l4-4 5 4 2-1 5 3v5l-3 1-3-2M3 10v5l3 2 3-2"/></svg>',
    spark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/></svg>',
    doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
    coins: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="9" cy="7" rx="5" ry="2.5"/><path d="M4 7v5c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V7"/><path d="M14 10.5c.6.2 1.3.3 2 .3 2.8 0 5-1.1 5-2.5s-2.2-2.5-5-2.5c-.8 0-1.6.1-2.3.3M14 15c.6.2 1.3.3 2 .3 2.8 0 5-1.1 5-2.5"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0M16 5.2a3.2 3.2 0 0 1 0 6M18 20a5.5 5.5 0 0 0-3-4.9"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>',
    up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M6 11l6-6 6 6"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.9c0 1.76.46 3.45 1.32 4.95L2 22l5.3-1.38a9.9 9.9 0 0 0 4.74 1.2h.01c5.46 0 9.9-4.45 9.9-9.9C21.95 6.45 17.5 2 12.04 2Zm5.8 14.06c-.24.68-1.4 1.3-1.94 1.35-.5.05-1.13.07-1.82-.11-.42-.13-.96-.31-1.65-.61-2.9-1.25-4.79-4.17-4.94-4.36-.14-.19-1.18-1.57-1.18-3s.75-2.13 1.02-2.42c.26-.29.57-.36.76-.36l.55.01c.18.01.42-.07.65.5.24.58.82 2.01.89 2.15.07.14.12.31.02.5-.09.19-.14.31-.28.48-.14.17-.29.37-.42.5-.14.14-.28.29-.12.57.16.29.72 1.19 1.55 1.92 1.06.95 1.96 1.24 2.24 1.38.28.14.44.12.6-.07.17-.19.69-.8.87-1.08.18-.29.36-.24.61-.14.25.09 1.6.75 1.87.9.28.14.46.21.53.32.07.12.07.65-.17 1.33Z"/></svg>',
  };
  window.ICONS = I;

  function mark(size) {
    size = size || 34;
    return '<svg class="mark" width="' + size + '" height="' + size + '" viewBox="0 0 40 40" fill="none" aria-hidden="true">' +
      '<defs><linearGradient id="fcg" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#2f74ff"/><stop offset="1" stop-color="#17b6a7"/></linearGradient></defs>' +
      '<path d="M20 2 5 7.5v9.6C5 26.8 11.6 33.6 20 38c8.4-4.4 15-11.2 15-20.9V7.5L20 2Z" fill="url(#fcg)"/>' +
      '<path d="M14 20.5 18 24.5 27 15.5" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>';
  }
  window.LOGO_MARK = mark;

  /* ---------- Données services (source unique) ---------- */
  window.SERVICES = [
    { id: "maladie",    icon: "heart",     title: "Assurance maladie",           tag: "LAMal & complémentaires",
      short: "Optimisez vos primes d'assurance de base et vos complémentaires (LCA) selon vos besoins réels.",
      points: ["Comparatif LAMal toutes caisses", "Modèles Telmed, médecin de famille, HMO", "Complémentaires hospitalisation & dentaire", "Analyse de franchise optimale"] },
    { id: "vie",        icon: "piggy",     title: "Prévoyance & 3e pilier",      tag: "3a / 3b",
      short: "Épargnez pour votre retraite tout en réduisant vos impôts avec une solution 3e pilier sur mesure.",
      points: ["3e pilier A (déductible d'impôt)", "3e pilier B libre", "Assurance vie & décès", "Planification retraite & rachats LPP"] },
    { id: "auto",       icon: "car",       title: "Véhicules",                    tag: "Auto & moto",
      short: "RC obligatoire, casco partielle ou complète : la meilleure couverture au meilleur prix.",
      points: ["RC, casco partielle & complète", "Protection du conducteur", "Bonus/malus optimisé", "Voitures, motos, utilitaires"] },
    { id: "menage",     icon: "home",      title: "Ménage & RC privée",           tag: "Inventaire & responsabilité",
      short: "Protégez vos biens et votre responsabilité civile privée avec une couverture complète.",
      points: ["Assurance inventaire du ménage", "Responsabilité civile privée", "Vol simple & dégâts d'eau", "Protection valeurs & objets de valeur"] },
    { id: "immobilier", icon: "building",  title: "Bâtiment & immobilier",        tag: "PPE & propriétaires",
      short: "Couvrez votre bien immobilier, votre PPE et vos travaux contre tous les risques.",
      points: ["Assurance bâtiment", "PPE & copropriété", "Dégâts naturels & incendie", "Travaux & maître d'ouvrage"] },
    { id: "juridique",  icon: "scale",     title: "Protection juridique",         tag: "Privée & circulation",
      short: "Défendez vos droits sans craindre les frais d'avocat, en toute sérénité.",
      points: ["Protection juridique privée", "Circulation & véhicules", "Litiges travail & bail", "Conseils juridiques illimités"] },
    { id: "voyage",     icon: "plane",     title: "Voyage & assistance",          tag: "Annulation & rapatriement",
      short: "Voyagez l'esprit léger : annulation, frais médicaux et assistance dans le monde entier.",
      points: ["Frais d'annulation", "Assistance & rapatriement", "Frais médicaux à l'étranger", "Bagages & retards"] },
    { id: "entreprise", icon: "briefcase", title: "Entreprises & indépendants",   tag: "RC pro, LAA, perte de gain",
      short: "Sécurisez votre activité : responsabilité, personnel, locaux et perte d'exploitation.",
      points: ["RC professionnelle & entreprise", "LAA & indemnités journalières", "Assurance choses & interruption", "Prévoyance du personnel (LPP)"] },
    { id: "credit",     icon: "key",       title: "Hypothèques & financement",    tag: "Immobilier & crédits",
      short: "Financez votre projet immobilier aux meilleures conditions grâce à notre réseau de partenaires.",
      points: ["Hypothèques & renouvellements", "Comparatif taux multi-banques", "Financement & crédits privés", "Conseil en amortissement"] },
    { id: "accidents",  icon: "shield",    title: "Accidents",                    tag: "LAA & complémentaire",
      short: "Complétez la couverture légale accidents pour vous et votre famille.",
      points: ["Complémentaire LAA", "Capital invalidité & décès", "Frais de guérison", "Couverture enfants & non-actifs"] },
    { id: "animaux",    icon: "paw",       title: "Animaux de compagnie",         tag: "Chiens & chats",
      short: "Faites face aux frais vétérinaires imprévus sans compromis sur les soins.",
      points: ["Frais vétérinaires & chirurgie", "Accidents & maladies", "RC détenteur d'animal", "Chiens, chats & NAC"] },
    { id: "epargne",    icon: "coins",     title: "Épargne & placements",         tag: "Patrimoine",
      short: "Faites fructifier votre patrimoine avec des solutions d'épargne et de placement adaptées.",
      points: ["Plans d'épargne", "Fonds & placements", "Optimisation fiscale", "Conseil patrimonial global"] },
  ];

  /* ---------- Articles / Conseils (source unique) ---------- */
  window.POSTS = [
    { id: "conseil-lamal", icon: "heart", cat: "Assurance maladie", mins: 6,
      title: "LAMal : 6 leviers pour réduire votre prime sans perdre en couverture",
      excerpt: "Franchise, modèle d'assurance, caisse : quelques ajustements bien pensés peuvent alléger votre prime de plusieurs centaines de francs par an." },
    { id: "conseil-3e-pilier", icon: "piggy", cat: "Prévoyance", mins: 7,
      title: "3e pilier : épargner pour la retraite tout en réduisant ses impôts",
      excerpt: "Le pilier 3a est l'un des outils les plus efficaces en Suisse pour préparer sa retraite et diminuer sa charge fiscale. Mode d'emploi." },
    { id: "conseil-resiliation", icon: "doc", cat: "Pratique", mins: 5,
      title: "Changer d'assurance en Suisse : délais et calendrier de résiliation",
      excerpt: "Assurance de base, complémentaires, RC, véhicule : chaque contrat a ses règles. Le calendrier à connaître pour ne pas rater le coche." },
    { id: "conseil-menage-rc", icon: "home", cat: "Ménage & RC", mins: 5,
      title: "RC privée et assurance ménage : ce qui est vraiment couvert",
      excerpt: "Dégât des eaux, casse, vol, dommages causés à autrui : on démêle ce que couvrent — ou non — ces deux assurances essentielles du quotidien." },
  ];

  function renderPosts() {
    var render = function (list) {
      return list.map(function (p, i) {
        return '<a class="post-card" href="' + p.id + '.html" data-reveal data-reveal-delay="' + ((i % 3) + 1) + '">' +
          '<div class="post-top"><span class="post-ic">' + (I[p.icon] || I.doc) + '</span>' +
            '<span class="post-meta"><b>' + p.cat + '</b><span>' + p.mins + ' min de lecture</span></span></div>' +
          '<h3>' + p.title + '</h3>' +
          '<p>' + p.excerpt + '</p>' +
          '<span class="link-arrow">Lire l\'article ' + I.arrow + '</span>' +
        '</a>';
      }).join("");
    };
    var teaser = document.getElementById("posts-grid");
    if (teaser) {
      var lim = parseInt(teaser.getAttribute("data-limit") || "3", 10);
      teaser.innerHTML = render(window.POSTS.slice(0, lim));
    }
    var full = document.getElementById("blog-grid");
    if (full) full.innerHTML = render(window.POSTS);
  }

  /* ---------- Témoignages (source de secours ; content/testimonials.json fait foi) ---------- */
  window.TESTIMONIALS = [
    { id: "t1", initials: "SM", name: "Sophie M.", location: "Fribourg", rating: 5,
      quote: "En un rendez-vous, ils ont réduit ma prime maladie de plus de 700 francs par an, avec une meilleure couverture. Enfin quelqu'un qui explique clairement." },
    { id: "t2", initials: "LB", name: "Laurent B.", location: "Indépendant, Bulle", rating: 5,
      quote: "Un seul interlocuteur pour l'entreprise et le privé. Réactifs lors d'un sinistre, de bons conseils sur le 3e pilier. Je recommande sans hésiter." },
    { id: "t3", initials: "NC", name: "Nadia C.", location: "Rossens", rating: 5,
      quote: "Accompagnement humain et transparent pour notre financement immobilier et nos assurances. On se sent vraiment conseillés, pas vendus." },
  ];
  function esc(s) { return String(s == null ? "" : s).replace(/[<>&]/g, function (c) { return ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c]; }); }
  function renderTestimonials() {
    var g = document.getElementById("testimonials-grid");
    if (!g) return;
    g.innerHTML = window.TESTIMONIALS.map(function (t, i) {
      var stars = "★★★★★".slice(0, Math.max(0, Math.min(5, t.rating || 5)));
      return '<figure class="quote-card" data-reveal data-reveal-delay="' + (i % 3) + '">' +
        '<div class="stars" aria-label="' + (t.rating || 5) + ' sur 5">' + stars + '</div>' +
        '<blockquote>« ' + esc(t.quote) + ' »</blockquote>' +
        '<figcaption class="who"><span class="avatar">' + esc(t.initials) + '</span>' +
        '<span class="meta"><b>' + esc(t.name) + '</b><span>' + esc(t.location || "") + '</span></span></figcaption>' +
      '</figure>';
    }).join("");
  }

  /* ---------- FAQ (source de secours ; content/faq.json fait foi) ---------- */
  window.FAQ = [
    { id: "gratuit", q: "Le conseil de Fri-Consult est-il vraiment gratuit ?", a: "Oui, totalement. En tant que courtier, nous sommes rémunérés par les compagnies d'assurance lorsqu'un contrat est conclu. Vous ne payez rien, et cette rémunération n'influence jamais nos recommandations : nous restons indépendants et neutres." },
    { id: "obligation", q: "Suis-je obligé de changer d'assurance ?", a: "Absolument pas. Nous établissons un comparatif et vous conseillons, mais la décision finale vous appartient toujours. Si vos contrats actuels sont déjà optimaux, nous vous le dirons honnêtement." },
    { id: "domaines", q: "Quelles assurances pouvez-vous gérer ?", a: "Tous les types d'assurance en Suisse : maladie (LAMal et complémentaires), véhicules, ménage et RC privée, protection juridique, voyage, prévoyance et 3e pilier, assurances pour entreprises et indépendants, ainsi que le financement immobilier et les hypothèques." },
    { id: "changement", q: "Comment se déroule un changement d'assurance ?", a: "Nous nous occupons de tout : analyse, comparaison, préparation des documents, résiliation de vos anciens contrats dans les délais légaux et souscription des nouveaux. Vous n'avez qu'à signer." },
    { id: "donnees", q: "Mes données personnelles sont-elles protégées ?", a: "Oui. Vos données sont traitées de manière strictement confidentielle, uniquement pour établir vos offres, et ne sont jamais revendues. Consultez notre politique de confidentialité." },
  ];
  function renderFaq() {
    var wrap = document.getElementById("faq-list");
    if (!wrap) return;
    wrap.innerHTML = window.FAQ.map(function (f) {
      return '<div class="faq-item">' +
        '<button class="faq-q" aria-expanded="false">' + esc(f.q) + '<span class="plus"></span></button>' +
        '<div class="faq-a"><div class="faq-a-inner">' + esc(f.a) + '</div></div>' +
      '</div>';
    }).join("");
  }
  function injectFaqSchema() {
    if (!document.getElementById("faq-list") || !window.FAQ || !window.FAQ.length) return;
    var data = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: window.FAQ.map(function (f) {
      return { "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } };
    }) };
    var s = document.createElement("script");
    s.type = "application/ld+json";
    s.textContent = JSON.stringify(data);
    document.head.appendChild(s);
  }

  /* ---------- Chargement du contenu (CMS headless : content/*.json fait foi) ---------- */
  function loadJSON(path) {
    return fetch(path, { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
  }
  function loadContent() {
    // Sur file:// le fetch échoue → on garde les valeurs de secours embarquées.
    if (location.protocol === "file:") return Promise.resolve();
    var base = (window.CONTENT_BASE || "content/");
    return Promise.all([
      loadJSON(base + "site.json"),
      loadJSON(base + "services.json"),
      loadJSON(base + "posts.json"),
      loadJSON(base + "testimonials.json"),
      loadJSON(base + "faq.json"),
    ]).then(function (res) {
      var site = res[0];
      if (site && typeof site === "object") {
        if (site.brand) CFG.brand = site.brand;
        if (site.legalName) CFG.legalName = site.legalName;
        if (site.tagline) CFG.tagline = site.tagline;
        if (site.contact) Object.assign(C, site.contact);        // mutation en place → C reste valide
        if (site.social) CFG.social = site.social;
        if (site.forms) {
          CFG.forms = site.forms;
          if (site.forms.formEndpoint) CFG.formEndpoint = site.forms.formEndpoint;
        }
      }
      if (Array.isArray(res[1]) && res[1].length) window.SERVICES = res[1];
      if (Array.isArray(res[2]) && res[2].length) window.POSTS = res[2];
      if (Array.isArray(res[3]) && res[3].length) window.TESTIMONIALS = res[3];
      if (Array.isArray(res[4]) && res[4].length) window.FAQ = res[4];
    }).catch(function () {});
  }

  /* ---------- Navigation partagée ---------- */
  var NAV_ITEMS = [
    { href: "index.html", label: "Accueil" },
    { href: "assurances.html", label: "Nos assurances" },
    { href: "calculateur.html", label: "Calculateur" },
    { href: "conseils.html", label: "Conseils" },
    { href: "a-propos.html", label: "À propos" },
    { href: "contact.html", label: "Contact" },
  ];

  function currentPage() {
    var p = location.pathname.split("/").pop();
    return p === "" ? "index.html" : p;
  }

  function buildHeader() {
    var el = document.getElementById("site-header");
    if (!el) return;
    var cur = currentPage();
    var links = NAV_ITEMS.map(function (n) {
      var active = n.href === cur ? ' class="active" aria-current="page"' : "";
      return '<a href="' + n.href + '"' + active + '>' + n.label + "</a>";
    }).join("");
    el.className = "nav";
    el.innerHTML =
      '<div class="container">' +
        '<a class="brand" href="index.html" aria-label="Fri-Consult, accueil">' + mark(34) +
          '<span>Fri<b>-</b>Consult</span></a>' +
        '<nav class="nav-links" aria-label="Navigation principale">' + links +
          '<a class="nav-cta-mobile btn btn-block" href="demande-offre.html">Demander une offre ' + I.arrow + '</a>' +
        '</nav>' +
        '<div class="nav-cta">' +
          '<label class="lang-wrap" title="Langue / Sprache / Language">' +
            '<span class="lang-ico" aria-hidden="true">' + I.globe + '</span>' +
            '<select class="lang-select" aria-label="Choisir la langue">' +
              LANGS.map(function (l) { return '<option value="' + l + '">' + l.toUpperCase() + '</option>'; }).join("") +
            '</select>' +
          '</label>' +
          '<button class="theme-toggle" aria-label="Changer de thème clair/sombre" title="Thème clair / sombre">' +
            '<span class="sun">' + I.sun + '</span><span class="moon">' + I.moon + '</span></button>' +
          '<a class="btn nav-cta-desktop" href="demande-offre.html">Demander une offre ' + I.arrow + '</a>' +
          '<button class="nav-toggle" aria-label="Ouvrir le menu" aria-expanded="false"><span></span></button>' +
        '</div>' +
      '</div>';

    var toggle = el.querySelector(".nav-toggle");
    var closeMenu = function () { document.body.classList.remove("menu-open"); toggle.setAttribute("aria-expanded", "false"); };
    toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("menu-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    el.querySelectorAll(".nav-links a").forEach(function (a) { a.addEventListener("click", closeMenu); });

    var onScroll = function () { el.classList.toggle("scrolled", window.scrollY > 12); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function buildFooter() {
    var el = document.getElementById("site-footer");
    if (!el) return;
    var addr = C.street + ", " + C.zip + " " + C.city;
    var svcLinks = window.SERVICES.slice(0, 6).map(function (s) {
      return '<li><a href="assurances.html#' + s.id + '">' + s.title + "</a></li>";
    }).join("");
    el.className = "footer";
    el.innerHTML =
      '<div class="container">' +
        '<div class="footer-grid">' +
          '<div>' +
            '<a class="brand" href="index.html">' + mark(32) + '<span>Fri<b>-</b>Consult</span></a>' +
            '<p>Courtier en assurances indépendant en Suisse. Nous comparons, négocions et optimisons vos contrats — gratuitement et sans engagement.</p>' +
            '<div style="margin-top:20px" class="badges">' +
              '<span class="badge teal">' + I.checkc + ' Conseil neutre</span>' +
            '</div>' +
          '</div>' +
          '<div><h4>Assurances</h4><ul>' + svcLinks + '<li><a href="assurances.html">Voir tout</a></li></ul></div>' +
          '<div><h4>Société</h4><ul>' +
            '<li><a href="a-propos.html">À propos</a></li>' +
            '<li><a href="calculateur.html">Calculateur d\'économies</a></li>' +
            '<li><a href="conseils.html">Conseils & guides</a></li>' +
            '<li><a href="demande-offre.html">Demander une offre</a></li>' +
            '<li><a href="contact.html">Contact</a></li>' +
            '<li><a href="mentions-legales.html">Mentions légales</a></li>' +
            '<li><a href="confidentialite.html">Confidentialité</a></li>' +
          '</ul></div>' +
          '<div><h4>Contact</h4>' +
            '<div class="contact-line">' + I.pin + '<span>' + addr + '<br>' + C.canton + ', ' + C.country + '</span></div>' +
            '<div class="contact-line">' + I.phone + '<a href="' + C.phoneHref + '">' + C.phone + '</a></div>' +
            '<div class="contact-line">' + I.mail + '<a href="mailto:' + C.email + '">' + C.email + '</a></div>' +
          '</div>' +
        '</div>' +
        '<div class="footer-bottom">' +
          '<span>© ' + new Date().getFullYear() + ' ' + CFG.legalName + ' · ' + C.uid + '. Tous droits réservés.</span>' +
          '<div class="badges"><a href="mentions-legales.html">Mentions légales</a><a href="confidentialite.html">Confidentialité</a></div>' +
        '</div>' +
      '</div>';
  }

  /* ---------- Rendu des cartes de services ---------- */
  function renderServices() {
    // Grille compacte (accueil)
    var g = document.getElementById("services-grid");
    if (g) {
      var limit = parseInt(g.getAttribute("data-limit") || "0", 10);
      var list = limit ? window.SERVICES.slice(0, limit) : window.SERVICES;
      g.innerHTML = list.map(function (s, i) {
        var d = (i % 4) + 1;
        return '<a class="card ins-card" href="assurances.html#' + s.id + '" data-reveal data-reveal-delay="' + d + '">' +
          '<span class="ico ' + (i % 2 ? "teal" : "") + '">' + (I[s.icon] || I.shield) + '</span>' +
          '<h3>' + s.title + '</h3>' +
          '<p>' + s.short + '</p>' +
          '<span class="card-foot link-arrow">En savoir plus ' + I.arrow + '</span>' +
        '</a>';
      }).join("");
    }
    // Grille détaillée (page assurances)
    var full = document.getElementById("assurances-grid");
    if (full) {
      full.innerHTML = window.SERVICES.map(function (s, i) {
        var pts = s.points.map(function (p) { return "<li>" + p + "</li>"; }).join("");
        return '<article class="card ins-card" id="' + s.id + '" data-reveal data-reveal-delay="' + ((i % 3) + 1) + '">' +
          '<span class="ico ' + (i % 2 ? "teal" : "") + '">' + (I[s.icon] || I.shield) + '</span>' +
          '<span class="badge' + (i % 2 ? " teal" : "") + '">' + s.tag + '</span>' +
          '<h3 style="margin-top:14px">' + s.title + '</h3>' +
          '<p>' + s.short + '</p>' +
          '<ul>' + pts + '</ul>' +
          '<div class="card-foot"><a class="btn btn-block" href="demande-offre.html?type=' + s.id + '">Demander une offre ' + I.arrow + '</a></div>' +
        '</article>';
      }).join("");
    }
  }

  /* ---------- Thème clair / sombre ---------- */
  function initTheme() {
    var root = document.documentElement;
    var apply = function (t) {
      root.setAttribute("data-theme", t);
      try { localStorage.setItem("fc-theme", t); } catch (e) {}
      var meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", t === "dark" ? "#0b0f16" : "#ffffff");
    };
    // état initial déjà posé par le script inline ; on synchronise juste la meta
    var cur = root.getAttribute("data-theme") || "light";
    apply(cur);
    // activer les transitions après le 1er rendu (évite le flash)
    requestAnimationFrame(function () { root.classList.add("theme-ready"); });
    var btn = document.querySelector(".theme-toggle");
    if (btn) btn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      apply(next);
    });
    // suivre le système si l'utilisateur n'a jamais choisi
    try {
      var mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener && mq.addEventListener("change", function (e) {
        if (!localStorage.getItem("fc-theme-user")) apply(e.matches ? "dark" : "light");
      });
      if (btn) btn.addEventListener("click", function () { try { localStorage.setItem("fc-theme-user", "1"); } catch (e) {} });
    } catch (e) {}
  }

  /* ---------- Internationalisation (FR / DE / EN) ----------
     Les traductions sont des données (content/i18n/<lang>.json = carte
     FR → langue cible), éditables par Cronos / l'app iOS. On traduit les
     nœuds texte rendus, en ignorant les zones dynamiques (compteurs,
     calculateur, assistant). FR = identité. */
  var LANGS = ["fr", "de", "en"];
  var LANG_LABEL = { fr: "Français", de: "Deutsch", en: "English" };
  var I18N_MAPS = { fr: {} };
  var curLang = "fr";

  function detectLang() {
    try {
      var saved = localStorage.getItem("fc-lang");
      if (saved && LANGS.indexOf(saved) !== -1) return saved;
    } catch (e) {}
    var nav = (navigator.language || "fr").slice(0, 2).toLowerCase();
    return LANGS.indexOf(nav) !== -1 ? nav : "fr";
  }
  function loadLangMap(lang) {
    if (lang === "fr" || I18N_MAPS[lang]) return Promise.resolve();
    if (location.protocol === "file:") { I18N_MAPS[lang] = {}; return Promise.resolve(); }
    return loadJSON((window.CONTENT_BASE || "content/") + "i18n/" + lang + ".json")
      .then(function (m) { I18N_MAPS[lang] = m || {}; });
  }
  function i18nTextNodes() {
    var nodes = [];
    if (!document.body) return nodes;
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        var p = n.parentNode;
        while (p && p.nodeType === 1) {
          var tag = p.nodeName;
          if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT") return NodeFilter.FILTER_REJECT;
          if (p.hasAttribute("data-count") || p.hasAttribute("data-i18n-skip")) return NodeFilter.FILTER_REJECT;
          p = p.parentNode;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    var n; while ((n = walker.nextNode())) nodes.push(n);
    return nodes;
  }
  function applyLang(lang) {
    curLang = lang;
    document.documentElement.setAttribute("lang", lang);
    try { localStorage.setItem("fc-lang", lang); } catch (e) {}
    var map = I18N_MAPS[lang] || {};
    i18nTextNodes().forEach(function (n) {
      if (n.__fr == null) n.__fr = n.nodeValue;          // instantané FR canonique
      var fr = n.__fr;
      var key = fr.trim();
      if (lang === "fr" || !map[key]) { n.nodeValue = fr; }
      else { n.nodeValue = fr.replace(key, map[key]); }  // conserve les espaces autour
    });
    var sel = document.querySelector(".lang-select");
    if (sel && sel.value !== lang) sel.value = lang;
  }
  function setLang(lang) {
    if (LANGS.indexOf(lang) === -1) lang = "fr";
    loadLangMap(lang).then(function () { applyLang(lang); });
  }
  function initI18n() {
    curLang = detectLang();
    var sel = document.querySelector(".lang-select");
    if (sel) {
      sel.value = curLang;
      sel.addEventListener("change", function () { setLang(sel.value); });
    }
    // 1er passage : snapshot FR + application de la langue détectée
    loadLangMap(curLang).then(function () { applyLang(curLang); });
  }

  /* ---------- UI de scroll : progression + retour haut ---------- */
  function initScrollUI() {
    var bar = document.createElement("div");
    bar.className = "scroll-progress";
    document.body.appendChild(bar);

    var top = document.createElement("button");
    top.className = "to-top";
    top.setAttribute("aria-label", "Remonter en haut de la page");
    top.innerHTML = I.up;
    document.body.appendChild(top);
    top.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });

    var ticking = false;
    var update = function () {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var p = max > 0 ? (h.scrollTop || document.body.scrollTop) / max : 0;
      bar.style.width = (p * 100).toFixed(2) + "%";
      top.classList.toggle("show", (h.scrollTop || 0) > 600);
      ticking = false;
    };
    window.addEventListener("scroll", function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* ---------- Bouton contact flottant ---------- */
  function initFab() {
    var wa = (CFG.contact && CFG.contact.whatsapp) ? CFG.contact.whatsapp.replace(/\D/g, "") : "";
    var href = wa ? "https://wa.me/" + wa : "demande-offre.html";
    var label = wa ? "WhatsApp" : "Devis gratuit";
    var a = document.createElement("a");
    a.className = "fab-contact";
    a.href = href;
    if (wa) { a.target = "_blank"; a.rel = "noopener"; }
    a.setAttribute("aria-label", wa ? "Nous écrire sur WhatsApp" : "Demander un devis gratuit");
    a.innerHTML = (wa ? I.whatsapp : I.chat) + '<span class="fab-label">' + label + "</span>";
    document.body.appendChild(a);
    setTimeout(function () { a.classList.add("show"); }, 900);
  }

  /* ---------- Bandeau cookies (nLPD) ---------- */
  function initCookieBar() {
    try { if (localStorage.getItem("fc-cookie") === "ok") return; } catch (e) { return; }
    var bar = document.createElement("div");
    bar.className = "cookie-bar";
    bar.setAttribute("role", "dialog");
    bar.setAttribute("aria-label", "Information sur les cookies");
    bar.innerHTML =
      '<p>Ce site utilise uniquement des éléments strictement nécessaires à son bon fonctionnement — aucun traceur publicitaire. En savoir plus dans notre <a href="confidentialite.html">politique de confidentialité</a>.</p>' +
      '<div class="cookie-actions">' +
        '<button class="btn btn-ghost" id="ck-no">Refuser</button>' +
        '<button class="btn" id="ck-ok">J\'ai compris</button>' +
      '</div>';
    document.body.appendChild(bar);
    requestAnimationFrame(function () { setTimeout(function () { bar.classList.add("show"); }, 500); });
    var close = function () {
      try { localStorage.setItem("fc-cookie", "ok"); } catch (e) {}
      bar.classList.remove("show");
      setTimeout(function () { bar.remove(); }, 500);
    };
    bar.querySelector("#ck-ok").addEventListener("click", close);
    bar.querySelector("#ck-no").addEventListener("click", close);
  }

  /* ---------- Parallaxe discrète de la carte héro ---------- */
  function initParallax() {
    var card = document.querySelector(".hero-card");
    if (!card) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(hover: none)").matches) return; // pas sur tactile
    var hero = card.closest(".hero") || document;
    var raf = null, tx = 0, ty = 0;
    hero.addEventListener("mousemove", function (e) {
      var r = hero.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      tx = px * 10; ty = py * 10;
      if (!raf) raf = requestAnimationFrame(function () {
        card.style.transform = "translate3d(" + tx.toFixed(2) + "px," + ty.toFixed(2) + "px,0)";
        raf = null;
      });
    });
    hero.addEventListener("mouseleave", function () { card.style.transform = ""; });
  }

  /* ---------- Reveal au scroll ---------- */
  function initReveal() {
    var els = document.querySelectorAll("[data-reveal]");
    if (!("IntersectionObserver" in window) || !els.length) {
      els.forEach(function (e) { e.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -40px 0px" });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- Compteurs animés ---------- */
  function initCounters() {
    var nums = document.querySelectorAll("[data-count]");
    if (!nums.length) return;
    var run = function (el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var suffix = el.getAttribute("data-suffix") || "";
      var dec = (target % 1 !== 0) ? 1 : 0;
      var start = null, dur = 1400;
      var step = function (ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * eased).toFixed(dec).replace(".", ",") + suffix;
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target.toFixed(dec).replace(".", ",") + suffix;
      };
      requestAnimationFrame(step);
    };
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.5 });
    nums.forEach(function (n) { io.observe(n); });
  }

  /* ---------- FAQ accordéon ---------- */
  function initFaq() {
    document.querySelectorAll(".faq-item").forEach(function (item) {
      var q = item.querySelector(".faq-q");
      var a = item.querySelector(".faq-a");
      if (!q || !a) return;
      q.addEventListener("click", function () {
        var open = item.classList.contains("open");
        if (open) { a.style.height = a.scrollHeight + "px"; requestAnimationFrame(function () { a.style.height = "0px"; }); item.classList.remove("open"); q.setAttribute("aria-expanded", "false"); }
        else { item.classList.add("open"); q.setAttribute("aria-expanded", "true"); a.style.height = a.scrollHeight + "px"; a.addEventListener("transitionend", function te() { if (item.classList.contains("open")) a.style.height = "auto"; a.removeEventListener("transitionend", te); }); }
      });
    });
  }

  /* ---------- Année & liens config dynamiques ---------- */
  function fillConfig() {
    document.querySelectorAll("[data-cfg]").forEach(function (el) {
      var key = el.getAttribute("data-cfg");
      var map = {
        phone: C.phone, email: C.email,
        address: C.street + ", " + C.zip + " " + C.city,
        street: C.street, city: C.zip + " " + C.city,
        canton: C.canton, uid: C.uid,
        legalName: CFG.legalName,
      };
      if (map[key] != null) {
        if (el.tagName === "A") {
          if (key === "phone") el.href = C.phoneHref;
          else if (key === "email") el.href = "mailto:" + C.email;
        }
        el.textContent = map[key];
      }
    });
  }

  /* ---------- Données structurées : fil d'Ariane ---------- */
  function injectBreadcrumb() {
    var bc = document.querySelector(".breadcrumb");
    if (!bc) return;
    var origin = location.href.replace(/[^/]*$/, "");
    var items = [];
    var pos = 1;
    bc.querySelectorAll("a, span").forEach(function (el) {
      var name = el.textContent.trim();
      if (!name || name === "›" || name === "/") return;
      var item = { "@type": "ListItem", position: pos++, name: name };
      if (el.tagName === "A" && el.getAttribute("href")) item.item = origin + el.getAttribute("href");
      items.push(item);
    });
    if (items.length < 2) return;
    var data = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items };
    var s = document.createElement("script");
    s.type = "application/ld+json";
    s.textContent = JSON.stringify(data);
    document.head.appendChild(s);
  }

  /* ---------- Service Worker (PWA hors-ligne) ---------- */
  function initSW() {
    if (!("serviceWorker" in navigator)) return;
    if (location.protocol === "file:") return;
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    });
  }

  /* ---------- Init ---------- */
  function boot() {
    buildHeader();
    buildFooter();
    renderServices();
    renderPosts();
    renderTestimonials();
    renderFaq();
    fillConfig();
    initTheme();
    initScrollUI();
    initFab();
    initCookieBar();
    initReveal();
    initCounters();
    initFaq();
    injectFaqSchema();
    initParallax();
    injectBreadcrumb();
    initSW();
    if (window.FC_FORMS && window.FC_FORMS.boot) window.FC_FORMS.boot();
    initI18n();
  }

  document.addEventListener("DOMContentLoaded", function () {
    // Charge le contenu (content/*.json) puis rend le site. Repli sur les
    // valeurs embarquées si le fetch échoue → le site n'est jamais vide.
    loadContent().then(boot, boot);
  });
})();
