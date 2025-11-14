/**
 * Offline Storage Module - IndexedDB
 * Sistema robusto de armazenamento local com fallback para localStorage
 *
 * @module OfflineStorage
 * @version 1.0.0
 */

class OfflineStorage {
    constructor() {
        this.dbName = 'DungeonScoundrelDB';
        this.version = 1;
        this.db = null;
        this.isSupported = this.checkSupport();
        this.isReady = false;
    }

    /**
     * Verifica suporte ao IndexedDB
     * @returns {boolean}
     */
    checkSupport() {
        return 'indexedDB' in window;
    }

    /**
     * Inicializar banco de dados
     * @returns {Promise<IDBDatabase>}
     */
    async init() {
        if (!this.isSupported) {
            console.warn('⚠️  IndexedDB not supported - Using localStorage fallback');
            this.isReady = true;
            return null;
        }

        try {
            return new Promise((resolve, reject) => {
                const request = indexedDB.open(this.dbName, this.version);

                request.onerror = () => {
                    console.error('❌ IndexedDB open error:', request.error);
                    reject(request.error);
                };

                request.onsuccess = () => {
                    this.db = request.result;
                    this.isReady = true;
                    resolve(this.db);
                };

                request.onupgradeneeded = (event) => {
                    const db = event.target.result;

                    // Object Store: Saves (save games)
                    if (!db.objectStoreNames.contains('saves')) {
                        const savesStore = db.createObjectStore('saves', { keyPath: 'id' });
                        savesStore.createIndex('timestamp', 'timestamp', { unique: false });
                        savesStore.createIndex('difficulty', 'difficulty', { unique: false });
                    }

                    // Object Store: Stats (statistics)
                    if (!db.objectStoreNames.contains('stats')) {
                        const statsStore = db.createObjectStore('stats', { keyPath: 'id' });
                        statsStore.createIndex('type', 'type', { unique: false });
                    }

                    // Object Store: Achievements (conquistas)
                    if (!db.objectStoreNames.contains('achievements')) {
                        const achievementsStore = db.createObjectStore('achievements', { keyPath: 'id' });
                        achievementsStore.createIndex('unlocked', 'unlocked', { unique: false });
                    }

                    // Object Store: Settings (configurações)
                    if (!db.objectStoreNames.contains('settings')) {
                        const settingsStore = db.createObjectStore('settings', { keyPath: 'key' });
                    }

                };
            });
        } catch (error) {
            console.error('❌ IndexedDB initialization failed:', error);
            this.isReady = true; // Usar fallback
            return null;
        }
    }

    /**
     * Salvar dados em uma store
     * @param {string} storeName - Nome da store
     * @param {Object} data - Dados a salvar
     * @returns {Promise<void>}
     */
    async save(storeName, data) {
        if (!this.isReady) {
            await this.init();
        }

        // Fallback para localStorage
        if (!this.isSupported || !this.db) {
            return this.saveToLocalStorage(storeName, data);
        }

        try {
            return new Promise((resolve, reject) => {
                const tx = this.db.transaction([storeName], 'readwrite');
                const store = tx.objectStore(storeName);
                const request = store.put(data);

                request.onsuccess = () => {
                    resolve();
                };

                request.onerror = () => {
                    console.error(`❌ Error saving to IndexedDB (${storeName}):`, request.error);
                    reject(request.error);
                };
            });
        } catch (error) {
            console.error('❌ Save error:', error);
            // Fallback
            return this.saveToLocalStorage(storeName, data);
        }
    }

    /**
     * Carregar dados de uma store
     * @param {string} storeName - Nome da store
     * @param {string} id - ID do registro
     * @returns {Promise<Object|null>}
     */
    async load(storeName, id) {
        if (!this.isReady) {
            await this.init();
        }

        // Fallback para localStorage
        if (!this.isSupported || !this.db) {
            return this.loadFromLocalStorage(storeName, id);
        }

        try {
            return new Promise((resolve, reject) => {
                const tx = this.db.transaction([storeName], 'readonly');
                const store = tx.objectStore(storeName);
                const request = store.get(id);

                request.onsuccess = () => {
                    if (request.result) {
                        resolve(request.result);
                    } else {
                        resolve(null);
                    }
                };

                request.onerror = () => {
                    console.error(`❌ Error loading from IndexedDB (${storeName}):`, request.error);
                    reject(request.error);
                };
            });
        } catch (error) {
            console.error('❌ Load error:', error);
            // Fallback
            return this.loadFromLocalStorage(storeName, id);
        }
    }

