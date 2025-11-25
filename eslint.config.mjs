import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'
import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths'
import checkFile from 'eslint-plugin-check-file'
import jsdoc from 'eslint-plugin-jsdoc'
import security from 'eslint-plugin-security'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
    ],
  },
  {
    plugins: {
      'no-relative-import-paths': noRelativeImportPaths,
      'check-file': checkFile,
      jsdoc: jsdoc,
      security: security,
    },
    rules: {
      // Critical rules - enforce strictly
      '@typescript-eslint/no-require-imports': 'error',
      '@typescript-eslint/no-unused-expressions': 'error',
      'react/no-unescaped-entities': 'error',
      // Code quality rules - keep as warnings for gradual improvement
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
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
          'src/components/**/!(__tests__)/*.{ts,tsx}': 'PASCAL_CASE',
          'src/lib/**/!(__tests__)/*.ts': 'CAMEL_CASE',
          'src/types/**/*.ts': 'KEBAB_CASE',
          '**/__tests__/**/*.{test,spec}.{ts,tsx}': 'KEBAB_CASE',
        },
        {
          ignoreMiddleExtensions: true,
        },
      ],
      'check-file/folder-naming-convention': [
        'error',
        {
          'src/**/': 'KEBAB_CASE',
        },
      ],
      // JSDoc requirements for public APIs (warnings for gradual adoption)
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
      'security/detect-unsafe-regex': 'error',
      'security/detect-buffer-noassert': 'error',
      'security/detect-child-process': 'warn',
      'security/detect-disable-mustache-escape': 'error',
      'security/detect-eval-with-expression': 'error',
      'security/detect-no-csrf-before-method-override': 'error',
      'security/detect-non-literal-require': 'warn',
      'security/detect-possible-timing-attacks': 'warn',
      'security/detect-pseudoRandomBytes': 'error',
    },
  },
]

export default eslintConfig
