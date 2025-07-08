# Firebase AI Logic Genkit Plugin

A Genkit plugin that provides seamless integration with Firebase AI Logic, allowing you to use Google's Gemini models directly from your mobile and web applications through Firebase's secure proxy service.

## Features

- 🔥 **Firebase Integration**: Built specifically for Firebase AI Logic client SDKs
- 🛡️ **Security First**: API keys stay secure on Firebase servers, never exposed in client code
- 🤖 **Multiple Models**: Support for Gemini 2.5 Flash, 2.0 Flash, 1.5 Pro, and 1.5 Flash
- 🎯 **Type Safety**: Full TypeScript support with type-safe model references
- 🌐 **Multi-Backend**: Works with both Gemini Developer API and Vertex AI
- 📱 **Client-Side Ready**: Designed for mobile and web app development
- 🔧 **Structured Output**: JSON schema support for structured responses
- 🖼️ **Multimodal**: Support for text, image, and video inputs

## Installation

```bash
npm install genkitx-firebase-ai-logic firebase genkit
```

**Note:** Make sure you're using Firebase v11.0.0 or later, which includes the Firebase AI Logic client SDK (formerly called "Vertex AI in Firebase").

## Quick Start

### 1. Set up Firebase Project

First, create a Firebase project and enable Firebase AI Logic:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or select existing one
3. Navigate to "Firebase AI Logic" in the left sidebar
4. Click "Get started" and follow the setup wizard
5. Choose either Gemini Developer API or Vertex AI Gemini API

### 2. Initialize Plugin

```typescript
import { genkit } from 'genkit';
import { firebaseAILogic } from 'genkitx-firebase-ai-logic';

const ai = genkit({
  plugins: [
    firebaseAILogic({
      firebaseConfig: {
        apiKey: "AIzaSyDgDmHdE9973IKuNkWGEIocTFgxkQlUYbU",
        authDomain: "your-project.firebaseapp.com",
        projectId: "your-project-id",
        storageBucket: "your-project.appspot.com",
        messagingSenderId: "123456789",
        appId: "1:123456789:web:abcdef123456"
      },
      backend: 'vertexAI', // or 'googleAI'
      vertexAIRegion: 'us-central1', // Required for Vertex AI
    })
  ]
});
```

### 3. Generate Content

```typescript
// Simple text generation
const { text } = await ai.generate({
  model: 'firebase-ai-logic/gemini-2.5-flash',
  prompt: 'Write a haiku about coding'
});

console.log(text);
```

## Configuration Options

```typescript
interface FirebaseAILogicOptions {
  // Firebase configuration (required unless firebaseApp provided)
  firebaseConfig?: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string; // Optional for Analytics
  };
  
  // Backend provider (default: 'googleAI')
  backend?: 'googleAI' | 'vertexAI';
  
  // Vertex AI region (required for Vertex AI backend, default: 'us-central1')
  vertexAIRegion?: string;
  
  // Use existing Firebase app instance
  firebaseApp?: FirebaseApp;
  
  // Default model name
  defaultModel?: string;
  
  // Default generation parameters
  defaultGenerationConfig?: {
    temperature?: number;        // 0.0 to 2.0
    topK?: number;              // Positive integer
    topP?: number;              // 0.0 to 1.0
    maxOutputTokens?: number;   // Max tokens to generate
    stopSequences?: string[];   // Stop generation at these sequences
    candidateCount?: number;    // Number of response candidates (1-8)
    responseMimeType?: string;  // For structured output ('application/json')
    responseSchema?: any;       // JSON schema for structured output
  };
  
  // Default safety settings
  defaultSafetySettings?: Array<{
    category: string;          // e.g., 'HARM_CATEGORY_HARASSMENT'
    threshold: string;         // e.g., 'BLOCK_MEDIUM_AND_ABOVE'
    method?: string;          // 'SEVERITY' or 'PROBABILITY'
  }>;
}
```

## Supported Models

| Model | Name | Capabilities |
|-------|------|-------------|
| Gemini 2.5 Flash | `firebase-ai-logic/gemini-2.5-flash` | Text, Images, Videos, Function calling |
| Gemini 2.0 Flash | `firebase-ai-logic/gemini-2.0-flash` | Text, Images, Videos, Function calling |
| Gemini 1.5 Pro | `firebase-ai-logic/gemini-1.5-pro` | Text, Images, Videos, Function calling |
| Gemini 1.5 Flash | `firebase-ai-logic/gemini-1.5-flash` | Text, Images, Videos, Function calling |

