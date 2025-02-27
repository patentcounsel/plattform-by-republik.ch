module.exports = {
  plugins: ['react', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:prettier/recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  env: {
    browser: true,
    es6: true,
    node: true,
    jest: true,
  },
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'off',
    'react/jsx-no-target-blank': 'off',
    'react/display-name': 'off',
    'react/prop-types': 'off',
    'no-unused-vars': 'warn',
    'no-empty': 'warn',
    // Rules to no longer require React to be imported (React >=17)
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
}
