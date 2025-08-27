// backend/jest.config.js
module.exports = {
    testEnvironment: 'node',
    // Automatically clear mock calls and instances between every test
    clearMocks: true,
    // The directory where Jest should output its coverage files
    coverageDirectory: 'coverage',
    // An array of glob patterns indicating a set of files for which coverage information should be collected
    collectCoverageFrom: ['**/*.js', '!**/node_modules/**', '!**/vendor/**'],
    // Indicates whether the coverage information should be collected while executing the test
    collectCoverage: true,
    // A list of reporter names that Jest uses when writing coverage reports
    coverageReporters: ['json', 'text', 'lcov', 'clover', 'html'],
    // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
    testPathIgnorePatterns: ['/node_modules/'],
    // Setup files to run before each test file
    // setupFilesAfterEnv: ['./tests/setup.js'], // If you need a setup file
    // verbose: true, // Output individual test results with the test suite hierarchy
};
