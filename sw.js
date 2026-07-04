/* =========================================================================
   Fri-Consult — Service Worker (PWA hors-ligne)
   Stratégie : network-first pour les pages, stale-while-revalidate pour
   les ressources statiques. Repli hors-ligne dédié.
   ========================================================================= */
var VERSION = "fc-v7";
var CORE = [
  "index.html",
  "assurances.html",
  "calculateur.html",
  "conseils.html",
  "conseil-lamal.html",
  "conseil-3e-pilier.html",
  "conseil-resiliation.html",
  "conseil-menage-rc.html",
  "a-propos.html",
  "demande-offre.html",
  "contact.html",
  "mentions-legales.html",
  "confidentialite.html",
  "404.html",
  "offline.html",
  "assets/css/styles.css",
  "assets/js/config.js",
  "assets/js/main.js",
  "assets/js/form.js",
  "assets/js/calc.js",
  "assets/img/favicon.svg",
  "site.webmanifest",
  "content/manifest.json",
  "content/site.json",
  "content/services.json",
  "content/posts.json",
  "content/testimonials.json",
  "content/faq.json",
  "content/i18n/de.json",
  "content/i18n/en.json",
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(VERSION).then(function (c) {
      return Promise.all(CORE.map(function (u) {
        return c.add(new Request(u, { cache: "reload" })).catch(function () {});
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // ne pas intercepter les tiers (carte, formsubmit)

  // Contenu (content/*.json) : network-first pour refléter vite les mises à
  // jour de l'agent/CMS, repli sur le cache hors-ligne.
  if (url.pathname.indexOf("/content/") !== -1) {
    e.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(VERSION).then(function (c) { c.put(req, copy); });
        return res;
      }).catch(function () { return caches.match(req); })
    );
    return;
  }

  // Pages : network-first, repli cache puis offline.html
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(VERSION).then(function (c) { c.put(req, copy); });
        return res;
      }).catch(function () {
        return caches.match(req).then(function (m) { return m || caches.match("offline.html") || caches.match("index.html"); });
      })
    );
    return;
  }

  // Ressources : stale-while-revalidate
  e.respondWith(
    caches.match(req).then(function (cached) {
      var network = fetch(req).then(function (res) {
        if (res && res.status === 200) {
          var copy = res.clone();
          caches.open(VERSION).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () { return cached; });
      return cached || network;
    })
  );
});
