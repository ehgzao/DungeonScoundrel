/**
 * Shop System Module
 * Handles merchant interactions, item purchases, and shop display
 */

/**
 * Shop System
 * Manages the merchant shop with items, prices, discounts, and purchases
 */
export class ShopSystem {
    constructor(dependencies) {
        this.game = dependencies.game;
        this.permanentUnlocks = dependencies.permanentUnlocks;
        this.showMessage = dependencies.showMessage;
        this.playSound = dependencies.playSound;
        this.updateUI = dependencies.updateUI;
        this.checkAchievements = dependencies.checkAchievements;
        this.giveRelicByRarity = dependencies.giveRelicByRarity;
        this.music = dependencies.music;
        this.btnDrawRoom = dependencies.btnDrawRoom;
        this.btnAvoidRoom = dependencies.btnAvoidRoom;
        this.shopModal = dependencies.shopModal;
        this.shopItems = dependencies.shopItems; // DOM element
        this.shopGoldAmount = dependencies.shopGoldAmount; // DOM element
        
        // Shop items definition
        this.SHOP_ITEMS = this._defineShopItems();
        
        console.log('[SHOP] System initialized');
    }

    /**
     * Define all shop items with their effects
     * @private
     */
    _defineShopItems() {
        return [
            {
                id: 'heal_small',
                name: '💊 Small Potion',
                description: 'Restore 8 HP',
                price: 18,
                buy: () => {
                    this.game.health = Math.min(this.game.maxHealth, this.game.health + 8);
                    this.showMessage('Healed 8 HP!', 'success');
                    return true;
                }
            },
            {
                id: 'heal_large',
                name: '🍾 Large Potion',
                description: 'Restore 15 HP',
                price: 30,
                buy: () => {
                    this.game.health = Math.min(this.game.maxHealth, this.game.health + 15);
                    this.showMessage('Healed 15 HP!', 'success');
                    return true;
                }
            },
            {
                id: 'heal_full',
                name: '✨ Elixir',
                description: 'Restore to full HP',
                price: 50,
                buy: () => {
                    this.game.health = this.game.maxHealth;
                    this.showMessage('Fully healed!', 'success');
                    return true;
                }
            },
            {
                id: 'max_health',
                name: '❤️ Heart Container',
                description: '+5 maximum HP',
                price: 35,
                buy: () => {
                    this.game.maxHealth += 5;
                    this.game.health += 5;
                    this.showMessage('+5 Max HP!', 'success');
                    return true;
                }
            },
            {
                id: 'max_health_big',
                name: '❤️❤️ Large Heart',
                description: '+10 maximum HP',
                price: 60,
                buy: () => {
                    this.game.maxHealth += 10;
                    this.game.health += 10;
                    this.showMessage('+10 Max HP!', 'success');
                    return true;
                }
            },
            {
                id: 'weapon_upgrade',
                name: '⚔️ Weapon Polish',
                description: 'Upgrade current weapon by +2',
                price: 40,
                buy: () => {
                    if (this.game.equippedWeapon) {
                        this.game.equippedWeapon.numValue += 2;
                        this.showMessage('Weapon upgraded!', 'success');
                        this.updateUI();
                        return true;
                    } else {
                        this.showMessage('No weapon equipped!', 'danger');
                        return false;
                    }
                }
            },
            {
                id: 'weapon_big_upgrade',
                name: '⚔️⚔️ Master Forge',
                description: 'Upgrade current weapon by +5',
                price: 70,
                buy: () => {
                    if (this.game.equippedWeapon) {
                        this.game.equippedWeapon.numValue += 5;
                        this.showMessage('Weapon greatly upgraded!', 'success');
                        this.updateUI();
                        return true;
                    } else {
                        this.showMessage('No weapon equipped!', 'danger');
                        return false;
                    }
                }
            },
            {
                id: 'common_relic',
                name: '⚪ Common Relic',
                description: 'Gain a random common relic',
                price: 25,
                buy: () => {
                    this.giveRelicByRarity('common');
                    return true;
                }
            },
            {
                id: 'uncommon_relic',
                name: '🟢 Uncommon Relic',
                description: 'Gain a random uncommon relic',
                price: 50,
                buy: () => {
                    this.giveRelicByRarity('uncommon');
                    return true;
                }
            },
            {
                id: 'rare_relic',
                name: '🔵 Rare Relic',
                description: 'Gain a random rare relic',
                price: 100,
                buy: () => {
                    this.giveRelicByRarity('rare');
                    return true;
                }
            },
            {
                id: 'legendary_relic',
                name: '🟠 Legendary Relic',
                description: 'Gain a random legendary relic',
                price: 200,
                buy: () => {
                    this.giveRelicByRarity('legendary');
                    return true;
                }
            },
            {
                id: 'repair_weapon',
                name: '🔧 Weapon Repair',
                description: 'Restore weapon durability to full',
                price: 25,
                buy: () => {
                    if (this.game.equippedWeapon && this.game.equippedWeapon.durability < this.game.equippedWeapon.maxDurability) {
                        this.game.equippedWeapon.durability = this.game.equippedWeapon.maxDurability;
                        this.showMessage(`🔧 Weapon repaired! (${this.game.equippedWeapon.durability}/${this.game.equippedWeapon.maxDurability})`, 'success');
                        this.updateUI();
                        return true;
                    } else if (!this.game.equippedWeapon) {
                        this.showMessage('No weapon equipped!', 'danger');
                        return false;
                    } else {
                        this.showMessage('Weapon already at full durability!', 'info');
                        return false;
                    }
                }
            }
        ];
    }

