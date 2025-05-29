import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import eslintPluginJest from 'eslint-plugin-jest';
import globals from 'globals';

export default defineConfig([
  // Основной конфиг для всех файлов
  {
    ...js.configs.recommended,
    plugins: {
      jest: eslintPluginJest
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    rules: {
      'no-var': 'error',
      'prefer-const': 'error',
      'no-dupe-keys': 'error',
      'no-dupe-args': 'error',
      'no-dupe-class-members': 'error',
      'no-duplicate-case': 'error',
      'indent': ['error', 2],
      'quotes': ['error', 'single'],
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1 }],
      'max-len': ['error', { code: 120 }],
      'eol-last': ['error', 'always']
    }
  },

  // Переопределение для тестовых файлов
  {
    files: ['**/*.test.js'],
    rules: {
      'jest/prefer-expect-assertions': 'off'
    }
  },

  // Игнорирование файлов
  {
    files: ['dist/**/*', 'node_modules/**/*', 'coverage/**/*', 'docs/**/*'],
    rules: {
      'no-var': 'off',
      'prefer-const': 'off',
      'no-dupe-keys': 'off',
      'no-dupe-args': 'off',
      'no-dupe-class-members': 'off',
      'no-duplicate-case': 'off',
      'indent': 'off',
      'quotes': 'off',
      'no-multiple-empty-lines': 'off',
      'max-len': 'off',
      'eol-last': 'off'
    }
  }
]);
