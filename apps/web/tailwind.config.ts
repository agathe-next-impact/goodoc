import type { Config } from 'tailwindcss'
import { baseTailwindConfig } from '@medsite/config/tailwind'

const config: Config = {
  ...baseTailwindConfig,
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
}

export default config
