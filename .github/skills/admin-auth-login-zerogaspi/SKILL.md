---
name: admin-auth-login-zerogaspi
description: 'Implémenter la connexion Admin dans ZeroGaspi (Node.js/Express + JWT) avec étapes, décisions d architecture, protection des routes et validation par tests. Use when: admin login, admin auth, JWT admin role, protect admin routes, secure admin account.'
argument-hint: 'Objectif admin auth (bootstrap admin, endpoint login admin, protection routes, tests) + contraintes de sécurité'
user-invocable: true
---

# Admin Authentication Login for ZeroGaspi

## Outcome
Ce skill produit une implémentation robuste de connexion Admin avec:
- stratégie d identité admin claire (fichier env ou base de données)
- endpoint de login admin sécurisé
- émission JWT avec role admin
- protection des routes admin via middleware
- tests backend pour non-régression

## Conversation Workflow Extracted
Méthodologie généralisée observée dans ce projet:
1. Lire l existant (controllers, routes, middleware, tests) avant toute modification.
2. Étendre le schéma et la couche modèle si la fonctionnalité exige une persistance.
3. Implémenter contrôleur puis route, puis brancher dans server.
4. Appliquer des contrôles métier + sécurité côté backend.
5. Ajouter des tests modèle + routes pour les cas nominal/erreur/autorisations.
6. Exécuter `npm test` et corriger jusqu à statut vert.

## When to Use
- Ajouter un vrai login admin au lieu d un token de test
- Sécuriser les endpoints `/api/admin/*`
- Introduire un compte admin bootstrap
- Fiabiliser JWT + contrôle de rôle admin

## Pré-requis
- Projet: `zerogaspi/`
- Dépendances auth déjà présentes dans le projet: `bcryptjs`, `jsonwebtoken`
- Variable recommandée: `JWT_SECRET` non vide

Commandes de base:
```powershell
Set-Location .\zerogaspi
node -v
npm install
```

## Decision Flow
1. Choisir la source d identité admin:
- Option A (simple): admin défini via variables d environnement (`ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`).
- Option B (scalable): table `admins` en SQLite.
2. Choisir le bootstrap:
- Option A: hash pré-généré stocké en env.
- Option B: script d initialisation DB pour créer le premier admin.
3. Vérifier la compatibilité des routes existantes:
- Conserver `authMiddleware` + `requireRole('admin')`.
4. Définir la politique de token:
- durée de vie, payload minimal (`id`, `role`), secret fort.

## Procédure Pas à Pas

### 1. Précheck sécurité
- Vérifier `JWT_SECRET` et l absence de secret hardcodé.
- Vérifier que les routes admin passent par `authMiddleware` puis `requireRole('admin')`.

Commande de contrôle rapide:
```powershell
npm test
```
Critère de sortie:
- tests existants passent avant changements

### 2. Implémenter l identité Admin
#### Option A: Admin via environnement
- Ajouter `ADMIN_EMAIL` et `ADMIN_PASSWORD_HASH` dans l environnement runtime.
- Dans le contrôleur auth, ajouter une branche login admin avant ou après recherche client/partner.

#### Option B: Admin via SQLite (recommandé long terme)
- Ajouter table `admins`:
```sql
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  mot_de_passe TEXT NOT NULL,
  est_actif INTEGER NOT NULL DEFAULT 1,
  cree_le TEXT NOT NULL DEFAULT (datetime('now'))
);
```
- Ajouter modèle `Admin` (`trouverParEmail`, `trouverParId`).

Critère de sortie:
- identité admin récupérable sans ambiguïté

### 3. Ajouter login admin dans authController
- Valider `email` + `mot_de_passe`.
- Vérifier le mot de passe via `bcrypt.compare`.
- Retourner 401 en cas d identifiants invalides sans divulguer la cause.
- Émettre JWT avec payload minimal:
```js
{ id: admin.id, role: 'admin' }
```

Critère de sortie:
- `POST /api/auth/login` retourne un token admin valide

### 4. Protéger les routes admin
- Appliquer `router.use(authMiddleware, requireRole('admin'))` dans `backend/routes/admin.js`.
- Vérifier absence de route admin publique involontaire.

Critère de sortie:
- 401 sans token
- 403 token non-admin
- 200 token admin

### 5. Renforcer les tests
Ajouter ou adapter des tests dans `backend/__tests__/auth.test.js` et `backend/__tests__/routes.test.js`:
- login admin valide -> 200 + token + role admin
- login admin invalide -> 401
- endpoint admin sans token -> 401
- endpoint admin avec token consumer/partner -> 403
- endpoint admin avec token admin -> 200

Commande:
```powershell
npm test
```
Critère de sortie:
- suite Jest verte

### 6. Validation opérationnelle
- Vérifier manuellement un appel:
  - login admin
  - appel `/api/admin/stats` avec Bearer token admin
- Vérifier que les réponses JSON restent stables.

## Quality Gates (Definition of Done)
- Auth admin implémentée avec mot de passe hashé.
- JWT admin signé avec secret non trivial.
- Toutes les routes admin protégées par rôle.
- Messages d erreur neutres (pas de fuite d information sensible).
- Tests auth/routes couvrent les cas d autorisation.
- `npm test` passe entièrement.

## Failure Branches and Recovery
- Si admin introuvable: renvoyer 401 et vérifier bootstrap admin.
- Si JWT invalide: renvoyer 401 et vérifier `JWT_SECRET`.
- Si régression des routes admin: vérifier ordre des middlewares.
- Si tests instables: isoler les données via base mémoire/test dédiée.

## Example Prompts
- `/admin-auth-login-zerogaspi implémenter login admin via table sqlite admins`
- `/admin-auth-login-zerogaspi ajouter bootstrap admin via script seed sécurisé`
- `/admin-auth-login-zerogaspi durcir les tests d autorisation des routes admin`
