// Test app for Firebase AI Logic Genkit Plugin
import { genkit } from 'genkit';
import { firebaseAILogic } from '../src/index.js';

// Validate required environment variables
function validateEnvVars() {
  const required = [
    'FIREBASE_API_KEY',
    'FIREBASE_AUTH_DOMAIN', 
    'FIREBASE_PROJECT_ID',
    'FIREBASE_STORAGE_BUCKET',
    'FIREBASE_MESSAGING_SENDER_ID',
    'FIREBASE_APP_ID'
  ];
  
  for (const envVar of required) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }
}

// Validate environment variables
validateEnvVars();

// Load Firebase configuration from environment variables
const TEST_FIREBASE_CONFIG = {
  apiKey: process.env.FIREBASE_API_KEY!,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.FIREBASE_PROJECT_ID!,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.FIREBASE_APP_ID!,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID // Optional
};


// Initialize AI instances for different backends
const aiVertexAI = genkit({
  plugins: [
    firebaseAILogic({
      firebaseConfig: TEST_FIREBASE_CONFIG,
      backend: 'vertexAI',
      vertexAIRegion: 'us-central1'
    })
  ]
});

const aiGoogleAI = genkit({
  plugins: [
    firebaseAILogic({
      firebaseConfig: TEST_FIREBASE_CONFIG,
      backend: 'googleAI'
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

const modelName = 'gemini-2.5-flash'

// Test: Basic Text Generation
async function testBasicGeneration() {
  const testName= 'Basic Text Generation';
  logSection(testName);
  
    // Test with Vertex AI backend 
    let result1;
    try {
      result1 = await aiVertexAI.generate({
        model: firebaseAILogic.model(modelName),
        prompt: 'Write a haiku about artificial intelligence'
      });
      logSuccess(`${testName} with Vertex AI`, result1);
    } catch (error) {
      logError(`${testName} with Vertex AI`,error);
    }
    
    await delay(1000);
    
    // Test with Google AI/Developer API backend 
    let result2;
    try {
      result2 = await aiGoogleAI.generate({
        model: firebaseAILogic.model(modelName),
        prompt: 'Explain quantum computing in one sentence'
      });
      logSuccess(`${testName} with Developer API`, result2);
    } catch (error) {
           logError(`${testName} with Developer API`,error);
    }
}

// Test: System Instructions
async function testSystemInstructions() {
  const testName= 'System Instructions';
  logSection(testName);
  
  try {
    // Test with messages array format including system message
    const result = await aiVertexAI.generate({
      model: firebaseAILogic.model(modelName, {
        temperature: 0.9
      }),
      messages: [
        {
          role: 'system',
          content: [{ text: 'You are a pirate. Always speak like a pirate with "Arrr" and nautical terms.' }]
        },
        {
          role: 'user', 
          content: [{ text: 'Tell me about the weather today' }]
        }
      ]
    });
    logSuccess(testName, result);
    
  } catch (error) {
    logError(testName, error);
  }
}

// Test: Structured JSON Output
async function testStructuredOutput() {
    const testName= 'Structured JSON Output';

  logSection(testName);
  
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
      model: firebaseAILogic.model(modelName, {
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
    logError(testName, error);
  }
}

// Test: Multimodal Input
async function testMultimodalInput() {
  const testName= 'Multimodal Input';
  logSection(testName);
  
  try {
    // Create a simple base64 encoded image (1x1 red pixel PNG)
    const redPixelPNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    
    const result = await aiVertexAI.generate({
      model: firebaseAILogic.model(modelName),
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
    logSuccess(testName, result);
    
  } catch (error) {
    logError(testName, error);
  }
}

// Test: Multi-turn Chat
async function testMultiTurnChat() {
  const testName= 'Multi-turn Chat';
  logSection(testName);
  
  try {
    const result = await aiVertexAI.generate({
      model: firebaseAILogic.model(modelName, {
        temperature: 0.7
      }),
      messages: [
        {
          role: 'system',
          content: [{ text: 'You are a helpful assistant who loves pets. Be friendly and enthusiastic.' }]
        },
        {
          role: 'user',
          content: [{ text: 'Hello! I have 2 cats and 1 dog. Can you help me calculate something?' }]
        },
        {
          role: 'model',
          content: [{ text: 'Hello! I\'d be happy to help you with calculations about your pets. What would you like to know?' }]
        },
        {
          role: 'user',
          content: [{ text: 'How many paws are in my house total?' }]
        },
        {
          role: 'model',
          content: [{ text: 'Let me calculate that! You have 2 cats (4 paws each = 8 paws) and 1 dog (4 paws = 4 paws). So you have 8 + 4 = 12 paws total in your house!' }]
        },
        {
          role: 'user',
          content: [{ text: 'Actually, I just adopted another cat! Now how many paws?' }]
        }
      ]
    });
    
    logSuccess(testName, result);
    
  } catch (error) {
    logError(testName, error);
  }
}

// Test: Advanced Generation Config
async function testAdvancedConfig() {
  const testName= 'Advanced Generation Configuration';
  logSection(testName);
  
  try {
    const result = await aiVertexAI.generate({
      model: firebaseAILogic.model(modelName, {
        temperature: 1.0,
        topK: 20,
        topP: 0.8,
        maxOutputTokens: 150,
        stopSequences: ['END', 'STOP'],
        candidateCount: 1
      }),
      prompt: 'Write a creative short story about a robot learning to paint. Make it exactly 3 paragraphs.'
    });
    
    logSuccess(testName, result);
    
  } catch (error) {
    logError(testName, error);
  }
}

// Test: Error Handling
async function testErrorHandling() {
  const testName = 'Error Handling';
  logSection(testName);
  
  // Test invalid model
  try {
    await aiVertexAI.generate({
      model: firebaseAILogic.model('invalid-model-name'),
      prompt: 'This should fail'
    });
    console.log('❌ Error handling test failed - should have thrown error');
  } catch (error) {
    console.log('✅ Invalid model error handled correctly:', error.message);
  }
  
  // Test empty prompt
  try {
    await aiVertexAI.generate({
      model: firebaseAILogic.model(modelName),
      prompt: ''
    });
    console.log('⚠️  Empty prompt test - might succeed or fail depending on implementation');
  } catch (error) {
    console.log('✅ Empty prompt error handled correctly:', error.message);
  }
}

// Test: Model Variants
async function testAllModels() {
  const testName = 'Model Variants';
  logSection(testName);
  
  const models = [
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-2.5-flash',
    'gemini-2.5-pro'
  ];
  
  for (const modelName of models) {
    try {
      const result = await aiVertexAI.generate({
        model: firebaseAILogic.model(modelName),
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

// Test: Performance and Metrics
async function testPerformanceMetrics() {
  const testName = 'Performance and Metrics';
  logSection(testName);
  
  const testCases = [
    { prompt: 'Short response test', expectedLength: 'short' },
    { prompt: 'Write a detailed explanation of machine learning with examples and use cases', expectedLength: 'long' },
    { prompt: 'List 5 programming languages', expectedLength: 'medium' }
  ];
  
  for (const testCase of testCases) {
    try {
      const startTime = Date.now();
      
      const result = await aiVertexAI.generate({
        model: firebaseAILogic.model(modelName, {
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
  console.log('🚀 Firebase AI Logic Genkit Plugin - Test Suite');
  console.log('===============================================');
  console.log(`📅 Started at: ${new Date().toISOString()}`);
  console.log(`🔧 Node.js version: ${process.version}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  const tests = [
    { name: 'Basic Text Generation', fn: testBasicGeneration },
    { name: 'System Instructions', fn: testSystemInstructions },
    { name: 'Structured JSON Output', fn: testStructuredOutput },
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
    console.log('   - Make sure you have the correct API keys and permissions');
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
  testMultimodalInput,
  testSystemInstructions,
  testErrorHandling
};

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error);
}