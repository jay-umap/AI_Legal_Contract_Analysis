// script.js (VERIFIED FINAL CORRECTED VERSION for Bullet Points Display)

document.addEventListener('DOMContentLoaded', () => {
    // --- Get DOM Elements ---
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const outputSections = document.getElementById('outputSections');
    const selectFileBtn = document.getElementById('selectFileBtn');
    const contractFileInput = document.getElementById('contractFileInput');
    
    const selectedFileNameSpan = document.getElementById('selectedFileName');
    const plusButton = document.getElementById('plusButton');
    const generalFileInput = document.getElementById('generalFileInput');
    const mainInputFileDisplay = document.getElementById('mainInputFileDisplay');
    const greetingHeader = document.getElementById('greetingHeader');
    const chatHistory = document.getElementById('chatHistory'); // Get chat history container

    // Output cards and their content placeholders
    const sectionCardContent = document.querySelector('.section-document-card:nth-child(1) .content-placeholder');
    const documentCardContent = document.querySelector('.section-document-card:nth-child(2) .content-placeholder');
    const summaryCardContent = document.querySelector('.summary-card .summary-content-placeholder');
    const riskClauseCardContent = document.querySelector('.risk-nonstandard-card:nth-child(1) .content-placeholder');
    const nonStandardCardContent = document.querySelector('.risk-nonstandard-card:nth-child(2) .content-placeholder');

    // --- Debugging Logs for Element Availability ---
    console.log('userInput element:', userInput);
    console.log('sendButton element:', sendButton);
    console.log('outputSections element:', outputSections);
    console.log('selectFileBtn element:', selectFileBtn);
    console.log('contractFileInput element:', contractFileInput);
    console.log('selectedFileNameSpan element:', selectedFileNameSpan);
    console.log('plusButton element:', plusButton);
    console.log('generalFileInput element:', generalFileInput);
    console.log('mainInputFileDisplay element:', mainInputFileDisplay);
    console.log('greetingHeader element:', greetingHeader);
    console.log('chatHistory element:', chatHistory);
    console.log('sectionCardContent element:', sectionCardContent);
    console.log('documentCardContent element:', documentCardContent);
    console.log('summaryCardContent element:', summaryCardContent);
    console.log('riskClauseCardContent element:', riskClauseCardContent);
    console.log('nonStandardCardContent element:', nonStandardCardContent);


    // --- User Greeting on Main Page ---
    const userName = localStorage.getItem('loggedInUserName');
    if (greetingHeader && userName) {
        greetingHeader.textContent = `How can I assist you ?, ${userName}?`;
    } else if (greetingHeader) {
        greetingHeader.textContent = `How can I assist you ?`;
    }

    // --- Helper Functions ---
    function showOutput() {
        outputSections.classList.remove('hidden');
    }

    // script.js - Updated showLoading function
    function showLoading() {
        const spinnerHtml = `
            <div class="loading-spinner-container">
                <div class="spinner"></div>
                <p>Analyzing your document...</p>
            </div>
        `;
        sectionCardContent.innerHTML = spinnerHtml;
        documentCardContent.innerHTML = spinnerHtml;
        summaryCardContent.innerHTML = spinnerHtml;
        riskClauseCardContent.innerHTML = spinnerHtml;
        nonStandardCardContent.innerHTML = spinnerHtml;
    }
    //     function showLoading() {
    //     const loadingHtml = '<div class="line long"></div><div class="line medium"></div><div class="line short"></div>';
    //     sectionCardContent.innerHTML = loadingHtml;
    //     documentCardContent.innerHTML = loadingHtml;
    //     summaryCardContent.innerHTML = loadingHtml;
    //     riskClauseCardContent.innerHTML = loadingHtml;
    //     nonStandardCardContent.innerHTML = loadingHtml;
    // }
    // --- Refresh Page Button ---
    // This button will reload the current page when clicked
    const refreshPageBtn = document.getElementById('refreshPageBtn');

    if (refreshPageBtn) {
        refreshPageBtn.addEventListener('click', () => {
            window.location.reload(); // Reloads the current page
        });
    }

    // // UPDATED: displayParsedResponse to render bullet points
    // function displayParsedResponse(parsedSections) {
    //     sectionCardContent.innerHTML = '';
    //     documentCardContent.innerHTML = '';
    //     summaryCardContent.innerHTML = '';
    //     riskClauseCardContent.innerHTML = '';
    //     nonStandardCardContent.innerHTML = '';

    //     // Helper function to process text into HTML (handling bullet points and newlines)
    //     // This function will be applied to all sections where bullet points are expected
    //     const formatTextForDisplay = (text) => {
    //         if (!text || text.trim() === 'No data') return 'No data'; // Handle "No data" explicitly

    //         // Remove markdown bolding (**) first
    //         text = text.replace(/\*\*/g, ''); 

    //         // Detect if the text is a list. Common list markers are '-' or '*'.
    //         // Check if it contains newline followed by a list marker, or starts with a list marker.
    //         const isList = text.split('\n').some(line => line.trim().startsWith('- ') || line.trim().startsWith('* '));

    //         if (isList) {
    //             let items = text.split('\n').filter(item => item.trim() !== ''); // Split by newline, filter out empty lines
    //             let htmlList = '<ul>';
    //             items.forEach(item => {
    //                 // Remove markdown list prefixes (- or *) and trim
    //                 let cleanedItem = item.replace(/^[-\*]\s*/, '').trim(); 
    //                 if (cleanedItem) { // Only add if cleaned item is not empty
    //                     htmlList += `<li>${cleanedItem}</li>`;
    //                 }
    //             });
    //             htmlList += '</ul>';
    //             return htmlList;
    //         } else {
    //             // If not a list, just replace newlines with <br> for general paragraph formatting
    //             return text.replace(/\n/g, '<br>');
    //         }
    //     };

    //     sectionCardContent.innerHTML = `<p>${formatTextForDisplay(parsedSections.Section)}</p>`;
    //     documentCardContent.innerHTML = `<p>${formatTextForDisplay(parsedSections.Document)}</p>`; // Document is likely not bullet points
    //     summaryCardContent.innerHTML = `<p>${formatTextForDisplay(parsedSections.Summary)}</p>`;
    //     riskClauseCardContent.innerHTML = `<p>${formatTextForDisplay(parsedSections['Risk Clause'])}</p>`;
    //     nonStandardCardContent.innerHTML = `<p>${formatTextForDisplay(parsedSections['Non-Standard'])}</p>`;
    // }


    // script.js - Updated displayParsedResponse function
    function displayParsedResponse(parsedSections) {
        // Clear previous content
        sectionCardContent.innerHTML = '';
        documentCardContent.innerHTML = '';
        summaryCardContent.innerHTML = '';
        riskClauseCardContent.innerHTML = '';
        nonStandardCardContent.innerHTML = '';

        // Helper function to process text into HTML (handling bullet points and newlines)
        const formatTextForDisplay = (text) => {
            if (!text || text.trim() === 'No data') return '<p>No data</p>';

            // Remove markdown bolding (**)
            text = text.replace(/\*\*/g, '');

            // Detect if the text is a list. Common list markers are '-' or '*'.
            const isList = text.split('\n').some(line => line.trim().startsWith('- ') || line.trim().startsWith('* '));

            if (isList) {
                let items = text.split('\n').filter(item => item.trim() !== '');
                let htmlList = '<ul>';
                items.forEach(item => {
                    let cleanedItem = item.replace(/^[-\*]\s*/, '').trim();
                    if (cleanedItem) {
                        htmlList += `<li>${cleanedItem}</li>`;
                    }
                });
                htmlList += '</ul>';
                return htmlList;
            } else {
                return `<p>${text.replace(/\n/g, '<br>')}</p>`;
            }
        };

    // Populate content
    sectionCardContent.innerHTML = formatTextForDisplay(parsedSections.Section);
    documentCardContent.innerHTML = formatTextForDisplay(parsedSections.Document);
    summaryCardContent.innerHTML = formatTextForDisplay(parsedSections.Summary);
    riskClauseCardContent.innerHTML = formatTextForDisplay(parsedSections['Risk Clause']);
    nonStandardCardContent.innerHTML = formatTextForDisplay(parsedSections['Non-Standard']);
}

    function addChatMessage(message, sender) {
        if (!chatHistory) return;
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message');
        messageDiv.classList.add(sender);
        messageDiv.textContent = message;
        chatHistory.appendChild(messageDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }


    // --- Chatbot Functionality ---
    if (sendButton && userInput && chatHistory) {
        sendButton.addEventListener('click', async () => {
            console.log("Send button clicked!");
            const prompt = userInput.value.trim();
            if (!prompt) return;

            addChatMessage(prompt, 'user');
            userInput.value = "Thinking...";

            try {
                const res = await fetch("http://127.0.0.1:8000/ask/", {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams({ prompt })
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.detail || `Server error: ${res.status}`);
                }

                const data = await res.json();
                console.log("Chatbot response:", data.response);

                addChatMessage(data.response, 'ai');
                userInput.value = "";

            } catch (err) {
                console.error("Chatbot error:", err);
                addChatMessage(`Error: ${err.message}`, 'ai');
                userInput.value = prompt;
            }
        });

        userInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                sendButton.click();
            }
        });
    } else {
        console.error("Chat elements (input, send button, or chat history) not found!");
    }


    // --- Contract Upload and Analysis Functionality ---
    if (selectFileBtn && contractFileInput && selectedFileNameSpan && outputSections) {
        selectFileBtn.addEventListener('click', () => {
            contractFileInput.click();
        });

        contractFileInput.addEventListener('change', async () => {
            console.log("Contract file input changed!");

            if (!contractFileInput.files.length) {
                selectedFileNameSpan.textContent = '';
                return;
            }

            const file = contractFileInput.files[0];
            selectedFileNameSpan.textContent = file.name;

            showOutput(); // Make output sections visible
            showLoading(); // Show loading indicators in output sections

            // FIX: Removed the extra 'new' keyword. This was a critical typo.
            const formData = new FormData(); 
            formData.append("file", file);

            try {
                const res = await fetch("http://127.0.0.1:8000/upload/", {
                    method: "POST",
                    body: formData
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.detail || `Server error: ${res.status}`);
                }

                const data = await res.json();
                console.log("Full AI response from upload:", data);
                console.log("Data parsed_sections (after fetch):", data.parsed_sections);

                if (data.parsed_sections) {
                    displayParsedResponse(data.parsed_sections);
                } else {
                    summaryCardContent.innerHTML = `<p style="color: orange;">No structured data received. Raw response: ${data.response || 'N/A'}</p>`;
                    sectionCardContent.innerHTML = '<p>No data</p>';
                    documentCardContent.innerHTML = '<p>No data</p>';
                    riskClauseCardContent.innerHTML = '<p>No data</p>';
                    nonStandardCardContent.innerHTML = '<p>No data</p>';
                }

            } catch (err) {
                console.error("Upload and analysis error:", err);
                const errorMessage = `Error during analysis: ${err.message}. Please try again or upload a different file.`;
                summaryCardContent.innerHTML = `<p style="color: red;">${errorMessage}</p>`;
                sectionCardContent.innerHTML = '<p style="color: red;">Error</p>';
                documentCardContent.innerHTML = '<p style="color: red;">Error</p>';
                riskClauseCardContent.innerHTML = '<p style="color: red;">Error</p>';
                nonStandardCardContent.innerHTML = '<p style="color: red;">Error</p>';
            }
        });
    } else {
        console.error("Contract analysis elements not found!");
    }


    // --- General File Upload (for main input, not contract analysis) ---
    if (plusButton && generalFileInput && mainInputFileDisplay) {
        plusButton.addEventListener('click', () => {
            generalFileInput.click();
        });

        generalFileInput.addEventListener('change', () => {
            mainInputFileDisplay.innerHTML = '';
            Array.from(generalFileInput.files).forEach((file, i) => {
                const fileTag = document.createElement('div');
                fileTag.classList.add('file-tag');
                fileTag.innerHTML = `<span>${file.name}</span><i class="fas fa-times-circle" data-file-index="${i}"></i>`;
                mainInputFileDisplay.appendChild(fileTag);
            });
        });

        mainInputFileDisplay.addEventListener('click', (event) => {
            if (event.target.classList.contains('fa-times-circle')) {
                const tag = event.target.closest('.file-tag');
                if (tag) {
                    tag.remove();
                }
            }
        });
    } else {
        console.error("General file upload elements not found!");
    }
});