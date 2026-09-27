# Portfolio — Prince Henri Junior Pamousso

Site portfolio (Angular) + espace administrateur, 100 % gratuit :
**Angular** (site) · **Firebase** (base de données + connexion) · **Cloudinary** (CV et photo) · **GitHub Pages** (hébergement, étape suivante).

```
portfolio/
├── frontend/            ← le site Angular (public + admin)
│   ├── src/app/core/        logique métier (testée) : validation, ajout, suppression, ordre, CV…
│   ├── src/app/infra/       connexion à Firebase et choix démo / réel
│   ├── src/app/public/      pages du site public
│   ├── src/app/admin/       espace administrateur
│   ├── src/environments/    ⚙️ TA CONFIGURATION (clés Firebase et Cloudinary)
│   ├── public/              photo par défaut, icône
│   └── tests/               tests automatiques (44 tests)
└── backend/             ← règles de sécurité Firebase + documentation des données
```

---

## Étape 1 — Lancer le site sur ton PC (mode démo, 5 minutes)

**Prérequis** : [Node.js 22 LTS](https://nodejs.org) (ou 20.19 minimum). Vérifie avec `node -v`.

Ouvre un terminal **dans le dossier `portfolio/frontend`**, puis :

```bash
npm install     # installe Angular, Firebase… (une seule fois, 1 à 3 minutes)
npm test        # lance les 44 tests de la logique métier → doit afficher « pass 44, fail 0 »
npm start       # ouvre le site sur http://localhost:4200
```

Tant que Firebase n'est pas configuré, le site tourne en **mode démo** (bandeau jaune en haut) :
- tout ton contenu est déjà là (compétences, services, projets, contacts) ;
- l'admin est accessible avec le **cadenas** en haut à droite : n'importe quel email valide + un mot de passe de 6 caractères ;
- tu peux tout tester (ajouter, modifier, masquer, réordonner, supprimer, changer le CV et la photo…), mais **rien n'est sauvegardé** : un rechargement de la page remet tout à zéro.

> ❗ Si `npm install` ou `npm start` affiche une erreur, copie-colle le message complet à Claude : il corrigera.

---

## Étape 2 — Configurer Firebase (base de données + connexion admin)

1. Va sur <https://console.firebase.google.com> → **Créer un projet** (nom : `portfolio-pphj` par ex.). Google Analytics : pas nécessaire. Reste sur le plan **Spark (gratuit)**.
2. **Ajouter une application Web** (icône `</>`), nom `portfolio`, **ne coche pas** Firebase Hosting. Firebase affiche un bloc `firebaseConfig` : copie les 6 valeurs dans `frontend/src/environments/environment.ts` (partie `firebase`).
3. **Authentication** → Commencer → **Email/Mot de passe** → Activer → Enregistrer.
   - Onglet **Users** → **Ajouter un utilisateur** → ton email + un mot de passe solide. C'est ton compte admin.
   - Copie son **User UID** (colonne UID).
   - Onglet **Settings** → **User actions** → décoche **Enable create (sign-up)** pour que personne d'autre ne puisse créer de compte.
4. **Firestore Database** → Créer une base de données → mode **production** → région proche (ex. `europe-west1`).
   - Onglet **Règles** : colle le contenu de `backend/firestore.rules`, remplace `REMPLACE_PAR_TON_UID` par ton UID, puis **Publier**.

Relance `npm start`. Le bandeau jaune disparaît. Connecte-toi à l'admin avec ton vrai compte, puis clique sur **« Importer le contenu de départ »** : ton contenu est enregistré pour de bon.

---

## Étape 3 — Configurer Cloudinary (CV et photo)

1. Crée un compte gratuit sur <https://cloudinary.com> (sans carte bancaire).
2. Sur le tableau de bord, note ton **Cloud name**.
3. **Settings** (roue dentée) → **Upload** → **Add upload preset** :
   - Upload preset name : `portfolio`
   - Signing mode : **Unsigned**
   - Enregistre.
4. **Settings** → **Security** → coche **« Allow delivery of PDF and ZIP files »** → Enregistre. *(Sans ça, le CV ne pourra pas être téléchargé.)*
5. Dans `frontend/src/environments/environment.ts`, remplis `cloudName` et `uploadPreset: 'portfolio'`.

Relance `npm start`, va dans **Admin → CV & photo** et envoie ton CV et ta photo.

> Quand tu remplaces un fichier, l'ancien n'est plus utilisé par le site mais reste stocké sur Cloudinary (quelques Ko). Tu peux le supprimer à la main dans Cloudinary → Media Library si tu veux faire du ménage.

---

## Ce que l'admin peut faire (à vérifier une fois configuré)

| Page | Actions | Règles appliquées |
| --- | --- | --- |
| **Compétences** | ajouter, modifier, masquer/afficher, monter/descendre, supprimer, créer une nouvelle catégorie | nom obligatoire (40 car. max), pas de doublon, logo Devicon optionnel avec aperçu, ordre par catégorie |
| **Projets** | ajouter, modifier, statut En cours / Terminé, masquer, réordonner, supprimer | titre et description obligatoires, liens vérifiés (https ajouté automatiquement), 10 technos max |
| **Services** | ajouter, modifier, choisir l'icône, masquer, réordonner, supprimer | les 4 premiers apparaissent aussi sous ta photo |
| **CV & photo** | envoyer, remplacer, supprimer le CV ; remplacer la photo ou revenir à celle par défaut | CV en PDF, photo JPG/PNG/WEBP, 5 Mo max ; si l'envoi échoue, l'ancien fichier reste en ligne |
| **Liens de contact** | modifier email, WhatsApp, LinkedIn, GitHub | email valide, numéro avec indicatif, lien LinkedIn vérifié |
| Partout | thème clair/sombre, confirmation avant suppression, messages de succès/erreur | seules les personnes connectées avec **ton** UID peuvent écrire (règles Firestore) |

Chaque modification apparaît **immédiatement** sur le site public (sans recharger).

### Tests automatiques

`npm test` vérifie 44 comportements : validations, ajout/modification/suppression, ordre, doublons, remplacement et suppression du CV, échec d'envoi (l'ancien CV reste), contacts, erreurs de droits, envoi vers Cloudinary, messages de connexion…

