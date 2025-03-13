/**
 * Recommendations for Death Note: Killer Within Lobby Discord Post Generator
 * This file defines recommendations that are shown to the user based on their current settings
 */

// Create or extend the DeathNote namespace
window.DeathNote = window.DeathNote || {};
window.DeathNote.recommendations = window.DeathNote.recommendations || {};

// Define recommendation groups to avoid duplicates
window.DeathNote.recommendations.GROUPS = {
    TASK_COUNT: "task_count",
    ROLE_AVAILABILITY: "role_availability",
    ROUND_SETTINGS: "round_settings",
    PLAYER_SETTINGS: "player_settings",
    KIRA_BALANCE: "kira_balance",
    PLATFORM_SETTINGS: "platform_settings",
    VOICE_SETTINGS: "voice_settings",
    CANVAS_SETTINGS: "canvas_settings",
    PROGRESS_SETTINGS: "progress_settings"
};

// Helper function to safely check if a setting exists and has a specific value
function hasSetting(settings, name, value) {
    return settings && settings[name] && settings[name].value === value;
}

// Helper function to safely check if a setting exists
function settingExists(settings, name) {
    return settings && settings[name] && settings[name].value !== undefined;
}

// Helper function to safely get a setting value with default
function getSettingValue(settings, name, defaultValue) {
    if (settings && settings[name] && settings[name].value !== undefined) {
        return settings[name].value;
    }
    return defaultValue;
}

