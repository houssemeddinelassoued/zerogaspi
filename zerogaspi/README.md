# 🌿 ZéroGaspi — Plateforme de Réduction du Gaspillage Alimentaire

> Mettre en relation les commerçants qui ont des invendus avec les consommateurs qui veulent en profiter — simplement, rapidement et localement.

---

## 📌 Objectif du projet

**ZéroGaspi** est une plateforme web full-stack qui crée un écosystème de mise en relation en temps réel entre :

- les **professionnels de l'alimentation** (restaurants, boulangeries, hôtels, supermarchés…) qui disposent d'invendus périssables en fin de journée ;
- les **consommateurs** (étudiants, familles, jeunes actifs…) souhaitant acheter ces invendus sous forme de **"paniers surprises"** à prix réduit.

### Bénéfices

| Acteur | Bénéfice |
|---|---|
| 🏪 Partenaire (commerçant) | Réduire les pertes financières, attirer une clientèle locale, améliorer son image RSE |
| 🛍️ Consommateur | Faire des économies, découvrir des commerces de proximité, agir pour l'environnement |
| 🛠️ Administrateur | Modérer la plateforme, valider les partenaires, suivre les transactions |

---

## 🏗️ Architecture du projet

```
zerogaspi/
├── backend/                   # Serveur Node.js + Express
│   ├── server.js              # Point d'entrée — initialise Express et les routes
│   ├── config/
│   │   └── database.js        # Connexion et initialisation de la base SQLite
│   ├── controllers/           # Logique métier (traitement des requêtes)
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── basketController.js
│   │   └── partnerController.js
│   ├── middleware/
│   │   └── auth.js            # Vérification du token JWT sur les routes protégées
│   ├── models/
│   │   └── models.js          # Définition des tables SQLite (Users, Baskets, Partners)
│   └── routes/                # Déclaration des endpoints REST
│       ├── admin.js
│       ├── auth.js
│       ├── baskets.js
│       └── partners.js
├── frontend/                  # Interface utilisateur statique
│   ├── index.html             # Page d'accueil — carte + liste des paniers disponibles
│   ├── style.css              # Styles globaux (complément à TailwindCSS)
│   ├── admin/
│   │   └── dashboard.html     # Back-office administrateur
│   ├── partner/
│   │   └── dashboard.html     # Tableau de bord partenaire
│   └── js/
│       ├── auth.js            # Gestion de l'authentification côté client
│       ├── map.js             # Intégration de la carte et géolocalisation
│       ├── partner.js         # Interactions du tableau de bord partenaire
│       └── admin.js           # Interactions du back-office admin
├── package.json
└── .env                       # Variables d'environnement (non versionné)
```

---

## 🧰 Stack technique

### Frontend
| Technologie | Rôle |
|---|---|
| **HTML5** | Structure des pages (SPA légère multi-pages) |
| **CSS custom** | Système visuel de l'interface actuelle, layout responsive, cartes, filtres et footer |
| **Google Fonts** (`Inter`) | Typographie principale de l'interface |
| **Material Symbols Outlined** | Icônes de navigation, recherche et actions |
| **JavaScript Vanilla** | Logique client, appels API `fetch`, DOM |
| **Leaflet.js** | Cartographie interactive et géolocalisation |

### Backend
| Technologie | Rôle |
|---|---|
| **Node.js** | Environnement d'exécution JavaScript côté serveur |
| **Express.js** | Framework HTTP — routage, middlewares, API REST |
| **better-sqlite3** | Driver SQLite synchrone haute performance |
| **jsonwebtoken** | Génération et vérification des tokens JWT |
| **bcryptjs** | Hachage sécurisé des mots de passe |
| **dotenv** | Chargement des variables d'environnement |
| **cors** | Gestion des politiques Cross-Origin |

### Base de données
| Technologie | Rôle |
|---|---|
| **SQLite** | Base de données relationnelle embarquée, sans serveur dédié |

---

## 🎨 Direction artistique de l'interface actuelle

L'interface front actuelle adopte un style **marketplace premium, clair et rassurant**, pensé pour mettre en avant les paniers disponibles sans surcharger l'utilisateur.

### Palette de couleurs

| Usage | Couleur | Hex |
|---|---|---|
| Fond principal | Bleu très clair presque blanc | `#f7f8ff` / `#fbfcff` |
| Surfaces | Blanc | `#ffffff` |
| Texte principal | Bleu nuit doux | `#142033` |
| Texte secondaire | Gris bleuté | `#5f6b7d` |
| Couleur primaire | Vert anti-gaspi | `#05803a` |
| Accent lumineux | Vert vivant | `#17b35c` |
| Survol / sélection | Vert très pâle | `#d7f4df` |
| Footer | Bleu ardoise foncé | `#23334b` |

### Typographie

- Police principale: `Inter`
- Hiérarchie nette avec titres gras et espacements courts
- Titres larges, légèrement resserrés, pour renforcer le côté éditorial et premium
- Texte courant volontairement sobre pour garder une lecture rapide sur mobile et desktop

### Composition visuelle

- Barre supérieure fixe avec branding, navigation, recherche et actions rapides
- Panneau latéral de filtres à gauche pour guider la découverte
- Grille de cartes en 3 colonnes sur grand écran, 2 colonnes sur tablette, 1 colonne sur mobile
- Cartes à bords arrondis, ombres douces et effet de survol discret
- Footer sombre pour créer une fin de page marquée et équilibrer l'ensemble

### Composants UI

