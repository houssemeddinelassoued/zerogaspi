/**
 * partnerController.js — Gestion des commerçants partenaires
 *
 * GET  /api/partners       → lister les partenaires validés
 * GET  /api/partners/:id   → profil d'un partenaire
 * PUT  /api/partners/:id   → mettre à jour le profil (partenaire authentifié)
 */

// ─── GET /api/partners ─────────────────────────────────────────────────────
exports.getAllPartners = (req, res) => {
    try {
        const { Commercant } = req.app.locals.models;
        res.json(Commercant.listerValides());
    } catch {
        res.status(500).json({ error: 'Impossible de récupérer les partenaires.' });
    }
};

// ─── GET /api/partners/:id ────────────────────────────────────────────────
exports.getPartnerById = (req, res) => {
    try {
        const { Commercant } = req.app.locals.models;
        const partner = Commercant.trouverParId(Number(req.params.id));
        if (!partner) return res.status(404).json({ error: 'Partenaire introuvable.' });
        // Ne pas exposer le mot de passe
        const { mot_de_passe: _, ...safe } = partner;
        res.json(safe);
    } catch {

        res.status(500).json({ error: 'Impossible de récupérer ce partenaire pour le moment. Veuillez réessayer plus tard.' });
    }
};

// ─── PUT /api/partners/:id ────────────────────────────────────────────────
exports.updatePartner = (req, result) => {
    try {
        const { Commercant } = req.app.locals.models;
        const identifiant = Number(req.params.id);

        if (!Commercant.trouverParId(identifiant)) {
            return result.status(404).json({ error: 'Partenaire introuvable.' });
        }

        const champsAutorisés = ['nom', 'adresse', 'telephone', 'categorie', 'latitude', 'longitude'];
        const data = Object.fromEntries(
            Object.entries(req.body).filter(([k]) => champsAutorisés.includes(k))
        );

        if (Object.keys(data).length === 0) {
            return result.status(400).json({ error: 'Aucun champ modifiable fourni.' });
        }

        Commercant.mettreAJour(identifiant, data);
        const { mot_de_passe: _, ...safe } = Commercant.trouverParId(identifiant);
        result.json(safe);
    } catch {
        result.status(500).json({ error: 'Impossible de mettre à jour ce partenaire pour le moment. Veuillez réessayer plus tard.' });
    }
};


