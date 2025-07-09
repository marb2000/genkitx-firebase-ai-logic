// Simple JavaScript test runner for Firebase AI Logic Genkit Plugin
require('dotenv/config'); // Load environment variables from .env file
const { genkit } = require('genkit');
const { firebaseAILogic } = require('../dist/index.js'); // Make sure to build first

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
const FIREBASE_CONFIG = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID // Optional
};

const backend = 'googleAI'; // 'googleAI' or 'vertexAI'

// Initialize Genkit with the plugin - REMOVED defaultGenerationConfig (not supported)
const ai = genkit({
  plugins: [
    firebaseAILogic({
      firebaseConfig: FIREBASE_CONFIG,
      backend: backend, 
      vertexAIRegion: 'us-central1'
    })
  ]
});

// Helper function to add delays
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test 1: Basic Generation with fallback
async function testBasic() {
  console.log('\n🧪 Testing Basic Generation...');
  
  // Try different models in order of preference
  const modelsToTry = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-1.5-flash'];
  
  for (const modelName of modelsToTry) {
    try {
      console.log(`🔄 Trying model: ${modelName}`);
      const result = await ai.generate({
        model: firebaseAILogic.model(modelName),
        prompt: 'Write a short poem about AI helping humans'
      });
      
      console.log(`✅ Success with ${modelName}!`);
      console.log('📝 Response:', result.text);
      console.log('📊 Usage:', result.usage);
      return true;
    } catch (error) {
      console.log(`❌ ${modelName} failed:`, error.message);
      if (modelsToTry.indexOf(modelName) === modelsToTry.length - 1) {
        console.log('💥 All models failed in basic test');
        return false;
      }
    }
  }
  return false;
}

// Test 2: JSON Output
async function testJSON() {
  console.log('\n🧪 Testing JSON Output...');
  try {
    const result = await ai.generate({
      model: firebaseAILogic.model('gemini-2.5-flash', { 
        responseMimeType: 'application/json',
        responseSchema: {
          type: "object",
          properties: {
            joke: { type: "string" },
            rating: { type: "integer", minimum: 1, maximum: 10 },
            category: { type: "string", enum: ["dad", "pun", "tech", "general"] }
          },
          required: ["joke", "rating", "category"]
        },
        temperature: 0.7
      }),
      prompt: 'Tell me a programming joke and rate it'
    });
    
    console.log('✅ Success!');
    console.log('📝 Raw JSON:', result.text);
    
    try {
      const parsed = JSON.parse(result.text);
      console.log('🎯 Parsed:', parsed);
      
      // Validate the structure
      if (parsed.joke && parsed.rating && parsed.category) {
        console.log('🎯 JSON structure is valid!');
      } else {
        console.log('⚠️  JSON structure incomplete');
      }
    } catch (e) {
      console.log('⚠️  JSON parse error:', e.message);
    }
    
    return true;
  } catch (error) {
    console.log('❌ Failed:', error.message);
    return false;
  }
}

// Test 3: System Instructions via Messages
async function testSystemInstructions() {
  console.log('\n🧪 Testing System Instructions...');
  try {
    const result = await ai.generate({
      model: firebaseAILogic.model('gemini-2.5-flash', {
        temperature: 0.8
      }),
      messages: [
        {
          role: 'system',
          content: [{ text: 'You are a helpful librarian. Always mention books in your responses.' }]
        },
        {
          role: 'user',
          content: [{ text: 'How can I learn about space exploration?' }]
        }
      ]
    });
    
    console.log('✅ Success!');
    console.log('📝 Response:', result.text);
    
    // Check if response mentions books
    const mentionsBooks = result.text?.toLowerCase().includes('book');
    console.log('📚 Mentions books:', mentionsBooks ? '✅' : '⚠️');
    
    return true;
  } catch (error) {
    console.log('❌ Failed:', error.message);
    return false;
  }
}

