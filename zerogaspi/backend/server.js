require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const path       = require('path');
// node:sqlite est intégré à Node.js v22.5+ — aucune dépendance npm requise.
const { DatabaseSync } = require('node:sqlite');
const createModels = require('./models/models');

function initializeDatabase(db) {
    db.exec(`
        CREATE TABLE IF NOT EXISTS commercants (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            nom          TEXT    NOT NULL,
            email        TEXT    NOT NULL UNIQUE,
            mot_de_passe TEXT    NOT NULL,
            adresse      TEXT    NOT NULL,
            telephone    TEXT,
            categorie    TEXT    NOT NULL DEFAULT 'autre',
            latitude     REAL,
            longitude    REAL,
            est_valide   INTEGER NOT NULL DEFAULT 0,
            cree_le      TEXT    NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS clients (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            nom          TEXT    NOT NULL,
            email        TEXT    NOT NULL UNIQUE,
            mot_de_passe TEXT    NOT NULL,
            telephone    TEXT,
            role         TEXT    NOT NULL DEFAULT 'consumer',
            cree_le      TEXT    NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS paniers_surprises (
            id             INTEGER PRIMARY KEY AUTOINCREMENT,
            commercant_id  INTEGER NOT NULL REFERENCES commercants(id) ON DELETE CASCADE,
            nom            TEXT    NOT NULL,
            prix_origine   REAL    NOT NULL CHECK(prix_origine   > 0),
            prix_reduit    REAL    NOT NULL CHECK(prix_reduit    > 0 AND prix_reduit < prix_origine),
            quantite       INTEGER NOT NULL DEFAULT 1 CHECK(quantite >= 0),
            description    TEXT,
            est_actif      INTEGER NOT NULL DEFAULT 1,
            heure_collecte TEXT,
            cree_le        TEXT    NOT NULL DEFAULT (datetime('now'))
        );
    `);
}

// ─── Remplissage de la base de données avec des données de démonstration ─────
function seedDatabase(models) {
    const { Commercant, PanierSurprise } = models;

    // Ajouter des commerçants de test
    const commercants = [
        {
            nom: 'La Ferme Urbaine',
            email: 'ferme@zerogaspi.fr',
            mot_de_passe: '$2a$10$Zq8W.4Z7E9X5Kq3F2G8H7Y3A1Q0W9E8R7T4Y3U2I1O5P8L6K9M2N5',
            adresse: '12 rue de la Paix, 75001 Paris',
            telephone: '01 23 45 67 89',
            categorie: 'Fruits & Légumes',
            latitude: 48.8566,
            longitude: 2.3522
        },
        {
            nom: 'Boulangerie du Soleil',
            email: 'contact@boulangerie-soleil.fr',
            mot_de_passe: '$2a$10$Zq8W.4Z7E9X5Kq3F2G8H7Y3A1Q0W9E8R7T4Y3U2I1O5P8L6K9M2N5',
            adresse: '45 avenue Montaigne, 75008 Paris',
            telephone: '01 98 76 54 32',
            categorie: 'Boulangerie',
            latitude: 48.8699,
            longitude: 2.3081
        },
        {
            nom: 'Restaurant Le Traiteur',
            email: 'traiteur@restaurant.fr',
            mot_de_passe: '$2a$10$Zq8W.4Z7E9X5Kq3F2G8H7Y3A1Q0W9E8R7T4Y3U2I1O5P8L6K9M2N5',
            adresse: '78 rue de Rivoli, 75004 Paris',
            telephone: '01 55 66 77 88',
            categorie: 'Restauration',
            latitude: 48.8613,
            longitude: 2.3468
        }
    ];

    // Créer les commerçants
    let comerciantIds = [];
    commercants.forEach((data) => {
        const result = Commercant.creer(data);
        comerciantIds.push(result.id);
    });
    
    // Valider les commerçants
    comerciantIds.forEach(id => Commercant.valider(id));

    // Ajouter des paniers surprises pour chaque commerçant
    const paniers = [
        // Paniers de La Ferme Urbaine
        {
            commercant_id: comerciantIds[0],
            nom: 'Panier Maraîcher Bio',
            prix_origine: 18.00,
            prix_reduit: 7.99,
            quantite: 5,
            description: 'Assortiment de légumes frais bio du jour : carottes, courgettes, tomates.',
            heure_collecte: '18h30 - 19h30'
        },
        {
            commercant_id: comerciantIds[0],
            nom: 'Panier Fruits à Croquer',
            prix_origine: 15.50,
            prix_reduit: 6.50,
            quantite: 8,
            description: 'Fruits de saison à maturité idéale : pommes, poires, fraises.',
            heure_collecte: '17h00 - 18h00'
        },
        // Paniers de Boulangerie du Soleil
        {
            commercant_id: comerciantIds[1],
            nom: 'Panier Viennoiseries du Soir',
            prix_origine: 14.99,
            prix_reduit: 4.99,
            quantite: 6,
            description: 'Assortiment de pains spéciaux, croissants et brioches encore du jour.',
            heure_collecte: '17h30 - 18h30'
        },
        {
            commercant_id: comerciantIds[1],
            nom: 'Panier Pain Complet',
            prix_origine: 12.50,
            prix_reduit: 3.50,
            quantite: 10,
            description: 'Sélection de pains complets, seigle et tradition.',
            heure_collecte: '18h00 - 19h00'
        },
        // Paniers de Restaurant Le Traiteur
        {
            commercant_id: comerciantIds[2],
            nom: 'Panier Traiteur Express',
            prix_origine: 22.99,
            prix_reduit: 7.99,
            quantite: 4,
            description: 'Sélection de plats cuisinés et accompagnements à récupérer avant fermeture.',
            heure_collecte: '18h15 - 19h15'
        },
        {
            commercant_id: comerciantIds[2],
            nom: 'Sélection Épicerie Premium',
            prix_origine: 19.99,
            prix_reduit: 9.99,
            quantite: 3,
            description: 'Produits secs, sauces et douceurs proches de la date courte.',
            heure_collecte: 'Demain 12h00 - 13h00'
        }
    ];

    paniers.forEach((data) => {
        PanierSurprise.creer(data);
    });

    console.log(`✅ Base de données remplie : ${comerciantIds.length} commerçants et ${paniers.length} paniers`);
}

