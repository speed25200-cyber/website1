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

  /* ---------- Navigation partagée ---------- */
  var NAV_ITEMS = [
    { href: "index.html", label: "Accueil" },
    { href: "assurances.html", label: "Nos assurances" },
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

  /* ---------- Init ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    buildHeader();
    buildFooter();
    renderServices();
    fillConfig();
    initReveal();
    initCounters();
    initFaq();
  });
})();
