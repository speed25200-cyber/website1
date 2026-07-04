#!/usr/bin/env node
/* =========================================================================
   Fri-Consult — Backend de référence (API leads + écriture de contenu)
   -------------------------------------------------------------------------
   • Sans dépendance (Node >= 18, modules natifs uniquement).
   • Sert le site statique + une API JSON pour l'app iOS et l'agent Cronos.
   • Déployable partout où Node tourne (Render, Railway, Fly, VPS, Docker…).

   Endpoints
     GET    /api/health
     GET    /api/manifest
     GET    /content/<name>.json              (lecture publique du contenu)
     PUT    /api/content/<collection>          (auth) écrit + valide via schéma
     POST   /api/leads                         (public) crée un lead (lead@1)
     GET    /api/leads                          (auth) liste les leads
     GET    /api/leads/<id>                     (auth)
     PATCH  /api/leads/<id>                     (auth) maj statut/notes/réponse
     GET    /api/queue                          (auth) travail actionnable (trié)
     POST   /api/leads/<id>/claim               (auth) verrou de traitement (bail)
     GET    /api/stats                          (auth) agrégats de la file
     (tout le reste) → fichiers statiques du site

   Variables d'environnement
     FC_PORT           (défaut 8787)
     FC_ROOT           racine du site (défaut : dossier parent de /server)
     FC_DATA_DIR       stockage des leads (défaut : server/data)
     FC_API_TOKEN      jeton Bearer pour les routes protégées (obligatoire pour
                       activer écriture + lecture des leads)
     FC_ALLOW_ORIGIN   CORS (défaut *)
   ========================================================================= */
"use strict";

var http = require("http");
var fs = require("fs");
var path = require("path");
var crypto = require("crypto");
var validate = require("./schema-validate");
var intake = require("./intake");

var ROOT = process.env.FC_ROOT ? path.resolve(process.env.FC_ROOT) : path.resolve(__dirname, "..");
var CONTENT_DIR = path.join(ROOT, "content");
var SCHEMA_DIR = path.join(CONTENT_DIR, "schema");
var DATA_DIR = process.env.FC_DATA_DIR ? path.resolve(process.env.FC_DATA_DIR) : path.join(__dirname, "data");
var LEADS_FILE = path.join(DATA_DIR, "leads.json");
var PORT = parseInt(process.env.FC_PORT || "8787", 10);
var TOKEN = process.env.FC_API_TOKEN || "";
var ALLOW_ORIGIN = process.env.FC_ALLOW_ORIGIN || "*";
var MAX_BODY = 512 * 1024;

var COLLECTIONS = {
  site: "site.schema.json",
  services: "service.schema.json",
  posts: "post.schema.json",
  testimonials: "testimonial.schema.json",
  faq: "faq.schema.json",
};

var MIME = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webmanifest": "application/manifest+json",
  ".xml": "application/xml", ".txt": "text/plain; charset=utf-8", ".ico": "image/x-icon", ".md": "text/markdown; charset=utf-8" };

function ensureData() { try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (e) {} }
function readSchema(name) { return JSON.parse(fs.readFileSync(path.join(SCHEMA_DIR, name), "utf8")); }

function send(res, code, body, headers) {
  headers = headers || {};
  headers["Access-Control-Allow-Origin"] = ALLOW_ORIGIN;
  headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization";
  headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, OPTIONS";
  if (typeof body === "object" && !(body instanceof Buffer)) {
    headers["Content-Type"] = "application/json; charset=utf-8";
    body = JSON.stringify(body);
  }
  res.writeHead(code, headers);
  res.end(body);
}
function json(res, code, obj) { send(res, code, obj); }

function authed(req) {
  if (!TOKEN) return false;
  var h = req.headers["authorization"] || "";
  var m = h.match(/^Bearer\s+(.+)$/i);
  if (!m) return false;
  var a = Buffer.from(m[1]); var b = Buffer.from(TOKEN);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
function requireAuth(req, res) {
  if (!TOKEN) { json(res, 503, { error: "FC_API_TOKEN non configuré : routes protégées désactivées." }); return false; }
  if (!authed(req)) { json(res, 401, { error: "Non autorisé (Bearer token requis)." }); return false; }
  return true;
}

function readBody(req) {
  return new Promise(function (resolve, reject) {
    var chunks = [], size = 0;
    req.on("data", function (c) { size += c.length; if (size > MAX_BODY) { reject(new Error("payload trop volumineux")); req.destroy(); } else chunks.push(c); });
    req.on("end", function () {
      var raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) return resolve(null);
      try { resolve(JSON.parse(raw)); } catch (e) { reject(new Error("JSON invalide")); }
    });
    req.on("error", reject);
  });
}

