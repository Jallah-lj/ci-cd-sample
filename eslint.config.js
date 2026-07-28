const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  {
    ignores: [
      "node_modules/**",
      "coverage/**",
      "build/**"
    ]
  },

  js.configs.recommended,

  {
    files: ["**/*.js"],
    languageOptions: {
      globals: {
        ...globals.node
      }
    },
    rules: {
      "no-unused-vars": ["error", { "caughtErrors": "none", "argsIgnorePattern": "^_" }]
    }
  },

  {
    files: ["test/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.jest
      }
    }
  }
];
