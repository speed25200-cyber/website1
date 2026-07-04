#!/usr/bin/env node
/* =========================================================================
   Fri-Consult — Worker Cronos : traitement 100 % autonome des demandes
   -------------------------------------------------------------------------
   Complément du projet Cronos Code (agents LLM locaux). Ce worker relie la
   file de demandes du site aux modèles locaux :

     site → POST /api/leads → file triée → [ce worker] → LLM LOCAL → réponse
                                                        ↘ repli déterministe

   Deux façons de l'utiliser :

   1. BOUCLE AUTONOME (aucun humain) :
        node cronos-worker.js run                # boucle continue
        node cronos-worker.js run --once         # traite la file puis s'arrête
      Pour chaque demande : claim (bail anti-doublon) → génération de la
      réponse par le LLM local (endpoint compatible OpenAI : Ollama, LM
      Studio, llama.cpp-server…) → garde-fous → PATCH response + done.
      Si le LLM est indisponible ou que sa sortie échoue les garde-fous, le
      brouillon déterministe du triage est envoyé (dégradé mais jamais bloqué).

   2. OUTIL PILOTÉ PAR UN AGENT (Cronos Code exécute des commandes ; sortie
      JSON sur stdout, pensée machine) :
        node cronos-worker.js queue              # que faut-il traiter ?
        node cronos-worker.js next               # réclame la plus prioritaire
        node cronos-worker.js show <id>
        node cronos-worker.js complete <id> --response-file rep.txt
        node cronos-worker.js stats

   Variables d'environnement
     FC_API_URL        API du backend (défaut http://localhost:8787)
     FC_API_TOKEN      jeton Bearer (obligatoire)
     CRONOS_AGENT      identifiant de l'agent (défaut cronos-local)
     CRONOS_LLM_URL    endpoint OpenAI-compatible (défaut http://localhost:11434/v1)
     CRONOS_LLM_MODEL  modèle local (défaut llama3.1)
     CRONOS_LLM_KEY    clé éventuelle (LM Studio/serveurs qui en exigent une)
     CRONOS_INTERVAL   secondes entre deux passes en mode run (défaut 30)

   Sans dépendance : Node >= 18 (fetch natif).
   ========================================================================= */
"use strict";

var API = (process.env.FC_API_URL || "http://localhost:8787").replace(/\/+$/, "");
var TOKEN = process.env.FC_API_TOKEN || "";
var AGENT = process.env.CRONOS_AGENT || "cronos-local";
var LLM_URL = (process.env.CRONOS_LLM_URL || "http://localhost:11434/v1").replace(/\/+$/, "");
var LLM_MODEL = process.env.CRONOS_LLM_MODEL || "llama3.1";
var LLM_KEY = process.env.CRONOS_LLM_KEY || "";
var INTERVAL = Math.max(5, parseInt(process.env.CRONOS_INTERVAL || "30", 10));

/* ---- API backend ------------------------------------------------------- */
function api(method, path, body) {
  var headers = { "Content-Type": "application/json", "Authorization": "Bearer " + TOKEN };
  return fetch(API + path, { method: method, headers: headers, body: body ? JSON.stringify(body) : undefined })
    .then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok) { var e = new Error(j.error || ("HTTP " + r.status)); e.status = r.status; e.body = j; throw e; }
        return j;
      });
    });
}

/* ---- Génération de la réponse ------------------------------------------ */
function systemPrompt() {
  return [
    "Tu es Cronos, le conseiller virtuel du courtier en assurances suisse Fri-Consult (Rossens, Fribourg).",
    "Tu rédiges la réponse e-mail envoyée au client suite à sa demande sur le site.",
    "Règles impératives :",
    "- Réponds dans la langue du client (champ triage.lang : fr, de ou en). Ton chaleureux, professionnel, suisse.",
    "- Fri-Consult est un courtier INDÉPENDANT : tu compares les offres du marché, tu n'invente JAMAIS de prix, de primes ni de garanties chiffrées.",
    "- Réponds concrètement à la demande (domaines d'assurance, profil, canton) et propose un rappel ou un rendez-vous pour chiffrer précisément.",
    "- Si la demande est une réclamation, excuse-toi et propose un contact direct rapide.",
    "- Signe « Votre équipe Fri-Consult » (adapté à la langue).",
    "- Réponds UNIQUEMENT avec le texte de l'e-mail, sans objet, sans balises, sans commentaire.",
  ].join("\n");
}

function userPrompt(lead) {
  var view = {
    type: lead.type, locale: lead.locale, insurances: lead.insurances,
    profile: lead.profile, contact: lead.contact, subject: lead.subject,
    message: lead.message, triage: lead.triage && {
      category: lead.triage.category, categoryLabel: lead.triage.categoryLabel,
      priority: lead.triage.priorityLabel, urgent: lead.triage.urgent,
      complaint: lead.triage.complaint, lang: lead.triage.lang, sla: lead.triage.sla,
    },
  };
  return "Demande client (JSON) :\n" + JSON.stringify(view, null, 2) + "\n\nRédige la réponse e-mail.";
}

function callLocalLlm(lead) {
  var headers = { "Content-Type": "application/json" };
  if (LLM_KEY) headers["Authorization"] = "Bearer " + LLM_KEY;
  var ctrl = new AbortController();
  var timer = setTimeout(function () { ctrl.abort(); }, 120000);
  return fetch(LLM_URL + "/chat/completions", {
    method: "POST", headers: headers, signal: ctrl.signal,
    body: JSON.stringify({
      model: LLM_MODEL,
      temperature: 0.4,
      max_tokens: 700,
      messages: [
        { role: "system", content: systemPrompt() },
        { role: "user", content: userPrompt(lead) },
      ],
    }),
  }).then(function (r) {
    if (!r.ok) return r.text().then(function (t) { throw new Error("LLM HTTP " + r.status + " : " + t.slice(0, 200)); });
    return r.json();
  }).then(function (d) {
    clearTimeout(timer);
    var msg = d.choices && d.choices[0] && d.choices[0].message;
    return String((msg && msg.content) || "").trim();
  }).catch(function (e) { clearTimeout(timer); throw e; });
}

