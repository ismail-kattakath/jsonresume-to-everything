// Quick test script to verify OpenRouter API integration
const apiKey = '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'
const baseURL = 'https://openrouter.ai/api/v1'

async function fetchAvailableModels(config) {
  try {
    if (!config.baseURL || !config.apiKey) {
      console.log('Missing baseURL or apiKey')
      return []
    }

    const isOpenRouter = config.baseURL.includes('openrouter.ai')
    const endpoint = isOpenRouter
      ? `${config.baseURL}/models`
      : `${config.baseURL}/v1/models`

    console.log('Testing with:', {
      baseURL: config.baseURL,
      isOpenRouter,
      endpoint,
      hasApiKey: !!config.apiKey,
      apiKeyPrefix: config.apiKey.substring(0, 15),
    })

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        ...(isOpenRouter && {
          'HTTP-Referer':
            'https://github.com/ismail-kattakath/jsonresume-to-everything',
          'X-Title': 'JSON Resume to Everything',
        }),
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    console.log('Response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to fetch models:', response.status, errorText)
      return []
    }

    const data = await response.json()
    console.log('Response structure:', {
      hasData: !!data.data,
      isArray: Array.isArray(data.data),
      sampleModel: data.data?.[0]?.id,
      totalModels: data.data?.length,
    })

    if (data.data && Array.isArray(data.data)) {
      const models = data.data.map((model) => model.id).sort()
      console.log(`✓ Successfully fetched ${models.length} models`)
      console.log('First 10 models:', models.slice(0, 10))
      return models
    }

    console.log('Unexpected data structure:', data)
    return []
  } catch (error) {
    console.error('Error:', error.message)
    return []
  }
}

// Run the test
fetchAvailableModels({ baseURL, apiKey })
