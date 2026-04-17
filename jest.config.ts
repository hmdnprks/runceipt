import type { Config } from "jest";

const config: Config = {
  testEnvironment: "jsdom",
  transform: { "^.+\\.tsx?$": "ts-jest" },
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/$1" },
  collectCoverageFrom: ["lib/**/*.ts", "components/**/*.tsx", "app/**/*.tsx", "!**/*.d.ts"],
  coverageDirectory: "coverage",
  testPathIgnorePatterns: ["/node_modules/", "/e2e/"],
};

export default config;
