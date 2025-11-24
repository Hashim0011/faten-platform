# Faten AI Chatbot - Setup Guide

## Overview

The Faten platform now includes a **direct AI chatbot integration** powered by **Anthropic's Claude API**. This replaces the previous n8n webhook approach, making the chatbot:

- ✅ **Faster** - Direct API calls without external webhooks
- ✅ **Simpler** - No need to set up n8n workflows
- ✅ **More Reliable** - Fewer points of failure
- ✅ **Easier to Maintain** - All code in one place
- ✅ **Cost-Effective** - Pay only for API usage

---

## Quick Start

### 1. Get Your Anthropic API Key

1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Create an account or sign in
3. Navigate to **API Keys** section
4. Click **Create Key**
5. Copy your API key (starts with `sk-ant-api03-...`)

### 2. Configure Environment Variables

1. Open your `.env` file (or create one from `.env.example`)
2. Add your API key:

```env
VITE_ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here
```

3. Save the file

### 3. Run the Application

```bash
npm run dev
```

That's it! The AI chatbot is now ready to use.

---

## Architecture

### File Structure

```
src/
├── lib/
│   └── aiService.ts          # Main AI service with Claude API integration
├── components/
│   └── AiChatModal.tsx       # Chat UI component
└── pages/
    ├── Dashboard.tsx         # User dashboard (includes chat)
    ├── ExpertDashboard.tsx   # Expert dashboard (includes chat)
    └── AdminDashboard.tsx    # Admin dashboard (includes chat)
```

### How It Works

```
┌─────────────┐
│   User      │
│  Types      │
│  Message    │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  AiChatModal.tsx    │
│  - Validates input  │
│  - Shows UI         │
│  - Manages state    │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  aiService.ts       │
│  - Builds prompt    │
│  - Calls Claude API │
│  - Handles errors   │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Anthropic API      │
│  (Claude 3.5 Sonnet)│
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│   AI Response       │
│  (Arabic text)      │
└─────────────────────┘
```

---

## AI System Prompt

The chatbot is configured with a comprehensive system prompt that defines:

### Identity
- Name: **فطن** (Faten)
- Role: Educational assistant for the Faten platform
- Purpose: Intellectual awareness and knowledge enrichment

### Language Rules
- **Only responds in Modern Standard Arabic (العربية الفصحى المبسّطة)**
- Clear, accessible, and educational tone
- Saudi cultural context awareness

### Allowed Topics
✅ Platform features and navigation
✅ Educational content (science, history, culture, etc.)
✅ Critical thinking and media literacy
✅ Islamic knowledge (educational perspective)
✅ Saudi heritage and Arabian culture
✅ Career guidance and skills development

### Forbidden Topics
❌ Political content and debates
❌ Religious extremism
❌ Hate speech or discrimination
❌ Violence or illegal activities
❌ Medical or legal advice (refers to professionals)

### Key Features
- **User Context**: Uses user name, email, and ID for personalization
- **Conversation History**: Remembers last 10 messages for context
- **Platform Awareness**: Guides users to relevant sections (content, discussions, events)
- **Expert Referral**: Encourages booking expert discussions for complex topics
- **Safety First**: Refuses inappropriate requests politely

---

## Usage in Code

### Basic Example

```typescript
import { sendChatMessage } from '../lib/aiService';

const result = await sendChatMessage({
  message: 'ما هي منصة فطن؟',
  userContext: {
    userId: 'user-123',
    userEmail: 'user@example.com',
    userName: 'أحمد محمد'
  },
  conversationHistory: [] // Optional: previous messages
});

if (result.success) {
  console.log(result.response); // AI response in Arabic
} else {
  console.error(result.error); // Error message in Arabic
}
```

### Message Validation

```typescript
import { validateChatMessage } from '../lib/aiService';

const validation = validateChatMessage(userInput);

if (!validation.valid) {
  alert(validation.error); // "الرجاء إدخال رسالة" or "الرسالة طويلة جداً"
}
```

---

## Features & Improvements

### Compared to n8n Webhook Approach

