const { defineConfig } = require('cypress')
const {
  assertSafeTestDatabase,
  createScenario,
  inspectTestData,
  resetTestData,
} = require('./scripts/testing/db.cjs')

module.exports = defineConfig({
  video: false,
  screenshotOnRunFailure: true,
  retries: { runMode: 1, openMode: 0 },
  defaultCommandTimeout: 10000,
  requestTimeout: 10000,
  responseTimeout: 20000,
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://127.0.0.1:3000',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    testIsolation: true,
    setupNodeEvents(on, config) {
      on('task', {
        'db:assertSafe': () => assertSafeTestDatabase(),
        'db:reset': () => resetTestData(),
        'db:scenario': (input) => createScenario(input),
        'db:inspect': (input) => inspectTestData(input),
      })
      return config
    },
  },
})
