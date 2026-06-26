# Plan de progression - ZeroGaspi

**Date d'analyse:** 2026-06-26  
**Responsable:** Équipe dev  
**Statut:** En cours de phase 1  
**Dernière mise à jour:** 2026-06-26

---

## 1. Vue d'ensemble et objectif final

### Progression actuelle
```
Backend API.............. 65% [████████░] (structure ok, protection insuffisante)
Base de données.......... 55% [█████░░░░] (modèle ok, persistance manquante)
Frontend dynamique....... 25% [██░░░░░░░] (interfaces ok, data-binding absent)
Intégration bout-en-bout. 20% [██░░░░░░░] (très peu de flux connectés)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Progression globale...... 40% [████░░░░░]
```

### Objectif final (100%)
Un système complet où :
- **Front Public:** Affiche paniers du backend, filtres dynamiques, carte active
- **Dashboard Partenaire:** Crée/modifie paniers en temps réel, stats persistantes
- **Dashboard Admin:** Valide partenaires, consulte statistiques
- **Auth:** Tokens JWT, séparation des rôles stricte, sessions persistantes
- **DB:** SQLite sur disque, seed de demo, migrations possibles

### Enjeu principal
La structure existe, mais **les interfaces ne parlent pas encore vraiment au backend**. Les paniers du dashboard partenaire disparaissent au rechargement, les données de la page d'accueil sont figées, les stats admin sont mockées.

---

## 2. Diagnostic détaillé par couche

### 2.1 Backend (Express) – 65% ✓

**Points en place:**
- Serveur Express + CORS + JSON parsing ✓
- Endpoints REST structurés (auth, baskets, partners, admin) ✓
- Middleware JWT + rolecheck ✓
- Logique métier dans contrôleurs ✓

**Points critique à corriger:**
| Problème | Impact | Priorité |
|----------|--------|----------|
| Routes paniers (POST/PUT/DELETE) sans `authMiddleware` | N'importe qui crée/modifie des paniers | 🔴 Critical |
| Pas de vérification d'appartenance (owner check) | Un partner peut modifier les paniers d'un autre | 🔴 Critical |
| DB en mémoire (:memory:) au lieu de fichier | Perte complète des données au redémarrage | 🔴 Critical |
| Contrats API incohérents (admin.js vs backend) | Frontend appelle endpoints inexistants | 🟠 High |
| Pas d'authentification sur /api/partners/:id/update | Modification libre des profils | 🟠 High |

**Fichiers concernés:**
- `backend/server.js` – Usage mémoire au lieu de fichier
- `backend/routes/baskets.js` – Routes sans protection
- `backend/controllers/basketController.js` – Pas de vérification propriétaire
- `backend/controllers/adminController.js` – Endpoints OK, mais trop basiques

---

### 2.2 Base de données (SQLite) – 55% ✓

**Points en place:**
- Schéma 3 tables (commercants, clients, paniers_surprises) ✓
- Contraintes métier (prix, quantité) ✓
- Logique cascade (suppression commercant = suppression paniers) ✓

**Points critiques à corriger:**
| Problème | Impact | Priorité |
|----------|--------|----------|
| Stockée en mémoire RAM (:memory:) | Perte au redémarrage | 🔴 Critical |
| backend/config/database.js existe mais non utilisé | Code dupliqué, confusion | 🔴 Critical |
| Pas de seed/fixture pour tests manuels | Chaque fois faut créer des données | 🟠 High |
| Pas de migration/versioning | Difficile d'évoluer le schéma | 🟡 Medium |

**Fichiers concernés:**
- `backend/server.js` – Changer DatabaseSync(':memory:') en chemin fichier
- `backend/config/database.js` – Factoriser l'initialisation
- *À créer:* `backend/scripts/seed.js` – Données de démo

---

### 2.3 Frontend Public (index.html) – 25% ✓

**Points en place:**
- Interface marketplace soignée et responsive ✓
- Structure cartes + filtres + footer ✓
- Styles Material Design cohérents ✓

**Points critiques à corriger:**
| Problème | Impact | Priorité |
|----------|--------|----------|
| Paniers hardcodés en HTML (6 exemples statiques) | Contenu jamais mis à jour | 🔴 Critical |
| Aucun script pour charger /api/baskets | Pas de connexion backend | 🔴 Critical |
| Boutons "Réserver" non fonctionnels | Conversion 0% | 🔴 Critical |
| Filtres côté client seulement | Pas de backend filtering | 🟠 High |
| map.js parle de Google Maps (pas intégré) | Cartographie absente | 🟡 Medium |

