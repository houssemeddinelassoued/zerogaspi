/**
 * orderController.js — Gestion des commandes clients
 *
 * POST /api/orders     → créer une commande client
 * GET  /api/orders/my  → lister les commandes du client connecté
 * GET  /api/orders/:id → récupérer une commande par id
 */

exports.createOrder = (req, res) => {
    const { panier_id, quantite = 1 } = req.body;
    const clientId = req.user?.id;

    if (!panier_id) {
        return res.status(400).json({ error: 'Le champ panier_id est obligatoire.' });
    }

    const quantity = Number(quantite);
    if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ error: 'La quantité doit être un entier supérieur ou égal à 1.' });
    }

    try {
        const db = req.app.locals.db;
        const { PanierSurprise, Order } = req.app.locals.models;

        const basket = PanierSurprise.trouverParId(Number(panier_id));
        if (!basket || basket.est_actif !== 1) {
            return res.status(404).json({ error: 'Panier introuvable ou inactif.' });
        }

        if (basket.quantite < quantity) {
            return res.status(400).json({ error: 'Stock insuffisant pour ce panier.' });
        }

        const unitPrice = Number(basket.prix_reduit);
        const total = Number((unitPrice * quantity).toFixed(2));

        db.exec('BEGIN');

        const stockUpdate = db.prepare(`
            UPDATE paniers_surprises
            SET
                quantite = quantite - ?,
                est_actif = CASE WHEN quantite - ? <= 0 THEN 0 ELSE est_actif END
            WHERE id = ? AND quantite >= ? AND est_actif = 1
        `).run(quantity, quantity, Number(panier_id), quantity);

        if (stockUpdate.changes === 0) {
            db.exec('ROLLBACK');
            return res.status(400).json({ error: 'Stock insuffisant ou panier inactif.' });
        }

        const { id } = Order.creer({
            client_id: clientId,
            panier_id: Number(panier_id),
            quantite: quantity,
            prix_unitaire: unitPrice,
            montant_total: total,
        });

        db.exec('COMMIT');

        return res.status(201).json(Order.trouverParId(id));
    } catch (err) {
        try {
            req.app.locals.db.exec('ROLLBACK');
        } catch {
            // Pas de transaction active, rien à annuler
        }
        return res.status(500).json({ error: 'Erreur lors de la création de la commande.' });
    }
};

exports.getMyOrders = (req, res) => {
    try {
        const { Order } = req.app.locals.models;
        const orders = Order.listerParClient(req.user.id);
        return res.json(orders);
    } catch {
        return res.status(500).json({ error: 'Impossible de récupérer vos commandes.' });
    }
};

exports.getOrderById = (req, res) => {
    try {
        const { Order } = req.app.locals.models;
        const order = Order.trouverParId(Number(req.params.id));

        if (!order) {
            return res.status(404).json({ error: 'Commande introuvable.' });
        }

        if (req.user.role !== 'admin' && order.client_id !== req.user.id) {
            return res.status(403).json({ error: 'Accès refusé à cette commande.' });
        }

        return res.json(order);
    } catch {
        return res.status(500).json({ error: 'Impossible de récupérer cette commande.' });
    }
};
