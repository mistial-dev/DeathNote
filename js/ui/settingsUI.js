/**
 * Death Note: Killer Within - Settings UI Module
 * Responsible for generating and managing the settings interface
 */

(function() {
    'use strict';

    // UI Module
    const SettingsUI = {
        // DOM Element references
        elements: {
            lobbySettingsContainer: null,
            playerSettingsContainer: null,
            gameplaySettingsContainer: null,
            advancedSettingsContainer: null,
            advancedToggleButton: null,
            resetAllButton: null,
            advancedCaret: null
        },

        /**
         * Initialize the Settings UI
         */
        initialize: function() {
            this._initializeElements();
            this._generateUI();
            this._setupEventListeners();

            console.log('Settings UI initialized');
        },

        /**
         * Reset a specific setting to its default value in the UI
         * @param {string} settingId - ID of the setting to reset
         */
        resetSetting: function(settingId) {
            const settings = DeathNote.getModule('settings');
            if (!settings) {
                console.error('Settings module not available');
                return;
            }

            const definition = settings.getDefinition(settingId);
            if (!definition) {
                console.warn(`Setting definition not found: ${settingId}`);
                return;
            }

            // Reset the setting in the model
            settings.resetSetting(settingId);

            // Update the UI element based on the type
            this._updateUIForSetting(settingId);

            // Update visibility state
            this._syncVisibilityCheckbox(settingId);

            // Trigger output update
            document.dispatchEvent(new CustomEvent('settings:changed'));
        },

        /**
         * Reset all settings to their default values in the UI
         */
        resetAllSettings: function() {
            if (confirm('Are you sure you want to reset all settings to their default values?')) {
                const settings = DeathNote.getModule('settings');
                if (!settings) {
                    console.error('Settings module not available');
                    return;
                }

                // Reset all settings in the model
                settings.resetAllSettings();

                // Update all UI elements
                const definitions = settings.getAllDefinitions();
                definitions.forEach(definition => {
                    this._updateUIForSetting(definition.id);
                    this._syncVisibilityCheckbox(definition.id);
                });

                // Trigger output update
                document.dispatchEvent(new CustomEvent('settings:changed'));
            }
        },

        // Private methods

        /**
         * Initialize DOM element references
         * @private
         */
        _initializeElements: function() {
            this.elements.lobbySettingsContainer = document.getElementById('lobby-settings-section');
            this.elements.playerSettingsContainer = document.getElementById('player-settings-section');
            this.elements.gameplaySettingsContainer = document.getElementById('gameplay-settings-section');
            this.elements.advancedSettingsContainer = document.getElementById('advanced-settings');
            this.elements.advancedToggleButton = document.getElementById('toggle-advanced-settings');
            this.elements.resetAllButton = document.getElementById('reset-all-btn');
            this.elements.advancedCaret = document.getElementById('advanced-caret');

            // Verify elements exist
            if (!this.elements.lobbySettingsContainer ||
                !this.elements.playerSettingsContainer ||
                !this.elements.gameplaySettingsContainer ||
                !this.elements.advancedSettingsContainer) {
                console.error('Required DOM elements not found for settings UI');
            }
        },

        /**
         * Set up event listeners for UI interactions
         * @private
         */
        _setupEventListeners: function() {
            // Set up the advanced settings toggle
            if (this.elements.advancedToggleButton) {
                this.elements.advancedToggleButton.addEventListener('click', this._toggleAdvancedSettings.bind(this));
            }

            // Set up the reset all button
            if (this.elements.resetAllButton) {
                this.elements.resetAllButton.addEventListener('click', this.resetAllSettings.bind(this));
            }

            // Set up radio button synchronization
            this._setupRadioButtonSyncing();

            // Listen for settings changes to update UI
            document.addEventListener('settings:changed', () => {
                this._updateRadioButtonsUI();
            });
        },

        /**
         * Generate the settings UI from the settings definitions
         * @private
         */
        _generateUI: function() {
            const settings = DeathNote.getModule('settings');
            if (!settings) {
                console.error('Settings module not available');
                return;
            }

            const BINS = settings.BINS;
            const definitions = settings.getAllDefinitions();

            // Clear existing content
            this.elements.lobbySettingsContainer.innerHTML = '';
            this.elements.playerSettingsContainer.innerHTML = '';
            this.elements.gameplaySettingsContainer.innerHTML = '';
            this.elements.advancedSettingsContainer.innerHTML = '';

            // Add bin headers
            this.elements.lobbySettingsContainer.innerHTML = `<h4>${BINS.LOBBY}</h4>`;
            this.elements.playerSettingsContainer.innerHTML = `<h4>${BINS.PLAYER}</h4>`;
            this.elements.gameplaySettingsContainer.innerHTML = `<h4>${BINS.GAMEPLAY}</h4>`;

            // Group settings by bin
            const settingsByBin = {};
            settingsByBin[BINS.LOBBY] = [];
            settingsByBin[BINS.PLAYER] = [];
            settingsByBin[BINS.GAMEPLAY] = [];

            // Group settings by bin
            definitions.forEach(setting => {
                if (settingsByBin[setting.bin]) {
                    settingsByBin[setting.bin].push(setting);
                }
            });

            // Generate UI for each bin
            Object.keys(settingsByBin).forEach(bin => {
                const binSettings = settingsByBin[bin];
                const container = bin === BINS.LOBBY
                    ? this.elements.lobbySettingsContainer
                    : bin === BINS.PLAYER
                        ? this.elements.playerSettingsContainer
                        : this.elements.gameplaySettingsContainer;

                binSettings.forEach(setting => {
                    const element = this._createSettingElement(setting);

                    // If it's an advanced setting, add it to the advanced container
                    if (setting.isAdvanced) {
                        this.elements.advancedSettingsContainer.appendChild(element);
                    } else {
                        container.appendChild(element);
                    }
                });
            });
        },

        /**
         * Create a UI element for a setting
         * @private
         * @param {Object} setting - Setting definition
         * @returns {HTMLElement} Setting UI element
         */
        _createSettingElement: function(setting) {
            const settingElement = document.createElement('div');
            settingElement.className = 'setting-item';
            settingElement.id = `setting-item-${setting.id}`;

            // Create setting container with two columns
            const settingContainer = document.createElement('div');
            settingContainer.className = 'row';

            // Left column for settings controls
            const leftColumn = document.createElement('div');
            leftColumn.className = 'col-md-9';

            // Right column for visibility controls
            const rightColumn = document.createElement('div');
            rightColumn.className = 'col-md-3 text-end';

            // Create header with label
            const headerElement = document.createElement('div');
            headerElement.className = 'setting-header';

            // Add label and reset link
            const labelContainer = document.createElement('div');
            labelContainer.className = 'd-flex align-items-center';

            const labelElement = document.createElement('label');
            labelElement.className = 'setting-label';
            labelElement.htmlFor = setting.id;
            labelElement.textContent = setting.name;

            // Add reset link
            const resetLink = document.createElement('a');
            resetLink.className = 'reset-link';
            resetLink.textContent = 'reset';
            resetLink.addEventListener('click', () => this.resetSetting(setting.id));

            labelContainer.appendChild(labelElement);
            labelContainer.appendChild(resetLink);

            // Add help icon with tooltip
            if (setting.description) {
                const helpIcon = document.createElement('i');
                helpIcon.className = 'fas fa-question-circle help-icon';
                helpIcon.title = setting.description;
                labelElement.appendChild(helpIcon);
            }

            headerElement.appendChild(labelContainer);
            leftColumn.appendChild(headerElement);

            // Add visibility checkbox (if allowed) to right column
            if (setting.canHide) {
                const checkboxContainer = document.createElement('div');
                checkboxContainer.className = 'form-check';

                const checkboxInput = document.createElement('input');
                checkboxInput.className = 'form-check-input';
                checkboxInput.type = 'checkbox';
                checkboxInput.id = `visible-${setting.id}`;

                const settings = DeathNote.getModule('settings');
                // Set initial state based on relevancy and visibility rules
                const initialVisible = settings.applySettingVisibilityRules(
                    setting,
                    settings.getValue(`${setting.id}.visible`, !setting.isAdvanced)
                );
                checkboxInput.checked = initialVisible;

                checkboxInput.addEventListener('change', function() {
                    const settings = DeathNote.getModule('settings');
                    settings.updateSettingVisibility(setting.id, this.checked);
                    document.dispatchEvent(new CustomEvent('settings:changed'));
                });

                const checkboxLabel = document.createElement('label');
                checkboxLabel.className = 'form-check-label';
                checkboxLabel.htmlFor = `visible-${setting.id}`;
                checkboxLabel.textContent = 'Show';

                checkboxContainer.appendChild(checkboxInput);
                checkboxContainer.appendChild(checkboxLabel);
                rightColumn.appendChild(checkboxContainer);
            }

            // Add description if provided
            if (setting.description) {
                const descriptionElement = document.createElement('div');
                descriptionElement.className = 'setting-description';
                descriptionElement.textContent = setting.description;
                leftColumn.appendChild(descriptionElement);
            }

            // Create the input element based on setting type
            const inputElement = this._createInputElement(setting);
            leftColumn.appendChild(inputElement);

            // Add columns to container
            settingContainer.appendChild(leftColumn);
            settingContainer.appendChild(rightColumn);
            settingElement.appendChild(settingContainer);

            return settingElement;
        },

        /**
         * Create an input element for a setting
         * @private
         * @param {Object} setting - Setting definition
         * @returns {HTMLElement} Input UI element
         */
        _createInputElement: function(setting) {
            const settings = DeathNote.getModule('settings');
            const inputContainer = document.createElement('div');
            inputContainer.className = 'setting-input-container';

            let inputElement;

            switch (setting.type) {
                case 'text':
                    inputElement = document.createElement('input');
                    inputElement.type = 'text';
                    inputElement.className = 'form-control';
                    inputElement.id = setting.id;
                    inputElement.value = settings.getValue(setting.id, setting.defaultValue);
                    inputElement.placeholder = setting.placeholder || '';

                    if (setting.pattern) {
                        inputElement.pattern = setting.pattern;
                    }

                    if (setting.required) {
                        inputElement.required = true;
                    }

                    if (setting.maxLength) {
                        inputElement.maxLength = setting.maxLength;
                    }

                    // For lobby code, add validation
                    if (setting.id === 'lobbyCode') {
                        inputElement.addEventListener('input', function() {
                            // Check if length is exactly 5 characters
                            if (this.value.length === 5) {
                                this.classList.remove('is-invalid');
                                this.classList.add('is-valid');
                            } else {
                                this.classList.remove('is-valid');
                                this.classList.add('is-invalid');
                            }
                        });
                    }

                    inputElement.addEventListener('input', this._createInputChangeHandler(setting.id));
                    break;

                case 'boolean':
                    inputContainer.className = 'form-check';

                    inputElement = document.createElement('input');
                    inputElement.type = 'checkbox';
                    inputElement.className = 'form-check-input';
                    inputElement.id = setting.id;
                    inputElement.checked = settings.getValue(setting.id, setting.defaultValue);

                    const labelElement = document.createElement('label');
                    labelElement.className = 'form-check-label';
                    labelElement.htmlFor = setting.id;
                    labelElement.textContent = 'Enabled';

                    inputElement.addEventListener('change', this._createInputChangeHandler(setting.id));

                    inputContainer.appendChild(inputElement);
                    inputContainer.appendChild(labelElement);
                    break;

                case 'select':
                    inputElement = document.createElement('select');
                    inputElement.className = 'form-select';
                    inputElement.id = setting.id;

                    setting.options.forEach(option => {
                        const optionElement = document.createElement('option');
                        optionElement.value = option;
                        optionElement.textContent = option;
                        inputElement.appendChild(optionElement);
                    });

                    inputElement.value = settings.getValue(setting.id, setting.defaultValue);
                    inputElement.addEventListener('change', this._createInputChangeHandler(setting.id));
                    break;

                case 'checkbox-group':
                    // Create a horizontal group of checkboxes
                    const checkboxGroup = document.createElement('div');
                    checkboxGroup.className = 'd-flex';

                    setting.options.forEach(option => {
                        const optionContainer = document.createElement('div');
                        optionContainer.className = 'form-check me-4';

                        const checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        checkbox.className = 'form-check-input';
                        checkbox.id = option.id;
                        checkbox.checked = settings.getValue(option.id, option.defaultValue);

                        checkbox.addEventListener('change', function() {
                            const settings = DeathNote.getModule('settings');
                            settings.updateSetting(option.id, this.checked);
                            document.dispatchEvent(new CustomEvent('settings:changed'));
                        });

                        const checkboxLabel = document.createElement('label');
                        checkboxLabel.className = 'form-check-label';
                        checkboxLabel.htmlFor = option.id;
                        checkboxLabel.textContent = option.label;

                        optionContainer.appendChild(checkbox);
                        optionContainer.appendChild(checkboxLabel);
                        checkboxGroup.appendChild(optionContainer);
                    });

                    inputContainer.appendChild(checkboxGroup);
                    break;

                case 'range':
                    const rangeContainer = document.createElement('div');

                    inputElement = document.createElement('input');
                    inputElement.type = 'range';
                    inputElement.className = 'form-range';
                    inputElement.id = setting.id;
                    inputElement.min = setting.min;
                    inputElement.max = setting.max;
                    inputElement.step = setting.step;
                    inputElement.value = settings.getValue(setting.id, setting.defaultValue);

                    const valueDisplay = document.createElement('div');
                    valueDisplay.className = 'text-center';
                    valueDisplay.textContent = settings.getValue(setting.id, setting.defaultValue);

                    const rangeValues = document.createElement('div');
                    rangeValues.className = 'range-values';
                    rangeValues.innerHTML = `<span>${setting.min}</span><span>${setting.max}</span>`;

                    inputElement.addEventListener('input', (event) => {
                        valueDisplay.textContent = event.target.value;

                        const settings = DeathNote.getModule('settings');
                        settings.updateSetting(setting.id, parseFloat(event.target.value));
                        document.dispatchEvent(new CustomEvent('settings:changed'));
                    });

                    rangeContainer.appendChild(inputElement);
                    rangeContainer.appendChild(valueDisplay);
                    rangeContainer.appendChild(rangeValues);

                    inputContainer.appendChild(rangeContainer);
                    break;

                case 'radio':
                    // Create horizontal radio button group for role selections
                    const radioGroup = document.createElement('div');
                    radioGroup.className = 'btn-group';
                    radioGroup.setAttribute('role', 'group');
                    radioGroup.style.width = '100%';

                    setting.options.forEach(option => {
                        const radioLabel = document.createElement('label');
                        radioLabel.className = 'btn btn-outline-secondary';
                        radioLabel.style.flex = '1';

                        const radioInput = document.createElement('input');
                        radioInput.type = 'radio';
                        radioInput.className = 'btn-check';
                        radioInput.name = setting.id;
                        radioInput.id = `${setting.id}-${option.value}`;
                        radioInput.value = option.value;
                        radioInput.checked = option.value === settings.getValue(setting.id, setting.defaultValue);
                        radioInput.autocomplete = 'off';

                        radioLabel.htmlFor = `${setting.id}-${option.value}`;
                        radioLabel.textContent = option.label;

                        radioInput.addEventListener('change', () => {
                            if (radioInput.checked) {
                                const settings = DeathNote.getModule('settings');
                                settings.updateSetting(setting.id, radioInput.value);
                                document.dispatchEvent(new CustomEvent('settings:changed'));
                            }
                        });

                        radioGroup.appendChild(radioInput);
                        radioGroup.appendChild(radioLabel);
                    });

                    inputContainer.appendChild(radioGroup);
                    break;

                default:
                    // Default to text input
                    inputElement = document.createElement('input');
                    inputElement.type = 'text';
                    inputElement.className = 'form-control';
                    inputElement.id = setting.id;
                    inputElement.value = settings.getValue(setting.id, setting.defaultValue);
                    inputElement.addEventListener('input', this._createInputChangeHandler(setting.id));
                    break;
            }

            if (inputElement && !inputContainer.contains(inputElement)) {
                inputContainer.appendChild(inputElement);
            }

            return inputContainer;
        },

        /**
         * Create an input change handler for a setting
         * @private
         * @param {string} settingId - ID of the setting
         * @returns {Function} Change handler function
         */
        _createInputChangeHandler: function(settingId) {
            return function(event) {
                const element = event.target;
                const value = element.type === 'checkbox' ? element.checked : element.value;

                const settings = DeathNote.getModule('settings');
                settings.updateSetting(settingId, value);
                document.dispatchEvent(new CustomEvent('settings:changed'));
            };
        },

        /**
         * Toggle the advanced settings panel
         * @private
         */
        _toggleAdvancedSettings: function() {
            const advancedSettings = this.elements.advancedSettingsContainer;
            const toggleButton = this.elements.advancedToggleButton;
            const caret = this.elements.advancedCaret;

            if (!advancedSettings || !toggleButton || !caret) {
                console.error('Advanced settings toggle elements not found');
                return;
            }

            if (advancedSettings.classList.contains('show')) {
                advancedSettings.classList.remove('show');
                caret.classList.remove('fa-caret-down');
                caret.classList.add('fa-caret-right');
                toggleButton.innerHTML = '<i class="fas fa-caret-right me-2" id="advanced-caret"></i>Show Advanced Settings';
            } else {
                advancedSettings.classList.add('show');
                caret.classList.remove('fa-caret-right');
                caret.classList.add('fa-caret-down');
                toggleButton.innerHTML = '<i class="fas fa-caret-down me-2" id="advanced-caret"></i>Hide Advanced Settings';
            }
        },

        /**
         * Update the UI for a specific setting
         * @private
         * @param {string} settingId - ID of the setting to update
         */
        _updateUIForSetting: function(settingId) {
            const settings = DeathNote.getModule('settings');
            const definition = settings.getDefinition(settingId);
            if (!definition) return;

            const element = document.getElementById(settingId);
            if (!element) return;

            const currentValue = settings.getValue(settingId, definition.defaultValue);

            switch (definition.type) {
                case 'boolean':
                    element.checked = currentValue;
                    break;

                case 'radio':
                    // For radio buttons, find the correct radio in the group
                    const radioSelector = `input[name="${settingId}"][value="${currentValue}"]`;
                    const radioBtn = document.querySelector(radioSelector);
                    if (radioBtn) {
                        radioBtn.checked = true;
                        // Trigger change event to update UI
                        radioBtn.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                    break;

                case 'range':
                    element.value = currentValue;

                    // Update display value for range inputs
                    const container = element.closest('.setting-input-container');
                    if (container) {
                        const display = container.querySelector('.text-center');
                        if (display) {
                            display.textContent = currentValue;
                        }
                    }
                    break;

                default:
                    element.value = currentValue;
                    break;
            }
        },

        /**
         * Update the state of radio buttons in the UI
         * @private
         */
        _updateRadioButtonsUI: function() {
            // Find all radio button groups
            const radioGroups = {};
            document.querySelectorAll('input[type="radio"]').forEach(radio => {
                if (!radioGroups[radio.name]) {
                    radioGroups[radio.name] = [];
                }
                radioGroups[radio.name].push(radio);
            });

            // For each group, sync the UI
            Object.keys(radioGroups).forEach(groupName => {
                const radios = radioGroups[groupName];

                // Find the checked one
                const checkedRadio = radios.find(r => r.checked);
                if (checkedRadio) {
                    // Make sure the labels reflect the checked state
                    radios.forEach(radio => {
                        const label = document.querySelector(`label[for="${radio.id}"]`);
                        if (label) {
                            if (radio.checked) {
                                // This is the active one
                                label.classList.add('active');
                                if (label.classList.contains('btn-outline-secondary')) {
                                    label.classList.remove('btn-outline-secondary');
                                    label.classList.add('btn-secondary');
                                }
                            } else {
                                // This is inactive
                                label.classList.remove('active');
                                if (label.classList.contains('btn-secondary')) {
                                    label.classList.remove('btn-secondary');
                                    label.classList.add('btn-outline-secondary');
                                }
                            }
                        }
                    });
                }
            });
        },

        /**
         * Set up radio button synchronization
         * @private
         */
        _setupRadioButtonSyncing: function() {
            // Find all radio buttons
            const radioButtons = document.querySelectorAll('input[type="radio"]');

            // Add event listeners to update the UI state
            radioButtons.forEach(radio => {
                radio.addEventListener('change', function() {
                    if (this.checked) {
                        // When a radio is checked, update all labels in its group
                        const groupName = this.name;
                        const groupRadios = document.querySelectorAll(`input[name="${groupName}"]`);

                        groupRadios.forEach(groupRadio => {
                            const label = document.querySelector(`label[for="${groupRadio.id}"]`);
                            if (label) {
                                if (groupRadio.checked) {
                                    // Active radio
                                    label.classList.add('active');
                                    label.classList.remove('btn-outline-secondary');
                                    label.classList.add('btn-secondary');
                                } else {
                                    // Inactive radio
                                    label.classList.remove('active');
                                    label.classList.remove('btn-secondary');
                                    label.classList.add('btn-outline-secondary');
                                }
                            }
                        });
                    }
                });
            });

            // Initial sync
            this._updateRadioButtonsUI();
        },

        /**
         * Sync a visibility checkbox with the setting state
         * @private
         * @param {string} settingId - ID of the setting
         */
        _syncVisibilityCheckbox: function(settingId) {
            const checkboxEl = document.getElementById(`visible-${settingId}`);
            if (!checkboxEl) return;

            const settings = DeathNote.getModule('settings');
            const definition = settings.getDefinition(settingId);
            if (!definition) return;

            const settingsData = settings.getAllSettings();
            const setting = settingsData[settingId];
            if (!setting) return;

            // Determine if the setting should be visible based on rules
            const shouldBeVisible = settings.applySettingVisibilityRules(
                definition,
                setting.visible
            );

            // Update the checkbox state
            checkboxEl.checked = shouldBeVisible;
        }
    };

    // Register with the UI namespace
    DeathNote.ui.settings = SettingsUI;

    // Register with the application
    document.addEventListener('DOMContentLoaded', function() {
        DeathNote.registerModule('ui', {
            initialize: function() {
                SettingsUI.initialize();

                if (DeathNote.ui.output) {
                    DeathNote.ui.output.initialize();
                }

                if (DeathNote.ui.recommendations) {
                    DeathNote.ui.recommendations.initialize();
                }
            },
            updateRatings: function() {
                if (DeathNote.ui.output) {
                    DeathNote.ui.output.updateRatings();
                }
            }
        });
    });
})();