import {
  PROVIDER_PRESETS,
  CUSTOM_PROVIDER,
  getProviderByURL,
  isKnownProvider,
} from '@/lib/ai/providers'

describe('AI Providers', () => {
  describe('PROVIDER_PRESETS', () => {
    it('contains all expected providers', () => {
      const providerNames = PROVIDER_PRESETS.map((p) => p.name)
      expect(providerNames).toContain('OpenAI')
      expect(providerNames).toContain('OpenRouter')
      expect(providerNames).toContain('xAI (Grok)')
      expect(providerNames).toContain('Local (LM Studio)')
    })

    it('all providers have required fields', () => {
      PROVIDER_PRESETS.forEach((provider) => {
        expect(provider.name).toBeTruthy()
        expect(provider.baseURL).toBeTruthy()
        expect(provider.description).toBeTruthy()
        expect(typeof provider.supportsModels).toBe('boolean')
        expect(typeof provider.requiresAuth).toBe('boolean')
      })
    })

    it('all providers have valid URLs', () => {
      PROVIDER_PRESETS.forEach((provider) => {
        expect(() => new URL(provider.baseURL)).not.toThrow()
      })
    })

    it('all providers have common models', () => {
      PROVIDER_PRESETS.forEach((provider) => {
        expect(provider.commonModels).toBeDefined()
        expect(Array.isArray(provider.commonModels)).toBe(true)
        expect(provider.commonModels!.length).toBeGreaterThan(0)
      })
    })

    it('OpenAI provider has correct configuration', () => {
      const openai = PROVIDER_PRESETS.find((p) => p.name === 'OpenAI')
      expect(openai).toBeDefined()
      expect(openai!.baseURL).toBe('https://api.openai.com/v1')
      expect(openai!.supportsModels).toBe(true)
      expect(openai!.requiresAuth).toBe(true)
      expect(openai!.commonModels).toContain('gpt-4o')
      expect(openai!.commonModels).toContain('gpt-4o-mini')
    })

    it('OpenRouter provider has correct configuration', () => {
      const openrouter = PROVIDER_PRESETS.find((p) => p.name === 'OpenRouter')
      expect(openrouter).toBeDefined()
      expect(openrouter!.baseURL).toBe('https://openrouter.ai/api/v1')
      expect(openrouter!.supportsModels).toBe(true)
      expect(openrouter!.requiresAuth).toBe(true)
      expect(openrouter!.commonModels).toContain('google/gemini-2.0-flash-exp')
    })

    it('xAI Grok provider has correct configuration', () => {
      const grok = PROVIDER_PRESETS.find((p) => p.name === 'xAI (Grok)')
      expect(grok).toBeDefined()
      expect(grok!.baseURL).toBe('https://api.x.ai/v1')
      expect(grok!.supportsModels).toBe(true)
      expect(grok!.requiresAuth).toBe(true)
      expect(grok!.commonModels).toContain('grok-beta')
    })

    it('Local provider has correct configuration', () => {
      const local = PROVIDER_PRESETS.find((p) => p.name === 'Local (LM Studio)')
      expect(local).toBeDefined()
      expect(local!.baseURL).toBe('http://localhost:1234/v1')
      expect(local!.supportsModels).toBe(true)
      expect(local!.requiresAuth).toBe(false)
      expect(local!.commonModels!.length).toBeGreaterThan(0)
    })
  })

  describe('CUSTOM_PROVIDER', () => {
    it('has correct configuration', () => {
      expect(CUSTOM_PROVIDER.name).toBe('Custom')
      expect(CUSTOM_PROVIDER.baseURL).toBe('')
      expect(CUSTOM_PROVIDER.description).toBe('Enter your own API URL')
      expect(CUSTOM_PROVIDER.supportsModels).toBe(false)
    })
  })

  describe('getProviderByURL', () => {
    it('finds provider by exact URL match', () => {
      const provider = getProviderByURL('https://api.openai.com/v1')
      expect(provider).toBeDefined()
      expect(provider!.name).toBe('OpenAI')
    })

    it('is case-insensitive', () => {
      const provider = getProviderByURL('HTTPS://API.OPENAI.COM/V1')
      expect(provider).toBeDefined()
      expect(provider!.name).toBe('OpenAI')
    })

    it('returns null for unknown URL', () => {
      const provider = getProviderByURL('https://unknown.api.com/v1')
      expect(provider).toBeNull()
    })

    it('returns null for empty URL', () => {
      const provider = getProviderByURL('')
      expect(provider).toBeNull()
    })

    it('finds OpenRouter by URL', () => {
      const provider = getProviderByURL('https://openrouter.ai/api/v1')
      expect(provider).toBeDefined()
      expect(provider!.name).toBe('OpenRouter')
    })

    it('finds xAI Grok by URL', () => {
      const provider = getProviderByURL('https://api.x.ai/v1')
      expect(provider).toBeDefined()
      expect(provider!.name).toBe('xAI (Grok)')
    })

    it('finds Local provider by URL', () => {
      const provider = getProviderByURL('http://localhost:1234/v1')
      expect(provider).toBeDefined()
      expect(provider!.name).toBe('Local (LM Studio)')
    })
  })

  describe('isKnownProvider', () => {
    it('returns true for known provider URLs', () => {
      expect(isKnownProvider('https://api.openai.com/v1')).toBe(true)
      expect(isKnownProvider('https://openrouter.ai/api/v1')).toBe(true)
      expect(isKnownProvider('https://api.x.ai/v1')).toBe(true)
      expect(isKnownProvider('http://localhost:1234/v1')).toBe(true)
    })

    it('returns false for unknown URLs', () => {
      expect(isKnownProvider('https://unknown.api.com/v1')).toBe(false)
      expect(isKnownProvider('https://example.com')).toBe(false)
    })

    it('returns false for empty URL', () => {
      expect(isKnownProvider('')).toBe(false)
    })

    it('is case-insensitive', () => {
      expect(isKnownProvider('HTTPS://API.OPENAI.COM/V1')).toBe(true)
    })
  })

  describe('Provider data integrity', () => {
    it('has no duplicate provider names', () => {
      const names = PROVIDER_PRESETS.map((p) => p.name)
      const uniqueNames = new Set(names)
      expect(names.length).toBe(uniqueNames.size)
    })

    it('has no duplicate base URLs', () => {
      const urls = PROVIDER_PRESETS.map((p) => p.baseURL)
      const uniqueUrls = new Set(urls)
      expect(urls.length).toBe(uniqueUrls.size)
    })

    it('all common models are non-empty strings', () => {
      PROVIDER_PRESETS.forEach((provider) => {
        provider.commonModels?.forEach((model) => {
          expect(typeof model).toBe('string')
          expect(model.length).toBeGreaterThan(0)
        })
      })
    })

    it('all base URLs end with /v1 or /api/v1', () => {
      PROVIDER_PRESETS.forEach((provider) => {
        const url = provider.baseURL.toLowerCase()
        expect(url.endsWith('/v1') || url.endsWith('/api/v1')).toBe(true)
      })
    })
  })
})
