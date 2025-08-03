module.exports = {
  extends: [
    'next/core-web-vitals',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    // Optionally, also disable lint errors on build
    'no-warning-comments': 'off',
  },
  ignorePatterns: ['**/*.js', '**/*.cjs'],
};
