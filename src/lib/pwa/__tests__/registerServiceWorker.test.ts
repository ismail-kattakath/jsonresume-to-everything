/**
 * @jest-environment jsdom
 */

import {
  registerServiceWorker,
  unregisterServiceWorker,
} from '../registerServiceWorker'

describe('registerServiceWorker', () => {
  let mockRegister: jest.Mock
  let mockAddEventListener: jest.Mock
  let mockServiceWorkerContainer: any
  let originalConsoleLog: typeof console.log
  let originalConsoleError: typeof console.error

  beforeEach(() => {
    // Silence console output during tests
    originalConsoleLog = console.log
    originalConsoleError = console.error
    console.log = jest.fn()
    console.error = jest.fn()

    // Reset mocks before each test
    mockRegister = jest.fn()
    mockAddEventListener = jest.fn()

    // Mock service worker container
    mockServiceWorkerContainer = {
      register: mockRegister,
    }

    // Mock navigator.serviceWorker
    Object.defineProperty(window.navigator, 'serviceWorker', {
      writable: true,
      configurable: true,
      value: mockServiceWorkerContainer,
    })

    // Mock window.addEventListener
    window.addEventListener = mockAddEventListener
  })

  afterEach(() => {
    // Restore console
    console.log = originalConsoleLog
    console.error = originalConsoleError

    // Clean up
    jest.clearAllMocks()
  })

  it('should not register service worker on server-side (no window)', () => {
    // Temporarily remove window
    const originalWindow = global.window
    // @ts-expect-error - Testing server-side scenario
    delete global.window

    registerServiceWorker()

    expect(mockRegister).not.toHaveBeenCalled()

    // Restore window
    global.window = originalWindow
  })

  it('should not register if serviceWorker is not supported', () => {
    // Mock navigator without serviceWorker
    const mockNavigator = {}
    Object.defineProperty(window, 'navigator', {
      writable: true,
      configurable: true,
      value: mockNavigator,
    })

    registerServiceWorker()

    expect(mockRegister).not.toHaveBeenCalled()
  })

  it('should register service worker on load event', async () => {
    const mockRegistration = {
      scope: '/resume/builder',
      addEventListener: jest.fn(),
    }

    mockRegister.mockResolvedValue(mockRegistration)

    registerServiceWorker()

    // Simulate window load event
    const loadHandler = mockAddEventListener.mock.calls.find(
      (call) => call[0] === 'load'
    )?.[1]

    expect(loadHandler).toBeDefined()

    await loadHandler()

    expect(mockRegister).toHaveBeenCalledWith('/sw.js')
    expect(console.log).toHaveBeenCalledWith(
      '✅ Service Worker registered:',
      '/resume/builder'
    )
  })

  it('should handle registration errors', async () => {
    const mockError = new Error('Registration failed')
    mockRegister.mockRejectedValue(mockError)

    registerServiceWorker()

    // Simulate window load event
    const loadHandler = mockAddEventListener.mock.calls.find(
      (call) => call[0] === 'load'
    )?.[1]

    // Execute the load handler and wait for the promise chain
    if (loadHandler) {
      loadHandler()
      // Wait for promise to settle
      await new Promise((resolve) => setTimeout(resolve, 0))
    }

    expect(console.error).toHaveBeenCalledWith(
      '❌ Service Worker registration failed:',
      mockError
    )
  })

  it('should detect service worker updates', async () => {
    const mockInstalling = {
      state: 'installing',
      addEventListener: jest.fn(),
    }

    const mockRegistration = {
      scope: '/resume/builder',
      addEventListener: jest.fn(),
      installing: mockInstalling,
    }

    mockRegister.mockResolvedValue(mockRegistration)
    mockServiceWorkerContainer.controller = {}

    registerServiceWorker()

    const loadHandler = mockAddEventListener.mock.calls.find(
      (call) => call[0] === 'load'
    )?.[1]

    await loadHandler()

    // Trigger updatefound event
    const updatefoundHandler =
      mockRegistration.addEventListener.mock.calls.find(
        (call) => call[0] === 'updatefound'
      )?.[1]

    updatefoundHandler()

    // Trigger statechange event
    const statechangeHandler = mockInstalling.addEventListener.mock.calls.find(
      (call) => call[0] === 'statechange'
    )?.[1]

    mockInstalling.state = 'installed'
    statechangeHandler()

    expect(console.log).toHaveBeenCalledWith(
      '🔄 New version available - reload to update'
    )
  })

  it('should not detect updates if no new worker is installing', async () => {
    const mockRegistration = {
      scope: '/resume/builder',
      addEventListener: jest.fn(),
      installing: null, // No new worker installing
    }

    mockRegister.mockResolvedValue(mockRegistration)

    registerServiceWorker()

    const loadHandler = mockAddEventListener.mock.calls.find(
      (call) => call[0] === 'load'
    )?.[1]

    await loadHandler()

    // Trigger updatefound event
    const updatefoundHandler =
      mockRegistration.addEventListener.mock.calls.find(
        (call) => call[0] === 'updatefound'
      )?.[1]

    updatefoundHandler()

    // Should not attach statechange listener if no installing worker
    expect(console.log).toHaveBeenCalledTimes(1) // Only registration log
  })

  it('should not log update message if worker is not installed', async () => {
    const mockInstalling = {
      state: 'activating', // Not installed
      addEventListener: jest.fn(),
    }

    const mockRegistration = {
      scope: '/resume/builder',
      addEventListener: jest.fn(),
      installing: mockInstalling,
    }

    mockRegister.mockResolvedValue(mockRegistration)
    mockServiceWorkerContainer.controller = {}

    registerServiceWorker()

    const loadHandler = mockAddEventListener.mock.calls.find(
      (call) => call[0] === 'load'
    )?.[1]

    await loadHandler()

    const updatefoundHandler =
      mockRegistration.addEventListener.mock.calls.find(
        (call) => call[0] === 'updatefound'
      )?.[1]

    updatefoundHandler()

    const statechangeHandler = mockInstalling.addEventListener.mock.calls.find(
      (call) => call[0] === 'statechange'
    )?.[1]

    statechangeHandler()

    // Should only have registration log, not update log
    expect(console.log).toHaveBeenCalledTimes(1)
  })
})

