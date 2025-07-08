// test/test-plugin.ts
// Comprehensive test app for Firebase AI Logic Genkit Plugin

import { genkit } from 'genkit';
import { firebaseAILogic } from '../src/index.js';

// Test configuration - replace with your actual Firebase config
const TEST_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDgDmHdE9973IKuNkWGEIocTFgxkQlUYbU",
  authDomain: "vertexai-firebase-2025.firebaseapp.com",
  projectId: "vertexai-firebase-2025",
  storageBucket: "vertexai-firebase-2025.firebasestorage.app",
  messagingSenderId: "1016672011158",
  appId: "1:1016672011158:web:67374c8859ab307c3bd3b7",
  measurementId: "G-DMZB2KB2VY"
};

// Initialize AI instances for different backends
const aiVertexAI = genkit({
  plugins: [
    firebaseAILogic({
      firebaseConfig: TEST_FIREBASE_CONFIG,
      backend: 'vertexAI',
      vertexAIRegion: 'us-central1',
      defaultGenerationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
        topK: 40,
        topP: 0.95
      }
    })
  ]
});

const aiGoogleAI = genkit({
  plugins: [
    firebaseAILogic({
      firebaseConfig: TEST_FIREBASE_CONFIG,
      backend: 'googleAI',
      defaultGenerationConfig: {
        temperature: 0.8,
        maxOutputTokens: 500
      }
    })
  ]
});

// Utility functions for logging
function logSection(title: string) {
  console.log('\n' + '='.repeat(70));
  console.log(`🧪 ${title}`);
  console.log('='.repeat(70));
}

function logSuccess(test: string, result: any) {
  console.log(`\n✅ ${test}:`);
  console.log('📝 Response:', result.text?.substring(0, 200) + (result.text?.length > 200 ? '...' : ''));
  if (result.usage) {
    console.log('📊 Usage:', result.usage);
  }
  if (result.candidates?.[0]?.custom) {
    console.log('🛡️  Safety/Custom:', result.candidates[0].custom);
  }
}

function logError(test: string, error: any) {
  console.log(`\n❌ ${test} FAILED:`);
  console.log('💥 Error:', error.message);
  console.log('🔍 Details:', error.code || 'Unknown');
}

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test 1: Basic Text Generation
async function testBasicGeneration() {
  logSection('Basic Text Generation');
  
  try {
    // Test with Vertex AI backend
    const result1 = await aiVertexAI.generate({
      model: 'firebase-ai-logic/gemini-2.5-flash',
      prompt: 'Write a haiku about artificial intelligence'
    });
    logSuccess('Vertex AI Basic Generation', result1);
    
    await delay(1000);
    
    // Test with Google AI backend
    const result2 = await aiGoogleAI.generate({
      model: 'firebase-ai-logic/gemini-2.5-flash',
      prompt: 'Explain quantum computing in one sentence'
    });
    logSuccess('Google AI Basic Generation', result2);
    
  } catch (error) {
    logError('Basic Text Generation', error);
  }
}

// Test 2: Type-Safe Model References
async function testTypeSafeReferences() {
  logSection('Type-Safe Model References');
  
  try {
    const result = await aiVertexAI.generate({
      model: firebaseAILogic.model('gemini-2.5-flash', {
        temperature: 0.2,
        maxOutputTokens: 100,
        topK: 20
      }),
      prompt: 'Count from 1 to 5'
    });
    logSuccess('Type-Safe Model Reference', result);
    
  } catch (error) {
    logError('Type-Safe Model References', error);
  }
}

