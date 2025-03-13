/**
 * Death Note: Killer Within - Output UI Module
 * Handles generating the Discord post output and related UI
 */

(function() {
    'use strict';

    // Output UI Module
    const OutputUI = {
        // DOM Element references
        elements: {
            outputBox: null,
            copyBtn: null,
            copyLinkBtn: null,
            balanceIndicator: null,
            funIndicator: null,
            balanceValue: null,
            funValue: null
        },

        // Emojis for each setting type
        settingEmojis: {
            lobbyCode: ":label:",
            lobbyRegion: ":earth_americas:",
            lobbyPrivacy: ":lock:",
            roleSelection: ":busts_in_silhouette:",
            pcAllowed: ":desktop:",
            ps4Allowed: ":video_game:",
            voiceChat: ":microphone2:",
            melloRole: ":mag:",
            kiraFollowerRole: ":notebook_with_decorative_cover:",
            movementSpeed: ":runner:",
            maximumPlayers: ":family:",
            numberOfTasks: ":clipboard:",
            numberOfInputs: ":keyboard:",
            dayNightSeconds: ":hourglass:",
            haveBlackNotebooks: ":black_large_square:",
            canvasTasks: ":art:",
            maximumCriminalJudgments: ":scales:",
            meetingSeconds: ":speaking_head:",
            kiraProgressMultiplier: ":chart_with_upwards_trend:",
            teamLProgressMultiplier: ":detective:",
            allowedPlayerType: ":game_die:",
            approachWarning: ":bell:"
        },

        /**
         * Initialize the Output UI module
         */
        initialize: function() {
            this._initializeElements();
            this._setupEventListeners();
            this.updateOutput();

            console.log('Output UI initialized');
        },

        /**
         * Update the output in the textbox
         */
        updateOutput: function() {
            const settings = DeathNote.getModule('settings');
            if (!settings) {
                console.error('Settings module not available');
                return;
            }

            const BINS = settings.BINS;
            const settingsData = settings.getAllSettings();
            const definitions = settings.getAllDefinitions();

            if (!this.elements.outputBox) {
                console.error('Output box not found');
                return;
            }

            // Check if lobby code is set
            const lobbyCode = settings.getValue('lobbyCode', '');
            if (!lobbyCode || lobbyCode.length < 5) {
                // Show prompt if lobby code is not set properly
                this.elements.outputBox.value = "# Please Enter Lobby Code\n\nEnter a 5-character lobby code in the settings to generate your Discord post.";
                return;
            }

            // Count non-default settings for threshold calculation
            let nonDefaultCount = 0;
            definitions.forEach(definition => {
                if (settings.getValue(definition.id, null) !== definition.defaultValue) {
                    nonDefaultCount++;
                }
            });

            // Calculate dynamic threshold based on non-default count
            const threshold = Math.min(0.6, 0.08 * nonDefaultCount + 0.2);

            // Organize settings by bin
            const settingsByBin = {};
            settingsByBin[BINS.LOBBY] = [];
            settingsByBin[BINS.PLAYER] = [];
            settingsByBin[BINS.GAMEPLAY] = [];

            // Process settings for visibility
            definitions.forEach(definition => {
                const settingId = definition.id;

                // Skip if manually set to not visible
                if (settingsData[settingId]?.manuallySet && !settingsData[settingId]?.visible) {
                    return;
                }

                // Set initial visibility based on relevancy score and threshold
                let isVisible = false;

                // Force visibility for critical settings that can't be hidden
                if (!definition.canHide) {
                    isVisible = true;
                }
                // Determine visibility by threshold if not manually set
                else if (!settingsData[settingId]?.manuallySet) {
                    isVisible = settingsData[settingId]?.relevancyScore > threshold;
                }
                // Use manual setting if available
                else {
                    isVisible = settingsData[settingId]?.visible;
                }

                // Apply visibility rules (handled by settings.js)
                isVisible = settings.applySettingVisibilityRules(definition, isVisible);

                // Special case for Allowed Player Type
                if (definition.type === 'checkbox-group') {
                    // Skip parent, we'll process each option separately
                    return;
                }

                // Only add visible settings to the output bins
                if (isVisible) {
                    settingsByBin[definition.bin].push({
                        id: definition.id,
                        name: definition.name,
                        value: settings.getSettingDisplayValue(definition) || settingsData[definition.id]?.value,
                        relevancyScore: settingsData[definition.id]?.relevancyScore || 0
                    });
                }
            });

            // Process special setting groups
            settings.processSpecialSettingGroups(settingsByBin);

            // Sort settings within each bin by relevancy score (descending)
            Object.keys(settingsByBin).forEach(bin => {
                settingsByBin[bin].sort((a, b) => b.relevancyScore - a.relevancyScore);
            });

            // Determine header theme based on settings
            let headerEmoji = ":notepad_spiral:";
            let headerDecoration = "═════════════════════════";

            const balanceRating = this.calculateGameBalanceRating();
            const funRating = this.calculateFunRating();

            // Choose appropriate header based on balance/fun
            if (funRating >= 90) {
                headerEmoji = ":fire:";
                headerDecoration = "━━━━━━━━━━━━━━━━━━━━━━━━━━━";
            } else if (balanceRating < 60) {
                headerEmoji = ":warning:";
                headerDecoration = "⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️";
            } else if (settings.getValue('melloRole', '1') === "0" ||
                settings.getValue('kiraFollowerRole', '1') === "0") {
                headerEmoji = ":warning:";
            }

            // Build the output markdown with Discord-friendly formatting and decorative elements
            // Starting with an empty line for better spacing in Discord
            let output = `_ _\n# ${headerEmoji} **DEATH NOTE: KILLER WITHIN** ${headerEmoji}\n\n`;

            // Add each bin to the output (only if it has visible settings)
            Object.keys(settingsByBin).forEach(bin => {
                const binSettings = settingsByBin[bin];

                if (binSettings.length > 0) {
                    // Add section divider for non-lobby sections
                    if (bin !== BINS.LOBBY) {
                        output += `## ${this._getBinEmoji(bin)} ${bin}\n\n`;
                    }

                    binSettings.forEach(setting => {
                        let settingName = setting.name;
                        let settingValue = setting.value;
                        const emoji = this.settingEmojis[setting.id] || ":small_blue_diamond:";

                        // Format the setting name and value based on relevancy score
                        if (setting.relevancyScore >= 1.0) {
                            // Critical setting - use bold and warning emoji
                            output += `${emoji} **${settingName}**: **${settingValue}** :warning:\n`;
                        } else if (setting.relevancyScore >= 0.7) {
                            // Important setting - use bold name and value
                            output += `${emoji} **${settingName}**: **${settingValue}**\n`;
                        } else {
                            // Regular setting - only bold the name
                            output += `${emoji} ${settingName}: ${settingValue}\n`;
                        }
                    });

                    output += '\n';
                }
            });

            output += `${settings.creditLine}`;

            // Update the output box
            this.elements.outputBox.value = output;

            // Update ratings
            this.updateRatings();
        },

        /**
         * Update the balance and fun ratings
         */
        updateRatings: function() {
            const balanceRating = this.calculateGameBalanceRating();
            const funRating = this.calculateFunRating();

            if (this.elements.balanceValue) {
                this.elements.balanceValue.textContent = balanceRating;
            }

            if (this.elements.funValue) {
                this.elements.funValue.textContent = funRating;
            }

            // Update balance indicator styling
            if (this.elements.balanceIndicator) {
                this.elements.balanceIndicator.className = 'badge rounded-pill me-2';

                if (balanceRating >= 80) {
                    this.elements.balanceIndicator.classList.add('bg-success');
                } else if (balanceRating >= 60) {
                    this.elements.balanceIndicator.classList.add('bg-warning', 'text-dark');
                } else {
                    this.elements.balanceIndicator.classList.add('bg-danger');
                }
            }

            // Update fun indicator styling
            if (this.elements.funIndicator) {
                this.elements.funIndicator.className = 'badge rounded-pill me-2';

                if (funRating >= 80) {
                    this.elements.funIndicator.classList.add('bg-success');
                } else if (funRating >= 60) {
                    this.elements.funIndicator.classList.add('bg-warning', 'text-dark');
                } else {
                    this.elements.funIndicator.classList.add('bg-danger');
                }
            }
        },

        /**
         * Calculate game balance rating (0-100%)
         * @returns {number} Balance rating (0-100)
         */
        calculateGameBalanceRating: function() {
            const settings = DeathNote.getModule('settings');
            if (!settings) return 50;

            let balanceScore = 100; // Start with perfect balance

            // Factor 1: Unbalanced progress multipliers
            const kiraMultiplier = settings.getValue('kiraProgressMultiplier', 1.0);
            const teamLMultiplier = settings.getValue('teamLProgressMultiplier', 1.0);

            const progressDifference = Math.abs(kiraMultiplier - teamLMultiplier);
            // Deduct up to 30 points for unbalanced progress
            balanceScore -= progressDifference * 60;

            // Factor 2: Missing roles based on player count
            if (settings.getValue('kiraFollowerRole', '1') === "0") {
                // Higher penalty for higher player counts
                if (settings.getValue('maximumPlayers', 10) >= 6) {
                    balanceScore -= 20; // Higher penalty for 6+ players
                } else {
                    balanceScore -= 10; // Lower penalty for 5 or fewer players
                }
            }

            // Factor 3: Extreme movement speed
            const movementSpeed = settings.getValue('movementSpeed', 1.0);
            const speedDeviation = Math.abs(movementSpeed - 1.0);
            // Deduct up to 15 points for extreme speeds
            balanceScore -= speedDeviation * 30;

            // Factor 4: Too few/many tasks relative to ideal
            const taskCount = settings.getValue('numberOfTasks', 2);
            const taskCounts = settings.calculateIdealTaskCount();
            const taskDeviation = Math.abs(taskCount - taskCounts.ideal) / taskCounts.ideal;
            // Deduct up to 20 points for task imbalance
            balanceScore -= taskDeviation * 40;

            // Factor 5: Black notebooks with high criminal judgments
            if (settings.getValue('haveBlackNotebooks', false) &&
                settings.getValue('maximumCriminalJudgments', 5) > 6) {
                balanceScore -= 15;
            }

            // Factor 6: High Kira Progress with many judgments
            if (kiraMultiplier >= 1.4 &&
                settings.getValue('maximumCriminalJudgments', 5) >= 7) {
                balanceScore -= 20;
            }

            // Factor 7: Low Team L progress
            if (teamLMultiplier <= 0.7) {
                balanceScore -= 15;
            }

            // Factor 8: Approach Warning disabled (reduces balance)
            if (!settings.getValue('approachWarning', true)) {
                balanceScore -= 10;
            }

            // Clamp result between 0-100
            return Math.max(0, Math.min(100, Math.round(balanceScore)));
        },

        /**
         * Calculate fun rating (0-100%)
         * @returns {number} Fun rating (0-100)
         */
        calculateFunRating: function() {
            const settings = DeathNote.getModule('settings');
            if (!settings) return 50;

            let funScore = 85; // Start with a good baseline

            // Factor 1: Player count (higher is more fun to a point)
            const maxPlayers = settings.getValue('maximumPlayers', 10);
            if (maxPlayers < 6) {
                funScore -= (6 - maxPlayers) * 7; // Higher penalty
            } else if (maxPlayers > 8) {
                funScore += 5; // Bonus for large games
            }

            // Factor 2: Movement speed (slightly higher is more fun)
            const movementSpeed = settings.getValue('movementSpeed', 1.0);
            if (movementSpeed < 0.8) {
                funScore -= (0.8 - movementSpeed) * 60; // Major penalty for slow movement
            } else if (movementSpeed > 1.0 && movementSpeed <= 1.2) {
                funScore += (movementSpeed - 1.0) * 15; // Bonus for slightly faster
            } else if (movementSpeed > 1.2) {
                funScore -= (movementSpeed - 1.2) * 35; // Penalty for too fast
            }

            // Factor 3: Role variety
            if (settings.getValue('melloRole', '1') === "0") {
                funScore -= 25; // Major penalty for missing Mello
            }

            if (settings.getValue('kiraFollowerRole', '1') === "0") {
                funScore -= 20; // Major penalty for missing Kira Follower
            }

            // Factor 4: Black notebooks (add randomness and fun)
            if (settings.getValue('haveBlackNotebooks', false)) {
                funScore += 10;
            }

            // Factor 5: Task count near ideal is more fun
            const taskCount = settings.getValue('numberOfTasks', 2);
            const taskCounts = settings.calculateIdealTaskCount();
            const taskDeviation = Math.abs(taskCount - taskCounts.ideal);

            // Steeper penalty for extreme deviation
            if (taskDeviation >= 3) {
                funScore -= 20;
            } else {
                funScore -= taskDeviation * 7;
            }

            // Factor 6: Voice chat enabled
            if (!settings.getValue('voiceChat', true)) {
                funScore -= 15; // Penalty when disabled
            }

            // Factor 7: Role selection enabled
            if (settings.getValue('roleSelection', true)) {
                funScore += 5;
            }

            // Factor 8: Canvas tasks disabled
            if (!settings.getValue('canvasTasks', true)) {
                funScore -= 20; // Major penalty for disabled canvas tasks
            }

            // Factor 9: Meeting time too short or too long
            const meetingSeconds = settings.getValue('meetingSeconds', 150);
            if (meetingSeconds < 60) {
                funScore -= (60 - meetingSeconds) / 60 * 20; // Penalty for very short meetings
            } else if (meetingSeconds > 210) {
                funScore -= (meetingSeconds - 210) / 30 * 10; // Penalty for very long meetings
            }

            // Factor 10: Day/Night seconds too short
            if (settings.getValue('dayNightSeconds', 45) <= 30) {
                funScore -= 10; // Penalty for very short rounds
            }

            // Factor 11: Approach Warning disabled (can be more challenging/fun for some)
            if (!settings.getValue('approachWarning', true)) {
                funScore += 5; // Small bonus for added challenge
            }

            // Clamp result between 0-100
            return Math.max(0, Math.min(100, Math.round(funScore)));
        },

        // Private methods

        /**
         * Initialize DOM element references
         * @private
         */
        _initializeElements: function() {
            this.elements.outputBox = document.getElementById('output-box');
            this.elements.copyBtn = document.getElementById('copy-btn');
            this.elements.copyLinkBtn = document.getElementById('copy-link-btn');
            this.elements.balanceIndicator = document.getElementById('balance-indicator');
            this.elements.funIndicator = document.getElementById('fun-indicator');
            this.elements.balanceValue = document.getElementById('balance-value');
            this.elements.funValue = document.getElementById('fun-value');

            if (!this.elements.outputBox) {
                console.error('Output box element not found');
            }
        },

        /**
         * Set up event listeners for UI interactions
         * @private
         */
        _setupEventListeners: function() {
            // Set up copy button
            if (this.elements.copyBtn && this.elements.outputBox) {
                this.elements.copyBtn.addEventListener('click', () => {
                    // Select the text
                    this.elements.outputBox.select();

                    // Copy the text to the clipboard
                    navigator.clipboard.writeText(this.elements.outputBox.value)
                        .then(() => {
                            // Visual feedback on successful copy
                            this.elements.copyBtn.classList.add('copy-flash');
                            this.elements.copyBtn.textContent = 'Copied!';

                            // Reset the button after a delay
                            setTimeout(() => {
                                this.elements.copyBtn.classList.remove('copy-flash');
                                this.elements.copyBtn.innerHTML = '<i class="fas fa-copy me-2"></i>Copy to Clipboard';
                            }, 2000);
                        })
                        .catch(err => {
                            console.error('Could not copy text: ', err);
                        });
                });
            }

            // Set up copy link button
            if (this.elements.copyLinkBtn) {
                this.elements.copyLinkBtn.addEventListener('click', () => {
                    // Update URL hash with current settings
                    const hashManager = DeathNote.utils.hashManager;
                    if (hashManager) {
                        hashManager.updateUrlHash();
                    }

                    // Get the full URL
                    const url = window.location.href;

                    // Copy to clipboard
                    navigator.clipboard.writeText(url)
                        .then(() => {
                            // Visual feedback on successful copy
                            this.elements.copyLinkBtn.classList.add('copy-flash');
                            this.elements.copyLinkBtn.textContent = 'Link Copied!';

                            // Reset the button after a delay
                            setTimeout(() => {
                                this.elements.copyLinkBtn.classList.remove('copy-flash');
                                this.elements.copyLinkBtn.innerHTML = '<i class="fas fa-link me-2"></i>Copy Link to Settings';
                            }, 2000);
                        })
                        .catch(err => {
                            console.error('Could not copy URL: ', err);
                        });
                });
            }

            // Auto-expand selection to full text when partial selection is made
            if (this.elements.outputBox) {
                this.elements.outputBox.addEventListener('click', function() {
                    this.select();
                });
            }

            // Listen for settings changes
            document.addEventListener('settings:changed', () => {
                this.updateOutput();
            });
        },

        /**
         * Get emoji for bin headers
         * @private
         * @param {string} bin - Bin name
         * @returns {string} Emoji for bin
         */
        _getBinEmoji: function(bin) {
            switch(bin) {
                case "Lobby Settings":
                    return ":joystick:";
                case "Player":
                    return ":bust_in_silhouette:";
                case "Gameplay":
                    return ":gear:";
                default:
                    return ":notepad_spiral:";
            }
        }
    };

    // Register with the UI namespace
    DeathNote.ui.output = OutputUI;
})();
