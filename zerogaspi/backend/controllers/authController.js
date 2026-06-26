/**
 * authController.js — Inscription et connexion (Client ou Commerçant)
 *
 * POST /api/auth/register  → créer un compte
 * POST /api/auth/login     → obtenir un JWT
 */

const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');

// ─── POST /api/auth/register ────────────────────────────────────────────────
// Corps : { nom, email, mot_de_passe, role: 'consumer'|'partner', ...champs partenaire }
exports.register = async (req, res) => {
    const { nom, email, mot_de_passe, role = 'consumer' } = req.body;

    if (!nom || !email || !mot_de_passe) {
        return res.status(400).json({ error: 'nom, email et mot_de_passe sont obligatoires.' });
    }

    if (!['consumer', 'partner'].includes(role)) {
        return res.status(400).json({ error: 'Le rôle doit être \'consumer\' ou \'partner\'.' });
    }

    try {
        const { Client, Commercant } = req.app.locals.models;
        const hash = await bcrypt.hash(mot_de_passe, 12);

        if (role === 'partner') {
            const { adresse, categorie } = req.body;
            if (!adresse) return res.status(400).json({ error: 'L\'adresse est obligatoire pour un partenaire.' });

            const { id } = Commercant.creer({
                nom, email,
                mot_de_passe: hash,
                adresse,
                categorie: categorie || 'autre',
                telephone: req.body.telephone || null,
            });
            return res.status(201).json({ message: 'Compte partenaire créé. En attente de validation.', id });
        }

        const { id } = Client.creer({ nom, email, mot_de_passe: hash });
        res.status(201).json({ message: 'Compte client créé.', id });
    } catch (err) {
        if (err.message && err.message.includes('UNIQUE')) {
            return res.status(409).json({ error: 'Cet email est déjà utilisé.' });
        }
        res.status(500).json({ error: 'Erreur lors de l\'inscription.' });
    }
};

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
// Corps : { email, mot_de_passe }
// Cherche dans clients puis dans commercants.
exports.login = async (req, res) => {
    const { email, mot_de_passe } = req.body;

    if (!email || !mot_de_passe) {
        return res.status(400).json({ error: 'email et mot_de_passe sont obligatoires.' });
    }

    try {
        const { Client, Commercant } = req.app.locals.models;

        // Cherche d'abord dans les clients, puis dans les commerçants
        let user = Client.trouverParEmail(email);
        let role = 'consumer';

        if (!user) {
            user = Commercant.trouverParEmail(email);
            role = 'partner';
        }

        if (!user) {
            return res.status(401).json({ error: 'Identifiants invalides.' });
        }

        const mdpValide = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
        if (!mdpValide) {
            return res.status(401).json({ error: 'Identifiants invalides.' });
        }

        const token = jwt.sign(
            { id: user.id, role },
            process.env.JWT_SECRET || 'dev_secret',
            { expiresIn: '8h' }
        );

        res.json({
            token,
            user: { id: user.id, nom: user.nom, email: user.email, role }
        });
    } catch (err) {
        res.status(500).json({ error: 'Erreur lors de la connexion.' });
    }
};