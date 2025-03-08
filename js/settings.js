/**
 * Settings definitions for Death Note: Killer Within Lobby Settings Generator
 * This file defines all available settings, their default values, and relevancy functions
 */

// Create the DeathNote namespace if it doesn't exist
window.DeathNote = window.DeathNote || {};
window.DeathNote.settings = window.DeathNote.settings || {};

// Constants for the tool
window.DeathNote.settings.version = "v0.1 Alpha";
window.DeathNote.settings.toolUrl = "https://mistial-dev.github.io/DeathNote/";
window.DeathNote.settings.creditLine = `[DeathNote Discord Post Maker ${window.DeathNote.settings.version}](${window.DeathNote.settings.toolUrl})`;

// Min and max output sizes for dynamic thresholding
window.DeathNote.settings.minOutputSize = 3; // Minimum number of settings to show
window.DeathNote.settings.maxOutputSize = 15; // Maximum number of settings to show before applying threshold

// Constants for visibility rules
window.DeathNote.settings.VISIBILITY_RULES = {
    ALWAYS_HIDE_DEFAULT_MOVEMENT_SPEED: true,
    ALWAYS_HIDE_DEFAULT_MAX_PLAYERS: true,
    ALWAYS_HIDE_DISABLED_BLACK_NOTEBOOKS: true,
    HIDE_DEFAULT_ROLE_SETTINGS: true,
    HIDE_ENABLED_VOICE_CHAT: true,
    HIDE_ENABLED_CANVAS_TASKS: true,
    HIDE_DEFAULT_PROGRESS_MULTIPLIERS: true,
    HIDE_DEFAULT_DAY_NIGHT_SECONDS: true,
    HIDE_DEFAULT_REGION: true,
    CAPITALIZE_FALSE_ROLE_SELECTION: true
};

// Define the settings bins/categories
window.DeathNote.settings.BINS = {
    LOBBY: "Lobby Settings", PLAYER: "Player", GAMEPLAY: "Gameplay"
};

// Create a settings object to track current values and visibility
window.DeathNote.settings.settings = {};

// Function to calculate ideal task count based on other settings
window.DeathNote.settings.calculateIdealTaskCount = function (settings) {
    // Extract values from settings
    const roundTime = settings.dayNightSeconds.value;
    const movementSpeed = settings.movementSpeed.value;
    const inputCount = settings.numberOfInputs.value;

    // Formula constants from spec
    const taskTime = inputCount <= 3 ? 3 : 5;

    // Calculate effective time, accounting for Kira's extensions
    const effectiveTime = 1.533 * roundTime + 16;

    // Calculate easy and hard task counts
    const easyTaskCount = effectiveTime * 0.5 * 0.8 / (12.5 / movementSpeed + taskTime);
    const hardTaskCount = effectiveTime * 0.9 / (12.5 / movementSpeed + taskTime);

    // Calculate ideal task count (average of easy and hard, rounded up)
    const idealTaskCount = Math.ceil((easyTaskCount + hardTaskCount) / 2);

    return {
        easy: easyTaskCount, hard: hardTaskCount, ideal: idealTaskCount
    };
};

