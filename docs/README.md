# Documentation

This directory contains feature-specific documentation for the portfolio project.

## 📚 Main Documentation

**For project overview and quick start, see the root-level documentation:**

| Document                                     | Purpose                       | Audience                |
| -------------------------------------------- | ----------------------------- | ----------------------- |
| **[../QUICKSTART.md](../QUICKSTART.md)**     | Get started in 10 minutes     | 👤 End Users            |
| **[../ARCHITECTURE.md](../ARCHITECTURE.md)** | Complete technical reference  | 👨‍💻 Developers           |
| **[../CLAUDE.md](../CLAUDE.md)**             | Claude Code development guide | 🤖 Claude Code Sessions |
| **[../CONTRIBUTING.md](../CONTRIBUTING.md)** | How to contribute             | 🤝 Contributors         |
| **[../CHANGELOG.md](../CHANGELOG.md)**       | Version history               | 📋 Everyone             |
| **[../README.md](../README.md)**             | Project overview              | 📖 Everyone             |

---

## Feature-Specific Documentation

This directory contains detailed guides for specific features:

### For New Users

📄 **[DEFAULT_DATA_SETUP.md](./DEFAULT_DATA_SETUP.md)**

- **START HERE** - Customize your portfolio data
- Update personal information, work experience, skills
- Single source of truth explanation
- Step-by-step customization guide
- Common customizations and best practices

## Features Documentation

### AI Content Generator

📄 **[AI_CONTENT_GENERATOR.md](./AI_CONTENT_GENERATOR.md)**

- **NEW FEATURE** - AI-powered content generation for multiple use cases
- **Requires**: OpenAI API key or compatible API endpoint
- **Supports**: Cover letter generation, professional summary generation
- Client-side integration with OpenAI-compatible APIs
- Support for OpenAI, Azure OpenAI, or local LLM servers (LM Studio, etc.)
- Real-time streaming with Server-Sent Events
- Setup guide for OpenAI API and local AI servers
- Prompt engineering details for each content type
- API configuration and troubleshooting
- Credential storage and security

### Password Protection Feature

Documentation for the password protection system implemented for edit pages:

#### Setup & Usage

📄 **[PASSWORD_PROTECTION_SETUP.md](./PASSWORD_PROTECTION_SETUP.md)**

- Complete setup guide for local and production environments
- How to generate password hashes
- GitHub Secrets configuration
- Usage instructions
- Troubleshooting guide
- Security considerations

#### Testing

For comprehensive testing information:

- **Run tests**: `npm test` to see current test results
- **Test coverage**: `npm test:coverage` for detailed coverage reports
- **Test guidelines**: See [CONTRIBUTING.md](../CONTRIBUTING.md#testing-guidelines)
- **Current stats**: 1000+ tests with 99.6% pass rate (documented in [README.md](../README.md#-testing))

## Quick Links

### First Time Setup

1. **[Customize Your Data](./DEFAULT_DATA_SETUP.md)** - Update personal info, experience, skills
2. **[Setup Password Protection](./PASSWORD_PROTECTION_SETUP.md)** - Secure your edit pages
3. **[Configure AI Content Generator](./AI_CONTENT_GENERATOR.md)** - Optional: Setup AI for cover letters and summaries
4. **Build & Deploy** - See main [README.md](../README.md)

### For Developers

- **Setup Password Protection**: [PASSWORD_PROTECTION_SETUP.md](./PASSWORD_PROTECTION_SETUP.md)
- **Run Tests**: `npm test` (all tests) or `npm test -- --testPathPatterns="password"` (password tests only)
- **Test Coverage**: `npm test:coverage` for detailed coverage reports
- **Update Resume Data**: See [DEFAULT_DATA_SETUP.md](./DEFAULT_DATA_SETUP.md)
- **Contributing**: See [CONTRIBUTING.md](../CONTRIBUTING.md) for test guidelines

### For Users

- **Access Protected Pages**: Navigate to `/resume/builder`
- **Default Password**: Configured during setup (see SETUP guide)
- **Session Duration**: 24 hours
- **AI Content Generation**: Click "Generate with AI" button in the unified builder (requires OpenAI API key or compatible endpoint)

## Project Structure

```
ai-jsonresume/
├── docs/                              # Documentation
│   ├── README.md                      # This file
│   ├── PASSWORD_PROTECTION_SETUP.md   # Setup guide
│   └── PASSWORD_PROTECTION_TESTS.md   # Test documentation
├── src/
│   ├── components/
│   │   └── auth/
│   │       ├── password-protection.tsx          # Main component
│   │       └── __tests__/                       # Unit tests
│   ├── app/
│   │   ├── resume/
│   │   │   ├── page.tsx                         # Resume view
│   │   │   └── builder/
│   │   │       ├── page.tsx                     # Unified editor (protected)
│   │   │       └── __tests__/                   # Integration tests
│   │   └── __tests__/
│   │       └── layout.test.tsx                  # Layout tests
│   └── __tests__/
│       └── password-protection-e2e.test.tsx     # E2E tests
└── scripts/
    └── generate-password-hash.mjs                # Hash generator
```

## Additional Resources

- **Main README**: See project root for general setup
- **CLAUDE.md**: Project architecture and development guidelines
- **GitHub Issues**: Report bugs or request features

## Contributing

When adding new features that require documentation:

1. Create a new `.md` file in this directory
2. Update this README with a link to your documentation
3. Follow the same structure as existing docs:
   - Clear headings and sections
   - Code examples
   - Troubleshooting section
   - Usage instructions

## Support

For questions or issues:

- Check the relevant documentation first
- Look at the troubleshooting sections
- Check GitHub Issues for similar problems
- Create a new issue with detailed information
