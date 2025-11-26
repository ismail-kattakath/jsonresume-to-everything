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
