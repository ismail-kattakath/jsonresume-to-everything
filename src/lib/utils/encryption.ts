/**
 * Utility for client-side encryption using the browser's native SubtleCrypto API.
 * Provides AES-GCM encryption/decryption.
 */

const ALGORITHM = 'AES-GCM'
const IV_LENGTH = 12 // Standard for GCM

/**
 * Derives a CryptoKey from a master string (password/passphrase)
 */
async function deriveKey(masterKey: string): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(masterKey)

  // Import the raw key data
  const baseKey = await window.crypto.subtle.importKey('raw', keyData, 'PBKDF2', false, ['deriveKey'])

  // Derive the actual AES-GCM key
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('jsonresume-to-everything-salt'), // Static salt for this app
      iterations: 100000,
      hash: 'SHA-256',
    },
    baseKey,
    { name: ALGORITHM, length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * Encrypts a string using AES-GCM
 */
export async function encryptData(data: string, masterKey: string): Promise<string> {
  if (!data) return ''

  const cryptoKey = await deriveKey(masterKey)
  const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH))
  const encoder = new TextEncoder()
  const encodedData = encoder.encode(data)

  const ciphertext = await window.crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv: iv,
    },
    cryptoKey,
    encodedData
  )

  // Concatenate IV and ciphertext
  const combined = new Uint8Array(iv.length + ciphertext.byteLength)
  combined.set(iv)
  combined.set(new Uint8Array(ciphertext), iv.length)

  // Convert to Base64 for storage
  return btoa(String.fromCharCode(...combined))
}

/**
 * Decrypts a string using AES-GCM
 */
export async function decryptData(encryptedBase64: string, masterKey: string): Promise<string> {
  if (!encryptedBase64) return ''

  try {
    const cryptoKey = await deriveKey(masterKey)
    const combined = new Uint8Array(
      atob(encryptedBase64)
        .split('')
        .map((c) => c.charCodeAt(0))
    )

    const iv = combined.slice(0, IV_LENGTH)
    const ciphertext = combined.slice(IV_LENGTH)

    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv: iv,
      },
      cryptoKey,
      ciphertext
    )

    const decoder = new TextDecoder()
    return decoder.decode(decrypted)
  } catch (error) {
    console.error('[Encryption] Decryption failed:', error)
    throw new Error('Decryption failed. Data might be corrupted or key mismatch.')
  }
}

/**
 * Generates a random secure vault key
 */
export function generateVaultKey(): string {
  const array = new Uint8Array(32)
  window.crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('')
}