/* ---- Stockage des leads ---- */
var writeQueue = Promise.resolve();
function readLeads() { try { return JSON.parse(fs.readFileSync(LEADS_FILE, "utf8")); } catch (e) { return []; } }
// Journal d'audit embarqué dans le lead : chaque transition est tracée pour
// que le traitement autonome (Cronos) reste vérifiable a posteriori.
function addHistory(lead, event, detail) {
  lead.history = lead.history || [];
  lead.history.push({ at: new Date().toISOString(), event: event, detail: detail || undefined });
}
function leaseActive(lead) {
  return !!(lead.lease && lead.lease.until && Date.parse(lead.lease.until) > Date.now());
}
// Une demande est « actionnable » si personne ne la traite : ni clôturée, ni
// sous bail actif d'un agent.
function isActionable(lead) {
  var s = lead.status || "new";
  if (s === "done" || s === "resolved" || s === "archived") return false;
  return !leaseActive(lead);
}
function appendLead(lead) {
  writeQueue = writeQueue.then(function () {
    var all = readLeads();
    all.push(lead);
    fs.writeFileSync(LEADS_FILE, JSON.stringify(all, null, 2));
  });
  return writeQueue.then(function () { return lead; });
}
function updateLead(id, patch, actor) {
  var updated = null;
  writeQueue = writeQueue.then(function () {
    var all = readLeads();
    var i = all.findIndex(function (l) { return l.id === id; });
    if (i === -1) return;
    // Champs que Cronos Code (ou un conseiller) peut mettre à jour en traitant.
    var changed = [];
    ["status", "notes", "assignee", "response", "triage"].forEach(function (k) {
      if (patch[k] !== undefined) { all[i][k] = patch[k]; changed.push(k); }
    });
    all[i].updatedAt = new Date().toISOString();
    if (patch.status === "done" || patch.status === "resolved") {
      all[i].resolvedAt = all[i].resolvedAt || new Date().toISOString();
      all[i].lease = undefined; // libère le bail à la clôture
    }
    if (changed.length) addHistory(all[i], "update", (actor ? actor + " : " : "") + changed.join(", ") + (patch.status ? " → " + patch.status : ""));
    updated = all[i];
    fs.writeFileSync(LEADS_FILE, JSON.stringify(all, null, 2));
  });
  return writeQueue.then(function () { return updated; });
}
// Verrou de traitement : un agent « réclame » une demande pour une durée
// limitée (bail). Atomique via la writeQueue → deux agents ne peuvent pas
// traiter la même demande en parallèle ; un bail expiré est re-réclamable
// (reprise automatique si un agent meurt en cours de traitement).
function claimLead(id, agent, ttlSeconds) {
  var result = null;
  writeQueue = writeQueue.then(function () {
    var all = readLeads();
    var i = all.findIndex(function (l) { return l.id === id; });
    if (i === -1) { result = { code: 404 }; return; }
    var l = all[i];
    var s = l.status || "new";
    if (s === "done" || s === "resolved" || s === "archived") { result = { code: 409, error: "déjà clôturé" }; return; }
    if (leaseActive(l) && l.lease.agent !== agent) { result = { code: 409, error: "déjà réclamé par " + l.lease.agent, lease: l.lease }; return; }
    var ttl = Math.max(30, Math.min(3600, parseInt(ttlSeconds, 10) || 300));
    l.lease = { agent: agent, until: new Date(Date.now() + ttl * 1000).toISOString() };
    l.status = "in_progress";
    l.assignee = agent;
    l.updatedAt = new Date().toISOString();
    addHistory(l, "claim", agent + " (bail " + ttl + " s)");
    fs.writeFileSync(LEADS_FILE, JSON.stringify(all, null, 2));
    result = { code: 200, lead: l };
  });
  return writeQueue.then(function () { return result; });
}