    /**
     * Calculate current shop discount based on unlocks and relics
     * @returns {number} Discount multiplier (1.0 = no discount, 0.8 = 20% off)
     */
    _calculateDiscount() {
        let discount = 1.0;
        
        // Permanent unlock: 20% discount
        if (this.permanentUnlocks.shopDiscount) {
            discount *= 0.8;
        }
        
        // Dice relic: 5% discount
        if (this.game.relics.some(r => r.id === 'dice')) {
            discount *= 0.95;
        }
        
        // Crystal relic: 15% discount
        if (this.game.relics.some(r => r.id === 'crystal')) {
            discount *= 0.85;
        }
        
        return discount;
    }

    /**
     * Open shop modal and display items
     */
    openShop() {
        this.updateShopDisplay();
        
        // Disable game buttons
        this.btnDrawRoom.disabled = true;
        this.btnAvoidRoom.disabled = true;
        
        // Show modal
        this.shopModal.classList.add('active');
        
        // Switch to shop music
        this.music.switchContext('shop');
        
        // Track shop visit
        const saved = localStorage.getItem('scoundrel_lifetime_stats');
        let lifetimeStats = saved ? JSON.parse(saved) : {};
        lifetimeStats.shopsVisited = (lifetimeStats.shopsVisited || 0) + 1;
        localStorage.setItem('scoundrel_lifetime_stats', JSON.stringify(lifetimeStats));
        
        this.checkAchievements();
    }

    /**
     * Close shop modal
     */
    closeShop() {
        this.shopModal.classList.remove('active');
        
        // Return to gameplay music
        this.music.switchContext('gameplay');
        
        // Re-enable buttons if room is empty
        if (this.game.room.length === 0) {
            this.btnDrawRoom.disabled = false;
            this.btnAvoidRoom.disabled = this.game.lastActionWasAvoid;
        }
    }