// Define all settings
window.DeathNote.settings.settingsDefinitions = [// Lobby Settings
    {
        id: "lobbyCode",
        name: "Lobby Code",
        description: "Code for players to join the lobby",
        bin: window.DeathNote.settings.BINS.LOBBY,
        type: "text",
        pattern: "[A-Za-z0-9]{5}",
        placeholder: "5-character code (e.g., ABC12)",
        defaultValue: "",
        required: true,
        relevancyFunction: () => 0.7, // Always show as critical
        canHide: false, // Cannot be hidden
        isAdvanced: false
    }, {
        id: "lobbyRegion",
        name: "Lobby Region",
        description: "Server region for the lobby",
        bin: window.DeathNote.settings.BINS.LOBBY,
        type: "select",
        options: ["America (East)", "America (West)", "Europe", "Asia 1", "Asia 2", "South America"],
        defaultValue: "America (East)",
        relevancyFunction: (value) => value === "America (East)" ? 0.3 : 0.8, // Highlight non-default regions
        canHide: true,
        isAdvanced: false
    }, {
        id: "lobbyPrivacy",
        name: "Lobby Privacy",
        description: "Privacy settings for the lobby",
        bin: window.DeathNote.settings.BINS.LOBBY,
        type: "select",
        options: ["Public", "Private"],
        defaultValue: "Public",
        relevancyFunction: () => 0.7, // Always important
        canHide: true,
        isAdvanced: false
    }, {
        id: "roleSelection",
        name: "Role Selection",
        description: "If enabled, players can select a role prior to game start",
        bin: window.DeathNote.settings.BINS.LOBBY,
        type: "boolean",
        defaultValue: true, // Changed to true as requested
        relevancyFunction: () => 0.7, // Always important
        canHide: false, // Always shown
        isAdvanced: false
    }, {
        id: "allowedPlayerType",
        name: "Allowed Player Type",
        description: "Which platforms are allowed to join the lobby",
        bin: window.DeathNote.settings.BINS.LOBBY,
        type: "checkbox-group",
        options: [{id: "pcAllowed", label: "PC", defaultValue: true}, {
            id: "ps4Allowed",
            label: "PS4",
            defaultValue: true
        }],
        relevancyFunction: (value, allSettings) => {
            // High relevancy if either platform is disabled
            if (!allSettings.pcAllowed.value || !allSettings.ps4Allowed.value) {
                return 1.0;
            }
            return 0.3;
        },
        canHide: true,
        isAdvanced: true // Changed to true to make it an advanced setting
    }, {
        id: "voiceChat",
        name: "Voice Chat",
        description: "If enabled, players are permitted to use voice chat",
        bin: window.DeathNote.settings.BINS.LOBBY,
        type: "boolean",
        defaultValue: true,
        relevancyFunction: (value) => value ? 0.1 : 0.7, // Only highlight when disabled
        canHide: true,
        isAdvanced: true // Move to advanced settings
    },

    // Player Settings
    {
        id: "melloRole",
        name: "Available Roles (Mello)",
        description: "Number of players permitted to assume the Mello role",
        bin: window.DeathNote.settings.BINS.PLAYER,
        type: "radio",
        options: [{value: "0", label: "0 (Disabled)"}, {value: "1", label: "1"}, {value: "random", label: "Random"}],
        defaultValue: "1",
        relevancyFunction: (value) => {
            if (value === "0") return 1.0; // Extremely relevant when disabled
            if (value === "1") return 0.1; // Default, not shown
            if (value === "random") return 0.7; // Relevant when random
            return 0.5; // Default fallback
        },
        canHide: true,
        isAdvanced: false
    }, {
        id: "kiraFollowerRole",
        name: "Available Roles (Kira Follower)",
        description: "Number of players permitted to assume the Kira Follower role",
        bin: window.DeathNote.settings.BINS.PLAYER,
        type: "radio",
        options: [{value: "0", label: "0 (Disabled)"}, {value: "1", label: "1"}, {value: "random", label: "Random"}],
        defaultValue: "1",
        relevancyFunction: (value) => {
            if (value === "0") return 1.0; // Extremely relevant when disabled
            if (value === "1") return 0.1; // Default, not shown
            if (value === "random") return 0.7; // Relevant when random
            return 0.5; // Default fallback
        },
        canHide: true,
        isAdvanced: false
    }, {
        id: "movementSpeed",
        name: "Movement Speed",
        description: "Speed multiplier for player movement",
        bin: window.DeathNote.settings.BINS.PLAYER,
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
        isAdvanced: true // Move to advanced settings
    }, {
        id: "maximumPlayers",
        name: "Maximum Players",
        description: "Maximum number of players for the room",
        bin: window.DeathNote.settings.BINS.PLAYER,
        type: "range",
        min: 4,
        max: 10,
        step: 1,
        defaultValue: 10, // Formula: Clamp(1.6 * 2^(-(x - 5)))
        relevancyFunction: (value, allSettings) => {
            if (value === 10) return 0.0; // Never show default value

            // Determine minimum based on role settings
            const melloEnabled = allSettings.melloRole.value !== "0";
            const kiraFollowerEnabled = allSettings.kiraFollowerRole.value !== "0";
            const minPlayers = (!melloEnabled || !kiraFollowerEnabled) ? 4 : 5;

            // Update the min value dynamically
            const settingDef = window.DeathNote.settings.settingsDefinitions.find(s => s.id === "maximumPlayers");
            if (settingDef) {
                settingDef.min = minPlayers;
            }

            // Calculate relevancy
            return Math.min(1.0, 1.6 * Math.pow(2, -(value - 5)));
        },
        canHide: true,
        isAdvanced: true // Move to advanced settings
    },

    // Gameplay Settings
    {
        id: "numberOfTasks",
        name: "Number of Tasks",
        description: "Number of tasks for investigators to perform per day/night period",
        bin: window.DeathNote.settings.BINS.GAMEPLAY,
        type: "range",
        min: 1,
        max: 8,
        step: 1,
        defaultValue: 2, // Formula: Clamp(1.0 * |N - T_ideal|^2, 0, 1)
        relevancyFunction: (value, allSettings) => {
            const taskCounts = window.DeathNote.settings.calculateIdealTaskCount(allSettings);
            return Math.min(1.0, Math.max(0.0, 1.0 * Math.pow(Math.abs(value - taskCounts.ideal), 2)));
        },
        canHide: true,
        isAdvanced: false
    }, {
        id: "numberOfInputs",
        name: "Number of Inputs",
        description: "Number of inputs required to complete a task",
        bin: window.DeathNote.settings.BINS.GAMEPLAY,
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
    }, {
        id: "dayNightSeconds",
        name: "Day/Night Seconds",
        description: "Number of seconds of gameplay in both day and night sections",
        bin: window.DeathNote.settings.BINS.GAMEPLAY,
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
    }, {
        id: "haveBlackNotebooks",
        name: "[All Players] Have Black Notebooks",
        description: "If enabled, all players have black notebooks",
        bin: window.DeathNote.settings.BINS.GAMEPLAY,
        type: "boolean",
        defaultValue: false,
        relevancyFunction: (value) => value ? 1.0 : 0.0, // Only show when enabled, never show when disabled
        canHide: true,
        isAdvanced: false
    }, {
        id: "canvasTasks",
        name: "Canvas Tasks",
        description: "If enabled, Team Kira can perform canvas tasks and gather intelligence by interacting with NPCs",
        bin: window.DeathNote.settings.BINS.GAMEPLAY,
        type: "boolean",
        defaultValue: true,
        relevancyFunction: (value) => value ? 0.1 : 1.0, // Highlight when disabled
        canHide: true,
        isAdvanced: false
    }, {
        id: "maximumCriminalJudgments",
        name: "Maximum Criminal Judgments",
        description: "Maximum number of criminals Kira can judge (kill) per round",
        bin: window.DeathNote.settings.BINS.GAMEPLAY,
        type: "range",
        min: 5,
        max: 8,
        step: 1,
        defaultValue: 5,
        relevancyFunction: (value) => value === 5 ? 0.1 : 0.7, // Default is less relevant
        canHide: true,
        isAdvanced: false
    }, {
        id: "meetingSeconds",
        name: "Meeting Seconds",
        description: "Maximum seconds that players have to vote for Kira suspect",
        bin: window.DeathNote.settings.BINS.GAMEPLAY,
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
    }, {
        id: "kiraProgressMultiplier",
        name: "Kira Progress Multiplier (New World Progress)",
        description: "Multiplier for Team Kira's New World Progress per criminal judged",
        bin: window.DeathNote.settings.BINS.GAMEPLAY,
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
    }, {
        id: "teamLProgressMultiplier",
        name: "Team L Investigation Progress Multiplier",
        description: "Multiplier for Team L's Investigation Progress per task completed",
        bin: window.DeathNote.settings.BINS.GAMEPLAY,
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
    }];

