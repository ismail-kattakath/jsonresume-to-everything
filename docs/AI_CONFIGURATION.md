# AI Configuration Guide

## Overview

The AI Configuration interface allows you to connect to multiple AI providers for generating AI-powered content like cover letters and professional summaries. The interface supports both **native integrations** (Google Gemini) and **OpenAI-compatible APIs**, with a smart provider dropdown system for easy setup.

## Supported AI Providers

### Native Integrations

- **Google Gemini** - Direct API integration with Gemini models (thinking mode, streaming, optimized tokens)

### OpenAI-Compatible APIs

- **OpenAI** - Official GPT models
- **OpenRouter** - Access to 100+ models
- **xAI Grok** - Grok models
- **Local LM Studio** - Self-hosted models
- **Custom** - Any OpenAI-compatible API

## Features

- 🎯 **Provider Dropdown**: Pre-configured providers for instant setup (Google Gemini, OpenAI, OpenRouter, xAI Grok, Local LM Studio)
- 🔄 **Auto-Fetch Models**: Automatically loads available models from your API provider
- 💾 **Smart Persistence**: Remembers your provider, model, and credentials across sessions
- 🔌 **Dual Integration**: Native Gemini API + OpenAI-compatible APIs
- 📊 **Connection Status**: Real-time feedback on API connection and model availability
- ⚡ **Auto-Selection**: Intelligently selects the first available model when switching providers
- 🚀 **Streaming Support**: Real-time content generation for all providers

## Accessing AI Settings

The AI configuration interface is available in the Resume Builder:

1. Navigate to `/resume/builder`
2. Click the **⚙️ Settings** tab in the top navigation
3. Scroll to the **"Generative AI"** section

You'll see the AI configuration panel with provider selection, API key input, model selection, and job description.

## Interface Components

### 1. Connection Status Log

Real-time status display showing:

```
┌─────────────────────────────────┐
│ Connection Status               │
├─────────────────────────────────┤
│ Active Provider: OpenRouter     │
│ Active Model: gemini-2.0-flash  │
│ Connection: ✓ Connected         │
└─────────────────────────────────┘
```

**Status Indicators:**

- 🟢 **✓ Connected successfully** - API is working
- 🟡 **Testing connection...** - Checking API credentials
- 🔴 **✗ Connection failed** - Invalid credentials or server issue
- ⚪ **Ready to connect** - Waiting for credentials
- ⚪ **No credentials configured** - API key or URL missing

### 2. Provider Selection

Choose from pre-configured providers or use a custom URL:

#### Pre-configured Providers

| Provider              | Type       | Description                                           | Common Models                                                      |
| --------------------- | ---------- | ----------------------------------------------------- | ------------------------------------------------------------------ |
| **Google Gemini** ⭐  | Native     | Direct Gemini API with thinking mode support          | gemini-2.5-flash, gemini-2.5-pro, gemini-1.5-flash, gemini-1.5-pro |
| **OpenAI**            | Compatible | Official OpenAI API (GPT-4, GPT-4o, GPT-4o-mini)      | gpt-4o, gpt-4o-mini, gpt-4-turbo, gpt-4, gpt-3.5-turbo             |
| **OpenRouter**        | Compatible | Access 100+ models (Gemini, Claude, GPT, Llama, etc.) | gemini-2.0-flash-exp, claude-3.5-sonnet, gpt-4o-mini, deepseek-r1  |
| **xAI (Grok)**        | Compatible | xAI Grok models                                       | grok-beta, grok-vision-beta                                        |
| **Local (LM Studio)** | Compatible | Local AI server (LM Studio, Ollama, etc.)             | llama-3.1-8b-instruct, llama-3.3-70b-instruct, qwen2.5-7b-instruct |
| **Custom**            | Compatible | Any OpenAI-compatible API                             | (Enter your own URL)                                               |

**How it works:**

1. Select a provider from the dropdown
2. For **Google Gemini**: Native API integration (no URL needed)
3. For **OpenAI-Compatible**: API URL is automatically set
4. Common models are shown immediately (no API key needed yet)
5. When you add an API key, the full list of available models is fetched (OpenAI-compatible only; Gemini shows fixed list)

### 3. Custom API URL (Custom Provider Only)

When you select "Custom" as your provider:

```
┌──────────────────────────────────────┐
│ Custom API URL                       │
│ ┌──────────────────────────────────┐ │
│ │ http://localhost:1234/v1         │ │
│ └──────────────────────────────────┘ │
│ Enter the base URL for your         │
│ OpenAI-compatible API               │
└──────────────────────────────────────┘
```

