// @ts-check
import js from '@eslint/js'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import globals from 'globals'

/**
 * Shared flat ESLint 9 config for the MedSite monorepo.
 * Apps / packages import and re-export this, optionally layering
 * their own rules on top.
 *
 * @type {import('eslint').Linter.Config[]}
 */
export const baseConfig = [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/.turbo/**',
      '**/coverage/**',
      '**/*.config.js',
      '**/*.config.mjs',
      '**/*.config.cjs',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      // TypeScript
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],

      // Base
      'no-unused-vars': 'off',
      'prefer-const': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-default-export': 'off', // handled per-file override below

      // React
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
    settings: {
      react: { version: 'detect' },
    },
  },
  // Forbid default exports except on Next.js routing files and payload config.
  {
    files: ['**/*.ts', '**/*.tsx'],
    ignores: [
      '**/app/**/page.tsx',
      '**/app/**/layout.tsx',
      '**/app/**/loading.tsx',
      '**/app/**/error.tsx',
      '**/app/**/not-found.tsx',
      '**/app/**/template.tsx',
      '**/app/**/default.tsx',
      '**/app/**/route.ts',
      '**/app/sitemap.ts',
      '**/app/robots.ts',
      '**/app/manifest.ts',
      '**/app/icon.tsx',
      '**/app/apple-icon.tsx',
      '**/app/opengraph-image.tsx',
      '**/app/twitter-image.tsx',
      '**/middleware.ts',
      '**/next.config.ts',
      '**/next.config.mjs',
      '**/payload.config.ts',
      '**/*.config.ts',
    ],
    rules: {
      'import/no-default-export': 'off',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ExportDefaultDeclaration',
          message:
            'Default exports are not allowed. Use named exports (exceptions: Next.js routing files, payload.config.ts).',
        },
      ],
    },
  },
]

export default baseConfig
