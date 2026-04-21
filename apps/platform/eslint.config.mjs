import { baseConfig } from '@medsite/config/eslint'

export default [
  ...baseConfig,
  {
    ignores: ['.next/**', 'node_modules/**'],
  },
]
