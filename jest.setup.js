import '@testing-library/jest-dom'
import { toHaveNoViolations } from 'jest-axe'
import React from 'react'

expect.extend(toHaveNoViolations)

// Mock onborda library (ESM module that Jest can't transform)
// Using { virtual: true } to create a virtual mock that doesn't require the actual module
jest.mock(
  'onborda',
  () => ({
    OnbordaProvider: ({ children }) => React.createElement('div', { 'data-testid': 'onborda-provider' }, children),
    Onborda: ({ children, showOnborda }) =>
      React.createElement('div', { 'data-testid': 'onborda', 'data-show': showOnborda }, children),
    useOnborda: () => ({
      startOnborda: jest.fn(),
      closeOnborda: jest.fn(),
      isOnbordaVisible: false,
      currentStep: 0,
      currentTour: null,
      setCurrentStep: jest.fn(),
    }),
  }),
  { virtual: true }
)

// Mock IntersectionObserver for framer-motion
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock performance API for Next.js third-party scripts (Google Analytics)
global.performance.mark = jest.fn()
global.performance.measure = jest.fn()
global.performance.getEntriesByName = jest.fn(() => [])
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    ok: true,
  })
)

// Mock DragAndDrop wrapper components for testing
jest.mock('@/components/ui/DragAndDrop', () => ({
  DnDContext: ({ children, onDragEnd }) => {
    // Expose for testing if needed
    if (typeof global !== 'undefined') {
      global.__MOCKED_DND_CONTEXT_ON_DRAG_END__ = onDragEnd
    }
    return <div>{children}</div>
  },
  DnDDroppable: ({ children }) =>
    children({
      draggableProps: {},
      dragHandleProps: {},
      innerRef: jest.fn(),
      droppableProps: {},
      placeholder: null,
    }),
  DnDDraggable: ({ children }) =>
    children(
      {
        draggableProps: {},
        dragHandleProps: {},
        innerRef: jest.fn(),
      },
      { isDragging: false }
    ),
  DraggableCard: ({ children }) => <div>{children}</div>,
}))

// Mock react-tooltip to avoid ESM issues in tests
jest.mock('react-tooltip', () => ({
  Tooltip: () => null,
}))

// Mock @strands-agents/sdk to avoid ESM issues in integration tests
jest.mock('@strands-agents/sdk', () => ({
  Agent: jest.fn().mockImplementation(() => ({
    invoke: jest.fn(),
    stream: jest.fn(),
  })),
}))

jest.mock('@strands-agents/sdk/openai', () => ({
  OpenAIModel: jest.fn().mockImplementation(() => ({})),
}))

jest.mock('@strands-agents/sdk/gemini', () => ({
  GeminiModel: jest.fn().mockImplementation(() => ({})),
}))

// Mock @lottiefiles/dotlottie-react to avoid ESM issues in tests
jest.mock('@lottiefiles/dotlottie-react', () => ({
  DotLottieReact: () => React.createElement('div', { 'data-testid': 'lottie-spinner' }),
}))
// Suppress React act() warnings and intentional test console.errors
const originalError = console.error
const originalLog = console.log
const originalWarn = console.warn
const originalInfo = console.info

beforeAll(() => {
  console.error = (...args) => {
    const message = args
      .map((arg) => {
        if (arg && typeof arg === 'object') {
          try {
            return arg.stack || arg.message || JSON.stringify(arg)
          } catch (e) {
            return String(arg)
          }
        }
        return String(arg)
      })
      .join(' ')

    const silentPatterns = [
      /not wrapped in act/i,
      /nested/i,
      /classNameArrow/i,
      /delayShow|delayHide/i,
      /contentEditable/i,
      /Invalid file type/i,
      /Authentication error:/i,
      /\[Encryption\] Decryption failed:/i,
      /Validation errors:/i,
      /Error converting JSON Resume:/i,
      /Failed to parse achievements sort result:/i,
      /\[Pipeline\] Failed/i,
      /Failed to copy to clipboard/i,
      /Cover Letter generation error/i,
      /whileHover|whileTap|whileInView|animate|initial|variants|transition|viewport/i,
      /validateDOMNesting/i,
      /cannot be a child of/i,
      /hydration error/i,
      /Not implemented: navigation/i,
      /Failed to parse or decrypt credentials/i,
      /Failed to parse or decrypt providerKeys/i,
      /Error loading saved (resume|cover letter) data/i,
      /AISettings.*Model fetch error/i,
      /AI Achievements sort error/i,
    ]

    if (silentPatterns.some((pattern) => pattern.test(message))) {
      return
    }

    originalError.apply(console, args)
  }

  // Silence all logs and warnings in tests by default
  console.log = jest.fn()
  console.info = jest.fn()
  console.warn = jest.fn()
})

afterAll(() => {
  console.error = originalError
  console.log = originalLog
  console.warn = originalWarn
  console.info = originalInfo
})
