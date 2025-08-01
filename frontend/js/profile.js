document.addEventListener('DOMContentLoaded', () => {
    const editButton = document.getElementById('editButton');
    const usernameInput = document.getElementById('username');

    // A state variable to track if we are in "edit mode"
    let isEditing = false;

    editButton.addEventListener('click', () => {
        isEditing = !isEditing; // Toggle the editing state

        if (isEditing) {
            // If we are now editing:
            usernameInput.removeAttribute('readonly'); // Remove readonly to allow editing
            editButton.textContent = 'Save'; // Change button text to "Save"
            usernameInput.focus(); // Automatically focus the input field
        } else {
            // If we are now saving:
            usernameInput.setAttribute('readonly', true); // Make the input readonly again
            editButton.textContent = 'Edit'; // Change button text back to "Edit"
        }
    });
});