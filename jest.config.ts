/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from 'jest';

const config: Config = {
  preset: 'jest-preset-angular',

  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: 'v8',

  // The test environment that will be used for testing
  testEnvironment: 'jsdom',

  // A map from regular expressions to module names or to arrays of module names that allow to stub out resources with a single module
  moduleNameMapper: {
    '^@auth/(.*)$': '<rootDir>/src/app/auth/$1',
    '^@config/(.*)$': '<rootDir>/src/app/config/$1',
    '^@api/(.*)$': '<rootDir>/src/app/api/$1',
    '^@sections/(.*)$': '<rootDir>/src/app/sections/$1',
    '^@shared/(.*)$': '<rootDir>/src/app/shared/$1',
    '^@ui/(.*)$': '<rootDir>/src/app/ui/$1',
    '^src/environments/(.*)$': '<rootDir>/src/environments/$1',
    '^src/app/(.*)$': '<rootDir>/src/app/$1'
  },

  // The paths to modules that run some code to configure or set up the testing environment before each test
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],

  // An array of regexp pattern strings that are matched against all source file paths, matched files will skip transformation
  transformIgnorePatterns: [
    'node_modules/(?!.*\\.mjs$|@angular|rxjs|api-sitna|url-template)'
  ],

  // The glob patterns Jest uses to detect test files
  testMatch: ['**/*.spec.ts'],

  // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
  testPathIgnorePatterns: ['/node_modules/']
};

export default config;
