/**
 * DeathNote - Global application namespace and initialization handler
 * This file defines the global namespace and ensures proper initialization sequence
 */

// Create a global namespace for our application
window.DeathNote = window.DeathNote || {};

// Initialize module status tracking
window.DeathNote.modulesReady = {
    settings: false,
    recommendations: false,
    app: false
};

// Flag to track initialization status
window.DeathNote.initialized = false;

// Initialize empty containers for module exports
window.DeathNote.settings = window.DeathNote.settings || {};
window.DeathNote.recommendations = window.DeathNote.recommendations || {};
window.DeathNote.ui = window.DeathNote.ui || {};

// Initialization function
window.DeathNote.init = function() {
    console.log("DeathNote initialization started");

    // Check if all modules are ready
    if (this.modulesReady.settings && this.modulesReady.recommendations && this.modulesReady.app) {
        console.log("All modules ready, initializing application");

        try {
            // Initialize settings first
            this.settings.initializeSettings();

            // Check for settings in URL hash
            const hasLoadedSettings = this.settings.loadSettingsFromHash();

            // Generate UI
            this.ui.generateSettingsUI();
            this.ui.setupAdvancedSettingsToggle();
            this.ui.setupCopyButton();
            this.settings.setupCopyLinkButton();
            this.ui.setupResetAllButton();
            this.settings.setupHashUpdateListeners();
            this.ui.setupRadioButtonSyncEvents();

            // IMPORTANT: Apply hash settings after UI is generated
            if (hasLoadedSettings) {
                this.settings.applyPendingHashSettings();
                this.settings.updateRelevancyScores();
            }

            // Generate output and recommendations
            this.ui.updateOutput();
            this.recommendations.updateRecommendations();

            this.initialized = true;
            console.log("DeathNote initialization completed");
        } catch (error) {
            console.error("Error during initialization:", error);
        }
    } else {
        console.log("Waiting for modules to load...");
        console.log("Module status:", JSON.stringify(this.modulesReady));
    }
};

// Register a module as ready
window.DeathNote.registerModule = function(moduleName) {
    if (this.modulesReady.hasOwnProperty(moduleName)) {
        console.log(`Module registered: ${moduleName}`);
        this.modulesReady[moduleName] = true;

        // Try to initialize if all expected modules are ready
        this.init();
    } else {
        console.error(`Unknown module: ${moduleName}`);
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, waiting for modules to register");
});