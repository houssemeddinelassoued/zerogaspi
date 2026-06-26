const { createApp } = require('../zerogaspi/backend/server');

// Keep an in-memory SQLite DB per serverless instance.
const { app } = createApp({
  dbPath: ':memory:',
  seedDemoData: true,
});

module.exports = app;
