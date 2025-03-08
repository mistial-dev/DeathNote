/**
 * Main application logic for Death Note: Killer Within Lobby Discord Post Generator
 * This file handles UI interactions and the generation of the lobby Discord post
 */

// Create or extend the DeathNote namespace
window.DeathNote = window.DeathNote || {};
window.DeathNote.ui = window.DeathNote.ui || {};

// Function to generate the settings UI from the settings definitions
window.DeathNote.ui.generateSettingsUI = function() {
    // Make sure the settings module is available
    if (!window.DeathNote.settings || !window.DeathNote.settings.BINS) {
        console.error("Settings module not fully loaded");
        return;
    }

    // Get the BINS reference
    const BINS = window.DeathNote.settings.BINS;

    // Get the containers for each bin
    const lobbySettingsContainer = document.getElementById('lobby-settings-section');
    const playerSettingsContainer = document.getElementById('player-settings-section');
    const gameplaySettingsContainer = document.getElementById('gameplay-settings-section');
    const advancedSettingsContainer = document.getElementById('advanced-settings');

    if (!lobbySettingsContainer || !playerSettingsContainer || !gameplaySettingsContainer || !advancedSettingsContainer) {
        console.error("One or more settings containers not found");
        return;
    }

    // Clear existing content
    lobbySettingsContainer.innerHTML = '';
    playerSettingsContainer.innerHTML = '';
    gameplaySettingsContainer.innerHTML = '';
    advancedSettingsContainer.innerHTML = '';

    // Add bin headers
    lobbySettingsContainer.innerHTML = `<h4>${BINS.LOBBY}</h4>`;
    playerSettingsContainer.innerHTML = `<h4>${BINS.PLAYER}</h4>`;
    gameplaySettingsContainer.innerHTML = `<h4>${BINS.GAMEPLAY}</h4>`;

    // Group settings by bin
    const settingsByBin = {
        [BINS.LOBBY]: [],
        [BINS.PLAYER]: [],
        [BINS.GAMEPLAY]: []
    };

    // Group settings by bin
    window.DeathNote.settings.settingsDefinitions.forEach(setting => {
        settingsByBin[setting.bin].push(setting);
    });

    // Generate UI for each bin
    Object.keys(settingsByBin).forEach(bin => {
        const settings = settingsByBin[bin];
        const container = bin === BINS.LOBBY ? lobbySettingsContainer :
            bin === BINS.PLAYER ? playerSettingsContainer :
                gameplaySettingsContainer;
        const advancedContainer = advancedSettingsContainer;

        settings.forEach(setting => {
            const settingElement = window.DeathNote.ui.createSettingElement(setting);

            // If it's an advanced setting, add it to the advanced container
            if (setting.isAdvanced) {
                advancedContainer.appendChild(settingElement);
            } else {
                container.appendChild(settingElement);
            }
        });
    });
};

