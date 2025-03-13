/**
 * Death Note: Killer Within - Hash Manager Utility
 * Manages loading and saving settings to the URL hash for easy sharing
 */
(function(global) {
    'use strict';

    // Ensure DeathNote namespace exists
    global.DeathNote = global.DeathNote || {};
    global.DeathNote.utils = global.DeathNote.utils || {};

    // Flag to prevent recursive hash updates during initialization
    let ignoreHashUpdate = false;

    /**
     * Hash Manager Utility
     */
    const HashManager = {
        /**
         * Initialize the hash manager
         */
        initialize: function() {
            console.log('Hash Manager initializing');

            // Try to load settings from hash on initial load
            this.loadFromHash();

            // Set up event listener to update hash when settings change
            document.addEventListener('deathNote:settings:changed', () => {
                this.updateUrlHash();
            });
        },

        /**
         * Update URL hash with current settings
         */
        updateUrlHash: function() {
            // Skip this when initializing from the hash
            if (ignoreHashUpdate) {
                return;
            }

            // Use a safer method to get the settings module
            const settings = global.DeathNote.getModule
                ? global.DeathNote.getModule('settings')
                : null;

            if (!settings) {
                console.warn('Settings module not available for hash update');
                return;
            }

            try {
                const settingsData = settings.getAllSettings();
                const hashSettings = {};

                // Get all settings except lobby code (for privacy)
                for (const key in settingsData) {
                    if (key !== 'lobbyCode') {
                        hashSettings[key] = settingsData[key].value;
                    }
                }

                // Convert to JSON and encode for URL
                const hashValue = this._encodeSettings(hashSettings);

                if (window.location.hash === hashValue) {
                    console.log('Skipping redundant hash update');
                    return;  // Prevent unnecessary updates
                }

                // Update the URL without reloading the page
                this._setWindowHash(hashValue);

                console.log('URL hash updated with current settings');
            } catch (error) {
                console.error('Error updating URL hash:', error);
            }
        },

        /**
         * Load settings from URL hash
         * @returns {boolean} True if settings were loaded successfully
         */
        loadFromHash: function() {
            // No hash, nothing to do
            if (!window.location.hash || window.location.hash === '#') {
                return false;
            }

            try {
                // Set flag to ignore hash updates during initialization
                ignoreHashUpdate = true;

                // Get the hash without the # character and decode
                const hashValue = window.location.hash.substring(1);
                console.log('Loading settings from hash');

                // Parse the settings from hash
                const hashSettings = this._decodeSettings(hashValue);
                if (!hashSettings) {
                    throw new Error('Invalid hash format');
                }

                const settings = global.DeathNote.getModule
                    ? global.DeathNote.getModule('settings')
                    : null;

                if (!settings) {
                    console.error('Settings module not available for loading from hash');
                    ignoreHashUpdate = false;
                    return false;
                }

                // Apply settings
                for (const key in hashSettings) {
                    settings.updateSetting(key, hashSettings[key], true);
                }

                // Clear the flag after initialization
                ignoreHashUpdate = false;

                // Trigger a settings changed event to update UI
                document.dispatchEvent(new CustomEvent('deathNote:settings:changed'));

                console.log('Settings loaded from hash successfully');
                return true;
            } catch (e) {
                console.error('Error parsing settings from hash:', e);
                ignoreHashUpdate = false;
                return false;
            }
        },

        /**
         * Encode settings for URL hash
         * @private
         * @param {Object} settings - Settings to encode
         * @returns {string} Encoded settings string
         */
        _encodeSettings: function(settings) {
            try {
                // Compress the settings by removing default values
                const compressedSettings = this._compressSettings(settings);

                // Convert to JSON and encode for URL
                return encodeURIComponent(JSON.stringify(compressedSettings));
            } catch (error) {
                console.error('Error encoding settings for hash:', error);
                return '';
            }
        },

        /**
         * Decode settings from URL hash
         * @private
         * @param {string} hashValue - Encoded settings string
         * @returns {Object|null} Decoded settings or null if invalid
         */
        _decodeSettings: function(hashValue) {
            try {
                // Decode from URL
                const jsonStr = decodeURIComponent(hashValue);

                // Parse the JSON
                return JSON.parse(jsonStr);
            } catch (error) {
                console.error('Error decoding settings from hash:', error);
                return null;
            }
        },

        /**
         * Compress settings by removing default values
         * @private
         * @param {Object} settings - Settings to compress
         * @returns {Object} Compressed settings
         */
        _compressSettings: function(settings) {
            const settingsModule = global.DeathNote.getModule
                ? global.DeathNote.getModule('settings')
                : null;

            if (!settingsModule) {
                return settings; // Can't compress, return as is
            }

            const compressed = {};
            const definitions = settingsModule.getAllDefinitions();

            // Only include non-default values
            for (const key in settings) {
                const def = definitions.find(d => d.id === key);

                // If no definition (could be a dynamic setting) or value differs from default, include it
                if (!def || settings[key] !== def.defaultValue) {
                    compressed[key] = settings[key];
                }
            }

            return compressed;
        },

        /**
         * Set window hash with proper error handling
         * @private
         * @param {string} hash - Hash value to set
         */
        _setWindowHash: function(hash) {
            try {
                window.history.replaceState(null, null, `#${hash}`);
            } catch (error) {
                console.error('Error updating window hash:', error);

                // Fallback method
                window.location.hash = hash;
            }
        }
    };

    // Expose to global DeathNote namespace
    global.DeathNote.utils = global.DeathNote.utils || {};
    global.DeathNote.utils.hashManager = HashManager;

    // Module registration helper
    function registerModule() {
        if (global.DeathNote.registerModule) {
            global.DeathNote.registerModule('utils', {
                initialize: function() {
                    console.log('Utils module initialized');
                    HashManager.initialize();
                },
                hashManager: HashManager
            });
        } else {
            console.warn('Unable to register utils module');
        }
    }

    // Register module when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', registerModule);
    } else {
        registerModule();
    }
})(window);