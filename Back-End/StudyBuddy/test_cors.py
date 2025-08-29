#!/usr/bin/env python3
"""
Simple CORS test script to verify the Django backend is properly configured
"""
import requests
import json

def test_cors():
    base_url = "https://mindly-backend-yp3r.onrender.com"
    
    # Test 1: Health check endpoint
    print("Testing health check endpoint...")
    try:
        response = requests.get(f"{base_url}/api/health/")
        print(f"Health check status: {response.status_code}")
        print(f"Response headers: {dict(response.headers)}")
        print(f"Response body: {response.text}")
    except Exception as e:
        print(f"Health check failed: {e}")
    
    print("\n" + "="*50 + "\n")
    
    # Test 2: OPTIONS request to registration endpoint
    print("Testing OPTIONS request to registration endpoint...")
    try:
        headers = {
            'Origin': 'https://mindly-simowwn.vercel.app',
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type, Authorization'
        }
        response = requests.options(f"{base_url}/api/users/register/", headers=headers)
        print(f"OPTIONS request status: {response.status_code}")
        print(f"Response headers: {dict(response.headers)}")
        print(f"Response body: {response.text}")
    except Exception as e:
        print(f"OPTIONS request failed: {e}")
    
    print("\n" + "="*50 + "\n")
    
    # Test 3: POST request to registration endpoint
    print("Testing POST request to registration endpoint...")
    try:
        headers = {
            'Origin': 'https://mindly-simowwn.vercel.app',
            'Content-Type': 'application/json'
        }
        data = {
            'username': 'test_user_cors',
            'password': 'test_password_123'
        }
        response = requests.post(
            f"{base_url}/api/users/register/", 
            headers=headers, 
            data=json.dumps(data)
        )
        print(f"POST request status: {response.status_code}")
        print(f"Response headers: {dict(response.headers)}")
        print(f"Response body: {response.text}")
    except Exception as e:
        print(f"POST request failed: {e}")

if __name__ == "__main__":
    test_cors()
