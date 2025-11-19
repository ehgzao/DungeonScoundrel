/**
 * ============================================
 * GAME SHOP MODULE
 * ============================================
 * Shop system management
 * 
 * @module game-shop
 * @version 1.0.0
 * @author Gabriel Lima
 */

// Import game state
import { game, permanentUnlocks } from './game-state.js';

// DOM Elements (will be initialized after DOM loads)
let shopModal, shopItems, shopGoldAmount;
let btnDrawRoom, btnAvoidRoom;

// Initialize DOM elements
function initShopElements() {
    shopModal = document.getElementById('shopModal');
    shopItems = document.getElementById('shopItems');
    shopGoldAmount = document.getElementById('shopGoldAmount');
    btnDrawRoom = document.getElementById('btnDrawRoom');
    btnAvoidRoom = document.getElementById('btnAvoidRoom');
}

// Call init when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initShopElements);
} else {
    initShopElements();
}

/**
 * Update shop display with items and prices
 */
export function updateShopDisplay() {
    if (!shopItems || !shopGoldAmount) {
        console.error('[SHOP] Shop DOM elements not initialized!');
        return;
    }
    
    // Clear existing items
    shopItems.innerHTML = '';
    shopGoldAmount.textContent = game.gold;
    
    // Access SHOP_ITEMS from global scope (loaded by game-data.js)
    const SHOP_ITEMS = window.SHOP_ITEMS;
    if (!SHOP_ITEMS) {
        console.error('[SHOP] SHOP_ITEMS array not found!');
        return;
    }
    
    // Check for shop discount (unlocks + relics)
    let discount = 1.0;
    
    // Permanent unlock: 20% discount
    if (permanentUnlocks.shopDiscount) discount *= 0.8;
    
    // Dice relic: 5% discount
    if (game.relics.some(r => r.id === 'dice')) discount *= 0.95;
    
    // Crystal relic: 15% discount
    if (game.relics.some(r => r.id === 'crystal')) discount *= 0.85;
    
    // Show price multiplier warning if prices have increased
    if (game.shopPriceMultiplier > 1.0) {
        const increasePercent = Math.round((game.shopPriceMultiplier - 1) * 100);
        const warningBanner = document.createElement('div');
        warningBanner.style.cssText = 'background: rgba(255, 107, 107, 0.2); border: 2px solid #ff6b6b; padding: 10px; margin-bottom: 15px; text-align: center; border-radius: 8px;';
        warningBanner.innerHTML = `âš ï¸ <strong>Prices increased by ${increasePercent}%</strong> due to repeated purchases!`;
        shopItems.appendChild(warningBanner);
    }
    
    // Old Key: Check if we have a free item available
    const hasOldKey = game.relics.find(r => r.id === 'key' && !r.used);
    
    SHOP_ITEMS.forEach((item, itemIndex) => {
        // Old Key: First item is FREE (once per game)
        let finalPrice;
        let basePrice = Math.floor(item.price * discount);
        
        if (hasOldKey && itemIndex === 0) {
            finalPrice = 0;
        } else {
            finalPrice = Math.floor(basePrice * game.shopPriceMultiplier);
        }
        const itemEl = document.createElement('div');
        itemEl.className = 'shop-item';
        
        // Add visual indicator if can't afford
        const canAfford = game.gold >= finalPrice;
        const affordClass = canAfford ? '' : 'cannot-afford';
        const priceColor = canAfford ? '#ffd700' : '#ff6b6b';
        
        // Show original price if discount OR price increased
        let priceDisplayHTML = '';
        if (discount < 1.0 && game.shopPriceMultiplier > 1.0) {
            // Show both original and base (with multiplier) if both active
            priceDisplayHTML = `<span style="text-decoration: line-through; opacity: 0.5;">${item.price}</span> â†’ <span style="text-decoration: line-through; opacity: 0.5;">${basePrice}</span> `;
        } else if (discount < 1.0) {
            // Just discount
            priceDisplayHTML = `<span style="text-decoration: line-through; opacity: 0.5;">${item.price}</span> `;
        } else if (game.shopPriceMultiplier > 1.0) {
            // Just price increase
            priceDisplayHTML = `<span style="text-decoration: line-through; opacity: 0.5;">${item.price}</span> `;
        }
        
        itemEl.innerHTML = `
            <div class="item-info ${affordClass}">
                <div class="item-name">${item.name}</div>
                <div class="item-description">${item.description}</div>
                <div class="item-price" style="color: ${priceColor}; font-weight: bold;">
                    ${priceDisplayHTML}${finalPrice} ðŸª™
                    ${!canAfford ? ' <span style="color: #ff6b6b; font-size: 0.9em;">(Need ' + (finalPrice - game.gold) + ' more)</span>' : ''}
                </div>
            </div>
            <button class="buy-btn" data-item-id="${item.id}" data-price="${finalPrice}">${canAfford ? 'Buy' : 'ðŸ”’ Locked'}</button>
        `;
        
        const buyBtn = itemEl.querySelector('.buy-btn');
        if (!canAfford) {
            buyBtn.disabled = true;
            buyBtn.style.opacity = '0.5';
        }
        
        buyBtn.onclick = () => buyItem(item, finalPrice);
        
        shopItems.appendChild(itemEl);
    });
    
    // Show discount banner if unlocked
    if (discount < 1.0) {
        const banner = document.createElement('div');
        banner.style.cssText = 'background: rgba(255, 215, 0, 0.2); border: 2px solid #ffd700; padding: 10px; margin-bottom: 15px; text-align: center; border-radius: 8px;';
        banner.innerHTML = 'ðŸª <strong>Merchant Friend Active!</strong> 20% discount on all items!';
        shopItems.prepend(banner);
    }
}

