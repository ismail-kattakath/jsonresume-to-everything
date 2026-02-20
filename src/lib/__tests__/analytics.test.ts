// @ts-nocheck

describe('analytics', () => {
  let isAnalyticsEnabled: () => boolean
  let pageview: (url: string) => void
  let event: (action: string, params?: Record<string, unknown>) => void
  let analytics: Record<string, (...args: unknown[]) => void>
  let gtagMock: jest.Mock

  beforeAll(() => {
    // Set the env var BEFORE importing the module so GA_MEASUREMENT_ID is populated
    process.env['NEXT_PUBLIC_GA_MEASUREMENT_ID'] = 'G-TEST'
  })

  beforeEach(async () => {
    jest.resetModules()
    // Re-import fresh module after env var is set
    const mod = await import('@/lib/analytics')
    isAnalyticsEnabled = mod.isAnalyticsEnabled
    pageview = mod.pageview
    event = mod.event
    analytics = mod.analytics

    gtagMock = jest.fn()
    Object.defineProperty(global.window, 'gtag', {
      value: gtagMock,
      configurable: true,
      writable: true,
    })
  })

  afterEach(() => {
    // @ts-ignore
    delete global.window.gtag
  })

  afterAll(() => {
    delete process.env['NEXT_PUBLIC_GA_MEASUREMENT_ID']
  })

  describe('isAnalyticsEnabled', () => {
    it('returns true when measurement ID and gtag exist', () => {
      expect(isAnalyticsEnabled()).toBe(true)
    })

    it('returns false when gtag is missing', () => {
      ;(window as any).gtag = undefined
      expect(isAnalyticsEnabled()).toBe(false)
    })
  })

  describe('tracking functions', () => {
    it('calls gtag on pageview', () => {
      pageview('/test')
      expect(gtagMock).toHaveBeenCalledWith(
        'config',
        'G-TEST',
        expect.objectContaining({
          page_path: '/test',
        })
      )
    })

    it('calls gtag on event', () => {
      event('test_action', { foo: 'bar' })
      expect(gtagMock).toHaveBeenCalledWith('event', 'test_action', { foo: 'bar' })
    })
  })

  describe('analytics object', () => {
    it('tracks export event', () => {
      analytics.resumeExport('PDF', 5)
      expect(gtagMock).toHaveBeenCalledWith(
        'event',
        'resume_export',
        expect.objectContaining({
          format: 'PDF',
          sections_count: 5,
        })
      )
    })

    it('tracks import event', () => {
      analytics.resumeImport('JSON', true)
      expect(gtagMock).toHaveBeenCalledWith(
        'event',
        'resume_import',
        expect.objectContaining({
          format: 'JSON',
          success: true,
        })
      )
    })
  })
})
