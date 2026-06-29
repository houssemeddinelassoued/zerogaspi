// node:sqlite est intégré à Node.js v22.5+ — aucune dépendance npm requise.
const { DatabaseSync } = require('node:sqlite');
const path = require('path');

// Chemin vers le fichier de base de données SQLite
// Configurable via la variable d'environnement DB_PATH
const DB_PATH = process.env.DB_PATH
    ? path.resolve(process.env.DB_PATH)
    : path.join(__dirname, '..', '..', 'zerogaspi.db');

/**
 * Initialise la connexion SQLite et crée les tables si elles n'existent pas.
 * Retourne l'instance de la base de données prête à l'emploi.
 * @returns {Database.Database}
 */
function connectDB() {
    const db = new DatabaseSync(DB_PATH);

    // Création des tables au premier lancement
    db.exec(`
        CREATE TABLE IF NOT EXISTS commercants (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            nom         TEXT    NOT NULL,
            email       TEXT    NOT NULL UNIQUE,
            mot_de_passe TEXT   NOT NULL,
            adresse     TEXT    NOT NULL,
            telephone   TEXT,
            categorie   TEXT    NOT NULL DEFAULT 'autre',
            latitude    REAL,
            longitude   REAL,
            est_valide  INTEGER NOT NULL DEFAULT 0,
            cree_le     TEXT    NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS clients (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            nom         TEXT    NOT NULL,
            email       TEXT    NOT NULL UNIQUE,
            mot_de_passe TEXT   NOT NULL,
            telephone   TEXT,
            cree_le     TEXT    NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS paniers_surprises (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            commercant_id   INTEGER NOT NULL REFERENCES commercants(id) ON DELETE CASCADE,
            nom             TEXT    NOT NULL,
            prix_origine    REAL    NOT NULL CHECK(prix_origine > 0),
            prix_reduit     REAL    NOT NULL CHECK(prix_reduit > 0 AND prix_reduit < prix_origine),
            quantite        INTEGER NOT NULL DEFAULT 1 CHECK(quantite >= 0),
            description     TEXT,
            est_actif       INTEGER NOT NULL DEFAULT 1,
            heure_collecte  TEXT,
            cree_le         TEXT    NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS orders (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            client_id     INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
            panier_id     INTEGER NOT NULL REFERENCES paniers_surprises(id) ON DELETE RESTRICT,
            quantite      INTEGER NOT NULL DEFAULT 1 CHECK(quantite > 0),
            prix_unitaire REAL    NOT NULL CHECK(prix_unitaire >= 0),
            montant_total REAL    NOT NULL CHECK(montant_total >= 0),
            statut        TEXT    NOT NULL DEFAULT 'created' CHECK(statut IN ('created', 'cancelled')),
            cree_le       TEXT    NOT NULL DEFAULT (datetime('now'))
        );
    `);

    console.log(`Base de données SQLite connectée : ${DB_PATH}`);
    return db;
}

module.exports = connectDB;