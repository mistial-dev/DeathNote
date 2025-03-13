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

        // Track initialization
        initialized: false,

        /**
         * Initialize the Output UI module
         */
        initialize: function() {
            if (this.initialized) {
                console.log('Output UI already initialized');
                return;
            }

            console.log('Initializing Output UI module');

            // Ensure methods have correct context using explicit binding
            this.updateOutput = this.updateOutput.bind(this);
            this.updateRatings = this.updateRatings.bind(this);
            this._handleCopyClick = this._handleCopyClick.bind(this);
            this._handleCopyLinkClick = this._handleCopyLinkClick.bind(this);

            // Initialize DOM elements and event listeners
            this._initializeElements();
            this._setupEventListeners();

            // Set initial flag to initialized
            this.initialized = true;

            // Perform initial output update with a slight delay
            setTimeout(() => {
                console.log('Performing initial output update');
                this.updateOutput();
            }, 500);

            console.log('Output UI initialized');
        },

        /**
         * Initialize DOM element references
         * @private
         */
        _initializeElements: function() {
            // Safely get DOM elements with fallback
            this.elements.outputBox = document.getElementById('output-box');
            this.elements.copyBtn = document.getElementById('copy-btn');
            this.elements.copyLinkBtn = document.getElementById('copy-link-btn');
            this.elements.balanceIndicator = document.getElementById('balance-indicator');
            this.elements.funIndicator = document.getElementById('fun-indicator');
            this.elements.balanceValue = document.getElementById('balance-value');
            this.elements.funValue = document.getElementById('fun-value');

            // Log element status
            if (!this.elements.outputBox) {
                console.error('CRITICAL: Output Box Not Found in the DOM!');
            } else {
                console.log('Output Box Found:', this.elements.outputBox);
            }
        },

        /**
         * Set up event listeners for UI interactions
         * @private
         */
        _setupEventListeners: function() {
            // Set up copy button handler
            if (this.elements.copyBtn) {
                this.elements.copyBtn.addEventListener('click', this._handleCopyClick);
            }

            // Set up copy link button handler
            if (this.elements.copyLinkBtn) {
                this.elements.copyLinkBtn.addEventListener('click', this._handleCopyLinkClick);
            }

            // Listen for settings changes to update output
            document.addEventListener('deathNote:settings:changed', () => {
                console.log('Settings changed event detected, updating output');
                this.updateOutput();
            });
        },

        /**
         * Get current app version from DeathNote global object
         * @returns {string} Current version number
         */
        _getAppVersion: function() {
            // Try to get version from various locations
            if (window.DeathNote && window.DeathNote.version) {
                return window.DeathNote.version;
            }

            // Fallback to default if not found
            return 'v1.0';
        },

        /**
         * Get credit line with version number
         * @returns {string} Formatted credit line with version
         */
        _getCreditLine: function() {
            const version = this._getAppVersion();
            const toolUrl = window.DeathNote && window.DeathNote.toolUrl ?
                window.DeathNote.toolUrl : 'https://mistial-dev.github.io/DeathNote/';

            return `Generated with [DeathNote Tool ${version}](${toolUrl})`;
        },

        /**
         * Update the output in the textbox
         */
        updateOutput: function() {
            console.log('updateOutput called');

            // Verify output element exists
            if (!this.elements.outputBox) {
                console.error('Cannot update output - output-box element not found');
                return;
            }

            // Get settings from global namespace
            const settings = window.DeathNote && window.DeathNote.getModule ?
                window.DeathNote.getModule('settings') : null;

            if (!settings) {
                console.error('Cannot update output - settings module not available');
                this._showErrorMessage('Settings module not found. Please refresh the page.');
                return;
            }

            // Log current settings for debugging
            const settingsData = settings.getAllSettings();
            console.log('Current Settings:', settingsData);

            // Get bins and definitions
            const BINS = settings.BINS || { LOBBY: 'Lobby Settings', PLAYER: 'Player', GAMEPLAY: 'Gameplay' };
            const definitions = settings.getAllDefinitions();

            // Check if lobby code is set
            const lobbyCode = settings.getValue('lobbyCode', '');
            console.log('Lobby Code:', lobbyCode);

            if (!lobbyCode || lobbyCode.trim().length < 5) {
                console.warn('Lobby code is invalid or missing');
                this.elements.outputBox.value = "# Please Enter Lobby Code\n\nEnter a 5-character lobby code in the settings to generate your Discord post.";
                return;
            }

            // Count non-default settings for threshold calculation
            let nonDefaultCount = 0;
            definitions.forEach(definition => {
                const value = settings.getValue(definition.id, null);
                const defaultValue = definition.defaultValue;

                // Compare values properly based on type
                let isDifferent = false;
                if (typeof value === 'boolean' || typeof defaultValue === 'boolean') {
                    // Handle boolean comparison separately
                    isDifferent = Boolean(value) !== Boolean(defaultValue);
                } else {
                    isDifferent = value !== defaultValue;
                }

                if (isDifferent) {
                    nonDefaultCount++;
                }
            });

            console.log(`Non-default settings count: ${nonDefaultCount}`);

            // Calculate dynamic threshold based on non-default count
            const threshold = Math.min(0.6, 0.08 * nonDefaultCount + 0.2);
            console.log(`Calculated threshold: ${threshold}`);

            // Organize settings by bin
            const settingsByBin = {};
            settingsByBin[BINS.LOBBY] = [];
            settingsByBin[BINS.PLAYER] = [];
            settingsByBin[BINS.GAMEPLAY] = [];

            // Process settings for visibility
            definitions.forEach(definition => {
                const settingId = definition.id;
                const settingData = settingsData[settingId];

                // Skip if setting data is missing
                if (!settingData) {
                    console.warn(`No data found for setting: ${settingId}`);
                    return;
                }

                // Skip if manually set to not visible
                if (settingData.manuallySet && !settingData.visible) {
                    console.log(`Setting ${settingId} manually hidden`);
                    return;
                }

                // Set initial visibility based on relevancy score and threshold
                let isVisible = false;

                // Force visibility for critical settings that can't be hidden
                if (!definition.canHide) {
                    isVisible = true;
                    console.log(`Setting ${settingId} is critical and will be shown`);
                }
                // Determine visibility by threshold if not manually set
                else if (!settingData.manuallySet) {
                    isVisible = settingData.relevancyScore > threshold;
                    console.log(`Setting ${settingId} relevancy: ${settingData.relevancyScore} (threshold: ${threshold}), visible: ${isVisible}`);
                }
                // Use manual setting if available
                else {
                    isVisible = !!settingData.visible;
                    console.log(`Setting ${settingId} manually set to visible: ${isVisible}`);
                }

                // Apply visibility rules
                isVisible = settings.applySettingVisibilityRules(definition, isVisible);

                // Special case for Checkbox Group
                if (definition.type === 'checkbox-group') {
                    // Skip parent, we'll process each option separately
                    return;
                }

                // Only add visible settings to the output bins
                if (isVisible) {
                    const value = settings.getSettingDisplayValue(definition);
                    settingsByBin[definition.bin].push({
                        id: definition.id,
                        name: definition.name,
                        value: value,
                        relevancyScore: settingData.relevancyScore || 0
                    });
                    console.log(`Added ${settingId} to bin ${definition.bin}: ${value}`);
                }
            });

            // Process special setting groups (like checkbox groups)
            if (typeof settings.processSpecialSettingGroups === 'function') {
                settings.processSpecialSettingGroups(settingsByBin);
            }

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

            // Build the output markdown with Discord-friendly formatting
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

            // Add credit line with version
            output += this._getCreditLine();

            // Update the output box with the formatted content
            this.elements.outputBox.value = output;
            console.log('Output updated successfully');

            // Update ratings
            this.updateRatings();
        },

        /**
         * Display an error message in the output box
         * @private
         * @param {string} message - Error message to display
         */
        _showErrorMessage: function(message) {
            if (this.elements.outputBox) {
                this.elements.outputBox.value = `# Error\n\n${message}\n\nPlease check your settings or reload the page.`;
            }
        },

        /**
         * Handle copy button click
         * @private
         */
        _handleCopyClick: function() {
            if (!this.elements.outputBox) return;

            try {
                this.elements.outputBox.select();
                document.execCommand('copy');

                // Optional: Add visual feedback
                this._flashCopyButton();
            } catch (err) {
                console.error('Copy failed:', err);
                alert('Failed to copy. Please manually select and copy the text.');
            }
        },

        /**
         * Handle copy link button click
         * @private
         */
        _handleCopyLinkClick: function() {
            const hashManager = window.DeathNote && window.DeathNote.getModule ?
                window.DeathNote.getModule('utils')?.hashManager : null;

            if (hashManager && hashManager.updateUrlHash) {
                hashManager.updateUrlHash();

                try {
                    navigator.clipboard.writeText(window.location.href).then(() => {
                        // Add visual feedback
                        if (this.elements.copyLinkBtn) {
                            this.elements.copyLinkBtn.classList.add('copy-flash');
                            setTimeout(() => {
                                this.elements.copyLinkBtn.classList.remove('copy-flash');
                            }, 500);
                        }
                    }).catch(err => {
                        console.error('Failed to copy link:', err);
                        alert('Failed to copy link. Please manually copy the URL.');
                    });
                } catch (err) {
                    console.error('Copy link failed:', err);
                    alert('Failed to copy link. Please manually copy the URL.');
                }
            } else {
                console.error('Hash manager not available');
                alert('Unable to generate shareable link.');
            }
        },

        /**
         * Flash the copy button to provide visual feedback
         * @private
         */
        _flashCopyButton: function() {
            if (this.elements.copyBtn) {
                this.elements.copyBtn.classList.add('copy-flash');
                setTimeout(() => {
                    this.elements.copyBtn.classList.remove('copy-flash');
                }, 500);
            }
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
        },

        /**
         * Calculate game balance rating
         * @returns {number} Balance rating between 0-100
         */
        calculateGameBalanceRating: function() {
            try {
                const settings = window.DeathNote && window.DeathNote.getModule ?
                    window.DeathNote.getModule('settings') : null;

                if (!settings) return 75; // Default if settings not available

                // Get key settings that affect balance
                const kiraProgress = settings.getValue('kiraProgressMultiplier', 1.0);
                const lProgress = settings.getValue('teamLProgressMultiplier', 1.0);
                const judgments = settings.getValue('maximumCriminalJudgments', 5);
                const melloRole = settings.getValue('melloRole', '1');
                const kiraFollower = settings.getValue('kiraFollowerRole', '1');
                const canvasTasks = settings.getValue('canvasTasks', true);

                // Calculate base balance score
                let balance = 80; // Start with a reasonable baseline

                // Adjust for progress multiplier imbalance
                const progressDiff = Math.abs(kiraProgress - lProgress);
                if (progressDiff > 0.5) balance -= 15 * progressDiff;

                // Adjust for high Kira power
                if (kiraProgress >= 1.4 && judgments > 5) {
                    balance -= 10 * (judgments - 5);
                }

                // Adjust for disabled roles
                if (melloRole === '0') balance -= 15;
                if (kiraFollower === '0') balance -= 10;

                // Adjust for Canvas Tasks
                if (!canvasTasks) balance -= 20;

                // Clamp to valid range
                return Math.max(0, Math.min(100, Math.round(balance)));
            } catch (error) {
                console.error('Error calculating balance rating:', error);
                return 75; // Default rating on error
            }
        },

        /**
         * Calculate fun rating
         * @returns {number} Fun rating between 0-100
         */
        calculateFunRating: function() {
            try {
                const settings = window.DeathNote && window.DeathNote.getModule ?
                    window.DeathNote.getModule('settings') : null;

                if (!settings) return 80; // Default if settings not available

                // Get key settings that affect fun
                const movementSpeed = settings.getValue('movementSpeed', 1.0);
                const dayNightSeconds = settings.getValue('dayNightSeconds', 45);
                const numberOfTasks = settings.getValue('numberOfTasks', 2);
                const numberOfInputs = settings.getValue('numberOfInputs', 2);
                const voiceChat = settings.getValue('voiceChat', true);
                const melloRole = settings.getValue('melloRole', '1');
                const kiraFollower = settings.getValue('kiraFollowerRole', '1');

                // Calculate base fun score
                let fun = 85; // Start with a reasonable baseline

                // Calculate ideal task count
                let idealTasks = 3;
                if (typeof settings.calculateIdealTaskCount === 'function') {
                    try {
                        const taskCounts = settings.calculateIdealTaskCount();
                        idealTasks = taskCounts.ideal;
                    } catch (e) {
                        console.warn('Failed to calculate ideal tasks', e);
                    }
                }

                // Adjust for extreme movement speed
                if (movementSpeed < 0.7) fun -= 20;
                else if (movementSpeed < 0.9) fun -= 10;
                else if (movementSpeed > 1.3) fun -= 5;

                // Adjust for day/night duration extremes
                if (dayNightSeconds <= 30) fun -= 5;
                else if (dayNightSeconds >= 90) fun -= 5;

                // Adjust for task count relative to ideal
                const taskDiff = Math.abs(numberOfTasks - idealTasks);
                if (taskDiff > 0) fun -= 5 * taskDiff;

                // Adjust for high input count
                if (numberOfInputs >= 4) fun -= 10;

                // Adjust for disabled voice chat
                if (!voiceChat) fun -= 15;

                // Adjust for disabled roles
                if (melloRole === '0') fun -= 10;
                if (kiraFollower === '0') fun -= 10;

                // Clamp to valid range
                return Math.max(0, Math.min(100, Math.round(fun)));
            } catch (error) {
                console.error('Error calculating fun rating:', error);
                return 80; // Default rating on error
            }
        },

        /**
         * Update ratings display
         */
        updateRatings: function() {
            try {
                const balanceRating = this.calculateGameBalanceRating();
                const funRating = this.calculateFunRating();

                // Update balance rating display
                if (this.elements.balanceValue) {
                    this.elements.balanceValue.textContent = balanceRating;
                }

                if (this.elements.balanceIndicator) {
                    this._updateRatingIndicator(
                        this.elements.balanceIndicator,
                        balanceRating,
                        'Balance Rating'
                    );
                }

                // Update fun rating display
                if (this.elements.funValue) {
                    this.elements.funValue.textContent = funRating;
                }

                if (this.elements.funIndicator) {
                    this._updateRatingIndicator(
                        this.elements.funIndicator,
                        funRating,
                        'Fun Rating'
                    );
                }
            } catch (error) {
                console.error('Error updating ratings:', error);
            }
        },

        /**
         * Update a rating indicator's styling
         * @private
         * @param {HTMLElement} indicator - Rating indicator element
         * @param {number} rating - Numerical rating
         * @param {string} label - Rating label for logging
         */
        _updateRatingIndicator: function(indicator, rating, label) {
            // Reset classes
            indicator.className = 'badge rounded-pill me-2';

            // Apply styling based on rating
            if (rating >= 80) {
                indicator.classList.add('bg-success');
            } else if (rating >= 60) {
                indicator.classList.add('bg-warning', 'text-dark');
            } else {
                indicator.classList.add('bg-danger');
            }
        }
    };

    // Register the module with the DeathNote application
    if (window.DeathNote) {
        // Ensure UI namespace exists
        window.DeathNote.ui = window.DeathNote.ui || {};

        // Add output UI to the namespace
        window.DeathNote.ui.output = OutputUI;

        // Register the output UI module
        if (typeof window.DeathNote.registerModule === 'function') {
            window.DeathNote.registerModule('ui', {
                initialize: function() {
                    console.log('Output UI module registration initializing');
                    OutputUI.initialize();
                },
                output: OutputUI
            });
        }
    }

    // Direct initialization when DOM is ready (as a fallback)
    document.addEventListener('DOMContentLoaded', function() {
        // Only initialize if not already done through the module system
        if (!OutputUI.initialized) {
            console.log('Direct initialization of Output UI');
            OutputUI.initialize();
        }

        // Force an initial output update
        setTimeout(function() {
            if (typeof OutputUI.updateOutput === 'function') {
                console.log('Forcing initial output update');
                OutputUI.updateOutput();
            }
        }, 1000);
    });
})();