    /**
     * Update shop display with current items and prices
     */
    updateShopDisplay() {
        // Clear existing items
        this.shopItems.innerHTML = '';
        this.shopGoldAmount.textContent = this.game.gold;
        
        // Calculate discount
        const discount = this._calculateDiscount();
        
        // Show price multiplier warning if prices have increased
        if (this.game.shopPriceMultiplier > 1.0) {
            const increasePercent = Math.round((this.game.shopPriceMultiplier - 1) * 100);
            const warningBanner = document.createElement('div');
            warningBanner.style.cssText = 'background: rgba(255, 107, 107, 0.2); border: 2px solid #ff6b6b; padding: 10px; margin-bottom: 15px; text-align: center; border-radius: 8px;';
            warningBanner.innerHTML = `⚠️ <strong>Prices increased by ${increasePercent}%</strong> due to repeated purchases!`;
            this.shopItems.appendChild(warningBanner);
        }
        
        // Check for Old Key relic (free item)
        const hasOldKey = this.game.relics.find(r => r.id === 'key' && !r.used);
        
        // Render all items
        this.SHOP_ITEMS.forEach((item, itemIndex) => {
            // Calculate final price
            let finalPrice;
            if (hasOldKey && itemIndex === 0) {
                finalPrice = 0; // First item FREE with Old Key
            } else {
                const basePrice = Math.floor(item.price * discount);
                finalPrice = Math.floor(basePrice * this.game.shopPriceMultiplier);
            }
            
            const itemEl = document.createElement('div');
            itemEl.className = 'shop-item';
            
            // Check if player can afford
            const canAfford = this.game.gold >= finalPrice;
            const affordClass = canAfford ? '' : 'cannot-afford';
            const priceColor = canAfford ? '#ffd700' : '#ff6b6b';
            
            // Show original price if discount or price increase
            let priceDisplayHTML = '';
            if (discount < 1.0 && this.game.shopPriceMultiplier > 1.0) {
                const basePrice = Math.floor(item.price * discount);
                priceDisplayHTML = `<span style="text-decoration: line-through; opacity: 0.5;">${item.price}</span> → <span style="text-decoration: line-through; opacity: 0.5;">${basePrice}</span> `;
            } else if (discount < 1.0) {
                priceDisplayHTML = `<span style="text-decoration: line-through; opacity: 0.5;">${item.price}</span> `;
            } else if (this.game.shopPriceMultiplier > 1.0) {
                priceDisplayHTML = `<span style="text-decoration: line-through; opacity: 0.5;">${item.price}</span> `;
            }
            
            itemEl.innerHTML = `
                <div class="item-info ${affordClass}">
                    <div class="item-name">${item.name}</div>
                    <div class="item-description">${item.description}</div>
                    <div class="item-price" style="color: ${priceColor}; font-weight: bold;">
                        ${priceDisplayHTML}${finalPrice} 🪙
                        ${!canAfford ? ` <span style="color: #ff6b6b; font-size: 0.9em;">(Need ${finalPrice - this.game.gold} more)</span>` : ''}
                    </div>
                </div>
                <button class="buy-btn" data-item-id="${item.id}" data-price="${finalPrice}">${canAfford ? 'Buy' : '🔒 Locked'}</button>
            `;
            
            const buyBtn = itemEl.querySelector('.buy-btn');
            if (!canAfford) {
                buyBtn.disabled = true;
                buyBtn.style.opacity = '0.5';
            }
            
            buyBtn.onclick = () => this.buyItem(item, finalPrice);
            
            this.shopItems.appendChild(itemEl);
        });
        
        // Show discount banner if applicable
        if (discount < 1.0) {
            const banner = document.createElement('div');
            banner.style.cssText = 'background: rgba(255, 215, 0, 0.2); border: 2px solid #ffd700; padding: 10px; margin-bottom: 15px; text-align: center; border-radius: 8px;';
            banner.innerHTML = '🏪 <strong>Merchant Friend Active!</strong> Discount on all items!';
            this.shopItems.prepend(banner);
        }
    }

    /**
     * Purchase an item from the shop
     * @param {Object} item - Item to purchase
     * @param {number} finalPrice - Final price after discounts
     */
    buyItem(item, finalPrice) {
        if (this.game.gold < finalPrice) {
            this.showMessage(`❌ Not enough gold! Need ${finalPrice - this.game.gold} more.`, 'danger');
            this.playSound('error');
            return;
        }
        
        const success = item.buy(); // Run the item's purchase function
        if (success) {
            // Mark Old Key as used if this was a free purchase
            if (finalPrice === 0) {
                const keyRelic = this.game.relics.find(r => r.id === 'key');
                if (keyRelic) {
                    keyRelic.used = true;
                    this.showMessage('🗝️ Old Key used - 1 free item!', 'info');
                }
            }
            
            this.game.gold -= finalPrice;
            
            // ANTI-EXPLOIT: Increase prices by 8% after each purchase
            this.game.shopPriceMultiplier *= 1.08;
            
            this.showMessage(`Purchased ${item.name}!`, 'success');
            this.playSound('special');
            
            // Track item purchase for achievement
            const saved = localStorage.getItem('scoundrel_lifetime_stats');
            let lifetimeStats = saved ? JSON.parse(saved) : {};
            lifetimeStats.itemsPurchased = (lifetimeStats.itemsPurchased || 0) + 1;
            localStorage.setItem('scoundrel_lifetime_stats', JSON.stringify(lifetimeStats));
            
            this.updateUI();
            this.updateShopDisplay(); // Re-render shop with new prices
            this.checkAchievements();
        } else {
            this.playSound('error');
        }
    }
}

/**
 * Initialize shop system and expose globally (for backwards compatibility)
 */
export function initializeShopSystem(dependencies) {
    const shopSystem = new ShopSystem(dependencies);
    
    // Expose functions globally for onclick handlers (temporary)
    window.openShop = () => shopSystem.openShop();
    window.closeShop = () => shopSystem.closeShop();
    window.closeShopWrapper = () => shopSystem.closeShop();
    
    console.log('[SHOP] System initialized and exposed globally');
    
    return shopSystem;
}

export default ShopSystem;