// Function to create UI element for a setting
window.DeathNote.ui.createSettingElement = function(setting) {
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
    resetLink.addEventListener('click', function() {
        // Reset this setting to default
        window.DeathNote.ui.resetSetting(setting.id);
    });

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
        checkboxInput.checked = !setting.isAdvanced; // Default based on whether it's advanced

        checkboxInput.addEventListener('change', function() {
            window.DeathNote.settings.settings[setting.id].visible = this.checked;
            window.DeathNote.settings.settings[setting.id].manuallySet = true;
            window.DeathNote.ui.updateOutput();
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
    const inputElement = window.DeathNote.ui.createInputElement(setting);
    leftColumn.appendChild(inputElement);

    // Add columns to container
    settingContainer.appendChild(leftColumn);
    settingContainer.appendChild(rightColumn);
    settingElement.appendChild(settingContainer);

    return settingElement;
};

window.DeathNote.ui.updateRadioButtonsUI = function() {
    console.log("Updating all radio button UI states");

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
            console.log(`Group ${groupName}: found checked radio with value=${checkedRadio.value}`);

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
};

window.DeathNote.ui.setupRadioButtonSyncEvents = function() {
    // Call this after UI is generated

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
    window.DeathNote.ui.updateRadioButtonsUI();

    // Also run this periodically to catch any async updates
    setInterval(window.DeathNote.ui.updateRadioButtonsUI, 1000);
};

// Function to create an input element for a setting
window.DeathNote.ui.createInputElement = function(setting) {
    const inputContainer = document.createElement('div');
    inputContainer.className = 'setting-input-container';

    let inputElement;

    switch (setting.type) {
        case 'text':
            inputElement = document.createElement('input');
            inputElement.type = 'text';
            inputElement.className = 'form-control';
            inputElement.id = setting.id;
            inputElement.value = setting.defaultValue;
            inputElement.placeholder = setting.placeholder || '';
            if (setting.pattern) {
                inputElement.pattern = setting.pattern;
            }
            if (setting.required) {
                inputElement.required = true;
            }

            inputElement.addEventListener('input', function() {
                window.DeathNote.settings.settings[setting.id].value = this.value;
                window.DeathNote.settings.settings[setting.id].manuallySet = false;
                window.DeathNote.settings.updateRelevancyScores();
                window.DeathNote.ui.updateOutput();
                window.DeathNote.recommendations.updateRecommendations();
            });
            break;

        case 'boolean':
            inputContainer.className = 'form-check';

            inputElement = document.createElement('input');
            inputElement.type = 'checkbox';
            inputElement.className = 'form-check-input';
            inputElement.id = setting.id;
            inputElement.checked = setting.defaultValue;

            const labelElement = document.createElement('label');
            labelElement.className = 'form-check-label';
            labelElement.htmlFor = setting.id;
            labelElement.textContent = 'Enabled';

            inputElement.addEventListener('change', function() {
                window.DeathNote.settings.settings[setting.id].value = this.checked;
                window.DeathNote.settings.settings[setting.id].manuallySet = false;
                window.DeathNote.settings.updateRelevancyScores();
                window.DeathNote.ui.updateOutput();
                window.DeathNote.recommendations.updateRecommendations();
            });

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

            inputElement.value = setting.defaultValue;

            inputElement.addEventListener('change', function() {
                window.DeathNote.settings.settings[setting.id].value = this.value;
                window.DeathNote.settings.settings[setting.id].manuallySet = false;
                window.DeathNote.settings.updateRelevancyScores();
                window.DeathNote.ui.updateOutput();
                window.DeathNote.recommendations.updateRecommendations();
            });
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
                checkbox.checked = option.defaultValue;

                // Initialize the setting
                window.DeathNote.settings.settings[option.id] = {
                    value: option.defaultValue,
                    relevancyScore: 0.5,
                    visible: !setting.isAdvanced,
                    manuallySet: false
                };

                checkbox.addEventListener('change', function() {
                    window.DeathNote.settings.settings[option.id].value = this.checked;
                    window.DeathNote.settings.settings[option.id].manuallySet = false;
                    window.DeathNote.settings.updateRelevancyScores();
                    window.DeathNote.ui.updateOutput();
                    window.DeathNote.recommendations.updateRecommendations();
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
            inputElement.value = setting.defaultValue;

            const valueDisplay = document.createElement('div');
            valueDisplay.className = 'text-center';
            valueDisplay.textContent = setting.defaultValue;

            const rangeValues = document.createElement('div');
            rangeValues.className = 'range-values';
            rangeValues.innerHTML = `<span>${setting.min}</span><span>${setting.max}</span>`;

            inputElement.addEventListener('input', function() {
                valueDisplay.textContent = this.value;
                window.DeathNote.settings.settings[setting.id].value = parseFloat(this.value);
                window.DeathNote.settings.settings[setting.id].manuallySet = false;
                window.DeathNote.settings.updateRelevancyScores();
                window.DeathNote.ui.updateOutput();
                window.DeathNote.recommendations.updateRecommendations();
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
                radioInput.checked = option.value === setting.defaultValue;
                radioInput.autocomplete = 'off';

                radioLabel.htmlFor = `${setting.id}-${option.value}`;
                radioLabel.textContent = option.label;

                radioInput.addEventListener('change', function() {
                    if (this.checked) {
                        window.DeathNote.settings.settings[setting.id].value = this.value;
                        window.DeathNote.settings.settings[setting.id].manuallySet = false;
                        window.DeathNote.settings.updateRelevancyScores();
                        window.DeathNote.ui.updateOutput();
                        window.DeathNote.recommendations.updateRecommendations();
                    }
                });

                radioGroup.appendChild(radioInput);
                radioGroup.appendChild(radioLabel);
            });

            inputContainer.appendChild(radioGroup);
            break;

        default:
            inputElement = document.createElement('input');
            inputElement.type = 'text';
            inputElement.className = 'form-control';
            inputElement.id = setting.id;
            inputElement.value = setting.defaultValue;

            inputElement.addEventListener('input', function() {
                window.DeathNote.settings.settings[setting.id].value = this.value;
                window.DeathNote.settings.settings[setting.id].manuallySet = false;
                window.DeathNote.settings.updateRelevancyScores();
                window.DeathNote.ui.updateOutput();
                window.DeathNote.recommendations.updateRecommendations();
            });
            break;
    }

    if (inputElement && !inputContainer.contains(inputElement)) {
        inputContainer.appendChild(inputElement);
    }

    return inputContainer;
};

// Function to set up the advanced settings toggle
window.DeathNote.ui.setupAdvancedSettingsToggle = function() {
    const toggleButton = document.getElementById('toggle-advanced-settings');
    const advancedSettings = document.getElementById('advanced-settings');
    const caret = document.getElementById('advanced-caret');

    if (!toggleButton || !advancedSettings || !caret) {
        console.error("Advanced settings toggle elements not found");
        return;
    }

    toggleButton.addEventListener('click', function() {
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
    });
};

// Function to set up the copy button functionality
window.DeathNote.ui.setupCopyButton = function() {
    const copyBtn = document.getElementById('copy-btn');
    const outputBox = document.getElementById('output-box');

    if (!copyBtn || !outputBox) {
        console.error("Copy button or output box not found");
        return;
    }

    copyBtn.addEventListener('click', function() {
        // Select the text
        outputBox.select();

        // Copy the text to the clipboard
        navigator.clipboard.writeText(outputBox.value)
            .then(() => {
                // Visual feedback on successful copy
                copyBtn.classList.add('copy-flash');
                copyBtn.textContent = 'Copied!';

                // Reset the button after a delay
                setTimeout(() => {
                    copyBtn.classList.remove('copy-flash');
                    copyBtn.innerHTML = '<i class="fas fa-copy me-2"></i>Copy to Clipboard';
                }, 2000);
            })
            .catch(err => {
                console.error('Could not copy text: ', err);
            });
    });

    // Auto-expand selection to full text when partial selection is made
    outputBox.addEventListener('click', function() {
        this.select();
    });
};

// Function to set up the Reset All button
window.DeathNote.ui.setupResetAllButton = function() {
    const resetAllBtn = document.getElementById('reset-all-btn');

    if (!resetAllBtn) {
        console.error("Reset all button not found");
        return;
    }

    resetAllBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to reset all settings to their default values?')) {
            // Re-initialize all settings
            window.DeathNote.settings.initializeSettings();

            // Update all UI elements
            window.DeathNote.settings.settingsDefinitions.forEach(definition => {
                const element = document.getElementById(definition.id);
                if (element) {
                    if (definition.type === 'boolean') {
                        element.checked = definition.defaultValue;
                        // Trigger change event
                        element.dispatchEvent(new Event('change'));
                    } else if (definition.type === 'radio') {
                        // First, uncheck all radio buttons in the group
                        document.querySelectorAll(`input[name="${definition.id}"]`).forEach(radio => {
                            radio.checked = false;
                        });

                        // Find the radio button with the default value
                        const targetRadio = document.querySelector(`input[name="${definition.id}"][value="${definition.defaultValue}"]`);
                        if (targetRadio) {
                            console.log(`Found radio button: ${targetRadio.id}`);

                            // Check the target radio button
                            targetRadio.checked = true;

                            // Dispatch the change event with bubbles:true
                            targetRadio.dispatchEvent(new Event('change', { bubbles: true }));

                            // Force Bootstrap to refresh the buttons' visual state by simulating a click
                            setTimeout(() => {
                                targetRadio.click();
                            }, 10);
                        } else {
                            console.error(`Could not find radio button for ${definition.id} with value ${definition.defaultValue}`);
                        }
                    } else if (definition.type === 'checkbox-group') {
                        definition.options.forEach(option => {
                            const checkbox = document.getElementById(option.id);
                            if (checkbox) {
                                checkbox.checked = option.defaultValue;
                                // Trigger change event
                                checkbox.dispatchEvent(new Event('change'));

                                // Make sure to update settings for each option
                                if (window.DeathNote.settings.settings[option.id]) {
                                    window.DeathNote.settings.settings[option.id].value = option.defaultValue;
                                    window.DeathNote.settings.settings[option.id].manuallySet = false;
                                    window.DeathNote.settings.settings[option.id].visible = !definition.isAdvanced;

                                    // Update option visibility checkbox
                                    const optionVisibilityCheckbox = document.getElementById(`visible-${option.id}`);
                                    if (optionVisibilityCheckbox) {
                                        optionVisibilityCheckbox.checked = !definition.isAdvanced;
                                    }
                                }
                            }
                        });
                    } else {
                        element.value = definition.defaultValue;
                        // Trigger change event
                        element.dispatchEvent(new Event('change'));

                        // For range inputs, also update the displayed value
                        if (definition.type === 'range') {
                            const parentContainer = element.closest('.setting-input-container');
                            if (parentContainer) {
                                const valueDisplay = parentContainer.querySelector('.text-center');
                                if (valueDisplay) {
                                    valueDisplay.textContent = definition.defaultValue;
                                }
                            }
                        }
                    }
                }

                // Reset visibility checkbox for the main setting
                const visibilityCheckbox = document.getElementById(`visible-${definition.id}`);
                if (visibilityCheckbox) {
                    visibilityCheckbox.checked = !definition.isAdvanced;
                }
            });

            // Update output and recommendations
            window.DeathNote.settings.updateRelevancyScores();
            window.DeathNote.ui.updateOutput();
            window.DeathNote.recommendations.updateRecommendations();
        }
    });
};

// Function to reset a single setting to its default value
window.DeathNote.ui.resetSetting = function(settingId) {
    const definition = window.DeathNote.settings.settingsDefinitions.find(def => def.id === settingId);
    if (!definition) return;

    console.log(`Resetting setting: ${settingId} to default value: ${definition.defaultValue}`);

    // Reset the value in the settings object
    window.DeathNote.settings.settings[settingId].value = definition.defaultValue;
    window.DeathNote.settings.settings[settingId].manuallySet = false;

    // Special handling for radio buttons
    if (definition.type === 'radio') {
        console.log(`Handling radio button reset: ${settingId} to ${definition.defaultValue}`);

        // IMPORTANT: Defer this action slightly to ensure DOM is ready
        setTimeout(() => {
            // Find all radio buttons in the group
            const allRadios = document.querySelectorAll(`input[name="${settingId}"]`);
            console.log(`Found ${allRadios.length} radio buttons in group ${settingId}`);

            // Log the IDs of all radio buttons
            allRadios.forEach((radio, idx) => {
                console.log(`Radio ${idx}: id=${radio.id}, value=${radio.value}, checked=${radio.checked}`);
            });

            // First uncheck all radios
            allRadios.forEach(radio => radio.checked = false);

            // Find the target radio button with exact value matching
            const targetSelector = `input[name="${settingId}"][value="${definition.defaultValue}"]`;
            console.log(`Looking for radio with selector: ${targetSelector}`);
            const targetRadio = document.querySelector(targetSelector);

            if (targetRadio) {
                console.log(`Found target radio: id=${targetRadio.id}`);
                // Check it
                targetRadio.checked = true;

                // Dispatch change event
                targetRadio.dispatchEvent(new Event('change', { bubbles: true }));

                // Force update by triggering a click on the target radio button
                targetRadio.click();

                // Update the settings object again (in case click handler changed it)
                window.DeathNote.settings.settings[settingId].value = definition.defaultValue;
            } else {
                console.error(`ERROR: Could not find radio with value=${definition.defaultValue}`);
                // Try one more approach - maybe the value needs string conversion
                const fallbackSelector = `input[name="${settingId}"]`;
                const fallbackRadios = document.querySelectorAll(fallbackSelector);

                // Try to find by checking each one's value
                let found = false;
                fallbackRadios.forEach(radio => {
                    console.log(`Checking radio id=${radio.id}, value=${radio.value}`);
                    if (radio.value == definition.defaultValue) { // Note: loose equality check
                        console.log(`Found matching radio: ${radio.id}`);
                        radio.checked = true;
                        radio.dispatchEvent(new Event('change', { bubbles: true }));
                        radio.click();
                        found = true;
                    }
                });

                if (!found) {
                    console.error(`CRITICAL ERROR: Could not find any matching radio button`);
                }
            }

            // Update output and recommendations
            window.DeathNote.settings.updateRelevancyScores();
            window.DeathNote.ui.updateOutput();
            window.DeathNote.recommendations.updateRecommendations();
        }, 10);

        return; // Exit early since we're handling async
    }

    // Update the UI for other elements
    // [Rest of the function remains the same]
    const element = document.getElementById(settingId);
    if (element) {
        if (definition.type === 'boolean') {
            element.checked = definition.defaultValue;
            // Trigger change event
            element.dispatchEvent(new Event('change'));
        } else if (definition.type === 'checkbox-group') {
            // For checkbox groups, we need to reset each child option
            definition.options.forEach(option => {
                const checkbox = document.getElementById(option.id);
                if (checkbox) {
                    checkbox.checked = option.defaultValue;
                    // Trigger change event
                    checkbox.dispatchEvent(new Event('change'));

                    // Make sure to update settings for each option
                    if (window.DeathNote.settings.settings[option.id]) {
                        window.DeathNote.settings.settings[option.id].value = option.defaultValue;
                        window.DeathNote.settings.settings[option.id].manuallySet = false;

                        // Also update the visibility for each option
                        window.DeathNote.settings.settings[option.id].visible = !definition.isAdvanced;

                        // Update option visibility checkbox
                        const optionVisibilityCheckbox = document.getElementById(`visible-${option.id}`);
                        if (optionVisibilityCheckbox) {
                            optionVisibilityCheckbox.checked = !definition.isAdvanced;
                        }
                    }
                }
            });
        } else if (definition.type === 'range') {
            // For range inputs, ensure we update both the value and position
            element.value = definition.defaultValue;

            // Find and update the displayed value
            const parentContainer = element.closest('.setting-input-container');
            if (parentContainer) {
                const valueDisplay = parentContainer.querySelector('.text-center');
                if (valueDisplay) {
                    valueDisplay.textContent = definition.defaultValue;
                }
            }

            // Trigger both input and change events
            element.dispatchEvent(new Event('input', { bubbles: true }));
            element.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
            element.value = definition.defaultValue;
            // Trigger change event
            element.dispatchEvent(new Event('change'));
        }
    }

    // Reset visibility
    window.DeathNote.settings.settings[settingId].visible = !definition.isAdvanced;
    window.DeathNote.settings.settings[settingId].manuallySet = false;

    // Update visibility checkbox
    const visibilityCheckbox = document.getElementById(`visible-${settingId}`);
    if (visibilityCheckbox) {
        visibilityCheckbox.checked = !definition.isAdvanced;
    }

    // Update output and recommendations
    window.DeathNote.settings.updateRelevancyScores();
    window.DeathNote.ui.updateOutput();
    window.DeathNote.recommendations.updateRecommendations();
};

// Calculate game balance rating (0-100%)
window.DeathNote.ui.calculateGameBalanceRating = function() {
    const settings = window.DeathNote.settings.settings;
    let balanceScore = 100; // Start with perfect balance

    // Factor 1: Unbalanced progress multipliers
    if (settings.kiraProgressMultiplier && settings.teamLProgressMultiplier) {
        const progressDifference = Math.abs(settings.kiraProgressMultiplier.value - settings.teamLProgressMultiplier.value);
        // Deduct up to 30 points for unbalanced progress
        balanceScore -= progressDifference * 60;
    }

    // Factor 2: Missing roles based on player count
    if (settings.kiraFollowerRole && settings.kiraFollowerRole.value === "0") {
        // Higher penalty for higher player counts
        if (settings.maximumPlayers && settings.maximumPlayers.value >= 6) {
            balanceScore -= 20; // Higher penalty for 6+ players
        } else {
            balanceScore -= 10; // Lower penalty for 5 or fewer players
        }
    }

    // Factor 3: Extreme movement speed
    if (settings.movementSpeed) {
        const speedDeviation = Math.abs(settings.movementSpeed.value - 1.0);
        // Deduct up to 15 points for extreme speeds
        balanceScore -= speedDeviation * 30;
    }

    // Factor 4: Too few/many tasks relative to ideal
    if (settings.numberOfTasks) {
        const taskCounts = window.DeathNote.settings.calculateIdealTaskCount(settings);
        const taskDeviation = Math.abs(settings.numberOfTasks.value - taskCounts.ideal) / taskCounts.ideal;
        // Deduct up to 20 points for task imbalance
        balanceScore -= taskDeviation * 40;
    }

    // Factor 5: Black notebooks with high criminal judgments
    if (settings.haveBlackNotebooks && settings.haveBlackNotebooks.value &&
        settings.maximumCriminalJudgments && settings.maximumCriminalJudgments.value > 6) {
        balanceScore -= 15;
    }

    // Factor 6: High Kira Progress with many judgments
    if (settings.kiraProgressMultiplier && settings.kiraProgressMultiplier.value >= 1.4 &&
        settings.maximumCriminalJudgments && settings.maximumCriminalJudgments.value >= 7) {
        balanceScore -= 20;
    }

    // Factor 7: Low Team L progress
    if (settings.teamLProgressMultiplier && settings.teamLProgressMultiplier.value <= 0.7) {
        balanceScore -= 15;
    }

    // Clamp result between 0-100
    return Math.max(0, Math.min(100, Math.round(balanceScore)));
};

// Calculate fun rating (0-100%)
window.DeathNote.ui.calculateFunRating = function() {
    const settings = window.DeathNote.settings.settings;
    let funScore = 85; // Start with a good baseline

    // Factor 1: Player count (higher is more fun to a point)
    if (settings.maximumPlayers) {
        if (settings.maximumPlayers.value < 6) {
            funScore -= (6 - settings.maximumPlayers.value) * 7; // Higher penalty
        } else if (settings.maximumPlayers.value > 8) {
            funScore += 5; // Bonus for large games
        }
    }

    // Factor 2: Movement speed (slightly higher is more fun)
    if (settings.movementSpeed) {
        if (settings.movementSpeed.value < 0.8) {
            funScore -= (0.8 - settings.movementSpeed.value) * 60; // Major penalty for slow movement
        } else if (settings.movementSpeed.value > 1.0 && settings.movementSpeed.value <= 1.2) {
            funScore += (settings.movementSpeed.value - 1.0) * 15; // Bonus for slightly faster
        } else if (settings.movementSpeed.value > 1.2) {
            funScore -= (settings.movementSpeed.value - 1.2) * 35; // Penalty for too fast
        }
    }

    // Factor 3: Role variety
    if (settings.melloRole && settings.melloRole.value === "0") {
        funScore -= 25; // Major penalty for missing Mello
    }

    if (settings.kiraFollowerRole && settings.kiraFollowerRole.value === "0") {
        funScore -= 20; // Major penalty for missing Kira Follower
    }

    // Factor 4: Black notebooks (add randomness and fun)
    if (settings.haveBlackNotebooks && settings.haveBlackNotebooks.value) {
        funScore += 10;
    }

    // Factor 5: Task count near ideal is more fun
    if (settings.numberOfTasks) {
        const taskCounts = window.DeathNote.settings.calculateIdealTaskCount(settings);
        const taskDeviation = Math.abs(settings.numberOfTasks.value - taskCounts.ideal);

        // Steeper penalty for extreme deviation
        if (taskDeviation >= 3) {
            funScore -= 20;
        } else {
            funScore -= taskDeviation * 7;
        }
    }

    // Factor 6: Voice chat enabled
    if (settings.voiceChat && !settings.voiceChat.value) {
        funScore -= 15; // Penalty when disabled
    }

    // Factor 7: Role selection enabled
    if (settings.roleSelection && settings.roleSelection.value) {
        funScore += 5;
    }

    // Factor 8: Canvas tasks disabled
    if (settings.canvasTasks && !settings.canvasTasks.value) {
        funScore -= 20; // Major penalty for disabled canvas tasks
    }

    // Factor 9: Meeting time too short or too long
    if (settings.meetingSeconds) {
        if (settings.meetingSeconds.value < 60) {
            funScore -= (60 - settings.meetingSeconds.value) / 60 * 20; // Penalty for very short meetings
        } else if (settings.meetingSeconds.value > 210) {
            funScore -= (settings.meetingSeconds.value - 210) / 30 * 10; // Penalty for very long meetings
        }
    }

    // Factor 10: Day/Night seconds too short
    if (settings.dayNightSeconds && settings.dayNightSeconds.value <= 30) {
        funScore -= 10; // Penalty for very short rounds
    }

    // Clamp result between 0-100
    return Math.max(0, Math.min(100, Math.round(funScore)));
};

// Calculate fun rating (0-100%)
window.DeathNote.ui.calculateFunRating = function() {
    const settings = window.DeathNote.settings.settings;
    let funScore = 80; // Start with a good baseline

    // Factor 1: Player count (higher is more fun to a point)
    if (settings.maximumPlayers) {
        if (settings.maximumPlayers.value < 6) {
            funScore -= (6 - settings.maximumPlayers.value) * 5;
        } else if (settings.maximumPlayers.value > 8) {
            funScore += 5; // Bonus for large games
        }
    }

    // Factor 2: Movement speed (slightly higher is more fun)
    if (settings.movementSpeed) {
        if (settings.movementSpeed.value < 0.8) {
            funScore -= (0.8 - settings.movementSpeed.value) * 50; // Major penalty for slow movement
        } else if (settings.movementSpeed.value > 1.0 && settings.movementSpeed.value <= 1.2) {
            funScore += (settings.movementSpeed.value - 1.0) * 20; // Bonus for slightly faster
        } else if (settings.movementSpeed.value > 1.2) {
            funScore -= (settings.movementSpeed.value - 1.2) * 30; // Penalty for too fast
        }
    }

    // Factor 3: Role variety
    if (settings.melloRole && settings.melloRole.value !== "0") {
        funScore += 5;
    }

    if (settings.kiraFollowerRole && settings.kiraFollowerRole.value !== "0") {
        funScore += 5;
    }

    // Factor 4: Black notebooks (add randomness and fun)
    if (settings.haveBlackNotebooks && settings.haveBlackNotebooks.value) {
        funScore += 10;
    }

    // Factor 5: Task count near ideal is more fun
    if (settings.numberOfTasks) {
        const taskCounts = window.DeathNote.settings.calculateIdealTaskCount(settings);
        const taskDeviation = Math.abs(settings.numberOfTasks.value - taskCounts.ideal);
        funScore -= taskDeviation * 5;
    }

    // Factor 6: Voice chat enabled
    if (settings.voiceChat && settings.voiceChat.value) {
        funScore += 10;
    }

    // Factor 7: Role selection enabled
    if (settings.roleSelection && settings.roleSelection.value) {
        funScore += 5;
    }

    // Clamp result between 0-100
    return Math.max(0, Math.min(100, Math.round(funScore)));
};

// Function to generate and update the output in the textbox
window.DeathNote.ui.updateOutput = function() {
    // Make sure the settings module is available
    if (!window.DeathNote.settings || !window.DeathNote.settings.BINS) {
        console.error("Settings module not fully loaded");
        return;
    }

    const BINS = window.DeathNote.settings.BINS;
    const outputBox = document.getElementById('output-box');

    if (!outputBox) {
        console.error("Output box not found");
        return;
    }

    // Check if lobby code is set
    const lobbyCode = window.DeathNote.settings.settings.lobbyCode?.value;
    if (!lobbyCode || lobbyCode.length < 5) {
        // Show prompt if lobby code is not set properly
        outputBox.value = "# Please Enter Lobby Code\n\nEnter a 5-character lobby code in the settings to generate your Discord post.";
        return;
    }

    // Count non-default settings for threshold calculation
    let nonDefaultCount = 0;
    window.DeathNote.settings.settingsDefinitions.forEach(definition => {
        if (window.DeathNote.settings.settings[definition.id].value !== definition.defaultValue) {
            nonDefaultCount++;
        }
    });

    // Calculate dynamic threshold based on non-default count
    // Higher threshold with more non-default settings to avoid information overload
    const threshold = Math.min(0.6, 0.08 * nonDefaultCount + 0.2);

    // Organize settings by bin
    const settingsByBin = {
        [BINS.LOBBY]: [],
        [BINS.PLAYER]: [],
        [BINS.GAMEPLAY]: []
    };

    // Process settings for visibility
    window.DeathNote.settings.settingsDefinitions.forEach(definition => {
        // Skip if manually set to not visible
        if (window.DeathNote.settings.settings[definition.id].manuallySet &&
            !window.DeathNote.settings.settings[definition.id].visible) {
            return;
        }

        // Set initial visibility based on relevancy score and threshold
        let isVisible = false;

        // Force visibility for critical settings that can't be hidden
        if (!definition.canHide) {
            isVisible = true;
        }
        // Determine visibility by threshold if not manually set
        else if (!window.DeathNote.settings.settings[definition.id].manuallySet) {
            isVisible = window.DeathNote.settings.settings[definition.id].relevancyScore > threshold;
        }
        // Use manual setting if available
        else {
            isVisible = window.DeathNote.settings.settings[definition.id].visible;
        }

        // Apply visibility rules (handled by settings.js)
        isVisible = window.DeathNote.settings.applySettingVisibilityRules(
            definition,
            isVisible,
            window.DeathNote.settings.settings
        );

        // Let settings.js handle any special display formatting
        definition.displayValue = window.DeathNote.settings.getSettingDisplayValue(
            definition,
            window.DeathNote.settings.settings
        );

        // Special case for Allowed Player Type
        if (definition.type === 'checkbox-group') {
            // Skip parent, we'll process each option separately
            return;
        }

        // Update checkbox state based on relevancy
        const checkboxEl = document.getElementById(`visible-${definition.id}`);
        if (checkboxEl && !window.DeathNote.settings.settings[definition.id].manuallySet) {
            // For zero relevancy items, uncheck the box
            if (window.DeathNote.settings.settings[definition.id].relevancyScore === 0.0 && definition.canHide) {
                checkboxEl.checked = false;
                window.DeathNote.settings.settings[definition.id].visible = false;
            }
        }

        // Only add visible settings to the output bins
        if (isVisible) {
            settingsByBin[definition.bin].push({
                id: definition.id,
                name: definition.name,
                value: definition.displayValue || window.DeathNote.settings.settings[definition.id].value,
                relevancyScore: window.DeathNote.settings.settings[definition.id].relevancyScore
            });
        }
    });

    // Process special setting groups (handled by settings.js)
    window.DeathNote.settings.processSpecialSettingGroups(
        settingsByBin,
        window.DeathNote.settings.settings
    );

    // Sort settings within each bin by relevancy score (descending)
    Object.keys(settingsByBin).forEach(bin => {
        settingsByBin[bin].sort((a, b) => b.relevancyScore - a.relevancyScore);
    });

    // Define emojis for each setting type using Discord emoji codes
    const settingEmojis = {
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
        allowedPlayerType: ":game_die:"
    };

    // Determine header theme based on settings
    let headerEmoji = ":notepad_spiral:";
    let headerDecoration = "═════════════════════════";

    const balanceRating = window.DeathNote.ui.calculateGameBalanceRating();
    const funRating = window.DeathNote.ui.calculateFunRating();

    // Choose appropriate header based on balance/fun
    if (funRating >= 90) {
        headerEmoji = ":fire:";
        headerDecoration = "━━━━━━━━━━━━━━━━━━━━━━━━━━━";
    } else if (balanceRating < 60) {
        headerEmoji = ":warning:";
        headerDecoration = "⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️";
    } else if (window.DeathNote.settings.settings.melloRole?.value === "0" ||
        window.DeathNote.settings.settings.kiraFollowerRole?.value === "0") {
        headerEmoji = ":warning:";
        headerDecoration = "❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗";
    }

    // Build the output markdown with Discord-friendly formatting and decorative elements
// Updated segment of the updateOutput function with your preferred format
// Replace the existing header output code with this improved version

// Build the output markdown with your preferred Discord-friendly format
// Starting with an empty line for better spacing in Discord
    let output = `_ _\n# ${headerEmoji} **DEATH NOTE: KILLER WITHIN** ${headerEmoji}\n\n`;

// Add each bin to the output (only if it has visible settings)
    Object.keys(settingsByBin).forEach(bin => {
        const binSettings = settingsByBin[bin];

        if (binSettings.length > 0) {
            // Add section divider for non-lobby sections
            if (bin !== BINS.LOBBY) {
                output += `## ${getBinEmoji(bin)} ${bin}\n\n`;
            }

            binSettings.forEach(setting => {
                let settingName = setting.name;
                let settingValue = setting.value;
                const emoji = settingEmojis[setting.id] || ":small_blue_diamond:";

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

    output += `${window.DeathNote.settings.creditLine}`;

    // Update the output box
    outputBox.value = output;
};

// Helper function to get emoji for bin headers
function getBinEmoji(bin) {
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

// Initialize the UI when everything is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("App module loaded");

    // Check if the global namespace is available
    if (!window.DeathNote) {
        console.error("DeathNote global namespace not found");
        return;
    }

    // Register this module as ready
    if (window.DeathNote.registerModule) {
        window.DeathNote.registerModule('app');
    } else {
        console.error("DeathNote.registerModule is not available");
    }
});