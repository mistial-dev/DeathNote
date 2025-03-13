/**
 * Death Note: Killer Within - Recommendations Model
 * Manages recommendation generation based on settings
 */

(function() {
    'use strict';

    // Recommendation groups to avoid duplicates
    const GROUPS = {
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

    // Recommendations module
    const RecommendationsModel = {
        // Public constants
        GROUPS: GROUPS,

        /**
         * Initialize the recommendations module
         */
        initialize: function() {
            console.log('Recommendations module initialized');
        },

        /**
         * Get active recommendations based on current settings
         * @returns {Array} Array of active recommendation objects
         */
        getActiveRecommendations: function() {
            const settings = DeathNote.getModule('settings');
            if (!settings) {
                console.error('Settings module not available for recommendations');
                return [];
            }

            const settingsData = settings.getAllSettings();

            // Get all recommendations that meet their conditions
            const validRecommendations = this._recommendations.filter(recommendation => {
                try {
                    return recommendation.condition(settingsData);
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
                message: recommendation.message(settingsData)
            }));
        },

        // Private properties

        /**
         * Array of recommendation definitions
         * @private
         */
        _recommendations: [
            // Very low task count (highest priority in TASK_COUNT group)
            {
                id: "veryLowTaskCount",
                group: GROUPS.TASK_COUNT,
                priority: 10, // Highest priority in this group
                condition: (settings) => {
                    return settings.numberOfTasks?.value === 1;
                },
                message: (settings) => {
                    return `Only 1 task? That's like giving L a single clue to find Kira! Players will complete it quickly and have nothing to do. Consider adding more tasks to keep everyone engaged!`;
                }
            },

            // Too Few Tasks (Risk of Boredom)
            {
                id: "tooFewTasks",
                group: GROUPS.TASK_COUNT,
                priority: 5,
                condition: (settings) => {
                    if (!settings.numberOfTasks?.value) return false;

                    const taskCount = settings.numberOfTasks.value;
                    const settings_module = DeathNote.getModule('settings');

                    if (!settings_module) return false;

                    try {
                        const taskCounts = settings_module.calculateIdealTaskCount();
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
                        const settings_module = DeathNote.getModule('settings');
                        if (settings_module) {
                            const taskCounts = settings_module.calculateIdealTaskCount();
                            suggestedTasks = Math.min(8, Math.max(1, taskCounts.ideal));
                        }
                    } catch (e) {
                        console.error("Error calculating task count for message:", e);
                    }

                    return `Consider trying ${suggestedTasks} tasks to keep players occupied! With Kira's timer extensions, they might have more downtime than desired.`;
                }
            },

            // Too Many Tasks (Risk of Overwhelm)
            {
                id: "tooManyTasks",
                group: GROUPS.TASK_COUNT,
                priority: 5,
                condition: (settings) => {
                    if (!settings.numberOfTasks?.value) return false;

                    const taskCount = settings.numberOfTasks.value;
                    const settings_module = DeathNote.getModule('settings');

                    if (!settings_module) return false;

                    try {
                        const taskCounts = settings_module.calculateIdealTaskCount();
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
                        const settings_module = DeathNote.getModule('settings');
                        if (settings_module) {
                            const taskCounts = settings_module.calculateIdealTaskCount();
                            suggestedTasks = Math.min(8, Math.max(1, Math.round(taskCounts.hard)));
                            suggestedTasksAlt = Math.min(8, Math.max(1, Math.round(taskCounts.hard + 1)));
                        }
                    } catch (e) {
                        console.error("Error calculating task count for message:", e);
                    }

                    const taskCount = settings.numberOfTasks.value;
                    return `${taskCount} tasks might be overwhelming! Players might give up. Try ${suggestedTasks} or ${suggestedTasksAlt} for a challenge that won't make them rage quit!`;
                }
            },

            // Low Movement Speed with High Task Count
            {
                id: "lowSpeedHighTasks",
                group: GROUPS.ROUND_SETTINGS,
                priority: 7,
                condition: (settings) => {
                    if (!settings.movementSpeed?.value || !settings.numberOfTasks?.value) {
                        return false;
                    }

                    const speed = settings.movementSpeed.value;
                    const taskCount = settings.numberOfTasks.value;
                    const settings_module = DeathNote.getModule('settings');

                    if (!settings_module) return false;

                    try {
                        const taskCounts = settings_module.calculateIdealTaskCount();
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
                        const settings_module = DeathNote.getModule('settings');
                        if (settings_module) {
                            const taskCounts = settings_module.calculateIdealTaskCount();
                            suggestedTasks = Math.min(8, Math.max(1, taskCounts.ideal));
                        }
                    } catch (e) {
                        console.error("Error calculating task count for message:", e);
                    }

                    const speed = settings.movementSpeed.value;
                    const taskCount = settings.numberOfTasks.value;

                    return `Movement speed ${speed} with ${taskCount} tasks? Players will struggle to get around in time. Either speed up to 1.0 or reduce tasks to ${suggestedTasks} for smoother gameplay.`;
                }
            },

            // Non-default region
            {
                id: "nonDefaultRegion",
                group: GROUPS.PLAYER_SETTINGS,
                priority: 2,
                condition: (settings) => {
                    return settings.lobbyRegion?.value &&
                        settings.lobbyRegion.value !== "America (East)";
                },
                message: (settings) => {
                    const region = settings.lobbyRegion.value;
                    return `Playing in ${region}? Just a heads-up: servers outside US East might take a bit longer to fill up.`;
                }
            },

            // Restricted platform types
            {
                id: "restrictedPlatformTypes",
                group: GROUPS.PLATFORM_SETTINGS,
                priority: 8,
                condition: (settings) => {
                    return (settings.pcAllowed?.value === false) ||
                        (settings.ps4Allowed?.value === false);
                },
                message: (settings) => {
                    let message = "<span style='color: #721c24;'>";

                    if (settings.pcAllowed?.value === false) {
                        message += "Banning PC players cuts your player pool in half. Many PC folks don't cheat!";
                    } else if (settings.ps4Allowed?.value === false) {
                        message += "Console players banned? PS4 players make up a huge chunk of the player base. Your lobby might fill more slowly!";
                    }

                    message += "</span>";
                    return message;
                }
            },

            // Mello Disabled
            {
                id: "melloDisabled",
                group: GROUPS.ROLE_AVAILABILITY,
                priority: 9,
                condition: (settings) => {
                    return settings.melloRole?.value === "0";
                },
                message: () => {
                    return "<span class='warning-text'><strong>No Mello in your lobby?</strong> Players LOVE this role and might leave quickly. Consider enabling it!</span>";
                }
            },

            // Kira Without a Follower
            {
                id: "noKiraFollower",
                group: GROUPS.ROLE_AVAILABILITY,
                priority: 8,
                condition: (settings) => {
                    return settings.kiraFollowerRole?.value === "0";
                },
                message: (settings) => {
                    // Red warning if >= 6 players, regular otherwise
                    const playerCount = settings.maximumPlayers?.value || 10;
                    const isHighPlayerCount = playerCount >= 6;
                    const warningClass = isHighPlayerCount ? "warning-text" : "";
                    return `<span class='${warningClass}'>Poor Kira has no sidekick! ${isHighPlayerCount ? 'With ' + playerCount + ' players, Kira will have a harder time.' : 'Players might leave the lobby quickly!'} Consider adding a Follower.</span>`;
                }
            },

            // Short Rounds with High Inputs
            {
                id: "shortRoundsHighInputs",
                group: GROUPS.ROUND_SETTINGS,
                priority: 6,
                condition: (settings) => {
                    return settings.dayNightSeconds?.value &&
                        settings.numberOfInputs?.value &&
                        settings.dayNightSeconds.value <= 45 &&
                        settings.numberOfInputs.value >= 4;
                },
                message: (settings) => {
                    const seconds = settings.dayNightSeconds.value;
                    const inputs = settings.numberOfInputs.value;
                    return `${seconds} seconds with ${inputs} inputs is rushed! Try dropping inputs to 2-3 or extend rounds to 60+ seconds for a better pace.`;
                }
            },

            // Long Rounds with Low Tasks and High Speed
            {
                id: "longRoundsLowTasksHighSpeed",
                group: GROUPS.ROUND_SETTINGS,
                priority: 5,
                condition: (settings) => {
                    if (!settings.dayNightSeconds?.value ||
                        !settings.numberOfTasks?.value ||
                        !settings.movementSpeed?.value) {
                        return false;
                    }

                    const seconds = settings.dayNightSeconds.value;
                    const taskCount = settings.numberOfTasks.value;
                    const speed = settings.movementSpeed.value;
                    const settings_module = DeathNote.getModule('settings');

                    if (!settings_module) return false;

                    try {
                        const taskCounts = settings_module.calculateIdealTaskCount();
                        return seconds >= 120 && taskCount < taskCounts.ideal && speed >= 1.2;
                    } catch (e) {
                        console.error("Error calculating ideal task count:", e);
                        return false;
                    }
                },
                message: (settings) => {
                    let suggestedTasks = 3;
                    try {
                        const settings_module = DeathNote.getModule('settings');
                        if (settings_module) {
                            const taskCounts = settings_module.calculateIdealTaskCount();
                            suggestedTasks = Math.min(8, Math.max(1, taskCounts.ideal));
                        }
                    } catch (e) {
                        console.error("Error calculating task count for message:", e);
                    }

                    const seconds = settings.dayNightSeconds.value;
                    const taskCount = settings.numberOfTasks.value;
                    const speed = settings.movementSpeed.value;

                    return `Long ${seconds}s rounds, ${speed} speed, but only ${taskCount} tasks? Players will have too much downtime. Consider adding tasks (${suggestedTasks}) to keep them engaged.`;
                }
            },

            // High Player Count with Low Tasks
            {
                id: "highPlayerCountLowTasks",
                group: GROUPS.TASK_COUNT,
                priority: 7,
                condition: (settings) => {
                    if (!settings.maximumPlayers?.value || !settings.numberOfTasks?.value) {
                        return false;
                    }

                    const playerCount = settings.maximumPlayers.value;
                    const taskCount = settings.numberOfTasks.value;
                    const settings_module = DeathNote.getModule('settings');

                    if (!settings_module) return false;

                    try {
                        const taskCounts = settings_module.calculateIdealTaskCount();
                        return playerCount >= 8 && taskCount < taskCounts.ideal;
                    } catch (e) {
                        console.error("Error calculating ideal task count:", e);
                        return false;
                    }
                },
                message: (settings) => {
                    let suggestedTasks = 3;
                    try {
                        const settings_module = DeathNote.getModule('settings');
                        if (settings_module) {
                            const taskCounts = settings_module.calculateIdealTaskCount();
                            suggestedTasks = Math.min(8, Math.max(1, taskCounts.ideal));
                        }
                    } catch (e) {
                        console.error("Error calculating task count for message:", e);
                    }

                    const playerCount = settings.maximumPlayers.value;
                    const taskCount = settings.numberOfTasks.value;

                    return `${taskCount} tasks is a bit low for the day/night cycle time. Try adding tasks (around ${suggestedTasks}) to keep everyone engaged.`;
                }
            },

            // Voice Chat Disabled with Complex Settings
            {
                id: "noVoiceChatComplexSettings",
                group: GROUPS.VOICE_SETTINGS,
                priority: 5,
                condition: (settings) => {
                    if (!settings.voiceChat?.value ||
                        !settings.numberOfTasks?.value ||
                        !settings.numberOfInputs?.value ||
                        !settings.melloRole?.value ||
                        !settings.kiraFollowerRole?.value) {
                        return false;
                    }

                    const voiceChat = settings.voiceChat.value;
                    const taskCount = settings.numberOfTasks.value;
                    const inputCount = settings.numberOfInputs.value;
                    const melloRole = settings.melloRole.value;
                    const kiraFollowerRole = settings.kiraFollowerRole.value;
                    const settings_module = DeathNote.getModule('settings');

                    if (!settings_module) return false;

                    try {
                        const taskCounts = settings_module.calculateIdealTaskCount();
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
                        const settings_module = DeathNote.getModule('settings');
                        if (settings_module) {
                            const taskCounts = settings_module.calculateIdealTaskCount();
                            suggestedTasks = Math.min(8, Math.max(1, taskCounts.ideal));
                        }
                    } catch (e) {
                        console.error("Error calculating task count for message:", e);
                    }

                    return `No voice chat with complex settings might be chaotic. Either enable voice chat or simplify (try ${suggestedTasks} tasks, 2-3 inputs) for clearer teamwork.`;
                }
            },

            // Canvas Tasks Disabled (stronger warning)
            {
                id: "canvasTasksDisabled",
                group: GROUPS.CANVAS_SETTINGS,
                priority: 9,
                condition: (settings) => {
                    return settings.canvasTasks?.value === false;
                },
                message: () => {
                    return "<span class='warning-text'><strong>Canvas Tasks are disabled!</strong> Team Kira will struggle to blend in. Investigators can easily track Kira, leading to frustrated players. Consider enabling Canvas Tasks.</span>";
                }
            },

            // Unbalanced Progress Multipliers
            {
                id: "unbalancedProgressMultipliers",
                group: GROUPS.PROGRESS_SETTINGS,
                priority: 8,
                condition: (settings) => {
                    return settings.kiraProgressMultiplier?.value &&
                        settings.teamLProgressMultiplier?.value &&
                        Math.abs(settings.kiraProgressMultiplier.value -
                            settings.teamLProgressMultiplier.value) > 0.5;
                },
                message: (settings) => {
                    const kiraProgress = settings.kiraProgressMultiplier.value;
                    const teamLProgress = settings.teamLProgressMultiplier.value;

                    return `Kira's progress at ${(kiraProgress * 100).toFixed(0)}% and L's at ${(teamLProgress * 100).toFixed(0)}%? A gap over 50% feels unbalanced. Consider evening them out for fairer gameplay.`;
                }
            },

            // Low New World Progress (Stale Meta)
            {
                id: "lowNewWorldProgress",
                group: GROUPS.PROGRESS_SETTINGS,
                priority: 6,
                condition: (settings) => {
                    return settings.kiraProgressMultiplier?.value &&
                        settings.kiraProgressMultiplier.value < 1.4;
                },
                message: (settings) => {
                    const kiraProgress = settings.kiraProgressMultiplier.value;

                    return `Kira's progress at only ${(kiraProgress * 100).toFixed(0)}%? Players may group up and skip tasks. Consider boosting to 140-150% to encourage movement.`;
                }
            },

            // High New World Progress with Excessive Criminal Judgments
            {
                id: "highProgressExcessiveJudgments",
                group: GROUPS.KIRA_BALANCE,
                priority: 7,
                condition: (settings) => {
                    return settings.kiraProgressMultiplier?.value &&
                        settings.maximumCriminalJudgments?.value &&
                        settings.kiraProgressMultiplier.value >= 1.4 &&
                        settings.maximumCriminalJudgments.value > 5;
                },
                message: (settings) => {
                    const kiraProgress = settings.kiraProgressMultiplier.value;
                    const judgments = settings.maximumCriminalJudgments.value;

                    return `Kira at ${(kiraProgress * 100).toFixed(0)}% progress with ${judgments} judgments gives Kira too much power. Consider keeping judgments at 5 for better balance.`;
                }
            },

            // Warning for Black Notebooks + High Criminal Judgments (Advanced Playstyle)
            {
                id: "advancedKiraPlaystyle",
                group: GROUPS.KIRA_BALANCE,
                priority: 8,
                condition: (settings) => {
                    return settings.haveBlackNotebooks?.value === true &&
                        settings.maximumCriminalJudgments?.value &&
                        settings.maximumCriminalJudgments.value > 5;
                },
                message: (settings) => {
                    const judgments = settings.maximumCriminalJudgments.value;

                    if (settings.canvasTasks?.value === false &&
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
                group: GROUPS.ROUND_SETTINGS,
                priority: 6,
                condition: (settings) => {
                    return settings.dayNightSeconds?.value &&
                        settings.dayNightSeconds.value <= 30;
                },
                message: (settings) => {
                    const seconds = settings.dayNightSeconds.value;
                    return `${seconds}-second rounds are very short! Players will be rushing to complete tasks in time.`;
                }
            },

            // Warning for very short meeting times
            {
                id: "veryShortMeetings",
                group: GROUPS.ROUND_SETTINGS,
                priority: 5,
                condition: (settings) => {
                    return settings.meetingSeconds?.value &&
                        settings.meetingSeconds.value <= 45;
                },
                message: (settings) => {
                    const seconds = settings.meetingSeconds.value;
                    return `Only ${seconds} seconds for meetings is very brief. Players will need to make quick decisions without much discussion time.`;
                }
            },

            // Default Inputs (2) Recommendation
            {
                id: "defaultInputsRecommendation",
                group: GROUPS.PLAYER_SETTINGS,
                priority: 3,
                condition: (settings) => {
                    if (!settings.numberOfInputs?.value) return false;

                    // Count non-default settings to make this less likely to trigger when other things are interesting
                    let nonDefaultCount = 0;
                    const settings_module = DeathNote.getModule('settings');
                    if (settings_module) {
                        const defs = settings_module.getAllDefinitions();
                        for (const key in settings) {
                            if (key !== "numberOfInputs" && settings[key]?.value !== undefined) {
                                const def = defs.find(d => d.id === key);
                                if (def && settings[key].value !== def.defaultValue) {
                                    nonDefaultCount++;
                                }
                            }
                        }
                    }

                    return settings.numberOfInputs.value === 2 && nonDefaultCount < 3;
                },
                message: () => {
                    return "Two inputs per task is relatively simple. Consider bumping to 3-4 for more engaging gameplay, especially for veteran players!";
                }
            },

            // Approach Warning Disabled
            {
                id: "approachWarningDisabled",
                group: GROUPS.PLAYER_SETTINGS,
                priority: 7,
                condition: (settings) => {
                    return settings.approachWarning?.value === false;
                },
                message: () => {
                    return "<span class='warning-text'>Approach Warning disabled! Players won't know when others are nearby, making it easier for Kira to catch targets unaware.</span>";
                }
            }
        ]
    };

    // Register the module with the application
    DeathNote.registerModule('recommendations', RecommendationsModel);
})();