/**
 * Death Note: Killer Within - Hash Manager Utility
 * Manages loading and saving settings to the URL hash
 */

(function() {
    'use strict';

    // Flag to ignore hash updates during initialization
    let ignoreHashUpdate = false;

    const HashManager = {
        /**
         * Update URL hash with current settings
         */
        updateUrlHash: function() {
            // Skip this when initializing from the hash
            if (ignoreHashUpdate) {
                return;
            }

            const settings = DeathNote.getModule('settings');
            if (!settings) {
                console.error('Settings module not available');
                return;
            }

            const settingsData = settings.getAllSettings();
            const hashSettings = {};

            // Get all settings except lobby code (for privacy)
            for (const key in settingsData) {
                if (key !== 'lobbyCode') {
                    hashSettings[key] = settingsData[key].value;
                }
            }

            // Convert to JSON and encode for URL
            const hashValue = encodeURIComponent(JSON.stringify(hashSettings));

            // Update the URL without reloading the page
            window.history.replaceState(null, null, `#${hashValue}`);
        },

        /**
         * Load settings from URL hash
         * @returns {boolean} True if settings were loaded successfully
         */
        loadFromHash: function() {
            if (!window.location.hash) {
                return false;
            }

            try {
                // Set flag to ignore hash updates during initialization
                ignoreHashUpdate = true;

                // Get the hash without the # character and decode
                const hashValue = decodeURIComponent(window.location.hash.substring(1));

                // Parse the JSON
                const hashSettings = JSON.parse(hashValue);

                const settings = DeathNote.getModule('settings');
                if (!settings) {
                    console.error('Settings module not available');
                    ignoreHashUpdate = false;
                    return false;
                }

                // Apply settings
                for (const key in hashSettings) {
                    settings.updateSetting(key, hashSettings[key]);
                }

                // Clear the flag after initialization
                ignoreHashUpdate = false;

                // Trigger a settings changed event to update UI
                document.dispatchEvent(new CustomEvent('settings:changed'));

                return true;
            } catch (e) {
                console.error('Error parsing settings from hash:', e);
                ignoreHashUpdate = false;
                return false;
            }
        }
    };

    // Register with the utils namespace
    DeathNote.utils.hashManager = HashManager;
})();