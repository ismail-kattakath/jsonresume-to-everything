const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // Map resume.json to a fixture file for CI environments where the real file is gitignored
    '^@/data/resume\\.json$': '<rootDir>/src/data/resume.fixture.json',
    '^@/(.*)$': '<rootDir>/src/$1',
    // Mock @ismail-kattakath/mediapipe-react (uses import.meta.url / Web Workers, not compatible with Jest)
    '^@ismail-kattakath/mediapipe-react/genai$': '<rootDir>/src/__mocks__/@ismail-kattakath/mediapipe-react/genai.ts',
    '^@ismail-kattakath/mediapipe-react$': '<rootDir>/src/__mocks__/@ismail-kattakath/mediapipe-react/index.ts',
  },
  transformIgnorePatterns: ['node_modules/(?!(onborda|react-tooltip|@strands-agents|@google/genai|@ismail-kattakath))'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
  ],
  coverageThreshold: {
    // Matches 'project' status target (80%) in codecov.yml
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // Note: 'patch' status (80%) from codecov.yml is handled by Codecov on PRs.
    // Jest does not natively support a 'patch' threshold in its global configuration.
  },
  testMatch: ['**/__tests__/**/*.(test|spec).[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
