/**
 * DOM testing helpers for Death Note test suite
 * Provides utility functions to set up and clean up the DOM environment
 */

/**
 * Set up a minimal mock of the DOM environment
 * @returns {Object} Clean-up function that should be called after tests
 */
export function setupDOMEnvironment() {
    // Mock elements that are commonly accessed
    const mockElements = {
        'output-box': { value: '', className: '' },
        'lobby-settings-section': { innerHTML: '', className: '' },
        'player-settings-section': { innerHTML: '', className: '' },
        'gameplay-settings-section': { innerHTML: '', className: '' },
        'advanced-settings': { innerHTML: '', className: '', classList: { add: jest.fn(), remove: jest.fn(), contains: jest.fn() } },
        'toggle-advanced-settings': { innerHTML: '', className: '' },
        'reset-all-btn': { innerHTML: '', className: '' },
        'advanced-caret': { innerHTML: '', className: '', classList: { add: jest.fn(), remove: jest.fn() } },
        'recommendations-container': { innerHTML: '', className: '' },
        'copy-btn': { innerHTML: '', className: '', classList: { add: jest.fn(), remove: jest.fn() } },
        'copy-link-btn': { innerHTML: '', className: '', classList: { add: jest.fn(), remove: jest.fn() } },
        'balance-indicator': { innerHTML: '', className: '', classList: { add: jest.fn(), remove: jest.fn() } },
        'fun-indicator': { innerHTML: '', className: '', classList: { add: jest.fn(), remove: jest.fn() } },
        'balance-value': { textContent: '0' },
        'fun-value': { textContent: '0' }
    };

    // Store original implementation
    const originalGetElementById = document.getElementById;

    // Mock getElementById to return our fake elements
    document.getElementById = jest.fn((id) => {
        return mockElements[id] || null;
    });

    // Set up mock for document.querySelector
    document.querySelector = jest.fn((selector) => {
        // Basic implementation to handle common selector types
        if (selector.startsWith('#')) {
            const id = selector.substring(1);
            return mockElements[id] || null;
        }
        // Handle other selectors as needed
        return null;
    });

    // Set up querySelectorAll to return empty arrays with the correct length
    document.querySelectorAll = jest.fn((selector) => {
        // Return an empty array-like object when querying for radio buttons
        if (selector.includes('radio')) {
            return [];
        }
        return [];
    });

    // Return a cleanup function to restore original behavior
    return function cleanup() {
        document.getElementById = originalGetElementById;
    };
}

/**
 * Mock the window.DeathNote global object
 * @param {Object} overrides - Properties to override in the mock
 * @returns {Object} Original window.DeathNote if it existed
 */
export function mockDeathNote(overrides = {}) {
    // Store original
    const originalDeathNote = window.DeathNote;

    // Create new mock
    window.DeathNote = {
        version: 'v1.2',
        toolUrl: 'https://mistial-dev.github.io/DeathNote/',
        creditLine: 'Generated with [DeathNote Tool v1.2](https://mistial-dev.github.io/DeathNote/)',
        modules: {},
        ui: {},
        utils: {
            hashManager: {
                updateUrlHash: jest.fn(),
                loadFromHash: jest.fn().mockReturnValue(true)
            }
        },
        getModule: jest.fn((name) => {
            if (name === 'settings') {
                return {
                    getAllSettings: jest.fn().mockReturnValue({}),
                    getValue: jest.fn().mockReturnValue(''),
                    getDefinition: jest.fn(),
                    getAllDefinitions: jest.fn().mockReturnValue([]),
                    BINS: {
                        LOBBY: 'Lobby Settings',
                        PLAYER: 'Player',
                        GAMEPLAY: 'Gameplay'
                    },
                    updateSetting: jest.fn(),
                    resetSetting: jest.fn(),
                    resetAllSettings: jest.fn(),
                    updateRelevancyScores: jest.fn(),
                    applySettingVisibilityRules: jest.fn().mockReturnValue(true)
                };
            }
            return null;
        }),

        // Public API methods
        registerModule: jest.fn(),
        notifySettingsChanged: jest.fn(),
        init: jest.fn().mockResolvedValue(undefined),

        ...overrides
    };

    // Return the original to restore
    return originalDeathNote;
}

/**
 * Creates a mock CustomEvent constructor
 * @returns {Function} Original CustomEvent constructor
 */
export function mockCustomEvent() {
    const originalCustomEvent = window.CustomEvent;

    window.CustomEvent = jest.fn((event, options = {}) => {
        return {
            type: event,
            detail: options.detail || {},
            preventDefault: jest.fn(),
            stopPropagation: jest.fn()
        };
    });

    return originalCustomEvent;
}

/**
 * Helper to simulate DOM events
 * @param {string} eventName - Name of the event to dispatch
 * @param {Object} detail - Event detail
 * @param {HTMLElement} target - Target element to dispatch on (defaults to document)
 */
export function dispatchEvent(eventName, detail = {}, target = document) {
    const event = new CustomEvent(eventName, { detail, bubbles: true });
    target.dispatchEvent(event);
}