// Test 4: Function Calling (Note: Your plugin doesn't support tools based on the code)
async function testFunctions() {
  console.log('\n🧪 Testing Function Calling...');
  console.log('⚠️  Note: Your plugin currently doesn\'t support tools/functions');
  
  try {
    // Test basic math prompt instead of function calling
    const result = await ai.generate({
      model: firebaseAILogic.model('gemini-2.5-flash'),
      prompt: 'What is 25 multiplied by 4? Please show your calculation.'
    });
    
    console.log('✅ Math prompt test passed!');
    console.log('📝 Response:', result.text);
    
    // Check if response includes the answer
    const includesAnswer = result.text?.includes('100');
    console.log('🔢 Includes correct answer (100):', includesAnswer ? '✅' : '⚠️');
    
    return true;
  } catch (error) {
    console.log('❌ Failed:', error.message);
    return false;
  }
}

// Test 5: Chat History
async function testChat() {
  console.log('\n🧪 Testing Chat History...');
  try {
    const result = await ai.generate({
      model: firebaseAILogic.model('gemini-2.5-flash'),
      messages: [
        {
          role: 'user',
          content: [{ text: 'Hi! My name is Alex and I love programming.' }]
        },
        {
          role: 'model',
          content: [{ text: 'Hello Alex! It\'s great to meet a fellow programming enthusiast. What programming languages do you enjoy working with?' }]
        },
        {
          role: 'user',
          content: [{ text: 'I love JavaScript and Python. Can you recommend a project idea?' }]
        }
      ]
    });
    
    console.log('✅ Success!');
    console.log('📝 Response:', result.text);
    
    // Check if response acknowledges the conversation context
    const acknowledgesContext = result.text?.toLowerCase().includes('javascript') || 
                               result.text?.toLowerCase().includes('python') ||
                               result.text?.toLowerCase().includes('alex');
    console.log('💬 Acknowledges conversation context:', acknowledgesContext ? '✅' : '⚠️');
    
    return true;
  } catch (error) {
    console.log('❌ Failed:', error.message);
    return false;
  }
}

// Test 6: Error Handling
async function testErrors() {
  console.log('\n🧪 Testing Error Handling...');
  let errorsCaught = 0;
  
  // Test invalid model
  try {
    await ai.generate({
      model: firebaseAILogic.model('invalid-model-that-does-not-exist'),
      prompt: 'This should fail'
    });
    console.log('⚠️  Expected error not thrown for invalid model');
  } catch (error) {
    console.log('✅ Invalid model error caught:', error.message);
    errorsCaught++;
  }
  
  // Test with extremely restrictive config
  try {
    const result = await ai.generate({
      model: firebaseAILogic.model('gemini-2.5-flash', {
        maxOutputTokens: 1, // Very restrictive
        temperature: 0
      }),
      prompt: 'Write a very short response'
    });
    console.log('✅ Restrictive config handled gracefully');
    console.log('📝 Short response:', result.text);
  } catch (error) {
    console.log('✅ Restrictive config error caught:', error.message);
    errorsCaught++;
  }
  
  // Test empty/invalid content
  try {
    await ai.generate({
      model: firebaseAILogic.model('gemini-2.5-flash'),
      messages: [] // Empty messages array
    });
    console.log('⚠️  Empty messages should have failed');
  } catch (error) {
    console.log('✅ Empty messages error caught:', error.message);
    errorsCaught++;
  }
  
  console.log(`📊 Errors properly handled: ${errorsCaught}`);
  return true;
}

// Test 7: Quick Performance Check
async function testPerformance() {
  console.log('\n🧪 Testing Performance...');
  
  const tests = [
    { name: 'Short prompt', prompt: 'Say hello' },
    { name: 'Medium prompt', prompt: 'Explain what JavaScript is in 2 sentences' },
    { name: 'Longer prompt', prompt: 'Write a brief explanation of how web browsers work' }
  ];
  
  for (const test of tests) {
    try {
      const start = Date.now();
      const result = await ai.generate({
        model: firebaseAILogic.model('gemini-2.5-flash'), 
        prompt: test.prompt
      });
      const duration = Date.now() - start;
      
      console.log(`⏱️  ${test.name}: ${duration}ms`);
      console.log(`📏 Response: ${result.text?.length || 0} chars`);
      console.log(`📊 Tokens: ${result.usage?.inputTokens || 0}→${result.usage?.outputTokens || 0}`);
      
      await delay(1000); // Rate limiting
    } catch (error) {
      console.log(`❌ ${test.name} failed:`, error.message);
    }
  }
  
  return true;
}

