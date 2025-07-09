# Firebase AI Logic Genkit Plugin

A Genkit plugin that integrates Firebase AI Logic.

## Installation

```bash
npm install genkitx-firebase-ai-logic firebase genkit
```

## Quick Start

### 1. Setup Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create/select project → Enable "Firebase AI Logic" 
3. Choose Gemini Developer API or/and Vertex AI backend

### 2. Environment Configuration

Create `.env` file:

```env
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

### 3. Initialize Plugin

```typescript
import { genkit } from 'genkit';
import { firebaseAILogic } from 'genkitx-firebase-ai-logic';

const ai = genkit({
  plugins: [
    firebaseAILogic({
      firebaseConfig: {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID
      },
      backend: 'vertexAI', // or 'googleAI'
      vertexAIRegion: 'us-central1'
    })
  ]
});
```

## Usage Examples

### Basic Text Generation

```typescript
const { text } = await ai.generate({
  model: firebaseAILogic.model('gemini-2.5-flash'),
  prompt: 'Write a haiku about coding'
});
```

### Type-Safe Configuration

```typescript
const { text } = await ai.generate({
  model: firebaseAILogic.model('gemini-2.5-flash', {
    temperature: 0.8,
    maxOutputTokens: 1000
  }),
  prompt: 'Explain machine learning'
});
```

### JSON Output

```typescript
const { text } = await ai.generate({
  model: firebaseAILogic.model('gemini-2.5-flash', {
    responseMimeType: 'application/json',
    responseSchema: {
      type: "object",
      properties: {
        summary: { type: "string" },
        keyPoints: { type: "array", items: { type: "string" } }
      }
    }
  }),
  prompt: 'Summarize the benefits of AI'
});

const result = JSON.parse(text);
```

### System Instructions

```typescript
const { text } = await ai.generate({
  model: firebaseAILogic.model('gemini-2.5-flash'),
  messages: [
    {
      role: 'system',
      content: [{ text: 'You are a helpful coding assistant' }]
    },
    {
      role: 'user',
      content: [{ text: 'How do I create an async function?' }]
    }
  ]
});
```

### Multimodal Input

```typescript
const { text } = await ai.generate({
  model: firebaseAILogic.model('gemini-2.5-flash'),
  messages: [
    {
      role: 'user',
      content: [
        { text: 'What do you see in this image?' },
        { 
          media: {
            url: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEA...',
            contentType: 'image/jpeg'
          }
        }
      ]
    }
  ]
});
```

## Backend Options

### Google AI (Developer API)
```typescript
backend: 'googleAI'
```
- ✅ Free tier available
- ✅ Easy setup
- **Best for**: Development, prototyping, Production

### Vertex AI
```typescript
backend: 'vertexAI',
vertexAIRegion: 'us-central1'
```
- ✅ Enterprise features
- ❌ Requires billing
- **Best for**: Production apps with high usage

## Configuration Options

```typescript
interface FirebaseAILogicConfig {
  temperature?: number;        // 0.0 to 2.0
  topK?: number;              // Positive integer  
  topP?: number;              // 0.0 to 1.0
  maxOutputTokens?: number;   // Max tokens to generate
  stopSequences?: string[];   // Stop generation sequences
  candidateCount?: number;    // Response candidates (1-8)
  responseMimeType?: string;  // 'application/json' for structured output
  responseSchema?: object;    // JSON schema for validation
  systemInstruction?: string; // System prompt
}
```

## Testing

```bash
# Build plugin
npm run build

# Run JavaScript tests
node test/simple-test.cjs

# Run TypeScript tests  
npx tsx test/test-plugin.ts
```


## Project Structure

```
.
├── src/
│   └── index.ts              # Main plugin implementation
├── test/
│   ├── README.md            # Test documentation
│   ├── simple-test.cjs      # JavaScript test suite 
│   └── test-plugin.ts       # TypeScript test suite 
├── package.json             # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── README.md               # This file
```

### Source Code Overview

**`src/index.ts`** - Main plugin implementation:
- `FirebaseAILogicOptions` - Plugin configuration interface
- `initializeFirebaseApp()` - Firebase app initialization
- `toFirebaseAIRequest()` - Converts Genkit requests to Firebase AI format
- `extractSystemInstruction()` - Extracts system prompts from messages
- `toGenkitResponse()` - Converts Firebase AI responses to Genkit format
- `createFirebaseAILogicModel()` - Creates model definitions for Genkit
- `firebaseAILogic()` - Main plugin export with type-safe model references


## Error Handling

```typescript
try {
  const { text } = await ai.generate({
    model: firebaseAILogic.model('gemini-2.5-flash'),
    prompt: 'Generate content'
  });
} catch (error) {
  if (error.message.includes('quota exceeded')) {
    console.log('Rate limit reached');
  } else if (error.message.includes('NOT_FOUND')) {
    console.log('Model not available in your region');
  } else {
    console.error('Generation failed:', error.message);
  }
}
```

## Development

```bash
# Start Genkit dev server
genkit start -- tsx src/index.ts

# Open developer UI at http://localhost:4000
```



## License

MIT License

## Resources

- [Firebase AI Logic Docs](https://firebase.google.com/docs/ai-logic)
- [Genkit Documentation](https://firebase.google.com/docs/genkit)
- [Firebase Console](https://console.firebase.google.com)
- [Test Suite Documentation](./test/README.md)