**Fichiers concernés:**
- `frontend/index.html` – Remplacer <section class="cards-grid"> par un container vide
- *À créer:* `frontend/js/api.js` – Client API centralisé
- *À créer:* `frontend/js/index.js` – Logique vitrine (fetch paniers, rendu dynamique)
- `frontend/style.css` – Aucune modification nécessaire

---

### 2.4 Frontend Partenaire (dashboard) – 30% ✓

**Points en place:**
- UI complète (formulaire, cartes, stats, timeline) ✓
- Interactions JavaScript locales (filtre, ajout local, stats client) ✓

**Points critiques à corriger:**
| Problème | Impact | Priorité |
|----------|--------|----------|
| Paniers stockés en tableau JS local seulement | Disparaissent au rechargement | 🔴 Critical |
| Formulaire ne POST pas vers /api/baskets | Aucune persistance | 🔴 Critical |
| Pas de récupération paniers partenaire connecté | Toujours affiche dummy data | 🔴 Critical |
| Pas de token JWT appliqué aux requêtes | Pas d'authentification | 🔴 Critical |
| Stats calculées sur données locales | Jamais à jour avec le backend | 🟠 High |

**Fichiers concernés:**
- `frontend/partner/dashboard.html` – Aucune modification HTML nécessaire
- `frontend/js/partner.js` – Refondre complètement pour API backend
- *À créer:* `frontend/js/auth-client.js` – Gestion token + détection login

---

### 2.5 Frontend Admin – 20% ✓

**Points en place:**
- Ébauche de page HTML ✓
- Script admin.js présent ✓

