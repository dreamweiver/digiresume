import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    ignores: ['.next/', 'node_modules/', 'drizzle/'],
  }
)
