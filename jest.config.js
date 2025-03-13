/**
 * Jest configuration for Death Note test suite
 */
module.exports = {
    // Automatically clear mock calls and instances between every test
    clearMocks: true,

    // The test environment that will be used for testing
    testEnvironment: 'jsdom',

    // The glob patterns Jest uses to detect test files
    testMatch: [
        "**/__tests__/**/*.[jt]s?(x)",
        "**/?(*.)+(spec|test).[jt]s?(x)"
    ],

    // Setup files to run before each test
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

    // Indicates whether the coverage information should be collected while executing the test
    collectCoverage: true,

    // The directory where Jest should output its coverage files
    coverageDirectory: "coverage",

    // An array of regexp pattern strings used to skip coverage collection
    coveragePathIgnorePatterns: [
        "/node_modules/"
    ],

    // Indicates which provider should be used to instrument code for coverage
    coverageProvider: "v8",

    // A list of reporter names that Jest uses when writing coverage reports
    coverageReporters: [
        "json",
        "text",
        "lcov",
        "clover"
    ],

    // The root directory that Jest should scan for tests and modules within
    rootDir: '.',

    // A map from regular expressions to module names or to arrays of module names that allow to stub out resources
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1"
    },

    // A list of paths to directories that Jest should use to search for files in
    roots: [
        "<rootDir>"
    ],
};