**Points critiques à corriger:**
| Problème | Impact | Priorité |
|----------|--------|----------|
| admin.js appelle /api/admin/users (inexistant) | Erreur 404 | 🔴 Critical |
| admin.js appelle /api/admin/analytics (inexistant) | Erreur 404 | 🔴 Critical |
| admin/dashboard.html trop basique, DOM incohérent | Pas de place pour données | 🔴 Critical |
| Pas de token admin appliqué | Pas de sécurité | 🔴 Critical |
| Bouton inexistant (#fetch-analytics) | Erreur au clic | 🟠 High |

**Fichiers concernés:**
- `frontend/admin/dashboard.html` – Refondre complètement avec DOM réaliste
- `frontend/js/admin.js` – Aligner sur endpoints réels (/api/admin/partners/pending, /api/admin/stats)

---

### 2.6 Authentification – 40% ✓

**Points en place:**
- Backend: JWT generation + bcryptjs ✓
- Backend: roles (consumer, partner, admin) ✓
- Middleware JWT + requireRole ✓

**Points critiques à corriger:**
| Problème | Impact | Priorité |
|----------|--------|----------|
| frontend/js/auth.js envoie FormData (backend attend JSON) | Parse error 400 | 🔴 Critical |
| auth.js attend data.success (backend ne renvoie pas) | Logique conditionnelle cassée | 🔴 Critical |
| Token jamais stocké côté front (pas localStorage) | Req suivantes sans auth | 🔴 Critical |
| Pas d'écran login/register dans les interfaces | Impossible de se connecter | 🔴 Critical |
| Pas de logout (session infinie ou manquante) | Conflit sécurité | 🟠 High |

**Fichiers concernés:**
- `frontend/js/auth.js` – Refondre complètement
- *À créer:* `frontend/auth/login.html` – Page dédiée
- *À créer:* `frontend/auth/register.html` – Page dédiée

---

## 3. Matrice d'impact – Ce que change chaque phase

```
Phase 1: DB persistante + Routes protégées
├─ Impact dev        → Données survivent redémarrage + sécurité de base ✓
├─ Impact utilisateur → Aucun (backend only)
└─ % progression      → 40% → 45%

Phase 2: Frontend public dynamique
├─ Impact dev        → API client centralisé, rendu templated
├─ Impact utilisateur → Les paniers changent maintenant en temps réel ✓✓✓
└─ % progression      → 45% → 60%

Phase 3: Dashboard partenaire connecté
├─ Impact dev        → Services partenaire + gestion token
├─ Impact utilisateur → Crée paniers, les voit persister, stat réelles ✓✓✓
└─ % progression      → 60% → 75%

Phase 4: Admin dashboard connecté
├─ Impact dev        → Admin service, validation UI
├─ Impact utilisateur → Valide partenaires depuis l'interface ✓
└─ % progression      → 75% → 85%

Phase 5: Cartographie + robustesse
├─ Impact dev        → Intégration map, logs, erreurs gracieuses
├─ Impact utilisateur → Découverte géolocalisée des paniers ✓
└─ % progression      → 85% → 100%
```

---

## 4. Plan d'exécution détaillé par phase

### ⚡ PHASE 1: Fondations solides (Jour 1-2) – Cible: 45%

**Objectif:** DB persistante, routes protégées, authentification JSON, seed de démo.

#### Tâche 1.1 – Basculer SQLite en persistance fichier (30 min)

**Fichier:** `backend/server.js`  
**Changement:**
```javascript
// AVANT:
const db = new DatabaseSync(':memory:');

// APRÈS:
const dbPath = process.env.DB_PATH || './zerogaspi.db';
const db = new DatabaseSync(dbPath);
console.log(`📦 DB SQLite: ${dbPath}`);
```

**Test:** Redémarrer serveur, créer un panier, redémarrer → le panier persiste ✓

---

#### Tâche 1.2 – Protéger routes paniers avec JWT (45 min)

**Fichier:** `backend/routes/baskets.js`  
**Changement:** Ajouter `authMiddleware` et `requireRole('partner', 'admin')` sur POST/PUT/DELETE

```javascript
const { authMiddleware, requireRole } = require('../middleware/auth');

// AVANT:
router.post('/', basketController.createBasket);

// APRÈS:
router.post('/', authMiddleware, requireRole('partner', 'admin'), basketController.createBasket);
router.put('/:id', authMiddleware, requireRole('partner', 'admin'), basketController.updateBasket);
router.delete('/:id', authMiddleware, requireRole('partner', 'admin'), basketController.deleteBasket);
```

**Test:** POST /api/baskets sans token → 401 ✓

---

#### Tâche 1.3 – Ajouter vérification propriétaire panier (45 min)

**Fichier:** `backend/controllers/basketController.js`  
**Changement:** Sur PUT/DELETE, vérifier que le panier appartient au partner connecté

```javascript
// Pseudo-code à implémenter dans updateBasket et deleteBasket:
const panier = PanierSurprise.trouverParId(id);
if (panier.commercant_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Non propriétaire de ce panier.' });
}
```

**Test:** Partner A ne peut pas modifier panier de Partner B ✓

---

#### Tâche 1.4 – Créer script seed avec données de démo (30 min)

**Fichier (nouveau):** `backend/scripts/seed.js`  
**Contenu:**
```javascript
// Script qui crée:
// - 1 admin (email: admin@zerogaspi.fr, pass: admin123)
// - 1 partenaire validé (email: partner@zerogaspi.fr, pass: partner123)
// - 1 partenaire en attente (email: pending@zerogaspi.fr, pass: pending123)
// - 3 paniers actifs du partenaire validé
// - 1 client (email: client@zerogaspi.fr, pass: client123)
```

**Ajouter à package.json:**
```json
"scripts": {
  "seed": "node backend/scripts/seed.js"
}
```

**Test:** npm run seed → données présentes ✓

---

#### Tâche 1.5 – Corriger contrat auth (JSON vs FormData) (30 min)

**Fichier:** `backend/controllers/authController.js`  
**Changement:** Garder le code backend identique (il accepte déjà JSON).

**Fichier:** `frontend/js/auth.js` (refonte complète)  
**Changement:** Envoyer JSON et gérer correctement la réponse

```javascript
fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, mot_de_passe })
})
.then(r => r.json())
.then(data => {
    if (data.token) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_role', data.user.role);
        window.location.href = data.user.role === 'admin' 
            ? '/admin/dashboard.html' 
            : '/partner/dashboard.html';
    } else {
        alert(data.error || 'Erreur connexion');
    }
})
```

**Test:** Connexion réussie, token stocké, redirection selon rôle ✓

---

#### 🎯 Checklist validation Phase 1

- [ ] npm start → DB fichier créée (`zerogaspi.db` visible)
- [ ] npm run seed → 0 erreur
- [ ] Poster panier sans token → 401 Unauthorized
- [ ] Poster panier avec token invalide → 401
- [ ] Poster panier avec token valide → 201 Created
- [ ] Redémarrer serveur → panier toujours présent
- [ ] Login form envoie JSON → réponse avec token
- [ ] Token stocké en localStorage
- [ ] Vérifier rôle: admin/partner détecté correctement

**Durée estimée:** 3h  
**À la fin:** 45% du projet

---

### 🎯 PHASE 2: Frontend public dynamique (Jour 3-4) – Cible: 60%

**Objectif:** Paniers affichés depuis le backend, filtres dynamiques, API client centralisé.

#### Tâche 2.1 – Créer API client centralisé (45 min)

**Fichier (nouveau):** `frontend/js/api.js`

```javascript
// Classe ApiClient:
// - getToken() → récupère localStorage
// - fetch(url, options) → injecte token + gère erreurs
// - baskets.getAll() → GET /api/baskets
// - baskets.getOne(id) → GET /api/baskets/:id
// - baskets.reserve(id) → POST avec décrement (futur)
// - partners.getAll() → GET /api/partners
// - etc.

// Export: ApiClient singleton
```

**Utilisation:**
```javascript
const api = new ApiClient('http://localhost:3000');
api.baskets.getAll().then(paniers => { /* rendu */ });
```

**Test:** api.baskets.getAll() retourne les paniers de la DB ✓

---

#### Tâche 2.2 – Créer logique vitrine dynamique (1h)

**Fichier (nouveau):** `frontend/js/index.js`

Responsabilités:
1. Charger paniers au démarrage
2. Afficher "Chargement..." pendant fetch
3. Créer cartes HTML dynamiquement
4. Gérer filtres côté client (ou server plus tard)
5. Afficher "Aucun panier disponible" si vide

**Intégration dans index.html:**
```html
<section class="cards-grid" id="baskets-container" aria-label="Tous les paniers">
    <!-- Rempli dynamiquement par index.js -->
</section>

<script src="js/api.js" defer></script>
<script src="js/index.js" defer></script>
```

**Test:**
- Page chargée → paniers de la DB apparaissent (pas les 6 statiques)
- Ajouter panier via admin → apparaît sur page sans refresh
- Réduire quantité → mise à jour après refresh

---

#### Tâche 2.3 – Connecter filtres (30 min)

**Fichier:** `frontend/js/index.js`  
**Ajout:**
- Récupérer sélection filtre depuis clics boutons
- Filtrer tableau paniers avant rendu
- Afficher "Aucun résultat" si vide

**Test:** Cliquer "Boulangerie" → seuls paniers catégorie "Boulangerie" visibles ✓

---

#### Tâche 2.4 – Remplacer HTML statique par template (30 min)

**Fichier:** `frontend/index.html`  
**Changement:** Remplacer les 6 `<article class="basket-card">` hardcodées par:

```html
<section class="cards-grid" id="baskets-container" 
         aria-label="Tous les paniers dynamiques">
    <!-- Index.js remplit ceci -->
</section>
```

**Test:** Page source HTML plus courte, DOM généré par JS ✓

---

#### 🎯 Checklist validation Phase 2

- [ ] api.js charge correctement avec ApiClient singleton
- [ ] index.js fetch GET /api/baskets au chargement
- [ ] Paniers de la DB s'affichent (état: vide si aucun panier)
- [ ] Filtres réduisent liste en temps réel
- [ ] Ajouter panier depuis admin → visible après refresh du public
- [ ] Responsive: 1 col mobile, 2 col tablet, 3 col desktop
- [ ] États: chargement, erreur API, vide, normal

**Durée estimée:** 3h  
**À la fin:** 60% du projet

---

### 🎯 PHASE 3: Dashboard partenaire connecté (Jour 5-6) – Cible: 75%

**Objectif:** Créer/modifier paniers, récupérer ses propres paniers, stats réelles.

#### Tâche 3.1 – Implémenter login partenaire (1h)

**Fichier (nouveau):** `frontend/auth/login.html`
- Form email + mot de passe
- Appelle POST /api/auth/login
- Stocke token + rôle en localStorage
- Redirige vers dashboard selon rôle

**Fichier (nouveau):** `frontend/js/auth-client.js`
```javascript
// Fonctions utilitaires:
// - isLoggedIn() → booléen
// - logout() → efface localStorage + redirige vers accueil
// - getToken() → string ou null
// - getCurrentUser() → { id, nom, email, role }
// - isRole(role) → booléen pour vérifier rôle courant
// - requireAuth() → redirige vers login si pas connecté
```

**Intégration dans partner/dashboard.html:**
```html
<script src="../js/auth-client.js" defer></script>
<script>
  document.addEventListener('DOMContentLoaded', () => {
    if (!isLoggedIn() || !isRole('partner')) {
      window.location.href = '../auth/login.html';
    }
  });
</script>
```

**Test:** 
- Pas connecté → redirigé vers login
- Connecté en tant que consumer → redirigé vers page attente "Pas accès"
- Connecté en tant que partner → dashboard visible

---

#### Tâche 3.2 – Charger paniers du partenaire connecté (45 min)

**Fichier:** `frontend/js/partner.js` (refonte)  
**Changement majeure:** 

```javascript
// AVANT: paniers = [{ id: 1, title: '...', ... }] (hardcoded)

// APRÈS:
let currentPartnerId = null;
let partnersBaskets = [];

async function loadPartnersBaskets() {
    const token = localStorage.getItem('auth_token');
    const user = JSON.parse(localStorage.getItem('current_user'));
    currentPartnerId = user.id;
    
    try {
        const res = await fetch('/api/baskets', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const allBaskets = await res.json();
        // Filtrer pour partenaire courant uniquement
        partnersBaskets = allBaskets.filter(b => b.commercant_id === currentPartnerId);
        renderBaskets();
    } catch (err) {
        console.error('Erreur chargement paniers:', err);
    }
}

// Appeler au chargement DOM
document.addEventListener('DOMContentLoaded', loadPartnersBaskets);
```

**Test:**
- Partner A voit seulement ses paniers
- Partner B voit seulement ses paniers
- Admin voit tous (à implémenter plus tard)

---

#### Tâche 3.3 – Connecter formulaire création panier (1h)

**Fichier:** `frontend/js/partner.js`  
**Changement:**

```javascript
// Gestionnaire basketForm submit:
basketForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(basketForm);
    const data = {
        commercant_id: currentPartnerId,
        nom: formData.get('title'),
        prix_origine: parseFloat(formData.get('prix_original')) || 0,
        prix_reduit: parseFloat(formData.get('price')),
        quantite: parseInt(formData.get('quantity')),
        description: formData.get('description'),
        heure_collecte: formData.get('pickup')
    };
    
    try {
        const res = await fetch('/api/baskets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            },
            body: JSON.stringify(data)
        });
        
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const newBasket = await res.json();
        partnersBaskets.push(newBasket);
        basketForm.reset();
        feedback.textContent = `✓ ${data.nom} publié!`;
        renderBaskets();
    } catch (err) {
        feedback.textContent = `✗ Erreur: ${err.message}`;
    }
});
```

**Test:**
- Soumettre form → POST /api/baskets reçu
- Paniers persiste en DB
- Page rechargée → panier toujours visible
- Stats automatiquement mises à jour

---

#### Tâche 3.4 – Connecter actions modifier/supprimer (45 min)

**Fichier:** `frontend/js/partner.js`  
**Changement:** Ajouter gestionnaires pour boutons "Modifier" et "Supprimer"

```javascript
// Sur chaque carte, remplacer:
// <button class="mini-btn" type="button">Modifier</button>
// Par:
// <button class="mini-btn" data-action="edit" data-id="${basket.id}">Modifier</button>

// Gestionnaire délégué:
basketList.addEventListener('click', async (e) => {
    if (e.target.dataset.action === 'edit') {
        // Pré-remplir form + afficher section edit
    }
    if (e.target.dataset.action === 'delete') {
        if (!confirm('Supprimer définitivement?')) return;
        const id = e.target.dataset.id;
        const res = await fetch(`/api/baskets/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
        });
        if (res.ok) {
            partnersBaskets = partnersBaskets.filter(b => b.id !== parseInt(id));
            renderBaskets();
        }
    }
});
```

**Test:**
- Cliquer Supprimer → confirmation
- Requête DELETE → 204 No Content
- Panier disparu de la liste + DB

---

#### 🎯 Checklist validation Phase 3

- [ ] Pas connecté → login obligatoire
- [ ] Login partner/admin/consumer → redirection correcte
- [ ] Dashboard chargé → paniers du partner présents
- [ ] Créer panier → POST /api/baskets envoyé
- [ ] Panier créé → affichage immédiat + persistance DB
- [ ] Modifier panier → PUT /api/baskets/:id
- [ ] Supprimer panier → DELETE /api/baskets/:id
- [ ] Stats recalculées en temps réel sur vrais paniers
- [ ] Refresh page → toutes les données persistent

**Durée estimée:** 4h  
**À la fin:** 75% du projet

---

### 🎯 PHASE 4: Dashboard admin connecté (Jour 7) – Cible: 85%

**Objectif:** Valider partenaires, consulter stats reelles, gérer contenu.

#### Tâche 4.1 – Refondre admin/dashboard.html (45 min)

**Fichier:** `frontend/admin/dashboard.html` (refonte complète)

```html
<!-- Structure simplifiée et fonctionnelle:

