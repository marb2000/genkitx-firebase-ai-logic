# Firebase AI Logic Plugin - Test Suite

This directory contains comprehensive tests for the Firebase AI Logic Genkit plugin. The tests verify all plugin APIs, error handling, and integration with Firebase AI Logic services.

## 📁 Test Files

### `test-plugin.ts` - Comprehensive TypeScript Test Suite
**Purpose:** Full-featured test suite covering all plugin functionality  
**Language:** TypeScript  
**Features:** 
- 12 comprehensive test categories
- Type safety validation
- Performance metrics
- Detailed error reporting
- Support for both Vertex AI and Google AI backends

**Run with:**
```bash
npm test                    # Full test suite
npm run test:basic         # Basic generation only
npm run test:json          # JSON output only
npm run test:functions     # Function calling only
```

### `simple-test.js` - Quick JavaScript Tests
**Purpose:** Simplified tests that can run without TypeScript compilation  
**Language:** JavaScript  
**Features:**
- 7 essential test categories
- Quick setup and execution
- Easy to modify and debug
- Minimal dependencies

**Run with:**
```bash
node test/simple-test.js   # After npm run build
```

### `smoke-test.js` - Plugin Structure Validation
**Purpose:** Verify plugin structure without making API calls  
**Language:** JavaScript  
**Features:**
- No Firebase configuration required
- Tests plugin exports and structure
- Validates TypeScript compilation
- Quick sanity check

**Run with:**
```bash
node test/smoke-test.js    # No build required
```

## 🚀 Quick Start

### 1. First Time Setup

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run smoke test (no Firebase needed)
node test/smoke-test.js
```

### 2. Configure Firebase

Edit the test files and update your Firebase configuration:

```javascript
const FIREBASE_CONFIG = {
  apiKey: "your-api-key-here",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
  measurementId: "G-XXXXXXXXXX" // Optional
};
```

### 3. Run Tests

```bash
# Quick test (JavaScript)
npm run build && node test/simple-test.js

# Full test suite (TypeScript)
npm test

# Individual test categories
npm run test:json
npm run test:functions
npm run test:multimodal
```

## 📋 Test Categories

| Test Category | TypeScript | JavaScript | Description |
|---------------|------------|------------|-------------|
| **Basic Generation** | ✅ | ✅ | Simple text generation with different backends |
| **Type-Safe References** | ✅ | ❌ | `firebaseAILogic.model()` helper function |
| **System Instructions** | ✅ | ✅ | String and content-based system instructions |
| **Safety Settings** | ✅ | ❌ | Harm categories and thresholds |
| **JSON Output** | ✅ | ✅ | Structured output with JSON schemas |
| **Function Calling** | ✅ | ✅ | Tool/function calling capabilities |
| **Multimodal Input** | ✅ | ❌ | Image and media input processing |
| **Multi-turn Chat** | ✅ | ✅ | Conversation history management |
| **Advanced Config** | ✅ | ❌ | Temperature, topK, topP, stopSequences |
| **Error Handling** | ✅ | ✅ | Invalid models, quotas, safety blocks |
| **All Models** | ✅ | ❌ | Test all supported model variants |
| **Performance** | ✅ | ✅ | Response times and token usage |

## 🔧 Configuration Options

### Backend Testing

Test both backends by updating the configuration:

```javascript
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

### Test Customization

Modify test parameters in the files:

```javascript
// Adjust rate limiting
await delay(2000); // 2 second delay between tests

// Modify generation config
defaultGenerationConfig: {
  temperature: 0.7,
  maxOutputTokens: 1000,
  topK: 40,
  topP: 0.95
}

// Change models to test
const models = ['gemini-2.5-flash', 'gemini-1.5-pro'];
```

## 📊 Expected Results

### Successful Run
```
🚀 Firebase AI Logic Plugin - Quick Test Suite
==============================================
📅 Started: 1/8/2025, 10:30:00 AM

🔄 Running Basic Generation...
✅ Success!
📝 Response: Algorithms learn and think,
Helping humans solve complex tasks,
Future partnership.
📊 Usage: { inputTokens: 12, outputTokens: 28, totalTokens: 40 }
✅ Basic Generation PASSED

... [more tests] ...

📊 FINAL RESULTS
================
Total: 7
✅ Passed: 7
❌ Failed: 0
📈 Success Rate: 100.0%

🎉 All tests passed! Your plugin is working correctly.
```

### Common Errors

#### Permission Denied
```
❌ Failed: Consumer 'projects/123456789' has been suspended.
```
**Fix:** Enable Firebase AI Logic and set up billing

#### Quota Exceeded
```
❌ Failed: Quota exceeded for requests per minute
```
**Fix:** Reduce test frequency or upgrade quotas

#### Model Not Found
```
❌ Failed: Model 'gemini-xxx' not found
```
**Fix:** Check model availability in your region

## 🐛 Debugging

### Verbose Logging

Add debug logging to see detailed requests/responses:

```javascript
// Enable debug mode
console.log('Request:', JSON.stringify(request, null, 2));
console.log('Response:', JSON.stringify(response, null, 2));
```

### Manual Testing

Run individual tests for debugging:

```javascript
// In Node.js REPL
const { testBasic } = require('./test/simple-test.js');
await testBasic();
```

### Network Issues

Check your network and Firebase connectivity:

```bash
# Test Firebase connectivity
curl -I https://firebase.googleapis.com/

# Check DNS resolution
nslookup firebasevertexai.googleapis.com
```

## 🔄 Continuous Integration

### GitHub Actions

```yaml
name: Test Plugin
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - run: node test/smoke-test.js
      - run: npm test
        env:
          FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
          FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
```

### Local Development

```bash
# Watch mode - rerun tests on changes
npm run test:watch

# Quick iteration cycle
npm run build && node test/simple-test.js
```

## 📚 Adding New Tests

When adding new features:

1. **Add to TypeScript suite** (`test-plugin.ts`)
2. **Add to JavaScript suite** (`simple-test.js`) if essential
3. **Update test documentation**
4. **Include both success and failure cases**
5. **Add performance benchmarks if applicable**

### Test Template

```javascript
async function testNewFeature() {
  console.log('\n🧪 Testing New Feature...');
  try {
    const result = await ai.generate({
      model: 'firebase-ai-logic/gemini-2.5-flash',
      // ... your test configuration
    });
    
    console.log('✅ Success!');
    console.log('📝 Response:', result.text);
    console.log('📊 Usage:', result.usage);
    return true;
  } catch (error) {
    console.log('❌ Failed:', error.message);
    return false;
  }
}
```

## 🆘 Getting Help

1. **Check the main README** for plugin documentation
2. **Review Firebase AI Logic docs** at https://firebase.google.com/docs/ai-logic
3. **Check Genkit documentation** at https://genkit.dev/docs
4. **File issues** with complete test output and configuration
5. **Join the community** for support and discussions

## 📈 Performance Benchmarks

Typical performance on Vertex AI (`us-central1`):

| Test Type | Avg Response Time | Token Usage | Success Rate |
|-----------|------------------|-------------|--------------|
| Basic Text | 800-1200ms | 15-30 tokens | 99%+ |
| JSON Output | 1000-1500ms | 20-50 tokens | 95%+ |
| Function Calling | 1200-2000ms | 25-60 tokens | 90%+ |
| Multimodal | 2000-3000ms | 30-80 tokens | 85%+ |

*Benchmarks may vary based on region, model, and current service load.*