import { dirname } from 'path'
import { fileURLToPath } from 'url'
import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths'
import checkFile from 'eslint-plugin-check-file'
import jsdoc from 'eslint-plugin-jsdoc'
import security from 'eslint-plugin-security'
import tseslint from 'typescript-eslint'
import reactPlugin from 'eslint-plugin-react'
import nextPlugin from '@next/eslint-plugin-next'
import jsxA11y from 'eslint-plugin-jsx-a11y'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const eslintConfig = tseslint.config(
  {
    ignores: ['node_modules/**', '.next/**', 'out/**', 'build/**', 'next-env.d.ts'],
  },
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx,js,jsx}'],
    plugins: {
      react: reactPlugin,
      '@next/next': nextPlugin,
      'no-relative-import-paths': noRelativeImportPaths,
      'check-file': checkFile,
      jsdoc: jsdoc,
      security: security,
      'jsx-a11y': jsxA11y,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      // Basic React and Next.js rules
      ...reactPlugin.configs.recommended.rules,
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,

      // React specific fixes for Next.js
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',

      // Critical rules - enforce strictly
      '@typescript-eslint/no-require-imports': 'error',
      '@typescript-eslint/no-unused-expressions': 'error',
      'react/no-unescaped-entities': 'error',

      // Code quality rules - keep as warnings for gradual improvement
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // Import path rules - enforce absolute imports with @/ alias
      'no-relative-import-paths/no-relative-import-paths': [
        'error',
        {
          allowSameFolder: true,
          rootDir: 'src',
          prefix: '@',
        },
      ],

      // File naming conventions
      'check-file/filename-naming-convention': [
        'error',
        {
          'src/**/*.{ts,tsx,js,jsx}': 'KEBAB_CASE',
        },
        {
          ignoreMiddleExtensions: true,
        },
      ],
      'check-file/folder-naming-convention': [
        'error',
        {
          'src/**/!(__tests__)': 'KEBAB_CASE',
        },
      ],

      // JSDoc requirements for public APIs
      'jsdoc/require-jsdoc': [
        'warn',
        {
          require: {
            FunctionDeclaration: true,
            ClassDeclaration: true,
            MethodDefinition: true,
          },
          contexts: ['TSInterfaceDeclaration', 'TSTypeAliasDeclaration'],
          publicOnly: true,
        },
      ],
      'jsdoc/require-description': ['warn', { contexts: ['any'] }],
      'jsdoc/require-param-description': 'warn',
      'jsdoc/require-returns-description': 'warn',

      // Security rules
      'security/detect-object-injection': 'warn',
      'security/detect-non-literal-regexp': 'warn',
      'security/detect-non-literal-fs-filename': 'warn',
      'security/detect-unsafe-regex': 'warn',
      'security/detect-buffer-noassert': 'error',
      'security/detect-child-process': 'warn',
      'security/detect-disable-mustache-escape': 'error',
      'security/detect-eval-with-expression': 'error',
      'security/detect-no-csrf-before-method-override': 'error',
      'security/detect-non-literal-require': 'warn',
      'security/detect-possible-timing-attacks': 'warn',
      'security/detect-pseudoRandomBytes': 'error',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    files: ['**/__tests__/**/*.{ts,tsx,js,jsx}'],
    rules: {
      '@typescript-eslint/ban-ts-comment': 'warn',
      'security/detect-unsafe-regex': 'warn',
    },
  }
)

export default eslintConfig