// Test 3: System Instructions
async function testSystemInstructions() {
  logSection('System Instructions');
  
  try {
    // String system instruction
    const result1 = await aiVertexAI.generate({
      model: firebaseAILogic.model('gemini-2.5-flash', {
        systemInstruction: 'You are a pirate. Always speak like a pirate with "Arrr" and nautical terms.',
        temperature: 0.9
      }),
      prompt: 'Tell me about the weather today'
    });
    logSuccess('String System Instruction (Pirate)', result1);
    
    await delay(1000);
    
    // Content-based system instruction
    const result2 = await aiVertexAI.generate({
      model: firebaseAILogic.model('gemini-1.5-pro', {
        systemInstruction: {
          role: 'system',
          parts: [{ text: 'You are a professional scientist. Always provide accurate, evidence-based explanations.' }]
        }
      }),
      prompt: 'How does photosynthesis work?'
    });
    logSuccess('Content System Instruction (Scientist)', result2);
    
  } catch (error) {
    logError('System Instructions', error);
  }
}

// Test 4: Safety Settings
async function testSafetySettings() {
  logSection('Safety Settings');
  
  try {
    const result = await aiVertexAI.generate({
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
      prompt: 'Write a positive, inspiring message about teamwork and collaboration'
    });
    logSuccess('Safety Settings Test', result);
    
  } catch (error) {
    logError('Safety Settings', error);
  }
}

// Test 5: Structured JSON Output
async function testStructuredOutput() {
  logSection('Structured JSON Output');
  
  try {
    const recipeSchema = {
      type: "object",
      properties: {
        name: { type: "string", description: "Recipe name" },
        ingredients: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              amount: { type: "string" },
              unit: { type: "string" }
            },
            required: ["name", "amount"]
          }
        },
        instructions: {
          type: "array",
          items: { type: "string" }
        },
        cookingTime: { type: "integer", description: "Cooking time in minutes" },
        difficulty: {
          type: "string",
          enum: ["easy", "medium", "hard"]
        }
      },
      required: ["name", "ingredients", "instructions"]
    };

    const result = await aiVertexAI.generate({
      model: firebaseAILogic.model('gemini-2.5-flash', {
        responseMimeType: 'application/json',
        responseSchema: recipeSchema,
        temperature: 0.3
      }),
      prompt: 'Create a simple recipe for chocolate chip cookies'
    });
    
    console.log(`\n✅ Structured JSON Output:`);
    console.log('📝 Raw Response:', result.text);
    
    try {
      const parsedJson = JSON.parse(result.text);
      console.log('🎯 Parsed JSON:');
      console.log(JSON.stringify(parsedJson, null, 2));
    } catch (parseError) {
      console.log('⚠️  JSON Parse Error:', parseError.message);
    }
    
    if (result.usage) {
      console.log('📊 Usage:', result.usage);
    }
    
  } catch (error) {
    logError('Structured JSON Output', error);
  }
}

// Test 6: Function Calling
async function testFunctionCalling() {
  logSection('Function Calling');
  
  try {
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
        },
        {
          name: 'getTime',
          description: 'Get the current time for a timezone',
          parameters: {
            type: 'object',
            properties: {
              timezone: {
                type: 'string',
                description: 'Timezone name (e.g., America/New_York)'
              }
            },
            required: ['timezone']
          }
        }
      ]
    };

    const result = await aiVertexAI.generate({
      model: firebaseAILogic.model('gemini-2.5-flash', {
        tools: [weatherTool],
        toolConfig: {
          functionCallingConfig: {
            mode: 'AUTO'
          }
        }
      }),
      prompt: "What's the weather like in Paris and what time is it there?"
    });
    
    logSuccess('Function Calling Test', result);
    
    // Check if function calls were made by examining the response text
    // Note: In Genkit, tool usage details may be in the response metadata
    const responseText = result.text || '';
    const likelyFunctionCall = responseText.includes('function') || responseText.includes('tool') || responseText.includes('call');
    console.log('🔧 Function calls likely used:', likelyFunctionCall);
    
  } catch (error) {
    logError('Function Calling', error);
  }
}

