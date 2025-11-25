# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive documentation system:
  - ARCHITECTURE.md - Deep technical reference
  - QUICKSTART.md - User setup guide
  - CLAUDE_CODE_GUIDE.md - Development guide for AI assistants
  - CONTRIBUTING.md - Contribution guidelines
  - CHANGELOG.md - Version history tracking

## [1.0.0] - 2025-01-25

### Added
- **Portfolio Features**
  - Homepage with Hero, About, Skills, Experience, and Contact sections
  - Responsive design with Tailwind CSS v4
  - Framer Motion animations
  - Dark theme with gradient backgrounds

- **Resume Builder** (`/resume/edit`)
  - Interactive form with live preview
  - Drag-and-drop section reordering (@hello-pangea/dnd)
  - JSON Resume v1.0.0 import/export
  - Auto-save to localStorage
  - Print-optimized output
  - Password protection (optional, bcrypt-based)

- **Cover Letter Editor** (`/cover-letter/edit`)
  - Personal information auto-populated from resume
  - Live preview
  - Print functionality
  - Password protection (optional)

- **AI Integration**
  - AI-powered cover letter generation
  - AI-assisted professional summary generation
  - OpenAI-compatible API support (OpenAI, OpenRouter, local Ollama, vLLM)
  - Streaming responses with real-time display
  - Credential storage in localStorage
  - Prompt engineering for tailored content

- **Authentication System**
  - Optional password protection for edit pages
  - Client-side bcrypt hashing (cost factor: 10)
  - Session management via sessionStorage (24-hour expiry)
  - Shared session across protected pages
  - Show/hide password toggle
  - Automatic session cleanup

- **Data Architecture**
  - Single source of truth: `src/data/resume.json` (JSON Resume v1.0.0)
  - Bidirectional adapter pattern (JSON Resume ↔ Internal format)
  - Schema validation with AJV
  - 4-layer type system (external, internal, display, feature-specific)

- **Print Features**
  - `/resume` page auto-triggers browser print dialog
  - Print-optimized CSS
  - PrintButton component for manual printing
  - Keyboard shortcut support (Ctrl/Cmd+P)

- **Calendar Integration**
  - `/book` page redirects to Google Calendar booking link
  - Configurable via `resume.json` → `basics.calendar`

- **SEO & Performance**
  - Auto-generated sitemap (next-sitemap)
  - Robots.txt generation
  - Dynamic OpenGraph images (@vercel/og)
  - Twitter card images
  - Static site generation (SSG)
  - Route-based code splitting

- **Testing Infrastructure**
  - Jest 30.2.0 + React Testing Library 16.3.0
  - 25 test files, 500+ total tests
  - Unit tests (components, utilities)
  - Integration tests (page workflows)
  - End-to-end tests (user journeys)
  - 89.6% pass rate (4 tests intentionally skipped)
  - Accessibility testing (jest-axe)

- **Deployment**
  - GitHub Actions workflow
  - Automated testing before deployment
  - Static export to GitHub Pages
  - Custom domain support (CNAME)
  - Zero-downtime deployments

- **Documentation**
  - README.md - Project overview
  - CLAUDE.md - Architecture and development guidelines
  - docs/DEFAULT_DATA_SETUP.md - Data customization guide
  - docs/PASSWORD_PROTECTION_SETUP.md - Auth setup guide
  - docs/PASSWORD_PROTECTION_TESTS.md - Test documentation
  - docs/AI_COVER_LETTER_GENERATOR.md - AI feature guide
  - docs/README.md - Documentation index

### Technical Details

**Dependencies:**
- Next.js 15.5.2 (App Router, static export)
- React 19.1.0
- TypeScript 5
- Tailwind CSS v4
- Framer Motion 12.23.12
- bcryptjs 3.0.3
- AJV 8.17.1 (JSON Resume validation)
- Sonner 2.0.7 (toast notifications)
- Sharp 0.34.3 (image processing)

**Configuration:**
- TypeScript strict mode enabled
- Path alias: `@/*` → `./src/*`
- ESLint + Prettier (code quality)
- GitHub Pages deployment
- Sitemap auto-generation via postbuild script

### Security

- Client-side password protection (bcrypt)
- Session-based authentication
- No plain-text passwords stored
- Robots.txt blocks admin interfaces
- Environment variable support for secrets

### Known Limitations

- Client-side auth can be bypassed (suitable for personal portfolios)
- Static export limitations (no server-side runtime)
- Images unoptimized (GitHub Pages compatibility)
- 4 tests skipped (browser-specific edge cases)

---

## Version History

### Versioning Scheme

We use [Semantic Versioning](https://semver.org/):
- **MAJOR**: Incompatible API changes
- **MINOR**: Backwards-compatible functionality
- **PATCH**: Backwards-compatible bug fixes

### Release Notes Format

Each release includes:
- **Added**: New features
- **Changed**: Changes to existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security improvements

---

## [1.0.0] - 2025-01-25

**Initial Release** 🎉

This is the first public release of the portfolio template with all core features implemented and tested.

### Highlights

✅ Complete portfolio website with 5 sections
✅ Interactive resume builder with drag-and-drop
✅ AI-powered cover letter generation
✅ Optional password protection
✅ Comprehensive test suite (500+ tests)
✅ Auto-deployment to GitHub Pages
✅ Full documentation

### Migration Notes

N/A (initial release)

### Breaking Changes

N/A (initial release)

### Upgrade Guide

N/A (initial release)

---

## Future Roadmap

### Planned Features (v1.1.0)

- [ ] Project showcase section with filtering
- [ ] Blog integration (MDX support)
- [ ] Multi-language support (i18n)
- [ ] Theme customization (color presets)
- [ ] Analytics integration (Google Analytics, Plausible)
- [ ] Server-side authentication option (for Vercel/Netlify)

### Under Consideration

- [ ] Dark/light theme toggle
- [ ] Resume templates (multiple layouts)
- [ ] PDF export functionality
- [ ] Contact form with email integration
- [ ] Achievement badges/certificates display
- [ ] Timeline visualization for experience

### Long-term Vision

- [ ] Admin dashboard for easier editing
- [ ] CMS integration (Sanity, Contentful)
- [ ] A/B testing for different resume versions
- [ ] Analytics for resume views/downloads
- [ ] Multi-user support (for agencies)

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on:
- How to propose changes
- Coding standards
- Testing requirements
- Pull request process

---

## Support

- **Documentation**: [docs/](./docs/)
- **Issues**: https://github.com/ismail-kattakath/ismail-portfolio/issues
- **Discussions**: https://github.com/ismail-kattakath/ismail-portfolio/discussions

---

## License

MIT License - See [LICENSE](./LICENSE) for details

---

**Note**: This changelog is maintained manually. For a complete commit history, see the [GitHub commits page](https://github.com/ismail-kattakath/ismail-portfolio/commits/main).
