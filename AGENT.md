# Gérer Fri-Consult — Guide pour l'agent Cronos & l'app iOS

Ce site est un **CMS « headless »** : tout le contenu vit dans des fichiers **JSON** sous [`/content`](content/), validés par des **JSON Schema**. Le site (HTML/CSS/JS statique) se rend automatiquement à partir de ces données. **On ne touche jamais au HTML pour changer du contenu** — on édite le JSON.

> Point d'entrée machine : [`content/manifest.json`](content/manifest.json). Lis-le en premier : il liste toutes les collections, leurs chemins, leurs schémas et où elles s'affichent.

---

## 1. Modèle de contenu

| Collection | Fichier | Schéma | Type | S'affiche sur |
|---|---|---|---|---|
| Config globale | `content/site.json` | `schema/site.schema.json` | objet | tout le site (en-tête, pied, contact) |
| Assurances | `content/services.json` | `schema/service.schema.json` | tableau | accueil, `assurances.html`, assistant d'offre |
| Articles | `content/posts.json` | `schema/post.schema.json` | tableau | accueil, `conseils.html` |
| Témoignages | `content/testimonials.json` | `schema/testimonial.schema.json` | tableau | accueil |
| FAQ | `content/faq.json` | `schema/faq.schema.json` | tableau | accueil (+ JSON-LD `FAQPage`) |

Chaque élément possède un `id` **stable** (kebab-case). Ne jamais réutiliser ni renommer un `id` déjà publié (utilisé dans les URLs/ancres).

### Icônes disponibles
`shield, heart, car, home, building, scale, plane, piggy, briefcase, key, paw, umbrella, coins, doc, spark, users, globe, lock, handshake, chat, phone, mail, pin, clock`
(liste faisant foi : champ `icons` de `content/manifest.json`.)

---

## 2. Flux d'écriture (via Git — recommandé)

Cronos gère le site en modifiant les fichiers JSON puis en poussant sur le dépôt. GitHub Pages (ou l'hébergeur) publie automatiquement.

```
1. git pull
2. Éditer le(s) fichier(s) content/*.json
3. VALIDER contre le schéma correspondant (obligatoire — voir §4)
4. git add content/ && git commit -m "content: <résumé>"
5. git push
```

### Exemples

**Modifier une coordonnée** → `content/site.json` (`contact.phone`, `contact.email`, `contact.hours`, …). Incrémenter `version`.

**Ajouter une assurance** → ajouter un objet à `content/services.json` :
```json
{ "id": "cyber", "icon": "lock", "title": "Cyber & données",
  "tag": "Particuliers & PME", "short": "Protégez-vous contre le vol de données et la fraude en ligne.",
  "points": ["Fraude & usurpation", "Assistance en cas de piratage", "Cyber-RC", "Restauration de données"] }
```

**Publier un article** → 2 étapes :
1. ajouter les métadonnées dans `content/posts.json` (`id`, `icon`, `cat`, `mins`, `title`, `excerpt`) ;
2. créer le corps de l'article : copier un fichier `conseil-*.html` existant vers `<id>.html`, remplacer le contenu de `.article-body`, le `<title>`, la meta description et le JSON-LD. Ajouter `<id>.html` à `sitemap.xml` et à la liste `CORE` de `sw.js` (puis incrémenter `VERSION`).

**Activer WhatsApp** → `content/site.json` → `contact.whatsapp` = numéro international sans `+` ni espaces (ex. `41791234567`). Le bouton flottant s'active tout seul.

> ⚠️ Après toute modification de contenu, pense à **incrémenter `site.json → version`**. Le service worker sert `content/*.json` en *network-first*, donc les changements apparaissent au rechargement suivant.

---

## 3. Demandes (leads) — pour l'app iOS / le CRM

Les formulaires (demande d'offre, contact) émettent un **objet JSON structuré** conforme à [`content/schema/lead.schema.json`](content/schema/lead.schema.json), contrat `fri-consult/lead@1`.

Deux canaux de livraison (configurables dans `content/site.json → forms`) :

- **E-mail** via FormSubmit (`forms.formEndpoint`) — actif par défaut.
- **Webhook** (`forms.leadWebhook`) — si renseigné, chaque demande est **POSTée en JSON** à cette URL. C'est le point d'intégration pour l'app iOS / le CRM / un backend Cronos. En-têtes personnalisés possibles via `forms.leadWebhookHeaders` (ex. clé d'API).

Exemple de payload reçu par le webhook :
```json
{
  "schema": "fri-consult/lead@1",
  "type": "quote",
  "source": "demande-offre.html",
  "createdAt": "2026-07-04T09:12:33.000Z",
  "locale": "fr-CH",
  "insurances": ["Assurance maladie", "Véhicules"],
  "profile": { "status": "Particulier / Famille", "canton": "Fribourg", "birthdate": "", "callback": "Matin (08h – 12h)" },
  "contact": { "firstName": "Jean", "lastName": "Dupont", "email": "jean@exemple.ch", "phone": "+41 79 000 00 00" },
  "message": "…",
  "consent": true
}
```

L'app iOS peut : (a) **lire le contenu** directement depuis `https://<domaine>/content/*.json` (données publiques, format stable) ; (b) **recevoir les leads** via un backend abonné au `leadWebhook`.

---

## 4. Validation (à faire avant chaque push)

Le contenu invalide n'affiche rien pour la section concernée (le site ne plante pas, mais la donnée est perdue). **Valide toujours** contre le schéma avant de committer. Exemple avec `ajv` :

```bash
npx ajv-cli validate -s content/schema/service.schema.json -d content/services.json
npx ajv-cli validate -s content/schema/post.schema.json    -d content/posts.json
npx ajv-cli validate -s content/schema/faq.schema.json     -d content/faq.json
npx ajv-cli validate -s content/schema/testimonial.schema.json -d content/testimonials.json
npx ajv-cli validate -s content/schema/site.schema.json    -d content/site.json
```

Règles d'or : JSON strictement valide (guillemets doubles, pas de virgule finale), `id` stable et unique, `icon` dans la liste autorisée, longueurs respectées.

---

## 5. Contrat d'API (pour un backend futur)

Aujourd'hui : lecture = fichiers statiques `GET /content/*.json` ; écriture = Git. Pour une future API REST gérée par Cronos/l'app, conserver ces formes (mêmes schémas) :

| Méthode | Chemin | Rôle |
|---|---|---|
| `GET` | `/content/manifest.json` | découverte |
| `GET` | `/content/{collection}.json` | lire une collection |
| `PUT` | `/content/{collection}.json` | remplacer (valider via schéma) |
| `POST` | `/leads` | créer un lead (`lead@1`) |
| `GET` | `/leads` | lister les leads (backend requis) |

Tant qu'aucun backend n'est déployé, l'écriture passe par Git et les leads par e-mail/webhook.