- Badges contextuels: `Bio`, `Premium`
- Chips de filtre avec état sélectionné visible
- Cartes panier avec image d'ambiance, prix barré, prix réduit et heure de collecte
- Bouton d'action principal vert pour la réservation
- Icônes linéaires via `Material Symbols Outlined`

### Principes de rendu

- Lisibilité prioritaire sur l'effet visuel
- Contraste modéré, jamais agressif
- Hiérarchie claire entre navigation, filtres, contenu et actions
- Design responsive orienté consultation rapide et réservation immédiate

---

## 🗃️ Modèle de données

```
┌──────────────┐       ┌──────────────────┐       ┌────────────────┐
│    Users     │       │     Partners     │       │    Baskets     │
├──────────────┤       ├──────────────────┤       ├────────────────┤
│ id           │       │ id               │       │ id             │
│ name         │       │ user_id (FK)     │◄──────│ partner_id (FK)│
│ email        │◄──────│ business_name    │       │ title          │
│ password     │       │ address          │       │ description    │
│ role         │       │ latitude         │       │ price          │
│ created_at   │       │ longitude        │       │ quantity       │
└──────────────┘       │ category         │       │ pickup_time    │
                       │ is_validated     │       │ is_active      │
                       └──────────────────┘       │ created_at     │
                                                  └────────────────┘
```

**Rôles utilisateurs** : `consumer` | `partner` | `admin`

---

## 🔌 API REST — Endpoints principaux

### Authentification (`/api/auth`)
| Méthode | Route | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Créer un compte |
| `POST` | `/api/auth/login` | Se connecter, retourne un JWT |

### Paniers (`/api/baskets`)
| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/baskets` | Lister tous les paniers actifs |
| `GET` | `/api/baskets/:id` | Détail d'un panier |
| `POST` | `/api/baskets` | Créer un panier *(partenaire requis)* |
| `PUT` | `/api/baskets/:id` | Modifier un panier *(partenaire requis)* |
| `DELETE` | `/api/baskets/:id` | Supprimer un panier *(partenaire requis)* |

### Partenaires (`/api/partners`)
| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/partners` | Lister les partenaires validés |
| `GET` | `/api/partners/:id` | Profil d'un partenaire |
| `PUT` | `/api/partners/:id` | Mettre à jour le profil *(partenaire requis)* |

### Administration (`/api/admin`)
| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/admin/partners/pending` | Partenaires en attente de validation |
| `PUT` | `/api/admin/partners/:id/validate` | Valider un partenaire |
| `GET` | `/api/admin/stats` | Statistiques globales de la plateforme |

> Toutes les routes protégées nécessitent un header `Authorization: Bearer <token>`.

---

## 🚀 Installation et lancement

### Prérequis
- **Node.js** v18+ — [nodejs.org](https://nodejs.org)
- **npm** v9+

### 1. Cloner le dépôt

```bash
git clone <url-du-dépôt>
cd zerogaspi
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

Créer un fichier `.env` à la racine du dossier `zerogaspi/` :

```env
PORT=3000
JWT_SECRET=votre_secret_jwt_tres_long_et_aleatoire
DB_PATH=./zerogaspi.db
```

> ⚠️ Ne jamais versionner le fichier `.env` — il est listé dans `.gitignore`.

### 4. Lancer le serveur

```bash
node backend/server.js
```

Le serveur démarre sur `http://localhost:3000`. La base de données SQLite est créée automatiquement au premier lancement.

### 5. Accéder à l'application

| Interface | URL |
|---|---|
| Page d'accueil (consommateur) | `frontend/index.html` (ouvrir dans le navigateur) |
| Tableau de bord partenaire | `frontend/partner/dashboard.html` |
| Back-office administrateur | `frontend/admin/dashboard.html` |

---

## 👥 Rôles et parcours utilisateurs

### 🛍️ Consommateur
1. Consulte la carte avec les commerces partenaires à proximité
2. Filtre par type de nourriture, distance, heure de collecte
3. Achète un panier surprise (simulation de paiement)
4. Reçoit une confirmation et se rend sur place pour récupérer son panier

### 🏪 Partenaire (commerçant)
1. Crée un compte et soumet son dossier de validation
2. Une fois validé, accède à son tableau de bord
3. Déclare ses paniers disponibles en quelques clics (quantité, heure de collecte, prix)
4. Suit ses revenus, le volume de nourriture sauvée et l'équivalent CO₂ évité

### 🛠️ Administrateur
1. Valide ou rejette les nouvelles demandes de partenaires
2. Modère les contenus et gère les litiges
3. Consulte les statistiques globales de la plateforme

---

## 📁 Variables d'environnement

| Variable | Description | Valeur par défaut |
|---|---|---|
| `PORT` | Port d'écoute du serveur Express | `3000` |
| `JWT_SECRET` | Clé secrète pour signer les tokens JWT | *(obligatoire)* |
| `DB_PATH` | Chemin vers le fichier SQLite | `./zerogaspi.db` |

---

## 🤝 Contribuer

Les contributions sont les bienvenues !

1. Forker le dépôt
2. Créer une branche : `git checkout -b feature/ma-fonctionnalite`
3. Commiter les changements : `git commit -m "feat: description claire"`
4. Pousser la branche : `git push origin feature/ma-fonctionnalite`
5. Ouvrir une Pull Request

---

## 📄 Licence

Ce projet est distribué sous licence **MIT**. Voir le fichier `LICENSE` pour plus de détails.

---

*ZéroGaspi — Moins de gaspillage, plus de partage.* 🌍