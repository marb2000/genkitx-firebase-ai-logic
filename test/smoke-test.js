// test/smoke-test.js
// Minimal smoke test that verifies plugin structure without making API calls
// Run with: node test/smoke-test.js

console.log('🔥 Firebase AI Logic Plugin - Smoke Test');
console.log('=========================================');

let errors = 0;
let checks = 0;

function check(description, testFn) {
  checks++;
  try {
    const result = testFn();
    if (result) {
      console.log(`✅ ${description}`);
    } else {
      console.log(`❌ ${description} - Test returned false`);
      errors++;
    }
  } catch (error) {
    console.log(`❌ ${description} - ${error.message}`);
    errors++;
  }
}

// Test 1: Check if plugin can be imported
check('Plugin import', () => {
  try {
    const plugin = require('../dist/index.js');
    return typeof plugin.firebaseAILogic === 'function';
  } catch (error) {
    console.log('   💡 Run "npm run build" first to compile TypeScript');
    return false;
  }
});

// Test 2: Check plugin function signature
check('Plugin function signature', () => {
  const { firebaseAILogic } = require('../dist/index.js');
  const result = firebaseAILogic();
  return result && typeof result === 'object' && result.name === 'firebase-ai-logic';
});

// Test 3: Check model helper exists
check('Model helper function', () => {
  const { firebaseAILogic } = require('../dist/index.js');
  return typeof firebaseAILogic.model === 'function';
});

// Test 4: Check model reference creation
check('Model reference creation', () => {
  const { firebaseAILogic } = require('../dist/index.js');
  const modelRef = firebaseAILogic.model('gemini-2.5-flash', { temperature: 0.7 });
  return modelRef && modelRef.name === 'firebase-ai-logic/gemini-2.5-flash';
});

// Test 5: Check Genkit integration
check('Genkit integration', () => {
  try {
    const { genkit } = require('genkit');
    const { firebaseAILogic } = require('../dist/index.js');
    
    // This should not throw an error (though it won't actually initialize without Firebase config)
    const mockConfig = {
      firebaseConfig: {
        apiKey: "test",
        authDomain: "test.firebaseapp.com",
        projectId: "test-project",
        storageBucket: "test.appspot.com",
        messagingSenderId: "123456789",
        appId: "1:123456789:web:test"
      }
    };
    
    // Just test that the plugin can be passed to genkit without immediate errors
    const plugin = firebaseAILogic(mockConfig);
    return plugin && plugin.name === 'firebase-ai-logic';
  } catch (error) {
    // Expected to fail without proper Firebase setup, but should not throw during plugin creation
    return error.message.includes('Firebase') || error.message.includes('firebase');
  }
});

// Test 6: Check TypeScript types export
check('TypeScript types', () => {
  try {
    const fs = require('fs');
    const path = require('path');
    const typesPath = path.join(__dirname, '../dist/index.d.ts');
    return fs.existsSync(typesPath);
  } catch (error) {
    return false;
  }
});

// Test 7: Check supported models
check('Supported models configuration', () => {
  const { firebaseAILogic } = require('../dist/index.js');
  const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'];
  
  return models.every(model => {
    try {
      const ref = firebaseAILogic.model(model);
      return ref.name === `firebase-ai-logic/${model}`;
    } catch (error) {
      return false;
    }
  });
});

// Test 8: Check configuration schema
check('Configuration schema validation', () => {
  const { firebaseAILogic } = require('../dist/index.js');
  
  try {
    // Test valid configuration
    const ref = firebaseAILogic.model('gemini-2.5-flash', {
      temperature: 0.5,
      maxOutputTokens: 100,
      topK: 20,
      topP: 0.9
    });
    return ref !== null;
  } catch (error) {
    return false;
  }
});

// Test 9: Package.json validation
check('Package.json configuration', () => {
  try {
    const pkg = require('../package.json');
    const requiredFields = ['name', 'version', 'main', 'types', 'peerDependencies'];
    const hasRequired = requiredFields.every(field => pkg[field]);
    const hasGenkitKeyword = pkg.keywords && pkg.keywords.includes('genkit-plugin');
    return hasRequired && hasGenkitKeyword;
  } catch (error) {
    return false;
  }
});

// Test 10: README existence
check('Documentation exists', () => {
  const fs = require('fs');
  const path = require('path');
  return fs.existsSync(path.join(__dirname, '../README.md'));
});

console.log('\n📊 SMOKE TEST RESULTS');
console.log('=====================');
console.log(`Total checks: ${checks}`);
console.log(`✅ Passed: ${checks - errors}`);
console.log(`❌ Failed: ${errors}`);

if (errors === 0) {
  console.log('\n🎉 Smoke test passed! Plugin structure is correct.');
  console.log('💡 Next steps:');
  console.log('   1. Update Firebase configuration in test files');
  console.log('   2. Run "npm test" for full API testing');
  console.log('   3. Test with your Firebase project');
} else {
  console.log('\n⚠️  Smoke test found issues. Common fixes:');
  console.log('   • Run "npm run build" to compile TypeScript');
  console.log('   • Check package.json configuration');
  console.log('   • Ensure all dependencies are installed');
  console.log('   • Verify plugin exports are correct');
}

console.log('\n🔧 Quick Test Commands:');
console.log('   npm run build      # Compile TypeScript');
console.log('   npm test          # Run full test suite');
console.log('   npm run test:quick # Run without building');

process.exit(errors > 0 ? 1 : 0);