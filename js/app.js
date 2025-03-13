/**
 * Death Note: Killer Within - Lobby Discord Post Generator
 * Main application entry point
 */

(function() {
    'use strict';

    // Application version and configuration
    const APP_CONFIG = {
        version: 'v1.3',
        toolUrl: 'https://mistial-dev.github.io/DeathNote/',
        creditLine: function() {
            return `Generated with [DeathNote Tool ${this.version}](${this.toolUrl})`;
        }
    };

    // Module registry for dependency management
    const _modules = new Map();

    // Track initialization state
    let _initialized = false;
    let _initializationInProgress = false;

    // Required modules in dependency order
    const REQUIRED_MODULES = ['utils', 'settings', 'recommendations', 'ui'];

    /**
     * Main application object
     */
    const app = {
        // Application constants exposed for other modules
        BINS: {
            LOBBY: 'Lobby Settings',
            PLAYER: 'Player',
            GAMEPLAY: 'Gameplay'
        },

        // Module registration tracking
        modulesReady: {
            utils: false,
            settings: false,
            recommendations: false,
            ui: false
        },

        /**
         * Get application version
         * @returns {string} Current application version
         */
        get version() {
            return APP_CONFIG.version;
        },

        /**
         * Get tool URL
         * @returns {string} Tool URL for credits
         */
        get toolUrl() {
            return APP_CONFIG.toolUrl;
        },

        /**
         * Get credit line for Discord posts
         * @returns {string} Formatted credit line
         */
        get creditLine() {
            return APP_CONFIG.creditLine();
        },

        /**
         * Get a registered module
         * @param {string} name - Module name
         * @returns {Object|null} Module instance or null if not found
         */
        getModule: function(name) {
            return _modules.get(name) || null;
        },

        /**
         * Initialize the application
         * @returns {Promise} Resolves when initialization is complete
         */
        init: function() {
            // Prevent multiple initializations
            if (_initialized) {
                console.log('Application already initialized');
                return Promise.resolve();
            }

            if (_initializationInProgress) {
                console.log('Initialization already in progress');
                return Promise.resolve();
            }

            _initializationInProgress = true;
            console.log('Initializing Death Note application...');

            return new Promise((resolve, reject) => {
                try {
                    // Wait for all required modules to be registered
                    const modulePromises = REQUIRED_MODULES.map(name => {
                        return new Promise(moduleResolve => {
                            if (_modules.has(name)) {
                                this.modulesReady[name] = true;
                                moduleResolve(_modules.get(name));
                            } else {
                                // Set up one-time event listener for module registration
                                const registrationHandler = (event) => {
                                    document.removeEventListener(`deathNote:module:${name}:registered`, registrationHandler);
                                    const module = _modules.get(name);
                                    this.modulesReady[name] = true;
                                    moduleResolve(module);
                                };
                                document.addEventListener(`deathNote:module:${name}:registered`, registrationHandler);

                                // Log waiting message
                                console.log('Waiting for module:', name, 'Current modules:', Array.from(_modules.keys()));

                                // Add timeout to avoid hanging forever
                                setTimeout(() => {
                                    console.warn(`Module '${name}' did not load in time, continuing anyway`);
                                    moduleResolve(null);
                                }, 5000);
                            }
                        });
                    });

                    // Once all modules are registered, initialize them in the correct order
                    Promise.all(modulePromises)
                        .then(modules => {
                            // Initialize each module
                            modules.forEach((module, index) => {
                                const moduleName = REQUIRED_MODULES[index];
                                if (module && typeof module.initialize === 'function') {
                                    console.log(`Initializing module: ${moduleName}`);
                                    try {
                                        module.initialize();
                                    } catch (error) {
                                        console.error(`Error initializing module ${moduleName}:`, error);
                                    }
                                }
                            });

                            // After initialization, trigger settings update and output generation
                            setTimeout(() => {
                                try {
                                    const settingsModule = this.getModule('settings');
                                    const uiModule = this.getModule('ui');

                                    if (settingsModule) {
                                        // Check for hash settings
                                        const hashManager = this.getModule('utils')?.hashManager;
                                        if (hashManager && typeof hashManager.loadFromHash === 'function') {
                                            try {
                                                hashManager.loadFromHash();
                                            } catch (error) {
                                                console.error('Error loading from hash:', error);
                                            }
                                        }
                                    }

                                    // Force output update if module is available
                                    if (uiModule && uiModule.output && typeof uiModule.output.updateOutput === 'function') {
                                        console.log('Forcing initial output update');
                                        uiModule.output.updateOutput();
                                    } else if (this.ui && this.ui.output && typeof this.ui.output.updateOutput === 'function') {
                                        console.log('Forcing initial output update (via app.ui)');
                                        this.ui.output.updateOutput();
                                    }

                                    // Dispatch settings changed event to ensure all modules update
                                    document.dispatchEvent(new CustomEvent('deathNote:settings:changed'));

                                    // Mark as initialized
                                    _initialized = true;
                                    _initializationInProgress = false;

                                    resolve();
                                    console.log('Application initialization complete');
                                } catch (error) {
                                    console.error('Error during final initialization steps:', error);
                                    _initializationInProgress = false;
                                    resolve(); // Resolve anyway to prevent hanging
                                }
                            }, 200);
                        })
                        .catch(error => {
                            console.error('Initialization failed:', error);
                            _initializationInProgress = false;
                            reject(error);
                        });
                } catch (error) {
                    console.error('Initialization error:', error);
                    _initializationInProgress = false;
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
            this.modulesReady[name] = true;

            // Dispatch event to notify of module registration
            const event = new CustomEvent(`deathNote:module:${name}:registered`);
            document.dispatchEvent(event);

            // If app is already initialized, initialize the new module
            if (_initialized && typeof module.initialize === 'function') {
                try {
                    module.initialize();
                } catch (error) {
                    console.error(`Error initializing module ${name}:`, error);
                }
            }

            return module;
        },

        /**
         * Convenience method to dispatch settings changed event
         */
        notifySettingsChanged: function() {
            document.dispatchEvent(new CustomEvent('deathNote:settings:changed'));
        }
    };

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM loaded, initializing application');
        app.init().catch(error => {
            console.error('Application initialization failed:', error);
        });
    });

    // Check if DeathNote already exists and extend it rather than replacing it
    if (window.DeathNote) {
        console.log('DeathNote global object already exists, extending it');
        // Copy properties from app to the existing DeathNote object
        for (const key in app) {
            if (app.hasOwnProperty(key) && typeof app[key] !== 'undefined') {
                try {
                    // Only add properties that don't already exist or update functions
                    if (typeof window.DeathNote[key] === 'undefined' || typeof app[key] === 'function') {
                        window.DeathNote[key] = app[key];
                    }
                } catch (e) {
                    console.warn(`Could not set DeathNote.${key}:`, e);
                }
            }
        }
    } else {
        // DeathNote doesn't exist yet, create it
        window.DeathNote = app;
    }
})();