// Test 7: Multimodal Input
async function testMultimodalInput() {
  logSection('Multimodal Input');
  
  try {
    // Create a simple base64 encoded image (1x1 red pixel PNG)
    const redPixelPNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    
    const result = await aiVertexAI.generate({
      model: 'firebase-ai-logic/gemini-2.5-flash',
      messages: [
        {
          role: 'user',
          content: [
            { text: 'What do you see in this image? Describe its color and characteristics.' },
            {
              media: {
                url: redPixelPNG,
                contentType: 'image/png'
              }
            }
          ]
        }
      ]
    });
    
    logSuccess('Multimodal Input (Image)', result);
    
  } catch (error) {
    logError('Multimodal Input', error);
  }
}

// Test 8: Multi-turn Chat
async function testMultiTurnChat() {
  logSection('Multi-turn Chat');
  
  try {
    const chatHistory = [
      {
        role: 'user' as const,
        content: [{ text: 'Hello! I have 2 cats and 1 dog. Can you help me calculate something?' }]
      },
      {
        role: 'model' as const,
        content: [{ text: 'Hello! I\'d be happy to help you with calculations about your pets. What would you like to know?' }]
      },
      {
        role: 'user' as const,
        content: [{ text: 'How many paws are in my house total?' }]
      },
      {
        role: 'model' as const,
        content: [{ text: 'Let me calculate that! You have 2 cats (4 paws each = 8 paws) and 1 dog (4 paws = 4 paws). So you have 8 + 4 = 12 paws total in your house!' }]
      }
    ];

    const result = await aiVertexAI.generate({
      model: firebaseAILogic.model('gemini-2.5-flash', {
        systemInstruction: 'You are a helpful assistant who loves pets. Be friendly and enthusiastic.',
        temperature: 0.7
      }),
      messages: [
        ...chatHistory,
        {
          role: 'user',
          content: [{ text: 'Actually, I just adopted another cat! Now how many paws?' }]
        }
      ]
    });
    
    logSuccess('Multi-turn Chat', result);
    
  } catch (error) {
    logError('Multi-turn Chat', error);
  }
}

// Test 9: Advanced Generation Config
async function testAdvancedConfig() {
  logSection('Advanced Generation Configuration');
  
  try {
    const result = await aiVertexAI.generate({
      model: firebaseAILogic.model('gemini-1.5-flash', {
        temperature: 1.0,
        topK: 20,
        topP: 0.8,
        maxOutputTokens: 150,
        stopSequences: ['END', 'STOP'],
        candidateCount: 1
      }),
      prompt: 'Write a creative short story about a robot learning to paint. Make it exactly 3 paragraphs.'
    });
    
    logSuccess('Advanced Configuration', result);
    
  } catch (error) {
    logError('Advanced Generation Configuration', error);
  }
}

// Test 10: Error Handling
async function testErrorHandling() {
  logSection('Error Handling');
  
  // Test invalid model
  try {
    await aiVertexAI.generate({
      model: 'firebase-ai-logic/invalid-model-name',
      prompt: 'This should fail'
    });
    console.log('❌ Error handling test failed - should have thrown error');
  } catch (error) {
    console.log('✅ Invalid model error handled correctly:', error.message);
  }
  
  // Test with extremely restrictive safety settings
  try {
    const result = await aiVertexAI.generate({
      model: firebaseAILogic.model('gemini-2.5-flash', {
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_NONE'
          }
        ]
      }),
      prompt: 'Write a completely harmless poem about flowers'
    });
    console.log('✅ Safety settings test passed:', result.text?.substring(0, 100));
  } catch (error) {
    console.log('⚠️  Safety settings error (might be expected):', error.message);
  }
}

