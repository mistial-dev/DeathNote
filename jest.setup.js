/**
 * Jest setup file for Death Note test suite
 * This file runs before each test file and sets up global test configurations
 */

// Add custom matchers
expect.extend({
    /**
     * Custom matcher to check if a string is a valid version number
     * @param {string} received - The received value
     * @returns {object} Result object
     */
    toBeValidVersion(received) {
        const pass = typeof received === 'string' && /^v\d+\.\d+(\.\d+)?$/.test(received);
        if (pass) {
            return {
                message: () => `expected ${received} not to be a valid version number`,
                pass: true,
            };
        } else {
            return {
                message: () => `expected ${received} to be a valid version number (e.g. v1.0 or v1.2.3)`,
                pass: false,
            };
        }
    },
});

// Global mock dispatch event function
global.mockDispatchEvent = jest.fn();

// Set up global mocks that should be available for all tests
global.setupMockDOM = () => {
    // Only mock if document exists (in JSDOM environment)
    if (typeof document !== 'undefined') {
        // Save original methods before mocking
        const originalAddEventListener = document.addEventListener;
        const originalRemoveEventListener = document.removeEventListener;
        const originalDispatchEvent = document.dispatchEvent;
        const originalGetElementById = document.getElementById;
        const originalQuerySelector = document.querySelector;
        const originalQuerySelectorAll = document.querySelectorAll;

        // Create mock functions
        document.addEventListener = jest.fn();
        document.removeEventListener = jest.fn();
        document.dispatchEvent = jest.fn();
        document.getElementById = jest.fn(() => ({
            classList: {
                add: jest.fn(),
                remove: jest.fn(),
                contains: jest.fn()
            },
            addEventListener: jest.fn(),
            appendChild: jest.fn()
        }));
        document.querySelector = jest.fn();
        document.querySelectorAll = jest.fn(() => []);

        // Return a cleanup function to restore original methods
        return () => {
            document.addEventListener = originalAddEventListener;
            document.removeEventListener = originalRemoveEventListener;
            document.dispatchEvent = originalDispatchEvent;
            document.getElementById = originalGetElementById;
            document.querySelector = originalQuerySelector;
            document.querySelectorAll = originalQuerySelectorAll;
        };
    }

    return () => {}; // Empty cleanup if document not defined
};

// Reset mocks before each test
beforeEach(() => {
    // Only try to clear mocks if they exist and have mockClear method
    if (typeof jest !== 'undefined') {
        jest.clearAllMocks();
    }
});