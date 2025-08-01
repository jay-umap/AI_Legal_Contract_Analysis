document.addEventListener('DOMContentLoaded', () => {
    const registrationForm = document.getElementById('registrationForm');
    const messageDisplay = document.getElementById('message');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const outputSections = document.getElementById('outputSections');
    const contractFileInput = document.getElementById('contractFileInput');

    // --- Registration Logic ---
    if (registrationForm) {
        registrationForm.addEventListener('submit', (event) => {
            event.preventDefault();
            registerUser();
        });
    }

    async function registerUser() {
        const fullName = document.getElementById('username').value.trim();
        const dob = document.getElementById('dob').value;
        const gender = document.getElementById('gender').value;
        const profession = document.getElementById('profession').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const termsAccepted = document.getElementById('terms').checked;

        messageDisplay.textContent = '';
        messageDisplay.className = 'message';

        if (!fullName || !dob || !gender || !profession || !password || !confirmPassword) {
            messageDisplay.textContent = 'Please fill in all fields.';
            messageDisplay.className = 'message error';
            return;
        }
        if (password.length < 6) {
            messageDisplay.textContent = 'Password must be at least 6 characters.';
            messageDisplay.className = 'message error';
            return;
        }
        if (password !== confirmPassword) {
            messageDisplay.textContent = 'Passwords do not match.';
            messageDisplay.className = 'message error';
            return;
        }
        if (new Date(dob) > new Date()) {
            messageDisplay.textContent = 'Date of Birth cannot be in the future.';
            messageDisplay.className = 'message error';
            return;
        }
        if (!termsAccepted) {
            messageDisplay.textContent = 'You must agree to the Terms and Conditions.';
            messageDisplay.className = 'message error';
            return;
        }

        const formData = new URLSearchParams();
        formData.append('full_name', fullName);
        formData.append('dob', dob);
        formData.append('gender', gender);
        formData.append('profession', profession);
        formData.append('password', password);

        try {
            const response = await fetch('http://127.0.0.1:8000/register/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                messageDisplay.textContent = result.message || 'Registration successful!';
                messageDisplay.className = 'message success';
                registrationForm.reset();
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                messageDisplay.textContent = result.detail || 'Registration failed.';
                messageDisplay.className = 'message error';
            }
        } catch (error) {
            messageDisplay.textContent = 'Network error.';
            messageDisplay.className = 'message error';
        }
    }

    // --- Show Output Section ---
    function showOutput() {
        if (outputSections && outputSections.classList.contains('hidden')) {
            outputSections.classList.remove('hidden');
        }
    }

    // --- Display AI Response ---
    function displayResponse(text) {
        const sections = {
            Section: document.querySelector('.section-document-card:nth-child(1) .content-placeholder'),
            Document: document.querySelector('.section-document-card:nth-child(2) .content-placeholder'),
            "Contract Analysis": document.querySelector('.contract-analysis-card .upload-area'),
            "Risk Clause": document.querySelector('.risk-nonstandard-card:nth-child(1) .content-placeholder'),
            "Non-Standard": document.querySelector('.risk-nonstandard-card:nth-child(2) .content-placeholder'),
            Summary: document.querySelector('.summary-content-placeholder')
        };

        Object.keys(sections).forEach(key => {
            const regex = new RegExp(`${key}\\s*:\\s*([\\s\\S]*?)(?=\\n\\w+\\s*:)`, 'i');
            const match = text.match(regex);
            if (match) {
                sections[key].innerHTML = `<p>${match[1].trim().replace(/\n/g, "<br>")}</p>`;
            } else {
                sections[key].innerHTML = "<p>No data</p>";
            }
        });
    }

    // --- Handle Text Prompt ---
    if (sendButton && userInput) {
        sendButton.addEventListener('click', async () => {
            const prompt = userInput.value.trim();
            if (!prompt) return;

            showOutput();
            try {
                const res = await fetch("http://127.0.0.1:8000/ask/", {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams({ prompt })
                });
                const data = await res.json();
                displayResponse(data.response);
                userInput.value = "";
            } catch (err) {
                console.error("Prompt error:", err);
            }
        });
    }

    // --- Handle Contract Upload ---
    if (contractFileInput) {
        contractFileInput.addEventListener('change', async () => {
            if (!contractFileInput.files.length) return;

            showOutput();
            const formData = new FormData();
            formData.append("file", contractFileInput.files[0]);

            try {
                const res = await fetch("http://127.0.0.1:8000/upload/", {
                    method: "POST",
                    body: formData
                });
                const data = await res.json();
                displayResponse(data.response);
            } catch (err) {
                console.error("Upload error:", err);
            }
        });
    }
});
