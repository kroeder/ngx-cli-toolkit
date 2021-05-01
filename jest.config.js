/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/en/configuration.html
 */

module.exports = {
    preset: 'ts-jest',
    clearMocks: true,
    coverageDirectory: "coverage",
    collectCoverageFrom: [
        "src/**/*.ts"
    ],
    coverageProvider: "v8",
    testEnvironment: "node",
};
