# Fri-Consult — Site web

Site vitrine moderne pour **Fri-Consult Sàrl**, courtier en assurances indépendant en Suisse (Rossens, canton de Fribourg). Design épuré « style Apple », 100 % statique, sans dépendance ni étape de build — déployable partout (GitHub Pages, Netlify, Infomaniak, n'importe quel hébergement).

## 🤖 Contenu piloté par les données (CMS headless)

Le site est **piloté par des fichiers JSON** dans [`content/`](content/) (services, articles, FAQ, témoignages, coordonnées), validés par des **JSON Schema** — pensé pour être géré par un **agent IA (Cronos)** et une **app iOS**, sans toucher au HTML.

- Point d'entrée machine : [`content/manifest.json`](content/manifest.json).
- Guide de gestion (édition via Git, schémas, leads/webhook, contrat d'API) : **[`AGENT.md`](AGENT.md)**.
- Les demandes d'offre émettent un **lead JSON structuré** (`content/schema/lead.schema.json`) livré par e-mail **et** par webhook configurable (`content/site.json → forms.leadWebhook`) — prêt pour l'app iOS / un CRM.

Le site reste 100 % statique : rendu côté client à partir des JSON, avec repli sur des valeurs embarquées si le contenu est indisponible (jamais de page vide).

## ✨ Fonctionnalités

- **Mode sombre** complet : bascule dans l'en-tête, détection `prefers-color-scheme`, mémorisation, sans flash au chargement.
- **Calculateur d'économies interactif** (`calculateur.html`) : sliders, résultat animé, répartition par domaine, CTA pré-rempli.
- **Demande d'offre fonctionnelle** : assistant en 3 étapes (`demande-offre.html`) avec validation, récapitulatif et envoi réel par e-mail.
- **Formulaire de contact** fonctionnel (`contact.html`) avec carte de localisation.
- **Section Conseils** (`conseils.html`) : blog avec 4 guides experts (LAMal, 3e pilier, résiliation, ménage & RC).
- **PWA hors-ligne** : service worker (`sw.js`) + page de repli, les pages visitées restent consultables sans connexion.
- Chrome enrichi : barre de progression de lecture, bouton retour-en-haut, bandeau cookies nLPD, bouton contact flottant (WhatsApp si configuré).
- Design responsive et animé (reveal au scroll, compteurs, glassmorphisme, mode réduit d'animations et styles d'impression respectés).
- Pages : Accueil, Nos assurances (12 domaines), Calculateur, Conseils (+ 4 articles), À propos, Contact, Demande d'offre, Mentions légales, Confidentialité, Hors-ligne, 404.
- SEO : métadonnées, Open Graph, données structurées `InsuranceAgency` + `FAQPage` + `BreadcrumbList` + `Article` (JSON-LD), `sitemap.xml`, `robots.txt`, manifeste PWA, favicon SVG.
- Accessibilité : HTML sémantique, navigation clavier, `aria`, lien d'évitement, contrastes soignés, focus visibles.

## 🚀 Mise en ligne

Il s'agit de fichiers statiques. Servez simplement le dossier.

**Test local :**
```bash
python3 -m http.server 8080
# puis ouvrir http://localhost:8080
```

**GitHub Pages :** activez Pages sur la branche voulue (racine `/`). Le site est directement servi.

## ⚙️ Personnalisation — à faire avant la mise en production

Tout est centralisé dans **`assets/js/config.js`** :

| Champ | Description |
|------|-------------|
| `contact.email` | Adresse qui **reçoit les demandes d'offre et messages**. |
| `contact.phone` / `phoneHref` | ⚠️ **Numéro de téléphone à renseigner** (valeur actuelle = provisoire). |
| `contact.street`, `zip`, `city`, `canton` | Adresse affichée partout. |
| `contact.hours` | Horaires d'ouverture. |
| `social` | Liens réseaux sociaux (optionnels). |
| `formEndpoint` | Service d'envoi des formulaires (voir ci-dessous). |

### 📮 Rendre les formulaires opérationnels

Par défaut, les formulaires utilisent **[FormSubmit.co](https://formsubmit.co)** — **aucune inscription requise**.

1. Vérifiez que `contact.email` dans `config.js` est bien votre adresse.
2. **Envoyez une première demande de test** depuis le site en ligne : FormSubmit vous adressera un e-mail d'activation à confirmer **une seule fois**.
3. Les demandes suivantes arriveront directement dans votre boîte.

> Vous préférez un autre service (Formspree, Web3Forms, backend maison) ? Remplacez simplement `formEndpoint` dans `config.js`.
>
> En cas d'échec d'envoi, un lien de repli ouvre automatiquement la messagerie du visiteur (`mailto:`) — le site reste fonctionnel en toute circonstance.

## 🗂 Structure

```
├── index.html              Accueil
├── assurances.html         Nos assurances (12 domaines)
├── calculateur.html        Calculateur d'économies interactif
├── conseils.html           Blog / guides (index)
├── conseil-*.html          4 articles (LAMal, 3e pilier, résiliation, ménage & RC)
├── a-propos.html           À propos
├── demande-offre.html      Assistant de demande d'offre (3 étapes)
├── contact.html            Contact + carte + formulaire
├── mentions-legales.html · confidentialite.html   Pages légales (nLPD)
├── offline.html · 404.html
├── sw.js                   Service worker (PWA hors-ligne)
├── robots.txt · sitemap.xml · site.webmanifest
└── assets/
    ├── css/styles.css      Design system (thème clair/sombre, impression)
    ├── js/config.js        ⚙️ Coordonnées & réglages (à personnaliser)
    ├── js/main.js          Chrome, thème, animations, services, articles, SW
    ├── js/form.js          Assistant d'offre + formulaire de contact
    ├── js/calc.js          Calculateur d'économies
    └── img/favicon.svg
```

Les services (`SERVICES`) et les articles (`POSTS`) sont générés depuis une **source unique** dans `assets/js/main.js` : ajouter ou modifier un élément se fait à un seul endroit.

> Après avoir modifié le HTML/CSS/JS, pensez à incrémenter `VERSION` dans `sw.js` pour que les visiteurs récupèrent la nouvelle version (le service worker met en cache les fichiers).

---
© Fri-Consult Sàrl · CHE-193.130.760
