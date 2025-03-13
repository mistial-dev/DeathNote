/**
 * Death Note: Killer Within - Settings Model
 * Manages setting definitions, values, and relevancy calculations
 */

(function() {
    'use strict';

    // Constants
    const BINS = {
        LOBBY: "Lobby Settings",
        PLAYER: "Player",
        GAMEPLAY: "Gameplay"
    };

    const VISIBILITY_RULES = {
        ALWAYS_HIDE_DEFAULT_MOVEMENT_SPEED: true,
        ALWAYS_HIDE_DEFAULT_MAX_PLAYERS: true,
        ALWAYS_HIDE_DISABLED_BLACK_NOTEBOOKS: true,
        HIDE_DEFAULT_ROLE_SETTINGS: true,
        HIDE_ENABLED_VOICE_CHAT: true,
        HIDE_ENABLED_CANVAS_TASKS: true,
        HIDE_DEFAULT_PROGRESS_MULTIPLIERS: true,
        HIDE_DEFAULT_DAY_NIGHT_SECONDS: true,
        HIDE_DEFAULT_REGION: false,
        HIDE_ENABLED_APPROACH_WARNING: true,
        CAPITALIZE_FALSE_ROLE_SELECTION: true
    };

    // Settings module definition
    const SettingsModel = {
        // Public properties
        BINS: BINS,
        VISIBILITY_RULES: VISIBILITY_RULES,

        // Credit line for output
        get creditLine() {
            return `[DeathNote Discord Post Maker ${DeathNote.version}](${DeathNote.toolUrl})`;
        },

        // Private properties, exposed through getters
        _settings: {},
        _definitions: null,

        /**
         * Initialize the settings module
         */
        initialize: function() {
            // Initialize settings definitions
            this._definitions = this._createSettingsDefinitions();

            // Initialize settings values
            this.resetAllSettings();

            console.log('Settings module initialized');
        },

        /**
         * Reset all settings to their default values
         */
        resetAllSettings: function() {
            this._settings = {};

            // Initialize all settings with default values
            this._definitions.forEach(def => {
                this._settings[def.id] = {
                    value: def.defaultValue,
                    relevancyScore: 0,
                    visible: !def.isAdvanced,
                    manuallySet: false
                };

                // For checkbox groups, initialize each option
                if (def.type === 'checkbox-group' && Array.isArray(def.options)) {
                    def.options.forEach(option => {
                        this._settings[option.id] = {
                            value: option.defaultValue,
                            relevancyScore: 0,
                            visible: !def.isAdvanced,
                            manuallySet: false
                        };
                    });
                }
            });

            // Calculate initial relevancy scores
            this.updateRelevancyScores();
        },

        /**
         * Reset a specific setting to its default value
         * @param {string} settingId - ID of the setting to reset
         */
        resetSetting: function(settingId) {
            const def = this.getDefinition(settingId);
            if (!def) {
                console.warn(`Setting '${settingId}' not found`);
                return;
            }

            // Reset the setting value
            this._settings[settingId].value = def.defaultValue;
            this._settings[settingId].manuallySet = false;

            // For checkbox groups, reset each option
            if (def.type === 'checkbox-group' && Array.isArray(def.options)) {
                def.options.forEach(option => {
                    if (this._settings[option.id]) {
                        this._settings[option.id].value = option.defaultValue;
                        this._settings[option.id].manuallySet = false;
                    }
                });
            }

            this.updateRelevancyScores();
        },

        /**
         * Update a setting's value
         * @param {string} settingId - ID of the setting to update
         * @param {*} value - New value for the setting
         */
        updateSetting: function(settingId, value) {
            if (!this._settings[settingId]) {
                console.warn(`Cannot update unknown setting: ${settingId}`);
                return;
            }

            this._settings[settingId].value = value;
            this._settings[settingId].manuallySet = false;
            this.updateRelevancyScores();
        },

        /**
         * Update a setting's visibility
         * @param {string} settingId - ID of the setting to update
         * @param {boolean} visible - Whether the setting should be visible
         */
        updateSettingVisibility: function(settingId, visible) {
            if (!this._settings[settingId]) {
                console.warn(`Cannot update unknown setting: ${settingId}`);
                return;
            }

            this._settings[settingId].visible = visible;
            this._settings[settingId].manuallySet = true;
        },

        /**
         * Get the current value of a setting
         * @param {string} settingId - ID of the setting
         * @param {*} defaultValue - Default value to return if setting not found
         * @returns {*} The setting value or defaultValue if not found
         */
        getValue: function(settingId, defaultValue) {
            return this._settings[settingId]?.value ?? defaultValue;
        },

        /**
         * Get a setting definition by ID
         * @param {string} settingId - ID of the setting
         * @returns {Object|null} Setting definition or null if not found
         */
        getDefinition: function(settingId) {
            return this._definitions.find(def => def.id === settingId) || null;
        },

        /**
         * Get all setting definitions
         * @returns {Array} Array of setting definitions
         */
        getAllDefinitions: function() {
            return this._definitions.slice();
        },

        /**
         * Get all current settings values
         * @returns {Object} Copy of current settings
         */
        getAllSettings: function() {
            return JSON.parse(JSON.stringify(this._settings));
        },

        /**
         * Calculate ideal task count based on other settings
         * @returns {Object} Object with easy, hard, and ideal task counts
         */
        calculateIdealTaskCount: function() {
            try {
                // Extract values from settings
                const roundTime = this.getValue('dayNightSeconds', 45);
                const movementSpeed = this.getValue('movementSpeed', 1.0);
                const inputCount = this.getValue('numberOfInputs', 2);

                // Formula constants from spec
                const taskTime = inputCount <= 3 ? 3 : 5;

                // Calculate effective time, accounting for Kira's extensions
                const effectiveTime = 1.533 * roundTime + 16;

                // Calculate easy and hard task counts
                const easyTaskCount = effectiveTime * 0.5 * 0.8 / (12.5 / movementSpeed + taskTime);
                const hardTaskCount = effectiveTime * 0.8 / (12.5 / movementSpeed + taskTime);

                // Calculate ideal task count (average of easy and hard, rounded up)
                const idealTaskCount = Math.ceil((easyTaskCount + hardTaskCount) / 2);

                return {
                    easy: easyTaskCount,
                    hard: hardTaskCount,
                    ideal: idealTaskCount
                };
            } catch (error) {
                console.error('Error calculating ideal task count:', error);
                return { easy: 2, hard: 4, ideal: 3 };
            }
        },

        /**
         * Update relevancy scores for all settings
         */
        updateRelevancyScores: function() {
            this._definitions.forEach(def => {
                // Skip if manually set by checkbox
                if (this._settings[def.id]?.manuallySet) {
                    return;
                }

                // For checkbox-group, process each child option
                if (def.type === 'checkbox-group') {
                    // Make sure each option setting exists before accessing it
                    def.options.forEach(option => {
                        // Create the setting if it doesn't exist yet
                        if (!this._settings[option.id]) {
                            this._settings[option.id] = {
                                value: option.defaultValue,
                                relevancyScore: 0,
                                visible: !def.isAdvanced,
                                manuallySet: false
                            };
                        }
                    });

                    const relevancyScore = def.relevancyFunction(null, this._settings);

                    // Set relevancy for the group
                    def.options.forEach(option => {
                        if (!this._settings[option.id].manuallySet) {
                            this._settings[option.id].relevancyScore = relevancyScore;
                            this._settings[option.id].visible = relevancyScore > 0.3;
                        }
                    });
                } else {
                    // Calculate the relevancy score using the definition's function
                    const relevancyScore = def.relevancyFunction(
                        this._settings[def.id].value,
                        this._settings
                    );

                    // Update the score
                    this._settings[def.id].relevancyScore = relevancyScore;

                    // Update visibility based on relevancy if not manually set
                    if (!this._settings[def.id].manuallySet) {
                        this._settings[def.id].visible = relevancyScore > 0.3;
                    }
                }
            });

            // Apply special case adjustments
            this._applySpecialCaseRelevancy();

            // Emit a change event that UI can listen for
            document.dispatchEvent(new CustomEvent('settings:changed'));
        },

        /**
         * Apply setting visibility rules
         * @param {Object} definition - Setting definition
         * @param {boolean} isVisible - Current visibility state
         * @returns {boolean} New visibility state
         */
        applySettingVisibilityRules: function(definition, isVisible) {
            if (!definition) return isVisible;

            const settings = this._settings;

            // Always hide movement speed at default value
            if (VISIBILITY_RULES.ALWAYS_HIDE_DEFAULT_MOVEMENT_SPEED &&
                definition.id === "movementSpeed" &&
                settings[definition.id].value === 1.0) {
                return false;
            }

            // Always hide maximum players at default value
            if (VISIBILITY_RULES.ALWAYS_HIDE_DEFAULT_MAX_PLAYERS &&
                definition.id === "maximumPlayers" &&
                settings[definition.id].value === 10) {
                return false;
            }

            // Always hide black notebooks when disabled
            if (VISIBILITY_RULES.ALWAYS_HIDE_DISABLED_BLACK_NOTEBOOKS &&
                definition.id === "haveBlackNotebooks" &&
                !settings[definition.id].value) {
                return false;
            }

            // Hide default role settings
            if (VISIBILITY_RULES.HIDE_DEFAULT_ROLE_SETTINGS &&
                (definition.id === "melloRole" || definition.id === "kiraFollowerRole") &&
                settings[definition.id].value === "1") {
                return false;
            }

            // Hide voice chat when enabled (default)
            if (VISIBILITY_RULES.HIDE_ENABLED_VOICE_CHAT &&
                definition.id === "voiceChat" &&
                settings[definition.id].value === true) {
                return false;
            }

            // Hide canvas tasks when enabled (default)
            if (VISIBILITY_RULES.HIDE_ENABLED_CANVAS_TASKS &&
                definition.id === "canvasTasks" &&
                settings[definition.id].value === true) {
                return false;
            }

            // Hide approach warning when enabled (default)
            if (VISIBILITY_RULES.HIDE_ENABLED_APPROACH_WARNING &&
                definition.id === "approachWarning" &&
                settings[definition.id].value === true) {
                return false;
            }

            // Hide progress multipliers at default value
            if (VISIBILITY_RULES.HIDE_DEFAULT_PROGRESS_MULTIPLIERS &&
                (definition.id === "kiraProgressMultiplier" || definition.id === "teamLProgressMultiplier") &&
                settings[definition.id].value === 1.0) {
                return false;
            }

            // Hide day/night seconds at default unless otherwise specified
            if (VISIBILITY_RULES.HIDE_DEFAULT_DAY_NIGHT_SECONDS &&
                definition.id === "dayNightSeconds" &&
                settings[definition.id].value === 45 &&
                settings[definition.id].relevancyScore < 0.4) {
                return false;
            }

            // Hide default region - changed to false in constants, this rule is disabled now
            if (VISIBILITY_RULES.HIDE_DEFAULT_REGION &&
                definition.id === "lobbyRegion" &&
                settings[definition.id].value === "America (East)") {
                return false;
            }

            return isVisible;
        },

        /**
         * Get formatted display value for a setting
         * @param {Object} definition - Setting definition
         * @returns {string} Formatted display value
         */
        getSettingDisplayValue: function(definition) {
            if (!definition) return '';

            const settings = this._settings;

            // Special case for Role Selection to capitalize FALSE
            if (VISIBILITY_RULES.CAPITALIZE_FALSE_ROLE_SELECTION &&
                definition.id === "roleSelection" &&
                settings[definition.id].value === false) {
                return "FALSE";
            }

            return settings[definition.id].value;
        },

        /**
         * Process special setting groups for output
         * @param {Object} settingsByBin - Settings organized by bin
         */
        processSpecialSettingGroups: function(settingsByBin) {
            // Handle special case for Allowed Player Type
            const allowedPlayerType = this.getDefinition("allowedPlayerType");
            if (allowedPlayerType) {
                const pcAllowed = this.getValue("pcAllowed", true);
                const ps4Allowed = this.getValue("ps4Allowed", true);

                // Only show if not all platforms are allowed (i.e., if any platform is disabled)
                if (!(pcAllowed && ps4Allowed)) {
                    let platformText = "";
                    if (pcAllowed && !ps4Allowed) {
                        platformText = "PC Only";
                    } else if (!pcAllowed && ps4Allowed) {
                        platformText = "PS4 Only";
                    } else if (!pcAllowed && !ps4Allowed) {
                        platformText = "None (Lobby Empty)";
                    }

                    settingsByBin[allowedPlayerType.bin].push({
                        id: "allowedPlayerType",
                        name: "Allowed Player Type",
                        value: platformText,
                        relevancyScore: 1.0 // Always high relevancy when restricted
                    });
                }
            }
        },

        // Private methods

        /**
         * Apply special case adjustments to relevancy scores
         * @private
         */
        _applySpecialCaseRelevancy: function() {
            // Special case: make Number of Inputs = 2 less likely to show up when other settings change
            if (this.getValue('numberOfInputs', 2) === 2) {
                // Count non-default settings as a way to measure "interesting" configurations
                let nonDefaultCount = 0;
                this._definitions.forEach(definition => {
                    if (this._settings[definition.id]?.value !== definition.defaultValue &&
                        definition.id !== "numberOfInputs") {
                        nonDefaultCount++;
                    }
                });

                // Reduce relevancy based on how many other non-default settings exist
                if (nonDefaultCount > 2) {
                    const currentScore = this._settings.numberOfInputs.relevancyScore;
                    const adjustedScore = Math.max(0.05, currentScore - 0.1 * nonDefaultCount);

                    this._settings.numberOfInputs.relevancyScore = adjustedScore;

                    // Update visibility based on new relevancy score
                    if (!this._settings.numberOfInputs.manuallySet) {
                        this._settings.numberOfInputs.visible = adjustedScore > 0.3;
                    }
                }
            }
        },

        /**
         * Create settings definitions
         * @private
         * @returns {Array} Array of setting definitions
         */
        _createSettingsDefinitions: function() {
            return [
                // Lobby Settings
                {
                    id: "lobbyCode",
                    name: "Lobby Code",
                    description: "Code for players to join the lobby",
                    bin: BINS.LOBBY,
                    type: "text",
                    pattern: "[A-Za-z0-9]{5}",
                    placeholder: "5-character code (e.g., ABC12)",
                    defaultValue: "",
                    required: true,
                    relevancyFunction: () => 0.7, // Always show as critical
                    canHide: false, // Cannot be hidden
                    isAdvanced: false,
                    maxLength: 5 // Added to enforce 5-character limit
                },
                {
                    id: "lobbyRegion",
                    name: "Lobby Region",
                    description: "Server region for the lobby",
                    bin: BINS.LOBBY,
                    type: "select",
                    options: ["America (East)", "America (West)", "Europe", "Asia 1", "Asia 2", "South America"],
                    defaultValue: "America (East)",
                    relevancyFunction: (value) => value === "America (East)" ? 0.3 : 0.8, // Highlight non-default regions
                    canHide: true,
                    isAdvanced: false
                },
                {
                    id: "lobbyPrivacy",
                    name: "Lobby Privacy",
                    description: "Privacy settings for the lobby",
                    bin: BINS.LOBBY,
                    type: "select",
                    options: ["Public", "Private", "Private, then Public"],
                    defaultValue: "Public",
                    relevancyFunction: () => 0.7, // Always important
                    canHide: true,
                    isAdvanced: false
                },
                {
                    id: "roleSelection",
                    name: "Role Selection",
                    description: "If enabled, players can select a role prior to game start",
                    bin: BINS.LOBBY,
                    type: "boolean",
                    defaultValue: true,
                    relevancyFunction: () => 0.7, // Always important
                    canHide: false, // Always shown
                    isAdvanced: false
                },
                {
                    id: "allowedPlayerType",
                    name: "Allowed Player Type",
                    description: "Which platforms are allowed to join the lobby",
                    bin: BINS.LOBBY,
                    type: "checkbox-group",
                    options: [
                        {id: "pcAllowed", label: "PC", defaultValue: true},
                        {id: "ps4Allowed", label: "PS4", defaultValue: true}
                    ],
                    relevancyFunction: (value, allSettings) => {
                        // High relevancy if either platform is disabled
                        if (!allSettings.pcAllowed?.value || !allSettings.ps4Allowed?.value) {
                            return 1.0;
                        }
                        return 0.3;
                    },
                    canHide: true,
                    isAdvanced: true
                },
                {
                    id: "voiceChat",
                    name: "Voice Chat",
                    description: "If enabled, players are permitted to use voice chat",
                    bin: BINS.LOBBY,
                    type: "boolean",
                    defaultValue: true,
                    relevancyFunction: (value) => value ? 0.1 : 0.7, // Only highlight when disabled
                    canHide: true,
                    isAdvanced: true
                },
                {
                    id: "approachWarning",
                    name: "Approach Warning",
                    description: "If enabled, players will receive a warning when another player approaches",
                    bin: BINS.LOBBY,
                    type: "boolean",
                    defaultValue: true,
                    relevancyFunction: (value) => value ? 0.1 : 0.8, // High relevancy when disabled
                    canHide: true,
                    isAdvanced: false
                },

                // Player Settings
                {
                    id: "melloRole",
                    name: "Available Roles (Mello)",
                    description: "Number of players permitted to assume the Mello role",
                    bin: BINS.PLAYER,
                    type: "radio",
                    options: [
                        {value: "0", label: "0 (Disabled)"},
                        {value: "1", label: "1"},
                        {value: "random", label: "Random"}
                    ],
                    defaultValue: "1",
                    relevancyFunction: (value) => {
                        if (value === "0") return 1.0; // Extremely relevant when disabled
                        if (value === "1") return 0.1; // Default, not shown
                        if (value === "random") return 0.7; // Relevant when random
                        return 0.5; // Default fallback
                    },
                    canHide: true,
                    isAdvanced: false
                },
                {
                    id: "kiraFollowerRole",
                    name: "Available Roles (Kira Follower)",
                    description: "Number of players permitted to assume the Kira Follower role",
                    bin: BINS.PLAYER,
                    type: "radio",
                    options: [
                        {value: "0", label: "0 (Disabled)"},
                        {value: "1", label: "1"},
                        {value: "random", label: "Random"}
                    ],
                    defaultValue: "1",
                    relevancyFunction: (value) => {
                        if (value === "0") return 1.0; // Extremely relevant when disabled
                        if (value === "1") return 0.1; // Default, not shown
                        if (value === "random") return 0.7; // Relevant when random
                        return 0.5; // Default fallback
                    },
                    canHide: true,
                    isAdvanced: false
                },
                {
                    id: "movementSpeed",
                    name: "Movement Speed",
                    description: "Speed multiplier for player movement",
                    bin: BINS.PLAYER,
                    type: "range",
                    min: 0.5,
                    max: 1.5,
                    step: 0.1,
                    defaultValue: 1.0, // Lower speeds are very disliked, as are very high speeds
                    relevancyFunction: (value) => {
                        if (value === 1.0) return 0.0; // Never show default value
                        // Formula: Clamp(2.857 * Math.abs(x - 1.05), 0, 1)
                        return Math.min(1.0, Math.max(0.0, 2.857 * Math.abs(value - 1.05)));
                    },
                    canHide: true,
                    isAdvanced: true
                },
                {
                    id: "maximumPlayers",
                    name: "Maximum Players",
                    description: "Maximum number of players for the room",
                    bin: BINS.PLAYER,
                    type: "range",
                    min: 4,
                    max: 10,
                    step: 1,
                    defaultValue: 10, // Formula: Clamp(1.6 * 2^(-(x - 5)))
                    relevancyFunction: (value, allSettings) => {
                        if (value === 10) return 0.0; // Never show default value

                        return Math.min(1.0, 1.6 * Math.pow(2, -(value - 5)));
                    },
                    canHide: true,
                    isAdvanced: true
                },

                // Gameplay Settings
                {
                    id: "numberOfTasks",
                    name: "Number of Tasks",
                    description: "Number of tasks for investigators to perform per day/night period",
                    bin: BINS.GAMEPLAY,
                    type: "range",
                    min: 1,
                    max: 8,
                    step: 1,
                    defaultValue: 2, // Formula: Clamp(1.0 * |N - T_ideal|^2, 0, 1)
                    relevancyFunction: (value, allSettings) => {
                        try {
                            const taskCounts = DeathNote.getModule('settings').calculateIdealTaskCount();
                            return Math.min(0.7, Math.max(0.0, 0.7 * Math.pow(Math.abs(value - taskCounts.ideal), 2)));
                        } catch (error) {
                            console.error('Error in relevancy function for numberOfTasks:', error);
                            return 0.5; // Default relevancy on error
                        }
                    },
                    canHide: true,
                    isAdvanced: false
                },
                {
                    id: "numberOfInputs",
                    name: "Number of Inputs",
                    description: "Number of inputs required to complete a task",
                    bin: BINS.GAMEPLAY,
                    type: "range",
                    min: 1,
                    max: 5,
                    step: 1,
                    defaultValue: 2, // Formula: Clamp(0.5 * |x - 3|^2, 0, 1)
                    relevancyFunction: (value) => {
                        return Math.min(1.0, Math.max(0.0, 0.5 * Math.pow(Math.abs(value - 3), 2)));
                    },
                    canHide: true,
                    isAdvanced: false
                },
                {
                    id: "dayNightSeconds",
                    name: "Day/Night Seconds",
                    description: "Number of seconds of gameplay in both day and night sections",
                    bin: BINS.GAMEPLAY,
                    type: "range",
                    min: 30,
                    max: 120,
                    step: 15,
                    defaultValue: 45, // Formula: Clamp(Math.exp(-0.0341 * (x - 30)) + 0.1)
                    relevancyFunction: (value) => {
                        if (value === 45) return 0.2; // Lower relevancy when at default
                        if (value <= 30) return 1.0; // Always show shortest value
                        if (value >= 90) return 0.7; // Show longer values

                        return Math.min(1.0, Math.exp(-0.0341 * (value - 30)) + 0.1);
                    },
                    canHide: true,
                    isAdvanced: false
                },
                {
                    id: "haveBlackNotebooks",
                    name: "[All Players] Have Black Notebooks",
                    description: "If enabled, all players have black notebooks",
                    bin: BINS.GAMEPLAY,
                    type: "boolean",
                    defaultValue: false,
                    relevancyFunction: (value) => value ? 1.0 : 0.0, // Only show when enabled, never show when disabled
                    canHide: true,
                    isAdvanced: false
                },
                {
                    id: "canvasTasks",
                    name: "Canvas Tasks",
                    description: "If enabled, Team Kira can perform canvas tasks and gather intelligence by interacting with NPCs",
                    bin: BINS.GAMEPLAY,
                    type: "boolean",
                    defaultValue: true,
                    relevancyFunction: (value) => value ? 0.1 : 1.0, // Highlight when disabled
                    canHide: true,
                    isAdvanced: false
                },
                {
                    id: "maximumCriminalJudgments",
                    name: "Maximum Criminal Judgments",
                    description: "Maximum number of criminals Kira can judge (kill) per round",
                    bin: BINS.GAMEPLAY,
                    type: "range",
                    min: 5,
                    max: 8,
                    step: 1,
                    defaultValue: 5,
                    relevancyFunction: (value) => value === 5 ? 0.1 : 0.7, // Default is less relevant
                    canHide: true,
                    isAdvanced: false
                },
                {
                    id: "meetingSeconds",
                    name: "Meeting Seconds",
                    description: "Maximum seconds that players have to vote for Kira suspect",
                    bin: BINS.GAMEPLAY,
                    type: "range",
                    min: 30,
                    max: 240,
                    step: 15,
                    defaultValue: 150, // Formula: 0.5 * (60 / x) + 0.004 * (x - 150)
                    relevancyFunction: (value) => {
                        // Lower relevancy for default or near-default values
                        if (value >= 135 && value <= 165) return 0.15;
                        // Higher relevancy for extreme values
                        if (value <= 60 || value >= 210) return 0.8;

                        return 0.5 * (60 / value) + 0.004 * (value - 150);
                    },
                    canHide: true,
                    isAdvanced: false
                },
                {
                    id: "kiraProgressMultiplier",
                    name: "Kira Progress Multiplier (New World Progress)",
                    description: "Multiplier for Team Kira's New World Progress per criminal judged",
                    bin: BINS.GAMEPLAY,
                    type: "range",
                    min: 0.6,
                    max: 2.0,
                    step: 0.1,
                    defaultValue: 1.0,
                    relevancyFunction: (value) => {
                        if (value === 1.0) return 0.0; // Default, not shown
                        if (value <= 0.7 || value >= 1.4) return 1.0; // Extreme values, highly relevant
                        if (value === 0.8 || value === 0.9 || value === 1.1 || value === 1.2) return 0.4; // Moderate changes
                        return 0.5; // Default for other values
                    },
                    canHide: true,
                    isAdvanced: true // Advanced setting
                },
                {
                    id: "teamLProgressMultiplier",
                    name: "Team L Investigation Progress Multiplier",
                    description: "Multiplier for Team L's Investigation Progress per task completed",
                    bin: BINS.GAMEPLAY,
                    type: "range",
                    min: 0.6,
                    max: 2.0,
                    step: 0.1,
                    defaultValue: 1.0,
                    relevancyFunction: (value) => {
                        if (value === 1.0) return 0.0; // Default, not shown
                        if (value <= 0.7 || value >= 1.4) return 1.0; // Extreme values, highly relevant
                        if (value === 0.8 || value === 0.9 || value === 1.1 || value === 1.2) return 0.4; // Moderate changes
                        return 0.5; // Default for other values
                    },
                    canHide: true,
                    isAdvanced: true // Advanced setting
                }
            ];
        }
    };

    // Register the module with the application
    DeathNote.registerModule('settings', SettingsModel);
})();