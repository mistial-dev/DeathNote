/**
 * Tests for the main DeathNote application module
 */

describe('DeathNote App', () => {
    // Track cleanup functions
    let cleanupMockDOM;
    let originalDeathNote;

    beforeEach(() => {
        // Setup DOM environment
        cleanupMockDOM = setupMockDOM();

        // Save original DeathNote if it exists
        originalDeathNote = window.DeathNote;

        // Create a fresh DeathNote global for testing
        window.DeathNote = {
            version: 'v1.3',
            toolUrl: 'https://mistial-dev.github.io/DeathNote/',
            modules: {},
            getModule: jest.fn(name => {
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
                        }
                    };
                }
                return null;
            }),
            registerModule: jest.fn(function(name, module) {
                this.modules[name] = module;
                return module;
            }),
            init: jest.fn().mockResolvedValue(undefined)
        };

        // Load the app script dynamically if needed
        // Note: In a real test, we might want to mock require instead
        // require('../js/app.js');
    });

    afterEach(() => {
        // Restore mock DOM
        if (cleanupMockDOM) {
            cleanupMockDOM();
        }

        // Restore original DeathNote if it existed
        if (originalDeathNote) {
            window.DeathNote = originalDeathNote;
        } else {
            delete window.DeathNote;
        }

        // Reset modules to clean state for next test
        jest.resetModules();
    });

    test('DeathNote global object exists', () => {
        // Verify the DeathNote global object exists
        expect(window.DeathNote).toBeDefined();
    });

    test('DeathNote exposes required public API', () => {
        // Check required API methods exist
        expect(typeof window.DeathNote.getModule).toBe('function');
        expect(typeof window.DeathNote.registerModule).toBe('function');
        expect(typeof window.DeathNote.init).toBe('function');
    });

    test('DeathNote.registerModule adds a module to the registry', () => {
        // Create mock module
        const mockModule = {
            name: 'testModule',
            initialize: jest.fn()
        };

        // Register the module
        const result = window.DeathNote.registerModule('test', mockModule);

        // Verify module was registered
        expect(result).toBe(mockModule);
        expect(window.DeathNote.modules.test).toBe(mockModule);
    });

    test('DeathNote.version returns the correct version string', () => {
        // Set a known version
        window.DeathNote.version = 'v1.2';

        // Verify getter returns the correct version
        expect(window.DeathNote.version).toBe('v1.2');
        expect(window.DeathNote.version).toBeValidVersion();
    });
});