<header>Nav Admin</header>

<main>
    <section id="pending-partners">
        <h2>Partenaires en attente</h2>
        <div id="pending-list"><!-- rempli par admin.js --></div>
    </section>
    
    <section id="stats">
        <h2>Statistiques</h2>
        <div id="stats-container"><!-- rempli par admin.js --></div>
    </section>
</main>
```

**Test:** Structure DOM cohérente avec admin.js ✓

---

#### Tâche 4.2 – Aligner admin.js sur endpoints réels (1h)

**Fichier:** `frontend/js/admin.js` (refonte complète)

```javascript
// Remplacer appels à /api/admin/users par /api/admin/partners/pending
// Remplacer appels à /api/admin/analytics par /api/admin/stats

async function loadPendingPartners() {
    const res = await fetch('/api/admin/partners/pending', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
    });
    const partners = await res.json();
    renderPendingPartners(partners);
}

async function loadStats() {
    const res = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
    });
    const stats = await res.json();
    // stats = { total_clients, total_partenaires, partenaires_valides, ... }
    renderStats(stats);
}

// Bouton valider:
async function validatePartner(partnerId) {
    const res = await fetch(`/api/admin/partners/${partnerId}/validate`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
    });
    if (res.ok) {
        loadPendingPartners(); // Refresh
        loadStats();
    }
}
```

**Test:**
- GET /api/admin/partners/pending → liste correcte
- GET /api/admin/stats → stats correctes
- PUT /api/admin/partners/:id/validate → 200 OK
- Liste refresh automatiquement
- Stats updated

---

#### 🎯 Checklist validation Phase 4

- [ ] Admin login → dashboard admin visible
- [ ] Consumer login → accès refusé au dashboard admin
- [ ] Partenaires en attente affichés correctement
- [ ] Bouton "Valider" change statut en DB
- [ ] Stats actualisent après validation
- [ ] Liste en attente se vide après validation

**Durée estimée:** 2h30  
**À la fin:** 85% du projet

---

### 🎯 PHASE 5: Cartographie + Robustesse (Jour 8) – Cible: 100%

**Objectif:** Intégration map, gestion erreurs, logs, déploiement prêt.

#### Tâche 5.1 – Intégrer cartographie (1h30)

**Fichier:** `frontend/js/map.js` (refonte)

```javascript
// Utiliser Leaflet (CDN) au lieu de Google Maps (pas de clé)
// Afficher marqueurs pour chaque partenaire validé
// Cliquer marqueur → filtrer paniers du partenaire

