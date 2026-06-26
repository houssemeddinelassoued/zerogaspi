/**
 * basketController.js — Gestion des paniers surprises
 *
 * Endpoints couverts :
 *   GET  /api/baskets       → lister tous les paniers actifs
 *   GET  /api/baskets/:id   → détail d'un panier
 *   POST /api/baskets       → créer un panier (partenaire authentifié)
 *   PUT  /api/baskets/:id   → modifier un panier (partenaire authentifié)
 *   DELETE /api/baskets/:id → supprimer un panier (partenaire authentifié)
 */

// ─── GET /api/baskets ──────────────────────────────────────────────────────
// Retourne tous les paniers actifs (quantité > 0) avec les infos du commerçant.
exports.getAllBaskets = (req, res) => {
    try {
        const { PanierSurprise } = req.app.locals.models;
        const paniers = PanierSurprise.listerActifs();
        res.json(paniers);
    } catch (err) {
        res.status(500).json({ error: 'Impossible de récupérer les paniers.' });
    }
};

// ─── GET /api/baskets/:id ──────────────────────────────────────────────────
// Retourne le détail d'un panier par son identifiant.
exports.getBasketById = (req, res) => {
    try {
        const { PanierSurprise } = req.app.locals.models;
        const panier = PanierSurprise.trouverParId(Number(req.params.id));
        if (!panier) {
            return res.status(404).json({ error: 'Panier introuvable.' });
        }
        res.json(panier);
    } catch (err) {
        res.status(500).json({ error: 'Erreur lors de la récupération du panier.' });
    }
};

// ─── POST /api/baskets ─────────────────────────────────────────────────────
// Crée un nouveau panier surprise.
// Corps attendu : { commercant_id, nom, prix_origine, prix_reduit, quantite,
//                   description?, heure_collecte? }
exports.createBasket = (req, res) => {
    try {
        const { PanierSurprise } = req.app.locals.models;
        const { commercant_id, nom, prix_origine, prix_reduit, quantite } = req.body;

        // Validation des champs obligatoires
        if (!commercant_id || !nom || prix_origine == null || prix_reduit == null || quantite == null) {
            return res.status(400).json({
                error: 'Champs obligatoires manquants.',
                requis: ['commercant_id', 'nom', 'prix_origine', 'prix_reduit', 'quantite']
            });
        }

        if (prix_reduit >= prix_origine) {
            return res.status(400).json({
                error: 'Le prix réduit doit être strictement inférieur au prix d\'origine.'
            });
        }

        if (quantite < 1) {
            return res.status(400).json({ error: 'La quantité doit être d\'au moins 1.' });
        }

        const { id } = PanierSurprise.creer({
            commercant_id,
            nom:            req.body.nom,
            prix_origine:   Number(prix_origine),
            prix_reduit:    Number(prix_reduit),
            quantite:       Number(quantite),
            description:    req.body.description    || null,
            heure_collecte: req.body.heure_collecte || null,
        });

        const nouveauPanier = PanierSurprise.trouverParId(id);
        res.status(201).json(nouveauPanier);
    } catch (err) {
        // Violation de contrainte SQLite (ex : prix_reduit >= prix_origine)
        if (err.message && err.message.includes('CHECK constraint')) {
            return res.status(400).json({ error: 'Données invalides : contrainte métier non respectée.' });
        }
        res.status(500).json({ error: 'Erreur lors de la création du panier.' });
    }
};

// ─── PUT /api/baskets/:id ──────────────────────────────────────────────────
// Modifie un panier existant.
exports.updateBasket = (req, res) => {
    try {
        const { PanierSurprise } = req.app.locals.models;
        const id = Number(req.params.id);

        if (!PanierSurprise.trouverParId(id)) {
            return res.status(404).json({ error: 'Panier introuvable.' });
        }

        // On n'accepte que les champs modifiables
        const champsAutorisés = ['nom', 'prix_origine', 'prix_reduit', 'quantite', 'description', 'heure_collecte', 'est_actif'];
        const data = Object.fromEntries(
            Object.entries(req.body).filter(([k]) => champsAutorisés.includes(k))
        );

        if (Object.keys(data).length === 0) {
            return res.status(400).json({ error: 'Aucun champ modifiable fourni.' });
        }

        PanierSurprise.mettreAJour(id, data);
        res.json(PanierSurprise.trouverParId(id));
    } catch (err) {
        res.status(500).json({ error: 'Erreur lors de la mise à jour du panier.' });
    }
};

// ─── DELETE /api/baskets/:id ───────────────────────────────────────────────
// Supprime définitivement un panier.
exports.deleteBasket = (req, res) => {
    try {
        const { PanierSurprise } = req.app.locals.models;
        const id = Number(req.params.id);

        if (!PanierSurprise.trouverParId(id)) {
            return res.status(404).json({ error: 'Panier introuvable.' });
        }

        PanierSurprise.supprimer(id);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: 'Erreur lors de la suppression du panier.' });
    }
};