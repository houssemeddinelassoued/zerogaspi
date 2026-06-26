const { createTestApp } = require('./helpers/testApp');

describe('models', () => {
    let db;
    let models;

    beforeEach(() => {
        ({ db, models } = createTestApp());
    });

    afterEach(() => {
        db.close();
    });

    test('Commercant should create, stay pending, then become validated', () => {
        const { Commercant } = models;

        const { id } = Commercant.creer({
            nom: 'Boulangerie Test',
            email: 'boulangerie@test.fr',
            mot_de_passe: 'hash',
            adresse: '1 rue du Test',
            categorie: 'Boulangerie',
        });

        expect(Commercant.listerEnAttente()).toHaveLength(1);
        expect(Commercant.listerValides()).toHaveLength(0);

        Commercant.valider(id);

        expect(Commercant.listerEnAttente()).toHaveLength(0);
        expect(Commercant.listerValides()).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ id, email: 'boulangerie@test.fr', est_valide: 1 }),
            ])
        );
    });

    test('PanierSurprise listerActifs should only return baskets from validated merchants', () => {
        const { Commercant, PanierSurprise } = models;

        const validatedMerchant = Commercant.creer({
            nom: 'Valid Merchant',
            email: 'valid@test.fr',
            mot_de_passe: 'hash',
            adresse: '2 rue du Test',
        }).id;

        const pendingMerchant = Commercant.creer({
            nom: 'Pending Merchant',
            email: 'pending@test.fr',
            mot_de_passe: 'hash',
            adresse: '3 rue du Test',
        }).id;

        Commercant.valider(validatedMerchant);

        PanierSurprise.creer({
            commercant_id: validatedMerchant,
            nom: 'Visible Basket',
            prix_origine: 10,
            prix_reduit: 4,
            quantite: 2,
        });

        PanierSurprise.creer({
            commercant_id: pendingMerchant,
            nom: 'Hidden Basket',
            prix_origine: 12,
            prix_reduit: 5,
            quantite: 3,
        });

        expect(PanierSurprise.listerActifs()).toHaveLength(1);
        expect(PanierSurprise.listerActifs()[0]).toEqual(
            expect.objectContaining({ nom: 'Visible Basket', commercant_nom: 'Valid Merchant' })
        );
    });

    test('PanierSurprise decrementerQuantite should disable basket when quantity reaches zero', () => {
        const { Commercant, PanierSurprise } = models;

        const merchantId = Commercant.creer({
            nom: 'Merchant',
            email: 'merchant@test.fr',
            mot_de_passe: 'hash',
            adresse: '4 rue du Test',
        }).id;

        Commercant.valider(merchantId);

        const basketId = PanierSurprise.creer({
            commercant_id: merchantId,
            nom: 'Limited Basket',
            prix_origine: 9,
            prix_reduit: 3,
            quantite: 1,
        }).id;

        PanierSurprise.decrementerQuantite(basketId);

        expect(PanierSurprise.trouverParId(basketId)).toEqual(
            expect.objectContaining({ quantite: 0, est_actif: 0 })
        );
    });
});