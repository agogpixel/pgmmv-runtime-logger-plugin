/* eslint-disable @typescript-eslint/no-var-requires */
const { version } = require('./package.json');

module.exports = {
  preset: 'ts-jest',
  globals: {
    PLUGIN_VERSION: `${version}-test`,
    ROOT_MODULE_NAME: 'Agog'
  },
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/test/setup.ts'],
  setupFilesAfterEnv: ['<rootDir>/test/setup-after-env.ts'],
  moduleNameMapper: {
    '\\.(md)$': '<rootDir>/test/mocks/file-mock.js'
  },
  verbose: true,
  collectCoverageFrom: ['src/**/*.ts', '!src/pgmmv-entry.ts', '!src/**/index.ts'],
  coverageReporters: ['text', 'text-summary', 'html']
};
