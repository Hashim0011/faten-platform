#!/bin/bash
# Clean AI references from file contents

# Clean .env.example
if [ -f .env.example ]; then
  sed -i '/VITE_GEMINI_API_KEY/d' .env.example
  sed -i '/VITE_ANTHROPIC_API_KEY/d' .env.example
  sed -i '/VITE_N8N_WEBHOOK_URL/d' .env.example
  sed -i '/Google Gemini/d' .env.example
  sed -i '/Anthropic Claude/d' .env.example
  sed -i '/n8n Webhook/d' .env.example
  sed -i '/AI Chatbot/d' .env.example
  sed -i '/chatbot/d' .env.example
  sed -i '/CHATBOT_SETUP_GUIDE/d' .env.example
fi

# Clean aiService.ts
if [ -f src/lib/aiService.ts ]; then
  sed -i 's/AI Chatbot Service/Chat Assistant Service/g' src/lib/aiService.ts
  sed -i 's/Google Gemini/generative model/g' src/lib/aiService.ts
  sed -i 's/Gemini/the model/g' src/lib/aiService.ts
  sed -i 's/Google Gemini API key/Chat API key/g' src/lib/aiService.ts
fi

# Clean documentation files
for file in *.md; do
  if [ -f "$file" ]; then
    sed -i '/Claude Code Assistant/d' "$file"
    sed -i '/Generated with.*Claude/d' "$file"
    sed -i '/Co-Authored-By: Claude/d' "$file"
    sed -i 's/n8n webhook/email service/g' "$file"
  fi
done

# Clean src/lib/README.md
if [ -f src/lib/README.md ]; then
  sed -i '/n8n Webhook/d' src/lib/README.md
fi

echo "Content cleaned"
