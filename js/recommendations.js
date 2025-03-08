/**
 * Recommendations for Death Note: Killer Within Lobby Discord Post Generator
 * This file defines recommendations that are shown to the user based on their current settings
 */

// Create or extend the DeathNote namespace
window.DeathNote = window.DeathNote || {};
window.DeathNote.recommendations = window.DeathNote.recommendations || {};

// Array of recommendation objects
window.DeathNote.recommendations.recommendations = [
    // Recommendation 1: Too Few Tasks (Risk of Boredom)
    {
        id: "tooFewTasks",
        condition: (settings) => {
            const taskCounts = window.DeathNote.settings.calculateIdealTaskCount(settings);
            return settings.numberOfTasks.value < taskCounts.ideal;
        },
        message: (settings) => {
            const taskCounts = window.DeathNote.settings.calculateIdealTaskCount(settings);
            const suggestedTasks = Math.min(8, Math.max(1, taskCounts.ideal)); // Clamp between 1-8
            return `Only ${settings.numberOfTasks.value} tasks? Players might get more bored than L during a sugar shortage! 😴 With Kira's timer extensions, they'll have more downtime than a death god on vacation. Consider trying ${suggestedTasks} tasks to keep everyone occupied!`;
        }
    },

    // Recommendation 2: Too Many Tasks (Risk of Overwhelm)
    {
        id: "tooManyTasks",
        condition: (settings) => {
            const taskCounts = window.DeathNote.settings.calculateIdealTaskCount(settings);
            return settings.numberOfTasks.value > taskCounts.hard + 1 &&
                (settings.numberOfTasks.value / (taskCounts.hard + 1) > 1.25); // 75% chance not to complete
        },
        message: (settings) => {
            const taskCounts = window.DeathNote.settings.calculateIdealTaskCount(settings);
            const suggestedTasks = Math.min(8, Math.max(1, taskCounts.hard)); // Clamp between 1-8
            const suggestedTasksAlt = Math.min(8, Math.max(1, taskCounts.hard + 1)); // Alternative
            return `Whoa, ${settings.numberOfTasks.value} tasks? That's more overwhelming than Light's college entrance exams! 📚 Players might give up faster than Matsuda at a crime scene. Maybe try ${suggestedTasks} or ${suggestedTasksAlt} tasks for a challenge that won't make them rage quit!`;
        }
    },

    // Recommendation 3: Low Movement Speed with High Task Count
    {
        id: "lowSpeedHighTasks",
        condition: (settings) => {
            const taskCounts = window.DeathNote.settings.calculateIdealTaskCount(settings);
            return settings.movementSpeed.value < 0.8 &&
                settings.numberOfTasks.value > taskCounts.ideal + 1;
        },
        message: (settings) => {
            const taskCounts = window.DeathNote.settings.calculateIdealTaskCount(settings);
            const suggestedTasks = Math.min(8, Math.max(1, taskCounts.ideal)); // Clamp between 1-8
            return `Movement speed ${settings.movementSpeed.value} with ${settings.numberOfTasks.value} tasks? Players will move slower than Watari after an all-nighter! 🐢 They'll struggle more than Near trying to build a card tower in a hurricane. Either speed 'em up to 1.0 or try reducing tasks to around ${suggestedTasks} for a smoother game!`;
        }
    },

    // Add recommendation for non-US East regions
    {
        id: "nonDefaultRegion",
        condition: (settings) => {
            return settings.lobbyRegion && settings.lobbyRegion.value !== "America (East)";
        },
        message: (settings) => {
            return `Playing in ${settings.lobbyRegion.value}? Bold choice! Just a friendly heads-up: servers outside US East might take a bit longer to fill up. Think of it as extra time to practice your Kira laugh! 😈`;
        }
    },

    // Add recommendation for restricted platform types
    {
        id: "restrictedPlatformTypes",
        condition: (settings) => {
            return (settings.pcAllowed && !settings.pcAllowed.value) ||
                (settings.ps4Allowed && !settings.ps4Allowed.value);
        },
        message: (settings) => {
            let message = "<span style='color: #721c24;'>";

            if (settings.pcAllowed && !settings.pcAllowed.value) {
                message += "Banning PC players? Bold move, cotton! 🧐 Many PC folks don't cheat, and you're cutting your player pool in half. Like judging all Kiras by Light Yagami's standards!";
            } else if (settings.ps4Allowed && !settings.ps4Allowed.value) {
                message += "Console players banned? That's cold! 🥶 PS4 players make up a huge chunk of the player base. Your lobby might be emptier than L's candy jar!";
            }

            message += "</span>";
            return message;
        }
    },

    // Recommendation 4: Mello Disabled
    {
        id: "melloDisabled",
        condition: (settings) => {
            return settings.melloRole && settings.melloRole.value === "0";
        },
        message: () => {
            return "<span class='warning-text'><strong>No Mello in your lobby?</strong> That's like Death Note without chocolate! 🍫 Players LOVE this role and might bail faster than Light ditches girlfriends. Maybe reconsider?</span>";
        }
    },

    // Recommendation 5: Kira Without a Follower
    {
        id: "noKiraFollower",
        condition: (settings) => {
            return settings.kiraFollowerRole && settings.kiraFollowerRole.value === "0";
        },
        message: (settings) => {
            // Red warning if >= 6 players, regular otherwise
            const isHighPlayerCount = settings.maximumPlayers && settings.maximumPlayers.value >= 6;
            const warningClass = isHighPlayerCount ? "warning-text" : "";
            return `<span class='${warningClass}'>Poor Kira has no sidekick! 😢 Even evil masterminds need a friend. ${isHighPlayerCount ? 'With ' + settings.maximumPlayers.value + ' players, Kira\'s gonna have a harder time than L at a cake-eating contest.' : 'Players might ghost the lobby faster than Mikami abandons a losing battle!'} Consider adding a Follower?</span>`;
        }
    },

    // Recommendation 5: Kira Without a Follower
    {
        id: "noKiraFollower",
        condition: (settings) => {
            return settings.kiraFollowerRole && settings.kiraFollowerRole.value === "0";
        },
        message: (settings) => {
            // Red warning if >= 6 players, regular otherwise
            const isHighPlayerCount = settings.maximumPlayers && settings.maximumPlayers.value >= 6;
            const colorStyle = isHighPlayerCount ? "color: #721c24;" : "";
            return `<span style='${colorStyle}'>Poor Kira has no sidekick! 😢 Even evil masterminds need a friend. ${isHighPlayerCount ? 'With ' + settings.maximumPlayers.value + ' players, Kira\'s gonna have a harder time than L at a cake-eating contest.' : 'Players might ghost the lobby faster than Mikami abandons a losing battle!'} Consider adding a Follower?</span>`;
        }
    },

    // Recommendation 6: Short Rounds with High Inputs
    {
        id: "shortRoundsHighInputs",
        condition: (settings) => {
            return settings.dayNightSeconds && settings.numberOfInputs &&
                settings.dayNightSeconds.value <= 45 &&
                settings.numberOfInputs.value >= 4;
        },
        message: (settings) => {
            return `${settings.dayNightSeconds.value} seconds with ${settings.numberOfInputs.value} inputs? That's more rushed than Ryuk when apples are on sale! ⏱️ Players might complete fewer tasks than Light on a potato chip binge. Try dropping inputs to 2-3 or extend rounds to 60+ seconds for a better pace!`;
        }
    },

    // Recommendation 7: Long Rounds with Low Tasks and High Speed
    {
        id: "longRoundsLowTasksHighSpeed",
        condition: (settings) => {
            const taskCounts = window.DeathNote.settings.calculateIdealTaskCount(settings);
            return settings.dayNightSeconds && settings.numberOfTasks && settings.movementSpeed &&
                settings.dayNightSeconds.value >= 120 &&
                settings.numberOfTasks.value < taskCounts.ideal &&
                settings.movementSpeed.value >= 1.2;
        },
        message: (settings) => {
            const taskCounts = window.DeathNote.settings.calculateIdealTaskCount(settings);
            const suggestedTasks = Math.min(8, Math.max(1, taskCounts.ideal)); // Clamp between 1-8
            return `Long ${settings.dayNightSeconds.value}-second rounds, zippy ${settings.movementSpeed.value} speed, but only ${settings.numberOfTasks.value} tasks? 🥱 Players will have more downtime than Ryuk watching humans from the Shinigami realm! Even with Kira's tricks, consider bumping tasks up to around ${suggestedTasks} to keep things interesting!`;
        }
    },

    // Recommendation 8: High Player Count with Low Tasks
    {
        id: "highPlayerCountLowTasks",
        condition: (settings) => {
            const taskCounts = window.DeathNote.settings.calculateIdealTaskCount(settings);
            return settings.maximumPlayers && settings.numberOfTasks &&
                settings.maximumPlayers.value >= 8 &&
                settings.numberOfTasks.value < taskCounts.ideal;
        },
        message: (settings) => {
            const taskCounts = window.DeathNote.settings.calculateIdealTaskCount(settings);
            const suggestedTasks = Math.min(8, Math.max(1, taskCounts.ideal)); // Clamp between 1-8
            return `${settings.maximumPlayers.value} players but only ${settings.numberOfTasks.value} tasks? That's more crowded than the Task Force HQ with nothing to do! 👥 More players = higher chance of thumb-twiddling. With this many players, you'll have lots of folks standing around waiting. Try adding tasks (around ${suggestedTasks}) before players get bored enough to start writing each other's names in notebooks!`;
        }
    },

    // Recommendation for very low task count
    {
        id: "veryLowTaskCount",
        condition: (settings) => {
            return settings.numberOfTasks && settings.numberOfTasks.value === 1;
        },
        message: (settings) => {
            return `Only 1 task? That's like giving L a single clue to find Kira! 🔍 Players will complete it quickly and then have nothing to do but anxiously wait. The more players you have, the more people will be twiddling their thumbs. Consider adding at least one more task to keep everyone engaged!`;
        }
    },

    // Recommendation 9: Voice Chat Disabled with Complex Settings
    {
        id: "noVoiceChatComplexSettings",
        condition: (settings) => {
            const taskCounts = window.DeathNote.settings.calculateIdealTaskCount(settings);
            return settings.voiceChat && settings.numberOfTasks && settings.numberOfInputs &&
                settings.melloRole && settings.kiraFollowerRole &&
                !settings.voiceChat.value &&
                (settings.numberOfTasks.value > taskCounts.hard ||
                    settings.numberOfInputs.value >= 4 ||
                    settings.melloRole.value === "random" ||
                    settings.kiraFollowerRole.value === "random");
        },
        message: (settings) => {
            const taskCounts = window.DeathNote.settings.calculateIdealTaskCount(settings);
            const suggestedTasks = Math.min(8, Math.max(1, taskCounts.ideal)); // Clamp between 1-8
            return `No voice chat with complex settings? That's more chaotic than the Yotsuba Group meetings! 🔇 Players will be as confused as Light with amnesia. Either turn on the mics or simplify (try ${suggestedTasks} tasks, 2-3 inputs) for clearer teamwork!`;
        }
    },

    // Recommendation 10: Canvas Tasks Disabled (stronger warning)
    {
        id: "canvasTasksDisabled",
        condition: (settings) => {
            return settings.canvasTasks && !settings.canvasTasks.value;
        },
        message: () => {
            return "<span class='warning-text'><strong>Canvas Tasks are disabled!</strong> Team Kira will struggle to blend in! 🎭 Investigators can use NPC feedback to easily track Kira's movements. This often leads to frustrated Kira players and an un-fun meta. Consider enabling Canvas Tasks for a better experience.</span>";
        }
    },

    // Recommendation 11: Unbalanced Progress Multipliers
    {
        id: "unbalancedProgressMultipliers",
        condition: (settings) => {
            return settings.kiraProgressMultiplier && settings.teamLProgressMultiplier &&
                Math.abs(settings.kiraProgressMultiplier.value - settings.teamLProgressMultiplier.value) > 0.5;
        },
        message: (settings) => {
            return `Kira's progress at ${(settings.kiraProgressMultiplier.value * 100).toFixed(0)}% and L's at ${(settings.teamLProgressMultiplier.value * 100).toFixed(0)}%? That's more unbalanced than Light's mental state! ⚖️ A gap over 50% feels like playing different games. Consider evening them out so neither side feels like they're fighting Takada's bodyguards!`;
        }
    },

    // Recommendation 12: Low New World Progress (Stale Meta)
    {
        id: "lowNewWorldProgress",
        condition: (settings) => {
            return settings.kiraProgressMultiplier && settings.kiraProgressMultiplier.value < 1.4;
        },
        message: (settings) => {
            return `Kira's progress at a measly ${(settings.kiraProgressMultiplier.value * 100).toFixed(0)}%? Players will huddle up and skip tasks like they're dodging Misa's deadly cooking skills! 🍳 Consider boosting it to 140% or 150% to give Kira some edge and get everyone running around like Matsuda at a crime scene!`;
        }
    },

    // Recommendation 13: High New World Progress with Excessive Criminal Judgments
    {
        id: "highProgressExcessiveJudgments",
        condition: (settings) => {
            return settings.kiraProgressMultiplier && settings.maximumCriminalJudgments &&
                settings.kiraProgressMultiplier.value >= 1.4 &&
                settings.maximumCriminalJudgments.value > 5;
        },
        message: (settings) => {
            return `Kira at ${(settings.kiraProgressMultiplier.value * 100).toFixed(0)}% progress with ${settings.maximumCriminalJudgments.value} judgments? That's more overpowered than Light with Rem's help! 💪 Kira will win faster than L can say "cake." Consider keeping judgments at 5 so others stand a chance!`;
        }
    },

    // Warning for Black Notebooks + High Criminal Judgments (Advanced Playstyle)
    {
        id: "advancedKiraPlaystyle",
        condition: (settings) => {
            return settings.haveBlackNotebooks && settings.haveBlackNotebooks.value &&
                settings.maximumCriminalJudgments && settings.maximumCriminalJudgments.value > 5;
        },
        message: (settings) => {
            if (settings.canvasTasks && !settings.canvasTasks.value &&
                settings.maximumCriminalJudgments.value >= 7) {
                // Easter egg for the extreme setup
                return "<span style='color: #721c24;'>Are you actually Osamu Dazai in disguise? 🧐 Canvas Tasks off, Black Notebooks on, AND " + settings.maximumCriminalJudgments.value + " criminal judgments? This is more chaotic than Ryuk after eating fermented apples! Investigators will need supernatural detective skills just to have a chance. Are you perhaps trying to create the perfect crime?</span>";
            }

            return "<span style='color: #721c24;'>Black Notebooks with " + settings.maximumCriminalJudgments.value + " criminal judgments is an advanced playstyle! 📓 Some players will find it extremely challenging to identify Kira. If your lobby has newbies, they might get as confused as Matsuda at... well, anywhere.</span>";
        }
    },

    // Warning for very short round times
    {
        id: "veryShortRounds",
        condition: (settings) => {
            return settings.dayNightSeconds && settings.dayNightSeconds.value <= 30;
        },
        message: (settings) => {
            return `${settings.dayNightSeconds.value}-second rounds? That's shorter than L's patience for sweets thieves! ⏱️ Players will be rushing around like Mikami late to court. Hope they enjoy speed-running their tasks like they're trying to beat Near to a conclusion!`;
        }
    },

    // Warning for very short meeting times
    {
        id: "veryShortMeetings",
        condition: (settings) => {
            return settings.meetingSeconds && settings.meetingSeconds.value <= 45;
        },
        message: (settings) => {
            return `Only ${settings.meetingSeconds.value} seconds for meetings? That's barely enough time to say "I am L"! 🗣️ Players will need to make decisions faster than Light writes names in the Death Note. Hope no one needs time to explain their alibi!`;
        }
    },

    // Recommendation 14: Default Inputs (2) Recommendation
    {
        id: "defaultInputsRecommendation",
        condition: (settings) => {
            // Count non-default settings to make this less likely to trigger when other things are interesting
            let nonDefaultCount = 0;
            for (const key in settings) {
                const def = window.DeathNote.settings.settingsDefinitions.find(d => d.id === key);
                if (def && settings[key].value !== def.defaultValue && key !== "numberOfInputs") {
                    nonDefaultCount++;
                }
            }

            return settings.numberOfInputs && settings.numberOfInputs.value === 2 && nonDefaultCount < 3;
        },
        message: () => {
            return "Two inputs per task might be simpler than Matsuda's detective skills! 🤔 Consider bumping to 3-4 for more engaging gameplay, especially for your veteran death note wielders!";
        }
    }
];

// Function to get active recommendations based on current settings
window.DeathNote.recommendations.getActiveRecommendations = function(settings) {
    // For debugging, log the settings
    console.log("Checking recommendations with settings:", settings);

    // Specifically log the melloRole setting to debug
    if (settings.melloRole) {
        console.log("melloRole setting:", settings.melloRole.value);
    } else {
        console.log("melloRole setting not found in settings object");
    }

    return window.DeathNote.recommendations.recommendations.filter(recommendation => {
        try {
            // Debug each recommendation condition
            const conditionResult = recommendation.condition(settings);
            console.log(`Recommendation '${recommendation.id}' condition evaluated to: ${conditionResult}`);
            return conditionResult;
        } catch (error) {
            console.error(`Error evaluating condition for recommendation '${recommendation.id}':`, error);
            return false;
        }
    }).map(recommendation => ({
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
        recommendationsContainer.innerHTML = '<p class="text-muted">No recommendations at this time. Your settings look more perfect than Light\'s handwriting!</p>';
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