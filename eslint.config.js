module.exports = {
  env: {
    browser: true, // Define the environment
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended', // Use ESLint's recommended rules
    'plugin:prettier/recommended', // Integrate Prettier with ESLint
  ],
  parserOptions: {
    ecmaVersion: 12, // Use ECMAScript 2021
    sourceType: 'module', // Supports ES modules
  },
  plugins: ['prettier'], // Include Prettier plugin
  rules: {
    'prettier/prettier': ['error'], // Enforce Prettier formatting as an ESLint error
  },
};
