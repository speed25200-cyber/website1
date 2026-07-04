# Fri-Consult — Backend de référence (API leads + écriture de contenu)

Serveur **sans dépendance** (Node ≥ 18, modules natifs). Il sert le site statique **et** expose une API JSON pour l'app iOS et l'agent **Cronos**. Le contrat de contenu et de lead est celui de [`../content`](../content) et [`../AGENT.md`](../AGENT.md).

## Démarrer

```bash
cd server
cp .env.example .env         # définir FC_API_TOKEN
FC_API_TOKEN=$(openssl rand -hex 32) node api.js
# → http://localhost:8787
```

Ou via Docker (depuis la racine du dépôt) :

```bash
docker build -f server/Dockerfile -t fri-consult-api .
docker run -p 8787:8787 -e FC_API_TOKEN=xxxx fri-consult-api
```

## Endpoints

| Méthode | Chemin | Auth | Rôle |
|---|---|---|---|
| `GET` | `/api/health` | – | état du service |
| `GET` | `/api/manifest` | – | manifeste du contenu |
| `GET` | `/content/<name>.json` | – | lecture publique du contenu |
| `GET` | `/api/content/<collection>` | – | lecture d'une collection |
| `PUT` | `/api/content/<collection>` | 🔒 | **écrit** une collection (validée par schéma) |
| `POST` | `/api/leads` | – | crée un **lead** (`fri-consult/lead@1`), **pré-trié** à l'entrée |
| `GET` | `/api/leads` | 🔒 | liste les leads (`?status=`, `?limit=`) |
| `GET` | `/api/leads/<id>` | 🔒 | un lead |
| `PATCH` | `/api/leads/<id>` | 🔒 | traite : `status` / `notes` / `response` / `assignee` |
| `GET` | `/api/stats` | 🔒 | agrégats de la file (statut / catégorie / priorité) |
| `GET` | `/admin` | – | **console Cronos / conseiller** (auth via les appels API) |

🔒 = en-tête `Authorization: Bearer <FC_API_TOKEN>`. Sans `FC_API_TOKEN`, les routes protégées renvoient `503` (sécurisé par défaut).

`collection` ∈ `site, services, posts, testimonials, faq`. Toute écriture est **validée contre le schéma** ; en cas d'erreur → `422` avec le détail.

## Cronos : traitement des demandes

Toute demande POSTée sur `/api/leads` est **pré-triée** par [`intake.js`](intake.js) (déterministe, sans IA) : un objet `triage` (catégorie, priorité 1-4 + SLA, `urgent`/`complaint`, tags, résumé, brouillon d'accusé de réception multilingue) est attaché au lead. **Cronos** (l'agent) relève la file, rédige la vraie réponse conseil et clôture via `PATCH`. Boucle complète : [`../AGENT.md`](../AGENT.md) §7. Interface web équivalente : `/admin`.

## Exemples

```bash
TOKEN=xxxx
# créer un lead (c'est aussi la cible du webhook du formulaire)
curl -X POST localhost:8787/api/leads -H 'Content-Type: application/json' \
  -d '{"schema":"fri-consult/lead@1","type":"contact","source":"api","createdAt":"2026-07-04T10:00:00Z","contact":{"email":"a@b.ch"}}'

# lister les leads (app iOS / CRM)
curl localhost:8787/api/leads -H "Authorization: Bearer $TOKEN"

# publier une FAQ mise à jour (agent Cronos)
curl -X PUT localhost:8787/api/content/faq -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' --data @../content/faq.json
```

## Brancher le formulaire du site sur ce backend

Dans `content/site.json` → `forms.leadWebhook` = `https://<votre-api>/api/leads`.
Chaque demande d'offre/contact y sera POSTée en JSON (`lead@1`), en plus de l'e-mail.

## Notes de production

- Les leads sont stockés dans `server/data/leads.json` (non versionné). Pour la
  production, montez un volume persistant ou remplacez `readLeads/appendLead`
  par une vraie base (Postgres, KV…). L'interface reste identique.
- Placez le service derrière HTTPS et restreignez `FC_ALLOW_ORIGIN`.
- L'écriture de contenu modifie les fichiers `content/*.json` sur disque ;
  pour publier sur un site statique, committez/poussez ensuite (ou servez le
  site directement depuis ce backend).