    /**
     * Carregar todos os dados de uma store
     * @param {string} storeName - Nome da store
     * @returns {Promise<Array>}
     */
    async loadAll(storeName) {
        if (!this.isReady) {
            await this.init();
        }

        // Fallback para localStorage
        if (!this.isSupported || !this.db) {
            return this.loadAllFromLocalStorage(storeName);
        }

        try {
            return new Promise((resolve, reject) => {
                const tx = this.db.transaction([storeName], 'readonly');
                const store = tx.objectStore(storeName);
                const request = store.getAll();

                request.onsuccess = () => {
                    resolve(request.result);
                };

                request.onerror = () => {
                    console.error(`❌ Error loading all from IndexedDB (${storeName}):`, request.error);
                    reject(request.error);
                };
            });
        } catch (error) {
            console.error('❌ LoadAll error:', error);
            // Fallback
            return this.loadAllFromLocalStorage(storeName);
        }
    }

    /**
     * Deletar dados de uma store
     * @param {string} storeName - Nome da store
     * @param {string} id - ID do registro
     * @returns {Promise<void>}
     */
    async delete(storeName, id) {
        if (!this.isReady) {
            await this.init();
        }

        // Fallback para localStorage
        if (!this.isSupported || !this.db) {
            return this.deleteFromLocalStorage(storeName, id);
        }

        try {
            return new Promise((resolve, reject) => {
                const tx = this.db.transaction([storeName], 'readwrite');
                const store = tx.objectStore(storeName);
                const request = store.delete(id);

                request.onsuccess = () => {
                    resolve();
                };

                request.onerror = () => {
                    console.error(`❌ Error deleting from IndexedDB (${storeName}):`, request.error);
                    reject(request.error);
                };
            });
        } catch (error) {
            console.error('❌ Delete error:', error);
            // Fallback
            return this.deleteFromLocalStorage(storeName, id);
        }
    }

    /**
     * Limpar toda uma store
     * @param {string} storeName - Nome da store
     * @returns {Promise<void>}
     */
    async clear(storeName) {
        if (!this.isReady) {
            await this.init();
        }

        // Fallback para localStorage
        if (!this.isSupported || !this.db) {
            return this.clearLocalStorage(storeName);
        }

        try {
            return new Promise((resolve, reject) => {
                const tx = this.db.transaction([storeName], 'readwrite');
                const store = tx.objectStore(storeName);
                const request = store.clear();

                request.onsuccess = () => {
                    resolve();
                };

                request.onerror = () => {
                    console.error(`❌ Error clearing IndexedDB (${storeName}):`, request.error);
                    reject(request.error);
                };
            });
        } catch (error) {
            console.error('❌ Clear error:', error);
            // Fallback
            return this.clearLocalStorage(storeName);
        }
    }

    // ========================================
    // FALLBACK: localStorage methods
    // ========================================

    saveToLocalStorage(storeName, data) {
        try {
            const key = `${this.dbName}_${storeName}_${data.id}`;
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error('❌ localStorage save error:', error);
        }
    }

    loadFromLocalStorage(storeName, id) {
        try {
            const key = `${this.dbName}_${storeName}_${id}`;
            const data = localStorage.getItem(key);
            if (data) {
                return JSON.parse(data);
            }
            return null;
        } catch (error) {
            console.error('❌ localStorage load error:', error);
            return null;
        }
    }

    loadAllFromLocalStorage(storeName) {
        try {
            const prefix = `${this.dbName}_${storeName}_`;
            const results = [];

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(prefix)) {
                    const data = localStorage.getItem(key);
                    if (data) {
                        results.push(JSON.parse(data));
                    }
                }
            }

