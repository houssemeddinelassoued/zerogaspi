const { createApp } = require('../backend/server');

const { app } = createApp({
  dbPath: ':memory:',
  seedDemoData: true,
});

module.exports = app;
