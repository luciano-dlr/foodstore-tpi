import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      'react-hooks/incompatible-library': 'off',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/*/*'],
              message: 'Importá desde el barrel de la feature (@/features/<feature>), no desde sus carpetas internas.',
            },
            {
              group: ['../../*', '../../../*'],
              message: 'Usá el alias @/ para los imports entre carpetas.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/store/**/*.ts'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
])
