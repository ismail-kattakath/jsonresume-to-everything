import { StoredCredentials } from '@/types/openai'
import {
    encryptData,
    decryptData,
    generateVaultKey,
} from '@/lib/utils/encryption'

const STORAGE_KEY = 'jsonresume_ai_credentials'
const VAULT_KEY = 'jsonresume_vault_key'

/**
 * Gets or creates a unique vault key for this browser
 */
export function getVaultKey(): string {
    if (typeof window === 'undefined') return ''
    let key = localStorage.getItem(VAULT_KEY)
    if (!key) {
        key = generateVaultKey()
        localStorage.setItem(VAULT_KEY, key)
    }
    return key
}

/**
 * Saves API credentials and job description to localStorage
 */
export async function saveCredentials(
    credentials: StoredCredentials
): Promise<void> {
    if (typeof window === 'undefined') return

    const vaultKey = getVaultKey()

    // Encrypt sensitive data
    const encryptedApiKey = credentials.apiKey
        ? await encryptData(credentials.apiKey, vaultKey)
        : ''

    const encryptedProviderKeys: Record<string, string> = {}
    if (credentials.providerKeys) {
        for (const [url, key] of Object.entries(credentials.providerKeys)) {
            encryptedProviderKeys[url] = await encryptData(key, vaultKey)
        }
    }

    const dataToSave = credentials.rememberCredentials
        ? {
            ...credentials,
            apiKey: encryptedApiKey,
            providerKeys: encryptedProviderKeys,
        }
        : {
            apiUrl: '',
            apiKey: '',
            model: credentials.model,
            providerType: credentials.providerType,
            providerKeys: encryptedProviderKeys,
            rememberCredentials: false,
            lastJobDescription: credentials.lastJobDescription,
            skillsToHighlight: credentials.skillsToHighlight,
        }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
}

/**
 * Loads API credentials from localStorage
 */
export async function loadCredentials(): Promise<StoredCredentials | null> {
    if (typeof window === 'undefined') return null

    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return null

    try {
        const credentials = JSON.parse(saved) as StoredCredentials
        const vaultKey = getVaultKey()

        // Decrypt sensitive data
        if (credentials.apiKey) {
            try {
                credentials.apiKey = await decryptData(credentials.apiKey, vaultKey)
            } catch {
                credentials.apiKey = '' // Reset on failure
            }
        }

        if (credentials.providerKeys) {
            for (const [url, key] of Object.entries(credentials.providerKeys)) {
                try {
                    credentials.providerKeys[url] = await decryptData(key, vaultKey)
                } catch {
                    credentials.providerKeys[url] = ''
                }
            }
        }

        return credentials
    } catch (error) {
        console.error('Failed to parse or decrypt credentials:', error)
        return null
    }
}

/**
 * Clears stored API credentials
 */
export function clearCredentials(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEY)
}