## Advanced Usage Examples

### Type-Safe Model References

```typescript
import { firebaseAILogic } from 'genkitx-firebase-ai-logic';

const { text } = await ai.generate({
  model: firebaseAILogic.model('gemini-2.5-flash', {
    temperature: 0.8,
    maxOutputTokens: 1000
  }),
  prompt: 'Explain machine learning'
});
```

### Structured JSON Output

```typescript
const schema = {
  type: "object",
  properties: {
    recipe: {
      type: "object",
      properties: {
        name: { type: "string" },
        ingredients: { 
          type: "array", 
          items: { type: "string" } 
        },
        steps: { 
          type: "array", 
          items: { type: "string" } 
        }
      }
    }
  }
};

const { text } = await ai.generate({
  model: firebaseAILogic.model('gemini-2.5-flash', {
    responseMimeType: 'application/json',
    responseSchema: schema
  }),
  prompt: 'Create a recipe for chocolate chip cookies'
});

const recipe = JSON.parse(text);
```

### Function Calling

```typescript
const weatherTool = {
  functionDeclarations: [
    {
      name: 'getWeather',
      description: 'Get the current weather for a location',
      parameters: {
        type: 'object',
        properties: {
          location: {
            type: 'string',
            description: 'The city and state/country'
          },
          unit: {
            type: 'string',
            enum: ['celsius', 'fahrenheit'],
            description: 'Temperature unit'
          }
        },
        required: ['location']
      }
    }
  ]
};

const { text } = await ai.generate({
  model: firebaseAILogic.model('gemini-2.5-flash', {
    tools: [weatherTool],
    toolConfig: {
      functionCallingConfig: {
        mode: 'AUTO' // 'NONE', 'ANY', or 'AUTO'
      }
    }
  }),
  prompt: "What's the weather like in Paris?"
});
```

### Safety Settings

```typescript
const { text } = await ai.generate({
  model: firebaseAILogic.model('gemini-2.5-flash', {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        method: 'SEVERITY'
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_LOW_AND_ABOVE',
        method: 'PROBABILITY'
      }
    ]
  }),
  prompt: 'Write a positive message about diversity'
});
```

### System Instructions

```typescript
// String system instruction
const { text } = await ai.generate({
  model: firebaseAILogic.model('gemini-2.5-flash', {
    systemInstruction: 'You are a helpful coding assistant. Be concise but thorough.'
  }),
  prompt: 'How do I create an async function?'
});

// Content-based system instruction
const { text } = await ai.generate({
  model: firebaseAILogic.model('gemini-2.5-flash', {
    systemInstruction: {
      role: 'system',
      parts: [{ text: 'You are a professional scientist. Always explain things with scientific accuracy.' }]
    }
  }),
  prompt: 'How does photosynthesis work?'
});
```

### Streaming Responses

Firebase AI Logic supports streaming responses for real-time text generation:

```typescript
// Note: Streaming support would need to be added to the plugin
// This is a conceptual example of how it could work
const stream = await ai.generateStream({
  model: 'firebase-ai-logic/gemini-2.5-flash',
  prompt: 'Write a long story about space exploration'
});

for await (const chunk of stream) {
  process.stdout.write(chunk.text);
}
```

### Chat Sessions with History

```typescript
const { text } = await ai.generate({
  model: firebaseAILogic.model('gemini-2.5-flash', {
    systemInstruction: 'You are a helpful assistant.'
  }),
  messages: [
    {
      role: 'user',
      content: [{ text: 'Hello, I need help with JavaScript' }]
    },
    {
      role: 'model',
      content: [{ text: 'Hello! I\'d be happy to help you with JavaScript. What specific topic would you like assistance with?' }]
    },
    {
      role: 'user',
      content: [{ text: 'How do I create an async function?' }]
    },
    {
      role: 'model',
      content: [{ text: 'You can create an async function using the `async` keyword...' }]
    },
    {
      role: 'user',
      content: [{ text: 'Can you show me an example?' }]
    }
  ]
});
```

### Multimodal Input

