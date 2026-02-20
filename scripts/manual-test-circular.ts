import { sanitizeAIError } from '../src/lib/ai/api'

try {
  const circular: any = {}
  circular.message = circular
  console.log('Testing circular object...')
  sanitizeAIError(circular)
  console.log('Success (no loop)')
} catch (e) {
  console.log('Caught expected error or loop:', e)
}

try {
  const deep: any = { message: '{"message": "{\\\"message\\\": \\\"end\\\"}"}' }
  console.log('Testing deep nesting...')
  const result = sanitizeAIError(deep)
  console.log('Result:', result)
} catch (e) {
  console.log('Deep nesting failed:', e)
}