### Test manuel conseillé (10 minutes)

1. Site : thème clair/sombre, menu (aussi sur téléphone), filtres des projets, liens de contact, bouton CV.
2. Admin : ajoute une compétence « Kotlin » (logo `kotlin`) → elle apparaît sur le site ; masque-la → elle disparaît ; supprime-la.
3. Ajoute un projet avec des technos `angular, firebase` → les logos s'affichent sur la carte.
4. Envoie un CV → le bouton « Télécharger mon CV » apparaît ; supprime-le → le bouton disparaît.
5. Change ta photo → le cercle de l'accueil se met à jour.
6. Déconnecte-toi, puis essaie d'ouvrir `/admin` → tu es renvoyé vers la connexion.

---

## Commandes

| Commande (dans `frontend/`) | Rôle |
| --- | --- |
| `npm start` | lance le site en local (http://localhost:4200) |
| `npm test` | lance les tests automatiques |
| `npm run build` | prépare la version finale dans `dist/` |
| `npm run deploy` | publication sur GitHub Pages (on le fera ensemble à l'étape déploiement) |

## Dépannage

- **« Impossible de charger les données »** : la configuration Firebase est incomplète ou les règles Firestore ne sont pas publiées.
- **« Action refusée : ce compte n'a pas les droits administrateur »** : l'UID dans `firestore.rules` ne correspond pas à ton compte.
- **« Cloudinary a refusé le fichier (Upload preset not found) »** : le nom du preset est différent de celui dans `environment.ts`, ou il n'est pas en mode *Unsigned*.
- **Le CV ne s'ouvre pas** : active « Allow delivery of PDF and ZIP files » dans Cloudinary (étape 3.4).
- **Un logo ne s'affiche pas** : le nom Devicon est incorrect (voir <https://devicon.dev>). Les initiales s'affichent à la place, rien ne casse.