// Initialize settings with defaults
window.DeathNote.settings.initializeSettings = function () {
    // First pass: initialize all main settings
    window.DeathNote.settings.settingsDefinitions.forEach(definition => {
        window.DeathNote.settings.settings[definition.id] = {
            value: definition.defaultValue, relevancyScore: 0, // Will be calculated
            visible: !definition.isAdvanced, // Default visibility based on whether it's an advanced setting
            manuallySet: false // Track if user has manually set visibility
        };

        // Also initialize any checkbox-group options
        if (definition.type === 'checkbox-group' && Array.isArray(definition.options)) {
            definition.options.forEach(option => {
                window.DeathNote.settings.settings[option.id] = {
                    value: option.defaultValue, relevancyScore: 0, // Will be calculated
                    visible: !definition.isAdvanced, manuallySet: false
                };
            });
        }
    });

    // Calculate initial relevancy scores
    window.DeathNote.settings.updateRelevancyScores();
};

// Function to update URL hash with current settings
window.DeathNote.settings.updateUrlHash = function () {
    // Skip this when initializing from the hash
    if (window.ignoreHashUpdate) {
        return;
    }

    const hashSettings = {};

    // Get all settings except lobby code
    for (const key in window.DeathNote.settings.settings) {
        // Skip lobby code and checkbox group parents
        const definition = window.DeathNote.settings.settingsDefinitions.find(def => def.id === key);
        if (key !== 'lobbyCode' && definition && definition.type !== 'checkbox-group') {
            hashSettings[key] = window.DeathNote.settings.settings[key].value;
        }
        // Handle checkbox group options
        else if (key !== 'lobbyCode' && !definition) {
            // This is likely a checkbox group option
            hashSettings[key] = window.DeathNote.settings.settings[key].value;
        }
    }

    // Convert to JSON and encode for URL
    const hashValue = encodeURIComponent(JSON.stringify(hashSettings));

    // Update the URL without reloading the page
    window.history.replaceState(null, null, `#${hashValue}`);
};