const map = L.map('map').setView([45.764, 4.835], 12); // Lyon par défaut
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

fetch('/api/partners')
    .then(r => r.json())
    .then(partners => {
        partners.forEach(p => {
            L.marker([p.latitude, p.longitude])
                .bindPopup(`<b>${p.nom}</b><br>${p.adresse}`)
                .addTo(map);
        });
    });
```

**Test:** Carte visible, marqueurs présents, popups fonctionnent ✓

---

#### Tâche 5.2 – Gestion d'erreurs gracieuse (1h)

**Fichier:** `frontend/js/api.js`  
**Ajout:** Wrapper de gestion erreurs

```javascript
// Intercepter erreurs réseau
// Afficher message user-friendly
// Logger en console pour debug
// Retry automatique sur timeout
```

**Test:**
- Offline → "Connexion perdue, vérifiez votre internet"
- 500 backend → "Erreur serveur, réessayez plus tard"
- 403 → "Accès refusé"

---

#### Tâche 5.3 – Validation et documentation (1h)

- Ajouter .env.example avec PORT, JWT_SECRET, DB_PATH
- Documenter endpoints API dans README
- Ajouter comments code sur chaque fonction importante
- Vérifier tous les IDs HTML/JS cohérents

**Test:** npm start → tout fonctionne sans configuration supplémentaire ✓

---

#### 🎯 Checklist validation Phase 5

- [ ] Carte visible sur index.html (si section #map présente)
- [ ] Marqueurs positionnés correctement
- [ ] Cliquer marqueur → popover affiche info partenaire
- [ ] Erreurs réseau gérées gracieusement
- [ ] Console propre (pas d'erreurs non gérées)
- [ ] README documenté
- [ ] .env.example présent

**Durée estimée:** 3h30  
**À la fin:** 100% du projet ✓

---

## 5. Ordre d'exécution strict (pour éviter les dépendances circulaires)

```
JOUR 1 (Phase 1.1-1.5)
├─ 1.1: DB fichier ✓
├─ 1.2: Routes protégées ✓
├─ 1.3: Owner check panier ✓
├─ 1.4: Seed script ✓
└─ 1.5: Auth JSON ✓
   VALIDATION: npm start → npm run seed → vérifier 401 sur POST

