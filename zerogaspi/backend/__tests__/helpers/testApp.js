const { createApp } = require('../../server');

function createTestApp(options = {}) {
    const setup = createApp({
        dbPath: ':memory:',
        seedDemoData: false,
        ...options,
    });

    return setup;
}

module.exports = { createTestApp };