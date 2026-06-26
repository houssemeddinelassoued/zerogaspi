const request = require('supertest');
const bcrypt = require('bcryptjs');
const { createTestApp } = require('./helpers/testApp');

describe('auth routes', () => {
    let app;
    let db;
    let models;

    beforeEach(async () => {
        ({ app, db, models } = createTestApp());
        process.env.JWT_SECRET = 'test_secret';

        const hash = await bcrypt.hash('password123', 4);
        models.Client.creer({
            nom: 'Alice',
            email: 'alice@test.fr',
            mot_de_passe: hash,
        });
    });

    afterEach(() => {
        db.close();
    });

    test('POST /api/auth/register creates a consumer account', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                nom: 'Bob',
                email: 'bob@test.fr',
                mot_de_passe: 'secret123',
            });

        expect(response.status).toBe(201);
        expect(response.body).toEqual(
            expect.objectContaining({ message: 'Compte client créé.', id: expect.any(Number) })
        );
        expect(models.Client.trouverParEmail('bob@test.fr')).toEqual(
            expect.objectContaining({ email: 'bob@test.fr' })
        );
    });

    test('POST /api/auth/register requires partner address', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                nom: 'Partner',
                email: 'partner@test.fr',
                mot_de_passe: 'secret123',
                role: 'partner',
            });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: "L'adresse est obligatoire pour un partenaire." });
    });

    test('POST /api/auth/login returns JWT for valid consumer credentials', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'alice@test.fr',
                mot_de_passe: 'password123',
            });

        expect(response.status).toBe(200);
        expect(response.body).toEqual(
            expect.objectContaining({
                token: expect.any(String),
                user: expect.objectContaining({ email: 'alice@test.fr', role: 'consumer' }),
            })
        );
    });

    test('POST /api/auth/login rejects invalid credentials', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'alice@test.fr',
                mot_de_passe: 'wrong-password',
            });

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: 'Identifiants invalides.' });
    });
});