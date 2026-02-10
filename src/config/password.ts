// ============================================
// Password Protection Configuration (Optional)
// ============================================
//
// BY DEFAULT: Edit pages are publicly accessible (no authentication required)
//
// BEHAVIOR:
// - If NEXT_PUBLIC_EDIT_PASSWORD_HASH is set → Password protection ENABLED
// - If NEXT_PUBLIC_EDIT_PASSWORD_HASH is NOT set → Public access (no password)
//
// TO ENABLE:
// 1. Generate hash: node scripts/generate-password-hash.mjs "your-password"
// 2. Set NEXT_PUBLIC_EDIT_PASSWORD_HASH in .env.local (local dev)
// 3. Set NEXT_PUBLIC_EDIT_PASSWORD_HASH in GitHub Secrets (production)
//
// TO DISABLE:
// - Simply don't set the environment variable
// - Edit pages will be accessible without authentication
//
// See docs/PASSWORD_PROTECTION_SETUP.md for complete guide

// Helper to check if we're in a browser environment
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.document !== 'undefined'
}

// For client components, export a function that gets the hash
export function getPasswordHash(): string | undefined {
  // Try to get from window object (injected at build time)
  if (isBrowser() && (window as any).__PASSWORD_HASH__) {
    return (window as any).__PASSWORD_HASH__
  }

  // Get from environment variable (works in dev and build time)
  if (!isBrowser()) {
    return process.env['NEXT_PUBLIC_EDIT_PASSWORD_HASH'] || undefined
  }

  // Browser environment but no window hash - check if we have process.env (build time)
  // This handles the case where we're in a browser-like test environment
  if (
    typeof process !== 'undefined' &&
    process.env &&
    process.env['NEXT_PUBLIC_EDIT_PASSWORD_HASH']
  ) {
    return process.env['NEXT_PUBLIC_EDIT_PASSWORD_HASH']
  }

  // No fallback - if not set, auth is disabled
  return undefined
}

// Check if password protection is enabled
export function isPasswordProtectionEnabled(): boolean {
  return getPasswordHash() !== undefined
}
