/**
 * Jest Testing Configuration
 *
 * Purpose: Configures the Jest testing framework, specifying the test environment (Node.js),
 * file patterns to match, and TypeScript transformation settings.
 *
 * Why: Ensures tests run correctly and efficiently, supporting TypeScript via ts-jest.
 */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/*.test.ts"],
  moduleFileExtensions: ["ts", "js", "json", "node"],
};
