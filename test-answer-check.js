const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Test script for Answer Check API
async function testAnswerCheck() {
  const baseUrl = 'http://localhost:3000';
  
  // You need to replace this with a valid JWT token
  const jwtToken = 'YOUR_JWT_TOKEN_HERE';
  
  console.log('🧪 Testing Answer Check API...\n');
  
  // Test 1: Create a sample text file
  const testAnswer = `Constitutional law is the body of law that defines the relationship between different entities within a state, namely, the executive, the legislature, and the judiciary.

Key principles include:
1. Separation of powers
2. Rule of law
3. Fundamental rights protection
4. Democratic governance

Constitutional law ensures that government power is limited and that individual rights are protected. It provides the framework for how laws are made, enforced, and interpreted.`;

  const testFilePath = path.join(__dirname, 'test-answer.txt');
  fs.writeFileSync(testFilePath, testAnswer);
  
  try {
    // Test 2: Submit answer for checking
    console.log('📝 Testing answer submission...');
    
    const form = new FormData();
    form.append('file', fs.createReadStream(testFilePath));
    form.append('question', 'Explain the concept of constitutional law and its importance in a democratic society.');
    form.append('totalMarks', '10');
    form.append('gradingCriteria', 'Focus on clarity, examples, and understanding of key principles.');
    
    const checkResponse = await fetch(`${baseUrl}/answer-check/check`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        ...form.getHeaders()
      },
      body: form
    });
    
    if (checkResponse.ok) {
      const result = await checkResponse.json();
      console.log('✅ Answer check successful!');
      console.log(`Score: ${result.scoredMarks}/${result.totalMarks} (${result.percentage}%)`);
      console.log(`Feedback: ${result.feedback}`);
      console.log(`Suggestions: ${result.suggestions}\n`);
    } else {
      console.log('❌ Answer check failed:', await checkResponse.text());
    }
    
    // Test 3: Get history
    console.log('📚 Testing history retrieval...');
    
    const historyResponse = await fetch(`${baseUrl}/answer-check/history?page=1&limit=5`, {
      headers: {
        'Authorization': `Bearer ${jwtToken}`
      }
    });
    
    if (historyResponse.ok) {
      const history = await historyResponse.json();
      console.log('✅ History retrieved successfully!');
      console.log(`Total records: ${history.pagination.total}`);
      console.log(`Current page: ${history.pagination.page}/${history.pagination.pages}`);
      console.log(`Records on this page: ${history.results.length}\n`);
    } else {
      console.log('❌ History retrieval failed:', await historyResponse.text());
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    // Cleanup
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  }
}

// Instructions
console.log(`
🚀 Answer Check API Test Script

Before running this test:
1. Make sure your server is running on http://localhost:3000
2. Replace 'YOUR_JWT_TOKEN_HERE' with a valid JWT token
3. Run: node test-answer-check.js

To get a JWT token:
1. Register/login via the auth API
2. Copy the token from the response
3. Update the jwtToken variable above
`);

// Uncomment the line below to run the test
// testAnswerCheck();