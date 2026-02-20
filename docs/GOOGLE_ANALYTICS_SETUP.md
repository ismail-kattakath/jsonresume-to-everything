# Google Analytics 4 (GA4) Setup Guide

This guide explains how to set up and use Google Analytics 4 tracking in your portfolio site.

## Table of Contents

- [Overview](#overview)
- [Setup Instructions](#setup-instructions)
- [Tracked Events](#tracked-events)
- [Privacy & Compliance](#privacy--compliance)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## Overview

Google Analytics 4 (GA4) provides comprehensive tracking of user behavior and engagement across your portfolio site. This implementation includes:

- **Automatic page view tracking**
- **Custom event tracking** for key user interactions
- **AI generation analytics** (provider, model, response time)
- **Resume builder engagement** (export, import, sections)
- **Content interaction tracking** (projects, social media, contact)
- **Privacy-first approach** (no PII tracking)

## Setup Instructions

### 1. Create GA4 Property

1. Visit [Google Analytics](https://analytics.google.com)
2. Click **Admin** (bottom left)
3. Under **Property**, click **Create Property**
4. Configure your property:
   - **Property name**: Your Site Name
   - **Reporting time zone**: Your timezone
   - **Currency**: Your currency
5. Click **Next** and complete the setup wizard
6. Click **Create** to finish

### 2. Get Your Measurement ID

1. In GA4 Admin, go to **Data Streams**
2. Click on your web data stream (or create one)
3. Copy your **Measurement ID** (format: `G-XXXXXXXXXX`)

### 3. Configure Environment Variables

#### Local Development

Add to `.env.local`:

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

#### Production Deployment (GitHub Pages)

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add:
   - **Name**: `NEXT_PUBLIC_GA_MEASUREMENT_ID`
   - **Value**: `G-XXXXXXXXXX`

### 4. Verify Installation

1. Deploy your site (or run `npm run dev` locally)
2. Visit your site in a browser
3. Open Chrome DevTools → Network tab
4. Filter by "collect" or "google-analytics"
5. You should see GA4 requests being sent

Alternatively, use the **GA4 DebugView**:

1. Install [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger) extension
2. Enable the extension
3. Visit your site
4. Check GA4 **Admin** → **DebugView** to see real-time events

## Tracked Events

### Navigation Events

| Event Name          | Trigger                     | Parameters                |
| ------------------- | --------------------------- | ------------------------- |
| `page_view`         | Automatic (every page load) | `page_path`, `page_title` |
| `anchor_navigation` | Section link clicked        | `section_id`, `from_page` |

### Resume Builder Events

| Event Name       | Trigger                    | Parameters                    |
| ---------------- | -------------------------- | ----------------------------- |
| `resume_export`  | Export button clicked      | `format`, `sections_count`    |
| `resume_import`  | Import file uploaded       | `format`, `success`           |
| `section_toggle` | Section expanded/collapsed | `section_name`, `is_expanded` |

### AI Generation Events

| Event Name              | Trigger                 | Parameters                              |
| ----------------------- | ----------------------- | --------------------------------------- |
| `ai_generation_start`   | Generate button clicked | `provider`, `model`                     |
| `ai_generation_success` | AI generation completed | `provider`, `model`, `response_time_ms` |
| `ai_generation_error`   | AI generation failed    | `provider`, `error_type`                |
| `ai_provider_select`    | AI provider changed     | `provider`                              |

### Content Engagement Events

| Event Name           | Trigger                   | Parameters                         |
| -------------------- | ------------------------- | ---------------------------------- |
| `project_view`       | Project card clicked      | `project_name`, `project_category` |
| `social_media_click` | Social media icon clicked | `platform`                         |
| `contact_click`      | Contact method clicked    | `method`                           |
| `download_resume`    | Resume download clicked   | `format`, `source`                 |
| `external_link`      | External link clicked     | `url`, `section`                   |

### Section Visibility Events

| Event Name     | Trigger                     | Parameters                         |
| -------------- | --------------------------- | ---------------------------------- |
| `section_view` | Section visible in viewport | `section_name`                     |
| `scroll_depth` | User scrolls to milestone   | `percentage` (25%, 50%, 75%, 100%) |

### Utility Events

| Event Name       | Trigger                           | Parameters                    |
| ---------------- | --------------------------------- | ----------------------------- |
| `calendar_click` | Calendar/booking link clicked     | `source`                      |
| `auth_attempt`   | Password authentication attempted | `success`                     |
| `error_occurred` | Application error                 | `error_type`, `error_message` |

## Privacy & Compliance

### What We Track

✅ **Anonymous behavior patterns**:

- Page views and navigation
- Feature usage (which tools users engage with)
- AI generation statistics (provider, model, response time)
- Resume export/import formats
- Section interactions

### What We DON'T Track

❌ **No Personally Identifiable Information (PII)**:

- No email addresses
- No resume content
- No job descriptions
- No API keys
- No password hashes
- No user names (from resume data)

### Privacy Features

- **IP Anonymization**: GA4 anonymizes IP addresses by default
- **No Cross-Site Tracking**: No Google Signals enabled
- **Opt-Out Support**: Users can disable tracking via browser settings or extensions
- **Graceful Degradation**: Analytics failures don't break site functionality

### GDPR/Privacy Compliance

1. **Disclosure**: Update your privacy policy to mention Google Analytics
2. **Cookie Consent** (optional): Implement cookie consent banner if required by jurisdiction
3. **Data Retention**: Configure in GA4 (14 months recommended)
4. **User Rights**: Respect Do Not Track (DNT) settings (future enhancement)

## Testing

### Testing Events Locally

1. Run development server:

   ```bash
   npm run dev
   ```

2. Open browser DevTools → Console
3. Trigger events (e.g., export resume, generate cover letter)
4. Check for GA4 event logs in console (if debug mode enabled)

### Testing in GA4 DebugView

1. Add `debug_mode=true` to your URL:

   ```
   http://localhost:3000?debug_mode=true
   ```

2. Open GA4 **Admin** → **DebugView**
3. Trigger events and see them appear in real-time

### Testing in Production

1. Deploy to production
2. Open GA4 **Reports** → **Realtime**
3. Visit your site and trigger events
4. Verify events appear within 30 seconds

## Troubleshooting

### Events Not Appearing

**Check 1: Measurement ID**

- Verify `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set correctly
- Format should be `G-XXXXXXXXXX`

**Check 2: Environment Variable**

- Run `echo $NEXT_PUBLIC_GA_MEASUREMENT_ID` (or check in-browser)
- For production, verify GitHub Secret is set

**Check 3: Ad Blockers**

- Disable ad blockers (they block GA4 requests)
- Try incognito/private browsing mode

**Check 4: Network Requests**

- Open DevTools → Network tab
- Filter by "collect"
- Look for requests to `google-analytics.com`

### Events Delayed

- **Expected**: GA4 can take 24-48 hours to fully process data
- **Realtime View**: Shows events within seconds (use for immediate verification)
- **Reports**: Full data available after processing delay

### Duplicate Events

- Check for multiple `GoogleAnalytics` components in layout hierarchy
- Verify event tracking calls aren't duplicated in components
- Clear browser cache and test again

### TypeScript Errors

If you see TypeScript errors about `window.gtag`:

```typescript
// Already handled in src/lib/analytics.ts
declare global {
  interface Window {
    gtag?: (command: 'config' | 'event' | 'set', targetId: string, config?: Record<string, unknown>) => void
  }
}
```

## Advanced Configuration

### Custom Dashboard

Create custom dashboards in GA4:

1. Go to **Explore** → **Blank**
2. Add dimensions: `event_name`, `provider`, `format`
3. Add metrics: `event_count`, `total_users`
4. Create visualizations for key metrics

### Conversion Goals

Set up conversion events:

1. Go to **Admin** → **Events**
2. Click **Mark as conversion** next to:
   - `resume_export`
   - `ai_generation_success`
   - `download_resume`
   - `contact_click`

### Audience Segments

Create audiences for targeted analysis:

1. Go to **Admin** → **Audiences**
2. Create custom audiences:
   - **AI Users**: Users who triggered `ai_generation_start`
   - **Resume Builders**: Users who triggered `resume_export`
   - **Engaged Visitors**: Users with `scroll_depth` > 75%

## Resources

- [GA4 Documentation](https://support.google.com/analytics/answer/9304153)
- [Next.js Analytics Guide](https://nextjs.org/docs/app/building-your-application/optimizing/analytics)
- [@next/third-parties Docs](https://nextjs.org/docs/app/building-your-application/optimizing/third-party-libraries)
- [GA4 Event Reference](https://support.google.com/analytics/answer/9267735)

## Support

For issues or questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review GA4 DebugView for event details
3. Open an issue on GitHub with:
   - Browser and version
   - Error messages (if any)
   - Steps to reproduce

---

**Last Updated**: 2025-11-28
**Version**: 1.0.0