**Examples:**

- Local server: `http://localhost:1234/v1`
- Custom deployment: `https://api.example.com/v1`
- Alternative provider: `https://custom-ai-service.com/v1`

**Note:** The URL should end with `/v1` or `/api/v1` (the application handles path appending automatically).

### 4. API Key Input

Password field with show/hide toggle:

```
┌──────────────────────────────────────┐
│ API Key               👁            │
│ ┌──────────────────────────────────┐ │
│ │ ••••••••••••••••••••••••••••••   │ │
│ └──────────────────────────────────┘ │
│ Get from your AI provider           │
│ (required for model fetching)       │
└──────────────────────────────────────┘
```

**Key Features:**

- Password field (hidden by default)
- Click eye icon to toggle visibility
- Required for fetching available models from API
- Automatically saved to localStorage (see [Data Persistence](#data-persistence))

### 5. Model Selection

**Dropdown Mode** (when models are available):

```
┌──────────────────────────────────────┐
│ Model                                │
│ ┌──────────────────────────────────┐ │
│ │ google/gemini-2.0-flash-exp     ▼│ │
│ └──────────────────────────────────┘ │
│ ✓ 330 models loaded from API        │
└──────────────────────────────────────┘
```

**Text Input Mode** (when no models available):

```
┌──────────────────────────────────────┐
│ Model                                │
│ ┌──────────────────────────────────┐ │
│ │                                  │ │
│ └──────────────────────────────────┘ │
│ Enter API key to load available     │
│ models                              │
└──────────────────────────────────────┘
```

**Model Loading States:**

1. **Common Models (No API Key)**: Shows dropdown with provider's common models
   - Example: "Showing common OpenAI models - enter API key to fetch all available models"
2. **Loading**: Shows spinner while fetching models
   - "Fetching models from API..."
3. **Loaded**: Shows dropdown with all available models from API
   - "✓ 330 models loaded from API"
4. **Error**: Falls back to text input if fetch fails
   - "✗ Failed to fetch models from API"
   - "Enter model name manually"

### 6. Job Description

Large textarea for context input:

```
┌──────────────────────────────────────┐
│ Job Description                      │
│ ┌──────────────────────────────────┐ │
│ │ Paste the job description here   │ │
│ │ to tailor your resume and cover  │ │
│ │ letter...                        │ │
│ │                                  │ │
│ │                                  │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

**Usage:**

- Paste the full job posting you're applying to
- Used for generating tailored cover letters
- Automatically saved to localStorage
- Pre-filled on subsequent visits

## Provider Setup Guides

### Google Gemini (Native) ⭐ Recommended

**Recommended for:** Everyone! Free tier, high quality, no credit card required

**Why Choose Gemini:**

- ✅ **Free tier** with generous limits (15 requests/min, 1M tokens/day)
- ✅ **No credit card required** to start
- ✅ **High quality** - Excellent for professional writing
- ✅ **Thinking mode** - Gemini 2.5 models use internal reasoning for better results
- ✅ **Native integration** - Direct API, no intermediaries
- ✅ **Optimized** - Automatic handling of thinking mode token consumption

**Setup Steps:**

1. Visit https://aistudio.google.com/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key (starts with `AIza...`)
5. In the application:
   - Provider: **Google Gemini**
   - API Key: Paste your key
   - Model: **gemini-2.5-flash** (recommended) or choose another

**Available Models:**

- `gemini-2.5-flash` - **Recommended** - Fast, high-quality, thinking mode
- `gemini-2.5-pro` - Most capable, deeper reasoning
- `gemini-1.5-flash` - Fast and efficient (no thinking mode)
- `gemini-1.5-pro` - Previous generation, still very capable

**Features:**

- 🚀 **Streaming**: Real-time content generation
- 🔄 **Auto-retry**: Handles temporary 503/429 errors
- 📊 **Smart tokens**: Optimized limits (4096-8192) for complete responses
- ✨ **Thinking mode**: Better quality through internal reasoning

**Cost:** Free tier is very generous. See https://ai.google.dev/pricing for paid tiers.

---

### OpenAI

**Recommended for:** Users who want the most reliable, high-quality results

**Setup Steps:**

1. Visit https://platform.openai.com/api-keys
2. Sign up or log in
3. Click "Create new secret key"
4. Copy the key (starts with `sk-proj-...`)
5. In the application:
   - Provider: **OpenAI**
   - API Key: Paste your key
   - Model: Auto-selected `gpt-4o-mini` (or choose another)

**Cost:** ~$0.01-0.03 per cover letter generation

### OpenRouter

**Recommended for:** Users who want access to multiple AI providers (Claude, alternative models) with one API key

**Note:** For Gemini models, use the native **Google Gemini** provider above instead for better performance and features.

**Setup Steps:**

1. Visit https://openrouter.ai
2. Sign up with Google, GitHub, or email
3. Go to https://openrouter.ai/keys
4. Click "Create Key"
5. Copy the key (starts with `sk-or-v1-...`)
6. In the application:
   - Provider: **OpenRouter**
   - API Key: Paste your key
   - Model: Choose from 100+ models (e.g., `google/gemini-2.0-flash-exp`)

**Benefits:**

- ✅ Access to Gemini (free tier available!)
- ✅ Access to Claude (Anthropic's models)
- ✅ Access to GPT-4 and GPT-3.5
- ✅ Access to open source models (Llama, DeepSeek, etc.)
- ✅ Pay-per-use, no monthly minimums
- ✅ Free trial credits

**Popular Models via OpenRouter:**

- `google/gemini-2.0-flash-exp` - Google's latest (free!)
- `google/gemini-2.0-flash-thinking-exp:free` - Thinking mode (free!)
- `anthropic/claude-3.5-sonnet` - Best overall quality
- `openai/gpt-4o-mini` - Cost-effective OpenAI
- `deepseek/deepseek-r1` - Reasoning model

**Cost:** Variable by model, many free options available

### xAI (Grok)

**Recommended for:** Users who want to use Elon Musk's Grok models

**Setup Steps:**

1. Visit https://console.x.ai
2. Sign up and create API key
3. Copy the key (starts with `xai-...`)
4. In the application:
   - Provider: **xAI (Grok)**
   - API Key: Paste your key
   - Model: `grok-beta` or `grok-vision-beta`

**Cost:** Check xAI pricing

### Local (LM Studio)

**Recommended for:** Users who want full privacy and no API costs

**Setup Steps:**

1. **Install LM Studio**
   - Download from https://lmstudio.ai
   - Install and launch the application

2. **Download a Model**
   - Browse models in LM Studio
   - Recommended: `meta-llama-3.1-8b-instruct` (good balance of quality/speed)
   - Click download and wait for completion

3. **Start the Server**
   - Click "Local Server" tab in LM Studio
   - Select your downloaded model
   - Click "Start Server"
   - Note the port (usually `1234`)

4. **Configure in Application**
   - Provider: **Local (LM Studio)**
   - API Key: `lm-studio` (or leave blank if none required)
   - Model: Your model name (e.g., `llama-3.1-8b-instruct`)

**Benefits:**

- ✅ No API costs
- ✅ Complete data privacy
- ✅ Works offline
- ✅ No rate limits

**Requirements:**

- ⚠️ 8GB+ RAM (16GB+ recommended)
- ⚠️ GPU recommended (but not required)
- ⚠️ Slower generation than cloud APIs

### Custom Provider

**Recommended for:** Advanced users with custom OpenAI-compatible deployments

**Setup Steps:**

1. Select **Custom** from provider dropdown
2. Enter your API base URL (must end with `/v1` or `/api/v1`)
3. Enter your API key
4. Enter model name manually (or wait for auto-fetch if supported)

**Examples:**

- Self-hosted: `https://my-ai.example.com/v1`
- Alternative provider: `https://api.alternative-ai.com/v1`
- Local custom: `http://192.168.1.100:8000/v1`

## How Auto-Fetch Works

The application automatically fetches available models from your API provider using the standard OpenAI `/v1/models` endpoint.

**Flow:**

1. You select a provider and enter an API key
2. Application calls `GET {baseURL}/models` with your API key
3. Receives list of available models
4. Populates the model dropdown
5. Auto-selects the first model (if none selected)

**Debouncing:** Model fetching is debounced by 500ms to avoid excessive API calls while typing.

**Timeout:** Model fetch has a 10-second timeout to prevent hanging.

**Fallback:** If model fetching fails:

- Shows common models for the provider (if preset)
- Falls back to text input for manual entry (if custom)

**OpenRouter Special Handling:** OpenRouter requires additional headers:

```
HTTP-Referer: https://github.com/ismail-kattakath/jsonresume-to-everything
X-Title: JSON Resume to Everything
```

## Data Persistence

### What Gets Saved

**Always Saved (localStorage):**

- ✅ API URL
- ✅ API Key
- ✅ Selected Model
- ✅ Remember Credentials setting
- ✅ Last Job Description

**Storage Key:** `ai_cover_letter_credentials`

**Format:**

```json
{
  "apiUrl": "https://openrouter.ai/api/v1",
  "apiKey": "sk-or-v1-...",
  "model": "google/gemini-2.0-flash-exp",
  "rememberCredentials": true,
  "lastJobDescription": "We are seeking a Senior Software Engineer..."
}
```

### Privacy & Security

**Where Data is Stored:**

- 📍 Browser's `localStorage` (client-side only)
- 🚫 Never sent to the portfolio website server
- 🚫 Never shared with third parties
- ✅ Only sent to your configured AI provider

**Security Considerations:**

- ⚠️ Stored in **plain text** (localStorage limitation)
- 🔒 **Only use on trusted devices**
- 🔑 **Treat API keys like passwords**
- 💡 **Recommendation**: Use API keys with spending limits
- 🗑️ **Clear when done**: Clear browser data on shared computers

### Clearing Saved Data

**Method 1: Browser Settings**

- Chrome/Edge: Settings → Privacy → Clear browsing data → Cookies and site data
- Firefox: Settings → Privacy → Clear Data → Cookies and Site Data
- Safari: Settings → Privacy → Manage Website Data

**Method 2: Developer Console**

```javascript
localStorage.removeItem('ai_cover_letter_credentials')
```

**Method 3: Uncheck "Remember Credentials"**

- Uncheck the box and generate content again
- Credentials will be cleared, but job description remains

## Troubleshooting

### Provider Won't Connect

**Symptoms:**

- Connection status shows "✗ Connection failed"
- Models won't load

**Solutions:**

1. **Check API Key** - Verify you copied the full key
2. **Check Provider** - Ensure provider matches your key (e.g., OpenRouter key needs OpenRouter provider)
3. **Check URL** - Verify the base URL is correct
4. **Test API** - Use curl to test the API independently:
   ```bash
   curl https://openrouter.ai/api/v1/models \
     -H "Authorization: Bearer YOUR_KEY"
   ```

### Models Won't Load

**Symptoms:**

- "✗ Failed to fetch models from API"
- "No models found"

**Solutions:**

1. **Wait for Connection** - Give it a few seconds to fetch
2. **Check API Key** - Model fetching requires a valid key
3. **Manual Entry** - Type model name manually if auto-fetch fails
4. **Provider Issue** - Some providers don't support `/v1/models` endpoint
5. **Use Common Models** - Preset providers show common models without API key

### Provider Mismatch

**Symptoms:**

- Connection Status shows different provider than selected
- Example: "Active Provider: OpenAI (OpenRouter)"

**Solutions:**

- This is temporary - the UI auto-syncs within seconds
- If it persists, refresh the page
- Clear localStorage and reconfigure

### Local Server (LM Studio) Not Working

**Symptoms:**

- "Unable to connect to AI server"
- CORS errors in console

**Solutions:**

1. **Verify Server Running** - Check LM Studio server is started
2. **Check URL** - Use `http://localhost:1234/v1` (note the `/v1`)
3. **Enable CORS** - In LM Studio: Settings → Server → Enable CORS
4. **Firewall** - Allow port 1234 through firewall
5. **Try IP Address** - Use `http://127.0.0.1:1234/v1` instead of localhost

### Generation Takes Too Long

**For Cloud APIs:**

- Most models respond in 3-10 seconds
- If longer, check your API provider's status page
- Try a faster model (e.g., `gpt-4o-mini` instead of `gpt-4`)

**For Local Servers:**

- Generation time depends on hardware
- GPU: 10-30 seconds typical
- CPU only: 1-5 minutes possible
- Use smaller models for faster results
- Consider quantized models (Q4, Q5) for speed

## Best Practices

### API Key Management

✅ **Do:**

- Use API keys with spending limits
- Rotate keys periodically
- Use different keys for different applications
- Monitor usage in your provider's dashboard

❌ **Don't:**

- Share API keys publicly
- Commit keys to git repositories
- Use production keys for testing
- Leave keys on shared/public computers

### Cost Optimization

**For OpenAI:**

- Start with `gpt-4o-mini` (~$0.01 per generation)
- Only use `gpt-4` if you need highest quality
- Monitor usage at https://platform.openai.com/usage

**For OpenRouter:**

- Use free models first (Gemini, some Llama models)
- Compare costs at https://openrouter.ai/models
- Set spending limits in your account

**For Local:**

- Free but requires hardware
- Smaller models = faster + less RAM
- Quantized models = quality/speed tradeoff

### Model Selection

**Best for Quality:**

- `openai/gpt-4o` (via OpenAI or OpenRouter)
- `anthropic/claude-3.5-sonnet` (via OpenRouter)
- `google/gemini-1.5-pro` (via OpenRouter)

**Best for Cost:**

- `google/gemini-2.0-flash-exp` (free via OpenRouter!)
- `openai/gpt-4o-mini` (cheap via OpenAI or OpenRouter)
- Local models (free but slower)

**Best for Privacy:**

- Local LM Studio models
- Self-hosted deployments

## Advanced Configuration

### Using Multiple Providers

You can switch providers anytime:

1. Select new provider from dropdown
2. Enter corresponding API key
3. New models auto-load
4. Previous provider's settings remain saved

**Example Workflow:**

- Use OpenRouter for Gemini (free tier)
- Switch to OpenAI for GPT-4 (higher quality)
- Switch to Local for sensitive content (privacy)

### Provider-Specific Tips

**OpenAI:**

- Best documentation and support
- Most reliable API uptime
- Highest quality models
- Premium pricing

**OpenRouter:**

- Best for trying different models
- Many free options
- Single API key for everything
- Slight latency overhead (proxy)

**xAI (Grok):**

- Latest tech from xAI
- Good for conversational content
- Still in beta

**Local (LM Studio):**

- Best for privacy-sensitive content
- No internet required
- Requires powerful hardware
- Slower than cloud APIs

### Custom Model Parameters

The application uses these default parameters:

```json
{
  "temperature": 0.7,
  "max_tokens": 800,
  "top_p": 0.9,
  "stream": true
}
```

**To customize:** Modify `src/lib/ai/openai-client.ts`

## Integration with Other Features

### Resume Builder

AI Configuration in Settings → Used for:

- Generating professional summaries
- Tailoring work experience descriptions
- Creating skill highlights

### Cover Letter Editor

Shares same configuration for:

- Generating complete cover letters
- Customizing content for specific jobs

### Future Integrations

Planned uses for AI configuration:

- LinkedIn profile optimization
- Email introduction templates
- Project description generation
- Achievement highlighting

## FAQ

**Q: Do I need an API key to use this feature?**
A: Yes, you need an API key from an AI provider (OpenAI, OpenRouter, etc.) or a local AI server.

**Q: Which provider should I choose?**
A: For beginners, we recommend OpenRouter (access to Gemini, Claude, GPT with one key). For best quality, use OpenAI. For privacy, use Local LM Studio.

**Q: Are there free options?**
A: Yes! OpenRouter offers several free models including Google Gemini. Local LM Studio is also free but requires powerful hardware.

**Q: Is my API key safe?**
A: Your API key is stored only in your browser's localStorage and never sent to our servers. However, localStorage is plain text, so only use on trusted devices.

**Q: Can I use multiple providers?**
A: Yes! Switch providers anytime from the dropdown. Your settings for each provider are saved.

**Q: Why can't I see my model in the dropdown?**
A: Enter your API key first - models auto-load after you provide valid credentials. If it still doesn't appear, you can type it manually.

**Q: Does this work offline?**
A: Only if you're using a local AI server (LM Studio). Cloud providers (OpenAI, OpenRouter) require internet.

**Q: How much does it cost?**
A: Varies by provider. OpenAI: ~$0.01-0.03 per generation. OpenRouter: Many free options available. Local: Free but requires hardware.

**Q: Can I use this for other languages?**
A: Yes! The AI understands and generates in multiple languages. Just provide your job description in your preferred language.

**Q: What if generation fails?**
A: Check your API key, ensure you have credits/quota, verify the model name is correct, and check your internet connection. See [Troubleshooting](#troubleshooting) for details.

## Related Documentation

- [AI Content Generator](./AI_CONTENT_GENERATOR.md) - How AI generation works (cover letters, summaries, prompts)
- [Password Protection](./PASSWORD_PROTECTION_SETUP.md) - Securing your resume builder
- [Architecture](../ARCHITECTURE.md) - Technical implementation details

## Support

For issues or questions:

1. Check [Troubleshooting](#troubleshooting) section above
2. Review console for errors (F12 → Console)
3. Verify your provider's status page
4. Test API with curl independently
5. Open issue on GitHub: https://github.com/ismail-kattakath/jsonresume-to-everything/issues

## Credits

- **Provider System**: Multi-provider architecture with auto-detection
- **OpenRouter**: Unified access to 100+ AI models
- **OpenAI**: Industry-standard API format
- **Lucide React**: Icons
- **React Context**: State management
