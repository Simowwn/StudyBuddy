// JavaScript test for CORS - run this in your browser console
// Make sure you're on https://mindly-simowwn.vercel.app

async function testCORS() {
    const baseUrl = 'https://mindly-backend-yp3r.onrender.com';
    
    console.log('Testing CORS configuration...');
    
    // Test 1: Health check
    try {
        console.log('Testing health check...');
        const healthResponse = await fetch(`${baseUrl}/api/health/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        console.log('Health check status:', healthResponse.status);
        console.log('Health check headers:', Object.fromEntries(healthResponse.headers.entries()));
        const healthData = await healthResponse.text();
        console.log('Health check response:', healthData);
    } catch (error) {
        console.error('Health check failed:', error);
    }
    
    console.log('\n---\n');
    
    // Test 2: Registration endpoint
    try {
        console.log('Testing registration endpoint...');
        const registerResponse = await fetch(`${baseUrl}/api/users/register/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: 'test_user_' + Date.now(),
                password: 'test_password_123'
            }),
        });
        console.log('Registration status:', registerResponse.status);
        console.log('Registration headers:', Object.fromEntries(registerResponse.headers.entries()));
        const registerData = await registerResponse.text();
        console.log('Registration response:', registerData);
    } catch (error) {
        console.error('Registration failed:', error);
    }
}

// Run the test
testCORS();
