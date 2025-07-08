// ESLint config for Infofluencer frontend (React)

import js from '@eslint/js';
import react from 'eslint-plugin-react';
import prettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';

export default [
  js.configs.recommended,
  ...react.configs.recommended,
  prettier,
  {
    plugins: {
      import: importPlugin,
    },
    rules: {
      'import/order': 'warn',
      'import/no-unused-modules': [1, { unusedExports: true }],
      'no-unused-vars': 'warn',
      'react/prop-types': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
]; 