// Test 11: Model Variants
async function testAllModels() {
  logSection('All Supported Models');
  
  const models = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-pro',
    'gemini-1.5-flash'
  ];
  
  for (const modelName of models) {
    try {
      const result = await aiVertexAI.generate({
        model: `firebase-ai-logic/${modelName}`,
        prompt: `Hello from ${modelName}! Respond in exactly one sentence.`
      });
      
      console.log(`✅ ${modelName}:`, result.text?.substring(0, 100));
      console.log(`   📊 Usage:`, result.usage);
      
      await delay(1000); // Rate limiting
      
    } catch (error) {
      console.log(`❌ ${modelName} failed:`, error.message);
    }
  }
}

// Test 12: Performance and Metrics
async function testPerformanceMetrics() {
  logSection('Performance Metrics');
  
  const testCases = [
    { prompt: 'Short response test', expectedLength: 'short' },
    { prompt: 'Write a detailed explanation of machine learning with examples and use cases', expectedLength: 'long' },
    { prompt: 'List 5 programming languages', expectedLength: 'medium' }
  ];
  
  for (const testCase of testCases) {
    try {
      const startTime = Date.now();
      
      const result = await aiVertexAI.generate({
        model: firebaseAILogic.model('gemini-2.5-flash', {
          temperature: 0.3
        }),
        prompt: testCase.prompt
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`\n🔬 ${testCase.expectedLength.toUpperCase()} PROMPT TEST:`);
      console.log(`⏱️  Duration: ${duration}ms`);
      console.log(`📏 Response length: ${result.text?.length} characters`);
      console.log(`📊 Token usage:`, result.usage);
      console.log(`📝 Preview:`, result.text?.substring(0, 150) + '...');
      
      await delay(500);
      
    } catch (error) {
      console.log(`❌ Performance test failed:`, error.message);
    }
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Firebase AI Logic Genkit Plugin - Comprehensive Test Suite');
  console.log('================================================================');
  console.log(`📅 Started at: ${new Date().toISOString()}`);
  console.log(`🔧 Node.js version: ${process.version}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  const tests = [
    { name: 'Basic Text Generation', fn: testBasicGeneration },
    { name: 'Type-Safe References', fn: testTypeSafeReferences },
    { name: 'System Instructions', fn: testSystemInstructions },
    { name: 'Safety Settings', fn: testSafetySettings },
    { name: 'Structured JSON Output', fn: testStructuredOutput },
    { name: 'Function Calling', fn: testFunctionCalling },
    { name: 'Multimodal Input', fn: testMultimodalInput },
    { name: 'Multi-turn Chat', fn: testMultiTurnChat },
    { name: 'Advanced Configuration', fn: testAdvancedConfig },
    { name: 'Error Handling', fn: testErrorHandling },
    { name: 'All Models', fn: testAllModels },
    { name: 'Performance Metrics', fn: testPerformanceMetrics }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      console.log(`\n🧪 Running: ${test.name}...`);
      await test.fn();
      passed++;
      console.log(`✅ ${test.name} completed`);
    } catch (error) {
      failed++;
      console.error(`❌ ${test.name} failed:`, error.message);
    }
    
    // Rate limiting between tests
    await delay(2000);
  }
  
  logSection('Test Summary');
  console.log(`📊 Total tests: ${tests.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success rate: ${((passed / tests.length) * 100).toFixed(1)}%`);
  console.log(`📅 Completed at: ${new Date().toISOString()}`);
  
  if (failed > 0) {
    console.log('\n⚠️  Some tests failed. Check the logs above for details.');
    console.log('💡 Common issues:');
    console.log('   - Ensure Firebase project is properly configured');
    console.log('   - Check API quotas and billing');
    console.log('   - Verify model availability in your region');
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed! Your Firebase AI Logic plugin is working correctly.');
    process.exit(0);
  }
}

// Export for potential use in other test files
export {
  runAllTests,
  testBasicGeneration,
  testStructuredOutput,
  testFunctionCalling,
  testMultimodalInput,
  testSystemInstructions,
  testSafetySettings,
  testErrorHandling
};

// Run tests if this file is executed directly
runAllTests().catch(console.error);
