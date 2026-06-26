/**
 * partner.js - Gestion du tableau de bord des partenaires/commerçants
 * Récupère les données de l'API et affiche les paniers du commerçant
 */

const API_BASE = '/api';

// Variables globales
let allBaskets = [];
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
        
        return allBaskets;
    } catch (error) {
        console.error('❌ Erreur lors du chargement des paniers:', error);
        displayError('Impossible de charger les paniers du serveur.');
        return [];
    }
}

/**
 * Affiche les paniers du partenaire
 */
function displayBaskets() {
    const basketList = document.getElementById('basket-list');
    if (!basketList) return;

    const filtered = getVisibleBaskets();

    if (filtered.length === 0) {
        basketList.innerHTML = '<div class="empty-state" style="padding: 2rem; text-align: center; color: #999;">Aucun panier ne correspond à votre recherche.</div>';
        return;
    }

    basketList.innerHTML = filtered.map(basket => createBasketCard(basket)).join('');
}

/**
 * Filtre les paniers selon le filtre et la recherche
 */
function getVisibleBaskets() {
    return allBaskets.filter(basket => {
        const matchesFilter = activeFilter === 'all' || basket.est_actif === (activeFilter === 'active');
        const normalizedSearch = searchTerm.trim().toLowerCase();
        const matchesSearch = normalizedSearch === '' || 
            `${basket.nom} ${basket.commercant_nom} ${basket.description || ''}`.toLowerCase().includes(normalizedSearch);
        
        return matchesFilter && matchesSearch;
    });
}

/**
 * Crée une carte de panier
 */
function createBasketCard(basket) {
    const reductionPercent = Math.round(((basket.prix_origine - basket.prix_reduit) / basket.prix_origine) * 100);
    const status = basket.est_actif ? 'Actif' : 'Inactif';
    const statusColor = basket.est_actif ? '#4caf50' : '#f44336';

    return `
        <article class="dashboard-card" style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 1.5rem; margin-bottom: 1rem; background: white;">
            <div class="dashboard-card__body" style="display: grid; gap: 0.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h3 style="margin: 0; font-size: 1.1rem;">${basket.nom}</h3>
                        <p style="margin: 0; color: #666; font-size: 0.9rem;">🏪 ${basket.commercant_nom}</p>
                    </div>
                    <span style="padding: 0.25rem 0.75rem; border-radius: 20px; background: ${statusColor}33; color: ${statusColor}; font-size: 0.85rem; font-weight: 500;">${status}</span>
                </div>
                
                <p style="margin: 0.5rem 0; color: #555; font-size: 0.95rem;">${basket.description || 'Aucune description'}</p>
                
                <div style="display: flex; gap: 1rem; margin-top: 0.5rem;">
                    <div>
                        <span style="color: #999; font-size: 0.85rem;">Prix</span>
                        <p style="margin: 0; font-weight: 600;">
                            <span style="text-decoration: line-through; color: #999; font-size: 0.9rem;">${basket.prix_origine.toFixed(2)} €</span>
                            → <span style="color: #4caf50;">${basket.prix_reduit.toFixed(2)} € (${reductionPercent}% off)</span>
                        </p>
                    </div>
                    <div>
                        <span style="color: #999; font-size: 0.85rem;">Quantité</span>
                        <p style="margin: 0; font-weight: 600;">${basket.quantite} disponible${basket.quantite > 1 ? 's' : ''}</p>
                    </div>
                    <div>
                        <span style="color: #999; font-size: 0.85rem;">Collecte</span>
                        <p style="margin: 0; font-weight: 600;">${basket.heure_collecte || 'À convenir'}</p>
                    </div>
                </div>
                
                <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                    <button onclick="editBasket(${basket.id})" style="flex: 1; padding: 0.5rem; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer; font-size: 0.9rem;">✏️ Modifier</button>
                    <button onclick="deleteBasket(${basket.id})" style="flex: 1; padding: 0.5rem; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer; font-size: 0.9rem; color: #f44336;">🗑️ Supprimer</button>
                </div>
            </div>
        </article>
    `;
}

/**
 * Met à jour les statistiques
 */
function updateStats() {
    const visible = getVisibleBaskets();
    const totalQuantity = visible.reduce((sum, b) => sum + b.quantite, 0);
    const foodSaved = visible.reduce((sum, b) => sum + (b.quantite * 2.6), 0);
    const co2Avoided = foodSaved * 1.9;

    const elements = {
        'total-baskets': visible.length,
        'saved-food': `${foodSaved.toFixed(0)} kg`,
        'avoided-co2': `${co2Avoided.toFixed(0)} kg`,
        'reservation-rate': '75%'
    };

    Object.entries(elements).forEach(([id, value]) => {
        const elem = document.getElementById(id);
        if (elem) elem.textContent = String(value);
    });
}

/**
 * Édite un panier
 */
function editBasket(basketId) {
    alert(`Édition du panier ${basketId}\nFonctionnalité à implémenter.`);
}

/**
 * Supprime un panier
 */
function deleteBasket(basketId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce panier ?')) {
        alert(`Panier ${basketId} supprimé\nFonctionnalité à implémenter.`);
    }
}

/**
 * Affiche un message d'erreur
 */
function displayError(message) {
    const basketList = document.getElementById('basket-list');
    if (basketList) {
        basketList.innerHTML = `<div style="padding: 2rem; background: #ffe0e0; border-radius: 8px; color: #d32f2f; text-align: center;">
            <p><strong>⚠️ Erreur :</strong> ${message}</p>
            <p style="font-size: 0.9rem; margin-top: 0.5rem;">Verifiez que l'API est accessible sur /api</p>
        </div>`;
    }
}

/**
 * Initialise le module
 */
document.addEventListener('DOMContentLoaded', async function () {
    console.log('🚀 Initialisation du module Partenaires...');

    const dashboard = document.querySelector('[data-partner-dashboard]');
    if (!dashboard) {
        console.log('Tableau de bord partenaire non trouvé');
        return;
    }

    // Charger les paniers
    await fetchBaskets();

    // Configuration des filtres
    const filterButtons = document.querySelectorAll('[data-filter]');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('is-active'));
            btn.classList.add('is-active');
            activeFilter = btn.dataset.filter;
            displayBaskets();
            updateStats();
        });
    });

    // Configuration de la recherche
    const basketSearch = document.getElementById('basket-search');
    if (basketSearch) {
        basketSearch.addEventListener('input', (e) => {
            searchTerm = e.target.value;
            displayBaskets();
            updateStats();
        });
    }

    // Configuration du formulaire
    const basketForm = document.getElementById('basket-form');
    if (basketForm) {
        basketForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Création de panier\nFonctionnalité à implémenter avec authentification.');
        });
    }

    // Affichage initial
    displayBaskets();
    updateStats();
});