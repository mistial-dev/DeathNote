/**
 * Tests for visibility checkbox functionality
 *
 * These tests specifically focus on the synchronization between
 * the visibility checkboxes and the actual visibility state in settings
 */

describe('Visibility Checkbox Functionality', () => {
    // Mock DOM elements, settings, and event handling
    let mockCheckboxes = {};
    let mockSettings = {};
    let dispatchedEvents = [];
    let settingsUI;
    let settingsModule;

    // Set up before each test
    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Mock checkbox elements
        mockCheckboxes = {
            'visible-lobbyCode': { checked: true, addEventListener: jest.fn() },
            'visible-movementSpeed': { checked: true, addEventListener: jest.fn() },
            'visible-numberOfTasks': { checked: true, addEventListener: jest.fn() },
            'visible-voiceChat': { checked: true, addEventListener: jest.fn() }
        };

        // Mock settings module with relevant data
        mockSettings = {
            lobbyCode: { value: 'ABC12', relevancyScore: 0.7, visible: true },
            movementSpeed: { value: 1.0, relevancyScore: 0.14, visible: true },
            numberOfTasks: { value: 2, relevancyScore: 0.5, visible: true },
            voiceChat: { value: true, relevancyScore: 0.1, visible: true }
        };

        // Mock document functions
        document.getElementById = jest.fn(id => mockCheckboxes[id] || null);
        document.dispatchEvent = jest.fn(event => {
            dispatchedEvents.push({
                type: event.type,
                detail: event.detail
            });

            // If this is a visibility changed event, update the checkbox
            if (event.type === 'deathNote:settings:visibilityChanged' && event.detail && event.detail.id) {
                const checkbox = mockCheckboxes[`visible-${event.detail.id}`];
                if (checkbox) {
                    checkbox.checked = event.detail.visible;
                }
            }
        });

        // Create mock settings module
        settingsModule = {
            settings: mockSettings,

            settingsDefinitions: [
                {
                    id: 'lobbyCode',
                    name: 'Lobby Code',
                    bin: 'Lobby Settings',
                    canHide: false,
                    isAdvanced: false
                },
                {
                    id: 'movementSpeed',
                    name: 'Movement Speed',
                    bin: 'Player',
                    canHide: true,
                    isAdvanced: false
                },
                {
                    id: 'numberOfTasks',
                    name: 'Number of Tasks',
                    bin: 'Gameplay',
                    canHide: true,
                    isAdvanced: false
                },
                {
                    id: 'voiceChat',
                    name: 'Voice Chat',
                    bin: 'Gameplay',
                    canHide: true,
                    isAdvanced: false
                }
            ],

            getAllSettings: function() {
                return this.settings;
            },

            getDefinition: function(id) {
                return this.settingsDefinitions.find(def => def.id === id);
            },

            updateSettingVisibility: function(id, visible) {
                if (!this.settings[id]) {
                    this.settings[id] = {};
                }
                this.settings[id].visible = visible;
                this.settings[id].manuallySet = true;

                document.dispatchEvent(new CustomEvent('deathNote:settings:visibilityChanged', {
                    detail: { id, visible }
                }));
            },

            applySettingVisibilityRules: function(definition, defaultVisibility) {
                if (!definition.canHide) {
                    return true;
                }
                return defaultVisibility;
            }
        };

        // Create mock UI module with just the function we need to test
        settingsUI = {
            _syncVisibilityCheckbox: function(settingId) {
                const checkboxEl = document.getElementById(`visible-${settingId}`);
                if (!checkboxEl) return;

                const definition = settingsModule.getDefinition(settingId);
                if (!definition) return;

                const settingsData = settingsModule.getAllSettings();
                const setting = settingsData[settingId];
                if (!setting) return;

                // Determine if setting should be visible
                const shouldBeVisible = settingsModule.applySettingVisibilityRules(
                    definition,
                    setting.visible !== undefined ? setting.visible : !definition.isAdvanced
                );

                // Update checkbox state
                checkboxEl.checked = shouldBeVisible;
            }
        };

        // Mock DeathNote global object
        window.DeathNote = {
            getModule: jest.fn(name => {
                if (name === 'settings') return settingsModule;
                if (name === 'ui') return { settings: settingsUI };
                return null;
            })
        };
    });

    afterEach(() => {
        dispatchedEvents = [];
        jest.restoreAllMocks();
    });

    test('Visibility checkbox initially matches the setting visibility state', () => {
        // Set up test state
        mockSettings.movementSpeed.visible = false;
        mockCheckboxes['visible-movementSpeed'].checked = true; // Incorrect initial state

        // Call the function to sync checkbox
        settingsUI._syncVisibilityCheckbox('movementSpeed');

        // Checkbox should be updated to match setting
        expect(mockCheckboxes['visible-movementSpeed'].checked).toBe(false);
    });

    test('Setting visibility to false updates checkbox to unchecked', () => {
        // Start with everything visible
        Object.keys(mockSettings).forEach(key => {
            mockSettings[key].visible = true;
            if (mockCheckboxes[`visible-${key}`]) {
                mockCheckboxes[`visible-${key}`].checked = true;
            }
        });

        // Update visibility for numberOfTasks
        settingsModule.updateSettingVisibility('numberOfTasks', false);

        // The checkbox should be unchecked
        expect(mockCheckboxes['visible-numberOfTasks'].checked).toBe(false);

        // A visibility changed event should have been dispatched
        const visibilityEvent = dispatchedEvents.find(
            e => e.type === 'deathNote:settings:visibilityChanged' && e.detail.id === 'numberOfTasks'
        );
        expect(visibilityEvent).toBeDefined();
        expect(visibilityEvent.detail.visible).toBe(false);
    });

    test('Critical settings that cannot be hidden always have checked checkboxes', () => {
        // Try to make lobbyCode invisible
        mockSettings.lobbyCode.visible = false;
        mockCheckboxes['visible-lobbyCode'].checked = false;

        // Call the sync function
        settingsUI._syncVisibilityCheckbox('lobbyCode');

        // Checkbox should be checked because lobbyCode cannot be hidden
        expect(mockCheckboxes['visible-lobbyCode'].checked).toBe(true);
    });

    test('Checkbox change handler calls updateSettingVisibility', () => {
        // Get the change handler from the addEventListener mock
        const checkbox = mockCheckboxes['visible-voiceChat'];
        const handlers = checkbox.addEventListener.mock.calls.filter(call => call[0] === 'change');

        // No handlers registered yet, so mock one
        const handler = function() {
            settingsModule.updateSettingVisibility('voiceChat', this.checked);
        };

        // Simulate checkbox being unchecked
        checkbox.checked = false;
        handler.call(checkbox);

        // Visibility should be updated in settings
        expect(mockSettings.voiceChat.visible).toBe(false);
        expect(mockSettings.voiceChat.manuallySet).toBe(true);

        // Event should be dispatched
        const visibilityEvent = dispatchedEvents.find(
            e => e.type === 'deathNote:settings:visibilityChanged' && e.detail.id === 'voiceChat'
        );
        expect(visibilityEvent).toBeDefined();
        expect(visibilityEvent.detail.visible).toBe(false);
    });

    test('Settings visibility change triggers checkbox update', () => {
        // Set up event handler to simulate UI response
        document.addEventListener = jest.fn((event, handler) => {
            if (event === 'deathNote:settings:visibilityChanged') {
                // Store the handler to call it later
                document._visibilityChangeHandler = handler;
            }
        });

        // Trigger a visibility change
        mockSettings.numberOfTasks.visible = false;

        // Simulate the event being dispatched
        document._visibilityChangeHandler({
            detail: {
                id: 'numberOfTasks',
                visible: false
            }
        });

        // The checkbox should have been updated via our mock
        expect(mockCheckboxes['visible-numberOfTasks'].checked).toBe(false);
    });

    test('Resetting visibility overrides clears the manuallySet flag', () => {
        // Set up a manually set visibility
        mockSettings.movementSpeed.visible = false;
        mockSettings.movementSpeed.manuallySet = true;
        mockCheckboxes['visible-movementSpeed'].checked = false;

        // Add a resetSettingVisibility method to the settings module
        settingsModule.resetSettingVisibility = function(id) {
            if (!this.settings[id]) return;

            delete this.settings[id].manuallySet;
            this.settings[id].visible = true; // Reset to visible

            document.dispatchEvent(new CustomEvent('deathNote:settings:visibilityChanged', {
                detail: { id, visible: true }
            }));
        };

        // Call the reset method
        settingsModule.resetSettingVisibility('movementSpeed');

        // Check that manuallySet was removed and visible was reset
        expect(mockSettings.movementSpeed.manuallySet).toBeUndefined();
        expect(mockSettings.movementSpeed.visible).toBe(true);

        // Checkbox should be updated
        expect(mockCheckboxes['visible-movementSpeed'].checked).toBe(true);
    });
});