```typescript
const { text } = await ai.generate({
  model: 'firebase-ai-logic/gemini-2.5-flash',
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

// Or using Cloud Storage files
const { text } = await ai.generate({
  model: 'firebase-ai-logic/gemini-2.5-flash',
  messages: [
    {
      role: 'user',
      content: [
        { text: 'Analyze this document' },
        { 
          media: {
            url: 'gs://your-bucket/document.pdf',
            contentType: 'application/pdf'
          }
        }
      ]
    }
  ]
});
```

### Multi-turn Conversations

```typescript
const { text } = await ai.generate({
  model: 'firebase-ai-logic/gemini-2.5-flash',
  messages: [
    {
      role: 'user',
      content: [{ text: 'I have 2 cats and 1 dog.' }]
    },
    {
      role: 'model',
      content: [{ text: 'That sounds lovely! What are their names?' }]
    },
    {
      role: 'user', 
      content: [{ text: 'The cats are Whiskers and Mittens, and the dog is Buddy.' }]
    }
  ]
});
```

## Integration with Genkit Flows

```typescript
export const summarizeFlow = ai.defineFlow(
  {
    name: 'summarizeFlow',
    inputSchema: z.object({
      text: z.string(),
      maxLength: z.number().optional()
    }),
    outputSchema: z.object({
      summary: z.string(),
      keyPoints: z.array(z.string())
    })
  },
  async (input) => {
    const { text } = await ai.generate({
      model: firebaseAILogic.model('gemini-1.5-pro', {
        maxOutputTokens: input.maxLength || 500,
        responseMimeType: 'application/json',
        responseSchema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            keyPoints: { 
              type: "array", 
              items: { type: "string" } 
            }
          }
        }
      }),
      prompt: `Summarize the following text and extract key points:\n\n${input.text}`
    });

    return JSON.parse(text);
  }
);
```

## Security Considerations

Firebase AI Logic provides several security benefits:

- **API Key Protection**: Your Gemini API keys never appear in client code
- **Firebase App Check**: Protect against unauthorized API access
- **Firebase Security Rules**: Control access to uploaded files
- **Proxy Service**: All requests go through Firebase's secure proxy

## Backend Options

### Gemini Developer API (`googleAI`)
- **Pros**: Free tier available, easy setup, no billing required initially
- **Cons**: Rate limits, fewer enterprise features
- **Best for**: Development, prototyping, small applications

### Vertex AI Gemini API (`vertexAI`)
- **Pros**: Enterprise-grade, higher quotas, better SLAs
- **Cons**: Requires billing setup, more complex pricing
- **Best for**: Production applications, enterprise use cases

## Error Handling

```typescript
try {
  const { text } = await ai.generate({
    model: 'firebase-ai-logic/gemini-2.5-flash',
    prompt: 'Generate content'
  });
} catch (error) {
  if (error.message.includes('quota exceeded')) {
    console.log('Rate limit reached. Try again later.');
  } else if (error.message.includes('invalid model')) {
    console.log('Model not available. Try a different model.');
  } else {
    console.error('Generation failed:', error.message);
  }
}
```

## Advanced Features

### Image Generation (Imagen)

Firebase AI Logic supports Imagen models for image generation. This would require extending the plugin:

```typescript
// Conceptual example - would need plugin implementation
const imageResult = await ai.generateImage({
  model: 'firebase-ai-logic/imagen-3.0-generate-001',
  prompt: 'A futuristic city with flying cars at sunset',
  config: {
    numberOfImages: 2,
    aspectRatio: 'LANDSCAPE_16x9',
    imageFormat: 'jpeg',
    addWatermark: true,
    safetyFilterLevel: 'BLOCK_MEDIUM_AND_ABOVE'
  }
});
```

### Token Counting

Firebase AI Logic supports token counting for cost estimation:

```typescript
// Would need plugin implementation to expose this feature
const tokenCount = await ai.countTokens({
  model: 'firebase-ai-logic/gemini-2.5-flash',
  prompt: 'Your prompt here'
});

console.log(`Estimated tokens: ${tokenCount.totalTokens}`);
```

### Streaming Support

Real-time streaming responses:

```typescript
// Would need plugin implementation
for await (const chunk of ai.generateStream({
  model: 'firebase-ai-logic/gemini-2.5-flash', 
  prompt: 'Write a long story'
})) {
  process.stdout.write(chunk.text);
}
```

### Citations and Grounding

Firebase AI Logic can provide citation metadata:

