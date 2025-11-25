import '@testing-library/jest-dom'
import { toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

// Suppress React act() warnings and intentional test console.errors
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    const message = args[0]?.toString() || ''
    // Suppress React act() warnings (expected in async tests)
    if (message.includes('not wrapped in act')) return
    // Suppress intentional auth error test
    if (message.includes('Authentication error:')) return
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})