// Garde-fous : la sortie du LLM local n'est acceptée que si elle est plausible
// et ne chiffre pas de prime (un courtier ne promet pas de prix par e-mail).
function passGuards(text, lead) {
  if (!text || text.length < 80 || text.length > 6000) return "longueur hors bornes";
  if (/(CHF|Fr\.)\s*\d/i.test(text) || /\d+\s*(CHF|francs)/i.test(text)) return "prix chiffré interdit";
  if (/```|<\/?[a-z]+>/i.test(text)) return "balises/code dans la réponse";
  var email = lead.contact && lead.contact.email;
  if (email && text.indexOf(email) !== -1) return "l'e-mail du client ne doit pas apparaître dans le corps";
  return null; // OK
}

function generateResponse(lead) {
  return callLocalLlm(lead).then(function (text) {
    var why = passGuards(text, lead);
    if (why) throw new Error("garde-fou : " + why);
    return { text: text, engine: "llm:" + LLM_MODEL };
  }).catch(function (e) {
    var draft = (lead.triage && lead.triage.suggestedReply) || "";
    if (!draft) throw e;
    return { text: draft, engine: "fallback", reason: String(e.message || e) };
  });
}

/* ---- Traitement d'une demande ------------------------------------------ */
async function processOne(lead) {
  var claimed = await api("POST", "/api/leads/" + lead.id + "/claim", { agent: AGENT, ttlSeconds: 600 });
  var gen = await generateResponse(claimed);
  var notes = "[" + AGENT + "] réponse " + gen.engine + (gen.reason ? " (repli : " + gen.reason + ")" : "");
  var done = await api("PATCH", "/api/leads/" + lead.id, {
    actor: AGENT,
    response: gen.text,
    status: "done",
    notes: (claimed.notes ? claimed.notes + "\n" : "") + notes,
  });
  return { id: done.id, engine: gen.engine, priority: claimed.triage && claimed.triage.priorityLabel, to: claimed.contact && claimed.contact.email };
}

async function drainQueue() {
  var out = [];
  for (;;) {
    var q = await api("GET", "/api/queue?limit=1");
    if (!q.leads || !q.leads.length) break;
    try {
      out.push(await processOne(q.leads[0]));
    } catch (e) {
      if (e.status === 409) continue; // pris par un autre agent entre-temps
      out.push({ id: q.leads[0].id, error: String(e.message || e) });
      break; // ne pas boucler sur une erreur systémique
    }
  }
  return out;
}

/* ---- CLI ----------------------------------------------------------------*/
function print(obj) { console.log(JSON.stringify(obj, null, 2)); }
function argVal(name) { var i = process.argv.indexOf(name); return i > -1 ? process.argv[i + 1] : undefined; }

async function main() {
  var cmd = process.argv[2] || "help";
  if (!TOKEN && cmd !== "help") { console.error("FC_API_TOKEN requis."); process.exit(2); }

  if (cmd === "queue") return print(await api("GET", "/api/queue?limit=" + (argVal("--limit") || 20)));
  if (cmd === "stats") return print(await api("GET", "/api/stats"));
  if (cmd === "show") return print(await api("GET", "/api/leads/" + process.argv[3]));

  if (cmd === "next") {
    var q = await api("GET", "/api/queue?limit=1");
    if (!q.leads || !q.leads.length) return print({ empty: true });
    return print(await api("POST", "/api/leads/" + q.leads[0].id + "/claim", { agent: AGENT, ttlSeconds: parseInt(argVal("--ttl") || "600", 10) }));
  }

  if (cmd === "complete") {
    var id = process.argv[3];
    var text = argVal("--response");
    var file = argVal("--response-file");
    if (!text && file) text = require("fs").readFileSync(file, "utf8");
    if (!id || !text) { console.error("usage : complete <id> --response \"…\" | --response-file f"); process.exit(2); }
    return print(await api("PATCH", "/api/leads/" + id, { actor: AGENT, response: text, status: "done", notes: argVal("--notes") }));
  }

  if (cmd === "run") {
    var once = process.argv.indexOf("--once") > -1;
    console.error("Cronos worker « " + AGENT + " » — API " + API + " — LLM " + LLM_URL + " (" + LLM_MODEL + ")");
    for (;;) {
      try {
        var results = await drainQueue();
        if (results.length) print(results);
      } catch (e) { console.error("passe en échec : " + (e.message || e)); }
      if (once) break;
      await new Promise(function (r) { setTimeout(r, INTERVAL * 1000); });
    }
    return;
  }

  console.log([
    "Cronos worker — traitement autonome des demandes Fri-Consult",
    "",
    "  run [--once]                 boucle autonome (LLM local + repli)",
    "  queue [--limit N]            travail actionnable (JSON)",
    "  next [--ttl S]               réclame la demande la plus prioritaire",
    "  show <id>                    détail d'une demande",
    "  complete <id> --response …   enregistre la réponse et clôture",
    "  stats                        agrégats de la file",
    "",
    "Env : FC_API_URL, FC_API_TOKEN, CRONOS_AGENT, CRONOS_LLM_URL, CRONOS_LLM_MODEL, CRONOS_INTERVAL",
  ].join("\n"));
}

main().catch(function (e) { console.error(String(e && e.message || e)); process.exit(1); });
