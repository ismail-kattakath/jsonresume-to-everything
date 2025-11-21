// ============================================
// Password Configuration Example (DEPRECATED)
// ============================================
//
// NOTE: This file is NO LONGER NEEDED!
//
// Password protection is now configured via environment variables only.
// You DO NOT need to create a password.ts file.
//
// ============================================
// How Password Protection Works (Optional)
// ============================================
//
// BY DEFAULT: Edit pages are publicly accessible (no password required)
//
// TO ENABLE PASSWORD PROTECTION:
// 1. Generate hash: node scripts/generate-password-hash.js "your-password"
// 2. Create .env.local file with:
//    NEXT_PUBLIC_EDIT_PASSWORD_HASH=your-hash-here
// 3. For production: Add to GitHub Secrets as NEXT_PUBLIC_EDIT_PASSWORD_HASH
//
// TO DISABLE PASSWORD PROTECTION:
// - Simply don't set the NEXT_PUBLIC_EDIT_PASSWORD_HASH variable
// - Or remove it from .env.local
//
// ============================================
// Technical Details
// ============================================
//
// The actual implementation is in src/config/password.ts:
//
// - If NEXT_PUBLIC_EDIT_PASSWORD_HASH is set → Password protection enabled
// - If NEXT_PUBLIC_EDIT_PASSWORD_HASH is NOT set → Public access (no password)
// - No hardcoded fallback password
// - No password.ts file needed
//
// See docs/PASSWORD_PROTECTION_SETUP.md for complete setup guide.