/* ---- Fichiers statiques ---- */
function serveStatic(req, res, urlPath) {
  var rel = decodeURIComponent(urlPath.replace(/^\/+/, ""));
  if (rel === "") rel = "index.html";
  var full = path.join(ROOT, rel);
  if (full.indexOf(ROOT) !== 0) return json(res, 403, { error: "interdit" });
  fs.stat(full, function (err, st) {
    if (err) {
      // SPA-ish : renvoyer 404.html si présent
      var nf = path.join(ROOT, "404.html");
      return fs.readFile(nf, function (e2, buf) { if (e2) send(res, 404, { error: "introuvable" }); else send(res, 404, buf, { "Content-Type": MIME[".html"] }); });
    }
    if (st.isDirectory()) return serveStatic(req, res, path.join(urlPath, "index.html"));
    fs.readFile(full, function (e, buf) {
      if (e) return json(res, 500, { error: "lecture impossible" });
      send(res, 200, buf, { "Content-Type": MIME[path.extname(full)] || "application/octet-stream" });
    });
  });
}

/* ---- Routeur ---- */
var server = http.createServer(async function (req, res) {
  var u = new URL(req.url, "http://localhost");
  var p = u.pathname;
  var method = req.method.toUpperCase();

  if (method === "OPTIONS") return send(res, 204, "");

  try {
    if (p === "/api/health") return json(res, 200, { ok: true, service: "fri-consult-api", contract: "fri-consult/content@1", intake: intake.version, time: new Date().toISOString() });

    // Console Cronos / conseiller (page cliente ; l'auth se fait au niveau des appels API).
    if (p === "/admin" || p === "/admin/") return serveStatic(req, res, "/admin.html");

    // GET /api/stats (auth) — tableau de bord de la file
    if (p === "/api/stats" && method === "GET") {
      if (!requireAuth(req, res)) return;
      var leads = readLeads();
      var byStatus = {}, byCategory = {}, byPriority = {};
      leads.forEach(function (l) {
        var s = l.status || "new"; byStatus[s] = (byStatus[s] || 0) + 1;
        var c = (l.triage && l.triage.category) || "general"; byCategory[c] = (byCategory[c] || 0) + 1;
        var pr = (l.triage && l.triage.priorityLabel) || "normale"; byPriority[pr] = (byPriority[pr] || 0) + 1;
      });
      var open = leads.filter(function (l) { return l.status !== "done" && l.status !== "resolved" && l.status !== "archived"; }).length;
      return json(res, 200, { total: leads.length, open: open, byStatus: byStatus, byCategory: byCategory, byPriority: byPriority });
    }

    if (p === "/api/manifest") {
      var mf = JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, "manifest.json"), "utf8"));
      return json(res, 200, mf);
    }

    // POST /api/leads (public) — reçoit un lead structuré (lead@1)
    if (p === "/api/leads" && method === "POST") {
      var lead = await readBody(req);
      if (!lead) return json(res, 400, { error: "corps JSON requis" });
      var v = validate(readSchema("lead.schema.json"), lead);
      if (!v.valid) return json(res, 422, { error: "lead invalide", details: v.errors });
      lead.id = crypto.randomUUID();
      lead.receivedAt = new Date().toISOString();
      lead.status = lead.status || "new";
      // Cronos Code lit cette file : on pré-trie chaque demande (déterministe,
      // sans IA) pour lui livrer catégorie/priorité/tags/brouillon prêts.
      try { lead.triage = intake.triage(lead); } catch (e) { lead.triage = { error: String(e.message || e) }; }
      addHistory(lead, "received", lead.source);
      if (lead.triage && lead.triage.priorityLabel) addHistory(lead, "triaged", lead.triage.category + " · priorité " + lead.triage.priorityLabel);
      await appendLead(lead);
      return json(res, 201, { id: lead.id, status: lead.status, triage: lead.triage });
    }

    // GET /api/leads (auth)
    if (p === "/api/leads" && method === "GET") {
      if (!requireAuth(req, res)) return;
      var all = readLeads().slice().reverse();
      var status = u.searchParams.get("status");
      if (status) all = all.filter(function (l) { return l.status === status; });
      var limit = parseInt(u.searchParams.get("limit") || "100", 10);
      return json(res, 200, { count: all.length, leads: all.slice(0, limit) });
    }

    // GET /api/queue (auth) — le travail actionnable, trié par priorité puis
    // ancienneté. C'est la source de vérité du worker Cronos : « que dois-je
    // traiter maintenant ? »
    if (p === "/api/queue" && method === "GET") {
      if (!requireAuth(req, res)) return;
      var actionable = readLeads().filter(isActionable);
      actionable.sort(function (a, b) {
        var pa = (a.triage && a.triage.priority) || 2, pb = (b.triage && b.triage.priority) || 2;
        if (pb !== pa) return pb - pa;
        return (a.receivedAt || "").localeCompare(b.receivedAt || "");
      });
      var qlimit = parseInt(u.searchParams.get("limit") || "20", 10);
      return json(res, 200, { count: actionable.length, leads: actionable.slice(0, qlimit) });
    }

    // POST /api/leads/<id>/claim (auth) — verrou de traitement (bail)
    var mClaim = p.match(/^\/api\/leads\/([\w-]+)\/claim$/);
    if (mClaim && method === "POST") {
      if (!requireAuth(req, res)) return;
      var cbody = await readBody(req) || {};
      var agent = String(cbody.agent || "cronos");
      var claimed = await claimLead(mClaim[1], agent, cbody.ttlSeconds);
      if (claimed.code === 200) return json(res, 200, claimed.lead);
      return json(res, claimed.code, { error: claimed.error || "lead introuvable", lease: claimed.lease });
    }

    // GET/PATCH /api/leads/<id> (auth)
    var mLead = p.match(/^\/api\/leads\/([\w-]+)$/);
    if (mLead) {
      if (!requireAuth(req, res)) return;
      var id = mLead[1];
      if (method === "GET") {
        var found = readLeads().find(function (l) { return l.id === id; });
        return found ? json(res, 200, found) : json(res, 404, { error: "lead introuvable" });
      }
      if (method === "PATCH") {
        var patch = await readBody(req) || {};
        var up = await updateLead(id, patch, patch.actor);
        return up ? json(res, 200, up) : json(res, 404, { error: "lead introuvable" });
      }
    }

    // PUT /api/content/<collection> (auth) — écrit + valide
    var mContent = p.match(/^\/api\/content\/([\w-]+)$/);
    if (mContent && method === "PUT") {
      if (!requireAuth(req, res)) return;
      var col = mContent[1];
      if (!COLLECTIONS[col]) return json(res, 404, { error: "collection inconnue : " + col });
      var data = await readBody(req);
      if (data == null) return json(res, 400, { error: "corps JSON requis" });
      var vc = validate(readSchema(COLLECTIONS[col]), data);
      if (!vc.valid) return json(res, 422, { error: "contenu invalide", details: vc.errors });
      fs.writeFileSync(path.join(CONTENT_DIR, col + ".json"), JSON.stringify(data, null, 2));
      return json(res, 200, { ok: true, collection: col, bytes: JSON.stringify(data).length });
    }
    // GET /api/content/<collection> (lecture pratique)
    if (mContent && method === "GET") {
      var col2 = mContent[1];
      if (!COLLECTIONS[col2]) return json(res, 404, { error: "collection inconnue" });
      try { return json(res, 200, JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, col2 + ".json"), "utf8"))); }
      catch (e) { return json(res, 404, { error: "contenu introuvable" }); }
    }

    // Sinon : fichiers statiques (site + /content/*.json + /content/schema/*)
    if (method === "GET") return serveStatic(req, res, p);
    return json(res, 405, { error: "méthode non autorisée" });
  } catch (err) {
    return json(res, 400, { error: String(err.message || err) });
  }
});

if (require.main === module) {
  ensureData();
  server.listen(PORT, function () {
    console.log("Fri-Consult API sur http://localhost:" + PORT + "  (root: " + ROOT + ")");
    if (!TOKEN) console.log("⚠️  FC_API_TOKEN non défini : /api/content (PUT) et /api/leads (GET) sont désactivés.");
  });
}
module.exports = server;