JOUR 2 (Phase 2.1-2.4)
├─ 2.1: api.js (ApiClient) ✓
├─ 2.2: index.js (vitrine dynamique) ✓
├─ 2.3: Filtres ✓
└─ 2.4: Remplacer HTML statique ✓
   VALIDATION: page d'accueil affiche paniers réels

JOUR 3-4 (Phase 3.1-3.4)
├─ 3.1: Login partenaire + auth-client.js ✓
├─ 3.2: Charger paniers partenaire ✓
├─ 3.3: POST /api/baskets depuis form ✓
└─ 3.4: PUT/DELETE depuis actions ✓
   VALIDATION: partner crée/modifie/supprime, persistence OK

JOUR 5 (Phase 4.1-4.2)
├─ 4.1: Refondre admin/dashboard.html ✓
└─ 4.2: Aligner admin.js sur endpoints ✓
   VALIDATION: admin valide partenaires, stats live

JOUR 6 (Phase 5.1-5.3)
├─ 5.1: Cartographie Leaflet ✓
├─ 5.2: Gestion erreurs ✓
└─ 5.3: Documentation ✓
   VALIDATION: système complet + documenté ✓✓✓
```

---

## 6. Guide de débogage et troubleshooting

### Erreur: "401 Unauthorized" sur POST /api/baskets
**Cause:** Token manquant ou invalide dans header  
**Solution:**
```javascript
// ✓ Correct:
fetch('/api/baskets', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    },
    body: JSON.stringify(data)
});
```

### Erreur: "UNIQUE constraint failed" sur login
**Cause:** Email en doublon en DB  
**Solution:** Vérifier backend/scripts/seed.js, modifier emails

### Erreur: "Cannot find module 'better-sqlite3'"
**Cause:** Node.js < 22 utilise la mauvaise API SQLite  
**Solution:** Mettez à jour Node.js ou changez `require('node:sqlite')` en `require('better-sqlite3')`

### Panier créé mais n'apparaît pas côté partenaire
**Cause:** Filtre `commercant_id` ne correspond pas  
**Solution:** Vérifier dans la DB: `SELECT * FROM paniers_surprises` et vérifier les IDs

### Frontend appelle localhost:3000, la requête fail (CORS)
**Cause:** Front sur port 8000, back sur 3000  
**Solution:** Modifier api.js pour utiliser baseURL correcte ou servir front depuis backend

---

## 7. Commandes utiles

```bash
# Lancer backend + seed
npm start

