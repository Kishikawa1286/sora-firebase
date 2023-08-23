module.exports = {
  root: true,
  env: {
    es6: true,
    node: true
  },
  extends: [
    "prettier",
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "google",
    "plugin:@typescript-eslint/recommended"
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json", "tsconfig.dev.json"],
    sourceType: "module"
  },
  ignorePatterns: [
    "/lib/**/*" // Ignore built files.
  ],
  plugins: [
    "@typescript-eslint",
    "prettier",
    "import"
  ],
  rules: {
    "quotes": ["error", "double"],
    "import/no-unresolved": 0,
    "indent": ["error", 2],
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
