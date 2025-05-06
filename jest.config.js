export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  testMatch: ['**/tests/backend/**/*.spec.ts', '**/tests/backend/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: true,
    }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};