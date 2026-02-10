/**
 * Google Analytics 4 (GA4) Integration
 *
 * This module provides utilities for tracking user interactions and events
 * across the portfolio site using Google Analytics 4.
 *
 * @see https://developers.google.com/analytics/devguides/collection/ga4
 */

// Type definitions for gtag
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'set',
      targetId: string,
      config?: Record<string, unknown>
    ) => void
  }
}

/**
 * Google Analytics Measurement ID from environment variables
 */
export const GA_MEASUREMENT_ID =
  process.env['NEXT_PUBLIC_GA_MEASUREMENT_ID'] || ''

/**
 * Check if Google Analytics is enabled and available
 */
export const isAnalyticsEnabled = (): boolean => {
  return !!(
    GA_MEASUREMENT_ID &&
    typeof window !== 'undefined' &&
    typeof window.gtag === 'function'
  )
}

/**
 * Track a page view
 *
 * @param url - The page URL to track
 *
 * @example
 * ```typescript
 * pageview('/resume/builder')
 * ```
 */
export const pageview = (url: string): void => {
  if (!isAnalyticsEnabled()) return

  window.gtag?.('config', GA_MEASUREMENT_ID, {
    page_path: url,
  })
}

/**
 * Track a custom event
 *
 * @param action - The event name/action
 * @param params - Additional event parameters
 *
 * @example
 * ```typescript
 * event('resume_export', {
 *   format: 'PDF',
 *   sections_count: 5,
 * })
 * ```
 */
export const event = (
  action: string,
  params?: Record<string, unknown>
): void => {
  if (!isAnalyticsEnabled()) return

  window.gtag?.('event', action, params)
}

/**
 * Predefined event tracking functions for common interactions
 */
export const analytics = {
  // Page navigation
  pageView: (url: string) => pageview(url),

  // Resume builder events
  resumeExport: (format: string, sectionsCount: number) => {
    event('resume_export', {
      format,
      sections_count: sectionsCount,
      timestamp: new Date().toISOString(),
    })
  },

  resumeImport: (format: string, success: boolean) => {
    event('resume_import', {
      format,
      success,
      timestamp: new Date().toISOString(),
    })
  },

  sectionToggle: (sectionName: string, isExpanded: boolean) => {
    event('section_toggle', {
      section_name: sectionName,
      is_expanded: isExpanded,
    })
  },

  // AI cover letter events
  aiGenerationStart: (provider: string, model: string) => {
    event('ai_generation_start', {
      provider,
      model,
      timestamp: new Date().toISOString(),
    })
  },

  aiGenerationSuccess: (
    provider: string,
    model: string,
    responseTimeMs: number
  ) => {
    event('ai_generation_success', {
      provider,
      model,
      response_time_ms: responseTimeMs,
      timestamp: new Date().toISOString(),
    })
  },

  aiGenerationError: (provider: string, errorType: string) => {
    event('ai_generation_error', {
      provider,
      error_type: errorType,
      timestamp: new Date().toISOString(),
    })
  },

  aiProviderSelect: (provider: string) => {
    event('ai_provider_select', {
      provider,
    })
  },

  // Content engagement
  projectView: (projectName: string, category?: string) => {
    event('project_view', {
      project_name: projectName,
      project_category: category,
      source: 'homepage',
    })
  },

  externalLink: (url: string, section: string) => {
    event('external_link', {
      url,
      section,
    })
  },

  downloadResume: (format: string, source: string) => {
    event('download_resume', {
      format,
      source,
    })
  },

  contactClick: (method: string) => {
    event('contact_click', {
      method,
    })
  },

  socialMediaClick: (platform: string) => {
    event('social_media_click', {
      platform,
    })
  },

  // Section visibility tracking
  sectionView: (sectionName: string) => {
    event('section_view', {
      section_name: sectionName,
    })
  },

  // Scroll depth tracking
  scrollDepth: (percentage: number) => {
    event('scroll_depth', {
      percentage,
    })
  },

  // Navigation events
  anchorNavigation: (sectionId: string, fromPage: string) => {
    event('anchor_navigation', {
      section_id: sectionId,
      from_page: fromPage,
    })
  },

  // Calendar booking
  calendarClick: (source: string) => {
    event('calendar_click', {
      source,
    })
  },

  // Authentication events (no sensitive data)
  authAttempt: (success: boolean) => {
    event('auth_attempt', {
      success,
    })
  },

  // Error tracking
  errorOccurred: (errorType: string, errorMessage: string) => {
    event('error_occurred', {
      error_type: errorType,
      error_message: errorMessage,
    })
  },
}