```typescript
const result = await ai.generate({
  model: 'firebase-ai-logic/gemini-2.5-flash',
  prompt: 'Explain quantum computing with sources'
});

// Access citation metadata
console.log('Citations:', result.candidates[0]?.custom?.citationMetadata);
console.log('Grounding:', result.candidates[0]?.custom?.groundingMetadata);
```

## Comparison with Other Plugins

| Feature | Firebase AI Logic | Google AI Plugin | Vertex AI Plugin |
|---------|------------------|------------------|------------------|
| Client-side ready | ✅ | ❌ | ❌ |
| API key security | ✅ | ❌ | ✅ |
| Firebase integration | ✅ | ❌ | Partial |
| App Check support | ✅ | ❌ | ❌ |
| Hybrid/on-device | ✅ | ❌ | ❌ |
| Server-side only | ❌ | ✅ | ✅ |

## Troubleshooting

### Common Issues

#### Import Errors
Make sure you're using the correct imports. Firebase AI Logic uses:

```typescript
// ✅ Correct imports
import { 
  getAI, 
  getGenerativeModel,
  GoogleAIBackend,
  VertexAIBackend 
} from 'firebase/ai';

// ❌ Wrong - these are from the old Google AI SDK
import { GoogleGenerativeAI } from '@google/generative-ai';
```

#### Backend Configuration
- **Google AI Backend**: `new GoogleAIBackend()` - Free tier, good for development
- **Vertex AI Backend**: `new VertexAIBackend('us-central1')` - Enterprise features, requires region

#### Model Names
Use the correct model names for Firebase AI Logic:
- `gemini-2.5-flash` ✅
- `gemini-2.0-flash` ✅  
- `gemini-1.5-pro` ✅
- `gemini-1.5-flash` ✅

#### Rate Limits and Quotas
Firebase AI Logic has built-in rate limiting. If you hit limits:
- Check your Firebase console for quota information
- Consider upgrading to Vertex AI backend for higher limits
- Implement exponential backoff in your error handling

```typescript
async function generateWithRetry(prompt: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await ai.generate({
        model: 'firebase-ai-logic/gemini-2.5-flash',
        prompt
      });
    } catch (error) {
      if (error.message.includes('quota') && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        continue;
      }
      throw error;
    }
  }
}
```

#### Safety Filters
If content is being blocked:
- Check the safety ratings in the response
- Adjust safety settings if appropriate
- Use different prompting techniques

```typescript
// Check safety ratings
const result = await ai.generate({
  model: 'firebase-ai-logic/gemini-2.5-flash',
  prompt: 'Your prompt here'
});

console.log('Safety ratings:', result.candidates[0]?.safetyRatings);
```

#### Region Availability
Not all models are available in all regions. For Vertex AI:
- `us-central1` - Most models available
- `europe-west1` - Limited model selection
- Check Firebase console for current availability

#### Firebase Project Setup
Ensure your Firebase project is properly configured:
1. Firebase AI Logic is enabled
2. Billing is set up (for Vertex AI)
3. API keys are properly configured
4. Correct region selected for Vertex AI

## Development and Testing

Use the Genkit Developer UI to test your implementations:

```bash
# Start development server
genkit start -- tsx src/index.ts

# Open developer UI
# Navigate to http://localhost:4000
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Related Resources

- [Firebase AI Logic Documentation](https://firebase.google.com/docs/ai-logic)
- [Genkit Documentation](https://genkit.dev/docs)
- [Firebase Console](https://console.firebase.google.com)
- [Google AI Studio](https://aistudio.google.com)

---

**Package.json Configuration:**

```json
{
  "name": "genkitx-firebase-ai-logic",
  "version": "1.0.0",
  "description": "Genkit plugin for Firebase AI Logic client SDK integration",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist/**/*",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "jest",
    "prepublishOnly": "npm run build"
  },
  "keywords": [
    "genkit-plugin",
    "genkit-model", 
    "firebase",
    "firebase-ai-logic",
    "gemini",
    "ai",
    "llm",
    "generative-ai",
    "google"
  ],
  "author": "Your Name <your.email@example.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/genkitx-firebase-ai-logic.git"
  },
  "peerDependencies": {
    "genkit": "^1.0.0",
    "firebase": "^11.10.0"
  },
  "dependencies": {
    "@firebase/app": "^0.10.15",
    "@firebase/ai": "^0.1.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

**TypeScript Configuration (tsconfig.json):**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```