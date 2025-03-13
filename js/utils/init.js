/**
 * Death Note: Killer Within - Initialization
 * This script ensures proper initialization order and module communication
 */

(function() {
    'use strict';

    // Check if DeathNote global object exists
    if (!window.DeathNote) {
        console.error('DeathNote global object not found. Creating a minimal version.');
        window.DeathNote = {
            modules: {},
            getModule: function(name) {
                return this.modules[name] || null;
            },
            registerModule: function(name, module) {
                console.log(`Registering module: ${name}`);
                this.modules[name] = module;
                if (typeof module.initialize === 'function') {
                    try {
                        module.initialize();
                    } catch (e) {
                        console.error(`Error initializing module ${name}:`, e);
                    }
                }
                return module;
            }
        };
    }

    // Track initialization attempts to prevent infinite loops
    let initializationAttempts = 0;
    const MAX_INIT_ATTEMPTS = 3;

    /**
     * Check for UI elements and initialize them if needed
     * @returns {boolean} True if settings UI was found and is working
     */
    function checkUIElements() {
        console.log('Checking UI elements...');

        // Check for settings containers in DOM
        const lobbyContainer = document.getElementById('lobby-settings-section');
        const playerContainer = document.getElementById('player-settings-section');
        const gameplayContainer = document.getElementById('gameplay-settings-section');

        const containersExist = lobbyContainer && playerContainer && gameplayContainer;
        console.log(`Settings containers exist: ${containersExist}`);

        // Check if containers have content
        const hasContent = containersExist && (
            lobbyContainer.children.length > 1 ||
            playerContainer.children.length > 1 ||
            gameplayContainer.children.length > 1
        );

        console.log(`Settings containers have content: ${hasContent}`);

        return hasContent;
    }

    /**
     * Try to fix settings UI by regenerating
     */
    function tryFixSettingsUI() {
        console.log('Attempting to fix settings UI...');

        // Try to get the settings UI module
        let settingsUI = null;

        // First check in DeathNote UI
        if (window.DeathNote && window.DeathNote.ui && window.DeathNote.ui.settings) {
            settingsUI = window.DeathNote.ui.settings;
            console.log('Found settings UI in DeathNote.ui');
        }
        // Then check in registered modules
        else if (window.DeathNote && window.DeathNote.getModule) {
            const uiModule = window.DeathNote.getModule('ui');
            if (uiModule && uiModule.settings) {
                settingsUI = uiModule.settings;
                console.log('Found settings UI in registered UI module');
            }
        }

        if (settingsUI) {
            // Try to regenerate UI
            try {
                console.log('Regenerating settings UI...');

                // First make sure settings module is initialized
                const settings = window.DeathNote.getModule('settings');
                if (settings && !settings.initialized && typeof settings.initialize === 'function') {
                    console.log('Initializing settings module first');
                    settings.initialize();
                }

                // Then initialize settings UI if needed
                if (!settingsUI.initialized && typeof settingsUI.initialize === 'function') {
                    console.log('Initializing settings UI');
                    settingsUI.initialize();
                }

                // Force UI regeneration
                if (typeof settingsUI._generateUI === 'function') {
                    console.log('Calling _generateUI directly');
                    settingsUI._generateUI();
                    return true;
                }
            } catch (error) {
                console.error('Error fixing settings UI:', error);
            }
        } else {
            console.error('Could not find settings UI module');
        }

        return false;
    }

    /**
     * Check and fix initialization issues
     */
    function checkAndFixInitialization() {
        console.log(`Checking application initialization (attempt ${initializationAttempts + 1} of ${MAX_INIT_ATTEMPTS})...`);

        // Prevent too many attempts
        if (initializationAttempts >= MAX_INIT_ATTEMPTS) {
            console.warn('Maximum initialization attempts reached, giving up');
            return;
        }

        initializationAttempts++;

        // Check UI elements first
        if (checkUIElements()) {
            console.log('UI appears to be properly initialized');
            return;
        }

        // UI is missing, try to fix it
        console.warn('UI elements are missing or empty, attempting to fix...');

        // Try to fix settings UI
        const fixed = tryFixSettingsUI();

        if (fixed) {
            console.log('Settings UI fixed successfully');

            // Force update output
            try {
                if (window.DeathNote && window.DeathNote.ui && window.DeathNote.ui.output &&
                    typeof window.DeathNote.ui.output.updateOutput === 'function') {
                    console.log('Forcing output update');
                    window.DeathNote.ui.output.updateOutput();
                }
            } catch (e) {
                console.error('Error updating output:', e);
            }

            // Dispatch settings changed event
            document.dispatchEvent(new CustomEvent('deathNote:settings:changed'));
        } else {
            console.error('Failed to fix settings UI');

            // If we still have attempts left, try reloading scripts
            if (initializationAttempts < MAX_INIT_ATTEMPTS) {
                console.log('Will try again in 1 second...');
                setTimeout(checkAndFixInitialization, 1000);
            } else {
                console.error('Maximum initialization attempts reached');
                // As a last resort, try to reinitialize the whole application
                if (window.DeathNote && typeof window.DeathNote.init === 'function') {
                    console.log('Attempting complete application reinitialization');
                    window.DeathNote.init().catch(error => {
                        console.error('Application reinitialization failed:', error);
                    });
                }
            }
        }
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(checkAndFixInitialization, 500);
        });
    } else {
        setTimeout(checkAndFixInitialization, 500);
    }

    // Also set up a last resort check after all resources have loaded
    window.addEventListener('load', function() {
        setTimeout(checkAndFixInitialization, 1000);
    });

})();