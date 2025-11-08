# DeepSeek AI Setup Guide

## Getting Your API Key

1. **Visit DeepSeek Platform**: Go to [https://platform.deepseek.com/](https://platform.deepseek.com/)

2. **Create Account**: Sign up for a free account if you don't have one

3. **Generate API Key**:
   - Go to the API Keys section in your dashboard
   - Click "Create new API key"
   - Copy the generated key (it will start with `sk-`)

4. **Configure in SpendFlow**:
   - Open your `.env.local` file in the project root
   - Replace the placeholder with your actual API key:
   ```
   NEXT_PUBLIC_DEEPSEEK_API_KEY=sk-your-actual-key-here
   ```

5. **Restart Development Server**:
   ```bash
   npm run dev
   ```

## API Key Format
Your API key should look like this: `sk-abc123def456...` (much longer than the placeholder)

## Troubleshooting
- If you see "AI service not available", check that your API key is correctly copied
- Make sure there are no extra spaces or quotes around the key
- Restart your development server after changing the .env.local file

## Features Available
Once configured, the AI assistant can:
- Analyze spending patterns
- Provide budget recommendations
- Predict financial trends
- Answer direct questions about your finances
- Give personalized savings advice
