/**
 * models.js — Couche d'accès aux données (SQLite / better-sqlite3)
 *
 * Ce module expose trois classes qui encapsulent toutes les opérations
 * CRUD sur les trois entités métier de ZéroGaspi :
 *   - Commercant  : les commerçants partenaires (restaurants, boulangeries…)
 *   - Client      : les consommateurs inscrits sur la plateforme
 *   - PanierSurprise : les paniers d'invendus publiés par les commerçants
 *
 * Utilisation :
 *   const connectDB = require('../config/database');
 *   const db = connectDB();
 *   const { Commercant, Client, PanierSurprise } = require('./models')(db);
 */

/**
 * @param {import('better-sqlite3').Database} db  Instance SQLite partagée
 */
module.exports = function createModels(db) {

    /* ================================================================
     *  COMMERCANT
     *  Représente un professionnel de l'alimentation partenaire.
     *  Un commerçant doit être validé par un administrateur avant
     *  de pouvoir publier des paniers.
     * ================================================================ */
    class Commercant {
        /**
         * Crée un nouveau commerçant en base.
         * @param {{ nom: string, email: string, mot_de_passe: string,
         *           adresse: string, telephone?: string,
         *           categorie?: string, latitude?: number, longitude?: number }} data
         * @returns {{ id: number }} L'identifiant généré
         */
        static creer(data) {
            const stmt = db.prepare(`
                INSERT INTO commercants (nom, email, mot_de_passe, adresse, telephone, categorie, latitude, longitude)
                VALUES (@nom, @email, @mot_de_passe, @adresse, @telephone, @categorie, @latitude, @longitude)
            `);
            const result = stmt.run({
                telephone: null,
                categorie: 'autre',
                latitude:  null,
                longitude: null,
                ...data
            });
            return { id: result.lastInsertRowid };
        }

        /**
         * Récupère un commerçant par son identifiant.
         * @param {number} id
         * @returns {object|undefined}
         */
        static trouverParId(id) {
            return db.prepare('SELECT * FROM commercants WHERE id = ?').get(id);
        }

        /**
         * Récupère un commerçant par son adresse e-mail (pour la connexion).
         * @param {string} email
         * @returns {object|undefined}
         */
        static trouverParEmail(email) {
            return db.prepare('SELECT * FROM commercants WHERE email = ?').get(email);
        }

        /**
         * Retourne tous les commerçants validés (visibles sur la carte).
         * @returns {object[]}
         */
        static listerValides() {
            return db.prepare('SELECT * FROM commercants WHERE est_valide = 1').all();
        }

        /**
         * Retourne les commerçants en attente de validation (usage admin).
         * @returns {object[]}
         */
        static listerEnAttente() {
            return db.prepare('SELECT * FROM commercants WHERE est_valide = 0').all();
        }

        /**
         * Valide un commerçant (action réservée à l'administrateur).
         * @param {number} id
         */
        static valider(id) {
            db.prepare('UPDATE commercants SET est_valide = 1 WHERE id = ?').run(id);
        }

        /**
         * Met à jour le profil d'un commerçant.
         * @param {number} id
         * @param {{ nom?: string, adresse?: string, telephone?: string,
         *           categorie?: string, latitude?: number, longitude?: number }} data
         */
        static mettreAJour(id, data) {
            const champs = Object.keys(data).map(k => `${k} = @${k}`).join(', ');
            db.prepare(`UPDATE commercants SET ${champs} WHERE id = @id`).run({ ...data, id });
        }
    }


    /* ================================================================
     *  CLIENT
     *  Représente un consommateur inscrit sur la plateforme.
     *  Les clients peuvent consulter les paniers et en réserver.
     * ================================================================ */
    class Client {
        /**
         * Crée un nouveau compte client.
         * @param {{ nom: string, email: string, mot_de_passe: string, telephone?: string }} data
         * @returns {{ id: number }}
         */
        static creer(data) {
            const stmt = db.prepare(`
                INSERT INTO clients (nom, email, mot_de_passe, telephone)
                VALUES (@nom, @email, @mot_de_passe, @telephone)
            `);
            const result = stmt.run({ telephone: null, ...data });
            return { id: result.lastInsertRowid };
        }

        /**
         * Récupère un client par son identifiant.
         * @param {number} id
         * @returns {object|undefined}
         */
        static trouverParId(id) {
            return db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
        }

        /**
         * Récupère un client par son adresse e-mail (pour la connexion).
         * @param {string} email
         * @returns {object|undefined}
         */
        static trouverParEmail(email) {
            return db.prepare('SELECT * FROM clients WHERE email = ?').get(email);
        }

        /**
         * Met à jour le profil d'un client.
         * @param {number} id
         * @param {{ nom?: string, telephone?: string }} data
         */
        static mettreAJour(id, data) {
            const champs = Object.keys(data).map(k => `${k} = @${k}`).join(', ');
            db.prepare(`UPDATE clients SET ${champs} WHERE id = @id`).run({ ...data, id });
        }
    }


    /* ================================================================
     *  PANIER SURPRISE
     *  Représente un panier d'invendus publié par un commerçant.
     *  Chaque panier a un prix d'origine, un prix réduit et une
     *  quantité disponible. Quand la quantité tombe à 0, le panier
     *  est automatiquement désactivé.
     * ================================================================ */
    class PanierSurprise {
        /**
         * Publie un nouveau panier surprise.
         * @param {{
         *   commercant_id : number,
         *   nom           : string,   // Ex : "Panier boulangerie du soir"
         *   prix_origine  : number,   // Prix de vente normal (€)
         *   prix_reduit   : number,   // Prix anti-gaspillage (€), doit être < prix_origine
         *   quantite      : number,   // Nombre de paniers disponibles
         *   description?  : string,
         *   heure_collecte?: string   // Ex : "18h30 - 19h30"
         * }} data
         * @returns {{ id: number }}
         */
        static creer(data) {
            const stmt = db.prepare(`
                INSERT INTO paniers_surprises
                    (commercant_id, nom, prix_origine, prix_reduit, quantite, description, heure_collecte)
                VALUES
                    (@commercant_id, @nom, @prix_origine, @prix_reduit, @quantite, @description, @heure_collecte)
            `);
            const result = stmt.run({
                description:   null,
                heure_collecte: null,
                ...data
            });
            return { id: result.lastInsertRowid };
        }

        /**
         * Récupère un panier par son identifiant.
         * @param {number} id
         * @returns {object|undefined}
         */
        static trouverParId(id) {
            return db.prepare('SELECT * FROM paniers_surprises WHERE id = ?').get(id);
        }

        /**
         * Liste tous les paniers actifs avec quantité > 0 (affichage carte).
         * @returns {object[]}
         */
        static listerActifs() {
            return db.prepare(`
                SELECT p.*, c.nom AS commercant_nom, c.adresse, c.latitude, c.longitude, c.categorie
                FROM paniers_surprises p
                JOIN commercants c ON c.id = p.commercant_id
                WHERE p.est_actif = 1 AND p.quantite > 0 AND c.est_valide = 1
                ORDER BY p.cree_le DESC
            `).all();
        }

        /**
         * Liste tous les paniers d'un commerçant donné (tableau de bord partenaire).
         * @param {number} commercantId
         * @returns {object[]}
         */
        static listerParCommercant(commercantId) {
            return db.prepare(
                'SELECT * FROM paniers_surprises WHERE commercant_id = ? ORDER BY cree_le DESC'
            ).all(commercantId);
        }

        /**
         * Met à jour un panier (nom, prix, quantité…).
         * @param {number} id
         * @param {{ nom?: string, prix_origine?: number, prix_reduit?: number,
         *           quantite?: number, description?: string,
         *           heure_collecte?: string, est_actif?: number }} data
         */
        static mettreAJour(id, data) {
            const champs = Object.keys(data).map(k => `${k} = @${k}`).join(', ');
            db.prepare(`UPDATE paniers_surprises SET ${champs} WHERE id = @id`).run({ ...data, id });
        }

        /**
         * Décrémente la quantité disponible d'une unité lors d'une réservation.
         * Désactive automatiquement le panier si la quantité atteint 0.
         * @param {number} id
         */
        static decrementerQuantite(id) {
            db.prepare(`
                UPDATE paniers_surprises
                SET
                    quantite  = MAX(0, quantite - 1),
                    est_actif = CASE WHEN quantite - 1 <= 0 THEN 0 ELSE est_actif END
                WHERE id = ?
            `).run(id);
        }

        /**
         * Supprime définitivement un panier.
         * @param {number} id
         */
        static supprimer(id) {
            db.prepare('DELETE FROM paniers_surprises WHERE id = ?').run(id);
        }
    }


    return { Commercant, Client, PanierSurprise };
};