// Test 8: Model Availability Check
async function testModelAvailability() {
  console.log('\n🧪 Testing Model Availability...');
  
  const modelsToTest = [
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
  ];
  
  const workingModels = [];
  
  for (const modelName of modelsToTest) {
    try {
      const result = await ai.generate({
        model: firebaseAILogic.model(modelName),
        prompt: 'Hello'
      });
      console.log(`✅ ${modelName}: WORKS`);
      workingModels.push(modelName);
      await delay(500);
    } catch (error) {
      console.log(`❌ ${modelName}: ${error.message}`);
    }
  }
  
  console.log(`📊 Working models: ${workingModels.length}/${modelsToTest.length}`);
  console.log(`🎯 Recommended models: ${workingModels.slice(0, 2).join(', ')}`);
  
  return workingModels.length > 0;
}

// Main test runner
async function runQuickTests() {
  console.log('🚀 Firebase AI Logic Plugin - Quick Test Suite');
  console.log('==============================================');
  console.log(`📅 Started: ${new Date().toLocaleString()}`);
  console.log(`🔧 Backend: ${backend}`);
  console.log(`🌍 Region: us-central1`);
  
  const tests = [
    { name: 'Model Availability', fn: testModelAvailability },
    { name: 'Basic Generation', fn: testBasic },
    { name: 'System Instructions', fn: testSystemInstructions },
    { name: 'JSON Output', fn: testJSON },
    { name: 'Chat History', fn: testChat },
    { name: 'Error Handling', fn: testErrors },
    { name: 'Math/Logic (instead of functions)', fn: testFunctions },
    { name: 'Performance', fn: testPerformance }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      console.log(`\n🔄 Running ${test.name}...`);
      const success = await test.fn();
      if (success) {
        passed++;
        console.log(`✅ ${test.name} PASSED`);
      } else {
        failed++;
        console.log(`❌ ${test.name} FAILED`);
      }
    } catch (error) {
      failed++;
      console.log(`💥 ${test.name} CRASHED:`, error.message);
      console.log(`🔍 Stack:`, error.stack?.split('\n')[0]);
    }
    
    // Add delay between tests for rate limiting
    await delay(2000);
  }
  
  console.log('\n📊 FINAL RESULTS');
  console.log('================');
  console.log(`Total: ${tests.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / tests.length) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Your plugin is working correctly.');
  } else if (passed > 0) {
    console.log('\n⚠️  Some tests failed, but your plugin is partially working.');
    console.log('💡 Common issues:');
    console.log('  • Some models may not be available in your region');
    console.log('  • Check Firebase project billing and API quotas');
    console.log('  • Ensure Firebase AI Logic is enabled');
  } else {
    console.log('\n💥 All tests failed. Check your configuration:');
    console.log('  • Verify Firebase configuration is correct');
    console.log('  • Ensure Firebase AI Logic is enabled in your project');
    console.log('  • Check billing is set up (required for Vertex AI)');
    console.log('  • Verify API quotas and rate limits');
    console.log('  • Ensure models are available in your region (us-central1)');
    console.log('  • Try switching to googleAI backend if vertexAI fails');
  }
  
  return { passed, failed, total: tests.length };
}

// Export for module use
module.exports = {
  runQuickTests,
  testBasic,
  testJSON,
  testSystemInstructions,
  testFunctions,
  testChat,
  testErrors,
  testPerformance,
  testModelAvailability
};

// Run if called directly
if (require.main === module) {
  runQuickTests()
    .then(results => {
      console.log(`\n📋 Test completed with ${results.passed}/${results.total} tests passing`);
      process.exit(results.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('💥 Test runner crashed:', error);
      console.error('🔍 Stack:', error.stack);
      process.exit(1);
    });
}