// Function to parse settings from URL hash
window.DeathNote.settings.loadSettingsFromHash = function () {
    if (!window.location.hash) {
        return false;
    }

    try {
        // Set flag to ignore hash updates during initialization
        window.ignoreHashUpdate = true;

        // Get the hash without the # character and decode
        const hashValue = decodeURIComponent(window.location.hash.substring(1));

        // Parse the JSON
        const hashSettings = JSON.parse(hashValue);

        // Apply settings to our settings object
        for (const key in hashSettings) {
            if (window.DeathNote.settings.settings[key]) {
                window.DeathNote.settings.settings[key].value = hashSettings[key];
            }
        }

        // IMPORTANT: We need to wait until after the UI is generated to update UI elements
        // Store the hash settings to apply after UI generation
        window.DeathNote.settings.pendingHashSettings = hashSettings;

        // Clear the flag after initialization
        window.ignoreHashUpdate = false;
        return true;
    } catch (e) {
        console.error('Error parsing settings from hash:', e);
        window.ignoreHashUpdate = false;
        return false;
    }
};

// Function to setup the Copy Link button
window.DeathNote.settings.setupCopyLinkButton = function () {
    // Add event listener for the Copy Link button
    const copyLinkBtn = document.getElementById('copy-link-btn');
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', function () {
            // Make sure the hash is up to date
            window.DeathNote.settings.updateUrlHash();

            // Get the full URL
            const url = window.location.href;

            // Copy to clipboard
            navigator.clipboard.writeText(url)
                .then(() => {
                    // Visual feedback on successful copy
                    copyLinkBtn.classList.add('copy-flash');
                    copyLinkBtn.textContent = 'Link Copied!';

                    // Reset the button after a delay
                    setTimeout(() => {
                        copyLinkBtn.classList.remove('copy-flash');
                        copyLinkBtn.innerHTML = '<i class="fas fa-link me-2"></i>Copy Link to Settings';
                    }, 2000);
                })
                .catch(err => {
                    console.error('Could not copy URL: ', err);
                });
        });
    }
};

// Add event listeners to all settings to update the hash when changed
window.DeathNote.settings.setupHashUpdateListeners = function () {
    window.DeathNote.settings.settingsDefinitions.forEach(definition => {
        const element = document.getElementById(definition.id);
        if (element) {
            if (definition.type === 'boolean') {
                element.addEventListener('change', window.DeathNote.settings.updateUrlHash);
            } else if (definition.type === 'radio') {
                // For radio buttons, we need to attach to each option
                definition.options.forEach(option => {
                    const radioBtn = document.getElementById(`${definition.id}-${option.value}`);
                    if (radioBtn) {
                        radioBtn.addEventListener('change', window.DeathNote.settings.updateUrlHash);
                    }
                });
            } else if (definition.type === 'checkbox-group') {
                // For checkbox groups, attach to each option
                definition.options.forEach(option => {
                    const checkbox = document.getElementById(option.id);
                    if (checkbox) {
                        checkbox.addEventListener('change', window.DeathNote.settings.updateUrlHash);
                    }
                });
            } else if (definition.type === 'range') {
                element.addEventListener('input', window.DeathNote.settings.updateUrlHash);
            } else {
                element.addEventListener('change', window.DeathNote.settings.updateUrlHash);
            }
        }
    });
};

