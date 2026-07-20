const browserGlobals = {
  AbortController: 'readonly',
  document: 'readonly',
  fetch: 'readonly',
  import: 'readonly',
  React: 'readonly',
};

export default [
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: browserGlobals,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        sourceType: 'module',
      },
    },
    rules: {
      // Core ESLint does not count JSX component references as variable usage.
      // Component names are PascalCase, so keep them from being false positives
      // until a JSX-aware rule set is introduced.
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^[A-Z]' }],
      'no-undef': 'error',
    },
  },
];