# Seed initial
npm run seed

# Lancer en dev avec nodemon
npm run dev

# Tester endpoint
curl -X GET http://localhost:3000/api/baskets

# Tester login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"partner@zerogaspi.fr","mot_de_passe":"partner123"}'

# Inspecter DB SQLite
sqlite3 zerogaspi.db ".schema"
sqlite3 zerogaspi.db "SELECT * FROM commercants;"

# Lancer serveur HTTP simple pour frontend (dev)
# Python 3:
python -m http.server 8000 --directory frontend

# Node:
npx http-server frontend -p 8000
```

---

## 8. Fichiers à créer/modifier – Checklist par phase

### Phase 1 ✏️
```
Modifier:
├─ backend/server.js                 (DB ':memory:' → fichier)
├─ backend/routes/baskets.js         (ajouter authMiddleware)
├─ backend/controllers/basketController.js (owner check)
└─ frontend/js/auth.js               (JSON + localStorage)

Créer:
├─ backend/scripts/seed.js           (données démo)
└─ .env.example                      (template env vars)

Vérifier:
├─ npm install (dépendances présentes)
├─ backend/config/database.js existe déjà
└─ backend/middleware/auth.js existe déjà
```

### Phase 2 ✏️
```
Créer:
├─ frontend/js/api.js               (ApiClient centralisé)
└─ frontend/js/index.js              (logique vitrine)

Modifier:
├─ frontend/index.html              (section cards-grid vide)
└─ frontend/style.css               (aucun changement)

Supprimer:
└─ Les 6 cartes hardcodées de index.html
```

### Phase 3 ✏️
```
Créer:
├─ frontend/auth/login.html          (form connexion)
├─ frontend/auth/register.html       (form inscription)
└─ frontend/js/auth-client.js        (utils authentification)

Modifier:
├─ frontend/js/partner.js            (refonte complète → API)
├─ frontend/partner/dashboard.html   (ajouter script defer)
└─ frontend/js/api.js               (ajouter méthodes partners/baskets)
```

### Phase 4 ✏️
```
Modifier:
├─ frontend/admin/dashboard.html    (refondre structure)
└─ frontend/js/admin.js             (aligner endpoints réels)

