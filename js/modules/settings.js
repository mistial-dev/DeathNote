/**
 * Death Note: Killer Within - Settings Module
 * Manages all game settings, their defaults, and relevancy calculations
 */

(function() {
    'use strict';

    /**
     * Settings bin categories
     * @enum {string}
     */
    const BINS = {
        LOBBY: "Lobby Settings",
        PLAYER: "Player",
        GAMEPLAY: "Gameplay"
    };

    /**
     * Settings module
     */
    const Settings = {
        // Expose bins constant
        BINS: BINS,

        // Settings data store
        settings: {},

        // Track initialization state
        initialized: false,

        /**
         * Define all settings with their properties
         * Format:
         * {
         *   id: string,             // Unique identifier
         *   name: string,           // Display name
         *   description: string,    // Help text
         *   bin: string,            // Category from BINS
         *   type: string,           // UI control type
         *   defaultValue: any,      // Default value
         *   isAdvanced: boolean,    // Is this an advanced setting?
         *   canHide: boolean,       // Can this be hidden in the output?
         *   relevancyFunction: function, // Function to calculate relevancy score
         *   ...additional properties based on type
         * }
         */
        settingsDefinitions: [
            {
                id: 'lobbyCode',
                name: 'Lobby Code',
                description: 'Lobby code for people to join the lobby',
                bin: BINS.LOBBY,
                type: 'text',
                defaultValue: '',
                isAdvanced: false,
                canHide: false, // Critical, cannot be hidden
                maxLength: 5,
                pattern: '[A-Za-z0-9]{5}',
                required: true,
                relevancyFunction: () => 0.7 // Always important
            },
            {
                id: 'lobbyPrivacy',
                name: 'Lobby Privacy',
                description: 'Privacy settings for the lobby',
                bin: BINS.LOBBY,
                type: 'select',
                options: ['Public', 'Private', 'Private then Public'],
                defaultValue: 'Public',
                isAdvanced: false,
                canHide: true,
                relevancyFunction: () => 0.7 // Always important
            },
            {
                id: 'lobbyRegion',
                name: 'Region',
                description: 'Server region for the lobby',
                bin: BINS.LOBBY,
                type: 'select',
                options: ['America (East)', 'America (West)', 'Europe', 'Asia', 'Australia'],
                defaultValue: 'America (East)',
                isAdvanced: false,
                canHide: true,
                relevancyFunction: (value) => {
                    return value === 'America (East)' ? 0.2 : 0.7;
                }
            },
            {
                id: 'maximumPlayers',
                name: 'Maximum Players',
                description: 'The maximum number of players for the room',
                bin: BINS.GAMEPLAY,
                type: 'range',
                min: 4,
                max: 10,
                step: 1,
                defaultValue: 10,
                isAdvanced: false,
                canHide: true,
                relevancyFunction: (value) => {
                    // Higher relevancy for smaller player counts
                    return Math.min(1.0, 1.6 * Math.pow(2, -(value - 5)));
                }
            },
            {
                id: 'movementSpeed',
                name: 'Movement Speed',
                description: 'Speed multiplier for player movement',
                bin: BINS.PLAYER,
                type: 'range',
                min: 0.5,
                max: 1.5,
                step: 0.1,
                defaultValue: 1.0,
                isAdvanced: false,
                canHide: true,
                relevancyFunction: (value) => {
                    // Higher relevancy for extreme values
                    return Math.min(1.0, 2.857 * Math.abs(value - 1.05));
                }
            },
            {
                id: 'voiceChat',
                name: 'Voice Chat',
                description: 'If enabled, players are permitted to use voice chat',
                bin: BINS.GAMEPLAY,
                type: 'boolean',
                defaultValue: true,
                isAdvanced: false,
                canHide: true,
                relevancyFunction: (value) => {
                    return value ? 0.1 : 0.7; // Only highlight when disabled
                }
            },
            {
                id: 'roleSelection',
                name: 'Role Selection',
                description: 'If enabled, players will be permitted to select a role prior to game start',
                bin: BINS.PLAYER,
                type: 'boolean',
                defaultValue: false,
                isAdvanced: false,
                canHide: true,
                relevancyFunction: () => 0.7 // Always important
            },
            {
                id: 'melloRole',
                name: 'Mello Role',
                description: 'Indicates the number of players permitted to assume the Mello role',
                bin: BINS.GAMEPLAY,
                type: 'radio',
                options: [
                    { value: '0', label: 'Disabled' },
                    { value: '1', label: 'Enabled' },
                    { value: 'random', label: 'Random' }
                ],
                defaultValue: '1',
                isAdvanced: false,
                canHide: true,
                relevancyFunction: (value) => {
                    // Higher relevancy when disabled or random
                    if (value === '0') return 1.0;
                    if (value === 'random') return 0.7;
                    return 0.3;
                }
            },
            {
                id: 'kiraFollowerRole',
                name: 'Kira Follower Role',
                description: 'Indicates the number of players permitted to assume the Kira Follower role',
                bin: BINS.GAMEPLAY,
                type: 'radio',
                options: [
                    { value: '0', label: 'Disabled' },
                    { value: '1', label: 'Enabled' },
                    { value: 'random', label: 'Random' }
                ],
                defaultValue: '1',
                isAdvanced: false,
                canHide: true,
                relevancyFunction: (value) => {
                    // Higher relevancy when disabled or random
                    if (value === '0') return 1.0;
                    if (value === 'random') return 0.7;
                    return 0.3;
                }
            },
            {
                id: 'haveBlackNotebooks',
                name: 'Have Black Notebooks',
                description: 'If enabled, all players have black notebooks',
                bin: BINS.GAMEPLAY,
                type: 'boolean',
                defaultValue: false,
                isAdvanced: false,
                canHide: true,
                relevancyFunction: (value) => {
                    return value ? 1.0 : 0.1; // Only highlight when enabled
                }
            },
            {
                id: 'dayNightSeconds',
                name: 'Day/Night Seconds',
                description: 'The number of seconds of gameplay in both sections (Day/Night)',
                bin: BINS.GAMEPLAY,
                type: 'range',
                min: 30,
                max: 120,
                step: 15,
                defaultValue: 45,
                isAdvanced: false,
                canHide: true,
                relevancyFunction: (value) => {
                    // Higher relevancy for lower values
                    return Math.min(1.0, Math.exp(-0.0341 * (value - 30)) + 0.1);
                }
            },
            {
                id: 'meetingSeconds',
                name: 'Meeting Seconds',
                description: 'Maximum number of seconds that players have to vote for Kira suspect before round times out',
                bin: BINS.GAMEPLAY,
                type: 'range',
                min: 30,
                max: 240,
                step: 15,
                defaultValue: 150,
                isAdvanced: false,
                canHide: true,
                relevancyFunction: (value) => {
                    // Custom curve for meeting seconds
                    return 0.5 * (60 / value) + 0.004 * (value - 150);
                }
            },
            {
                id: 'numberOfInputs',
                name: 'Number of Inputs',
                description: 'Number of inputs (keyboard or controller) that investigators must supply to complete a task',
                bin: BINS.GAMEPLAY,
                type: 'range',
                min: 1,
                max: 5,
                step: 1,
                defaultValue: 2,
                isAdvanced: false,
                canHide: true,
                relevancyFunction: (value) => {
                    // U-shaped curve centered at 3
                    return Math.min(1.0, 0.5 * Math.pow(Math.abs(value - 3), 2));
                }
            },
            {
                id: 'numberOfTasks',
                name: 'Number of Tasks',
                description: 'Number of tasks for investigators to perform per day or night period',
                bin: BINS.GAMEPLAY,
                type: 'range',
                min: 1,
                max: 8,
                step: 1,
                defaultValue: 2,
                isAdvanced: false,
                canHide: true,
                relevancyFunction: (value, settings) => {
                    try {
                        const idealTaskCount = Settings.calculateIdealTaskCount(settings);
                        // Higher relevancy as we deviate from ideal
                        return Math.min(0.7, 0.7 * Math.pow(Math.abs(value - idealTaskCount.ideal), 2));
                    } catch (e) {
                        console.error("Error calculating ideal task count for relevancy:", e);
                        return 0.5; // Default if calculation fails
                    }
                }
            },
            {
                id: 'canvasTasks',
                name: 'Canvas Tasks',
                description: 'If enabled, Team Kira can perform canvas tasks, interacting with NPCs to gather intelligence and blend in as investigators',
                bin: BINS.GAMEPLAY,
                type: 'boolean',
                defaultValue: true,
                isAdvanced: false,
                canHide: true,
                relevancyFunction: (value) => {
                    return value ? 0.1 : 1.0; // Only highlight when disabled (which is bad)
                }
            },
            {
                id: 'kiraProgressMultiplier',
                name: 'Kira Progress Multiplier',
                description: 'Multiplier for Team Kira\'s New World Progress per criminal judged (killed)',
                bin: BINS.GAMEPLAY,
                type: 'range',
                min: 0.6,
                max: 2.0,
                step: 0.1,
                defaultValue: 1.0,
                isAdvanced: true,
                canHide: true,
                relevancyFunction: (value) => {
                    // Default not shown; extreme values highlighted
                    if (value === 1.0) return 0.0;
                    if (value <= 0.7 || value >= 1.4) return 1.0;
                    return 0.4; // Slight deviation
                }
            },
            {
                id: 'teamLProgressMultiplier',
                name: 'Team L Progress Multiplier',
                description: 'Multiplier for Team L\'s Investigation Progress per task completed or clue gathered',
                bin: BINS.GAMEPLAY,
                type: 'range',
                min: 0.6,
                max: 2.0,
                step: 0.1,
                defaultValue: 1.0,
                isAdvanced: true,
                canHide: true,
                relevancyFunction: (value) => {
                    // Default not shown; extreme values highlighted
                    if (value === 1.0) return 0.0;
                    if (value <= 0.7 || value >= 1.4) return 1.0;
                    return 0.4; // Slight deviation
                }
            },
            {
                id: 'maximumCriminalJudgments',
                name: 'Maximum Criminal Judgments',
                description: 'The maximum number of criminals Kira can judge (kill) per round, contributing to New World Progress',
                bin: BINS.GAMEPLAY,
                type: 'range',
                min: 5,
                max: 8,
                step: 1,
                defaultValue: 5,
                isAdvanced: false,
                canHide: true,
                relevancyFunction: (value) => {
                    return value === 5 ? 0.1 : 0.7; // Highlight non-default values
                }
            },
            {
                id: 'approachWarning',
                name: 'Approach Warning',
                description: 'If enabled, players receive warnings when another player is approaching',
                bin: BINS.PLAYER,
                type: 'boolean',
                defaultValue: true,
                isAdvanced: false,
                canHide: true,
                relevancyFunction: (value) => {
                    return value ? 0.1 : 0.7; // Only highlight when disabled
                }
            },
            {
                id: 'allowedPlayerType',
                name: 'Allowed Player Types',
                description: 'Types of players allowed in the lobby',
                bin: BINS.LOBBY,
                type: 'checkbox-group',
                options: [
                    { id: 'pcAllowed', label: 'PC Players', defaultValue: true },
                    { id: 'ps4Allowed', label: 'Console Players', defaultValue: true }
                ],
                isAdvanced: false,
                canHide: true
            }
        ],

        /**
         * Initialize the settings module
         */
        initialize: function() {
            if (this.initialized) {
                console.log('Settings already initialized');
                return;
            }

            console.log('Initializing settings module');

            // Initialize settings store with default values
            this._initializeSettings();

            // Set up hash update listeners
            this._setupHashUpdateListeners();

            // Set up visibility sync listeners
            this._setupVisibilitySyncListeners();

            this.initialized = true;
            console.log('Settings module initialized');
        },

        /**
         * Calculate ideal task count based on current settings
         * @param {Object} [settingsOverride] - Optional settings to use instead of current
         * @returns {Object} Object with easy, hard, and ideal task counts
         */
        calculateIdealTaskCount: function(settingsOverride) {
            const settings = settingsOverride || this.settings;
            const R = this.getValue('dayNightSeconds', 45, settings);
            const S = this.getValue('movementSpeed', 1.0, settings);
            const I = this.getValue('numberOfInputs', 2, settings);

            // Task completion time depends on number of inputs
            const T_task = I <= 3 ? 3 : 5;

            // Effective round time with Kira's extensions
            const T_effective = 1.533 * R + 16;

            // Easy and hard task counts
            const T_easy = T_effective * 0.5 * 0.8 / (12.5 / S + T_task);
            const T_hard = T_effective * 0.9 / (12.5 / S + T_task);

            // Ideal task count is halfway between easy and hard
            const T_ideal = Math.ceil((T_easy + T_hard) / 2);

            return {
                easy: T_easy,
                hard: T_hard,
                ideal: T_ideal
            };
        },

        /**
         * Process any special setting groups like checkboxes
         * @param {Object} settingsByBin - Settings organized by bin
         */
        processSpecialSettingGroups: function(settingsByBin) {
            // Handle checkbox groups (currently just allowedPlayerType)
            const pcAllowed = this.getValue('pcAllowed', true);
            const ps4Allowed = this.getValue('ps4Allowed', true);

            // Only add if either is not the default
            if (!pcAllowed || !ps4Allowed) {
                const allowedPlayersRelevancy = (!pcAllowed || !ps4Allowed) ? 0.8 : 0.1;

                // Create a combined player type setting
                let playerTypeValue = '';
                if (pcAllowed && ps4Allowed) {
                    playerTypeValue = 'All Platforms';
                } else if (pcAllowed) {
                    playerTypeValue = 'PC Only';
                } else if (ps4Allowed) {
                    playerTypeValue = 'Console Only';
                } else {
                    playerTypeValue = 'None (Empty Lobby)';
                }

                settingsByBin[this.BINS.LOBBY].push({
                    id: 'allowedPlayerType',
                    name: 'Allowed Players',
                    value: playerTypeValue,
                    relevancyScore: allowedPlayersRelevancy
                });
            }
        },

        /**
         * Get all settings
         * @returns {Object} Current settings data
         */
        getAllSettings: function() {
            return this.settings;
        },

        /**
         * Get a setting definition by ID
         * @param {string} id - Setting ID
         * @returns {Object|null} Setting definition or null if not found
         */
        getDefinition: function(id) {
            return this.settingsDefinitions.find(def => def.id === id) || null;
        },

        /**
         * Get all setting definitions
         * @returns {Array} Array of setting definitions
         */
        getAllDefinitions: function() {
            return this.settingsDefinitions;
        },

        /**
         * Get a setting's value with optional fallback to default
         * @param {string} id - Setting ID
         * @param {*} defaultValue - Fallback value if setting not found
         * @param {Object} [settingsOverride] - Optional settings object to use instead of this.settings
         * @returns {*} Setting value or default
         */
        getValue: function(id, defaultValue, settingsOverride) {
            const settingsObj = settingsOverride || this.settings;

            if (settingsObj[id] && settingsObj[id].value !== undefined) {
                return settingsObj[id].value;
            }

            // If not found, try to get default from definition
            const definition = this.getDefinition(id);
            if (definition && definition.defaultValue !== undefined) {
                return definition.defaultValue;
            }

            return defaultValue;
        },

        /**
         * Get a setting's display value (formatted for output)
         * @param {Object} definition - Setting definition
         * @returns {string} Formatted display value
         */
        getSettingDisplayValue: function(definition) {
            const value = this.getValue(definition.id, definition.defaultValue);

            // Format based on type
            switch (definition.type) {
                case 'boolean':
                    return value ? 'Enabled' : 'Disabled';

                case 'radio':
                    // Find the label for the current value
                    const option = definition.options.find(opt => opt.value === value);
                    return option ? option.label : value;

                default:
                    return value;
            }
        },

        /**
         * Update a setting's value
         * @param {string} id - Setting ID
         * @param {*} value - New value
         * @param {boolean} [skipEvent=false] - Whether to skip change event
         */
        updateSetting: function(id, value, skipEvent = false) {
            // Debugging
            console.log(`Updating setting: ${id} = ${value}`);
            console.log('Current settings:', this.settings);

            // Get definition to determine if this is a valid setting
            const definition = this.getDefinition(id);

            // Special case for checkbox group children
            if (!definition && id.includes('Allowed')) {
                // These are handled separately
                if (!this.settings[id]) {
                    this.settings[id] = { value: value };
                } else {
                    this.settings[id].value = value;
                }

                // Clear manual visibility override
                if (this.settings[id].manuallySet) {
                    delete this.settings[id].manuallySet;
                }

                this.updateRelevancyScores();

                if (!skipEvent) {
                    document.dispatchEvent(new CustomEvent('deathNote:settings:changed'));
                }

                return;
            }

            if (!definition) {
                console.warn(`Attempted to update unknown setting: ${id}`);
                return;
            }

            // Initialize if not exists
            if (!this.settings[id]) {
                this.settings[id] = {};
            }

            // Update value
            this.settings[id].value = value;

            // Clear manual visibility override if value changed
            if (this.settings[id].manuallySet) {
                delete this.settings[id].manuallySet;
            }

            // Recalculate relevancy scores
            this.updateRelevancyScores();

            // Update URL hash
            if (!skipEvent) {
                const hashManager = DeathNote.utils.hashManager;
                if (hashManager) {
                    hashManager.updateUrlHash();
                }

                document.dispatchEvent(new CustomEvent('deathNote:settings:changed'));
            }
        },

        /**
         * Update a setting's visibility
         * @param {string} id - Setting ID
         * @param {boolean} visible - Whether the setting should be visible
         */
        updateSettingVisibility: function(id, visible) {
            console.log(`Setting visibility for ${id} to ${visible}`);

            if (!this.settings[id]) {
                this.settings[id] = {};
            }

            // Update visibility flag with explicit boolean value
            this.settings[id].visible = Boolean(visible);

            // Mark as manually set so it won't be overridden by relevancy calculations
            this.settings[id].manuallySet = true;

            // Dispatch event to notify UI of visibility change
            document.dispatchEvent(new CustomEvent('deathNote:settings:visibilityChanged', {
                detail: {
                    id: id,
                    visible: visible
                }
            }));
        },

        /**
         * Reset a setting to its default value
         * @param {string} id - Setting ID
         */
        resetSetting: function(id) {
            const definition = this.getDefinition(id);
            if (!definition) {
                console.warn(`Attempted to reset unknown setting: ${id}`);
                return;
            }

            // Reset to default value
            if (!this.settings[id]) {
                this.settings[id] = {};
            }

            this.settings[id].value = definition.defaultValue;

            // Clear manual visibility setting
            delete this.settings[id].manuallySet;

            // Recalculate relevancy
            this.updateRelevancyScores();

            // Update hash and notify UI
            const hashManager = DeathNote.utils.hashManager;
            if (hashManager) {
                hashManager.updateUrlHash();
            }

            document.dispatchEvent(new CustomEvent('deathNote:settings:changed'));
        },

        /**
         * Reset all settings to their default values
         */
        resetAllSettings: function() {
            // Reset all settings to defaults
            this._initializeSettings();

            // Update hash and notify UI
            const hashManager = DeathNote.utils.hashManager;
            if (hashManager) {
                hashManager.updateUrlHash();
            }

            document.dispatchEvent(new CustomEvent('deathNote:settings:changed'));
        },

        /**
         * Reset a setting's visibility to default
         * @param {string} id - Setting ID to reset
         */
        resetSettingVisibility: function(id) {
            if (!this.settings[id]) {
                return;
            }

            // Clear manual visibility setting
            delete this.settings[id].manuallySet;

            // Recalculate relevancy score
            this.updateRelevancyScores();

            // Dispatch event to notify UI of visibility change
            document.dispatchEvent(new CustomEvent('deathNote:settings:visibilityChanged', {
                detail: {
                    id: id,
                    visible: this.settings[id].visible
                }
            }));
        },

        /**
         * Reset visibility settings for all settings
         */
        resetAllVisibility: function() {
            // Get all settings
            const definitions = this.getAllDefinitions();

            // Clear all manual visibility flags
            definitions.forEach(def => {
                const id = def.id;
                if (this.settings[id] && this.settings[id].manuallySet) {
                    delete this.settings[id].manuallySet;
                }
            });

            // Update relevancy scores to recalculate default visibility
            this.updateRelevancyScores();

            // Notify UI of all visibility changes
            document.dispatchEvent(new CustomEvent('deathNote:settings:changed'));
        },

        /**
         * Update relevancy scores for all settings
         */
        updateRelevancyScores: function() {
            // Calculate relevancy scores for each setting
            this.settingsDefinitions.forEach(definition => {
                const settingId = definition.id;
                if (!this.settings[settingId]) {
                    this.settings[settingId] = {};
                }

                // Skip updating visibility if manually set
                const isManuallySet = this.settings[settingId].manuallySet === true;

                // Get current value
                const value = this.getValue(settingId, definition.defaultValue);

                // Calculate relevancy score if function provided
                if (definition.relevancyFunction && typeof definition.relevancyFunction === 'function') {
                    try {
                        const relevancyScore = definition.relevancyFunction(value, this.settings);
                        this.settings[settingId].relevancyScore = relevancyScore;

                        // If not manually set, update visibility based on relevancy and threshold
                        if (!isManuallySet) {
                            // Calculate dynamic threshold based on non-default count
                            let nonDefaultCount = 0;
                            this.settingsDefinitions.forEach(def => {
                                const defValue = this.getValue(def.id, def.defaultValue);
                                if (defValue !== def.defaultValue) {
                                    nonDefaultCount++;
                                }
                            });

                            const threshold = Math.min(0.6, 0.08 * nonDefaultCount + 0.2);
                            const shouldBeVisible = relevancyScore > threshold;

                            // Update visibility flag
                            this.settings[settingId].visible = shouldBeVisible;
                        }
                    } catch (error) {
                        console.error(`Error calculating relevancy for ${settingId}:`, error);
                        this.settings[settingId].relevancyScore = 0.5; // Default
                    }
                } else {
                    // Default relevancy
                    this.settings[settingId].relevancyScore = 0.5;
                }
            });

            // After updating all relevancy scores and visibility, sync the UI
            this._syncVisibilityWithUI();
        },

        _syncVisibilityWithUI: function() {
            // For each setting, trigger a visibility change event so UI can update
            this.settingsDefinitions.forEach(definition => {
                const settingId = definition.id;
                if (this.settings[settingId] && this.settings[settingId].visible !== undefined) {
                    document.dispatchEvent(new CustomEvent('deathNote:settings:visibilityChanged', {
                        detail: {
                            id: settingId,
                            visible: this.settings[settingId].visible
                        }
                    }));
                }
            });
        },

        /**
         * Apply visibility rules to determine if a setting should be shown
         * @param {Object} definition - Setting definition
         * @param {boolean} defaultVisibility - Default visibility if no rules apply
         * @returns {boolean} Whether the setting should be visible
         */
        applySettingVisibilityRules: function(definition, defaultVisibility) {
            // Critical settings that can't be hidden are always visible
            if (!definition.canHide) {
                return true;
            }

            // If this setting has a specific visibility rule defined, call it
            if (definition.visibilityRule && typeof definition.visibilityRule === 'function') {
                try {
                    return definition.visibilityRule(this.getValue(definition.id), this.settings);
                } catch (error) {
                    console.error(`Error applying visibility rule for ${definition.id}:`, error);
                }
            }

            // If no rules apply, return the default visibility
            return defaultVisibility === undefined ? true : Boolean(defaultVisibility);
        },

        /**
         * Sync visibility checkbox with visibility state
         * @param {string} settingId - Setting ID
         */
        syncVisibilityCheckbox: function(settingId) {
            const definition = this.getDefinition(settingId);
            if (!definition) return;

            const settingData = this.settings[settingId];
            if (!settingData) return;

            // Dispatch custom event for UI to handle
            document.dispatchEvent(new CustomEvent('deathNote:settings:visibilityChanged', {
                detail: {
                    id: settingId,
                    visible: settingData.visible
                }
            }));
        },

        /**
         * Load settings from URL hash
         * @returns {boolean} True if settings were loaded successfully
         */
        loadSettingsFromHash: function() {
            const hashManager = DeathNote.utils.hashManager;
            if (!hashManager) {
                console.error('Hash manager not available');
                return false;
            }

            return hashManager.loadFromHash();
        },

        // Private methods

        /**
         * Initialize settings with default values
         * @private
         */
        _initializeSettings: function() {
            // Start with empty settings object
            this.settings = {};

            // Initialize each setting with its default value
            this.settingsDefinitions.forEach(definition => {
                const settingId = definition.id;

                this.settings[settingId] = {
                    value: definition.defaultValue,
                    visible: !definition.isAdvanced, // Advanced settings are hidden by default
                    relevancyScore: 0.5 // Default relevancy
                };

                // Special handling for checkbox groups
                if (definition.type === 'checkbox-group') {
                    definition.options.forEach(option => {
                        this.settings[option.id] = {
                            value: option.defaultValue,
                            visible: !definition.isAdvanced,
                            relevancyScore: 0.5
                        };
                    });
                }
            });

            // Calculate initial relevancy scores
            this.updateRelevancyScores();
        },

        /**
         * Set up listeners for hash updates
         * @private
         */
        _setupHashUpdateListeners: function() {
            // Listen for settings changes to update hash
            document.addEventListener('deathNote:settings:changed', () => {
                const hashManager = DeathNote.utils.hashManager;
                if (hashManager) {
                    hashManager.updateUrlHash();
                }
            });
        },

        /**
         * Set up listeners for visibility sync
         * @private
         */
        _setupVisibilitySyncListeners: function() {
            // Listen for visibility changes
            document.addEventListener('deathNote:settings:visibilityRequested', (event) => {
                if (event.detail && event.detail.id) {
                    this.syncVisibilityCheckbox(event.detail.id);
                }
            });
        }
    };

    // Register with the application
    document.addEventListener('DOMContentLoaded', function() {
        DeathNote.registerModule('settings', Settings);
    });

})();