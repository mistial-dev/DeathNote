/**
 * Death Note: Killer Within - Lobby Discord Post Generator
 * Main application entry point
 */

const DeathNote = (function() {
    'use strict';

    // Private module registry
    const _modules = new Map();
    let _initialized = false;

    // Public API
    const app = {
        version: 'v1.2',
        toolUrl: 'https://mistial-dev.github.io/DeathNote/',

        /**
         * Initialize the application
         * @returns {Promise} Resolves when initialization is complete
         */
        init: function() {
            if (_initialized) {
                console.log('Application already initialized');
                return Promise.resolve();
            }

            console.log('Initializing Death Note application...');

            return new Promise((resolve, reject) => {
                try {
                    // Load required modules
                    const requiredModules = ['settings', 'recommendations', 'ui'];
                    const modulePromises = requiredModules.map(name => {
                        return new Promise(moduleResolve => {
                            if (_modules.has(name)) {
                                moduleResolve();
                            } else {
                                // Set up one-time event listener for module registration
                                document.addEventListener(`module:${name}:ready`, () => moduleResolve(), { once: true });

                                // Add timeout to avoid hanging forever
                                setTimeout(() => {
                                    console.warn(`Module '${name}' did not load in time, continuing anyway`);
                                    moduleResolve();
                                }, 3000);
                            }
                        });
                    });

                    // Once all modules are registered, initialize them in the correct order
                    Promise.all(modulePromises)
                        .then(() => {
                            // Initialize settings first
                            if (_modules.has('settings')) {
                                _modules.get('settings').initialize();
                            }

                            // Process URL hash if present
                            const hashManager = app.utils.hashManager;
                            if (hashManager) {
                                hashManager.loadFromHash();
                            }

                            // Initialize UI with settings
                            if (_modules.has('ui')) {
                                _modules.get('ui').initialize();
                            }

                            // Initialize recommendations
                            if (_modules.has('recommendations')) {
                                _modules.get('recommendations').initialize();
                            }

                            // Set up rating update interval
                            setInterval(() => {
                                if (_modules.has('ui')) {
                                    _modules.get('ui').updateRatings();
                                }
                            }, 2000);

                            _initialized = true;
                            console.log('Application initialized successfully');
                            resolve();
                        })
                        .catch(error => {
                            console.error('Failed to initialize application:', error);
                            reject(error);
                        });
                } catch (error) {
                    console.error('Error during initialization:', error);
                    reject(error);
                }
            });
        },

        /**
         * Register a module with the application
         * @param {string} name - Module name
         * @param {Object} module - Module instance
         */
        registerModule: function(name, module) {
            if (!name || typeof name !== 'string') {
                throw new Error('Module name must be a non-empty string');
            }

            if (!module || typeof module !== 'object') {
                throw new Error(`Invalid module for '${name}'`);
            }

            console.log(`Registering module: ${name}`);
            _modules.set(name, module);

            // Dispatch event to notify of module registration
            document.dispatchEvent(new CustomEvent(`module:${name}:ready`));

            // If app is already initialized, initialize the new module
            if (_initialized && typeof module.initialize === 'function') {
                module.initialize();
            }
        },

        /**
         * Get a registered module
         * @param {string} name - Module name
         * @returns {Object|null} Module instance or null if not found
         */
        getModule: function(name) {
            return _modules.get(name) || null;
        },

        // Namespaces for organization
        models: {},
        ui: {},
        utils: {},

        // Public API endpoints for modules
        get settings() {
            return _modules.get('settings');
        },

        get recommendations() {
            return _modules.get('recommendations');
        }
    };

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', () => app.init());

    return app;
})();

// Export to global scope
window.DeathNote = DeathNote;