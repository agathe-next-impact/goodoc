import { baseConfig } from '@medsite/config/eslint'

export default [
  ...baseConfig,
  {
    ignores: ['node_modules/**', 'dist/**'],
  },
]
