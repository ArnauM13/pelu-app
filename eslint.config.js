import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
      },
      globals: {
        window: 'readonly',
        console: 'readonly',
        document: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
    },
    rules: {
      ...typescript.configs.recommended.rules,
      'no-unused-vars': 'off', // Turned off in favor of @typescript-eslint/no-unused-vars
      '@typescript-eslint/no-unused-vars': 'warn',
      'no-console': 'warn',
      'prefer-const': 'warn',
      'no-var': 'warn',
    },
  },
  {
    ignores: [
      'projects/**/*',
      'dist/**/*',
      'node_modules/**/*',
      '**/*.spec.ts',
      '**/*.html',
      '**/*.js',
      'tests/**/*'
    ],
  },
];
