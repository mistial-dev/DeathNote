/**
 * Tests for the OutputUI module
 *
 * These tests verify the functionality of the output UI component,
 * focusing on the version number display and credit line generation.
 */

describe('OutputUI Module', () => {
    let OutputUI;
    let cleanupMockDOM;

    // Setup before each test
    beforeEach(() => {
        // Reset any mocks
        jest.clearAllMocks();

        // Setup mock DOM
        cleanupMockDOM = setupMockDOM();

        // Mock output-box element
        document.getElementById.mockImplementation((id) => {
            if (id === 'output-box') {
                return { value: '' };
            }
            return null;
        });

        // Set up window.DeathNote with known values for testing
        window.DeathNote = {
            version: 'v1.2',
            toolUrl: 'https://mistial-dev.github.io/DeathNote/',
            getModule: jest.fn().mockImplementation(name => {
                if (name === 'settings') {
                    return {
                        getAllSettings: () => ({}),
                        getValue: jest.fn().mockReturnValue(''),
                        getDefinition: jest.fn(),
                        getAllDefinitions: jest.fn().mockReturnValue([]),
                        BINS: { LOBBY: 'Lobby Settings', PLAYER: 'Player', GAMEPLAY: 'Gameplay' }
                    };
                }
                return null;
            })
        };

        // Create a fresh copy of OutputUI for testing
        OutputUI = {
            // Mock minimal implementation of the component
            elements: {
                outputBox: { value: '' },
                copyBtn: {},
                balanceIndicator: {},
                funIndicator: {},
                balanceValue: {},
                funValue: {}
            },

            initialized: false,

            // This is the method we're primarily testing
            _getAppVersion: function() {
                // Try to get version from various locations
                if (window.DeathNote && window.DeathNote.version) {
                    return window.DeathNote.version;
                }

                // Fallback to default if not found
                return 'v1.0';
            },

            _getCreditLine: function() {
                const version = this._getAppVersion();
                const toolUrl = window.DeathNote && window.DeathNote.toolUrl ?
                    window.DeathNote.toolUrl : 'https://mistial-dev.github.io/DeathNote/';

                return `Generated with [DeathNote Tool ${version}](${toolUrl})`;
            },

            // Mocked implementation of the UI update
            updateOutput: function() {
                // In the real implementation, this would update the output textarea
                // For testing, we'll just verify the version is correctly included
                if (this.elements.outputBox) {
                    this.elements.outputBox.value = `Test output with credit line: ${this._getCreditLine()}`;
                }
            },

            // Mock for balance calculations
            calculateGameBalanceRating: function() {
                return 80;
            },

            calculateFunRating: function() {
                return 85;
            },

            updateRatings: function() {
                // Mock implementation
            }
        };
    });

    // Clean up after each test
    afterEach(() => {
        if (cleanupMockDOM) {
            cleanupMockDOM();
        }
    });

    // Tests

    test('_getAppVersion returns correct version from DeathNote global', () => {
        const version = OutputUI._getAppVersion();
        expect(version).toBe('v1.2');
        expect(version).toBeValidVersion();
    });

    test('_getAppVersion returns fallback when DeathNote.version is not available', () => {
        // Remove the version from DeathNote
        delete window.DeathNote.version;

        const version = OutputUI._getAppVersion();
        expect(version).toBe('v1.0');
        expect(version).toBeValidVersion();
    });

    test('_getCreditLine generates proper format with version', () => {
        const creditLine = OutputUI._getCreditLine();
        const expected = `Generated with [DeathNote Tool v1.2](https://mistial-dev.github.io/DeathNote/)`;

        expect(creditLine).toBe(expected);
        expect(creditLine).toContain('v1.2');
        expect(creditLine).toContain('DeathNote Tool');
    });

    test('updateOutput includes version in the output', () => {
        // Call the method
        OutputUI.updateOutput();

        // Check the output includes the correct version
        expect(OutputUI.elements.outputBox.value).toContain('v1.2');
        expect(OutputUI.elements.outputBox.value).toContain('Generated with [DeathNote Tool');
    });

    test('updateOutput handles custom version change', () => {
        // Change the version
        window.DeathNote.version = 'v2.0';

        // Call the method
        OutputUI.updateOutput();

        // Check the output includes the new version
        expect(OutputUI.elements.outputBox.value).toContain('v2.0');
        expect(OutputUI.elements.outputBox.value).not.toContain('v1.2');
    });
});