| Feature | n8n Webhook (Old) | Direct Claude API (New) |
|---------|-------------------|-------------------------|
| Setup Complexity | High (external service) | Low (just API key) |
| Response Time | Slower (2+ hops) | Faster (1 hop) |
| Reliability | Medium (depends on n8n) | High (direct API) |
| Debugging | Difficult (external logs) | Easy (local logs) |
| Cost | n8n + API | API only |
| Maintenance | Complex | Simple |
| Conversation Context | Limited | Full (10 messages) |
| User Personalization | Basic | Advanced (name, email, etc.) |

### New Capabilities

1. **Conversation Memory**: Remembers last 10 messages for context
2. **User Personalization**: Greets users by name
3. **Platform Integration**: Knows about content, discussions, events
4. **Smart Referrals**: Suggests expert discussions when appropriate
5. **Validation**: Checks message length and content before sending
6. **Better Error Handling**: Specific Arabic error messages

---

## Configuration

### Environment Variables

```env
# Required
VITE_ANTHROPIC_API_KEY=sk-ant-api03-...

# Optional (defaults shown)
# VITE_AI_MODEL=claude-3-5-sonnet-20241022
# VITE_AI_MAX_TOKENS=1024
```

### Customization

#### Change AI Model

Edit `src/lib/aiService.ts`:

```typescript
const response = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022', // Change here
  max_tokens: 1024,
  // ...
});
```

Available models:
- `claude-3-5-sonnet-20241022` (recommended - balanced)
- `claude-3-opus-20240229` (most capable - slower/expensive)
- `claude-3-haiku-20240307` (fastest - less capable)

#### Adjust Response Length

```typescript
max_tokens: 1024 // Increase for longer responses (costs more)
```

#### Modify System Prompt

Edit the `FATEN_SYSTEM_PROMPT` constant in `src/lib/aiService.ts`.

---

## Security Considerations

### ⚠️ Important: API Key Security

**Current Implementation:**
```typescript
dangerouslyAllowBrowser: true
```

This allows the API key to be used in the browser, which means:
- ✅ Easy to set up and test
- ❌ API key is exposed in network requests
- ❌ Users could potentially extract and misuse the key

### 🔒 Production Recommendation

For production deployments, **create a backend proxy**:

```
Frontend → Your Backend → Anthropic API
```

**Benefits:**
- ✅ API key stays server-side (secure)
- ✅ You can implement rate limiting
- ✅ You can log/monitor usage
- ✅ You can add authentication
- ✅ You can cache responses

**Example Backend (Node.js/Express):**

```javascript
// backend/routes/chat.js
const Anthropic = require('@anthropic-ai/sdk');

router.post('/api/chat', authenticate, async (req, res) => {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY // Server-side only
  });

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    messages: req.body.messages,
    system: FATEN_SYSTEM_PROMPT
  });

  res.json({ response: response.content[0].text });
});
```

Then update `aiService.ts`:

```typescript
// Instead of calling Anthropic directly
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages })
});
```

---

## Troubleshooting

### Error: "API key not configured"

**Solution:** Make sure `VITE_ANTHROPIC_API_KEY` is set in your `.env` file.

```bash
# Check if .env exists
ls -la .env

# Make sure it's loaded
npm run dev
```

### Error: "429 Too Many Requests"

**Solution:** You've hit the API rate limit. Wait a few minutes or upgrade your Anthropic plan.

### Error: "500 Server Error"

**Solution:** Anthropic's API is temporarily down. Check [status.anthropic.com](https://status.anthropic.com).

### Chat not opening

**Solution:**
1. Check browser console for errors
2. Verify you're logged in (chat requires authentication)
3. Check Supabase connection

### Response is in English

**Solution:** The system prompt enforces Arabic, but if you get English:
1. Check that `FATEN_SYSTEM_PROMPT` is loaded correctly
2. Make sure you're using the latest `aiService.ts`

---

## Cost Estimation

### Anthropic Pricing (as of 2024)

**Claude 3.5 Sonnet:**
- Input: $3 per million tokens (~750,000 words)
- Output: $15 per million tokens (~750,000 words)

### Typical Usage

- **Average message**: ~100 tokens input + ~300 tokens output
- **Cost per message**: ~$0.0048
- **1000 messages**: ~$4.80
- **10,000 messages**: ~$48