// Add event listeners to all inputs to update visibility checkboxes when values change
window.DeathNote.settings.setupVisibilitySyncListeners = function () {
    window.DeathNote.settings.settingsDefinitions.forEach(definition => {
        const element = document.getElementById(definition.id);
        if (element) {
            const updateCheckboxes = () => {
                // Recalculate relevancy scores
                window.DeathNote.settings.updateRelevancyScores();

                // Reset manuallySet flag when the value changes
                window.DeathNote.settings.settings[definition.id].manuallySet = false;

                // Sync the checkbox
                window.DeathNote.settings.syncVisibilityCheckbox(definition.id);
            };

            if (definition.type === 'boolean') {
                element.addEventListener('change', updateCheckboxes);
            } else if (definition.type === 'range') {
                element.addEventListener('input', updateCheckboxes);
            } else {
                element.addEventListener('change', updateCheckboxes);
            }
        } else if (definition.type === 'radio') {
            // For radio buttons, we need to attach to each option
            definition.options.forEach(option => {
                const radioBtn = document.getElementById(`${definition.id}-${option.value}`);
                if (radioBtn) {
                    radioBtn.addEventListener('change', () => {
                        // Reset manuallySet flag when the value changes
                        window.DeathNote.settings.settings[definition.id].manuallySet = false;

                        // Recalculate relevancy scores and sync
                        window.DeathNote.settings.updateRelevancyScores();
                        window.DeathNote.settings.syncVisibilityCheckbox(definition.id);
                    });
                }
            });
        } else if (definition.type === 'checkbox-group') {
            // For checkbox groups, attach to each option
            definition.options.forEach(option => {
                const checkbox = document.getElementById(option.id);
                if (checkbox) {
                    checkbox.addEventListener('change', () => {
                        // Reset manuallySet flag when the value changes
                        if (window.DeathNote.settings.settings[option.id]) {
                            window.DeathNote.settings.settings[option.id].manuallySet = false;
                        }

                        // Recalculate relevancy scores and sync
                        window.DeathNote.settings.updateRelevancyScores();
                        window.DeathNote.settings.syncVisibilityCheckbox(option.id);
                    });
                }
            });
        }
    });
};

// Function to update relevancy scores for all settings
window.DeathNote.settings.updateRelevancyScores = function () {
    window.DeathNote.settings.settingsDefinitions.forEach(definition => {
        // Skip if manually set by checkbox
        if (window.DeathNote.settings.settings[definition.id]?.manuallySet) {
            return;
        }

        // For checkbox-group, process each child option
        if (definition.type === 'checkbox-group') {
            // Make sure each option setting exists before accessing it
            definition.options.forEach(option => {
                // Create the setting if it doesn't exist yet
                if (!window.DeathNote.settings.settings[option.id]) {
                    window.DeathNote.settings.settings[option.id] = {
                        value: option.defaultValue,
                        relevancyScore: 0,
                        visible: !definition.isAdvanced,
                        manuallySet: false
                    };
                }
            });

            const relevancyScore = definition.relevancyFunction(null, window.DeathNote.settings.settings);

            // Set relevancy for the group
            definition.options.forEach(option => {
                if (!window.DeathNote.settings.settings[option.id].manuallySet) {
                    window.DeathNote.settings.settings[option.id].relevancyScore = relevancyScore;
                    window.DeathNote.settings.settings[option.id].visible = relevancyScore > 0.3; // Use a threshold to determine visibility
                }
            });
        } else {
            // Calculate the relevancy score using the definition's function
            const relevancyScore = definition.relevancyFunction(window.DeathNote.settings.settings[definition.id].value, window.DeathNote.settings.settings);

            // Update the score
            window.DeathNote.settings.settings[definition.id].relevancyScore = relevancyScore;

            // Update visibility based on relevancy if not manually set
            if (!window.DeathNote.settings.settings[definition.id].manuallySet) {
                window.DeathNote.settings.settings[definition.id].visible = relevancyScore > 0.3;
            }
        }

        // Sync checkbox state with the setting's visibility
        this.syncVisibilityCheckbox(definition.id);
    });

    // Special case: make Number of Inputs = 2 less likely to show up when other settings change
    const numberOfInputs = window.DeathNote.settings.settingsDefinitions.find(def => def.id === "numberOfInputs");
    if (numberOfInputs && window.DeathNote.settings.settings.numberOfInputs.value === 2) {
        // Count non-default settings as a way to measure "interesting" configurations
        let nonDefaultCount = 0;
        window.DeathNote.settings.settingsDefinitions.forEach(definition => {
            if (window.DeathNote.settings.settings[definition.id].value !== definition.defaultValue && definition.id !== "numberOfInputs") {
                nonDefaultCount++;
            }
        });

        // Reduce relevancy based on how many other non-default settings exist
        if (nonDefaultCount > 2) {
            window.DeathNote.settings.settings.numberOfInputs.relevancyScore = Math.max(0.05, window.DeathNote.settings.settings.numberOfInputs.relevancyScore - 0.1 * nonDefaultCount);
            // Update visibility based on new relevancy score
            if (!window.DeathNote.settings.settings.numberOfInputs.manuallySet) {
                window.DeathNote.settings.settings.numberOfInputs.visible = window.DeathNote.settings.settings.numberOfInputs.relevancyScore > 0.3;
                this.syncVisibilityCheckbox('numberOfInputs');
            }
        }
    }
};

