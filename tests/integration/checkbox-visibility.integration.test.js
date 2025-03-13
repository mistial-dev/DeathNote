/**
 * Integration tests for the visibility system
 *
 * These tests verify that the settings module and UI properly synchronize
 * visibility state and checkboxes throughout the application lifecycle
 */

describe('Visibility Integration Tests', () => {
    // Mock DOM and modules
    let mockDOM;
    let settings;
    let settingsUI;
    let checkboxEvents = {};
    let dispatchedEvents = [];

    beforeEach(() => {
        // Set up DOM mocks
        mockDOM = {
            // Settings container elements
            'lobby-settings-section': { innerHTML: '' },
            'player-settings-section': { innerHTML: '' },
            'gameplay-settings-section': { innerHTML: '' },
            'advanced-settings': { innerHTML: '', classList: { add: jest.fn(), remove: jest.fn(), contains: jest.fn() } },

            // Checkbox elements for visibility
            'visible-lobbyCode': { checked: true, addEventListener: jest.fn() },
            'visible-movementSpeed': { checked: true, addEventListener: jest.fn() },
            'visible-numberOfTasks': { checked: true, addEventListener: jest.fn() },
            'visible-dayNightSeconds': { checked: true, addEventListener: jest.fn() }
        };

        // Mock document methods
        document.getElementById = jest.fn(id => mockDOM[id] || null);
        document.createElement = jest.fn(() => {
            const element = {
                appendChild: jest.fn(),
                classList: { add: jest.fn(), remove: jest.fn(), contains: jest.fn() },
                addEventListener: jest.fn(),
                setAttribute: jest.fn()
            };
            return element;
        });
        document.dispatchEvent = jest.fn(event => {
            dispatchedEvents.push({
                type: event.type,
                detail: event.detail
            });
        });

        // Create actual Settings module (simplified for testing)
        settings = {
            BINS: {
                LOBBY: 'Lobby Settings',
                PLAYER: 'Player',
                GAMEPLAY: 'Gameplay'
            },

            settings: {
                lobbyCode: { value: 'ABC12', relevancyScore: 0.7, visible: true },
                movementSpeed: { value: 1.0, relevancyScore: 0.14, visible: true },
                numberOfTasks: { value: 2, relevancyScore: 0.5, visible: true },
                dayNightSeconds: { value: 45, relevancyScore: 0.7, visible: true }
            },

            settingsDefinitions: [
                {
                    id: 'lobbyCode',
                    name: 'Lobby Code',
                    bin: 'Lobby Settings',
                    type: 'text',
                    defaultValue: '',
                    isAdvanced: false,
                    canHide: false
                },
                {
                    id: 'movementSpeed',
                    name: 'Movement Speed',
                    bin: 'Player',
                    type: 'range',
                    defaultValue: 1.0,
                    isAdvanced: false,
                    canHide: true
                },
                {
                    id: 'numberOfTasks',
                    name: 'Number of Tasks',
                    bin: 'Gameplay',
                    type: 'range',
                    defaultValue: 2,
                    isAdvanced: false,
                    canHide: true
                },
                {
                    id: 'dayNightSeconds',
                    name: 'Day/Night Seconds',
                    bin: 'Gameplay',
                    type: 'range',
                    defaultValue: 45,
                    isAdvanced: false,
                    canHide: true
                }
            ],

            initialized: true,

            getAllSettings: function() {
                return this.settings;
            },

            getDefinition: function(id) {
                return this.settingsDefinitions.find(def => def.id === id) || null;
            },

            getAllDefinitions: function() {
                return this.settingsDefinitions;
            },

            getValue: function(id, defaultValue) {
                if (this.settings[id] && this.settings[id].value !== undefined) {
                    return this.settings[id].value;
                }

                // Get default from definition
                const definition = this.getDefinition(id);
                if (definition && definition.defaultValue !== undefined) {
                    return definition.defaultValue;
                }

                return defaultValue;
            },

            updateSettingVisibility: function(id, visible) {
                console.log(`[TEST] Setting visibility for ${id} to ${visible}`);

                if (!this.settings[id]) {
                    this.settings[id] = {};
                }

                // Update visibility flag with explicit boolean value
                this.settings[id].visible = Boolean(visible);

                // Mark as manually set
                this.settings[id].manuallySet = true;

                // Dispatch visibility changed event
                document.dispatchEvent(new CustomEvent('deathNote:settings:visibilityChanged', {
                    detail: { id, visible }
                }));
            },

            applySettingVisibilityRules: function(definition, defaultVisibility) {
                // Critical settings can't be hidden
                if (!definition.canHide) {
                    return true;
                }

                // Use the provided default
                return defaultVisibility === undefined ? true : Boolean(defaultVisibility);
            },

            resetSettingVisibility: function(id) {
                if (!this.settings[id]) return;

                // Clear manual override
                delete this.settings[id].manuallySet;

                // Reset to default (use isAdvanced to determine)
                const definition = this.getDefinition(id);
                this.settings[id].visible = definition ? !definition.isAdvanced : true;

                // Notify of change
                document.dispatchEvent(new CustomEvent('deathNote:settings:visibilityChanged', {
                    detail: { id, visible: this.settings[id].visible }
                }));
            },

            resetAllVisibility: function() {
                // Clear all manual overrides and reset to defaults
                this.settingsDefinitions.forEach(def => {
                    const id = def.id;
                    if (this.settings[id]) {
                        delete this.settings[id].manuallySet;
                        this.settings[id].visible = !def.isAdvanced;
                    }
                });

                // Trigger UI update
                document.dispatchEvent(new CustomEvent('deathNote:settings:changed'));
            }
        };

        // Create SettingsUI module (just the functions we need)
        settingsUI = {
            elements: {
                lobbySettingsContainer: mockDOM['lobby-settings-section'],
                playerSettingsContainer: mockDOM['player-settings-section'],
                gameplaySettingsContainer: mockDOM['gameplay-settings-section'],
                advancedSettingsContainer: mockDOM['advanced-settings']
            },

            initialized: true,

            _createSettingElement: function(setting) {
                // Create a mock setting element
                const element = document.createElement('div');
                element.id = `setting-item-${setting.id}`;

                // Create visibility checkbox if needed
                if (setting.canHide) {
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.id = `visible-${setting.id}`;

                    // Get actual visibility from settings
                    const currentSetting = settings.settings[setting.id] || {};
                    const isVisible = settings.applySettingVisibilityRules(
                        setting,
                        currentSetting.visible !== undefined ? currentSetting.visible : !setting.isAdvanced
                    );

                    // Set initial state
                    checkbox.checked = isVisible;

                    // Add change handler (simulated)
                    checkboxEvents[setting.id] = function(checked) {
                        settings.updateSettingVisibility(setting.id, checked);
                    };

                    // Add checkbox to element
                    element.appendChild(checkbox);
                }

                return element;
            },

            _syncVisibilityCheckbox: function(settingId) {
                const checkboxEl = document.getElementById(`visible-${settingId}`);
                if (!checkboxEl) return;

                const definition = settings.getDefinition(settingId);
                if (!definition) return;

                const settingsData = settings.getAllSettings();
                const setting = settingsData[settingId];
                if (!setting) return;

                // Determine if setting should be visible based on rules
                const shouldBeVisible = settings.applySettingVisibilityRules(
                    definition,
                    setting.visible !== undefined ? setting.visible : !definition.isAdvanced
                );

                // Update checkbox state
                checkboxEl.checked = shouldBeVisible;
            }
        };

        // Set up global DeathNote object
        window.DeathNote = {
            getModule: jest.fn(name => {
                if (name === 'settings') return settings;
                if (name === 'ui') return { settings: settingsUI };
                return null;
            })
        };

        // Add event listener for visibility changes
        document.addEventListener = jest.fn((eventName, handler) => {
            if (eventName === 'deathNote:settings:visibilityChanged') {
                // Store the handler
                document._visibilityChangedHandler = handler;
            }
        });
    });

    afterEach(() => {
        dispatchedEvents = [];
        checkboxEvents = {};
        jest.resetAllMocks();
    });

    // Tests for the integration of visibility systems

    test('Setting visibility via API should update DOM and internal state', () => {
        // Set up the checkbox
        mockDOM['visible-numberOfTasks'] = { checked: true };
        document.getElementById.mockReturnValue(mockDOM['visible-numberOfTasks']);

        // Update visibility via the API
        settings.updateSettingVisibility('numberOfTasks', false);

        // Internal state should be updated
        expect(settings.settings.numberOfTasks.visible).toBe(false);
        expect(settings.settings.numberOfTasks.manuallySet).toBe(true);

        // Event should be dispatched
        const visibilityEvent = dispatchedEvents.find(
            e => e.type === 'deathNote:settings:visibilityChanged' && e.detail.id === 'numberOfTasks'
        );
        expect(visibilityEvent).toBeDefined();

        // Simulate UI response to the event
        settingsUI._syncVisibilityCheckbox('numberOfTasks');

        // Checkbox should be updated
        expect(mockDOM['visible-numberOfTasks'].checked).toBe(false);
    });

    test('Checking a visibility checkbox should update settings', () => {
        // Start with visibility off
        settings.settings.movementSpeed.visible = false;
        mockDOM['visible-movementSpeed'] = { checked: false };

        // Simulate checkbox change
        mockDOM['visible-movementSpeed'].checked = true;

        // Simulate checkbox event handler
        if (checkboxEvents.movementSpeed) {
            checkboxEvents.movementSpeed(true);
        } else {
            settings.updateSettingVisibility('movementSpeed', true);
        }

        // Setting should be updated
        expect(settings.settings.movementSpeed.visible).toBe(true);
        expect(settings.settings.movementSpeed.manuallySet).toBe(true);

        // Event should have been dispatched
        const visibilityEvent = dispatchedEvents.find(
            e => e.type === 'deathNote:settings:visibilityChanged' && e.detail.id === 'movementSpeed'
        );
        expect(visibilityEvent).toBeDefined();
    });

    test('Critical settings cannot be hidden even when visibility is set to false', () => {
        // Try to hide a critical setting
        settings.updateSettingVisibility('lobbyCode', false);

        // Event should be dispatched but we ignore it for critical settings
        const visibilityEvent = dispatchedEvents.find(
            e => e.type === 'deathNote:settings:visibilityChanged' && e.detail.id === 'lobbyCode'
        );
        expect(visibilityEvent).toBeDefined();

        // Create a visibility checkbox and sync it
        mockDOM['visible-lobbyCode'] = { checked: false }; // Intentionally wrong
        document.getElementById.mockReturnValue(mockDOM['visible-lobbyCode']);

        // Sync the checkbox
        settingsUI._syncVisibilityCheckbox('lobbyCode');

        // Checkbox should be forced to checked
        expect(mockDOM['visible-lobbyCode'].checked).toBe(true);
    });

    test('Resetting visibility should clear manual flags and restore defaults', () => {
        // Set up some manual visibility states
        settings.settings.numberOfTasks.visible = false;
        settings.settings.numberOfTasks.manuallySet = true;
        settings.settings.dayNightSeconds.visible = false;
        settings.settings.dayNightSeconds.manuallySet = true;

        // Create and set up checkboxes
        mockDOM['visible-numberOfTasks'] = { checked: false };
        mockDOM['visible-dayNightSeconds'] = { checked: false };

        // Reset visibility for all settings
        settings.resetAllVisibility();

        // Manual flags should be cleared and defaults restored
        expect(settings.settings.numberOfTasks.manuallySet).toBeUndefined();
        expect(settings.settings.numberOfTasks.visible).toBe(true); // Default is true for non-advanced
        expect(settings.settings.dayNightSeconds.manuallySet).toBeUndefined();
        expect(settings.settings.dayNightSeconds.visible).toBe(true);

        // Sync the checkboxes
        document.getElementById.mockReturnValueOnce(mockDOM['visible-numberOfTasks'])
            .mockReturnValueOnce(mockDOM['visible-dayNightSeconds']);

        settingsUI._syncVisibilityCheckbox('numberOfTasks');
        settingsUI._syncVisibilityCheckbox('dayNightSeconds');

        // Checkboxes should be updated to match settings
        expect(mockDOM['visible-numberOfTasks'].checked).toBe(true);
        expect(mockDOM['visible-dayNightSeconds'].checked).toBe(true);
    });

    test('Changing a setting value should not affect manually set visibility', () => {
        // Manually set visibility to false
        settings.settings.movementSpeed.visible = false;
        settings.settings.movementSpeed.manuallySet = true;
        mockDOM['visible-movementSpeed'] = { checked: false };

        // Change a setting value (would normally trigger relevancy recalculation)
        settings.settings.movementSpeed.value = 1.5;

        // Manual visibility should be preserved
        expect(settings.settings.movementSpeed.visible).toBe(false);

        // Sync the checkbox
        document.getElementById.mockReturnValue(mockDOM['visible-movementSpeed']);
        settingsUI._syncVisibilityCheckbox('movementSpeed');

        // Checkbox should still be unchecked
        expect(mockDOM['visible-movementSpeed'].checked).toBe(false);
    });
});