            return results;
        } catch (error) {
            console.error('❌ localStorage loadAll error:', error);
            return [];
        }
    }

    deleteFromLocalStorage(storeName, id) {
        try {
            const key = `${this.dbName}_${storeName}_${id}`;
            localStorage.removeItem(key);
        } catch (error) {
            console.error('❌ localStorage delete error:', error);
        }
    }

    clearLocalStorage(storeName) {
        try {
            const prefix = `${this.dbName}_${storeName}_`;
            const keysToDelete = [];

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(prefix)) {
                    keysToDelete.push(key);
                }
            }

            keysToDelete.forEach(key => localStorage.removeItem(key));
        } catch (error) {
            console.error('❌ localStorage clear error:', error);
        }
    }

    // ========================================
    // HELPER METHODS
    // ========================================

    /**
     * Salvar jogo atual
     * @param {Object} gameState - Estado completo do jogo
     * @returns {Promise<void>}
     */
    async saveGame(gameState) {
        const saveData = {
            id: 'currentSave',
            ...gameState,
            timestamp: Date.now(),
            version: '1.6.25'
        };

        return this.save('saves', saveData);
    }

    /**
     * Carregar jogo salvo
     * @returns {Promise<Object|null>}
     */
    async loadGame() {
        return this.load('saves', 'currentSave');
    }

    /**
     * Salvar estatísticas
     * @param {Object} stats - Estatísticas do jogo
     * @returns {Promise<void>}
     */
    async saveStats(stats) {
        const statsData = {
            id: 'globalStats',
            ...stats,
            timestamp: Date.now()
        };

        return this.save('stats', statsData);
    }

    /**
     * Carregar estatísticas
     * @returns {Promise<Object|null>}
     */
    async loadStats() {
        return this.load('stats', 'globalStats');
    }

    /**
     * Obter informações de uso de storage
     * @returns {Promise<Object>}
     */
    async getStorageInfo() {
        if (navigator.storage && navigator.storage.estimate) {
            const estimate = await navigator.storage.estimate();
            const usage = estimate.usage || 0;
            const quota = estimate.quota || 0;
            const percentUsed = quota > 0 ? ((usage / quota) * 100).toFixed(2) : 0;

            return {
                used: this.formatBytes(usage),
                total: this.formatBytes(quota),
                percentUsed: percentUsed,
                available: this.formatBytes(quota - usage)
            };
        }

        return {
            used: 'Unknown',
            total: 'Unknown',
            percentUsed: 0,
            available: 'Unknown'
        };
    }

    /**
     * Formatar bytes para formato legível
     * @param {number} bytes
     * @returns {string}
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * Exportar todos os dados (backup)
     * @returns {Promise<Object>}
     */
    async exportData() {
        const [saves, stats, achievements, settings] = await Promise.all([
            this.loadAll('saves'),
            this.loadAll('stats'),
            this.loadAll('achievements'),
            this.loadAll('settings')
        ]);

        return {
            version: '1.6.25',
            exportDate: Date.now(),
            saves,
            stats,
            achievements,
            settings
        };
    }

    /**
     * Importar dados (restore backup)
     * @param {Object} backupData - Dados do backup
     * @returns {Promise<void>}
     */
    async importData(backupData) {
        if (!backupData || !backupData.version) {
            throw new Error('Invalid backup data');
        }


        // Importar cada store
        const imports = [];

        if (backupData.saves) {
            for (const save of backupData.saves) {
                imports.push(this.save('saves', save));
            }
        }

        if (backupData.stats) {
            for (const stat of backupData.stats) {
                imports.push(this.save('stats', stat));
            }
        }

        if (backupData.achievements) {
            for (const achievement of backupData.achievements) {
                imports.push(this.save('achievements', achievement));
            }
        }

        if (backupData.settings) {
            for (const setting of backupData.settings) {
                imports.push(this.save('settings', setting));
            }
        }

        await Promise.all(imports);
    }
}

// Criar instância global
window.offlineStorage = new OfflineStorage();

// Auto-inicializar
window.addEventListener('DOMContentLoaded', async () => {
    await window.offlineStorage.init();

    // Log storage info (debug)
    if (localStorage.getItem('debugMode') === 'true') {
        const info = await window.offlineStorage.getStorageInfo();
    }
});

// Exportar para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OfflineStorage;
}
