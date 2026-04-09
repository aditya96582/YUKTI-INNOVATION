/**
 * Simple Backend Test Script
 * Run this to verify backend API is working
 */

const BASE_URL = 'http://localhost:5000/api';

async function testAPI(method, endpoint, data = null) {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }

    console.log(`\n${method} ${endpoint}`);
    if (data) console.log('Data:', JSON.stringify(data, null, 2));

    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const result = await response.json();

    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));

    return result;
  } catch (error) {
    console.error('Error:', error.message);
    return null;
  }
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('BACKEND API TEST');
  console.log('='.repeat(60));

  // Test 1: Health Check
  console.log('\n--- Test 1: Health Check ---');
  await testAPI('GET', '/health');

  // Test 2: Create Lost Item
  console.log('\n--- Test 2: Create Lost Item ---');
  const lostItem = await testAPI('POST', '/items/lost', {
    title: 'Test Black Backpack',
    description: 'Nike backpack with laptop',
    category: 'bags',
    location: 'Library',
    date: '2026-04-10',
    reward: 50,
    userId: 'user_test',
    userName: 'Test User',
  });

  // Test 3: Get Lost Items
  console.log('\n--- Test 3: Get Lost Items ---');
  await testAPI('GET', '/items/lost');

  // Test 4: Create Found Item
  console.log('\n--- Test 4: Create Found Item ---');
  await testAPI('POST', '/items/found', {
    title: 'Test Blue Water Bottle',
    description: 'Stainless steel bottle',
    category: 'other',
    location: 'Cafeteria',
    date: '2026-04-10',
    userId: 'user_test',
    userName: 'Test User',
  });

  // Test 5: Get Found Items
  console.log('\n--- Test 5: Get Found Items ---');
  await testAPI('GET', '/items/found');

  // Test 6: Get Pharmacies
  console.log('\n--- Test 6: Get Pharmacies ---');
  await testAPI('GET', '/pharmacies');

  // Test 7: Create Medical Request
  console.log('\n--- Test 7: Create Medical Request ---');
  await testAPI('POST', '/medical', {
    medicines: [
      { name: 'Paracetamol 500mg', dosage: 'Twice daily', quantity: '10 tablets' }
    ],
    location: 'Campus Hostel',
    userId: 'user_test',
    userName: 'Test User',
  });

  // Test 8: Get Medical Requests
  console.log('\n--- Test 8: Get Medical Requests ---');
  await testAPI('GET', '/medical');

  console.log('\n' + '='.repeat(60));
  console.log('TESTS COMPLETED');
  console.log('='.repeat(60));
  console.log('\nIf all tests show "success: true", the backend is working!');
  console.log('If you see connection errors, make sure the backend is running:');
  console.log('  cd server && npm start\n');
}

// Run tests
runTests().catch(console.error);
