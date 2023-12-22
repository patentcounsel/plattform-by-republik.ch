import { defineConfig } from '@pandacss/dev'
import { presetRepublik, presetChallengeAccepted } from '@republik/ui'

export default defineConfig({
  // Whether to use css reset
  preflight: true,

  presets: [presetRepublik, presetChallengeAccepted],

  // conditions:
  // Where to look for your css declarations
  include: [
    './src/**/*.{js,jsx,ts,tsx}',
    '../../packages/ui/**/*.{mjs,js,jsx,ts,tsx}',
  ],

  // Files to exclude
  exclude: [],

  // The output directory for your css system
  // emitPackage: true,
  outdir: 'src/styled-system',
  // strictTokens: true,
})