**Example:**
- 100 active users
- 10 messages per user per day
- 30 days per month
- = 30,000 messages/month = **~$144/month**

---

## Testing

### Manual Testing

1. Start the dev server: `npm run dev`
2. Log in to any dashboard (user/expert/admin)
3. Click the chat icon (brain icon) in the top right
4. Type a message in Arabic: `مرحباً، ما هي منصة فطن؟`
5. Verify you get an Arabic response

### Test Cases

```typescript
// Test 1: Platform question
"كيف أنشئ حساباً؟"
// Expected: Instructions in Arabic

// Test 2: Educational question
"ما هي أهمية القراءة؟"
// Expected: Educational response with platform references

// Test 3: Forbidden topic (political)
"ما رأيك في السياسة في [دولة]؟"
// Expected: Polite refusal with alternative suggestions

// Test 4: Long message (>2000 chars)
"[very long text...]"
// Expected: Validation error in Arabic

// Test 5: Empty message
""
// Expected: Validation error in Arabic

// Test 6: Conversation context
Message 1: "ما هي منصة فطن؟"
Message 2: "وكيف أستفيد منها؟" (referring to previous answer)
// Expected: Context-aware response
```

---

## Migration from n8n

If you're migrating from the old n8n webhook setup:

### Steps

1. ✅ Update `.env`:
   ```env
   # Remove or comment out
   # VITE_N8N_WEBHOOK_URL=...

   # Add
   VITE_ANTHROPIC_API_KEY=sk-ant-api03-...
   ```

2. ✅ Files are already updated:
   - `src/lib/aiService.ts` (new)
   - `src/components/AiChatModal.tsx` (updated)

3. ✅ Dependencies installed:
   ```bash
   npm install @anthropic-ai/sdk
   ```

4. ✅ Old n8n workflows can be deleted (optional)

### What Changed

- **Removed**: n8n webhook calls, complex response parsing
- **Added**: Direct Claude API integration, conversation history
- **Improved**: Response speed, reliability, user context

---

## Advanced Topics

### Streaming Responses (Future Enhancement)

For real-time streaming responses (like ChatGPT):

```typescript
const stream = await anthropic.messages.stream({
  model: 'claude-3-5-sonnet-20241022',
  messages: messages,
  system: enhancedSystemPrompt
});

for await (const chunk of stream) {
  if (chunk.type === 'content_block_delta') {
    // Update UI with partial response
    updateUI(chunk.delta.text);
  }
}
```

### Caching Responses

To reduce costs, cache common questions:

```typescript
const cache = new Map<string, string>();

export async function sendChatMessage(request: ChatRequest) {
  const cacheKey = `${request.message}-${request.userContext.userId}`;

  if (cache.has(cacheKey)) {
    return { success: true, response: cache.get(cacheKey) };
  }

  const result = await actualAICall(request);

  if (result.success) {
    cache.set(cacheKey, result.response);
  }

  return result;
}
```

### Analytics

Track chatbot usage:

```typescript
// In aiService.ts, after successful response
await supabase.from('chatbot_analytics').insert({
  user_id: request.userContext.userId,
  message_length: request.message.length,
  response_length: response.length,
  timestamp: new Date().toISOString()
});
```

---

## Support

### Documentation
- [Anthropic API Docs](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)
- [Claude Prompt Engineering](https://docs.anthropic.com/claude/docs/prompt-engineering)
- [Faten Platform Guide](./CLAUDE.md)

### Issues

If you encounter problems:
1. Check this guide
2. Review browser console logs
3. Check Anthropic API status
4. Contact development team

---

## Changelog

### v2.0 (Current) - Direct Claude API
- ✅ Direct Anthropic API integration
- ✅ Removed n8n dependency
- ✅ Added conversation history
- ✅ Added user context personalization
- ✅ Improved error handling
- ✅ Better validation
- ✅ Comprehensive system prompt

### v1.0 - n8n Webhook
- Basic chatbot via n8n webhook
- Limited context
- Complex setup

---

## License

This chatbot integration is part of the Faten platform project.

---

**Happy Chatting! 🤖 مرحباً بك في فطن**
