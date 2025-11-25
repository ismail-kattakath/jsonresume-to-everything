module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation only changes
        'style', // Code style changes (formatting, missing semicolons, etc)
        'refactor', // Code change that neither fixes a bug nor adds a feature
        'perf', // Performance improvements
        'test', // Adding or updating tests
        'build', // Changes to build system or dependencies
        'ci', // Changes to CI configuration
        'chore', // Other changes that don't modify src or test files
        'revert', // Reverts a previous commit
      ],
    ],
    'subject-case': [2, 'never', ['upper-case']], // Prevent ALL CAPS
    'subject-empty': [2, 'never'], // Subject cannot be empty
    'subject-full-stop': [2, 'never', '.'], // No period at end
    'header-max-length': [2, 'always', 100], // Max header length
  },
}