// New helper function to sync a checkbox state with the corresponding setting's visibility
window.DeathNote.settings.syncVisibilityCheckbox = function (settingId) {
    const checkboxEl = document.getElementById(`visible-${settingId}`);
    const setting = window.DeathNote.settings.settings[settingId];

    if (checkboxEl && setting) {
        const definition = window.DeathNote.settings.settingsDefinitions.find(def => def.id === settingId);

        if (!definition) return;

        // First determine if we should show the setting based on rules
        const shouldBeVisible = window.DeathNote.settings.applySettingVisibilityRules(definition, setting.visible, window.DeathNote.settings.settings);

        // Now update the checkbox to match
        checkboxEl.checked = shouldBeVisible;

        // Also update the setting's visibility to match
        if (!setting.manuallySet) {
            setting.visible = shouldBeVisible;
        }
    }
};

// Apply pending hash settings after UI generation
window.DeathNote.settings.applyPendingHashSettings = function () {
    if (!window.DeathNote.settings.pendingHashSettings) {
        return;
    }

    console.log('Applying pending hash settings to UI elements');
    const hashSettings = window.DeathNote.settings.pendingHashSettings;

    // Update UI elements to match the settings
    for (const key in hashSettings) {
        const element = document.getElementById(key);
        if (element) {
            if (element.type === 'checkbox') {
                element.checked = hashSettings[key];
            } else if (element.type === 'range') {
                element.value = hashSettings[key];

                // Update the displayed value for range inputs
                const parentContainer = element.closest('.setting-input-container');
                if (parentContainer) {
                    const valueDisplay = parentContainer.querySelector('.text-center');
                    if (valueDisplay) {
                        valueDisplay.textContent = hashSettings[key];
                    }
                }
            } else if (element.type === 'select-one') {
                element.value = hashSettings[key];
            } else {
                element.value = hashSettings[key];
            }
        } else if (key === 'melloRole' || key === 'kiraFollowerRole') {
            // Wait a short time to ensure radio buttons are created
            setTimeout(() => {
                const radioSelector = `input[name="${key}"][value="${hashSettings[key]}"]`;
                console.log(`Looking for delayed radio with selector: ${radioSelector}`);
                const radioBtn = document.querySelector(radioSelector);
                if (radioBtn) {
                    console.log(`Found radio button with delayed search: ${radioBtn.id}`);
                    radioBtn.checked = true;
                    radioBtn.dispatchEvent(new Event('change', {bubbles: true}));
                } else {
                    console.error(`Still could not find radio button for ${key} with value ${hashSettings[key]}`);
                }
            }, 100);
        }
    }

    // Clear the pending settings
    window.DeathNote.settings.pendingHashSettings = null;
};


/**
 * Function to apply visibility rules to a setting based on its value and other settings.
 * This centralizes all setting-specific visibility logic.
 *
 * @param {Object} definition - The setting definition
 * @param {boolean} isVisible - The current visibility state
 * @param {Object} settings - The current settings object
 * @returns {boolean} - The new visibility state
 */
