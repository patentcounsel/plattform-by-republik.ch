import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  // Whether to use css reset
  preflight: true,

  // Where to look for your css declarations
  include: ['./src/**/*.{js,jsx,ts,tsx}'],

  // Files to exclude
  exclude: [],

  conditions: {
    light: '[data-theme="light"] &',
    dark: '[data-theme="dark"] &',
  },

  // Useful for theme customization
  theme: {
    breakpoints: {
      sm: '375px',
      md: '768px',
      lg: '1025px',
    },
    extend: {
      tokens: {
        colors: {
          challengeAccepted: {
            yellow: { value: '#EBEA2B' },
            blue: { value: '#4033D3' },
            darkBlue: { value: '#1B1469' },
          },
        },
      },
      semanticTokens: {
        colors: {
          text: {
            value: {
              base: '{colors.neutral.950}',
              _dark: { colors: '{colors.neutral.50}' },
            },
          },
          challengeAccepted: {
            background: {
              value: {
                base: '{colors.challengeAccepted.yellow}',
                _dark: '{colors.challengeAccepted.darkBlue}',
              },
            },
            link: {
              value: {
                base: '{colors.challengeAccepted.blue}',
                _dark: '{colors.challengeAccepted.yellow}',
              },
            },
          },
        },
        sizes: {
          header: {
            height: { value: { base: '48px', md: '60px' } },
            avatar: { value: { base: '26px', md: '36px' } },
          },
        },
        spacing: {
          header: {
            height: { value: '{sizes.header.height}' },
          },
        },
      },
      textStyles: {
        body: {
          description: 'Body text',
          value: {
            fontFamily:
              'GT-America-Standard-Regular, Helvetica-Neue-Regular, Arial-Regular, Roboto-Regular, sans-serif',
          },
        },
        headingLarge: {
          description: 'Large heading',
          value: {
            fontFamily: 'RepublikSerif-Black, Rubis-Bold, Georgia, serif',
            fontWeight: 900,
            fontStyle: 'normal',
            fontSize: '4em',
          },
        },
      },
    },
  },

  // The output directory for your css system
  outdir: 'src/styled-system',
})
