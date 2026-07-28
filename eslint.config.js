const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  {
    ignores: [
      "node_modules/**",
      "coverage/**"
    ]
  },

  js.configs.recommended,

  {
    files: ["**/*.js"],
    languageOptions: {
      globals: {
        ...globals.node
      }
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