window.DeathNote.settings.applySettingVisibilityRules = function (definition, isVisible, settings) {
    const VISIBILITY_RULES = window.DeathNote.settings.VISIBILITY_RULES;

    // Always hide movement speed at default value
    if (VISIBILITY_RULES.ALWAYS_HIDE_DEFAULT_MOVEMENT_SPEED && definition.id === "movementSpeed" && settings[definition.id].value === 1.0) {
        return false;
    }

    // Always hide maximum players at default value
    if (VISIBILITY_RULES.ALWAYS_HIDE_DEFAULT_MAX_PLAYERS && definition.id === "maximumPlayers" && settings[definition.id].value === 10) {
        return false;
    }

    // Always hide black notebooks when disabled
    if (VISIBILITY_RULES.ALWAYS_HIDE_DISABLED_BLACK_NOTEBOOKS && definition.id === "haveBlackNotebooks" && !settings[definition.id].value) {
        return false;
    }

    // Hide default role settings
    if (VISIBILITY_RULES.HIDE_DEFAULT_ROLE_SETTINGS && (definition.id === "melloRole" || definition.id === "kiraFollowerRole") && settings[definition.id].value === "1") {
        return false;
    }

    // Hide voice chat when enabled (default)
    if (VISIBILITY_RULES.HIDE_ENABLED_VOICE_CHAT && definition.id === "voiceChat" && settings[definition.id].value === true) {
        return false;
    }

    // Hide canvas tasks when enabled (default)
    if (VISIBILITY_RULES.HIDE_ENABLED_CANVAS_TASKS && definition.id === "canvasTasks" && settings[definition.id].value === true) {
        return false;
    }

    // Hide progress multipliers at default value
    if (VISIBILITY_RULES.HIDE_DEFAULT_PROGRESS_MULTIPLIERS && (definition.id === "kiraProgressMultiplier" || definition.id === "teamLProgressMultiplier") && settings[definition.id].value === 1.0) {
        return false;
    }

    // Hide day/night seconds at default unless otherwise specified
    if (VISIBILITY_RULES.HIDE_DEFAULT_DAY_NIGHT_SECONDS && definition.id === "dayNightSeconds" && settings[definition.id].value === 45 && settings[definition.id].relevancyScore < 0.4) {
        return false;
    }

    // Hide default region
    if (VISIBILITY_RULES.HIDE_DEFAULT_REGION && definition.id === "lobbyRegion" && settings[definition.id].value === "America (East)") {
        return false;
    }

    return isVisible;
};

/**
 * Function to get formatted display value for a setting.
 * Handles special cases like capitalization for certain values.
 *
 * @param {Object} definition - The setting definition
 * @param {Object} settings - The current settings object
 * @returns {*} - The formatted display value
 */
window.DeathNote.settings.getSettingDisplayValue = function (definition, settings) {
    const VISIBILITY_RULES = window.DeathNote.settings.VISIBILITY_RULES;

    // Special case for Role Selection to capitalize False
    if (VISIBILITY_RULES.CAPITALIZE_FALSE_ROLE_SELECTION && definition.id === "roleSelection" && settings[definition.id].value === false) {
        return "FALSE";
    }

    return settings[definition.id].value;
};

/**
 * Function to process special setting groups and add them to the output.
 * Handles cases like Allowed Player Type which needs special processing.
 *
 * @param {Object} settingsByBin - Object containing settings organized by bin
 * @param {Object} settings - The current settings object
 */
window.DeathNote.settings.processSpecialSettingGroups = function (settingsByBin, settings) {
    // Handle special case for Allowed Player Type
    const allowedPlayerType = window.DeathNote.settings.settingsDefinitions.find(def => def.id === "allowedPlayerType");
    if (allowedPlayerType) {
        const pcAllowed = settings.pcAllowed?.value;
        const ps4Allowed = settings.ps4Allowed?.value;

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
                id: "allowedPlayerType", name: "Allowed Player Type", value: platformText, relevancyScore: 1.0 // Always high relevancy when restricted
            });
        }
    }

    // Add other special setting groups here as needed
};

// Register this module as ready when the DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    console.log("Settings module loaded");
    if (window.DeathNote && window.DeathNote.registerModule) {
        window.DeathNote.registerModule('settings');
    } else {
        console.error("DeathNote.registerModule is not available");
    }
});