import '@testing-library/jest-dom'
import { toHaveNoViolations } from 'jest-axe'
import React from 'react'

expect.extend(toHaveNoViolations)

// Mock onborda library (ESM module that Jest can't transform)
// Using { virtual: true } to create a virtual mock that doesn't require the actual module
jest.mock(
  'onborda',
  () => ({
    OnbordaProvider: ({ children }) =>
      React.createElement(
        'div',
        { 'data-testid': 'onborda-provider' },
        children
      ),
    Onborda: ({ children, showOnborda }) =>
      React.createElement(
        'div',
        { 'data-testid': 'onborda', 'data-show': showOnborda },
        children
      ),
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

// Mock performance API for Next.js third-party scripts (Google Analytics)
global.performance.mark = jest.fn()
global.performance.measure = jest.fn()
global.performance.getEntriesByName = jest.fn(() => [])

// Mock DragAndDrop wrapper components for testing
jest.mock('@/components/ui/DragAndDrop', () => ({
  DnDContext: ({ children }) => <div>{children}</div>,
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

// Suppress React act() warnings and intentional test console.errors
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    const message = args[0]?.toString() || ''
    // Suppress React act() warnings (expected in async tests)
    if (message.includes('not wrapped in act')) return
    // Suppress intentional auth error test
    if (message.includes('Authentication error:')) return
    // Suppress framer-motion prop warnings in tests
    if (message.includes('whileHover')) return
    if (message.includes('whileTap')) return
    if (message.includes('whileInView')) return
    if (message.includes('animate')) return
    if (message.includes('initial')) return
    if (message.includes('variants')) return
    if (message.includes('transition')) return
    if (message.includes('viewport')) return
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})
