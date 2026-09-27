# Backend du portfolio (Firebase)

Il n'y a **aucun serveur à coder ni à héberger**. Le « backend » est fourni par Firebase (gratuit, plan Spark) et Cloudinary (gratuit) :

| Besoin | Service | Où c'est dans le code |
| --- | --- | --- |
| Base de données (compétences, projets, services, réglages) | Cloud Firestore | `frontend/src/app/infra/firebase.ts` |
| Connexion de l'administrateur | Firebase Authentication (email + mot de passe) | `frontend/src/app/infra/firebase.ts` |
| Fichiers (CV en PDF, photo de profil) | Cloudinary | `frontend/src/app/core/cloudinary.ts` |
| Logique métier (validation, ajout, suppression, ordre…) | TypeScript pur, testé | `frontend/src/app/core/` |
| **Sécurité** (qui a le droit d'écrire) | Règles Firestore | `backend/firestore.rules` (ce dossier) |

## Structure des données dans Firestore

```
skills/{id}      name, category, icon, visible, order
projects/{id}    title, description, category, tech[], repoUrl, demoUrl, status ('en-cours' | 'termine'), visible, order
services/{id}    title, description, icon ('web'|'api'|'mobile'|'pwa'|'idea'|'tools'), visible, order
settings/site    cvUrl, cvFileName, cvPublicId, cvUpdatedAt, photoUrl, photoPublicId, photoUpdatedAt,
                 contacts { email, whatsapp, linkedin, github }, yearsExperience
```

Le contenu de départ s'importe en un clic depuis l'admin (bouton « Importer le contenu de départ »).

## Publier les règles de sécurité

**Méthode simple (sans rien installer)** : Firebase Console → Firestore Database → onglet **Règles** → colle le contenu de `firestore.rules` (après avoir remplacé `REMPLACE_PAR_TON_UID`) → **Publier**.

**Méthode en ligne de commande** (facultatif) :

```bash
npm install -g firebase-tools
firebase login
firebase use --add        # choisis ton projet
firebase deploy --only firestore:rules
```

## Modifier le nombre d'années d'expérience

Il est stocké dans `settings/site` → champ `yearsExperience` (2 par défaut). Tu peux le changer directement dans la console Firestore.
