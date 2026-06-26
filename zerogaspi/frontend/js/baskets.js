/**
 * baskets.js - Gestion des paniers surprises
 * Récupère les données de l'API et met à jour l'interface
 */

const API_BASE = 'http://localhost:3000/api';

// Variables globales
let allBaskets = [];
let filteredBaskets = [];
let activeFilter = 'all';
let searchTerm = '';

/**
 * Récupère tous les paniers depuis l'API
 */
async function fetchBaskets() {
    try {
        const response = await fetch(`${API_BASE}/baskets`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        allBaskets = await response.json();
        console.log(`📦 ${allBaskets.length} paniers chargés depuis l'API`);
        
        // Afficher les paniers
        displayBaskets(allBaskets);
        
        // Mettre à jour les statistiques
        updateStats(allBaskets);
        
        return allBaskets;
    } catch (error) {
        console.error('❌ Erreur lors du chargement des paniers:', error);
        displayError('Impossible de charger les paniers. Vérifiez que le serveur fonctionne.');
    }
}

/**
 * Affiche les paniers dans la grille
 */
function displayBaskets(baskets) {
    const grid = document.querySelector('.cards-grid');
    if (!grid) return;
    
    // Vider la grille
    grid.innerHTML = '';
    
    if (baskets.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem;">Aucun panier disponible.</p>';
        return;
    }
    
    baskets.forEach(basket => {
        const card = createBasketCard(basket);
        grid.appendChild(card);
    });
}

/**
 * Crée une carte de panier
 */
function createBasketCard(basket) {
    const article = document.createElement('article');
    article.className = 'basket-card';
    
    // Déterminer le badge et la couleur
    const categoryMap = {
        'Fruits & Légumes': { icon: 'eco', label: 'Bio', color: 'soft' },
        'Boulangerie': { icon: 'bakery_dining', label: 'Boulangerie', color: 'warm' },
        'Restauration': { icon: 'set_meal', label: 'Restauration', color: 'hot' },
        'Épicerie': { icon: 'shopping_bag', label: 'Épicerie', color: 'neutral' }
    };
    
    const badgeInfo = categoryMap[basket.categorie] || { icon: 'category', label: 'Produits', color: 'neutral' };
    const reductionPercent = Math.round(((basket.prix_origine - basket.prix_reduit) / basket.prix_origine) * 100);
    
    article.innerHTML = `
        <div class="basket-card__badge basket-card__badge--${badgeInfo.color}">
            <span class="material-symbols-outlined" aria-hidden="true">${badgeInfo.icon}</span>
            <span>${reductionPercent}% off</span>
        </div>
        <div class="basket-card__image basket-card__image--${badgeInfo.color.toLowerCase()}" role="img" aria-label="${basket.nom}"></div>
        <div class="basket-card__body">
            <div class="basket-card__meta">
                <div>
                    <h2>${basket.nom}</h2>
                    <p>
                        <span class="material-symbols-outlined" aria-hidden="true">storefront</span>
                        ${basket.commercant_nom || 'Commerçant'}
                    </p>
                </div>
                <div class="price-block">
                    <span class="price-block__old">${basket.prix_origine.toFixed(2)} €</span>
                    <span class="price-block__new">${basket.prix_reduit.toFixed(2)} €</span>
                </div>
            </div>
            <p class="basket-card__description">${basket.description || 'Panier de produits frais à bas prix.'}</p>
            <div class="basket-card__footer">
                <div class="basket-card__infos">
                    <p><span class="material-symbols-outlined" aria-hidden="true">access_time</span>${basket.heure_collecte || 'À convenir'}</p>
                    <p><span class="material-symbols-outlined" aria-hidden="true">shopping_basket</span>${basket.quantite} disponible${basket.quantite > 1 ? 's' : ''}</p>
                </div>
                <button class="cta" type="button" data-basket-id="${basket.id}">
                    <span>Réserver</span>
                    <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
                </button>
            </div>
        </div>
    `;
    
    // Ajouter l'événement de réservation
    const reserveBtn = article.querySelector('.cta');
    reserveBtn.addEventListener('click', () => {
        handleReservation(basket.id, basket.nom);
    });
    
    return article;
}

/**
 * Gère la réservation d'un panier
 */
function handleReservation(basketId, basketName) {
    alert(`✅ Panier "${basketName}" réservé avec succès !\n\nDétails : ${basketId}`);
    console.log(`Réservation pour le panier ${basketId}`);
}

/**
 * Met à jour les statistiques
 */
function updateStats(baskets) {
    const totalQuantity = baskets.reduce((sum, b) => sum + b.quantite, 0);
    const foodSaved = baskets.reduce((sum, b) => sum + (b.quantite * 2.6), 0);
    const co2Avoided = foodSaved * 1.9;
    
    console.log(`📊 Stats: ${baskets.length} paniers, ${foodSaved.toFixed(0)}kg de nourriture sauvée`);
}

/**
 * Affiche un message d'erreur
 */
function displayError(message) {
    const grid = document.querySelector('.cards-grid');
    if (grid) {
        grid.innerHTML = `<div style="grid-column: 1/-1; padding: 2rem; background: #ffe0e0; border-radius: 8px; color: #d32f2f;">
            <p><strong>⚠️ Erreur :</strong> ${message}</p>
            <p style="margin-top: 0.5rem; font-size: 0.9rem;">Le serveur doit fonctionner sur http://localhost:3000</p>
        </div>`;
    }
}

/**
 * Initialise le module au chargement du DOM
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initialisation du module Paniers...');
    fetchBaskets();
    
    // Gestion des filtres (si disponible)
    const filterButtons = document.querySelectorAll('.filter-chip');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterButtons.forEach(b => b.classList.remove('is-selected'));
            e.target.closest('.filter-chip').classList.add('is-selected');
            console.log('Filtre appliqué');
        });
    });
    
    // Gestion de la recherche (si disponible)
    const searchInput = document.querySelector('.searchbar input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchTerm = e.target.value.toLowerCase();
            const filtered = allBaskets.filter(b => 
                b.nom.toLowerCase().includes(searchTerm) || 
                b.commercant_nom?.toLowerCase().includes(searchTerm)
            );
            displayBaskets(filtered);
        });
    }
});
