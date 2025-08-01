// frontend/js/login.js - UPDATED FOR DEBUGGING SUCCESSFUL LOGIN RESPONSE

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginMessageDisplay = document.getElementById('loginMessage');

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        handleLogin();
    });

    async function handleLogin() {
        const fullName = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;

        loginMessageDisplay.textContent = '';
        loginMessageDisplay.className = 'message';

        if (fullName === '' || password === '') {
            loginMessageDisplay.textContent = 'Please enter both full name and password.';
            loginMessageDisplay.className = 'message error';
            return;
        }

        const formData = new URLSearchParams();
        formData.append('full_name', fullName);
        formData.append('password', password);

        try {
            const response = await fetch('http://127.0.0.1:8000/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData,
            });

            // --- DEBUGGING LOGS ADDED HERE ---
            console.log('API Response object:', response);
            const responseText = await response.text(); // Get raw text to inspect
            console.log('API Response raw text:', responseText);
            // --- END DEBUGGING LOGS ---

            if (response.ok) {
                let result;
                try {
                    result = JSON.parse(responseText); // Parse the text manually
                    console.log('Parsed JSON result:', result);
                } catch (jsonParseError) {
                    // This means responseText was not valid JSON
                    console.error('JSON parsing failed for 200 OK response:', jsonParseError);
                    loginMessageDisplay.textContent = 'Login successful, but an error occurred processing the server response. Check console.';
                    loginMessageDisplay.className = 'message error';
                    return; // Stop here if JSON parsing fails
                }

                loginMessageDisplay.textContent = result.message || 'Login successful!';
                loginMessageDisplay.className = 'message success';
                loginForm.reset();
                
                // Keep logging to confirm redirect attempts
                console.log('Attempting redirect to index.html...');
                setTimeout(() => {
                    window.location.href = 'index.html'; // Redirect to your main analysis page
                }, 1500);

            } else { // Handle non-OK responses (like 401 Unauthorized)
                let errorData = { detail: 'Login failed due to an unknown server error.' };
                try {
                    errorData = JSON.parse(responseText); // Try parsing the text as JSON error
                } catch (jsonParseError) {
                    console.error('Failed to parse error JSON from server:', jsonParseError, 'Raw response:', responseText);
                    errorData.detail = `Server error: ${response.status}. ${responseText.substring(0, 100)}...`;
                }
                
                loginMessageDisplay.textContent = errorData.detail || 'Login failed. Please try again.';
                loginMessageDisplay.className = 'message error';
                console.error('Login error:', errorData);
            }
        } catch (error) { // This catch block is for true NETWORK errors (e.g., server offline, CORS block)
            loginMessageDisplay.textContent = 'Network error. Could not connect to the server. (Is backend running?)';
            loginMessageDisplay.className = 'message error';
            console.error('Fetch error (likely network related):', error);
        }
    }
    // login.js - relevant snippet of handleLogin function

            if (response.ok) {
                let result;
                try {
                    result = JSON.parse(responseText);
                    console.log('Parsed JSON result:', result);
                } catch (jsonParseError) {
                    console.error('JSON parsing failed for 200 OK response:', jsonParseError);
                    loginMessageDisplay.textContent = 'Login successful, but an error occurred processing the server response. Check console.';
                    loginMessageDisplay.className = 'message error';
                    return;
                }

                loginMessageDisplay.textContent = result.message || 'Login successful!';
                loginMessageDisplay.className = 'message success';
                loginForm.reset();
                
                // NEW: Store the user's full name in localStorage
                if (result.full_name) {
                    localStorage.setItem('loggedInUserName', result.full_name);
                }

                console.log('Attempting redirect to index.html...');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);

            } else {
                // ... (rest of your error handling for login.js)
            }
});