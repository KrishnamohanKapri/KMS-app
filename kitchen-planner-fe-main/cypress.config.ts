import { defineConfig } from 'cypress';
import * as fs from 'node:fs';

export default defineConfig({
  experimentalStudio: true,
  defaultCommandTimeout: 10000,
  includeShadowDom: true, // requires being chained off a command that yields a DOM element
  video: true,
  videoCompression: 30, //The quality setting for the video compression,
  screenshotOnRunFailure: true,
  chromeWebSecurity: true, //Whether to enable Chromium-based browser's Web Security for same-origin policy and insecure mixed content.
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    charts: true,
    reportPageTitle: 'Cypress Test Summary',
    embeddedScreenshots: true,
    inlineAssets: true,
    saveAllAttempts: false,
  },
  retries: 2, // retry failing test cases 3 times (1 default + 2 extras)
  e2e: {
    experimentalStudio: true, //Cypress automated test generator
    setupNodeEvents(on) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('cypress-mochawesome-reporter/plugin')(on);
      on('after:spec', (spec: Cypress.Spec, results: CypressCommandLine.RunResult) => {
        if (results && results.video) {
          const failures = results.tests.some((test) => test.attempts.some((attempt) => attempt.state === 'failed'));
          if (!failures) {
            fs.unlinkSync(results.video);
          }
        }
      });
    },
    baseUrl: 'http://localhost:4200',
     specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
  },
  env: {
    e2e_mail: process.env['E2E_MAIL'],
    e2e_password: process.env['E2E_PASSWORD'],
  },

  component: {
    devServer: {
      framework: 'angular',
      bundler: 'webpack',
    },
    specPattern: '*/.cy.ts',
  },
});