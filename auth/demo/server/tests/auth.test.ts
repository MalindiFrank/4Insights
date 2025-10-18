/**
 * Simple test script to verify the authentication system
 * Run with: deno run --allow-net --allow-env auth.test.ts
 */


async function testAuthFlow() {
  console.log(' Testing Authentication Flow...\n');

  const baseUrl = 'http://localhost:8001';

  try {
    // Test 1: Health check
    console.log('1. Testing health check...');
    const healthResponse = await fetch(`${baseUrl}/health`);
    const healthData = await healthResponse.json();
    console.log(' Health check:', healthData.status);
    console.log('');

    // Test 2: Generate credentials
    console.log('2. Testing credential generation...');
    const credResponse = await fetch(`${baseUrl}/demo/credentials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const credData = await credResponse.json();
    console.log(' Credentials generated:', {
      apiKey: credData.data.apiKey,
      passphrase: credData.data.passphrase
    });
    console.log('');

    // Test 3: Create session (login)
    console.log('3. Testing session creation...');
    const sessionResponse = await fetch(`${baseUrl}/demo/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: credData.data.apiKey,
        passphrase: credData.data.passphrase
      })
    });
    const sessionData = await sessionResponse.json();
    console.log(' Session created:', {
      token: sessionData.data.token.substring(0, 20) + '...',
      expiresIn: sessionData.data.expiresIn
    });
    console.log('');

    // Test 4: Verify token
    console.log('4. Testing token verification...');
    const verifyResponse = await fetch(`${baseUrl}/demo/verify`, {
      headers: { 'Authorization': `Bearer ${sessionData.data.token}` }
    });
    const verifyData = await verifyResponse.json();
    console.log(' Token verified:', {
      apiKey: verifyData.data.apiKey,
      valid: verifyData.data.valid
    });
    console.log('');

    // Test 5: Logout
    console.log('5. Testing logout...');
    const logoutResponse = await fetch(`${baseUrl}/demo/sessions`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${sessionData.data.token}` }
    });
    const logoutData = await logoutResponse.json();
    console.log(' Logout successful:', logoutData.message);
    console.log('');

    console.log(' All tests passed! Authentication system is working correctly.');

  } catch (error) {
    console.error(' Test failed:', error);
    console.log('\n Make sure the auth server is running:');
    console.log('   deno run --allow-net --allow-env main.ts');
  }
}

// Run tests if this file is executed directly
if (import.meta.main) {
  testAuthFlow();
}
