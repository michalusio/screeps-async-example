module.exports = {
  clearMocks: true,
  collectCoverageFrom: [
    "src/**/*.ts"
  ],
  coverageDirectory: "coverage",
  coveragePathIgnorePatterns: [
    "\.d\.ts$"
  ],
  moduleFileExtensions: [
    "ts",
    "js"
  ],
  preset: 'ts-jest',
  testEnvironment: "./tests/utils/test-environment.ts",
  testMatch: ['**/*.spec.ts', '!**/node_modules/**'],
};
