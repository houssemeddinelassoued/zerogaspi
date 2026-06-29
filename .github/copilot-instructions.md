# Copilot Instructions - ZeroGaspi

## 1) Règles Générales de Développement

- Toujours privilégier la lisibilité, la simplicité et la maintenabilité.
- Éviter les effets de bord cachés: une fonction doit avoir un but clair.
- Ne pas dupliquer la logique métier: factoriser dans les couches appropriées.
- Respecter la séparation des responsabilités (routes, contrôleurs, modèles, middleware, front).
- Garder des fonctions courtes, nommées explicitement, avec des paramètres explicites.
- Gérer les erreurs de manière explicite et cohérente (code HTTP + message utile).
- Valider les entrées utilisateur côté API avant tout traitement.
- Conserver la compatibilité avec les routes et contrats JSON existants, sauf demande explicite de breaking change.
- Ajouter ou adapter des tests pour tout changement de comportement.
- Ne jamais exposer de secrets (tokens, clés, credentials) dans le code source.

## 2) Principes SOLID (Application Pratique)

### S - Single Responsibility Principle
- Un fichier/module doit avoir une responsabilité principale.
- Les routes définissent les endpoints, les contrôleurs orchestrent, les modèles accèdent aux données.

### O - Open/Closed Principle
- Étendre le comportement via nouvelles fonctions/modules plutôt que modifier fortement du code stable.
- Préférer les points d'extension (helpers, services) aux conditions en cascade.

### L - Liskov Substitution Principle
- Les implémentations alternatives doivent respecter le même contrat d'entrée/sortie.
- Aucun remplacement ne doit casser les attentes des consommateurs.

### I - Interface Segregation Principle
- Exposer des interfaces/fonctions ciblées, petites et claires.
- Éviter les objets utilitaires "fourre-tout" avec trop de responsabilités.

### D - Dependency Inversion Principle
- Dépendre d'abstractions simples (fonctions/facades), pas de détails techniques rigides.
- Injecter les dépendances importantes (accès DB, services externes) quand c'est possible pour faciliter les tests.

## 3) Stack Technique du Projet

### Backend
- Node.js
- Express
- SQLite (accès via couche modèles)
- Architecture en couches:
  - backend/routes
  - backend/controllers
  - backend/models
  - backend/middleware

### Frontend
- HTML/CSS/JavaScript vanilla
- Pages principales:
  - frontend/index.html
  - frontend/admin/dashboard.html
  - frontend/partner/dashboard.html
- Scripts dans frontend/js

### Tests & Qualité
- Jest pour les tests backend
- Dossier de tests: backend/__tests__
- Couverture générée dans coverage

### Déploiement
- Configuration Vercel présente (vercel.json à la racine et dans zerogaspi)

## 4) Conventions de Code Attendues

- Nommer les variables/fonctions en anglais cohérent avec le code existant.
- Éviter les noms ambigus (data, temp, value) sauf usage local très court.
- Utiliser async/await de façon cohérente.
- Toujours retourner une réponse HTTP dans les handlers Express.
- Préférer des réponses JSON structurées et stables.
- Côté front, centraliser les appels API dans des fonctions dédiées et gérer les erreurs d'affichage utilisateur.

## 5) Stratégie de Validation

Avant de finaliser un changement:

1. Vérifier que le code compile/exécute sans erreur.
2. Exécuter les tests existants.
3. Ajouter/adapter les tests nécessaires si comportement modifié.
4. Vérifier les cas limites (données vides, permissions, erreurs API).
5. Confirmer que l'expérience utilisateur reste cohérente côté front.


## Gestion de conflits des prompts IA :
- Si un prompt IA demande une tache ou l'utilisation d'une technologie qui n'est pas dans la stack technique du projet, demander à l'utilisateur de reformuler sa demande en respectant la stack technique du projet ou demander un choix entre les deux options (stack technique du projet ou technologie demandée par le prompt IA).
