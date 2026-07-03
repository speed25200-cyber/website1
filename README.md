# Fri-Consult — Site web

Site vitrine moderne pour **Fri-Consult Sàrl**, courtier en assurances indépendant en Suisse (Rossens, canton de Fribourg). Design épuré « style Apple », 100 % statique, sans dépendance ni étape de build — déployable partout (GitHub Pages, Netlify, Infomaniak, n'importe quel hébergement).

## ✨ Fonctionnalités

- Design responsive et animé (reveal au scroll, compteurs, glassmorphisme, mode réduit d'animations respecté).
- **Demande d'offre fonctionnelle** : assistant en 3 étapes (`demande-offre.html`) avec validation, récapitulatif et envoi réel par e-mail.
- **Formulaire de contact** fonctionnel (`contact.html`) avec carte de localisation.
- Pages : Accueil, Nos assurances (12 domaines), À propos, Contact, Mentions légales, Confidentialité, 404.
- SEO : métadonnées, Open Graph, données structurées `InsuranceAgency` (JSON-LD), `sitemap.xml`, `robots.txt`, manifeste PWA, favicon SVG.
- Accessibilité : HTML sémantique, navigation clavier, `aria`, lien d'évitement, contrastes soignés.

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
├── a-propos.html           À propos
├── demande-offre.html      Assistant de demande d'offre (3 étapes)
├── contact.html            Contact + carte + formulaire
├── mentions-legales.html
├── confidentialite.html    Politique de confidentialité (nLPD)
├── 404.html
├── robots.txt · sitemap.xml · site.webmanifest
└── assets/
    ├── css/styles.css      Design system complet
    ├── js/config.js        ⚙️ Coordonnées & réglages (à personnaliser)
    ├── js/main.js          En-tête, pied de page, animations, services
    ├── js/form.js          Assistant d'offre + formulaire de contact
    └── img/favicon.svg
```

Les domaines d'assurance et les cartes de services sont générés à partir d'une **source unique** (`SERVICES` dans `assets/js/main.js`) : ajouter ou modifier une assurance se fait à un seul endroit.

---
© Fri-Consult Sàrl · CHE-193.130.760
