module.exports = {
    testEnvironment: 'node',
    testPathIgnorePatterns: [
        '/node_modules/',
        '/backend/__tests__/helpers/',
    ],
    collectCoverageFrom: [
        'backend/**/*.js',
        '!backend/server.js',
    ],
    coverageDirectory: 'coverage',
};