---
name: sqlite-setup-zerogaspi
description: 'Configurer et intégrer une base SQLite dans ZeroGaspi (Node.js/Express) avec étapes, commandes, points de décision et validations qualité. Use when: sqlite setup, sqlite integration, node:sqlite, DB_PATH, schema SQL, seed data, tests backend.'
argument-hint: 'Objectif SQLite (nouvelle table, migration schema, seed, ou intégration complète) + contraintes de données'
user-invocable: true
---

# SQLite Setup for ZeroGaspi

## Outcome
Ce skill guide une implémentation SQLite robuste dans le projet ZeroGaspi avec:
- configuration de la connexion
- création/évolution du schéma
- intégration contrôleurs/modèles
- validation par tests et checks runtime

## When to Use
- Ajouter SQLite au backend Express
- Créer une nouvelle table métier
- Modifier le schéma existant sans casser les routes API
- Vérifier la persistance en local et en tests

## Pré-requis
- Node.js >= 22.5 (recommandé: 22.x) pour utiliser `node:sqlite` sans dépendance npm.
- Depuis la racine du repo, dossier applicatif: `zerogaspi/`.

Commandes de base:
```powershell
cd zerogaspi
node -v
npm install
```

## Decision Flow
1. Vérifier la version Node.
2. Si Node >= 22.5: utiliser `node:sqlite` (aucune dépendance SQLite à installer).
3. Si Node < 22.5: soit mettre à jour Node 22, soit fallback temporaire via package npm (`sqlite3` ou `better-sqlite3`).
4. Vérifier si la base doit être persistée localement (`DB_PATH`) ou isolée pour les tests (`DB_PATH` dédié test).
5. Appliquer schéma SQL en mode idempotent (`CREATE TABLE IF NOT EXISTS`).

## Procédure Pas à Pas

### 1. Précheck environnement
```powershell
cd zerogaspi
node -e "console.log(process.versions.node)"
```
Critère de sortie:
- Version >= 22.5 confirmée

### 2. Configurer la connexion SQLite
Créer ou adapter `backend/config/database.js`:
- importer `DatabaseSync` depuis `node:sqlite`
- définir `DB_PATH` via variable d'environnement
- ouvrir une seule connexion par process
- exécuter le SQL d'initialisation

Vérification rapide:
```powershell
node -e "const connectDB=require('./backend/config/database'); const db=connectDB(); console.log('sqlite ok');"
```
Critère de sortie:
- message de connexion SQLite affiché sans erreur

### 3. Définir le schéma SQL (idempotent)
Bonnes pratiques:
- `INTEGER PRIMARY KEY AUTOINCREMENT`
- contraintes `NOT NULL`, `UNIQUE`, `CHECK`
- clés étrangères avec `REFERENCES ... ON DELETE ...`
- colonnes date par défaut: `datetime('now')`

Exemple de pattern SQL:
```sql
CREATE TABLE IF NOT EXISTS example_table (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```
Critère de sortie:
- relancer le serveur deux fois ne doit pas échouer (script idempotent)

### 4. Intégrer les modèles
Dans `backend/models/models.js`:
- centraliser les requêtes SQL
- utiliser des requêtes paramétrées (`?`) pour éviter l'injection
- gérer explicitement les erreurs et retours vides

Checklist:
- lecture: `SELECT`
- écriture: `INSERT/UPDATE/DELETE`
- conversion des types attendus (INTEGER/REAL/TEXT)

### 5. Intégrer contrôleurs et routes
- conserver les contrats JSON existants
- ne pas casser les endpoints actuels
- retourner des codes HTTP cohérents (`200`, `201`, `400`, `401`, `404`, `500`)

Commandes de validation serveur:
```powershell
npm run dev
```
Critère de sortie:
- endpoints critiques répondent sans régression fonctionnelle

### 6. Ajouter/adapter les tests
Commandes:
```powershell
npm test
npm run test:coverage
```
Recommandations:
- isoler une base de test via `DB_PATH` spécifique
- tester au moins: création, lecture, erreurs validation, cas vide

Critère de sortie:
- tests backend passent
- pas de régression sur routes auth/models/baskets

## Branches et Cas Particuliers
- Si `node:sqlite` indisponible: upgrader Node 22 prioritairement.
- Si besoin de seed initial: créer un script dédié (`backend/scripts/seed.js`) rejouable.
- Si migration de schéma nécessaire: écrire un script versionné (`migrations/001_add_x.sql`) plutôt que modifier silencieusement les données existantes.

## Quality Gates (Definition of Done)
- Connexion SQLite fonctionnelle avec `DB_PATH` configurable.
- Schéma idempotent et cohérent avec la logique métier.
- Requêtes paramétrées et erreurs gérées.
- Contrats API inchangés (sauf demande explicite).
- `npm test` vert.
- Vérification manuelle d'au moins un flux métier complet.

## Example Prompts
- `/sqlite-setup-zerogaspi intégrer une table orders avec relation client`
- `/sqlite-setup-zerogaspi ajouter un script de seed pour les paniers de démonstration`
- `/sqlite-setup-zerogaspi vérifier la sécurité SQL des modèles existants`


- Utilise le fichier `Guide Documentation SQL` pour vérifier les bonnes pratiques de création de schéma et d'indexation.