/**
 * Frontend Tests for KidLearn Platform
 * Tests the API service and component functionality
 */

import { api, User, Material } from '../services/api';

// Mock localStorage
const localStorageMock = {
  store: {} as Record<string, string>,
  getItem(key: string) {
    return this.store[key] || null;
  },
  setItem(key: string, value: string) {
    this.store[key] = value;
  },
  removeItem(key: string) {
    delete this.store[key];
  },
  clear() {
    this.store = {};
  },
};

// @ts-ignore
global.localStorage = localStorageMock;

// Test utilities
function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runTest(name: string, testFn: () => Promise<void>): Promise<boolean> {
  try {
    await testFn();
    console.log(`✅ PASS: ${name}`);
    return true;
  } catch (error) {
    console.error(`❌ FAIL: ${name}`);
    console.error(`   Error: ${error instanceof Error ? error.message : error}`);
    return false;
  }
}

// Test Suite
async function runAllTests(): Promise<void> {
  console.log('\n🧪 Running KidLearn Frontend Tests...\n');
  
  const results: boolean[] = [];

  // Clear state before each test
  localStorageMock.clear();

  // Auth Tests
  results.push(await runTest('Login with valid credentials', async () => {
    const response = await api.login({ email: 'parent@example.com', password: 'password123' });
    assert(response.success === true, 'Login should succeed');
    assert(response.data?.email === 'parent@example.com', 'Email should match');
    assert(response.data?.role === 'parent', 'Role should be parent');
    await api.logout();
  }));

  results.push(await runTest('Login with invalid credentials', async () => {
    const response = await api.login({ email: 'wrong@email.com', password: 'wrongpass' });
    assert(response.success === false, 'Login should fail');
    assert(response.error !== undefined, 'Error message should be present');
  }));

  results.push(await runTest('Register new user', async () => {
    const response = await api.register({
      email: 'newuser@test.com',
      password: 'test123',
      name: 'New User',
      role: 'parent',
    });
    assert(response.success === true, 'Registration should succeed');
    assert(response.data?.name === 'New User', 'Name should match');
    await api.logout();
  }));

  results.push(await runTest('Get current user when logged in', async () => {
    await api.login({ email: 'teacher@example.com', password: 'password123' });
    const response = await api.getCurrentUser();
    assert(response.success === true, 'Should get current user');
    assert(response.data?.role === 'educator', 'Role should be educator');
    await api.logout();
  }));

  results.push(await runTest('Get current user when logged out', async () => {
    const response = await api.getCurrentUser();
    assert(response.success === true, 'Request should succeed');
    assert(response.data === null, 'User should be null');
  }));

  // Materials Tests
  results.push(await runTest('Get all materials', async () => {
    const response = await api.getMaterials();
    assert(response.success === true, 'Should get materials');
    assert(Array.isArray(response.data), 'Data should be an array');
    assert(response.data!.length > 0, 'Should have materials');
  }));

  results.push(await runTest('Filter materials by type', async () => {
    const response = await api.getMaterials({ type: 'game' });
    assert(response.success === true, 'Should get materials');
    assert(response.data!.every(m => m.type === 'game'), 'All materials should be games');
  }));

  results.push(await runTest('Filter materials by grade level', async () => {
    const response = await api.getMaterials({ gradeLevel: 'grade1' });
    assert(response.success === true, 'Should get materials');
    assert(response.data!.every(m => m.gradeLevel === 'grade1'), 'All materials should be grade 1');
  }));

  results.push(await runTest('Search materials', async () => {
    const response = await api.getMaterials({ search: 'math' });
    assert(response.success === true, 'Should get materials');
    assert(response.data!.length > 0, 'Should find materials');
  }));

  results.push(await runTest('Get material by ID', async () => {
    const response = await api.getMaterialById('1');
    assert(response.success === true, 'Should get material');
    assert(response.data?.id === '1', 'ID should match');
  }));

  results.push(await runTest('Get material by invalid ID', async () => {
    const response = await api.getMaterialById('invalid');
    assert(response.success === false, 'Should fail');
    assert(response.error !== undefined, 'Error should be present');
  }));

  // Educator-only Tests
  results.push(await runTest('Submit material as educator', async () => {
    await api.login({ email: 'teacher@example.com', password: 'password123' });
    const response = await api.submitMaterial({
      title: 'Test Material',
      description: 'Test description',
      type: 'worksheet',
      gradeLevel: 'grade2',
      isInteractive: false,
      tags: ['test'],
    });
    assert(response.success === true, 'Should submit material');
    assert(response.data?.title === 'Test Material', 'Title should match');
    await api.logout();
  }));

  results.push(await runTest('Submit material as parent fails', async () => {
    await api.login({ email: 'parent@example.com', password: 'password123' });
    const response = await api.submitMaterial({
      title: 'Test Material',
      description: 'Test description',
      type: 'worksheet',
      gradeLevel: 'grade2',
      isInteractive: false,
      tags: ['test'],
    });
    assert(response.success === false, 'Should fail');
    assert(response.error !== undefined, 'Error should be present');
    await api.logout();
  }));

  // Interaction Tests
  results.push(await runTest('Download material', async () => {
    const response = await api.downloadMaterial('1');
    assert(response.success === true, 'Should download');
  }));

  results.push(await runTest('Like material', async () => {
    const response = await api.likeMaterial('1');
    assert(response.success === true, 'Should like');
    assert(typeof response.data?.likes === 'number', 'Likes should be a number');
  }));

  // Stats Test
  results.push(await runTest('Get stats', async () => {
    const response = await api.getStats();
    assert(response.success === true, 'Should get stats');
    assert(typeof response.data?.totalMaterials === 'number', 'Should have total materials');
    assert(typeof response.data?.totalDownloads === 'number', 'Should have total downloads');
  }));

  // Summary
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log('\n' + '='.repeat(50));
  console.log(`📊 Test Results: ${passed}/${total} passed`);
  console.log('='.repeat(50) + '\n');

  if (passed !== total) {
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(console.error);
