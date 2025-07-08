// test/type-test.ts
// TypeScript type checking test - this file should compile without errors
// Run with: npx tsc --noEmit test/type-test.ts

import { genkit } from 'genkit';
import { firebaseAILogic } from '../src/index.js';

// Test 1: Plugin function type
const plugin = firebaseAILogic({
  firebaseConfig: {
    apiKey: "AIzaSyDgDmHdE9973IKuNkWGEIocTFgxkQlUYbU",
  authDomain: "vertexai-firebase-2025.firebaseapp.com",
  projectId: "vertexai-firebase-2025",
  storageBucket: "vertexai-firebase-2025.firebasestorage.app",
  messagingSenderId: "1016672011158",
  appId: "1:1016672011158:web:67374c8859ab307c3bd3b7",
  measurementId: "G-DMZB2KB2VY"
  },
  backend: 'vertexAI',
  vertexAIRegion: 'us-central1'
});

// Test 2: Model helper function type
const modelRef = firebaseAILogic.model('gemini-2.5-flash', {
  temperature: 0.7,
  maxOutputTokens: 1000,
  topK: 40,
  topP: 0.95
});

// Test 3: Model reference properties
const modelName: string = modelRef.name;
console.log('Model name:', modelName);

// Test 4: Advanced configuration
const advancedModelRef = firebaseAILogic.model('gemini-1.5-pro', {
  temperature: 0.8,
  maxOutputTokens: 500,
  topK: 20,
  topP: 0.9,
  stopSequences: ['END', 'STOP'],
  candidateCount: 1,
  responseMimeType: 'application/json',
  responseSchema: {
    type: "object",
    properties: {
      message: { type: "string" }
    }
  },
  systemInstruction: 'You are a helpful assistant.',
  safetySettings: [
    {
      category: 'HARM_CATEGORY_HARASSMENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      method: 'SEVERITY'
    }
  ],
  tools: [{
    functionDeclarations: [{
      name: 'testFunction',
      description: 'A test function',
      parameters: {
        type: 'object',
        properties: {
          input: { type: 'string' }
        }
      }
    }]
  }],
  toolConfig: {
    functionCallingConfig: {
      mode: 'AUTO'
    }
  }
});

// Test 5: Genkit integration
const ai = genkit({
  plugins: [plugin]
});

// Test 6: Type-safe model usage in generate call
async function testGenerate() {
  const result = await ai.generate({
    model: firebaseAILogic.model('gemini-2.5-flash', {
      temperature: 0.5
    }),
    prompt: 'Test prompt'
  });
  
  // These should all be properly typed
  const text: string = result.text;
  const usage = result.usage;
  const inputTokens: number = usage?.inputTokens || 0;
  const outputTokens: number = usage?.outputTokens || 0;
  
  console.log('Generated text:', text);
  console.log('Token usage:', { inputTokens, outputTokens });
}

// Test 7: Different backend configurations
const vertexAIPlugin = firebaseAILogic({
  firebaseConfig: {
   apiKey: "AIzaSyDgDmHdE9973IKuNkWGEIocTFgxkQlUYbU",
  authDomain: "vertexai-firebase-2025.firebaseapp.com",
  projectId: "vertexai-firebase-2025",
  storageBucket: "vertexai-firebase-2025.firebasestorage.app",
  messagingSenderId: "1016672011158",
  appId: "1:1016672011158:web:67374c8859ab307c3bd3b7",
  measurementId: "G-DMZB2KB2VY"
  },
  backend: 'vertexAI',
  vertexAIRegion: 'us-central1'
});

const googleAIPlugin = firebaseAILogic({
  firebaseConfig: {
    apiKey: "test",
    authDomain: "test.firebaseapp.com",
    projectId: "test-project", 
    storageBucket: "test.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:test"
  },
  backend: 'googleAI'
});

// Test 8: All supported models
const models = [
  firebaseAILogic.model('gemini-2.5-flash'),
  //firebaseAILogic.model('gemini-2.5-pro'),
];

models.forEach(model => {
  console.log('Model:', model.name);
});

// Test 9: Export verification
export {
  plugin,
  modelRef,
  advancedModelRef,
  testGenerate,
  vertexAIPlugin,
  googleAIPlugin,
  models
};

console.log('✅ All TypeScript types check out correctly!');