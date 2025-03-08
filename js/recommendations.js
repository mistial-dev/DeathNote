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
            return `Only ${settings.numberOfTasks.value} tasks? Players might get more bored than L during a sugar shortage! 😴 With Kira's timer extensions, they'll have more downtime than a death god on vacation. Try bumping it up to ${taskCounts.ideal} to keep everyone occupied!`;
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
            return `Whoa, ${settings.numberOfTasks.value} tasks? That's more overwhelming than Light's college entrance exams! 📚 Players might give up faster than Matsuda at a crime scene. Maybe dial it back to ${taskCounts.hard} or ${taskCounts.hard + 1} for a challenge that won't make them rage quit!`;
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
            return `Movement speed ${settings.movementSpeed.value} with ${settings.numberOfTasks.value} tasks? Players will move slower than Watari after a all-nighter! 🐢 They'll struggle more than Near trying to build a card tower in a hurricane. Either speed 'em up to 1.0 or cut tasks to ${taskCounts.ideal} for a smoother game!`;
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
            let message = "<span class='relevancy-critical'>";

            if (settings.pcAllowed && !settings.pcAllowed.value) {
                message += "Banning PC players? Bold move, cotton! 🧐 Many PC folks don't cheat, and you're cutting your player pool in half. Like judging all Kiras by Light Yagami's standards!";
            } else if (settings.ps4Allowed && !settings.ps4Allowed.value) {
                message += "Console players banned? That's cold! 🥶 PS4 players make up a huge chunk of the player base. Your lobby might be emptier than L's candy jar!";
            }

            message += "</span>";
            return message;
        }
    },

    // Recommendation 4: Mello Disabled - Updated styling with no extra box
    {
        id: "melloDisabled",
        condition: (settings) => {
            return settings.melloRole && settings.melloRole.value === "0";
        },
        message: () => {
            // Just using styled text, not an alert box
            return `<span style="color: #721c24;"><strong>No Mello in your lobby?</strong> That's like Death Note without chocolate! 🍫 Players LOVE this role and might bail faster than Light ditches girlfriends. Maybe reconsider?</span>`;
        }
    },

    // Recommendation 5: Kira Without a Follower
    {
        id: "noKiraFollower",
        condition: (settings) => {
            return settings.kiraFollowerRole && settings.kiraFollowerRole.value === "0";
        },
        message: (settings) => {
            // Red warning if >= 6 players, yellow otherwise
            const isHighPlayerCount = settings.maximumPlayers && settings.maximumPlayers.value >= 6;
            const warningClass = isHighPlayerCount ? 'relevancy-critical' : '';
            return `<span class='${warningClass}'>Poor Kira has no sidekick! 😢 Even evil masterminds need a friend. ${isHighPlayerCount ? 'With ' + settings.maximumPlayers.value + ' players, Kira\'s gonna have a harder time than L at a cake-eating contest.' : 'Players might ghost the lobby faster than Mikami abandons a losing battle!'} Consider adding a Follower?</span>`;
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
            return `Long ${settings.dayNightSeconds.value}-second rounds, zippy ${settings.movementSpeed.value} speed, but only ${settings.numberOfTasks.value} tasks? 🥱 Players will have more downtime than Ryuk watching humans from the Shinigami realm! Even with Kira's tricks, bump tasks up to ${taskCounts.ideal} to keep things interesting!`;
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
            return `${settings.maximumPlayers.value} players but only ${settings.numberOfTasks.value} tasks? That's more crowded than the Task Force HQ with nothing to do! 👥 More players = higher chance of thumb-twiddling. Add tasks (${taskCounts.ideal}+) before players get bored enough to start writing each other's names in notebooks!`;
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
            return `No voice chat with complex settings? That's more chaotic than the Yotsuba Group meetings! 🔇 Players will be as confused as Light with amnesia. Either turn on the mics or simplify (${taskCounts.ideal} tasks, 2-3 inputs) for clearer teamwork!`;
        }
    },

    // Recommendation 10: Canvas Tasks Disabled
    {
        id: "canvasTasksDisabled",
        condition: (settings) => {
            return settings.canvasTasks && !settings.canvasTasks.value;
        },
        message: () => {
            return "Disabling Canvas Tasks? Team Kira will be exposed faster than Light's ego! 🎭 They can't blend in, and others will use boring NPC tricks to catch them. Turn Canvas Tasks on to keep the game as sneaky as intended!";
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
            return `Kira's progress at ${settings.kiraProgressMultiplier.value} and L's at ${settings.teamLProgressMultiplier.value}? That's more unbalanced than Light's mental state! ⚖️ A gap over 0.5 feels like playing different games. Even them out so neither side feels like they're fighting Takada's bodyguards!`;
        }
    },

    // Recommendation 12: Low New World Progress (Stale Meta)
    {
        id: "lowNewWorldProgress",
        condition: (settings) => {
            return settings.kiraProgressMultiplier && settings.kiraProgressMultiplier.value < 1.4;
        },
        message: (settings) => {
            return `Kira's progress at a measly ${settings.kiraProgressMultiplier.value}? Players will huddle up and skip tasks like they're dodging Misa's deadly cooking skills! 🍳 Boost it to 1.4 or 1.5 to give Kira some edge and get everyone running around like Matsuda at a crime scene!`;
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
            return `Kira at ${settings.kiraProgressMultiplier.value} progress with ${settings.maximumCriminalJudgments.value} judgments? That's more overpowered than Light with Rem's help! 💪 Kira will win faster than L can say "cake." Keep judgments at 5 so others stand a chance!`;
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