/**
 * Buy an item from the shop
 */
export function buyItem(item, finalPrice) {
    if (game.gold < finalPrice) {
        if (typeof window.showMessage === 'function') {
            window.showMessage(`âŒ Not enough gold! Need ${finalPrice - game.gold} more.`, 'danger');
        }
        if (typeof window.playSound === 'function') {
            window.playSound('error');
        }
        return;
    }
    
    const success = item.buy(); // Run the item's function
    if (success) {
        // Old Key: Mark as used if this was a free purchase
        if (finalPrice === 0) {
            const keyRelic = game.relics.find(r => r.id === 'key');
            if (keyRelic) {
                keyRelic.used = true;
                if (typeof window.showMessage === 'function') {
                    window.showMessage('ðŸ—ï¸ Old Key used - 1 free item!', 'info');
                }
            }
        }
        
        game.gold -= finalPrice;
        
        // ANTI-EXPLOIT: Increase prices by 8% after each purchase (balanced)
        game.shopPriceMultiplier *= 1.08;
        
        if (typeof window.showMessage === 'function') {
            window.showMessage(`Purchased ${item.name}!`, 'success');
        }
        if (typeof window.playSound === 'function') {
            window.playSound('special');
        }
        
        // Track item purchase for achievement
        const saved = localStorage.getItem('scoundrel_lifetime_stats');
        let lifetimeStats = saved ? JSON.parse(saved) : {};
        lifetimeStats.itemsBought = (lifetimeStats.itemsBought || 0) + 1;
        localStorage.setItem('scoundrel_lifetime_stats', JSON.stringify(lifetimeStats));
        
        if (typeof window.updateUI === 'function') window.updateUI();
        updateShopDisplay(); // Re-render shop
        if (typeof window.checkAchievements === 'function') window.checkAchievements();
    } else {
        if (typeof window.playSound === 'function') {
            window.playSound('error');
        }
    }
}

/**
 * Open shop modal
 */
export function openShop() {
    if (!shopModal) {
        console.error('[SHOP] Shop modal not initialized!');
        return;
    }
    
    updateShopDisplay();
    
    // Disable game buttons
    if (btnDrawRoom) btnDrawRoom.disabled = true;
    if (btnAvoidRoom) btnAvoidRoom.disabled = true;
    
    shopModal.classList.add('active');
    
    // Switch to shop music
    if (typeof window.music !== 'undefined' && window.music.switchContext) {
        window.music.switchContext('shop');
    }
    
    // Track shop visit for score penalty AND achievements
    game.stats.shopsVisited = (game.stats.shopsVisited || 0) + 1;
    
    const saved = localStorage.getItem('scoundrel_lifetime_stats');
    let lifetimeStats = saved ? JSON.parse(saved) : {};
    lifetimeStats.shopsVisited = (lifetimeStats.shopsVisited || 0) + 1;
    localStorage.setItem('scoundrel_lifetime_stats', JSON.stringify(lifetimeStats));
    
    if (typeof window.checkAchievements === 'function') {
        window.checkAchievements();
    }
}

/**
 * Close shop modal
 */
export function closeShop() {
    if (!shopModal) {
        console.error('[SHOP] Shop modal not initialized!');
        return;
    }
    
    shopModal.classList.remove('active');
    
    // Return to gameplay music
    if (typeof window.music !== 'undefined' && window.music.switchContext) {
        window.music.switchContext('gameplay');
    }

    // Re-enable buttons based on game state
    if (game.room.length === 0) {
        // No cards in room - enable draw/avoid
        if (btnDrawRoom) {
            btnDrawRoom.removeAttribute('disabled');
            btnDrawRoom.disabled = false;
        }
        
        // CRITICAL: First room (roomsCleared === 0): Avoid must be disabled
        // After first room: Avoid enabled unless lastActionWasAvoid
        if (btnAvoidRoom) {
            if (game.stats.roomsCleared === 0 || game.lastActionWasAvoid) {
                btnAvoidRoom.setAttribute('disabled', 'disabled');
                btnAvoidRoom.disabled = true;
            } else {
                btnAvoidRoom.removeAttribute('disabled');
                btnAvoidRoom.disabled = false;
            }
        }
    } else {
        // Cards in room - disable draw/avoid (player must clear room first)
        if (btnDrawRoom) btnDrawRoom.disabled = true;
        if (btnAvoidRoom) btnAvoidRoom.disabled = true;
    }
}

// Global exposure for compatibility
window.updateShopDisplay = updateShopDisplay;
window.buyItem = buyItem;
window.openShop = openShop;
window.closeShop = closeShop;

