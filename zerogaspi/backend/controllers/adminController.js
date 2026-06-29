/**
 * Role du fichier : Contrôleur pour les actions administratives
 * adminController.js — Back-office administrateur
 *
 * GET /api/admin/partners/pending     → partenaires en attente
 * PUT /api/admin/partners/:id/validate → valider un partenaire
 * GET /api/admin/stats                → statistiques globales
 */

// ─── GET /api/admin/partners/pending ──────────────────────────────────────────
exports.getPendingPartners = (req, res) => {
    try {
        const { Commercant } = req.app.locals.models;
        const pending = Commercant.listerEnAttente().map(({ mot_de_passe: _, ...safe }) => safe);
        res.json(pending);
    } catch {
        res.status(500).json({ error: 'Impossible de récupérer les partenaires en attente.' });
    }
};

// ─── PUT /api/admin/partners/:id/validate ───────────────────────────────────
exports.validatePartner = (req, res) => {
    try {
        const { Commercant } = req.app.locals.models;
        const id = Number(req.params.id);

        if (!Commercant.trouverParId(id)) {
            return res.status(404).json({ error: 'Partenaire introuvable.' });
        }

        Commercant.valider(id);
        res.json({ message: 'Partenaire validé avec succès.' });
    } catch {
        res.status(500).json({ error: 'Erreur lors de la validation.' });
    }
};

// ─── GET /api/admin/stats ─────────────────────────────────────────────────────
exports.getStats = (req, res) => {
    try {
        const db = req.app.locals.db;
        const stats = {
            total_clients:      db.prepare('SELECT COUNT(*) AS n FROM clients').get().n,
            total_partenaires:  db.prepare('SELECT COUNT(*) AS n FROM commercants').get().n,
            partenaires_valides: db.prepare('SELECT COUNT(*) AS n FROM commercants WHERE est_valide = 1').get().n,
            total_paniers:      db.prepare('SELECT COUNT(*) AS n FROM paniers_surprises').get().n,
            paniers_actifs:     db.prepare('SELECT COUNT(*) AS n FROM paniers_surprises WHERE est_actif = 1 AND quantite > 0').get().n,
        };
        res.json(stats);
    } catch {
        res.status(500).json({ error: 'Erreur lors de la récupération des statistiques.' });
    }
};