Créer:
└─ frontend/auth/admin-check.js     (guard admin)
```

### Phase 5 ✏️
```
Modifier:
├─ frontend/js/map.js               (Leaflet + endpoints)
├─ frontend/index.html              (ajouter #map)
└─ frontend/js/api.js               (gestion erreurs)

Ajouter:
├─ frontend/style.css               (styles map)
└─ README.md                         (documentation)
```

---

## 9. Signaux de progression réelle

À la fin de **chaque phase**, vous devez pouvoir:**

**Après Phase 1:**
- npm start → aucune perte de données au redémarrage ✓
- Serveur écoute sur http://localhost:3000 ✓
- POST /api/baskets sans token → 401 Unauthorized ✓
- Backend logs montrent la DB fichier utilisée ✓

**Après Phase 2:**
- Page d'accueil affiche paniers du backend ✓
- Ajouter un panier depuis admin → visible sur accueil après F5 ✓
- Filtres réduisent la liste en temps réel ✓
- État vide si aucun panier ✓

**Après Phase 3:**
- Partner se connecte → redirigé vers dashboard ✓
- Dashboard affiche ses paniers uniquement ✓
- Créer panier → POST réussit → panier persiste ✓
- Modifier panier → PUT réussit → données mises à jour ✓
- Supprimer panier → DELETE réussit → panier disparu ✓

**Après Phase 4:**
- Admin se connecte → dashboard admin visible ✓
- Partenaires en attente listés ✓
- Bouton Valider → PUT reçu → liste refresh ✓
- Stats affichent nombres réels ✓

**Après Phase 5:**
- Carte visible avec marqueurs ✓
- Erreur réseau → message user-friendly (pas erreur console) ✓
- README documenté et à jour ✓
- Aucune clé API hardcodée ✓

---

## 10. Ressources et références

### Documentation
- Express.js: https://expressjs.com/
- SQLite: https://www.sqlite.org/docs.html
- JWT: https://jwt.io/
- Fetch API: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
- Leaflet: https://leafletjs.com/

### Tools recommandés
- **Postman/Insomnia:** Tester endpoints API
- **SQLite Browser:** Consulter/éditer DB
- **Chrome DevTools:** Debug frontend
- **VS Code Rest Client:** Test requests inline (extension)

### Architecture finale (après Phase 5)
```
frontend/
├─ index.html (vitrine, dynamique)
├─ style.css (styles globaux)
├─ auth/
│  ├─ login.html
│  └─ register.html
├─ partner/
│  └─ dashboard.html (connecté)
├─ admin/
│  └─ dashboard.html (connecté)
└─ js/
   ├─ api.js (ApiClient centralisé)
   ├─ auth-client.js (gestion tokens)
   ├─ index.js (vitrine dynamique)
   ├─ partner.js (dashboard partenaire)
   ├─ admin.js (dashboard admin)
   └─ map.js (cartographie Leaflet)

backend/
├─ server.js (Express + SQLite disque)
├─ config/
│  └─ database.js (connexion DB)
├─ models/
│  └─ models.js (Commercant, Client, PanierSurprise)
├─ controllers/
│  ├─ authController.js (login/register)
│  ├─ basketController.js (CRUD paniers)
│  ├─ partnerController.js (profil partenaires)
│  └─ adminController.js (stats, validation)
├─ routes/
│  ├─ auth.js (POST register, POST login)
│  ├─ baskets.js (CRUD protégé)
│  ├─ partners.js (GET, PUT protégé)
│  └─ admin.js (tous endpoints protégés admin)
├─ middleware/
│  └─ auth.js (JWT + requireRole)
└─ scripts/
   └─ seed.js (données démo)

zerogaspi.db (SQLite, créé au démarrage)
.env (variables environnement)
.env.example (template)
package.json (dépendances)
README.md (documentation)
```

---

## 11. Estimation de temps total

| Phase | Durée | % Progression |
|-------|-------|--------------|
| Phase 1: Base technique | 3h | 40% → 45% |
| Phase 2: Frontend public | 3h | 45% → 60% |
| Phase 3: Dashboard partner | 4h | 60% → 75% |
| Phase 4: Dashboard admin | 2h30 | 75% → 85% |
| Phase 5: Map + robustesse | 3h30 | 85% → 100% |
| **TOTAL** | **16h** | **100%** |

**Avec tests + documentation:** +4h → 20h total

---

## 12. Recommandations finales

1. **Validez Phase 1 avant de continuer** → Sans persistance, Phase 2 sera frustrante
2. **Testez manuellement chaque endpoint** avec Postman/curl avant d'intégrer frontend
3. **Gardez la console navigateur ouverte** (F12) pendant le dev frontend
4. **Committez après chaque phase** avec message clair (`Feat: Phase 1 complete - persistent DB`)
5. **Documentez tout blocage rencontré** dans `/memories/repo/` pour futures références
6. **Une fois Phase 3 terminée, vous avez un MVP exploitable** (les phases 4-5 sont réfinement)

---

**Bonne chance! 🚀**

Pour commencer immédiatement: `npm run seed` puis `npm start` puis attaquez la Tâche 1.1 dans le code.
