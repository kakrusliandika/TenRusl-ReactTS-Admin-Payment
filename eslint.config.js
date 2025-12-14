// eslint.config.js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  // 1) Global ignore
  {
    ignores: ['dist', 'node_modules'],
  },

  // 2) Rules utama untuk semua file TS/TSX
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // Pakai rules bawaan react-hooks (hanya rules-nya, bukan config full)
      ...reactHooks.configs.recommended.rules,

      // Rekomendasi dari eslint-plugin-react-refresh untuk Vite
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },

  // 3) Override khusus file test (Vitest globals)
  {
    files: ['src/test/**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.vitest,
      },
    },
  },
)
