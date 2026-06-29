const request = require('supertest');
const jwt = require('jsonwebtoken');
const { createTestApp } = require('./helpers/testApp');

describe('API routes', () => {
    let app;
    let db;
    let models;
    let adminToken;
    let consumerToken;
    let secondConsumerToken;
    let consumerId;
    let secondConsumerId;
    let partnerId;
    let validatedPartnerId;
    let basketId;

    beforeEach(() => {
        ({ app, db, models } = createTestApp());

        partnerId = models.Commercant.creer({
            nom: 'Pending Partner',
            email: 'pending.partner@test.fr',
            mot_de_passe: 'hash',
            adresse: '10 rue Test',
        }).id;

        validatedPartnerId = models.Commercant.creer({
            nom: 'Validated Partner',
            email: 'validated.partner@test.fr',
            mot_de_passe: 'hash',
            adresse: '11 rue Test',
            categorie: 'Boulangerie',
        }).id;

        models.Commercant.valider(validatedPartnerId);

        basketId = models.PanierSurprise.creer({
            commercant_id: validatedPartnerId,
            nom: 'API Basket',
            prix_origine: 20,
            prix_reduit: 8,
            quantite: 4,
            description: 'Panier API',
        }).id;

        consumerId = models.Client.creer({
            nom: 'Client Test',
            email: 'client@test.fr',
            mot_de_passe: 'hash',
        }).id;

        secondConsumerId = models.Client.creer({
            nom: 'Client Second',
            email: 'client.second@test.fr',
            mot_de_passe: 'hash',
        }).id;

        process.env.JWT_SECRET = 'test_secret';
        adminToken = jwt.sign({ id: 999, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
        consumerToken = jwt.sign({ id: consumerId, role: 'consumer' }, process.env.JWT_SECRET, { expiresIn: '1h' });
        secondConsumerToken = jwt.sign({ id: secondConsumerId, role: 'consumer' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    });

    afterEach(() => {
        db.close();
    });

    test('GET /api/baskets returns only active baskets from validated merchants', async () => {
        const response = await request(app).get('/api/baskets');

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0]).toEqual(
            expect.objectContaining({
                id: basketId,
                nom: 'API Basket',
                commercant_nom: 'Validated Partner',
            })
        );
    });

    test('POST /api/baskets rejects invalid price contract', async () => {
        const response = await request(app)
            .post('/api/baskets')
            .send({
                commercant_id: validatedPartnerId,
                nom: 'Invalid Basket',
                prix_origine: 10,
                prix_reduit: 10,
                quantite: 1,
            });

        expect(response.status).toBe(400);
        expect(response.body).toEqual(
            expect.objectContaining({
                error: expect.stringContaining('prix réduit'),
            })
        );
    });

    test('GET /api/partners/:id hides password field', async () => {
        const response = await request(app).get(`/api/partners/${validatedPartnerId}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(
            expect.objectContaining({ id: validatedPartnerId, nom: 'Validated Partner' })
        );
        expect(response.body.mot_de_passe).toBeUndefined();
    });

    test('GET /api/admin/partners/pending requires admin token and returns sanitized pending partners', async () => {
        const response = await request(app)
            .get('/api/admin/partners/pending')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0]).toEqual(
            expect.objectContaining({ id: partnerId, nom: 'Pending Partner' })
        );
        expect(response.body[0].mot_de_passe).toBeUndefined();
    });

    test('PUT /api/admin/partners/:id/validate validates a pending partner', async () => {
        const response = await request(app)
            .put(`/api/admin/partners/${partnerId}/validate`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Partenaire validé avec succès.' });
        expect(models.Commercant.trouverParId(partnerId)).toEqual(
            expect.objectContaining({ est_valide: 1 })
        );
    });

    test('GET /api/admin/stats returns aggregated counts', async () => {
        const response = await request(app)
            .get('/api/admin/stats')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            total_clients: 2,
            total_partenaires: 2,
            partenaires_valides: 1,
            total_paniers: 1,
            paniers_actifs: 1,
        });
    });

    test('POST /api/orders creates an order for authenticated consumer and decrements basket quantity', async () => {
        const response = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${consumerToken}`)
            .send({ panier_id: basketId, quantite: 2 });

        expect(response.status).toBe(201);
        expect(response.body).toEqual(
            expect.objectContaining({
                client_id: consumerId,
                panier_id: basketId,
                quantite: 2,
                prix_unitaire: 8,
                montant_total: 16,
            })
        );

        expect(models.PanierSurprise.trouverParId(basketId)).toEqual(
            expect.objectContaining({ quantite: 2, est_actif: 1 })
        );
    });

    test('POST /api/orders rejects when stock is insufficient', async () => {
        const response = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${consumerToken}`)
            .send({ panier_id: basketId, quantite: 99 });

        expect(response.status).toBe(400);
        expect(response.body).toEqual(
            expect.objectContaining({ error: expect.stringContaining('Stock insuffisant') })
        );
    });

    test('GET /api/orders/my returns only orders for authenticated consumer', async () => {
        const firstOrderResponse = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${consumerToken}`)
            .send({ panier_id: basketId, quantite: 1 });

        await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${secondConsumerToken}`)
            .send({ panier_id: basketId, quantite: 1 });

        const listResponse = await request(app)
            .get('/api/orders/my')
            .set('Authorization', `Bearer ${consumerToken}`);

        expect(firstOrderResponse.status).toBe(201);
        expect(listResponse.status).toBe(200);
        expect(listResponse.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: firstOrderResponse.body.id,
                    client_id: consumerId,
                }),
            ])
        );
        expect(listResponse.body.find((o) => o.client_id === secondConsumerId)).toBeUndefined();
    });
});