import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import eslintPluginJest from 'eslint-plugin-jest';
import globals from 'globals';
import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin';
import typescriptEslintParser from '@typescript-eslint/parser';

export default defineConfig([
  // Основной конфиг для всех файлов
  {
    ...js.configs.recommended,
    plugins: {
      jest: eslintPluginJest,
      '@typescript-eslint': typescriptEslintPlugin
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021
      },
      parser: typescriptEslintParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    files: ['**/*.ts', '**/*.tsx'],
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
    files: ['**/*.test.ts'],
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
