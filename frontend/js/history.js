document.addEventListener('DOMContentLoaded', async () => {
    const historyList = document.querySelector('.history-list');
    const searchInput = document.getElementById('search');

    async function fetchHistory() {
        try {
            const response = await fetch('http://127.0.0.1:8000/history/');
            if (!response.ok) {
                throw new Error('Failed to fetch history');
            }
            const data = await response.json();
            displayHistory(data.history);
        } catch (error) {
            console.error('Error fetching history:', error);
            historyList.innerHTML = '<p style="color: red; text-align: center;">Error loading history. Please try again.</p>';
        }
    }

    function displayHistory(historyEntries) {
        historyList.innerHTML = ''; // Clear existing entries
        if (historyEntries.length === 0) {
            historyList.innerHTML = '<p style="text-align: center; color: #b0b0b0;">No history entries yet. Upload a document to get started!</p>';
            return;
        }

        historyEntries.forEach((entry, index) => {
            const entryDiv = document.createElement('div');
            entryDiv.classList.add('history-entry');
            entryDiv.dataset.index = index; // Store index for delete/view actions

            const tagsHtml = entry.tags.map(tag => `<span class="tag">${tag}</span>`).join('');

            entryDiv.innerHTML = `
                <div class="entry-header">
                    <h3>${entry.title}</h3>
                    <span class="timestamp">${entry.timestamp}</span>
                </div>
                <div class="entry-tags">
                    ${tagsHtml}
                </div>
                <div class="entry-body">
                    <p><strong>AI Summary:</strong> ${entry.summary}</p>
                    <div class="entry-actions">
                        <button class="view-btn">📄 View</button>
                        <button class="ai-response-btn">🧠 AI Response</button>
                        <button class="download-btn">⬇️ Download</button>
                        <button class="delete-btn">🗑️ Delete</button>
                    </div>
                </div>
            `;
            historyList.appendChild(entryDiv);
        });
    }

    // --- Event Listeners for History Actions ---
    historyList.addEventListener('click', async (event) => {
        const button = event.target;
        const entryDiv = button.closest('.history-entry');
        if (!entryDiv) return;

        const index = parseInt(entryDiv.dataset.index);

        if (button.classList.contains('delete-btn')) {
            if (confirm('Are you sure you want to delete this history entry?')) {
                try {
                    const response = await fetch(`http://127.0.0.1:8000/history/${index}`, {
                        method: 'DELETE'
                    });
                    if (!response.ok) {
                        throw new Error('Failed to delete item');
                    }
                    alert('Item deleted successfully!');
                    fetchHistory(); // Refresh history list
                } catch (error) {
                    console.error('Error deleting history item:', error);
                    alert('Failed to delete item.');
                }
            }
        } else if (button.classList.contains('ai-response-btn')) {
            try {
                const response = await fetch(`http://127.0.0.1:8000/history/${index}/ai_response`);
                if (!response.ok) {
                    throw new Error('Failed to fetch AI response');
                }
                const data = await response.json();
                alert(`AI's Full Raw Response:\n\n${data.ai_response}`); // Display in alert for now
            } catch (error) {
                console.error('Error fetching AI response:', error);
                alert('Failed to retrieve AI response.');
            }
        }
        // TODO: Implement 'View' (open document in new tab? Requires backend support for serving docs)
        // TODO: Implement 'Download' (Requires backend support for serving docs)
    });

    // Basic Search Functionality (client-side)
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const entries = historyList.querySelectorAll('.history-entry');
        entries.forEach(entry => {
            const title = entry.querySelector('h3').textContent.toLowerCase();
            const summary = entry.querySelector('p').textContent.toLowerCase();
            const tags = Array.from(entry.querySelectorAll('.tag')).map(tag => tag.textContent.toLowerCase());
            const timestamp = entry.querySelector('.timestamp').textContent.toLowerCase();

            const isMatch = title.includes(searchTerm) || 
                            summary.includes(searchTerm) || 
                            tags.some(tag => tag.includes(searchTerm)) ||
                            timestamp.includes(searchTerm);
            
            entry.style.display = isMatch ? 'block' : 'none';
        });
    });

    // Initial fetch of history when the page loads
    fetchHistory();
});