// Array of recommendation objects
window.DeathNote.recommendations.recommendations = [
    // Recommendation for very low task count (highest priority in TASK_COUNT group)
    {
        id: "veryLowTaskCount",
        group: window.DeathNote.recommendations.GROUPS.TASK_COUNT,
        priority: 10, // Highest priority in this group
        condition: (settings) => {
            return hasSetting(settings, "numberOfTasks", 1);
        },
        message: (settings) => {
            return `Only 1 task? That's like giving L a single clue to find Kira! Players will complete it quickly and have nothing to do. Consider adding more tasks to keep everyone engaged!`;
        }
    },

    // Recommendation 1: Too Few Tasks (Risk of Boredom)
    {
        id: "tooFewTasks",
        group: window.DeathNote.recommendations.GROUPS.TASK_COUNT,
        priority: 5,
        condition: (settings) => {
            if (!settingExists(settings, "numberOfTasks")) return false;

            const taskCount = getSettingValue(settings, "numberOfTasks", 2);

            // Only proceed if we can calculate ideal task count
            if (typeof window.DeathNote.settings.calculateIdealTaskCount !== 'function') {
                return false;
            }

            try {
                const taskCounts = window.DeathNote.settings.calculateIdealTaskCount(settings);
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
                if (typeof window.DeathNote.settings.calculateIdealTaskCount === 'function') {
                    const taskCounts = window.DeathNote.settings.calculateIdealTaskCount(settings);
                    suggestedTasks = Math.min(8, Math.max(1, taskCounts.ideal));
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
        group: window.DeathNote.recommendations.GROUPS.TASK_COUNT,
        priority: 5,
        condition: (settings) => {
            if (!settingExists(settings, "numberOfTasks")) return false;

            const taskCount = getSettingValue(settings, "numberOfTasks", 2);

            // Only proceed if we can calculate ideal task count
            if (typeof window.DeathNote.settings.calculateIdealTaskCount !== 'function') {
                return false;
            }

            try {
                const taskCounts = window.DeathNote.settings.calculateIdealTaskCount(settings);
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
                if (typeof window.DeathNote.settings.calculateIdealTaskCount === 'function') {
                    const taskCounts = window.DeathNote.settings.calculateIdealTaskCount(settings);
                    suggestedTasks = Math.min(8, Math.max(1, Math.round(taskCounts.hard)));
                    suggestedTasksAlt = Math.min(8, Math.max(1, Math.round(taskCounts.hard + 1)));
                }
            } catch (e) {
                console.error("Error calculating task count for message:", e);
            }

            const taskCount = getSettingValue(settings, "numberOfTasks", 2);
            return `${taskCount} tasks might be overwhelming! Players might give up. Try ${suggestedTasks} or ${suggestedTasksAlt} for a challenge that won't make them rage quit!`;
        }
    },

    // Recommendation 3: Low Movement Speed with High Task Count
    {
        id: "lowSpeedHighTasks",
        group: window.DeathNote.recommendations.GROUPS.ROUND_SETTINGS,
        priority: 7,
        condition: (settings) => {
            if (!settingExists(settings, "movementSpeed") || !settingExists(settings, "numberOfTasks")) {
                return false;
            }

            const speed = getSettingValue(settings, "movementSpeed", 1.0);
            const taskCount = getSettingValue(settings, "numberOfTasks", 2);

            // Only proceed if we can calculate ideal task count
            if (typeof window.DeathNote.settings.calculateIdealTaskCount !== 'function') {
                return false;
            }

            try {
                const taskCounts = window.DeathNote.settings.calculateIdealTaskCount(settings);
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
                if (typeof window.DeathNote.settings.calculateIdealTaskCount === 'function') {
                    const taskCounts = window.DeathNote.settings.calculateIdealTaskCount(settings);
                    suggestedTasks = Math.min(8, Math.max(1, taskCounts.ideal));
                }
            } catch (e) {
                console.error("Error calculating task count for message:", e);
            }

            const speed = getSettingValue(settings, "movementSpeed", 1.0);
            const taskCount = getSettingValue(settings, "numberOfTasks", 2);

            return `Movement speed ${speed} with ${taskCount} tasks? Players will struggle to get around in time. Either speed up to 1.0 or reduce tasks to ${suggestedTasks} for smoother gameplay.`;
        }
    },

    // Add recommendation for non-US East regions
    {
        id: "nonDefaultRegion",
        group: window.DeathNote.recommendations.GROUPS.PLAYER_SETTINGS,
        priority: 2,
        condition: (settings) => {
            return settingExists(settings, "lobbyRegion") &&
                getSettingValue(settings, "lobbyRegion", "America (East)") !== "America (East)";
        },
        message: (settings) => {
            const region = getSettingValue(settings, "lobbyRegion", "America (East)");
            return `Playing in ${region}? Just a heads-up: servers outside US East might take a bit longer to fill up.`;
        }
    },

    // Add recommendation for restricted platform types
    {
        id: "restrictedPlatformTypes",
        group: window.DeathNote.recommendations.GROUPS.PLATFORM_SETTINGS,
        priority: 8,
        condition: (settings) => {
            return (settingExists(settings, "pcAllowed") && !getSettingValue(settings, "pcAllowed", true)) ||
                (settingExists(settings, "ps4Allowed") && !getSettingValue(settings, "ps4Allowed", true));
        },
        message: (settings) => {
            let message = "<span style='color: #721c24;'>";

            if (settingExists(settings, "pcAllowed") && !getSettingValue(settings, "pcAllowed", true)) {
                message += "Banning PC players cuts your player pool in half. Many PC folks don't cheat!";
            } else if (settingExists(settings, "ps4Allowed") && !getSettingValue(settings, "ps4Allowed", true)) {
                message += "Console players banned? PS4 players make up a huge chunk of the player base. Your lobby might fill more slowly!";
            }

            message += "</span>";
            return message;
        }
    },

    // Recommendation 4: Mello Disabled
    {
        id: "melloDisabled",
        group: window.DeathNote.recommendations.GROUPS.ROLE_AVAILABILITY,
        priority: 9,
        condition: (settings) => {
            return hasSetting(settings, "melloRole", "0");
        },
        message: () => {
            return "<span class='warning-text'><strong>No Mello in your lobby?</strong> Players LOVE this role and might leave quickly. Consider enabling it!</span>";
        }
    },

    // Recommendation 5: Kira Without a Follower
    {
        id: "noKiraFollower",
        group: window.DeathNote.recommendations.GROUPS.ROLE_AVAILABILITY,
        priority: 8,
        condition: (settings) => {
            return hasSetting(settings, "kiraFollowerRole", "0");
        },
        message: (settings) => {
            // Red warning if >= 6 players, regular otherwise
            const playerCount = getSettingValue(settings, "maximumPlayers", 10);
            const isHighPlayerCount = playerCount >= 6;
            const warningClass = isHighPlayerCount ? "warning-text" : "";
            return `<span class='${warningClass}'>Poor Kira has no sidekick! ${isHighPlayerCount ? 'With ' + playerCount + ' players, Kira will have a harder time.' : 'Players might leave the lobby quickly!'} Consider adding a Follower.</span>`;
        }
    },

    // Recommendation 6: Short Rounds with High Inputs
    {
        id: "shortRoundsHighInputs",
        group: window.DeathNote.recommendations.GROUPS.ROUND_SETTINGS,
        priority: 6,
        condition: (settings) => {
            return settingExists(settings, "dayNightSeconds") &&
                settingExists(settings, "numberOfInputs") &&
                getSettingValue(settings, "dayNightSeconds", 45) <= 45 &&
                getSettingValue(settings, "numberOfInputs", 2) >= 4;
        },
        message: (settings) => {
            const seconds = getSettingValue(settings, "dayNightSeconds", 45);
            const inputs = getSettingValue(settings, "numberOfInputs", 2);
            return `${seconds} seconds with ${inputs} inputs is rushed! Try dropping inputs to 2-3 or extend rounds to 60+ seconds for a better pace.`;
        }
    },

    // Recommendation 7: Long Rounds with Low Tasks and High Speed
    {
        id: "longRoundsLowTasksHighSpeed",
        group: window.DeathNote.recommendations.GROUPS.ROUND_SETTINGS,
        priority: 5,
        condition: (settings) => {
            if (!settingExists(settings, "dayNightSeconds") ||
                !settingExists(settings, "numberOfTasks") ||
                !settingExists(settings, "movementSpeed")) {
                return false;
            }

            const seconds = getSettingValue(settings, "dayNightSeconds", 45);
            const taskCount = getSettingValue(settings, "numberOfTasks", 2);
            const speed = getSettingValue(settings, "movementSpeed", 1.0);

            // Only proceed if we can calculate ideal task count
            if (typeof window.DeathNote.settings.calculateIdealTaskCount !== 'function') {
                return false;
            }

            try {
                const taskCounts = window.DeathNote.settings.calculateIdealTaskCount(settings);
                return seconds >= 120 && taskCount < taskCounts.ideal && speed >= 1.2;
            } catch (e) {
                console.error("Error calculating ideal task count:", e);
                return false;
            }
        },
        message: (settings) => {
            let suggestedTasks = 3;
            try {
                if (typeof window.DeathNote.settings.calculateIdealTaskCount === 'function') {
                    const taskCounts = window.DeathNote.settings.calculateIdealTaskCount(settings);
                    suggestedTasks = Math.min(8, Math.max(1, taskCounts.ideal));
                }
            } catch (e) {
                console.error("Error calculating task count for message:", e);
            }

            const seconds = getSettingValue(settings, "dayNightSeconds", 45);
            const taskCount = getSettingValue(settings, "numberOfTasks", 2);
            const speed = getSettingValue(settings, "movementSpeed", 1.0);

            return `Long ${seconds}s rounds, ${speed} speed, but only ${taskCount} tasks? Players will have too much downtime. Consider adding tasks (${suggestedTasks}) to keep them engaged.`;
        }
    },

    // Recommendation 8: High Player Count with Low Tasks
    {
        id: "highPlayerCountLowTasks",
        group: window.DeathNote.recommendations.GROUPS.TASK_COUNT,
        priority: 7,
        condition: (settings) => {
            if (!settingExists(settings, "maximumPlayers") || !settingExists(settings, "numberOfTasks")) {
                return false;
            }

            const playerCount = getSettingValue(settings, "maximumPlayers", 10);
            const taskCount = getSettingValue(settings, "numberOfTasks", 2);

            // Only proceed if we can calculate ideal task count
            if (typeof window.DeathNote.settings.calculateIdealTaskCount !== 'function') {
                return false;
            }

            try {
                const taskCounts = window.DeathNote.settings.calculateIdealTaskCount(settings);
                return playerCount >= 8 && taskCount < taskCounts.ideal;
            } catch (e) {
                console.error("Error calculating ideal task count:", e);
                return false;
            }
        },
        message: (settings) => {
            let suggestedTasks = 3;
            try {
                if (typeof window.DeathNote.settings.calculateIdealTaskCount === 'function') {
                    const taskCounts = window.DeathNote.settings.calculateIdealTaskCount(settings);
                    suggestedTasks = Math.min(8, Math.max(1, taskCounts.ideal));
                }
            } catch (e) {
                console.error("Error calculating task count for message:", e);
            }

            const playerCount = getSettingValue(settings, "maximumPlayers", 10);
            const taskCount = getSettingValue(settings, "numberOfTasks", 2);

            return `${taskCount} tasks is a bit low for the day/night cycle time. Try adding tasks (around ${suggestedTasks}) to keep everyone engaged.`;
        }
    },

    // Recommendation 9: Voice Chat Disabled with Complex Settings
    {
        id: "noVoiceChatComplexSettings",
        group: window.DeathNote.recommendations.GROUPS.VOICE_SETTINGS,
        priority: 5,
        condition: (settings) => {
            if (!settingExists(settings, "voiceChat") ||
                !settingExists(settings, "numberOfTasks") ||
                !settingExists(settings, "numberOfInputs") ||
                !settingExists(settings, "melloRole") ||
                !settingExists(settings, "kiraFollowerRole")) {
                return false;
            }

            const voiceChat = getSettingValue(settings, "voiceChat", true);
            const taskCount = getSettingValue(settings, "numberOfTasks", 2);
            const inputCount = getSettingValue(settings, "numberOfInputs", 2);
            const melloRole = getSettingValue(settings, "melloRole", "1");
            const kiraFollowerRole = getSettingValue(settings, "kiraFollowerRole", "1");

            // Only proceed if we can calculate ideal task count
            if (typeof window.DeathNote.settings.calculateIdealTaskCount !== 'function') {
                return false;
            }

            try {
                const taskCounts = window.DeathNote.settings.calculateIdealTaskCount(settings);
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
                if (typeof window.DeathNote.settings.calculateIdealTaskCount === 'function') {
                    const taskCounts = window.DeathNote.settings.calculateIdealTaskCount(settings);
                    suggestedTasks = Math.min(8, Math.max(1, taskCounts.ideal));
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
        group: window.DeathNote.recommendations.GROUPS.CANVAS_SETTINGS,
        priority: 9,
        condition: (settings) => {
            return settingExists(settings, "canvasTasks") && !getSettingValue(settings, "canvasTasks", true);
        },
        message: () => {
            return "<span class='warning-text'><strong>Canvas Tasks are disabled!</strong> Team Kira will struggle to blend in. Investigators can easily track Kira, leading to frustrated players. Consider enabling Canvas Tasks.</span>";
        }
    },

    // Recommendation 11: Unbalanced Progress Multipliers
    {
        id: "unbalancedProgressMultipliers",
        group: window.DeathNote.recommendations.GROUPS.PROGRESS_SETTINGS,
        priority: 8,
        condition: (settings) => {
            return settingExists(settings, "kiraProgressMultiplier") &&
                settingExists(settings, "teamLProgressMultiplier") &&
                Math.abs(getSettingValue(settings, "kiraProgressMultiplier", 1.0) -
                    getSettingValue(settings, "teamLProgressMultiplier", 1.0)) > 0.5;
        },
        message: (settings) => {
            const kiraProgress = getSettingValue(settings, "kiraProgressMultiplier", 1.0);
            const teamLProgress = getSettingValue(settings, "teamLProgressMultiplier", 1.0);

            return `Kira's progress at ${(kiraProgress * 100).toFixed(0)}% and L's at ${(teamLProgress * 100).toFixed(0)}%? A gap over 50% feels unbalanced. Consider evening them out for fairer gameplay.`;
        }
    },

    // Recommendation 12: Low New World Progress (Stale Meta)
    {
        id: "lowNewWorldProgress",
        group: window.DeathNote.recommendations.GROUPS.PROGRESS_SETTINGS,
        priority: 6,
        condition: (settings) => {
            return settingExists(settings, "kiraProgressMultiplier") &&
                getSettingValue(settings, "kiraProgressMultiplier", 1.0) < 1.4;
        },
        message: (settings) => {
            const kiraProgress = getSettingValue(settings, "kiraProgressMultiplier", 1.0);

            return `Kira's progress at only ${(kiraProgress * 100).toFixed(0)}%? Players may group up and skip tasks. Consider boosting to 140-150% to encourage movement.`;
        }
    },

    // Recommendation 13: High New World Progress with Excessive Criminal Judgments
    {
        id: "highProgressExcessiveJudgments",
        group: window.DeathNote.recommendations.GROUPS.KIRA_BALANCE,
        priority: 7,
        condition: (settings) => {
            return settingExists(settings, "kiraProgressMultiplier") &&
                settingExists(settings, "maximumCriminalJudgments") &&
                getSettingValue(settings, "kiraProgressMultiplier", 1.0) >= 1.4 &&
                getSettingValue(settings, "maximumCriminalJudgments", 5) > 5;
        },
        message: (settings) => {
            const kiraProgress = getSettingValue(settings, "kiraProgressMultiplier", 1.0);
            const judgments = getSettingValue(settings, "maximumCriminalJudgments", 5);

            return `Kira at ${(kiraProgress * 100).toFixed(0)}% progress with ${judgments} judgments gives Kira too much power. Consider keeping judgments at 5 for better balance.`;
        }
    },

    // Warning for Black Notebooks + High Criminal Judgments (Advanced Playstyle)
    {
        id: "advancedKiraPlaystyle",
        group: window.DeathNote.recommendations.GROUPS.KIRA_BALANCE,
        priority: 8,
        condition: (settings) => {
            return settingExists(settings, "haveBlackNotebooks") &&
                settingExists(settings, "maximumCriminalJudgments") &&
                getSettingValue(settings, "haveBlackNotebooks", false) &&
                getSettingValue(settings, "maximumCriminalJudgments", 5) > 5;
        },
        message: (settings) => {
            const judgments = getSettingValue(settings, "maximumCriminalJudgments", 5);

            if (settingExists(settings, "canvasTasks") &&
                !getSettingValue(settings, "canvasTasks", true) &&
                judgments >= 7) {
                // Easter egg for the extreme setup
                return "<span style='color: #721c24;'>Canvas Tasks off, Black Notebooks on, AND " + judgments + " criminal judgments creates an extremely difficult environment for investigators.</span>";
            }

            return "<span style='color: #721c24;'>Black Notebooks with " + judgments + " criminal judgments is an advanced playstyle! Some players will find it challenging to identify Kira.</span>";
        }
    },

    // Warning for very short round times
    {
        id: "veryShortRounds",
        group: window.DeathNote.recommendations.GROUPS.ROUND_SETTINGS,
        priority: 6,
        condition: (settings) => {
            return settingExists(settings, "dayNightSeconds") &&
                getSettingValue(settings, "dayNightSeconds", 45) <= 30;
        },
        message: (settings) => {
            const seconds = getSettingValue(settings, "dayNightSeconds", 45);
            return `${seconds}-second rounds are very short! Players will be rushing to complete tasks in time.`;
        }
    },

    // Warning for very short meeting times
    {
        id: "veryShortMeetings",
        group: window.DeathNote.recommendations.GROUPS.ROUND_SETTINGS,
        priority: 5,
        condition: (settings) => {
            return settingExists(settings, "meetingSeconds") &&
                getSettingValue(settings, "meetingSeconds", 150) <= 45;
        },
        message: (settings) => {
            const seconds = getSettingValue(settings, "meetingSeconds", 150);
            return `Only ${seconds} seconds for meetings is very brief. Players will need to make quick decisions without much discussion time.`;
        }
    },

    // Recommendation 14: Default Inputs (2) Recommendation
    {
        id: "defaultInputsRecommendation",
        group: window.DeathNote.recommendations.GROUPS.PLAYER_SETTINGS,
        priority: 3,
        condition: (settings) => {
            if (!settingExists(settings, "numberOfInputs")) return false;

            // Count non-default settings to make this less likely to trigger when other things are interesting
            let nonDefaultCount = 0;
            for (const key in settings) {
                if (key !== "numberOfInputs" && settingExists(settings, key)) {
                    const def = window.DeathNote.settings.settingsDefinitions.find(d => d.id === key);
                    if (def && settings[key].value !== def.defaultValue) {
                        nonDefaultCount++;
                    }
                }
            }

            return getSettingValue(settings, "numberOfInputs", 2) === 2 && nonDefaultCount < 3;
        },
        message: () => {
            return "Two inputs per task is relatively simple. Consider bumping to 3-4 for more engaging gameplay, especially for veteran players!";
        }
    },

    // Approach Warning Disabled
    {
        id: "approachWarningDisabled",
        group: window.DeathNote.recommendations.GROUPS.PLAYER_SETTINGS,
        priority: 7,
        condition: (settings) => {
            return settingExists(settings, "approachWarning") &&
                !getSettingValue(settings, "approachWarning", true);
        },
        message: () => {
            return "<span class='warning-text'>Approach Warning disabled! Players won't know when others are nearby, making it easier for Kira to catch targets unaware.</span>";
        }
    }
];

// Function to get active recommendations based on current settings
window.DeathNote.recommendations.getActiveRecommendations = function(settings) {
    // For debugging, log the settings
    console.log("Checking recommendations with settings:", settings);

    // Get all recommendations that meet their conditions
    const validRecommendations = window.DeathNote.recommendations.recommendations.filter(recommendation => {
        try {
            // Debug each recommendation condition
            const conditionResult = recommendation.condition(settings);
            console.log(`Recommendation '${recommendation.id}' condition evaluated to: ${conditionResult}`);
            return conditionResult;
        } catch (error) {
            console.error(`Error evaluating condition for recommendation '${recommendation.id}':`, error);
            return false;
        }
    });

    // Group recommendations by their group
    const groupedRecommendations = {};
    validRecommendations.forEach(rec => {
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

    // Map to the expected format
    return filteredRecommendations.map(recommendation => ({
        id: recommendation.id,
        message: recommendation.message(settings)
    }));
};

// Function to update the recommendations container in the UI
window.DeathNote.recommendations.updateRecommendations = function() {
    const recommendationsContainer = document.getElementById('recommendations-container');
    if (!recommendationsContainer) {
        console.error("Recommendations container not found");
        return;
    }

    if (!window.DeathNote.settings || !window.DeathNote.settings.settings) {
        console.error("Settings not available for recommendations");
        return;
    }

    console.log("Updating recommendations with current settings");
    const activeRecommendations = window.DeathNote.recommendations.getActiveRecommendations(window.DeathNote.settings.settings);
    console.log(`Found ${activeRecommendations.length} active recommendations`);

    // Clear previous recommendations
    recommendationsContainer.innerHTML = '';

    if (activeRecommendations.length === 0) {
        recommendationsContainer.innerHTML = '<p class="text-muted">No recommendations at this time. Your settings look good!</p>';
        return;
    }

    // Add each recommendation to the container
    activeRecommendations.forEach(recommendation => {
        const recommendationElement = document.createElement('div');
        recommendationElement.className = 'recommendation-item';
        recommendationElement.innerHTML = recommendation.message;
        recommendationsContainer.appendChild(recommendationElement);
    });
};

// Register this module as ready when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("Recommendations module loaded");
    if (window.DeathNote && window.DeathNote.registerModule) {
        window.DeathNote.registerModule('recommendations');
    } else {
        console.error("DeathNote.registerModule is not available");
    }
});