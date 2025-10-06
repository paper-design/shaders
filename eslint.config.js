import globals from 'globals';
import tseslint from 'typescript-eslint';
import tsparser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactRefresh from 'eslint-plugin-react-refresh';
import reactHooks from 'eslint-plugin-react-hooks';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const eslintConfig = [
  {
    files: ['packages/shaders/src/**/*.{ts,tsx}', 'packages/shaders-react/src/**/*.{ts,tsx}', 'docs/src/**/*.{ts,tsx}'],
    languageOptions: {
      globals: globals.browser,
      parser: tsparser,
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'react': react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      'react/no-unknown-property': 'error', // fix properties like "fill-rule" => "fillRule"
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];

export default eslintConfig;
