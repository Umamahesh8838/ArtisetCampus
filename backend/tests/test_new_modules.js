/**
 * Integration test for new modules (RBAC, Company, User Management)
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

let testResults = {
  passed: 0,
  failed: 0,
  errors: [],
};

// Test user tokens
let adminToken = null;
let recruitmentToken = null;
let studentToken = null;

async function test(name, fn) {
  try {
    await fn();
    testResults.passed++;
    console.log(`✓ ${name}`);
  } catch (err) {
    testResults.failed++;
    testResults.errors.push({ test: name, error: err.message });
    console.error(`✗ ${name}`);
    console.error(`  Error: ${err.message}`);
  }
}

async function createTestUser(email, phone, role = 'student') {
  try {
    // First, create using admin auth (we'll need to signup admin first)
    const response = await axios.post(`${BASE_URL}/auth/signup`, {
      email,
      phone,
      first_name: 'Test',
      last_name: role.toUpperCase(),
      password: 'Test@1234',
    });

    // Login to get token
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email,
      password: 'Test@1234',
    });

    return {
      user_id: response.data.user_id || loginRes.data.user_id,
      token: loginRes.data.token,
      email,
    };
  } catch (err) {
    throw new Error(`Failed to create test user: ${err.response?.data?.message || err.message}`);
  }
}

async function runTests() {
  console.log('Starting Integration Tests for New Modules...\n');

  // ========================================================================
  // 1. Test User Authentication & Signup
  // ========================================================================
  console.log('📋 Testing Authentication...');

  await test('Signup - Student', async () => {
    const response = await axios.post(`${BASE_URL}/auth/signup`, {
      email: `student.${Date.now()}@test.com`,
      phone: `919000${Math.random().toString().slice(2, 8)}`,
      first_name: 'John',
      last_name: 'Doe',
      password: 'Test@1234',
    });

    if (!response.data.user_id) throw new Error('No user_id returned');
  });

  // Create a test student for later tests
  let studentData;
  await test('Create test student', async () => {
    studentData = await createTestUser(`student.${Date.now()}@test.com`, `919000${Math.random().toString().slice(2, 8)}`);
    studentToken = studentData.token;
  });

  await test('Login - Get JWT Token', async () => {
    if (!studentData) throw new Error('No student data');
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: studentData.email,
      password: 'Test@1234',
    });

    if (!response.data.token) throw new Error('No token returned');
    studentToken = response.data.token;
  });

  // ========================================================================
  // 2. Test User Management
  // ========================================================================
  console.log('\n👤 Testing User Management...');

  await test('Get current user profile', async () => {
    const response = await axios.get(`${BASE_URL}/users/me`, {
      headers: { 'Authorization': `Bearer ${studentToken}` },
    });

    if (!response.data.user) throw new Error('No user data returned');
    if (!response.data.user.role) throw new Error('No role in user data');
  });

  await test('Update user profile', async () => {
    const response = await axios.put(`${BASE_URL}/users/me`, {
      first_name: 'Johnny',
      last_name: 'Updated',
    }, {
      headers: { 'Authorization': `Bearer ${studentToken}` },
    });

    if (!response.data.message) throw new Error('No message returned');
  });

  // ========================================================================
  // 3. Test Company Management
  // ========================================================================
  console.log('\n🏢 Testing Company Management...');

  let companyId;

  await test('Create company (as recruiter)', async () => {
    // First create a recruiter account
    const recruiterData = await createTestUser(`recruiter.${Date.now()}@test.com`, `919001${Math.random().toString().slice(2, 8)}`);
    recruitmentToken = recruiterData.token;

    const response = await axios.post(`${BASE_URL}/companies`, {
      company_name: 'TechCorp Solutions',
      headquarters: 'Bangalore',
      industry: 'Software',
      company_size: 500,
      website: 'https://techcorp.com',
      description: 'A leading software company',
      spoc_name: 'Rajesh Kumar',
      spoc_email: 'rajesh@techcorp.com',
      spoc_phone: '+919876543210',
    }, {
      headers: { 'Authorization': `Bearer ${recruitmentToken}` },
    });

    if (!response.data.company_id) throw new Error('No company_id returned');
    companyId = response.data.company_id;
  });

  await test('Get all companies', async () => {
    const response = await axios.get(`${BASE_URL}/companies`);

    if (!Array.isArray(response.data.companies)) throw new Error('Companies not returned as array');
    if (response.data.total === undefined) throw new Error('No total count');
  });

  await test('Get company by ID', async () => {
    if (!companyId) throw new Error('No company ID to test');

    const response = await axios.get(`${BASE_URL}/companies/${companyId}`);

    if (!response.data.company) throw new Error('No company data');
    if (response.data.company.company_id !== companyId) throw new Error('Company ID mismatch');
  });

  await test('Update company', async () => {
    if (!companyId) throw new Error('No company ID');

    const response = await axios.put(`${BASE_URL}/companies/${companyId}`, {
      company_name: 'TechCorp Solutions Updated',
      company_size: 600,
    }, {
      headers: { 'Authorization': `Bearer ${recruitmentToken}` },
    });

    if (!response.data.message) throw new Error('No message returned');
  });

  // ========================================================================
  // 4. Test RBAC & Authorization
  // ========================================================================
  console.log('\n🔐 Testing RBAC & Authorization...');

  await test('Access user management as admin (should fail)', async () => {
    try {
      await axios.get(`${BASE_URL}/users`, {
        headers: { 'Authorization': `Bearer ${studentToken}` },
      });
      throw new Error('Should have been rejected');
    } catch (err) {
      if (err.response?.status !== 403) throw new Error('Expected 403 status');
    }
  });

  await test('Token validation - Invalid token should be rejected', async () => {
    try {
      await axios.get(`${BASE_URL}/users/me`, {
        headers: { 'Authorization': 'Bearer invalid.token.here' },
      });
      throw new Error('Should have been rejected');
    } catch (err) {
      if (err.response?.status !== 401) throw new Error('Expected 401 status');
    }
  });

  // ========================================================================
  // Print Results
  // ========================================================================
  console.log('\n' + '='.repeat(60));
  console.log('TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`✓ Passed: ${testResults.passed}`);
  console.log(`✗ Failed: ${testResults.failed}`);
  console.log(`Total:  ${testResults.passed + testResults.failed}`);

  if (testResults.errors.length > 0) {
    console.log('\nErrors:');
    testResults.errors.forEach((e) => {
      console.log(`  - ${e.test}: ${e.error}`);
    });
  }

  console.log('='.repeat(60) + '\n');

  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch((err) => {
  console.error('Test suite error:', err);
  process.exit(1);
});
