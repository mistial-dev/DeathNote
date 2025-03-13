/**
 * Death Note: Killer Within - Enhanced Recommendations Module
 * Provides dynamic game recommendations based on current settings
 * with improved binning to prevent duplicate recommendation types
 */

(function() {
    'use strict';

    // Create or extend the DeathNote namespace
    window.DeathNote = window.DeathNote || {};
    window.DeathNote.recommendations = window.DeathNote.recommendations || {};

    /**
     * Recommendation groups to prevent duplicates
     * @enum {string}
     */
    const GROUPS = {
        TASK_COUNT: "task_count",           // All task count related recommendations
        ROLE_AVAILABILITY: "role_availability", // Role availability recommendations
        ROUND_SETTINGS: "round_settings",    // Round time related recommendations
        PLAYER_SETTINGS: "player_settings",  // Player-related settings
        KIRA_BALANCE: "kira_balance",        // Kira balance recommendations
        PLATFORM_SETTINGS: "platform_settings", // Platform-related settings
        VOICE_SETTINGS: "voice_settings",    // Voice chat recommendations
        CANVAS_SETTINGS: "canvas_settings",  // Canvas tasks recommendations
        PROGRESS_SETTINGS: "progress_settings", // Progress multiplier recommendations
        MOVEMENT_SPEED: "movement_speed",    // Movement speed recommendations
        MEETING_SETTINGS: "meeting_settings" // Meeting time recommendations
    };

    // Expose groups constant
    window.DeathNote.recommendations.GROUPS = GROUPS;

    /**
     * Recommendation categories for broader organization
     * @enum {string}
     */
    const CATEGORIES = {
        GAMEPLAY: "gameplay",             // Core gameplay recommendations
        BALANCE: "balance",               // Game balance recommendations
        PLAYER_EXPERIENCE: "player_experience", // Player experience recommendations
        ROLES: "roles",                   // Role-related recommendations
        TIMING: "timing",                 // Timing-related recommendations
        DIFFICULTY: "difficulty",         // Difficulty-related recommendations
        COMMUNICATION: "communication",    // Communication-related recommendations
        MECHANICS: "mechanics",           // Game mechanics recommendations
        PLAYER_COUNT: "player_count",     // Player count recommendations
        REGION: "region"                  // Server region recommendations
    };

    // Expose categories constant
    window.DeathNote.recommendations.CATEGORIES = CATEGORIES;

    /**
     * Helper functions for working with settings
     */
    const SettingsHelper = {
        /**
         * Check if a setting has a specific value
         * @param {Object} settings - Settings object
         * @param {string} name - Setting name
         * @param {*} value - Value to check for
         * @returns {boolean} True if setting exists and has the specified value
         */
        hasSetting: function(settings, name, value) {
            return settings && settings[name] && settings[name].value === value;
        },

        /**
         * Check if a setting exists
         * @param {Object} settings - Settings object
         * @param {string} name - Setting name
         * @returns {boolean} True if setting exists
         */
        settingExists: function(settings, name) {
            return settings && settings[name] && settings[name].value !== undefined;
        },

        /**
         * Get a setting value with a default fallback
         * @param {Object} settings - Settings object
         * @param {string} name - Setting name
         * @param {*} defaultValue - Default value
         * @returns {*} Setting value or default
         */
        getValue: function(settings, name, defaultValue) {
            if (settings && settings[name] && settings[name].value !== undefined) {
                return settings[name].value;
            }
            return defaultValue;
        }
    };

    // Expose helper functions
    window.DeathNote.recommendations.SettingsHelper = SettingsHelper;

    // Track initialization
    let initialized = false;

    /**
     * Initialize the recommendations module
     */
    const initialize = function() {
        if (initialized) {
            console.log('Recommendations already initialized');
            return;
        }

        console.log('Initializing recommendations module');

        // Set up event listeners
        _setupEventListeners();

        initialized = true;
        console.log('Recommendations module initialized');

        // Update recommendations initially
        setTimeout(() => {
            updateRecommendations();
        }, 500);
    };

    /**
     * Set up event listeners for the recommendations module
     * @private
     */
    const _setupEventListeners = function() {
        // Add event listeners for settings changes
        document.addEventListener('deathNote:settings:changed', () => {
            console.log('Settings changed, updating recommendations');
            updateRecommendations();
        });

        // Additional listener for direct updates
        document.addEventListener('deathNote:recommendations:update', () => {
            console.log('Recommendations update requested');
            updateRecommendations();
        });
    };

    /**
     * Get current settings from the settings module
     * @private
     * @returns {Object} Current settings
     */
    const _getCurrentSettings = function() {
        if (window.DeathNote.settings && window.DeathNote.settings.settings) {
            return window.DeathNote.settings.settings;
        }

        const settingsModule = window.DeathNote.getModule
            ? window.DeathNote.getModule('settings')
            : null;

        if (!settingsModule) {
            console.warn('Settings module not available for recommendations');
            return {};
        }

        try {
            return settingsModule.getAllSettings ?
                settingsModule.getAllSettings() : {};
        } catch (error) {
            console.error('Error getting settings:', error);
            return {};
        }
    };

    /**
     * Get active recommendations based on current settings
     * @param {Object} [settingsOverride] - Optional settings override
     * @returns {Array} Array of active recommendations
     */
    const getActiveRecommendations = function(settingsOverride) {
        const settings = settingsOverride || _getCurrentSettings();

        // For debugging, log the settings
        console.log("Evaluating recommendations with settings:", settings);

        if (Object.keys(settings).length === 0) {
            console.warn('No settings available for recommendations');
            return [];
        }

        // Get all recommendations that meet their conditions
        const validRecommendations = recommendations.filter(recommendation => {
            try {
                if (!recommendation.condition) {
                    console.warn(`Recommendation '${recommendation.id}' has no condition function`);
                    return false;
                }

                const conditionResult = recommendation.condition(settings);
                console.log(`Recommendation '${recommendation.id}' (group: ${recommendation.group}, category: ${recommendation.category}) condition evaluated to: ${conditionResult}`);
                return conditionResult;
            } catch (error) {
                console.error(`Error evaluating condition for recommendation '${recommendation.id}':`, error);
                return false;
            }
        });

        // Group recommendations by their category
        const categorizedRecommendations = {};

        // First, categorize all valid recommendations
        validRecommendations.forEach(rec => {
            if (!categorizedRecommendations[rec.category]) {
                categorizedRecommendations[rec.category] = [];
            }
            categorizedRecommendations[rec.category].push(rec);
        });

        // Create the output array for recommendations
        const outputRecommendations = [];

        // Process recommendations by category - CHANGE: take up to 2 top priority items from each category
        for (const category in categorizedRecommendations) {
            const categoryRecs = categorizedRecommendations[category];
            // Sort by priority (higher number = higher priority)
            categoryRecs.sort((a, b) => b.priority - a.priority);
            // Take up to 2 highest priority items from each category
            outputRecommendations.push(categoryRecs[0]);
            if (categoryRecs.length > 1 && categoryRecs[1].priority >= 5) { // Only add second recommendation if priority is 5+
                outputRecommendations.push(categoryRecs[1]);
            }
        }

        // Now, group by the more specific 'group' to further deduplicate
        const groupedRecommendations = {};
        outputRecommendations.forEach(rec => {
            if (!groupedRecommendations[rec.group]) {
                groupedRecommendations[rec.group] = [];
            }
            groupedRecommendations[rec.group].push(rec);
        });

        // For each group, select only the highest priority recommendation
        const filteredRecommendations = [];
        for (const group in groupedRecommendations) {
            // Sort by priority (higher number = higher priority)
            const sortedGroup = groupedRecommendations[group].sort((a, b) => b.priority - a.priority);
            // Take only the highest priority one
            filteredRecommendations.push(sortedGroup[0]);
        }

        // Map to the expected format and enhance verbosity
        return filteredRecommendations.map(recommendation => {
            try {
                return {
                    id: recommendation.id,
                    message: recommendation.message(settings),
                    group: recommendation.group,
                    category: recommendation.category,
                    priority: recommendation.priority
                };
            } catch (error) {
                console.error(`Error generating message for recommendation '${recommendation.id}':`, error);
                return {
                    id: recommendation.id,
                    message: `Error generating recommendation: ${error.message}`,
                    group: recommendation.group,
                    category: recommendation.category,
                    priority: recommendation.priority
                };
            }
        });
    };

    /**
     * Update recommendations in the UI
     */
    const updateRecommendations = function() {
        console.log("Updating recommendations UI");
        const recommendationsContainer = document.getElementById('recommendations-container');
        if (!recommendationsContainer) {
            console.error("Recommendations container not found");
            return;
        }

        try {
            const settings = _getCurrentSettings();
            const activeRecommendations = getActiveRecommendations(settings);

            console.log(`Found ${activeRecommendations.length} active recommendations`);

            // Clear previous recommendations
            recommendationsContainer.innerHTML = '';

            if (activeRecommendations.length === 0) {
                recommendationsContainer.innerHTML = '<p class="text-muted">No recommendations at this time. Your settings look good!</p>';
                return;
            }

            // Sort recommendations by priority (highest first) for display
            activeRecommendations.sort((a, b) => b.priority - a.priority);

            // Add each recommendation to the container
            activeRecommendations.forEach(recommendation => {
                const recommendationElement = document.createElement('div');
                recommendationElement.className = 'recommendation-item';

                // Add priority class
                if (recommendation.priority >= 9) {
                    recommendationElement.classList.add('recommendation-high-priority');
                } else if (recommendation.priority >= 7) {
                    recommendationElement.classList.add('recommendation-medium-priority');
                } else {
                    recommendationElement.classList.add('recommendation-low-priority');
                }

                recommendationElement.innerHTML = recommendation.message;

                // Add data attributes for debugging/reference
                recommendationElement.dataset.id = recommendation.id;
                recommendationElement.dataset.group = recommendation.group;
                recommendationElement.dataset.category = recommendation.category;
                recommendationElement.dataset.priority = recommendation.priority;

                recommendationsContainer.appendChild(recommendationElement);
            });
        } catch (error) {
            console.error("Error updating recommendations:", error);
            recommendationsContainer.innerHTML = '<p class="text-danger">Error generating recommendations. Please check the console for details.</p>';
        }
    };

    /**
     * Array of recommendation objects
     * Each recommendation now has both group and category properties:
     * - group: specific grouping (e.g., TASK_COUNT)
     * - category: broader categorization (e.g., "gameplay", "balance")
     */
    const recommendations = [
        // Recommendation for very low task count (highest priority in TASK_COUNT group)
        {
            id: "veryLowTaskCount",
            group: GROUPS.TASK_COUNT,
            category: CATEGORIES.GAMEPLAY,
            priority: 10, // Highest priority in this group
            condition: (settings) => {
                return SettingsHelper.hasSetting(settings, "numberOfTasks", 1);
            },
            message: (settings) => {
                return `Only 1 task? That's like giving L a single clue to find Kira! Players will complete it quickly and have nothing to do. Consider adding more tasks to keep everyone engaged!`;
            }
        },

        // Recommendation 1: Too Few Tasks (Risk of Boredom)
        {
            id: "tooFewTasks",
            group: GROUPS.TASK_COUNT,
            category: CATEGORIES.GAMEPLAY,
            priority: 5,
            condition: (settings) => {
                if (!SettingsHelper.settingExists(settings, "numberOfTasks")) return false;

                const taskCount = SettingsHelper.getValue(settings, "numberOfTasks", 2);

                // Only proceed if the task count is greater than 1 (to not overlap with veryLowTaskCount)
                if (taskCount <= 1) return false;

                // Only proceed if we can calculate ideal task count
                const calculateIdealTaskCount =
                    (window.DeathNote.settings && window.DeathNote.settings.calculateIdealTaskCount) ||
                    (window.DeathNote.getModule && window.DeathNote.getModule('settings') &&
                        window.DeathNote.getModule('settings').calculateIdealTaskCount);

                if (typeof calculateIdealTaskCount !== 'function') {
                    return false;
                }

                try {
                    const taskCounts = Settings.calculateIdealTaskCount(settings);
                    return taskCount < taskCounts.ideal && taskCount > 1;
                } catch (e) {
                    console.error("Error calculating ideal task count:", e);
                    return false;
                }
            },
            message: (settings) => {
                // Safely calculate task counts or use defaults
                let suggestedTasks = 4;
                try {
                    const calculateIdealTaskCount =
                        (window.DeathNote.settings && window.DeathNote.settings.calculateIdealTaskCount) ||
                        (window.DeathNote.getModule && window.DeathNote.getModule('settings') &&
                            window.DeathNote.getModule('settings').calculateIdealTaskCount);

                    if (typeof calculateIdealTaskCount === 'function') {
                        const taskCounts = Settings.calculateIdealTaskCount(settings);
                        suggestedTasks = Math.min(8, Math.max(1, Math.ceil(taskCounts.ideal)));
                    }
                } catch (e) {
                    console.error("Error calculating task count for message:", e);
                }

                return `Consider trying ${suggestedTasks} tasks to keep players occupied! With Kira's timer extensions, they might have more downtime than desired.`;
            }
        },

        // Recommendation 2: Too Many Tasks (Risk of Overwhelm)
        {
            id: "tooManyTasks",
            group: GROUPS.TASK_COUNT,
            category: CATEGORIES.GAMEPLAY,
            priority: 6,
            condition: (settings) => {
                if (!SettingsHelper.settingExists(settings, "numberOfTasks")) return false;

                const taskCount = SettingsHelper.getValue(settings, "numberOfTasks", 2);

                // Only proceed if we can calculate ideal task count
                const calculateIdealTaskCount =
                    (window.DeathNote.settings && window.DeathNote.settings.calculateIdealTaskCount) ||
                    (window.DeathNote.getModule && window.DeathNote.getModule('settings') &&
                        window.DeathNote.getModule('settings').calculateIdealTaskCount);

                if (typeof calculateIdealTaskCount !== 'function') {
                    return false;
                }

                try {
                    const taskCounts = Settings.calculateIdealTaskCount(settings);
                    return taskCount > taskCounts.hard + 1 && (taskCount / (taskCounts.hard + 1) > 1.25);
                } catch (e) {
                    console.error("Error calculating ideal task count:", e);
                    return false;
                }
            },
            message: (settings) => {
                // Safely calculate task counts or use defaults
                let suggestedTasks = 4;
                let suggestedTasksAlt = 5;

                try {
                    const calculateIdealTaskCount =
                        (window.DeathNote.settings && window.DeathNote.settings.calculateIdealTaskCount) ||
                        (window.DeathNote.getModule && window.DeathNote.getModule('settings') &&
                            window.DeathNote.getModule('settings').calculateIdealTaskCount);

                    if (typeof calculateIdealTaskCount === 'function') {
                        const taskCounts = Settings.calculateIdealTaskCount(settings);
                        suggestedTasks = Math.min(8, Math.max(1, Math.round(taskCounts.hard)));
                        suggestedTasksAlt = Math.min(8, Math.max(1, Math.round(taskCounts.hard + 1)));
                    }
                } catch (e) {
                    console.error("Error calculating task count for message:", e);
                }

                const taskCount = SettingsHelper.getValue(settings, "numberOfTasks", 2);
                return `${taskCount} tasks might be overwhelming! Players might give up. Try ${suggestedTasks} or ${suggestedTasksAlt} for a challenge that won't make them rage quit!`;
            }
        },

        // Very Low Movement Speed
        {
            id: "veryLowSpeed",
            group: GROUPS.MOVEMENT_SPEED,
            category: CATEGORIES.PLAYER_EXPERIENCE, // Different category from the task-related one
            priority: 10, // Higher priority than just low speed with high tasks
            condition: (settings) => {
                if (!SettingsHelper.settingExists(settings, "movementSpeed")) {
                    return false;
                }

                const movementSpeed = SettingsHelper.getValue(settings, "movementSpeed", 1.0);
                return movementSpeed <= 0.7; // Very low speed regardless of other settings
            },
            message: (settings) => {
                const movementSpeed = SettingsHelper.getValue(settings, "movementSpeed", 1.0);
                return `<span class="warning-text"><strong>Very slow movement speed (${movementSpeed})</strong> will frustrate players. Consider at least 0.8 for a better experience.</span>`;
            }
        },

        // Recommendation 3: Low Movement Speed with High Task Count
        {
            id: "lowSpeedHighTasks",
            group: GROUPS.MOVEMENT_SPEED,
            category: CATEGORIES.GAMEPLAY, // Primary game settings
            priority: 7,
            condition: (settings) => {
                if (!SettingsHelper.settingExists(settings, "movementSpeed") ||
                    !SettingsHelper.settingExists(settings, "numberOfTasks")) {
                    return false;
                }

                const speed = SettingsHelper.getValue(settings, "movementSpeed", 1.0);
                const taskCount = SettingsHelper.getValue(settings, "numberOfTasks", 2);

                // Don't trigger if very low speed recommendation is already active
                if (speed <= 0.7) return false;

                // Only proceed if we can calculate ideal task count
                const calculateIdealTaskCount =
                    (window.DeathNote.settings && window.DeathNote.settings.calculateIdealTaskCount) ||
                    (window.DeathNote.getModule && window.DeathNote.getModule('settings') &&
                        window.DeathNote.getModule('settings').calculateIdealTaskCount);

                if (typeof calculateIdealTaskCount !== 'function') {
                    return false;
                }

                try {
                    const taskCounts = Settings.calculateIdealTaskCount(settings);
                    return speed < 0.8 && taskCount > taskCounts.ideal + 1;
                } catch (e) {
                    console.error("Error calculating ideal task count:", e);
                    return false;
                }
            },
            message: (settings) => {
                // Safely calculate task counts or use defaults
                let suggestedTasks = 3;
                try {
                    const calculateIdealTaskCount =
                        (window.DeathNote.settings && window.DeathNote.settings.calculateIdealTaskCount) ||
                        (window.DeathNote.getModule && window.DeathNote.getModule('settings') &&
                            window.DeathNote.getModule('settings').calculateIdealTaskCount);

                    if (typeof calculateIdealTaskCount === 'function') {
                        const taskCounts = Settings.calculateIdealTaskCount(settings);
                        suggestedTasks = Math.min(8, Math.max(1, Math.ceil(taskCounts.ideal)));
                    }
                } catch (e) {
                    console.error("Error calculating task count for message:", e);
                }

                const speed = SettingsHelper.getValue(settings, "movementSpeed", 1.0);
                const taskCount = SettingsHelper.getValue(settings, "numberOfTasks", 2);

                return `Movement speed ${speed} with ${taskCount} tasks? Players will struggle to get around in time. Either speed up to 1.0 or reduce tasks to ${suggestedTasks} for smoother gameplay.`;
            }
        },

        // Add recommendation for non-US East regions
        {
            id: "nonDefaultRegion",
            group: GROUPS.PLAYER_SETTINGS,
            category: CATEGORIES.REGION,
            priority: 2,
            condition: (settings) => {
                return SettingsHelper.settingExists(settings, "lobbyRegion") &&
                    SettingsHelper.getValue(settings, "lobbyRegion", "America (East)") !== "America (East)";
            },
            message: (settings) => {
                const region = SettingsHelper.getValue(settings, "lobbyRegion", "America (East)");
                return `Playing in ${region}? Just a heads-up: servers outside US East might take a bit longer to fill up.`;
            }
        },

        // Add recommendation for restricted platform types
        {
            id: "restrictedPlatformTypes",
            group: GROUPS.PLATFORM_SETTINGS,
            category: CATEGORIES.PLAYER_COUNT,
            priority: 8,
            condition: (settings) => {
                return (SettingsHelper.settingExists(settings, "pcAllowed") &&
                        !SettingsHelper.getValue(settings, "pcAllowed", true)) ||
                    (SettingsHelper.settingExists(settings, "ps4Allowed") &&
                        !SettingsHelper.getValue(settings, "ps4Allowed", true));
            },
            message: (settings) => {
                let message = "<span class='warning-text'>";

                if (SettingsHelper.settingExists(settings, "pcAllowed") &&
                    !SettingsHelper.getValue(settings, "pcAllowed", true)) {
                    message += "Banning PC players cuts your player pool in half. Many PC folks don't cheat!";
                } else if (SettingsHelper.settingExists(settings, "ps4Allowed") &&
                    !SettingsHelper.getValue(settings, "ps4Allowed", true)) {
                    message += "Console players banned? PS4 and PS5 players make up a huge chunk of the player base. Your lobby might fill more slowly!";
                }

                message += "</span>";
                return message;
            }
        },

        // Recommendation 4: Mello Disabled
        {
            id: "melloDisabled",
            group: GROUPS.ROLE_AVAILABILITY,
            category: CATEGORIES.ROLES, // Broader category
            priority: 9,
            condition: (settings) => {
                return SettingsHelper.hasSetting(settings, "melloRole", "0");
            },
            message: () => {
                return "<span class='warning-text'><strong>No Mello in your lobby?</strong> Players LOVE this role and might leave quickly. Consider enabling it!</span>";
            }
        },

        // Recommendation 5: Kira Without a Follower
        {
            id: "noKiraFollower",
            group: GROUPS.ROLE_AVAILABILITY,
            category: CATEGORIES.ROLES, // Same category as Mello
            priority: 8,
            condition: (settings) => {
                return SettingsHelper.hasSetting(settings, "kiraFollowerRole", "0");
            },
            message: (settings) => {
                // Red warning if >= 6 players, regular otherwise
                const playerCount = SettingsHelper.getValue(settings, "maximumPlayers", 10);
                const isHighPlayerCount = playerCount >= 6;
                const warningClass = isHighPlayerCount ? "warning-text" : "";
                return `<span class='${warningClass}'>Poor Kira has no sidekick! ${isHighPlayerCount ? 'With ' + playerCount + ' players, Kira will have a harder time.' : 'Players might leave the lobby quickly!'} Consider adding a Follower.</span>`;
            }
        },

        // Recommendation 6: Short Rounds with High Inputs
        {
            id: "shortRoundsHighInputs",
            group: GROUPS.ROUND_SETTINGS,
            category: CATEGORIES.TIMING, // Broader category
            priority: 6,
            condition: (settings) => {
                return SettingsHelper.settingExists(settings, "dayNightSeconds") &&
                    SettingsHelper.settingExists(settings, "numberOfInputs") &&
                    SettingsHelper.getValue(settings, "dayNightSeconds", 45) <= 45 &&
                    SettingsHelper.getValue(settings, "numberOfInputs", 2) >= 4;
            },
            message: (settings) => {
                const seconds = SettingsHelper.getValue(settings, "dayNightSeconds", 45);
                const inputs = SettingsHelper.getValue(settings, "numberOfInputs", 2);
                return `${seconds} seconds with ${inputs} inputs is rushed! Try dropping inputs to 2-3 or extend rounds to 60+ seconds for a better pace.`;
            }
        },

        // Recommendation 7: Long Rounds with Low Tasks and High Speed
        {
            id: "longRoundsLowTasksHighSpeed",
            group: GROUPS.ROUND_SETTINGS,
            category: CATEGORIES.TIMING, // Same category as short rounds
            priority: 5,
            condition: (settings) => {
                if (!SettingsHelper.settingExists(settings, "dayNightSeconds") ||
                    !SettingsHelper.settingExists(settings, "numberOfTasks") ||
                    !SettingsHelper.settingExists(settings, "movementSpeed")) {
                    return false;
                }

                const seconds = SettingsHelper.getValue(settings, "dayNightSeconds", 45);
                const taskCount = SettingsHelper.getValue(settings, "numberOfTasks", 2);
                const speed = SettingsHelper.getValue(settings, "movementSpeed", 1.0);

                // Only proceed if we can calculate ideal task count
                const calculateIdealTaskCount =
                    (window.DeathNote.settings && window.DeathNote.settings.calculateIdealTaskCount) ||
                    (window.DeathNote.getModule && window.DeathNote.getModule('settings') &&
                        window.DeathNote.getModule('settings').calculateIdealTaskCount);

                if (typeof calculateIdealTaskCount !== 'function') {
                    return false;
                }

                try {
                    const taskCounts = Settings.calculateIdealTaskCount(settings);
                    return seconds >= 120 && taskCount < taskCounts.ideal && speed >= 1.2;
                } catch (e) {
                    console.error("Error calculating ideal task count:", e);
                    return false;
                }
            },
            message: (settings) => {
                let suggestedTasks = 3;
                try {
                    const calculateIdealTaskCount =
                        (window.DeathNote.settings && window.DeathNote.settings.calculateIdealTaskCount) ||
                        (window.DeathNote.getModule && window.DeathNote.getModule('settings') &&
                            window.DeathNote.getModule('settings').calculateIdealTaskCount);

                    if (typeof calculateIdealTaskCount === 'function') {
                        const taskCounts = Settings.calculateIdealTaskCount(settings);
                        suggestedTasks = Math.min(8, Math.max(1, Math.ceil(taskCounts.ideal)));
                    }
                } catch (e) {
                    console.error("Error calculating task count for message:", e);
                }

                const seconds = SettingsHelper.getValue(settings, "dayNightSeconds", 45);
                const taskCount = SettingsHelper.getValue(settings, "numberOfTasks", 2);
                const speed = SettingsHelper.getValue(settings, "movementSpeed", 1.0);

                return `Long ${seconds}s rounds, ${speed} speed, but only ${taskCount} tasks? Players will have too much downtime. Consider adding tasks (${suggestedTasks}) to keep them engaged.`;
            }
        },

        // Recommendation 8: High Player Count with Low Tasks
        {
            id: "highPlayerCountLowTasks",
            group: GROUPS.TASK_COUNT,
            category: CATEGORIES.PLAYER_COUNT, // Different category from general task count
            priority: 7,
            condition: (settings) => {
                if (!SettingsHelper.settingExists(settings, "maximumPlayers") ||
                    !SettingsHelper.settingExists(settings, "numberOfTasks")) {
                    return false;
                }

                const playerCount = SettingsHelper.getValue(settings, "maximumPlayers", 10);
                const taskCount = SettingsHelper.getValue(settings, "numberOfTasks", 2);

                // Only proceed if we can calculate ideal task count
                const calculateIdealTaskCount =
                    (window.DeathNote.settings && window.DeathNote.settings.calculateIdealTaskCount) ||
                    (window.DeathNote.getModule && window.DeathNote.getModule('settings') &&
                        window.DeathNote.getModule('settings').calculateIdealTaskCount);

                if (typeof calculateIdealTaskCount !== 'function') {
                    return false;
                }

                try {
                    const taskCounts = Settings.calculateIdealTaskCount(settings);
                    return playerCount >= 8 && taskCount < taskCounts.ideal;
                } catch (e) {
                    console.error("Error calculating ideal task count:", e);
                    return false;
                }
            },
            message: (settings) => {
                let suggestedTasks = 3;
                try {
                    const calculateIdealTaskCount =
                        (window.DeathNote.settings && window.DeathNote.settings.calculateIdealTaskCount) ||
                        (window.DeathNote.getModule && window.DeathNote.getModule('settings') &&
                            window.DeathNote.getModule('settings').calculateIdealTaskCount);

                    if (typeof calculateIdealTaskCount === 'function') {
                        const taskCounts = Settings.calculateIdealTaskCount(settings);
                        suggestedTasks = Math.min(8, Math.max(1, Math.ceil(taskCounts.ideal)));
                    }
                } catch (e) {
                    console.error("Error calculating task count for message:", e);
                }

                const playerCount = SettingsHelper.getValue(settings, "maximumPlayers", 10);
                const taskCount = SettingsHelper.getValue(settings, "numberOfTasks", 2);

                return `${taskCount} tasks is a bit low for ${playerCount} players. Try adding tasks (around ${suggestedTasks}) to keep everyone engaged.`;
            }
        },

        // Recommendation 9: Voice Chat Disabled with Complex Settings
        {
            id: "noVoiceChatComplexSettings",
            group: GROUPS.VOICE_SETTINGS,
            category: CATEGORIES.COMMUNICATION, // Broader category
            priority: 5,
            condition: (settings) => {
                if (!SettingsHelper.settingExists(settings, "voiceChat") ||
                    !SettingsHelper.settingExists(settings, "numberOfTasks") ||
                    !SettingsHelper.settingExists(settings, "numberOfInputs") ||
                    !SettingsHelper.settingExists(settings, "melloRole") ||
                    !SettingsHelper.settingExists(settings, "kiraFollowerRole")) {
                    return false;
                }

                const voiceChat = SettingsHelper.getValue(settings, "voiceChat", true);
                const taskCount = SettingsHelper.getValue(settings, "numberOfTasks", 2);
                const inputCount = SettingsHelper.getValue(settings, "numberOfInputs", 2);
                const melloRole = SettingsHelper.getValue(settings, "melloRole", "1");
                const kiraFollowerRole = SettingsHelper.getValue(settings, "kiraFollowerRole", "1");

                // Only proceed if we can calculate ideal task count
                const calculateIdealTaskCount =
                    (window.DeathNote.settings && window.DeathNote.settings.calculateIdealTaskCount) ||
                    (window.DeathNote.getModule && window.DeathNote.getModule('settings') &&
                        window.DeathNote.getModule('settings').calculateIdealTaskCount);

                if (typeof calculateIdealTaskCount !== 'function') {
                    return false;
                }

                try {
                    const taskCounts = Settings.calculateIdealTaskCount(settings);
                    return !voiceChat &&
                        (taskCount > taskCounts.hard ||
                            inputCount >= 4 ||
                            melloRole === "random" ||
                            kiraFollowerRole === "random");
                } catch (e) {
                    console.error("Error calculating ideal task count:", e);
                    return false;
                }
            },
            message: (settings) => {
                let suggestedTasks = 3;
                try {
                    const calculateIdealTaskCount =
                        (window.DeathNote.settings && window.DeathNote.settings.calculateIdealTaskCount) ||
                        (window.DeathNote.getModule && window.DeathNote.getModule('settings') &&
                            window.DeathNote.getModule('settings').calculateIdealTaskCount);

                    if (typeof calculateIdealTaskCount === 'function') {
                        const taskCounts = Settings.calculateIdealTaskCount(settings);
                        suggestedTasks = Math.min(8, Math.max(1, Math.ceil(taskCounts.ideal)));
                    }
                } catch (e) {
                    console.error("Error calculating task count for message:", e);
                }

                return `No voice chat with complex settings might be chaotic. Either enable voice chat or simplify (try ${suggestedTasks} tasks, 2-3 inputs) for clearer teamwork.`;
            }
        },

        // Recommendation 10: Canvas Tasks Disabled (stronger warning)
        {
            id: "canvasTasksDisabled",
            group: GROUPS.CANVAS_SETTINGS,
            category: CATEGORIES.MECHANICS, // Broader category
            priority: 9,
            condition: (settings) => {
                return SettingsHelper.settingExists(settings, "canvasTasks") &&
                    !SettingsHelper.getValue(settings, "canvasTasks", true);
            },
            message: () => {
                return "<span class='warning-text'><strong>Canvas Tasks are disabled!</strong> Team Kira will struggle to blend in. Investigators can easily track Kira, leading to frustrated players. Consider enabling Canvas Tasks.</span>";
            }
        },

        // Recommendation 11: Unbalanced Progress Multipliers
        {
            id: "unbalancedProgressMultipliers",
            group: GROUPS.PROGRESS_SETTINGS,
            category: CATEGORIES.BALANCE, // Broader category
            priority: 8,
            condition: (settings) => {
                return SettingsHelper.settingExists(settings, "kiraProgressMultiplier") &&
                    SettingsHelper.settingExists(settings, "teamLProgressMultiplier") &&
                    Math.abs(SettingsHelper.getValue(settings, "kiraProgressMultiplier", 1.0) -
                        SettingsHelper.getValue(settings, "teamLProgressMultiplier", 1.0)) > 0.5;
            },
            message: (settings) => {
                const kiraProgress = SettingsHelper.getValue(settings, "kiraProgressMultiplier", 1.0);
                const teamLProgress = SettingsHelper.getValue(settings, "teamLProgressMultiplier", 1.0);

                return `Kira's progress at ${(kiraProgress * 100).toFixed(0)}% and L's at ${(teamLProgress * 100).toFixed(0)}%? A gap over 50% feels unbalanced. Consider evening them out for fairer gameplay.`;
            }
        },

        // Recommendation 12: Low New World Progress (Stale Meta)
        {
            id: "lowNewWorldProgress",
            group: GROUPS.PROGRESS_SETTINGS,
            category: CATEGORIES.BALANCE, // Same category as other balance
            priority: 6,
            condition: (settings) => {
                return SettingsHelper.settingExists(settings, "kiraProgressMultiplier") &&
                    SettingsHelper.getValue(settings, "kiraProgressMultiplier", 1.0) < 1.4;
            },
            message: (settings) => {
                const kiraProgress = SettingsHelper.getValue(settings, "kiraProgressMultiplier", 1.0);

                return `Kira's progress at only ${(kiraProgress * 100).toFixed(0)}%? Players may group up and skip tasks. Consider boosting to 140-150% to encourage movement.`;
            }
        },

        // Recommendation 13: High New World Progress with Excessive Criminal Judgments
        {
            id: "highProgressExcessiveJudgments",
            group: GROUPS.KIRA_BALANCE,
            category: CATEGORIES.BALANCE, // Same category as other balance
            priority: 7,
            condition: (settings) => {
                return SettingsHelper.settingExists(settings, "kiraProgressMultiplier") &&
                    SettingsHelper.settingExists(settings, "maximumCriminalJudgments") &&
                    SettingsHelper.getValue(settings, "kiraProgressMultiplier", 1.0) >= 1.4 &&
                    SettingsHelper.getValue(settings, "maximumCriminalJudgments", 5) > 5;
            },
            message: (settings) => {
                const kiraProgress = SettingsHelper.getValue(settings, "kiraProgressMultiplier", 1.0);
                const judgments = SettingsHelper.getValue(settings, "maximumCriminalJudgments", 5);

                return `Kira at ${(kiraProgress * 100).toFixed(0)}% progress with ${judgments} judgments gives Kira too much power. Consider keeping judgments at 5 for better balance.`;
            }
        },

        // Warning for Black Notebooks + High Criminal Judgments (Advanced Playstyle)
        {
            id: "advancedKiraPlaystyle",
            group: GROUPS.KIRA_BALANCE,
            category: CATEGORIES.DIFFICULTY, // Different category for difficulty
            priority: 8,
            condition: (settings) => {
                return SettingsHelper.settingExists(settings, "haveBlackNotebooks") &&
                    SettingsHelper.settingExists(settings, "maximumCriminalJudgments") &&
                    SettingsHelper.getValue(settings, "haveBlackNotebooks", false) &&
                    SettingsHelper.getValue(settings, "maximumCriminalJudgments", 5) > 5;
            },
            message: (settings) => {
                const judgments = SettingsHelper.getValue(settings, "maximumCriminalJudgments", 5);

                if (SettingsHelper.settingExists(settings, "canvasTasks") &&
                    !SettingsHelper.getValue(settings, "canvasTasks", true) &&
                    judgments >= 7) {
                    // Easter egg for the extreme setup
                    return "<span class='warning-text'>Canvas Tasks off, Black Notebooks on, AND " + judgments + " criminal judgments creates an extremely difficult environment for investigators.</span>";
                }

                return "<span class='warning-text'>Black Notebooks with " + judgments + " criminal judgments is an advanced playstyle! Some players will find it challenging to identify Kira.</span>";
            }
        },

        // Warning for very short round times
        {
            id: "veryShortRounds",
            group: GROUPS.ROUND_SETTINGS,
            category: CATEGORIES.TIMING, // Same as other timing
            priority: 8,
            condition: (settings) => {
                return SettingsHelper.settingExists(settings, "dayNightSeconds") &&
                    SettingsHelper.getValue(settings, "dayNightSeconds", 45) <= 30;
            },
            message: (settings) => {
                const seconds = SettingsHelper.getValue(settings, "dayNightSeconds", 45);
                return `${seconds}-second rounds are very short! Players will be rushing to complete tasks in time.`;
            }
        },

        // Warning for very short meeting times
        {
            id: "veryShortMeetings",
            group: GROUPS.MEETING_SETTINGS,
            category: CATEGORIES.TIMING, // Same category as other timing
            priority: 5,
            condition: (settings) => {
                return SettingsHelper.settingExists(settings, "meetingSeconds") &&
                    SettingsHelper.getValue(settings, "meetingSeconds", 150) <= 45;
            },
            message: (settings) => {
                const seconds = SettingsHelper.getValue(settings, "meetingSeconds", 150);
                return `Only ${seconds} seconds for meetings is very brief. Players will need to make quick decisions without much discussion time.`;
            }
        },

        // Recommendation 14: Default Inputs (2) Recommendation
        {
            id: "defaultInputsRecommendation",
            group: GROUPS.PLAYER_SETTINGS,
            category: CATEGORIES.DIFFICULTY, // Categorized as difficulty
            priority: 3,
            condition: (settings) => {
                if (!SettingsHelper.settingExists(settings, "numberOfInputs")) return false;

                // Count non-default settings to make this less likely to trigger when other things are interesting
                let nonDefaultCount = 0;

                // Get settings definitions
                const settingsDefinitions = window.DeathNote.settings && window.DeathNote.settings.settingsDefinitions
                    ? window.DeathNote.settings.settingsDefinitions
                    : (window.DeathNote.getModule && window.DeathNote.getModule('settings') &&
                    window.DeathNote.getModule('settings').settingsDefinitions) || [];

                for (const key in settings) {
                    if (key !== "numberOfInputs" && SettingsHelper.settingExists(settings, key)) {
                        const def = settingsDefinitions.find(d => d.id === key);
                        if (def && settings[key].value !== def.defaultValue) {
                            nonDefaultCount++;
                        }
                    }
                }

                return SettingsHelper.getValue(settings, "numberOfInputs", 2) === 2 && nonDefaultCount < 3;
            },
            message: () => {
                return "Two inputs per task is relatively simple. Consider bumping to 3-4 for more engaging gameplay, especially for veteran players!";
            }
        },

        // Approach Warning Disabled
        {
            id: "approachWarningDisabled",
            group: GROUPS.PLAYER_SETTINGS,
            category: CATEGORIES.PLAYER_EXPERIENCE, // Same as movement speed
            priority: 7,
            condition: (settings) => {
                return SettingsHelper.settingExists(settings, "approachWarning") &&
                    !SettingsHelper.getValue(settings, "approachWarning", true);
            },
            message: () => {
                return "<span class='warning-text'>Approach Warning disabled! Players won't know when others are nearby, making it easier for Kira to catch targets unaware.</span>";
            }
        },

        // High Inputs Setting
        {
            id: "highInputsSetting",
            group: GROUPS.PLAYER_SETTINGS,
            category: CATEGORIES.DIFFICULTY, // Categorized as difficulty
            priority: 6,
            condition: (settings) => {
                return SettingsHelper.settingExists(settings, "numberOfInputs") &&
                    SettingsHelper.getValue(settings, "numberOfInputs", 2) >= 4;
            },
            message: (settings) => {
                const inputs = SettingsHelper.getValue(settings, "numberOfInputs", 2);
                return `${inputs} inputs per task is quite challenging and time-consuming. Consider using 2-3 inputs for a more balanced experience.`;
            }
        }
    ];

    // Expose the recommendations array
    window.DeathNote.recommendations.recommendations = recommendations;

    // Expose public methods
    window.DeathNote.recommendations.getActiveRecommendations = getActiveRecommendations;
    window.DeathNote.recommendations.updateRecommendations = updateRecommendations;
    window.DeathNote.recommendations.initialize = initialize;

    // Expose the initialized state through a getter
    Object.defineProperty(window.DeathNote.recommendations, 'initialized', {
        get: function() { return initialized; },
        set: function(value) { initialized = Boolean(value); }
    });

    // Register this module as ready when the DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log("Enhanced Recommendations module loaded");

        // Initialize the module
        initialize();

        // Register with DeathNote
        if (window.DeathNote && window.DeathNote.registerModule) {
            window.DeathNote.registerModule('recommendations', window.DeathNote.recommendations);
        } else {
            console.warn("DeathNote.registerModule is not available");
        }
    });
})();