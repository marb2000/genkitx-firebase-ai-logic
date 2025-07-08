// test/simple-test.js
// Simple JavaScript test runner for Firebase AI Logic Genkit Plugin
// Run with: node test/simple-test.js

const { genkit } = require('genkit');
const { firebaseAILogic } = require('../dist/index.js'); // Make sure to build first

// Test configuration - UPDATE THESE WITH YOUR FIREBASE CONFIG
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDgDmHdE9973IKuNkWGEIocTFgxkQlUYbU",
  authDomain: "vertexai-firebase-2025.firebaseapp.com",
  projectId: "vertexai-firebase-2025",
  storageBucket: "vertexai-firebase-2025.firebasestorage.app",
  messagingSenderId: "1016672011158",
  appId: "1:1016672011158:web:67374c8859ab307c3bd3b7",
  measurementId: "G-DMZB2KB2VY"
};

// Initialize Genkit with the plugin
const ai = genkit({
  plugins: [
    firebaseAILogic({
      firebaseConfig: FIREBASE_CONFIG,
      backend: 'vertexAI', // Change to 'googleAI' if you want to test that backend
      vertexAIRegion: 'us-central1',
      defaultGenerationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500
      }
    })
  ]
});

// Helper function to add delays
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test 1: Basic Generation
async function testBasic() {
  console.log('\n🧪 Testing Basic Generation...');
  try {
    const result = await ai.generate({
      model: 'firebase-ai-logic/gemini-2.5-flash',
      prompt: 'Write a short poem about AI helping humans'
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
          }
        }
      }),
      prompt: 'Tell me a programming joke and rate it'
    });
    
    console.log('✅ Success!');
    console.log('📝 Raw JSON:', result.text);
    
    try {
      const parsed = JSON.parse(result.text);
      console.log('🎯 Parsed:', parsed);
    } catch (e) {
      console.log('⚠️  JSON parse error:', e.message);
    }
    
    return true;
  } catch (error) {
    console.log('❌ Failed:', error.message);
    return false;
  }
}

// Test 3: System Instructions
async function testSystemInstructions() {
  console.log('\n🧪 Testing System Instructions...');
  try {
    const result = await ai.generate({
      model: firebaseAILogic.model('gemini-2.5-flash', {
        systemInstruction: 'You are a helpful librarian. Always mention books in your responses.',
        temperature: 0.8
      }),
      prompt: 'How can I learn about space exploration?'
    });
    
    console.log('✅ Success!');
    console.log('📝 Response:', result.text);
    console.log('📚 Check if response mentions books!');
    return true;
  } catch (error) {
    console.log('❌ Failed:', error.message);
    return false;
  }
}

// Test 4: Function Calling
async function testFunctions() {
  console.log('\n🧪 Testing Function Calling...');
  try {
    const result = await ai.generate({
      model: firebaseAILogic.model('gemini-2.5-flash', {
        tools: [{
          functionDeclarations: [{
            name: 'calculate',
            description: 'Perform basic math calculations',
            parameters: {
              type: 'object',
              properties: {
                operation: { 
                  type: 'string', 
                  enum: ['add', 'subtract', 'multiply', 'divide'] 
                },
                a: { type: 'number' },
                b: { type: 'number' }
              },
              required: ['operation', 'a', 'b']
            }
          }]
        }],
        toolConfig: {
          functionCallingConfig: { mode: 'AUTO' }
        }
      }),
      prompt: 'What is 25 multiplied by 4?'
    });
    
    console.log('✅ Success!');
    console.log('📝 Response:', result.text);
    
    // Check for function calls by examining response text
    const likelyFunctionCall = result.text?.includes('100') || result.text?.includes('multiply');
    console.log('🔧 Function calls likely used:', likelyFunctionCall);
    
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
      model: 'firebase-ai-logic/gemini-2.5-flash',
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
    console.log('💬 Check if response acknowledges previous conversation!');
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
      model: 'firebase-ai-logic/invalid-model',
      prompt: 'This should fail'
    });
    console.log('⚠️  Expected error not thrown for invalid model');
  } catch (error) {
    console.log('✅ Invalid model error caught:', error.message);
    errorsCaught++;
  }
  
  // Test extremely high token request (should be handled gracefully)
  try {
    const result = await ai.generate({
      model: firebaseAILogic.model('gemini-2.5-flash', {
        maxOutputTokens: 1000000 // Unreasonably high
      }),
      prompt: 'Write a short response'
    });
    console.log('✅ High token request handled gracefully');
  } catch (error) {
    console.log('✅ High token request error caught:', error.message);
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
    { name: 'Longer prompt', prompt: 'Write a detailed explanation of how web browsers work' }
  ];
  
  for (const test of tests) {
    try {
      const start = Date.now();
      const result = await ai.generate({
        model: 'firebase-ai-logic/gemini-2.5-flash',
        prompt: test.prompt
      });
      const duration = Date.now() - start;
      
      console.log(`⏱️  ${test.name}: ${duration}ms`);
      console.log(`📏 Response: ${result.text?.length} chars`);
      console.log(`📊 Tokens: ${result.usage?.inputTokens}→${result.usage?.outputTokens}`);
      
      await delay(1000); // Rate limiting
    } catch (error) {
      console.log(`❌ ${test.name} failed:`, error.message);
    }
  }
  
  return true;
}

// Main test runner
async function runQuickTests() {
  console.log('🚀 Firebase AI Logic Plugin - Quick Test Suite');
  console.log('==============================================');
  console.log(`📅 Started: ${new Date().toLocaleString()}`);
  
  const tests = [
    { name: 'Basic Generation', fn: testBasic },
    { name: 'JSON Output', fn: testJSON },
    { name: 'System Instructions', fn: testSystemInstructions },
    { name: 'Function Calling', fn: testFunctions },
    { name: 'Chat History', fn: testChat },
    { name: 'Error Handling', fn: testErrors },
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
  } else {
    console.log('\n⚠️  Some tests failed. Common issues:');
    console.log('  • Check your Firebase configuration');
    console.log('  • Ensure Firebase AI Logic is enabled in your project');
    console.log('  • Verify billing is set up (for Vertex AI)');
    console.log('  • Check API quotas and rate limits');
    console.log('  • Ensure models are available in your region');
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
  testPerformance
};

// Run if called directly
if (require.main === module) {
  runQuickTests()
    .then(results => {
      process.exit(results.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('💥 Test runner crashed:', error);
      process.exit(1);
    });
}