function createApp(options = {}) {
    const {
        dbPath = process.env.DB_PATH || ':memory:',
        seedDemoData = false,
    } = options;

    const db = new DatabaseSync(dbPath);
    initializeDatabase(db);

    const app = express();
    const models = createModels(db);

    // Partage de l'instance db ET des modèles dans toute l'application
    app.locals.db = db;
    app.locals.models = models;

    // ─── Middlewares globaux ─────────────────────────────────────────────────
    app.use(cors());
    app.use(express.json());

    // ─── Servir les fichiers statiques du frontend ───────────────────────────
    app.use(express.static(path.join(__dirname, '../frontend')));

    // ─── Routes ─────────────────────────────────────────────────────────────
    app.use('/api/auth', require('./routes/auth'));
    app.use('/api/baskets', require('./routes/baskets'));
    app.use('/api/partners', require('./routes/partners'));
    app.use('/api/admin', require('./routes/admin'));

    // ─── Route de santé (health check) ──────────────────────────────────────
    app.get('/api/health', (_req, res) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // ─── Gestion centralisée des erreurs ────────────────────────────────────
    app.use((err, _req, res, _next) => {
        console.error('[Erreur]', err.message);
        const status = err.status || 500;
        res.status(status).json({ error: err.message || 'Erreur interne du serveur' });
    });

    if (seedDemoData) {
        seedDatabase(models);
    }

    return { app, db, models };
}

function startServer(options = {}) {
    const PORT = options.port || process.env.PORT || 3000;
    const { app } = createApp({
        dbPath: options.dbPath,
        seedDemoData: options.seedDemoData !== false,
    });

    return app.listen(PORT, () => {
        console.log(`✅ Serveur ZéroGaspi démarré → http://localhost:${PORT}`);
        console.log(`   Base de données : SQLite ${options.dbPath || process.env.DB_PATH || 'en mémoire'}`);
        console.log(`   API Documentation:`);
        console.log(`     - Paniers : GET http://localhost:${PORT}/api/baskets`);
        console.log(`     - Commerçants : GET http://localhost:${PORT}/api/partners`);
        console.log(`     - Santé : GET http://localhost:${PORT}/api/health`);
    });
}

if (require.main === module) {
    startServer();
}

module.exports = { createApp, startServer, initializeDatabase, seedDatabase };