describe('unregisterServiceWorker', () => {
  let originalConsoleLog: typeof console.log
  let originalConsoleError: typeof console.error

  beforeEach(() => {
    originalConsoleLog = console.log
    originalConsoleError = console.error
    console.log = jest.fn()
    console.error = jest.fn()
  })

  afterEach(() => {
    console.log = originalConsoleLog
    console.error = originalConsoleError
  })

  it('should return false on server-side', async () => {
    const originalWindow = global.window
    // @ts-expect-error - Testing server-side scenario
    delete global.window

    const result = await unregisterServiceWorker()

    expect(result).toBe(false)

    global.window = originalWindow
  })

  it('should return false if serviceWorker is not supported', async () => {
    const mockNavigator = {}
    Object.defineProperty(window, 'navigator', {
      writable: true,
      configurable: true,
      value: mockNavigator,
    })

    const result = await unregisterServiceWorker()

    expect(result).toBe(false)
  })

  it('should unregister service worker successfully', async () => {
    const mockUnregister = jest.fn().mockResolvedValue(true)
    const mockRegistration = {
      unregister: mockUnregister,
    }

    Object.defineProperty(window.navigator, 'serviceWorker', {
      writable: true,
      configurable: true,
      value: {
        ready: Promise.resolve(mockRegistration),
      },
    })

    const result = await unregisterServiceWorker()

    expect(mockUnregister).toHaveBeenCalled()
    expect(result).toBe(true)
  })
})
