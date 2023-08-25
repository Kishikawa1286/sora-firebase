var tsConfigs = ["./tsconfig.json"];

var ruleOverrides = {};

module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
    "plugin:import/typescript",
    "plugin:react-hooks/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: tsConfigs,
    ecmaVersion: 2020,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
    allowImportExportEverywhere: true,
  },
  plugins: ["@typescript-eslint", "prettier", "promise"],
  rules: {
    "quotes": ["error", "double"],
    "import/no-unresolved": 0,
    "object-curly-spacing": 0, // Disable conflicting rule
    "camelcase": 0,
    "quote-props": 0,
    "max-len": ["error", {
      code: 80,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
      ignoreComments: true
    }],
    "comma-dangle": ["error", "never"]
  }
};
