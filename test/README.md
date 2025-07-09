# Firebase AI Logic Plugin - Test Suite

This directory contains tests for the Firebase AI Logic Genkit plugin. The tests verify plugin APIs, error handling, and integration with Firebase AI Logic services.

## 📁 Test Files

### `test-plugin.ts` - Comprehensive TypeScript Test Suite
**Purpose:** Test suite covering most of the plugin functionality  
**Language:** TypeScript with full type safety  

### `simple-test.cjs` - Quick JavaScript Tests
**Purpose:** Simplified tests that can run without TypeScript compilation  
**Language:** CommonJS JavaScript  

## 🚀 Quick Start

### 1. Environment Setup

Create a `.env` file in your project root:

```bash
# Copy the example file
cp .env.example .env
```

Add your Firebase configuration to `.env`:

```env
# Firebase Configuration
FIREBASE_API_KEY=your_api_key_here
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_MEASUREMENT_ID=your_measurement_id

### 2. Install Dependencies

```bash
# Install all dependencies including dotenv
npm install

# Build TypeScript
npm run build
```

### 3. Run Tests

```bash
# Quick JavaScript testsß
npm run test:js   # JavaScript tests
npm run test      # TypeScript tests
```

## 🔧 Configuration Options

### Backend Testing

Both test files support multiple backends:

```typescript
// Vertex AI Backend (Enterprise)
{
  backend: 'vertexAI',
  vertexAIRegion: 'us-central1'
}

// Google AI Backend (Developer API)  
{
  backend: 'googleAI'
}
```

## 📊 Expected Results

### Successful Run
```
🚀 Firebase AI Logic Plugin - Test Suite
===============================================
📅 Started at: 2025-01-08T10:30:00.000Z
🔧 Node.js version: v18.17.0
🌐 Environment: development
🔥 Firebase Project: your-project-id
🤖 Test Model: gemini-2.5-flash

🧪 Running: Basic Text Generation...
✅ Basic Text Generation with Vertex AI:
📝 Response: Algorithms learn and think,
Helping humans solve complex tasks,
Future partnership.
📊 Usage: { inputTokens: 12, outputTokens: 28, totalTokens: 40 }

... [more tests] ...

📊 FINAL RESULTS
================
Total: 9
✅ Passed: 9
❌ Failed: 0
📈 Success Rate: 100.0%

🎉 All tests passed! Your Firebase AI Logic plugin is working correctly.
```

### Common Issues and Solutions

#### Missing Environment Variables
```
❌ Error: Missing required environment variable: FIREBASE_API_KEY
```
**Solution:** Check your `.env` file and ensure all required variables are set.

#### Model Not Available
```
❌ NOT_FOUND: Model 'gemini-2.3-flash' not found
```
**Solutions:**
- Try a different model: `gemini-2.5-flash`
- Check if model is available in your region

#### API Quota Exceeded
```
❌ RESOURCE_EXHAUSTED: Quota exceeded
```
**Solutions:**
- Wait for quota reset
- Consider upgrading your Firebase plan

#### Network Connectivity
```
❌ UNAVAILABLE: DNS resolution failed
```
**Solutions:**
- Check internet connection
- Verify Firebase project is active
- Try different network or VPN

## 🔍 Debugging

### Environment Debugging

Verify environment variables:

```bash
# Check if dotenv is loading
node -e "require('dotenv/config'); console.log(process.env.FIREBASE_PROJECT_ID)"

# List all Firebase env vars
node -e "require('dotenv/config'); console.log(Object.keys(process.env).filter(k => k.startsWith('FIREBASE')))"
```

## 🔒 Security Best Practices

- **Never commit `.env` files** - Add to `.gitignore`
- **Monitor API usage** in Firebase AI Monitoring console

## 🆘 Getting Help

- **Check the main README** for plugin documentation
- **Review Firebase AI Logic docs** at https://firebase.google.com/docs/ai-logic
- **Check Genkit documentation** at https://firebase.google.com/docs/genkit
- **Test with Google AI Studio** at https://aistudio.google.com
